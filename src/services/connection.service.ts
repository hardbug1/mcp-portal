import {
  CreateConnectionRequest,
  UpdateConnectionRequest,
  ConnectionValidationResult,
  ConnectionValidationError,
  ConnectionErrorType,
  ConnectionAnalysis,
  NodeConnectionInfo,
  ConnectionInfo,
  PortInfo
} from '../types/connection.js';
import { WorkflowDefinition, WorkflowConnection, WorkflowNode } from '../types/workflow.js';
import { WorkflowService } from './workflow.service.js';
import { NodeService } from './node.service.js';

export class ConnectionService {
  private workflowService = new WorkflowService();
  private nodeService = new NodeService();

  async createConnection(userId: string, data: CreateConnectionRequest): Promise<WorkflowConnection> {
    const { workflowId, sourceNodeId, targetNodeId, sourcePort, targetPort } = data;

    // 워크플로우 조회 및 권한 확인
    const workflow = await this.workflowService.findById(userId, workflowId);
    if (!workflow) {
      throw new Error('워크플로우를 찾을 수 없거나 접근 권한이 없습니다.');
    }

    // 연결 검증
    const validation = await this.validateConnection(workflow.workflow.definition, data);
    if (!validation.isValid) {
      throw new Error(`연결이 유효하지 않습니다: ${validation.errors[0]?.message}`);
    }

    // 연결 ID 생성
    const connectionId = this.generateConnectionId();

    // 새 연결 생성
    const newConnection: WorkflowConnection = {
      id: connectionId,
      sourceNodeId,
      targetNodeId,
      sourcePort,
      targetPort
    };

    // 워크플로우 정의 업데이트
    const updatedDefinition: WorkflowDefinition = {
      ...workflow.workflow.definition,
      connections: [...workflow.workflow.definition.connections, newConnection]
    };

    // 워크플로우 업데이트
    await this.workflowService.update(userId, workflowId, {
      definition: updatedDefinition
    });

    return newConnection;
  }

  async updateConnection(
    userId: string,
    workflowId: string,
    connectionId: string,
    data: UpdateConnectionRequest
  ): Promise<WorkflowConnection> {
    // 워크플로우 조회 및 권한 확인
    const workflow = await this.workflowService.findById(userId, workflowId);
    if (!workflow) {
      throw new Error('워크플로우를 찾을 수 없거나 접근 권한이 없습니다.');
    }

    // 연결 찾기
    const connectionIndex = workflow.workflow.definition.connections.findIndex(c => c.id === connectionId);
    if (connectionIndex === -1) {
      throw new Error('연결을 찾을 수 없습니다.');
    }

    const existingConnection = workflow.workflow.definition.connections[connectionIndex];

    // 연결 업데이트
    const updatedConnection: WorkflowConnection = {
      ...existingConnection,
      ...(data.sourcePort !== undefined && { sourcePort: data.sourcePort }),
      ...(data.targetPort !== undefined && { targetPort: data.targetPort })
    };

    // 업데이트된 연결 검증
    const validation = await this.validateConnection(workflow.workflow.definition, {
      workflowId,
      sourceNodeId: updatedConnection.sourceNodeId,
      targetNodeId: updatedConnection.targetNodeId,
      sourcePort: updatedConnection.sourcePort,
      targetPort: updatedConnection.targetPort
    });

    if (!validation.isValid) {
      throw new Error(`연결 업데이트가 유효하지 않습니다: ${validation.errors[0]?.message}`);
    }

    // 워크플로우 정의 업데이트
    const updatedDefinition: WorkflowDefinition = {
      ...workflow.workflow.definition,
      connections: workflow.workflow.definition.connections.map((connection, index) =>
        index === connectionIndex ? updatedConnection : connection
      )
    };

    // 워크플로우 업데이트
    await this.workflowService.update(userId, workflowId, {
      definition: updatedDefinition
    });

    return updatedConnection;
  }

  async deleteConnection(userId: string, workflowId: string, connectionId: string): Promise<void> {
    // 워크플로우 조회 및 권한 확인
    const workflow = await this.workflowService.findById(userId, workflowId);
    if (!workflow) {
      throw new Error('워크플로우를 찾을 수 없거나 접근 권한이 없습니다.');
    }

    // 연결 존재 확인
    const connectionExists = workflow.workflow.definition.connections.some(c => c.id === connectionId);
    if (!connectionExists) {
      throw new Error('연결을 찾을 수 없습니다.');
    }

    // 워크플로우 정의 업데이트
    const updatedDefinition: WorkflowDefinition = {
      ...workflow.workflow.definition,
      connections: workflow.workflow.definition.connections.filter(c => c.id !== connectionId)
    };

    // 워크플로우 업데이트
    await this.workflowService.update(userId, workflowId, {
      definition: updatedDefinition
    });
  }

