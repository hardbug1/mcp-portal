import { PrismaClient } from '@prisma/client';
import { prisma } from '../config/database.js';
import {
  MCPServer,
  MCPServerStatus,
  CreateMCPServerRequest,
  UpdateMCPServerRequest,
  MCPServerListQuery,
  MCPServerListResponse,
  MCPTool,
  MCPCapabilities,
  WorkflowToMCPTransformation,
  MCPServerStats,
  MCPRequest,
  MCPResponse,
  MCPInitializeRequest,
  MCPInitializeResponse,
  MCPListToolsResponse,
  MCPCallToolRequest,
  MCPCallToolResponse,
  MCPContent
} from '../types/mcp.js';
import { WorkflowDefinition } from '../types/workflow.js';

export class MCPService {
  private prisma: PrismaClient;
  private servers: Map<string, MCPServerInstance> = new Map();

  constructor() {
    this.prisma = prisma;
  }

  // === MCP 서버 관리 ===

  async createMCPServer(userId: string, data: CreateMCPServerRequest): Promise<MCPServer> {
    // 워크플로우 존재 확인
    const workflow = await this.prisma.workflow.findFirst({
      where: {
        id: data.workflowId,
        createdById: userId
      }
    });

    if (!workflow) {
      throw new Error('워크플로우를 찾을 수 없습니다.');
    }

    // 워크플로우를 MCP 도구로 변환
    const transformation = await this.transformWorkflowToMCP(workflow);

    // MCP 서버 생성
    const mcpServer = await this.prisma.deployment.create({
      data: {
        name: data.name,
        description: data.description,
        workflowId: data.workflowId,
        status: 'CREATING',
        url: `${process.env.BASE_URL || 'http://localhost:3000'}/mcp/${data.workflowId}`,
        version: '1.0.0',
        config: {
          capabilities: data.capabilities || { tools: true },
          tools: transformation.tools
        }
      }
    });

    // 서버 인스턴스 시작
    await this.startServerInstance(mcpServer.id);

    return this.mapToMCPServer(mcpServer);
  }

