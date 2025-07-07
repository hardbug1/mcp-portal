export interface Workflow {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  definition: WorkflowDefinition;
  workspaceId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowDefinition {
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  version: string;
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  name?: string;
  position: { x: number; y: number };
  data?: Record<string, any>;
  config?: Record<string, any>;
  status?: 'idle' | 'running' | 'success' | 'error';
  inputs?: PortDefinition[];
  outputs?: PortDefinition[];
}

export interface WorkflowConnection {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface PortDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'any';
  required?: boolean;
  description?: string;
}

export type NodeType = 
  | 'trigger.manual'
  | 'trigger.webhook'
  | 'trigger.schedule'
  | 'action.http'
  | 'action.email'
  | 'action.database'
  | 'logic.condition'
  | 'logic.switch'
  | 'transform.data'
  | 'transform.code';

export interface NodeTemplate {
  type: NodeType;
  name: string;
  description: string;
  category: NodeCategory;
  icon: string;
  color: string;
  inputs: PortDefinition[];
  outputs: PortDefinition[];
  configSchema: Record<string, any>;
}

export type NodeCategory = 'triggers' | 'actions' | 'logic' | 'transform'; 