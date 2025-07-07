import { Request, Response } from 'express';
import { DeploymentService } from '../services/deployment.service';
import { 
  CreateDeploymentRequest, 
  UpdateDeploymentRequest, 
  DeploymentQueryParams 
} from '../types/deployment';

const deploymentService = new DeploymentService();

export class DeploymentController {
  
  async createDeployment(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const data: CreateDeploymentRequest = req.body;

      const deployment = await deploymentService.createDeployment(userId, data);

      res.status(201).json({
        success: true,
        message: '배포가 성공적으로 생성되었습니다.',
        data: deployment,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '배포 생성에 실패했습니다.',
      });
    }
  }

  async getDeployments(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const params: DeploymentQueryParams = {
        workflowId: req.query.workflowId as string,
        environment: req.query.environment as string,
        status: req.query.status as string,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as any,
      };

      const result = await deploymentService.getDeployments(userId, params);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '배포 목록 조회에 실패했습니다.',
      });
    }
  }

  async getDeploymentById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const deployment = await deploymentService.getDeploymentById(userId, id);

      if (!deployment) {
        res.status(404).json({
          success: false,
          message: '배포를 찾을 수 없습니다.',
        });
        return;
      }

      res.json({
        success: true,
        data: deployment,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '배포 조회에 실패했습니다.',
      });
    }
  }

  async updateDeployment(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const data: UpdateDeploymentRequest = req.body;

      const deployment = await deploymentService.updateDeployment(userId, id, data);

      res.json({
        success: true,
        message: '배포가 성공적으로 업데이트되었습니다.',
        data: deployment,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '배포 업데이트에 실패했습니다.',
      });
    }
  }

  async deleteDeployment(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      await deploymentService.deleteDeployment(userId, id);

      res.json({
        success: true,
        message: '배포가 성공적으로 삭제되었습니다.',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '배포 삭제에 실패했습니다.',
      });
    }
  }

  async redeployment(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const deployment = await deploymentService.redeployment(userId, id);

      res.json({
        success: true,
        message: '재배포가 성공적으로 시작되었습니다.',
        data: deployment,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '재배포에 실패했습니다.',
      });
    }
  }

  async getDeploymentStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const stats = await deploymentService.getDeploymentStats(userId, id);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '배포 통계 조회에 실패했습니다.',
      });
    }
  }

  async checkHealth(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const healthResult = await deploymentService.checkHealth(userId, id);

      res.json({
        success: true,
        data: healthResult,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '헬스 체크에 실패했습니다.',
      });
    }
  }

  async getAllDeploymentStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      const stats = await deploymentService.getDeploymentStats(userId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '전체 배포 통계 조회에 실패했습니다.',
      });
    }
  }
} 