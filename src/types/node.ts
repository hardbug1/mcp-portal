import { NodeType, WorkflowNode, PortDefinition } from './workflow.js';

// 노드 템플릿 정의
export interface NodeTemplate {
  id: string;
  type: NodeType;
  name: string;
  description: string;
  category: NodeCategory;
  icon: string;
  version: string;
  configSchema: NodeConfigSchema;
  inputs: PortDefinition[];
  outputs: PortDefinition[];
  documentation?: string;
  examples?: NodeExample[];
  deprecated?: boolean;
  tags?: string[];
}

export type NodeCategory = 
  | 'triggers'      // 트리거 노드들
  | 'actions'       // 액션 노드들
  | 'conditions'    // 조건 분기 노드들
  | 'transforms'    // 데이터 변환 노드들
  | 'integrations'  // 외부 서비스 연동
  | 'utilities'     // 유틸리티 노드들
  | 'custom';       // 사용자 정의 노드들

// 노드 설정 스키마
export interface NodeConfigSchema {
  type: 'object';
  properties: Record<string, NodeConfigProperty>;
  required?: string[];
  additionalProperties?: boolean;
}

export interface NodeConfigProperty {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  title?: string;
  description?: string;
  default?: any;
  enum?: any[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
  items?: NodeConfigProperty;
  properties?: Record<string, NodeConfigProperty>;
  required?: string[];
  examples?: any[];
  secret?: boolean; // 민감한 정보 여부
}

// 노드 예제
export interface NodeExample {
  title: string;
  description: string;
  config: Record<string, any>;
  inputData?: Record<string, any>;
  outputData?: Record<string, any>;
}

// API 요청/응답 타입
export interface NodeTemplateListResponse {
  templates: NodeTemplate[];
  categories: NodeCategoryInfo[];
  total: number;
}

export interface NodeCategoryInfo {
  category: NodeCategory;
  name: string;
  description: string;
  count: number;
  icon?: string;
}

export interface NodeTemplateQueryParams {
  category?: NodeCategory;
  type?: NodeType;
  search?: string;
  tags?: string[];
  includeDeprecated?: boolean;
  page?: number;
  limit?: number;
}

// 노드 인스턴스 관련
export interface CreateNodeRequest {
  workflowId: string;
  templateId: string;
  name?: string;
  position: { x: number; y: number };
  config?: Record<string, any>;
}

export interface UpdateNodeRequest {
  name?: string;
  position?: { x: number; y: number };
  config?: Record<string, any>;
}

export interface NodeInstance extends WorkflowNode {
  templateId: string;
  workflowId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NodeValidationResult {
  isValid: boolean;
  errors: NodeValidationError[];
  warnings: NodeValidationWarning[];
}

export interface NodeValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface NodeValidationWarning {
  field: string;
  message: string;
  value?: any;
}

// 노드 실행 관련
export interface NodeExecutionContext {
  nodeId: string;
  workflowId: string;
  executionId: string;
  inputData: Record<string, any>;
  config: Record<string, any>;
  credentials?: Record<string, any>;
  metadata: {
    userId: string;
    workspaceId: string;
    timestamp: Date;
  };
}

export interface NodeExecutionResult {
  success: boolean;
  outputData?: Record<string, any>;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  logs?: NodeExecutionLog[];
  metrics?: {
    duration: number;
    memoryUsage?: number;
    apiCalls?: number;
  };
}

export interface NodeExecutionLog {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// 내장 노드 템플릿들
export const BUILT_IN_NODE_TEMPLATES: NodeTemplate[] = [
  // 트리거 노드들
  {
    id: 'manual-trigger',
    type: 'manual',
    name: '수동 트리거',
    description: '워크플로우를 수동으로 시작합니다',
    category: 'triggers',
    icon: 'play-circle',
    version: '1.0.0',
    configSchema: {
      type: 'object',
      properties: {
        inputSchema: {
          type: 'object',
          title: '입력 스키마',
          description: '수동 실행 시 입력받을 데이터 스키마',
          default: {}
        }
      }
    },
    inputs: [],
    outputs: [
      {
        name: 'output',
        type: 'object',
        description: '트리거 출력 데이터',
        required: true
      }
    ]
  },
  {
    id: 'webhook-trigger',
    type: 'webhook',
    name: '웹훅 트리거',
    description: 'HTTP 웹훅을 통해 워크플로우를 시작합니다',
    category: 'triggers',
    icon: 'webhook',
    version: '1.0.0',
    configSchema: {
      type: 'object',
      properties: {
        method: {
          type: 'string',
          title: 'HTTP 메서드',
          enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
          default: 'POST'
        },
        authentication: {
          type: 'string',
          title: '인증 방식',
          enum: ['none', 'api-key', 'bearer-token'],
          default: 'none'
        }
      },
      required: ['method']
    },
    inputs: [],
    outputs: [
      {
        name: 'body',
        type: 'object',
        description: '요청 본문',
        required: true
      },
      {
        name: 'headers',
        type: 'object',
        description: '요청 헤더',
        required: true
      },
      {
        name: 'query',
        type: 'object',
        description: '쿼리 파라미터',
        required: true
      }
    ]
  },
  
  // 액션 노드들
  {
    id: 'http-request',
    type: 'action',
    name: 'HTTP 요청',
    description: 'HTTP API 호출을 수행합니다',
    category: 'actions',
    icon: 'globe',
    version: '1.0.0',
    configSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          title: 'URL',
          description: '요청할 URL',
          format: 'uri'
        },
        method: {
          type: 'string',
          title: 'HTTP 메서드',
          enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
          default: 'GET'
        },
        headers: {
          type: 'object',
          title: '헤더',
          description: '요청 헤더',
          default: {}
        },
        timeout: {
          type: 'number',
          title: '타임아웃 (초)',
          minimum: 1,
          maximum: 300,
          default: 30
        }
      },
      required: ['url', 'method']
    },
    inputs: [
      {
        name: 'body',
        type: 'object',
        description: '요청 본문',
        required: false
      }
    ],
    outputs: [
      {
        name: 'response',
        type: 'object',
        description: '응답 데이터',
        required: true
      },
      {
        name: 'status',
        type: 'number',
        description: 'HTTP 상태 코드',
        required: true
      },
      {
        name: 'headers',
        type: 'object',
        description: '응답 헤더',
        required: true
      }
    ]
  },
  
