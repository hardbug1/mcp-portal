import { Request, Response } from 'express';
import { NodeService } from '../services/node.service.js';
import {
  NodeTemplateQueryParams,
  CreateNodeRequest,
  UpdateNodeRequest
} from '../types/node.js';

const nodeService = new NodeService();

export class NodeController {
  async getTemplates(req: Request, res: Response): Promise<void> {
    try {
      const params: NodeTemplateQueryParams = {
        category: req.query.category as any,
        type: req.query.type as any,
        search: req.query.search as string,
        tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
        includeDeprecated: req.query.includeDeprecated === 'true',
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
      };

      const result = await nodeService.getNodeTemplates(params);

      res.json({
        success: true,
        message: '노드 템플릿 목록을 성공적으로 조회했습니다.',
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '노드 템플릿 조회에 실패했습니다.',
      });
    }
  }

  async getTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { templateId } = req.params;

      const template = await nodeService.getNodeTemplate(templateId);

      if (!template) {
        res.status(404).json({
          success: false,
          message: '노드 템플릿을 찾을 수 없습니다.',
        });
        return;
      }

      res.json({
        success: true,
        message: '노드 템플릿을 성공적으로 조회했습니다.',
        data: template,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '노드 템플릿 조회에 실패했습니다.',
      });
    }
  }

  async createNode(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const data: CreateNodeRequest = req.body;

      const node = await nodeService.createNodeInWorkflow(userId, data);

      res.status(201).json({
        success: true,
        message: '노드가 성공적으로 생성되었습니다.',
        data: node,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '노드 생성에 실패했습니다.',
      });
    }
  }

  async getNodes(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { workflowId } = req.params;

      const nodes = await nodeService.getNodesInWorkflow(userId, workflowId);

      res.json({
        success: true,
        message: '워크플로우 노드 목록을 성공적으로 조회했습니다.',
        data: nodes,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '노드 목록 조회에 실패했습니다.',
      });
    }
  }

  async getNode(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { workflowId, nodeId } = req.params;

      const node = await nodeService.getNodeInWorkflow(userId, workflowId, nodeId);

      if (!node) {
        res.status(404).json({
          success: false,
          message: '노드를 찾을 수 없습니다.',
        });
        return;
      }

      res.json({
        success: true,
        message: '노드를 성공적으로 조회했습니다.',
        data: node,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '노드 조회에 실패했습니다.',
      });
    }
  }

  async updateNode(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { workflowId, nodeId } = req.params;
      const data: UpdateNodeRequest = req.body;

      const node = await nodeService.updateNodeInWorkflow(userId, workflowId, nodeId, data);

      res.json({
        success: true,
        message: '노드가 성공적으로 업데이트되었습니다.',
        data: node,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '노드 업데이트에 실패했습니다.',
      });
    }
  }

  async deleteNode(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { workflowId, nodeId } = req.params;

      await nodeService.deleteNodeFromWorkflow(userId, workflowId, nodeId);

      res.json({
        success: true,
        message: '노드가 성공적으로 삭제되었습니다.',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '노드 삭제에 실패했습니다.',
      });
    }
  }

  async validateNode(req: Request, res: Response): Promise<void> {
    try {
      const { templateId } = req.params;
      const config = req.body.config || {};

      const template = await nodeService.getNodeTemplate(templateId);
      if (!template) {
        res.status(404).json({
          success: false,
          message: '노드 템플릿을 찾을 수 없습니다.',
        });
        return;
      }

      const validation = nodeService.validateNodeConfig(config, template.configSchema);

      res.json({
        success: true,
        message: '노드 설정 검증이 완료되었습니다.',
        data: validation,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '노드 설정 검증에 실패했습니다.',
      });
    }
  }
} 