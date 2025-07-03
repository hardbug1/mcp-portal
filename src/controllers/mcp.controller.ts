import { Request, Response } from 'express';
import { MCPService } from '../services/mcp.service.js';
import {
  CreateMCPServerRequest,
  UpdateMCPServerRequest,
  MCPServerListQuery,
  MCPServerStatus,
  MCPRequest
} from '../types/mcp.js';
import { AuthenticatedRequest } from '../types/express.js';

export class MCPController {
  private mcpService: MCPService;

  constructor() {
    this.mcpService = new MCPService();
  }

  // MCP 서버 생성
  createMCPServer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const serverData: CreateMCPServerRequest = req.body;

      const server = await this.mcpService.createMCPServer(userId, serverData);

      res.status(201).json({
        success: true,
        message: 'MCP 서버가 성공적으로 생성되었습니다.',
        data: { server }
      });
    } catch (error) {
      console.error('MCP 서버 생성 오류:', error);
      
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'MCP 서버 생성 중 오류가 발생했습니다.'
        });
      }
    }
  };

  // MCP 서버 목록 조회
  getMCPServers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const query: MCPServerListQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        search: req.query.search as string,
        status: req.query.status as MCPServerStatus,
        workspaceId: req.query.workspaceId as string,
        sortBy: req.query.sortBy as any || 'createdAt',
        sortOrder: req.query.sortOrder as any || 'desc'
      };

      const result = await this.mcpService.getMCPServers(userId, query);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('MCP 서버 목록 조회 오류:', error);
      
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'MCP 서버 목록 조회 중 오류가 발생했습니다.'
        });
      }
    }
  };

  // MCP 서버 상세 조회
  getMCPServerById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { serverId } = req.params;

      const server = await this.mcpService.getMCPServerById(userId, serverId);

      if (!server) {
        res.status(404).json({
          success: false,
          message: 'MCP 서버를 찾을 수 없습니다.'
        });
        return;
      }

      res.json({
        success: true,
        data: { server }
      });
    } catch (error) {
      console.error('MCP 서버 조회 오류:', error);
      
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'MCP 서버 조회 중 오류가 발생했습니다.'
        });
      }
    }
  };

  // MCP 서버 업데이트
  updateMCPServer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { serverId } = req.params;
      const updateData: UpdateMCPServerRequest = req.body;

      const updatedServer = await this.mcpService.updateMCPServer(userId, serverId, updateData);

      res.json({
        success: true,
        message: 'MCP 서버가 성공적으로 업데이트되었습니다.',
        data: { server: updatedServer }
      });
    } catch (error) {
      console.error('MCP 서버 업데이트 오류:', error);
      
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'MCP 서버 업데이트 중 오류가 발생했습니다.'
        });
      }
    }
  };

  // MCP 서버 삭제
  deleteMCPServer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { serverId } = req.params;

      await this.mcpService.deleteMCPServer(userId, serverId);

      res.json({
        success: true,
        message: 'MCP 서버가 성공적으로 삭제되었습니다.'
      });
    } catch (error) {
      console.error('MCP 서버 삭제 오류:', error);
      
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'MCP 서버 삭제 중 오류가 발생했습니다.'
        });
      }
    }
  };

  // MCP 서버 통계 조회
  getMCPServerStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;

      const stats = await this.mcpService.getMCPServerStats(userId);

      res.json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      console.error('MCP 서버 통계 조회 오류:', error);
      
      res.status(500).json({
        success: false,
        message: 'MCP 서버 통계 조회 중 오류가 발생했습니다.'
      });
    }
  };

  // MCP 프로토콜 요청 처리
  handleMCPRequest = async (req: Request, res: Response): Promise<void> => {
    try {
      const { serverId } = req.params;
      const mcpRequest: MCPRequest = req.body;

      const response = await this.mcpService.handleMCPRequest(serverId, mcpRequest);

      res.json(response);
    } catch (error) {
      console.error('MCP 요청 처리 오류:', error);
      
      res.status(500).json({
        jsonrpc: '2.0',
        id: req.body.id,
        error: {
          code: -32603,
          message: 'Internal error'
        }
      });
    }
  };
} 