import { PrismaClient } from '@prisma/client';
import { 
  CreateDeploymentRequest, 
  UpdateDeploymentRequest, 
  DeploymentResponse, 
  DeploymentStats, 
  DeploymentQueryParams,
  HealthCheckResult,
  DeploymentConfig
} from '../types/deployment';
import { MCPService } from './mcp.service';
import { WorkflowService } from './workflow.service';

const prisma = new PrismaClient();
const mcpService = new MCPService();
const workflowService = new WorkflowService();

export class DeploymentService {
  
  async createDeployment(userId: string, data: CreateDeploymentRequest): Promise<DeploymentResponse> {
    // 워크플로우 존재 및 권한 확인
    const workflow = await workflowService.findById(userId, data.workflowId);
    if (!workflow) {
      throw new Error('워크플로우를 찾을 수 없습니다.');
    }

    // 워크플로우 검증
    const validation = await workflowService.validateWorkflowDefinition(workflow.workflow.definition);
    if (!validation.isValid) {
      throw new Error(`워크플로우가 유효하지 않습니다: ${validation.errors.join(', ')}`);
    }

    // 배포 버전 생성
    const deploymentVersion = this.generateDeploymentVersion(data.config.environment);

    // MCP 서버 URL 생성
    const mcpServerUrl = this.generateMCPServerUrl(data.workflowId, data.config.environment, deploymentVersion);
    const healthCheckUrl = `${mcpServerUrl}/health`;

    try {
      // 데이터베이스에 배포 정보 저장
      const deployment = await prisma.deployment.create({
        data: {
          workflowId: data.workflowId,
          environment: data.config.environment,
          status: 'pending',
          config: data.config as any,
          mcpServerUrl,
          healthCheckUrl,
          workflowVersion: workflow.workflow.version,
          deploymentVersion,
          createdBy: userId,
        },
      });

      // MCP 서버 인스턴스 생성
      await this.deployMCPServer(deployment.id, workflow.workflow, data.config);

      // 배포 상태 업데이트
      const updatedDeployment = await prisma.deployment.update({
        where: { id: deployment.id },
        data: {
          status: 'deployed',
          deployedAt: new Date(),
        },
      });

      return this.mapToDeploymentResponse(updatedDeployment);
    } catch (error) {
      console.error('배포 실패:', error);
      throw new Error(`배포에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  async getDeployments(userId: string, params: DeploymentQueryParams): Promise<{
    deployments: DeploymentResponse[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 20, 100);
    const skip = (page - 1) * limit;

    // 사용자가 접근 가능한 워크플로우 ID 조회
    const userWorkflows = await prisma.workflow.findMany({
      where: { createdBy: userId },
      select: { id: true },
    });

    const workflowIds = userWorkflows.map(w => w.id);

    const where: any = {
      workflowId: { in: workflowIds },
    };

    if (params.workflowId) where.workflowId = params.workflowId;
    if (params.environment) where.environment = params.environment;
    if (params.status) where.status = params.status;

    const [deployments, total] = await Promise.all([
      prisma.deployment.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [params.sortBy || 'createdAt']: params.sortOrder || 'desc',
        },
      }),
      prisma.deployment.count({ where }),
    ]);

    return {
      deployments: deployments.map(this.mapToDeploymentResponse),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getDeploymentById(userId: string, deploymentId: string): Promise<DeploymentResponse | null> {
    const deployment = await prisma.deployment.findFirst({
      where: {
        id: deploymentId,
        workflow: {
          createdBy: userId,
        },
      },
    });

    return deployment ? this.mapToDeploymentResponse(deployment) : null;
  }

  async updateDeployment(userId: string, deploymentId: string, data: UpdateDeploymentRequest): Promise<DeploymentResponse> {
    const deployment = await this.getDeploymentById(userId, deploymentId);
    if (!deployment) {
      throw new Error('배포를 찾을 수 없습니다.');
    }

    const updateData: any = {};

    if (data.config) {
      updateData.config = { ...deployment.config, ...data.config };
    }

    if (data.status) {
      updateData.status = data.status;
    }

    const updatedDeployment = await prisma.deployment.update({
      where: { id: deploymentId },
      data: updateData,
    });

    return this.mapToDeploymentResponse(updatedDeployment);
  }

  async deleteDeployment(userId: string, deploymentId: string): Promise<void> {
    const deployment = await this.getDeploymentById(userId, deploymentId);
    if (!deployment) {
      throw new Error('배포를 찾을 수 없습니다.');
    }

    try {
      // MCP 서버 인스턴스 중지
      await this.stopMCPServer(deploymentId);

      // 데이터베이스에서 배포 정보 삭제
      await prisma.deployment.delete({
        where: { id: deploymentId },
      });
    } catch (error) {
      console.error('배포 삭제 실패:', error);
      throw new Error(`배포 삭제에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  async redeployment(userId: string, deploymentId: string): Promise<DeploymentResponse> {
    const deployment = await this.getDeploymentById(userId, deploymentId);
    if (!deployment) {
      throw new Error('배포를 찾을 수 없습니다.');
    }

    const workflow = await workflowService.findById(userId, deployment.workflowId);
    if (!workflow) {
      throw new Error('워크플로우를 찾을 수 없습니다.');
    }

    try {
      // 기존 MCP 서버 중지
      await this.stopMCPServer(deploymentId);

      // 새 배포 버전 생성
      const newDeploymentVersion = this.generateDeploymentVersion(deployment.config.environment);
      const newMcpServerUrl = this.generateMCPServerUrl(deployment.workflowId, deployment.config.environment, newDeploymentVersion);

      // 배포 상태 업데이트
      await prisma.deployment.update({
        where: { id: deploymentId },
        data: {
          status: 'deploying',
          deploymentVersion: newDeploymentVersion,
          mcpServerUrl: newMcpServerUrl,
          workflowVersion: workflow.workflow.version,
        },
      });

      // 새 MCP 서버 배포
      await this.deployMCPServer(deploymentId, workflow.workflow, deployment.config);

      // 배포 완료 상태 업데이트
      const updatedDeployment = await prisma.deployment.update({
        where: { id: deploymentId },
        data: {
          status: 'deployed',
          deployedAt: new Date(),
        },
      });

      return this.mapToDeploymentResponse(updatedDeployment);
    } catch (error) {
      // 배포 실패 시 상태 업데이트
      await prisma.deployment.update({
        where: { id: deploymentId },
        data: { status: 'failed' },
      });

      console.error('재배포 실패:', error);
      throw new Error(`재배포에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  async getDeploymentStats(userId: string, deploymentId?: string): Promise<DeploymentStats> {
    const where: any = {
      workflow: {
        createdBy: userId,
      },
    };

    if (deploymentId) {
      where.id = deploymentId;
    }

    const [
      totalDeployments,
      activeDeployments,
      healthyDeployments,
      failedDeployments,
    ] = await Promise.all([
      prisma.deployment.count({ where }),
      prisma.deployment.count({ where: { ...where, status: 'deployed' } }),
      prisma.deployment.count({ where: { ...where, healthStatus: 'healthy' } }),
      prisma.deployment.count({ where: { ...where, status: 'failed' } }),
    ]);

    return {
      totalDeployments,
      activeDeployments,
      healthyDeployments,
      failedDeployments,
      totalRequests: 0, // TODO: 실제 메트릭 수집 구현
      averageResponseTime: 0, // TODO: 실제 메트릭 수집 구현
      uptime: 0, // TODO: 실제 메트릭 수집 구현
    };
  }

  async checkHealth(userId: string, deploymentId: string): Promise<HealthCheckResult> {
    const deployment = await this.getDeploymentById(userId, deploymentId);
    if (!deployment) {
      throw new Error('배포를 찾을 수 없습니다.');
    }

    if (!deployment.healthCheckUrl) {
      return {
        status: 'unknown',
        responseTime: 0,
        lastCheck: new Date(),
      };
    }

    try {
      const startTime = Date.now();
      
      // 실제 헬스 체크 요청 (현재는 시뮬레이션)
      const healthStatus = await this.performHealthCheck(deployment.healthCheckUrl);
      
      const responseTime = Date.now() - startTime;

      // 데이터베이스에 헬스 체크 결과 저장
      await prisma.deployment.update({
        where: { id: deploymentId },
        data: {
          lastHealthCheck: new Date(),
          healthStatus: healthStatus.status,
        },
      });

      return {
        ...healthStatus,
        responseTime,
        lastCheck: new Date(),
      };
    } catch (error) {
      console.error('헬스 체크 실패:', error);
      
      await prisma.deployment.update({
        where: { id: deploymentId },
        data: {
          lastHealthCheck: new Date(),
          healthStatus: 'unhealthy',
        },
      });

      return {
        status: 'unhealthy',
        responseTime: 0,
        lastCheck: new Date(),
      };
    }
  }

  private async deployMCPServer(deploymentId: string, workflow: any, config: DeploymentConfig): Promise<void> {
    // 실제 MCP 서버 배포 로직 구현
    // 현재는 시뮬레이션
    console.log(`Deploying MCP server for deployment ${deploymentId}`);
    
    // MCP 서버 인스턴스 생성
    await mcpService.createServerInstance(workflow.id, workflow.definition);
    
    // 환경 변수 설정
    if (config.environmentVariables) {
      // 환경 변수 설정 로직
    }
    
    // 헬스 체크 설정
    if (config.healthCheckPath) {
      // 헬스 체크 경로 설정
    }
    
    // 오토 스케일링 설정
    if (config.autoScale) {
      // 오토 스케일링 설정 로직
    }
  }

  private async stopMCPServer(deploymentId: string): Promise<void> {
    // 실제 MCP 서버 중지 로직 구현
    console.log(`Stopping MCP server for deployment ${deploymentId}`);
  }

  private async performHealthCheck(healthCheckUrl: string): Promise<Omit<HealthCheckResult, 'responseTime' | 'lastCheck'>> {
    // 실제 헬스 체크 로직 구현
    // 현재는 시뮬레이션
    return {
      status: 'healthy',
      details: {
        mcpServer: true,
        database: true,
        dependencies: true,
        memoryUsage: 50,
        cpuUsage: 30,
      },
    };
  }

  private generateDeploymentVersion(environment: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${environment}-${timestamp}`;
  }

  private generateMCPServerUrl(workflowId: string, environment: string, version: string): string {
    const baseUrl = process.env.MCP_SERVER_BASE_URL || 'https://mcp.example.com';
    return `${baseUrl}/${environment}/${workflowId}/${version}`;
  }

  private mapToDeploymentResponse(deployment: any): DeploymentResponse {
    return {
      id: deployment.id,
      workflowId: deployment.workflowId,
      environment: deployment.environment,
      status: deployment.status,
      mcpServerUrl: deployment.mcpServerUrl,
      healthCheckUrl: deployment.healthCheckUrl,
      config: deployment.config,
      deployedAt: deployment.deployedAt,
      lastHealthCheck: deployment.lastHealthCheck,
      healthStatus: deployment.healthStatus,
      workflowVersion: deployment.workflowVersion,
      deploymentVersion: deployment.deploymentVersion,
      createdBy: deployment.createdBy,
      createdAt: deployment.createdAt,
      updatedAt: deployment.updatedAt,
    };
  }
} 