  async getConnections(userId: string, workflowId: string): Promise<WorkflowConnection[]> {
    const workflow = await this.workflowService.findById(userId, workflowId);
    if (!workflow) {
      throw new Error('워크플로우를 찾을 수 없거나 접근 권한이 없습니다.');
    }

    return workflow.workflow.definition.connections;
  }

  async getConnection(userId: string, workflowId: string, connectionId: string): Promise<WorkflowConnection | null> {
    const connections = await this.getConnections(userId, workflowId);
    return connections.find(c => c.id === connectionId) || null;
  }

  async validateConnection(
    workflowDefinition: WorkflowDefinition,
    connectionData: CreateConnectionRequest
  ): Promise<ConnectionValidationResult> {
    const errors: ConnectionValidationError[] = [];
    const warnings: any[] = [];

    const { sourceNodeId, targetNodeId, sourcePort, targetPort } = connectionData;

    // 노드 존재 확인
    const sourceNode = workflowDefinition.nodes.find(n => n.id === sourceNodeId);
    const targetNode = workflowDefinition.nodes.find(n => n.id === targetNodeId);

    if (!sourceNode) {
      errors.push({
        type: 'NODE_NOT_FOUND' as ConnectionErrorType,
        message: `소스 노드 '${sourceNodeId}'를 찾을 수 없습니다.`,
        sourceNodeId
      });
    }

    if (!targetNode) {
      errors.push({
        type: 'NODE_NOT_FOUND' as ConnectionErrorType,
        message: `타겟 노드 '${targetNodeId}'를 찾을 수 없습니다.`,
        targetNodeId
      });
    }

    // 자기 자신과의 연결 확인
    if (sourceNodeId === targetNodeId) {
      errors.push({
        type: 'SELF_CONNECTION' as ConnectionErrorType,
        message: '노드는 자기 자신과 연결할 수 없습니다.',
        sourceNodeId,
        targetNodeId
      });
    }

    // 중복 연결 확인
    const existingConnection = workflowDefinition.connections.find(c =>
      c.sourceNodeId === sourceNodeId &&
      c.targetNodeId === targetNodeId &&
      c.sourcePort === sourcePort &&
      c.targetPort === targetPort
    );

    if (existingConnection) {
      errors.push({
        type: 'DUPLICATE_CONNECTION' as ConnectionErrorType,
        message: '이미 동일한 연결이 존재합니다.',
        sourceNodeId,
        targetNodeId,
        sourcePort,
        targetPort
      });
    }

    // 순환 참조 확인
    if (sourceNode && targetNode) {
      const wouldCreateCycle = this.wouldCreateCircularDependency(
        workflowDefinition,
        sourceNodeId,
        targetNodeId
      );

      if (wouldCreateCycle) {
        errors.push({
          type: 'CIRCULAR_DEPENDENCY' as ConnectionErrorType,
          message: '이 연결은 순환 참조를 생성합니다.',
          sourceNodeId,
          targetNodeId
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  async analyzeConnections(userId: string, workflowId: string): Promise<ConnectionAnalysis> {
    const workflow = await this.workflowService.findById(userId, workflowId);
    if (!workflow) {
      throw new Error('워크플로우를 찾을 수 없거나 접근 권한이 없습니다.');
    }

    const { nodes, connections } = workflow.workflow.definition;

    // 기본 통계
    const totalConnections = connections.length;
    let validConnections = 0;
    let invalidConnections = 0;
    let warnings = 0;

    // 각 연결 검증
    for (const connection of connections) {
      const validation = await this.validateConnection(workflow.workflow.definition, {
        workflowId,
        sourceNodeId: connection.sourceNodeId,
        targetNodeId: connection.targetNodeId,
        sourcePort: connection.sourcePort,
        targetPort: connection.targetPort
      });

      if (validation.isValid) {
        validConnections++;
      } else {
        invalidConnections++;
      }
      warnings += validation.warnings.length;
    }

    // 순환 참조 찾기
    const circularDependencies = this.findCircularDependencies(workflow.workflow.definition);

    // 고립된 노드 찾기
    const connectedNodeIds = new Set<string>();
    connections.forEach(conn => {
      connectedNodeIds.add(conn.sourceNodeId);
      connectedNodeIds.add(conn.targetNodeId);
    });

    const orphanedNodes = nodes
      .filter(node => !connectedNodeIds.has(node.id))
      .map(node => node.id);

    // 도달 불가능한 노드 찾기
    const unreachableNodes = this.findUnreachableNodes(workflow.workflow.definition);

    // 실행 순서 계산
    const executionOrder = this.calculateExecutionOrder(workflow.workflow.definition);

    return {
      totalConnections,
      validConnections,
      invalidConnections,
      warnings,
      circularDependencies,
      unreachableNodes,
      orphanedNodes,
      executionOrder
    };
  }

  async getNodeConnectionInfo(userId: string, workflowId: string, nodeId: string): Promise<NodeConnectionInfo> {
    const workflow = await this.workflowService.findById(userId, workflowId);
    if (!workflow) {
      throw new Error('워크플로우를 찾을 수 없거나 접근 권한이 없습니다.');
    }

    const node = workflow.workflow.definition.nodes.find(n => n.id === nodeId);
    if (!node) {
      throw new Error('노드를 찾을 수 없습니다.');
    }

    const { connections } = workflow.workflow.definition;

    // 들어오는 연결
    const incomingConnections: ConnectionInfo[] = connections
      .filter(c => c.targetNodeId === nodeId)
      .map(c => {
        const sourceNode = workflow.workflow.definition.nodes.find(n => n.id === c.sourceNodeId);
        return {
          connectionId: c.id,
          connectedNodeId: c.sourceNodeId,
          connectedNodeName: sourceNode?.name || 'Unknown',
          sourcePort: c.sourcePort,
          targetPort: c.targetPort,
          isValid: true // 실제로는 검증 필요
        };
      });

    // 나가는 연결
    const outgoingConnections: ConnectionInfo[] = connections
      .filter(c => c.sourceNodeId === nodeId)
      .map(c => {
        const targetNode = workflow.workflow.definition.nodes.find(n => n.id === c.targetNodeId);
        return {
          connectionId: c.id,
          connectedNodeId: c.targetNodeId,
          connectedNodeName: targetNode?.name || 'Unknown',
          sourcePort: c.sourcePort,
          targetPort: c.targetPort,
          isValid: true // 실제로는 검증 필요
        };
      });

    return {
      nodeId: node.id,
      nodeName: node.name,
      nodeType: node.type,
      incomingConnections,
      outgoingConnections,
      availableInputPorts: [], // 실제로는 노드 템플릿에서 가져와야 함
      availableOutputPorts: [] // 실제로는 노드 템플릿에서 가져와야 함
    };
  }

  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private wouldCreateCircularDependency(
    workflowDefinition: WorkflowDefinition,
    sourceNodeId: string,
    targetNodeId: string
  ): boolean {
    // 간단한 순환 참조 검사 (실제로는 더 복잡한 알고리즘 필요)
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (nodeId: string): boolean => {
      if (recursionStack.has(nodeId)) {
        return true;
      }
      if (visited.has(nodeId)) {
        return false;
      }

      visited.add(nodeId);
      recursionStack.add(nodeId);

      // 이 노드에서 나가는 모든 연결 확인
      const outgoingConnections = workflowDefinition.connections.filter(c => c.sourceNodeId === nodeId);
      for (const connection of outgoingConnections) {
        if (hasCycle(connection.targetNodeId)) {
          return true;
        }
      }

      // 새로운 연결 추가 시뮬레이션
      if (nodeId === sourceNodeId && hasCycle(targetNodeId)) {
        return true;
      }

      recursionStack.delete(nodeId);
      return false;
    };

    return hasCycle(targetNodeId);
  }

  private findCircularDependencies(workflowDefinition: WorkflowDefinition): any[] {
    // 실제 구현에서는 더 정교한 순환 참조 탐지 알고리즘 필요
    return [];
  }

  private findUnreachableNodes(workflowDefinition: WorkflowDefinition): string[] {
    // 실제 구현에서는 그래프 탐색을 통한 도달 가능성 분석 필요
    return [];
  }

  private calculateExecutionOrder(workflowDefinition: WorkflowDefinition): string[] {
    // 실제 구현에서는 위상 정렬(Topological Sort) 알고리즘 필요
    return workflowDefinition.nodes.map(n => n.id);
  }
} 