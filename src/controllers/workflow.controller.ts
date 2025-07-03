import { Request, Response } from 'express';
import { WorkflowService } from '../services/workflow.service.js';
import {
  CreateWorkflowRequest,
  UpdateWorkflowRequest,
  WorkflowQueryParams,
  ExecuteWorkflowRequest
} from '../types/workflow.js';

const workflowService = new WorkflowService();

export class WorkflowController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const data: CreateWorkflowRequest = req.body;

      const workflow = await workflowService.create(userId, data);

      res.status(201).json({
        success: true,
        message: '워크플로우가 성공적으로 생성되었습니다.',
        data: workflow,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '워크플로우 생성에 실패했습니다.',
      });
    }
  }

  async findById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const workflow = await workflowService.findById(userId, id);

      if (!workflow) {
        res.status(404).json({
          success: false,
          message: '워크플로우를 찾을 수 없습니다.',
        });
        return;
      }

      res.json({
        success: true,
        data: workflow,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '워크플로우 조회에 실패했습니다.',
      });
    }
  }

  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const params: WorkflowQueryParams = {
        workspaceId: req.query.workspaceId as string,
        status: req.query.status as any,
        tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as any,
      };

      const result = await workflowService.findAll(userId, params);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '워크플로우 목록 조회에 실패했습니다.',
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const data: UpdateWorkflowRequest = req.body;

      const workflow = await workflowService.update(userId, id, data);

      res.json({
        success: true,
        message: '워크플로우가 성공적으로 업데이트되었습니다.',
        data: workflow,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '워크플로우 업데이트에 실패했습니다.',
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      await workflowService.delete(userId, id);

      res.json({
        success: true,
        message: '워크플로우가 성공적으로 삭제되었습니다.',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '워크플로우 삭제에 실패했습니다.',
      });
    }
  }

  async duplicate(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const { name } = req.body;

      const workflow = await workflowService.duplicate(userId, id, name);

      res.status(201).json({
        success: true,
        message: '워크플로우가 성공적으로 복사되었습니다.',
        data: workflow,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '워크플로우 복사에 실패했습니다.',
      });
    }
  }

  async execute(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const data: ExecuteWorkflowRequest = req.body;

      const result = await workflowService.execute(userId, id, data);

      res.json({
        success: true,
        message: '워크플로우 실행이 시작되었습니다.',
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '워크플로우 실행에 실패했습니다.',
      });
    }
  }

  async validate(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const workflow = await workflowService.findById(userId, id);
      if (!workflow) {
        res.status(404).json({
          success: false,
          message: '워크플로우를 찾을 수 없습니다.',
        });
        return;
      }

      const validation = await workflowService.validateWorkflowDefinition(workflow.workflow.definition);

      res.json({
        success: true,
        data: validation,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '워크플로우 검증에 실패했습니다.',
      });
    }
  }
} 