  // 조건 노드들
  {
    id: 'if-condition',
    type: 'condition',
    name: '조건 분기',
    description: '조건에 따라 실행 경로를 분기합니다',
    category: 'conditions',
    icon: 'git-branch',
    version: '1.0.0',
    configSchema: {
      type: 'object',
      properties: {
        condition: {
          type: 'string',
          title: '조건식',
          description: 'JavaScript 조건식 (예: data.status === "success")'
        }
      },
      required: ['condition']
    },
    inputs: [
      {
        name: 'data',
        type: 'any',
        description: '조건 검사할 데이터',
        required: true
      }
    ],
    outputs: [
      {
        name: 'true',
        type: 'any',
        description: '조건이 참일 때 출력',
        required: false
      },
      {
        name: 'false',
        type: 'any',
        description: '조건이 거짓일 때 출력',
        required: false
      }
    ]
  },
  
  // 변환 노드들
  {
    id: 'data-transform',
    type: 'transform',
    name: '데이터 변환',
    description: 'JavaScript를 사용해 데이터를 변환합니다',
    category: 'transforms',
    icon: 'code',
    version: '1.0.0',
    configSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          title: '변환 코드',
          description: 'JavaScript 코드 (return 문으로 결과 반환)'
        }
      },
      required: ['code']
    },
    inputs: [
      {
        name: 'input',
        type: 'any',
        description: '변환할 입력 데이터',
        required: true
      }
    ],
    outputs: [
      {
        name: 'output',
        type: 'any',
        description: '변환된 출력 데이터',
        required: true
      }
    ]
  }
]; 