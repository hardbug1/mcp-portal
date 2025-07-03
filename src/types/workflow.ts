import { Workflow, User, Workspace } from '@prisma/client';

// 워크플로우 정의 스키마
export interface WorkflowDefinition {
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  metadata: {
    version: string;
    description?: string;
    tags?: string[];
  };
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  name: string;
  description?: string;
  config: Record<string, any>;
  position: { x: number; y: number };
}

export interface PortDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'any';
  description: string;
  required: boolean;
}

export interface WorkflowConnection {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourcePort?: string;
  targetPort?: string;
}

export type NodeType = 
  | 'trigger'     // 워크플로우 시작점
  | 'action'      // 실제 작업 수행
  | 'condition'   // 조건 분기
  | 'transform'   // 데이터 변환
  | 'integration' // 외부 서비스 연동
  | 'webhook'     // 웹훅 수신
  | 'schedule'    // 스케줄 트리거
  | 'manual';     // 수동 실행

// API 요청/응답 타입
export interface CreateWorkflowRequest {
  workspaceId: string;
  name: string;
  description?: string;
  tags?: string[];
  definition?: WorkflowDefinition;
}

export interface UpdateWorkflowRequest {
  name?: string;
  description?: string;
  tags?: string[];
  definition?: WorkflowDefinition;
  status?: WorkflowStatus;
}

export interface WorkflowResponse {
  workflow: Omit<Workflow, 'definition'> & {
    definition: WorkflowDefinition;
  };
  creator?: Omit<User, 'passwordHash'>;
  workspace?: Pick<Workspace, 'id' | 'name' | 'slug'>;
}

export interface WorkflowListResponse {
  workflows: WorkflowResponse[];
  total: number;
  page: number;
  limit: number;
}

export type WorkflowStatus = 'draft' | 'active' | 'paused' | 'archived';

export interface WorkflowQueryParams {
  workspaceId?: string;
  status?: WorkflowStatus;
  tags?: string[];
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'lastExecutedAt';
  sortOrder?: 'asc' | 'desc';
}

// 워크플로우 실행 관련
export interface ExecuteWorkflowRequest {
  inputData?: Record<string, any>;
  triggerType?: string;
}

export interface WorkflowExecutionResult {
  executionId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  outputData?: Record<string, any>;
  errorMessage?: string;
}

// 노드 템플릿
export interface NodeTemplate {
  type: NodeType;
  name: string;
  description: string;
  category: string;
  icon: string;
  configSchema: Record<string, any>;
  inputs: PortDefinition[];
  outputs: PortDefinition[];
}

export interface PortDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'any';
  description: string;
  required: boolean;
}

// 워크플로우 검증
export interface WorkflowValidationResult {
  isValid: boolean;
  errors: WorkflowValidationError[];
  warnings: WorkflowValidationWarning[];
}

export interface WorkflowValidationError {
  type: 'missing_connection' | 'invalid_config' | 'circular_dependency' | 'missing_trigger';
  nodeId?: string;
  connectionId?: string;
  message: string;
}

export interface WorkflowValidationWarning {
  type: 'unused_node' | 'deprecated_node' | 'performance_concern';
  nodeId?: string;
  message: string;
} 