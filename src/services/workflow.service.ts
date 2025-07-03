import { Workflow, User, Workspace } from '@prisma/client';
import { prisma } from '../config/database.js';
import {
  CreateWorkflowRequest,
  UpdateWorkflowRequest,
  WorkflowResponse,
  WorkflowListResponse,
  WorkflowQueryParams,
  WorkflowDefinition,
  WorkflowValidationResult,
  WorkflowValidationError,
  WorkflowValidationWarning,
  ExecuteWorkflowRequest,
  WorkflowExecutionResult
} from '../types/workflow.js';

export class WorkflowService {
  async create(userId: string, data: CreateWorkflowRequest): Promise<WorkflowResponse> {
    const { workspaceId, name, description, tags, definition } = data;

    // 워크스페이스 접근 권한 확인
    await this.checkWorkspaceAccess(userId, workspaceId);

    // 기본 워크플로우 정의 생성
    const defaultDefinition: WorkflowDefinition = definition || {
      nodes: [],
      connections: [],
      metadata: {
        version: '1.0.0',
        description: description,
        tags: tags || [],
      },
    };

    // 워크플로우 생성
    const workflow = await prisma.workflow.create({
      data: {
        workspaceId,
        name,
        description,
        tags: tags || [],
        definition: defaultDefinition as any,
        status: 'draft',
        createdBy: userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return this.formatWorkflowResponse(workflow);
  }

  async findById(userId: string, workflowId: string): Promise<WorkflowResponse | null> {
    const workflow = await prisma.workflow.findFirst({
      where: {
        id: workflowId,
        workspace: {
          workspaceUsers: {
            some: {
              userId: userId,
            },
          },
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return workflow ? this.formatWorkflowResponse(workflow) : null;
  }

  async findAll(userId: string, params: WorkflowQueryParams): Promise<WorkflowListResponse> {
    const {
      workspaceId,
      status,
      tags,
      search,
      page = 1,
      limit = 20,
      sortBy = 'updatedAt',
      sortOrder = 'desc',
    } = params;

    const skip = (page - 1) * limit;

    // 검색 조건 구성
    const where: any = {
      workspace: {
        workspaceUsers: {
          some: {
            userId: userId,
          },
        },
      },
    };

    if (workspaceId) {
      where.workspaceId = workspaceId;
    }

    if (status) {
      where.status = status;
    }

    if (tags && tags.length > 0) {
      where.tags = {
        hasSome: tags,
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // 정렬 옵션
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [workflows, total] = await Promise.all([
      prisma.workflow.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
          workspace: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.workflow.count({ where }),
    ]);

    return {
      workflows: workflows.map(workflow => this.formatWorkflowResponse(workflow)),
      total,
      page,
      limit,
    };
  }

  async update(userId: string, workflowId: string, data: UpdateWorkflowRequest): Promise<WorkflowResponse> {
    // 워크플로우 존재 및 권한 확인
    const existingWorkflow = await this.findById(userId, workflowId);
    if (!existingWorkflow) {
      throw new Error('워크플로우를 찾을 수 없거나 접근 권한이 없습니다.');
    }

    // 정의가 업데이트되는 경우 검증
    if (data.definition) {
      const validation = await this.validateWorkflowDefinition(data.definition);
      if (!validation.isValid) {
        throw new Error(`워크플로우 정의가 유효하지 않습니다: ${validation.errors[0]?.message}`);
      }
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.definition !== undefined) updateData.definition = data.definition;
    if (data.status !== undefined) updateData.status = data.status;

    const workflow = await prisma.workflow.update({
      where: { id: workflowId },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return this.formatWorkflowResponse(workflow);
  }

  async delete(userId: string, workflowId: string): Promise<void> {
    // 워크플로우 존재 및 권한 확인
    const existingWorkflow = await this.findById(userId, workflowId);
    if (!existingWorkflow) {
      throw new Error('워크플로우를 찾을 수 없거나 접근 권한이 없습니다.');
    }

    await prisma.workflow.delete({
      where: { id: workflowId },
    });
  }

  async duplicate(userId: string, workflowId: string, name?: string): Promise<WorkflowResponse> {
    const originalWorkflow = await this.findById(userId, workflowId);
    if (!originalWorkflow) {
      throw new Error('워크플로우를 찾을 수 없거나 접근 권한이 없습니다.');
    }

    const duplicateData: CreateWorkflowRequest = {
      workspaceId: originalWorkflow.workflow.workspaceId,
      name: name || `${originalWorkflow.workflow.name} (복사본)`,
      description: originalWorkflow.workflow.description || undefined,
      tags: originalWorkflow.workflow.tags,
      definition: originalWorkflow.workflow.definition,
    };

    return this.create(userId, duplicateData);
  }

  async execute(userId: string, workflowId: string, data: ExecuteWorkflowRequest): Promise<WorkflowExecutionResult> {
    const workflow = await this.findById(userId, workflowId);
    if (!workflow) {
      throw new Error('워크플로우를 찾을 수 없거나 접근 권한이 없습니다.');
    }

    if (workflow.workflow.status !== 'active') {
      throw new Error('활성화된 워크플로우만 실행할 수 있습니다.');
    }

    // 워크플로우 정의 검증
    const validation = await this.validateWorkflowDefinition(workflow.workflow.definition);
    if (!validation.isValid) {
      throw new Error(`워크플로우가 유효하지 않습니다: ${validation.errors[0]?.message}`);
    }

    // 실행 레코드 생성
    const execution = await prisma.execution.create({
      data: {
        workflowId,
        status: 'pending',
        triggerType: data.triggerType || 'manual',
        triggerData: data.triggerType ? { type: data.triggerType } : undefined,
        inputData: data.inputData || undefined,
        startedAt: new Date(),
      },
    });

    // TODO: 실제 워크플로우 실행 엔진 구현
    // 현재는 시뮬레이션된 결과 반환
    setTimeout(async () => {
      await prisma.execution.update({
        where: { id: execution.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
          outputData: { result: 'success', message: '워크플로우가 성공적으로 실행되었습니다.' },
          durationMs: 1000,
        },
      });
    }, 1000);

    return {
      executionId: execution.id,
      status: 'pending',
      startedAt: execution.startedAt!,
    };
  }

  async validateWorkflowDefinition(definition: WorkflowDefinition): Promise<WorkflowValidationResult> {
    const errors: WorkflowValidationError[] = [];
    const warnings: WorkflowValidationWarning[] = [];

    // 트리거 노드 확인
    const triggerNodes = definition.nodes.filter(node => 
      ['trigger', 'webhook', 'schedule', 'manual'].includes(node.type)
    );

    if (triggerNodes.length === 0) {
      errors.push({
        type: 'missing_trigger',
        message: '워크플로우에는 최소 하나의 트리거 노드가 필요합니다.',
      });
    }

    // 순환 참조 확인
    if (this.hasCircularDependency(definition)) {
      errors.push({
        type: 'circular_dependency',
        message: '워크플로우에 순환 참조가 있습니다.',
      });
    }

    // 연결되지 않은 노드 확인
    const connectedNodeIds = new Set<string>();
    definition.connections.forEach(conn => {
      connectedNodeIds.add(conn.sourceNodeId);
      connectedNodeIds.add(conn.targetNodeId);
    });

    definition.nodes.forEach(node => {
      if (!connectedNodeIds.has(node.id) && node.type !== 'trigger') {
        warnings.push({
          type: 'unused_node',
          nodeId: node.id,
          message: `노드 '${node.name}'이 연결되지 않았습니다.`,
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private async checkWorkspaceAccess(userId: string, workspaceId: string): Promise<void> {
    const workspaceUser = await prisma.workspaceUser.findFirst({
      where: {
        userId,
        workspaceId,
      },
    });

    if (!workspaceUser) {
      throw new Error('워크스페이스에 접근 권한이 없습니다.');
    }
  }

  private formatWorkflowResponse(workflow: any): WorkflowResponse {
    return {
      workflow: {
        ...workflow,
        definition: workflow.definition as WorkflowDefinition,
      },
      creator: workflow.creator,
      workspace: workflow.workspace,
    };
  }

  private hasCircularDependency(definition: WorkflowDefinition): boolean {
    const graph = new Map<string, string[]>();
    
    // 그래프 구성
    definition.nodes.forEach(node => {
      graph.set(node.id, []);
    });

    definition.connections.forEach(conn => {
      const targets = graph.get(conn.sourceNodeId) || [];
      targets.push(conn.targetNodeId);
      graph.set(conn.sourceNodeId, targets);
    });

    // DFS로 순환 참조 확인
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (nodeId: string): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const neighbors = graph.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasCycle(neighbor)) {
            return true;
          }
        } else if (recursionStack.has(neighbor)) {
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const nodeId of graph.keys()) {
      if (!visited.has(nodeId)) {
        if (hasCycle(nodeId)) {
          return true;
        }
      }
    }

    return false;
  }
} 