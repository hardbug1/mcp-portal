import { WorkflowConnection, WorkflowNode } from './workflow.js';

// 연결 생성 요청
export interface CreateConnectionRequest {
  workflowId: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourcePort?: string;
  targetPort?: string;
}

// 연결 업데이트 요청
export interface UpdateConnectionRequest {
  sourcePort?: string;
  targetPort?: string;
}

// 연결 검증 결과
export interface ConnectionValidationResult {
  isValid: boolean;
  errors: ConnectionValidationError[];
  warnings: ConnectionValidationWarning[];
}

export interface ConnectionValidationError {
  type: ConnectionErrorType;
  message: string;
  sourceNodeId?: string;
  targetNodeId?: string;
  sourcePort?: string;
  targetPort?: string;
}

export interface ConnectionValidationWarning {
  type: ConnectionWarningType;
  message: string;
  sourceNodeId?: string;
  targetNodeId?: string;
}

export type ConnectionErrorType =
  | 'NODE_NOT_FOUND'           // 노드를 찾을 수 없음
  | 'PORT_NOT_FOUND'           // 포트를 찾을 수 없음
  | 'INCOMPATIBLE_TYPES'       // 호환되지 않는 데이터 타입
  | 'CIRCULAR_DEPENDENCY'      // 순환 참조
  | 'DUPLICATE_CONNECTION'     // 중복 연결
  | 'INVALID_CONNECTION'       // 유효하지 않은 연결
  | 'MAX_CONNECTIONS_EXCEEDED' // 최대 연결 수 초과
  | 'SELF_CONNECTION';         // 자기 자신과의 연결

export type ConnectionWarningType =
  | 'TYPE_MISMATCH'           // 타입 불일치 (변환 가능)
  | 'PERFORMANCE_IMPACT'      // 성능에 영향을 줄 수 있음
  | 'DEPRECATED_PORT';        // 사용 중단된 포트

// 연결 분석 결과
export interface ConnectionAnalysis {
  totalConnections: number;
  validConnections: number;
  invalidConnections: number;
  warnings: number;
  circularDependencies: CircularDependency[];
  unreachableNodes: string[];
  orphanedNodes: string[];
  executionOrder: string[];
}

export interface CircularDependency {
  nodes: string[];
  path: string[];
}

// 연결 경로 정보
export interface ConnectionPath {
  sourceNode: WorkflowNode;
  targetNode: WorkflowNode;
  connection: WorkflowConnection;
  dataType?: string;
  isValid: boolean;
  errors?: ConnectionValidationError[];
}

// 노드 연결 정보
export interface NodeConnectionInfo {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  incomingConnections: ConnectionInfo[];
  outgoingConnections: ConnectionInfo[];
  availableInputPorts: PortInfo[];
  availableOutputPorts: PortInfo[];
}

export interface ConnectionInfo {
  connectionId: string;
  connectedNodeId: string;
  connectedNodeName: string;
  sourcePort?: string;
  targetPort?: string;
  dataType?: string;
  isValid: boolean;
}

export interface PortInfo {
  name: string;
  type: string;
  description: string;
  required: boolean;
  connected: boolean;
  connectionId?: string;
}

// 연결 실행 컨텍스트
export interface ConnectionExecutionContext {
  workflowId: string;
  executionId: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourcePort?: string;
  targetPort?: string;
  data: any;
  metadata: {
    timestamp: Date;
    executionPath: string[];
  };
}

// 연결 실행 결과
export interface ConnectionExecutionResult {
  success: boolean;
  transformedData?: any;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metrics?: {
    duration: number;
    dataSize?: number;
  };
}

// 연결 통계
export interface ConnectionStatistics {
  workflowId: string;
  totalConnections: number;
  activeConnections: number;
  errorConnections: number;
  averageExecutionTime: number;
  dataTransferVolume: number;
  lastUpdated: Date;
}

// 연결 자동 생성 옵션
export interface AutoConnectionOptions {
  workflowId: string;
  sourceNodeId: string;
  targetNodeId: string;
  strategy: AutoConnectionStrategy;
  allowTypeConversion?: boolean;
  preferredPorts?: {
    source?: string;
    target?: string;
  };
}

export type AutoConnectionStrategy =
  | 'EXACT_MATCH'      // 정확한 타입 매칭
  | 'COMPATIBLE_MATCH' // 호환 가능한 타입 매칭
  | 'SMART_MATCH'      // AI 기반 스마트 매칭
  | 'FORCE_CONNECT';   // 강제 연결 (타입 무시)

// 연결 템플릿
export interface ConnectionTemplate {
  id: string;
  name: string;
  description: string;
  sourceNodeType: string;
  targetNodeType: string;
  defaultMapping: {
    sourcePort: string;
    targetPort: string;
  }[];
  transformFunction?: string; // JavaScript 변환 함수
  category: ConnectionTemplateCategory;
}

export type ConnectionTemplateCategory =
  | 'DATA_FLOW'        // 데이터 흐름
  | 'CONTROL_FLOW'     // 제어 흐름
  | 'ERROR_HANDLING'   // 에러 처리
  | 'TRANSFORMATION'   // 데이터 변환
  | 'INTEGRATION';     // 서비스 통합

// 연결 히스토리
export interface ConnectionHistory {
  id: string;
  workflowId: string;
  connectionId: string;
  action: ConnectionHistoryAction;
  details: {
    before?: Partial<WorkflowConnection>;
    after?: Partial<WorkflowConnection>;
  };
  userId: string;
  timestamp: Date;
  reason?: string;
}

export type ConnectionHistoryAction =
  | 'CREATED'
  | 'UPDATED'
  | 'DELETED'
  | 'VALIDATED'
  | 'EXECUTED';

// 연결 제안
export interface ConnectionSuggestion {
  sourceNodeId: string;
  targetNodeId: string;
  sourcePort?: string;
  targetPort?: string;
  confidence: number; // 0-1 사이의 신뢰도
  reason: string;
  category: SuggestionCategory;
  transformRequired: boolean;
  transformFunction?: string;
}

export type SuggestionCategory =
  | 'COMMON_PATTERN'    // 일반적인 패턴
  | 'TYPE_COMPATIBLE'   // 타입 호환성
  | 'SEMANTIC_MATCH'    // 의미적 매칭
  | 'USER_HISTORY'      // 사용자 이력 기반
  | 'TEMPLATE_BASED';   // 템플릿 기반

// 연결 최적화 제안
export interface ConnectionOptimization {
  workflowId: string;
  suggestions: OptimizationSuggestion[];
  estimatedImprovement: {
    performance: number; // 성능 개선 예상치 (%)
    maintainability: number; // 유지보수성 개선 예상치 (%)
    reliability: number; // 안정성 개선 예상치 (%)
  };
}

export interface OptimizationSuggestion {
  type: OptimizationType;
  description: string;
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
  effort: 'LOW' | 'MEDIUM' | 'HIGH';
  connections: string[]; // 영향받는 연결 ID들
  action: {
    type: 'ADD' | 'REMOVE' | 'MODIFY' | 'REPLACE';
    details: any;
  };
}

export type OptimizationType =
  | 'REMOVE_REDUNDANT'     // 중복 연결 제거
  | 'OPTIMIZE_PATH'        // 경로 최적화
  | 'REDUCE_COMPLEXITY'    // 복잡도 감소
  | 'IMPROVE_PARALLEL'     // 병렬 처리 개선
  | 'CACHE_OPTIMIZATION'   // 캐시 최적화
  | 'ERROR_HANDLING';      // 에러 처리 개선 