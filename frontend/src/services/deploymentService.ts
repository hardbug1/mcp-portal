import apiService from './api';

export interface Deployment {
  id: string;
  workflowId: string;
  name: string;
  description?: string;
  status: DeploymentStatus;
  mcpUrl: string;
  environment: DeploymentEnvironment;
  config: DeploymentConfig;
  healthStatus: HealthStatus;
  stats: DeploymentStats;
  createdAt: string;
  updatedAt: string;
  lastDeployedAt?: string;
}

export type DeploymentStatus = 'creating' | 'deployed' | 'failed' | 'stopped' | 'updating';
export type DeploymentEnvironment = 'development' | 'staging' | 'production';
export type HealthStatus = 'healthy' | 'unhealthy' | 'unknown';

export interface DeploymentConfig {
  environment: DeploymentEnvironment;
  resources: {
    memory: string;
    cpu: string;
  };
  scaling: {
    minInstances: number;
    maxInstances: number;
  };
  networking: {
    port: number;
    ssl: boolean;
  };
  environment_variables?: Record<string, string>;
}

export interface DeploymentStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  uptime: number;
  lastRequestAt?: string;
}

export interface CreateDeploymentRequest {
  workflowId: string;
  name: string;
  description?: string;
  environment: DeploymentEnvironment;
  config?: Partial<DeploymentConfig>;
}

export interface UpdateDeploymentRequest {
  name?: string;
  description?: string;
  config?: Partial<DeploymentConfig>;
}

export interface HealthCheckResult {
  status: HealthStatus;
  message: string;
  checks: {
    server: boolean;
    database: boolean;
    dependencies: boolean;
  };
  responseTime: number;
  timestamp: string;
}

class DeploymentService {
  async getDeployments(): Promise<Deployment[]> {
    return apiService.get<Deployment[]>('/deployments');
  }

  async getDeployment(id: string): Promise<Deployment> {
    return apiService.get<Deployment>(`/deployments/${id}`);
  }

  async createDeployment(data: CreateDeploymentRequest): Promise<Deployment> {
    return apiService.post<Deployment>('/deployments', data);
  }

  async updateDeployment(id: string, data: UpdateDeploymentRequest): Promise<Deployment> {
    return apiService.put<Deployment>(`/deployments/${id}`, data);
  }

  async deleteDeployment(id: string): Promise<void> {
    return apiService.delete<void>(`/deployments/${id}`);
  }

  async redeployment(id: string): Promise<Deployment> {
    return apiService.post<Deployment>(`/deployments/${id}/redeploy`);
  }

  async stopDeployment(id: string): Promise<Deployment> {
    return apiService.post<Deployment>(`/deployments/${id}/stop`);
  }

  async startDeployment(id: string): Promise<Deployment> {
    return apiService.post<Deployment>(`/deployments/${id}/start`);
  }

  async getHealthCheck(id: string): Promise<HealthCheckResult> {
    return apiService.get<HealthCheckResult>(`/deployments/${id}/health`);
  }

  async getDeploymentStats(id: string): Promise<DeploymentStats> {
    return apiService.get<DeploymentStats>(`/deployments/${id}/stats`);
  }

  async getDeploymentLogs(id: string, limit?: number): Promise<any[]> {
    const params = limit ? `?limit=${limit}` : '';
    return apiService.get<any[]>(`/deployments/${id}/logs${params}`);
  }

  // 전체 배포 통계
  async getAllDeploymentStats(): Promise<{
    totalDeployments: number;
    activeDeployments: number;
    deploymentsByStatus: Record<DeploymentStatus, number>;
    deploymentsByEnvironment: Record<DeploymentEnvironment, number>;
    totalRequests: number;
    averageUptime: number;
  }> {
    return apiService.get('/deployments/stats');
  }
}

export const deploymentService = new DeploymentService();
export default deploymentService; 