// MCP (Model Context Protocol) 타입 정의

export interface MCPServer {
  id: string;
  name: string;
  description?: string;
  version: string;
  workflowId: string;
  status: MCPServerStatus;
  url: string;
  capabilities: MCPCapabilities;
  tools: MCPTool[];
  createdAt: Date;
  updatedAt: Date;
  lastHeartbeat?: Date;
}

export enum MCPServerStatus {
  CREATING = 'CREATING',
  RUNNING = 'RUNNING',
  STOPPED = 'STOPPED',
  ERROR = 'ERROR',
  UPDATING = 'UPDATING'
}

export interface MCPCapabilities {
  tools?: boolean;
  resources?: boolean;
  prompts?: boolean;
  logging?: boolean;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: MCPToolInputSchema;
}

export interface MCPToolInputSchema {
  type: 'object';
  properties: Record<string, MCPSchemaProperty>;
  required?: string[];
}

export interface MCPSchemaProperty {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description?: string;
  enum?: any[];
  items?: MCPSchemaProperty;
  properties?: Record<string, MCPSchemaProperty>;
}

// MCP 메시지 타입
export interface MCPMessage {
  jsonrpc: '2.0';
  id?: string | number;
  method?: string;
  params?: any;
  result?: any;
  error?: MCPError;
}

export interface MCPError {
  code: number;
  message: string;
  data?: any;
}

export interface MCPRequest extends MCPMessage {
  method: string;
  params?: any;
}

export interface MCPResponse extends MCPMessage {
  result?: any;
  error?: MCPError;
}

// MCP 초기화
export interface MCPInitializeRequest {
  protocolVersion: string;
  capabilities: MCPCapabilities;
  clientInfo: {
    name: string;
    version: string;
  };
}

export interface MCPInitializeResponse {
  protocolVersion: string;
  capabilities: MCPCapabilities;
  serverInfo: {
    name: string;
    version: string;
  };
}

// 도구 관련
export interface MCPListToolsRequest {
  // 빈 객체
}

export interface MCPListToolsResponse {
  tools: MCPTool[];
}

export interface MCPCallToolRequest {
  name: string;
  arguments?: Record<string, any>;
}

export interface MCPCallToolResponse {
  content: MCPContent[];
  isError?: boolean;
}

export interface MCPContent {
  type: 'text' | 'image' | 'resource';
  text?: string;
  data?: string;
  mimeType?: string;
}

// 서버 생성 요청
export interface CreateMCPServerRequest {
  name: string;
  description?: string;
  workflowId: string;
  capabilities?: MCPCapabilities;
}

export interface UpdateMCPServerRequest {
  name?: string;
  description?: string;
  capabilities?: MCPCapabilities;
}

export interface MCPServerListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: MCPServerStatus;
  workspaceId?: string;
  sortBy?: 'name' | 'status' | 'createdAt' | 'lastHeartbeat';
  sortOrder?: 'asc' | 'desc';
}

export interface MCPServerListResponse {
  servers: MCPServer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 워크플로우 실행 관련
export interface WorkflowExecution {
  id: string;
  workflowId: string;
  mcpServerId?: string;
  status: ExecutionStatus;
  startedAt: Date;
  completedAt?: Date;
  input?: any;
  output?: any;
  error?: string;
  logs: ExecutionLog[];
}

export enum ExecutionStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export interface ExecutionLog {
  id: string;
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  nodeId?: string;
  metadata?: Record<string, any>;
}

export interface StartExecutionRequest {
  workflowId: string;
  input?: any;
  mcpServerId?: string;
}

export interface ExecutionResult {
  executionId: string;
  status: ExecutionStatus;
  output?: any;
  error?: string;
  duration?: number;
}

// 실시간 업데이트
export interface WebSocketMessage {
  type: 'execution_update' | 'server_status' | 'heartbeat';
  data: any;
}

export interface ExecutionUpdateMessage {
  type: 'execution_update';
  data: {
    executionId: string;
    status: ExecutionStatus;
    progress?: number;
    currentNode?: string;
    logs?: ExecutionLog[];
  };
}

export interface ServerStatusMessage {
  type: 'server_status';
  data: {
    serverId: string;
    status: MCPServerStatus;
    lastHeartbeat: Date;
  };
}

// MCP 서버 통계
export interface MCPServerStats {
  totalServers: number;
  runningServers: number;
  serversByStatus: Record<MCPServerStatus, number>;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
}

// 도구 실행 컨텍스트
export interface ToolExecutionContext {
  executionId: string;
  nodeId: string;
  workflowId: string;
  userId: string;
  credentials: Record<string, any>;
  variables: Record<string, any>;
}

// 워크플로우를 MCP 도구로 변환
export interface WorkflowToMCPTransformation {
  workflow: any; // WorkflowDefinition
  tools: MCPTool[];
  serverConfig: {
    name: string;
    description: string;
    capabilities: MCPCapabilities;
  };
} 