  async getMCPServers(userId: string, query: MCPServerListQuery): Promise<MCPServerListResponse> {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      workspaceId,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = query;

    const skip = (page - 1) * limit;
    
    const where: any = {
      workflow: {
        createdById: userId
      }
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status) {
      where.status = status;
    }

    if (workspaceId) {
      where.workflow = {
        ...where.workflow,
        workspaceId
      };
    }

    const [servers, total] = await Promise.all([
      this.prisma.deployment.findMany({
        where,
        include: {
          workflow: true
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit
      }),
      this.prisma.deployment.count({ where })
    ]);

    return {
      servers: servers.map(s => this.mapToMCPServer(s)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getMCPServerById(userId: string, serverId: string): Promise<MCPServer | null> {
    const server = await this.prisma.deployment.findFirst({
      where: {
        id: serverId,
        workflow: {
          createdById: userId
        }
      },
      include: {
        workflow: true
      }
    });

    if (!server) return null;

    return this.mapToMCPServer(server);
  }

  async updateMCPServer(
    userId: string, 
    serverId: string, 
    data: UpdateMCPServerRequest
  ): Promise<MCPServer> {
    const existingServer = await this.prisma.deployment.findFirst({
      where: {
        id: serverId,
        workflow: {
          createdById: userId
        }
      }
    });

    if (!existingServer) {
      throw new Error('MCP 서버를 찾을 수 없습니다.');
    }

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.capabilities) {
      updateData.config = {
        ...existingServer.config,
        capabilities: data.capabilities
      };
    }

    const updatedServer = await this.prisma.deployment.update({
      where: { id: serverId },
      data: updateData,
      include: {
        workflow: true
      }
    });

    // 서버 재시작 (설정 변경 반영)
    await this.restartServerInstance(serverId);

    return this.mapToMCPServer(updatedServer);
  }

  async deleteMCPServer(userId: string, serverId: string): Promise<void> {
    const server = await this.prisma.deployment.findFirst({
      where: {
        id: serverId,
        workflow: {
          createdById: userId
        }
      }
    });

    if (!server) {
      throw new Error('MCP 서버를 찾을 수 없습니다.');
    }

    // 서버 인스턴스 중지
    await this.stopServerInstance(serverId);

    // 데이터베이스에서 삭제
    await this.prisma.deployment.delete({
      where: { id: serverId }
    });
  }

  async getMCPServerStats(userId: string): Promise<MCPServerStats> {
    const where = {
      workflow: {
        createdById: userId
      }
    };

    const [
      totalServers,
      runningServers,
      serversByStatus,
      executions
    ] = await Promise.all([
      this.prisma.deployment.count({ where }),
      this.prisma.deployment.count({
        where: { ...where, status: 'RUNNING' }
      }),
      this.prisma.deployment.groupBy({
        by: ['status'],
        where,
        _count: true
      }),
      this.prisma.execution.aggregate({
        where: {
          workflow: {
            createdById: userId
          }
        },
        _count: true,
        _avg: {
          duration: true
        }
      })
    ]);

    const statusStats = serversByStatus.reduce((acc, item) => {
      acc[item.status as MCPServerStatus] = item._count;
      return acc;
    }, {} as Record<MCPServerStatus, number>);

    return {
      totalServers,
      runningServers,
      serversByStatus: statusStats,
      totalExecutions: executions._count || 0,
      successfulExecutions: 0, // 실제 구현에서는 성공한 실행 수 계산
      failedExecutions: 0, // 실제 구현에서는 실패한 실행 수 계산
      averageExecutionTime: executions._avg.duration || 0
    };
  }

  // === MCP 프로토콜 핸들러 ===

  async handleMCPRequest(serverId: string, request: MCPRequest): Promise<MCPResponse> {
    try {
      const server = this.servers.get(serverId);
      if (!server) {
        return {
          jsonrpc: '2.0',
          id: request.id,
          error: {
            code: -32000,
            message: 'Server not found'
          }
        };
      }

      switch (request.method) {
        case 'initialize':
          return await this.handleInitialize(server, request);
        
        case 'tools/list':
          return await this.handleListTools(server, request);
        
        case 'tools/call':
          return await this.handleCallTool(server, request);
        
        default:
          return {
            jsonrpc: '2.0',
            id: request.id,
            error: {
              code: -32601,
              message: 'Method not found'
            }
          };
      }
    } catch (error) {
      console.error('MCP 요청 처리 오류:', error);
      return {
        jsonrpc: '2.0',
        id: request.id,
        error: {
          code: -32603,
          message: 'Internal error',
          data: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  private async handleInitialize(
    server: MCPServerInstance, 
    request: MCPRequest
  ): Promise<MCPResponse> {
    const params = request.params as MCPInitializeRequest;
    
    const response: MCPInitializeResponse = {
      protocolVersion: '2024-11-05',
      capabilities: server.capabilities,
      serverInfo: {
        name: server.name,
        version: server.version
      }
    };

    return {
      jsonrpc: '2.0',
      id: request.id,
      result: response
    };
  }

  private async handleListTools(
    server: MCPServerInstance, 
    request: MCPRequest
  ): Promise<MCPResponse> {
    const response: MCPListToolsResponse = {
      tools: server.tools
    };

    return {
      jsonrpc: '2.0',
      id: request.id,
      result: response
    };
  }

  private async handleCallTool(
    server: MCPServerInstance, 
    request: MCPRequest
  ): Promise<MCPResponse> {
    const params = request.params as MCPCallToolRequest;
    
    try {
      // 워크플로우 실행
      const result = await this.executeWorkflowTool(server, params);
      
      const response: MCPCallToolResponse = {
        content: result
      };

      return {
        jsonrpc: '2.0',
        id: request.id,
        result: response
      };
    } catch (error) {
      const response: MCPCallToolResponse = {
        content: [{
          type: 'text',
          text: `Error executing tool: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        isError: true
      };

      return {
        jsonrpc: '2.0',
        id: request.id,
        result: response
      };
    }
  }

  // === 워크플로우 변환 및 실행 ===

  private async transformWorkflowToMCP(workflow: any): Promise<WorkflowToMCPTransformation> {
    const workflowDef = workflow.definition as WorkflowDefinition;
    
    // 워크플로우를 MCP 도구로 변환
    const tools: MCPTool[] = [{
      name: `execute_${workflow.name.toLowerCase().replace(/\s+/g, '_')}`,
      description: workflow.description || `Execute ${workflow.name} workflow`,
      inputSchema: {
        type: 'object',
        properties: this.extractInputSchema(workflowDef),
        required: this.extractRequiredInputs(workflowDef)
      }
    }];

    return {
      workflow: workflowDef,
      tools,
      serverConfig: {
        name: workflow.name,
        description: workflow.description || '',
        capabilities: { tools: true }
      }
    };
  }

  private extractInputSchema(workflow: WorkflowDefinition): Record<string, any> {
    // 워크플로우의 트리거 노드에서 입력 스키마 추출
    const triggerNodes = workflow.nodes.filter(node => node.type === 'trigger');
    const schema: Record<string, any> = {};

    triggerNodes.forEach(node => {
      if (node.config?.inputSchema) {
        Object.assign(schema, node.config.inputSchema);
      }
    });

    return schema;
  }

  private extractRequiredInputs(workflow: WorkflowDefinition): string[] {
    // 필수 입력 필드 추출
    return [];
  }

  private async executeWorkflowTool(
    server: MCPServerInstance, 
    params: MCPCallToolRequest
  ): Promise<MCPContent[]> {
    // 실제 워크플로우 실행 로직
    // 여기서는 기본 응답 반환
    return [{
      type: 'text',
      text: `Tool ${params.name} executed successfully with arguments: ${JSON.stringify(params.arguments)}`
    }];
  }

  // === 서버 인스턴스 관리 ===

  private async startServerInstance(serverId: string): Promise<void> {
    const serverData = await this.prisma.deployment.findUnique({
      where: { id: serverId },
      include: { workflow: true }
    });

    if (!serverData) {
      throw new Error('서버 데이터를 찾을 수 없습니다.');
    }

    const instance = new MCPServerInstance(
      serverId,
      serverData.name,
      serverData.version,
      serverData.config?.capabilities || { tools: true },
      serverData.config?.tools || []
    );

    this.servers.set(serverId, instance);

    // 상태 업데이트
    await this.prisma.deployment.update({
      where: { id: serverId },
      data: { status: 'RUNNING' }
    });
  }

  private async stopServerInstance(serverId: string): Promise<void> {
    this.servers.delete(serverId);

    await this.prisma.deployment.update({
      where: { id: serverId },
      data: { status: 'STOPPED' }
    });
  }

  private async restartServerInstance(serverId: string): Promise<void> {
    await this.stopServerInstance(serverId);
    await this.startServerInstance(serverId);
  }

  private mapToMCPServer(deployment: any): MCPServer {
    return {
      id: deployment.id,
      name: deployment.name,
      description: deployment.description,
      version: deployment.version,
      workflowId: deployment.workflowId,
      status: deployment.status as MCPServerStatus,
      url: deployment.url,
      capabilities: deployment.config?.capabilities || { tools: true },
      tools: deployment.config?.tools || [],
      createdAt: deployment.createdAt,
      updatedAt: deployment.updatedAt,
      lastHeartbeat: deployment.lastHeartbeat
    };
  }
}

// MCP 서버 인스턴스 클래스
class MCPServerInstance {
  constructor(
    public id: string,
    public name: string,
    public version: string,
    public capabilities: MCPCapabilities,
    public tools: MCPTool[]
  ) {}
} 