export interface DeploymentConfig {
  environment: 'development' | 'staging' | 'production';
  region?: string;
  instanceType?: 'micro' | 'small' | 'medium' | 'large';
  autoScale?: boolean;
  minInstances?: number;
  maxInstances?: number;
  healthCheckPath?: string;
  environmentVariables?: Record<string, string>;
  customDomain?: string;
  sslEnabled?: boolean;
}

export interface CreateDeploymentRequest {
  workflowId: string;
  config: DeploymentConfig;
  version?: string;
  description?: string;
}

export interface UpdateDeploymentRequest {
  config?: Partial<DeploymentConfig>;
  status?: 'active' | 'inactive' | 'maintenance';
  description?: string;
}

export interface DeploymentResponse {
  id: string;
  workflowId: string;
  environment: string;
  status: string;
  mcpServerUrl: string | null;
  healthCheckUrl: string | null;
  config: DeploymentConfig;
  deployedAt: Date | null;
  lastHealthCheck: Date | null;
  healthStatus: string | null;
  workflowVersion: number;
  deploymentVersion: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeploymentStats {
  totalDeployments: number;
  activeDeployments: number;
  healthyDeployments: number;
  failedDeployments: number;
  totalRequests: number;
  averageResponseTime: number;
  uptime: number;
}

export interface DeploymentLog {
  id: string;
  deploymentId: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface DeploymentQueryParams {
  workflowId?: string;
  environment?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'deployedAt' | 'status' | 'environment';
  sortOrder?: 'asc' | 'desc';
}

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'unknown';
  responseTime: number;
  lastCheck: Date;
  details?: {
    mcpServer: boolean;
    database: boolean;
    dependencies: boolean;
    memoryUsage: number;
    cpuUsage: number;
  };
} 