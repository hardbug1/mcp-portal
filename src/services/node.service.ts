import {
  NodeTemplate,
  NodeTemplateListResponse,
  NodeTemplateQueryParams,
  NodeCategoryInfo,
  NodeCategory,
  BUILT_IN_NODE_TEMPLATES,
  CreateNodeRequest,
  UpdateNodeRequest,
  NodeInstance,
  NodeValidationResult,
  NodeValidationError,
  NodeValidationWarning,
  NodeConfigSchema,
  NodeConfigProperty
} from '../types/node.js';
import { WorkflowDefinition, WorkflowNode } from '../types/workflow.js';
import { WorkflowService } from './workflow.service.js';

export class NodeService {
  private workflowService = new WorkflowService();

  async getNodeTemplates(params: NodeTemplateQueryParams): Promise<NodeTemplateListResponse> {
    const {
      category,
      type,
      search,
      tags,
      includeDeprecated = false,
      page = 1,
      limit = 50
    } = params;

    let templates = [...BUILT_IN_NODE_TEMPLATES];

    // 필터링
    if (category) {
      templates = templates.filter(t => t.category === category);
    }

    if (type) {
      templates = templates.filter(t => t.type === type);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      templates = templates.filter(t => 
        t.name.toLowerCase().includes(searchLower) ||
        t.description.toLowerCase().includes(searchLower) ||
        t.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    if (tags && tags.length > 0) {
      templates = templates.filter(t => 
        t.tags?.some(tag => tags.includes(tag))
      );
    }

    if (!includeDeprecated) {
      templates = templates.filter(t => !t.deprecated);
    }

    // 페이지네이션
    const startIndex = (page - 1) * limit;
    const paginatedTemplates = templates.slice(startIndex, startIndex + limit);

    // 카테고리 정보 생성
    const categories = this.generateCategoryInfo(BUILT_IN_NODE_TEMPLATES);

    return {
      templates: paginatedTemplates,
      categories,
      total: templates.length
    };
  }

  async getNodeTemplate(templateId: string): Promise<NodeTemplate | null> {
    return BUILT_IN_NODE_TEMPLATES.find(t => t.id === templateId) || null;
  }

  async createNodeInWorkflow(userId: string, data: CreateNodeRequest): Promise<WorkflowNode> {
    const { workflowId, templateId, name, position, config } = data;

    // 워크플로우 조회 및 권한 확인
    const workflow = await this.workflowService.findById(userId, workflowId);
    if (!workflow) {
      throw new Error('워크플로우를 찾을 수 없거나 접근 권한이 없습니다.');
    }

    // 노드 템플릿 조회
    const template = await this.getNodeTemplate(templateId);
    if (!template) {
      throw new Error('노드 템플릿을 찾을 수 없습니다.');
    }

    // 노드 ID 생성
    const nodeId = this.generateNodeId();

    // 새 노드 생성
    const newNode: WorkflowNode = {
      id: nodeId,
      type: template.type,
      name: name || template.name,
      description: template.description,
      config: config || this.getDefaultConfig(template.configSchema),
      position
    };

    // 노드 설정 검증
    const validation = this.validateNodeConfig(newNode.config, template.configSchema);
    if (!validation.isValid) {
      throw new Error(`노드 설정이 유효하지 않습니다: ${validation.errors[0]?.message}`);
    }

    // 워크플로우 정의 업데이트
    const updatedDefinition: WorkflowDefinition = {
      ...workflow.workflow.definition,
      nodes: [...workflow.workflow.definition.nodes, newNode]
    };

    // 워크플로우 업데이트
    await this.workflowService.update(userId, workflowId, {
      definition: updatedDefinition
    });

    return newNode;
  }

  async updateNodeInWorkflow(
    userId: string, 
    workflowId: string, 
    nodeId: string, 
    data: UpdateNodeRequest
  ): Promise<WorkflowNode> {
    // 워크플로우 조회 및 권한 확인
    const workflow = await this.workflowService.findById(userId, workflowId);
    if (!workflow) {
      throw new Error('워크플로우를 찾을 수 없거나 접근 권한이 없습니다.');
    }

    // 노드 찾기
    const nodeIndex = workflow.workflow.definition.nodes.findIndex(n => n.id === nodeId);
    if (nodeIndex === -1) {
      throw new Error('노드를 찾을 수 없습니다.');
    }

    const existingNode = workflow.workflow.definition.nodes[nodeIndex];

    // 노드 템플릿 조회 (설정 검증용)
    const templateId = this.getTemplateIdFromNode(existingNode);
    const template = await this.getNodeTemplate(templateId);

    // 노드 업데이트
    const updatedNode: WorkflowNode = {
      ...existingNode,
      ...(data.name && { name: data.name }),
      ...(data.position && { position: data.position }),
      ...(data.config && { config: data.config })
    };

    // 설정이 변경된 경우 검증
    if (data.config && template) {
      const validation = this.validateNodeConfig(updatedNode.config, template.configSchema);
      if (!validation.isValid) {
        throw new Error(`노드 설정이 유효하지 않습니다: ${validation.errors[0]?.message}`);
      }
    }

    // 워크플로우 정의 업데이트
    const updatedDefinition: WorkflowDefinition = {
      ...workflow.workflow.definition,
      nodes: workflow.workflow.definition.nodes.map((node, index) => 
        index === nodeIndex ? updatedNode : node
      )
    };

    // 워크플로우 업데이트
    await this.workflowService.update(userId, workflowId, {
      definition: updatedDefinition
    });

    return updatedNode;
  }

  async deleteNodeFromWorkflow(userId: string, workflowId: string, nodeId: string): Promise<void> {
    // 워크플로우 조회 및 권한 확인
    const workflow = await this.workflowService.findById(userId, workflowId);
    if (!workflow) {
      throw new Error('워크플로우를 찾을 수 없거나 접근 권한이 없습니다.');
    }

    // 노드 존재 확인
    const nodeExists = workflow.workflow.definition.nodes.some(n => n.id === nodeId);
    if (!nodeExists) {
      throw new Error('노드를 찾을 수 없습니다.');
    }

    // 노드와 관련된 연결들도 제거
    const updatedDefinition: WorkflowDefinition = {
      ...workflow.workflow.definition,
      nodes: workflow.workflow.definition.nodes.filter(n => n.id !== nodeId),
      connections: workflow.workflow.definition.connections.filter(c => 
        c.sourceNodeId !== nodeId && c.targetNodeId !== nodeId
      )
    };

    // 워크플로우 업데이트
    await this.workflowService.update(userId, workflowId, {
      definition: updatedDefinition
    });
  }

  async getNodesInWorkflow(userId: string, workflowId: string): Promise<WorkflowNode[]> {
    const workflow = await this.workflowService.findById(userId, workflowId);
    if (!workflow) {
      throw new Error('워크플로우를 찾을 수 없거나 접근 권한이 없습니다.');
    }

    return workflow.workflow.definition.nodes;
  }

  async getNodeInWorkflow(userId: string, workflowId: string, nodeId: string): Promise<WorkflowNode | null> {
    const nodes = await this.getNodesInWorkflow(userId, workflowId);
    return nodes.find(n => n.id === nodeId) || null;
  }

  validateNodeConfig(config: Record<string, any>, schema: NodeConfigSchema): NodeValidationResult {
    const errors: NodeValidationError[] = [];
    const warnings: NodeValidationWarning[] = [];

    // 필수 필드 확인
    if (schema.required) {
      for (const requiredField of schema.required) {
        if (!(requiredField in config) || config[requiredField] === undefined || config[requiredField] === null) {
          errors.push({
            field: requiredField,
            message: `필수 필드 '${requiredField}'가 누락되었습니다.`,
            value: config[requiredField]
          });
        }
      }
    }

    // 각 속성 검증
    for (const [fieldName, fieldSchema] of Object.entries(schema.properties)) {
      const value = config[fieldName];
      
      if (value !== undefined && value !== null) {
        const fieldErrors = this.validateFieldValue(fieldName, value, fieldSchema);
        errors.push(...fieldErrors);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private validateFieldValue(fieldName: string, value: any, schema: NodeConfigProperty): NodeValidationError[] {
    const errors: NodeValidationError[] = [];

    // 타입 검증
    if (schema.type === 'string' && typeof value !== 'string') {
      errors.push({
        field: fieldName,
        message: `'${fieldName}' 필드는 문자열이어야 합니다.`,
        value
      });
      return errors;
    }

    if (schema.type === 'number' && typeof value !== 'number') {
      errors.push({
        field: fieldName,
        message: `'${fieldName}' 필드는 숫자여야 합니다.`,
        value
      });
      return errors;
    }

    if (schema.type === 'boolean' && typeof value !== 'boolean') {
      errors.push({
        field: fieldName,
        message: `'${fieldName}' 필드는 불린값이어야 합니다.`,
        value
      });
      return errors;
    }

    // 문자열 검증
    if (schema.type === 'string') {
      if (schema.minLength && value.length < schema.minLength) {
        errors.push({
          field: fieldName,
          message: `'${fieldName}' 필드는 최소 ${schema.minLength}자 이상이어야 합니다.`,
          value
        });
      }

      if (schema.maxLength && value.length > schema.maxLength) {
        errors.push({
          field: fieldName,
          message: `'${fieldName}' 필드는 최대 ${schema.maxLength}자 이하여야 합니다.`,
          value
        });
      }

      if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
        errors.push({
          field: fieldName,
          message: `'${fieldName}' 필드가 올바른 형식이 아닙니다.`,
          value
        });
      }

      if (schema.format === 'uri' && !this.isValidUri(value)) {
        errors.push({
          field: fieldName,
          message: `'${fieldName}' 필드는 유효한 URI여야 합니다.`,
          value
        });
      }
    }

    // 숫자 검증
    if (schema.type === 'number') {
      if (schema.minimum !== undefined && value < schema.minimum) {
        errors.push({
          field: fieldName,
          message: `'${fieldName}' 필드는 ${schema.minimum} 이상이어야 합니다.`,
          value
        });
      }

      if (schema.maximum !== undefined && value > schema.maximum) {
        errors.push({
          field: fieldName,
          message: `'${fieldName}' 필드는 ${schema.maximum} 이하여야 합니다.`,
          value
        });
      }
    }

    // enum 검증
    if (schema.enum && !schema.enum.includes(value)) {
      errors.push({
        field: fieldName,
        message: `'${fieldName}' 필드는 다음 값 중 하나여야 합니다: ${schema.enum.join(', ')}`,
        value
      });
    }

    return errors;
  }

  private generateCategoryInfo(templates: NodeTemplate[]): NodeCategoryInfo[] {
    const categoryMap = new Map<NodeCategory, { name: string; description: string; count: number; icon?: string }>();

    // 카테고리별 집계
    templates.forEach(template => {
      const current = categoryMap.get(template.category) || { name: '', description: '', count: 0 };
      categoryMap.set(template.category, {
        ...current,
        count: current.count + 1
      });
    });

    // 카테고리 정보 설정
    const categoryInfo: Record<NodeCategory, { name: string; description: string; icon?: string }> = {
      triggers: { name: '트리거', description: '워크플로우를 시작하는 노드들', icon: 'play' },
      actions: { name: '액션', description: '실제 작업을 수행하는 노드들', icon: 'zap' },
      conditions: { name: '조건', description: '실행 흐름을 제어하는 노드들', icon: 'git-branch' },
      transforms: { name: '변환', description: '데이터를 변환하는 노드들', icon: 'code' },
      integrations: { name: '연동', description: '외부 서비스와 연동하는 노드들', icon: 'link' },
      utilities: { name: '유틸리티', description: '유틸리티 기능을 제공하는 노드들', icon: 'tool' },
      custom: { name: '사용자 정의', description: '사용자가 정의한 노드들', icon: 'settings' }
    };

    return Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      name: categoryInfo[category].name,
      description: categoryInfo[category].description,
      count: data.count,
      icon: categoryInfo[category].icon
    }));
  }

  private generateNodeId(): string {
    return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDefaultConfig(schema: NodeConfigSchema): Record<string, any> {
    const config: Record<string, any> = {};

    for (const [fieldName, fieldSchema] of Object.entries(schema.properties)) {
      if (fieldSchema.default !== undefined) {
        config[fieldName] = fieldSchema.default;
      }
    }

    return config;
  }

  private getTemplateIdFromNode(node: WorkflowNode): string {
    // 노드 타입과 설정을 기반으로 템플릿 ID 추정
    // 실제로는 노드에 templateId를 저장하거나 별도 매핑이 필요
    const template = BUILT_IN_NODE_TEMPLATES.find(t => t.type === node.type);
    return template?.id || 'unknown';
  }

  private isValidUri(uri: string): boolean {
    try {
      new URL(uri);
      return true;
    } catch {
      return false;
    }
  }
} 