import { Request, Response } from 'express';
import { ConnectionService } from '../services/connection.service.js';
import { CreateConnectionRequest, UpdateConnectionRequest } from '../types/connection.js';

export class ConnectionController {
  private connectionService = new ConnectionService();

  /**
   * 새 연결 생성
   * POST /api/workflows/:workflowId/connections
   */
  async createConnection(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { workflowId } = req.params;
      const connectionData: CreateConnectionRequest = {
        workflowId,
        ...req.body
      };

      const connection = await this.connectionService.createConnection(userId, connectionData);

      res.status(201).json({
        success: true,
        data: connection,
        message: '연결이 성공적으로 생성되었습니다.'
      });
    } catch (error) {
      console.error('연결 생성 오류:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '연결 생성 중 오류가 발생했습니다.'
      });
    }
  }

  /**
   * 연결 정보 수정
   * PUT /api/workflows/:workflowId/connections/:connectionId
   */
  async updateConnection(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { workflowId, connectionId } = req.params;
      const updateData: UpdateConnectionRequest = req.body;

      const connection = await this.connectionService.updateConnection(
        userId,
        workflowId,
        connectionId,
        updateData
      );

      res.json({
        success: true,
        data: connection,
        message: '연결이 성공적으로 수정되었습니다.'
      });
    } catch (error) {
      console.error('연결 수정 오류:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '연결 수정 중 오류가 발생했습니다.'
      });
    }
  }

  /**
   * 연결 삭제
   * DELETE /api/workflows/:workflowId/connections/:connectionId
   */
  async deleteConnection(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { workflowId, connectionId } = req.params;

      await this.connectionService.deleteConnection(userId, workflowId, connectionId);

      res.json({
        success: true,
        message: '연결이 성공적으로 삭제되었습니다.'
      });
    } catch (error) {
      console.error('연결 삭제 오류:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '연결 삭제 중 오류가 발생했습니다.'
      });
    }
  }

  /**
   * 워크플로우의 모든 연결 조회
   * GET /api/workflows/:workflowId/connections
   */
  async getConnections(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { workflowId } = req.params;

      const connections = await this.connectionService.getConnections(userId, workflowId);

      res.json({
        success: true,
        data: connections
      });
    } catch (error) {
      console.error('연결 목록 조회 오류:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '연결 목록 조회 중 오류가 발생했습니다.'
      });
    }
  }

  /**
   * 특정 연결 조회
   * GET /api/workflows/:workflowId/connections/:connectionId
   */
  async getConnection(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { workflowId, connectionId } = req.params;

      const connection = await this.connectionService.getConnection(userId, workflowId, connectionId);

      if (!connection) {
        res.status(404).json({
          success: false,
          message: '연결을 찾을 수 없습니다.'
        });
        return;
      }

      res.json({
        success: true,
        data: connection
      });
    } catch (error) {
      console.error('연결 조회 오류:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '연결 조회 중 오류가 발생했습니다.'
      });
    }
  }

  /**
   * 연결 검증
   * POST /api/workflows/:workflowId/connections/validate
   */
  async validateConnection(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { workflowId } = req.params;
      const connectionData: CreateConnectionRequest = {
        workflowId,
        ...req.body
      };

      // 워크플로우 조회
      const workflow = await this.connectionService['workflowService'].findById(userId, workflowId);
      if (!workflow) {
        res.status(404).json({
          success: false,
          message: '워크플로우를 찾을 수 없거나 접근 권한이 없습니다.'
        });
        return;
      }

      const validation = await this.connectionService.validateConnection(
        workflow.workflow.definition,
        connectionData
      );

      res.json({
        success: true,
        data: validation
      });
    } catch (error) {
      console.error('연결 검증 오류:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '연결 검증 중 오류가 발생했습니다.'
      });
    }
  }

  /**
   * 워크플로우 연결 분석
   * GET /api/workflows/:workflowId/connections/analyze
   */
  async analyzeConnections(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { workflowId } = req.params;

      const analysis = await this.connectionService.analyzeConnections(userId, workflowId);

      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      console.error('연결 분석 오류:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '연결 분석 중 오류가 발생했습니다.'
      });
    }
  }

  /**
   * 노드의 연결 정보 조회
   * GET /api/workflows/:workflowId/nodes/:nodeId/connections
   */
  async getNodeConnectionInfo(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { workflowId, nodeId } = req.params;

      const connectionInfo = await this.connectionService.getNodeConnectionInfo(
        userId,
        workflowId,
        nodeId
      );

      res.json({
        success: true,
        data: connectionInfo
      });
    } catch (error) {
      console.error('노드 연결 정보 조회 오류:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '노드 연결 정보 조회 중 오류가 발생했습니다.'
      });
    }
  }
} 