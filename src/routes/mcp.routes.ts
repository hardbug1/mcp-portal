import { Router } from 'express';
import { MCPController } from '../controllers/mcp.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { body, param, query } from 'express-validator';

const router = Router();
const mcpController = new MCPController();

// MCP 프로토콜 엔드포인트 (인증 불필요 - MCP 클라이언트용)
router.post('/servers/:serverId/mcp', 
  [
    param('serverId')
      .isUUID()
      .withMessage('올바른 서버 ID 형식이어야 합니다.'),
    validateRequest
  ],
  mcpController.handleMCPRequest
);

// 나머지 모든 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

// MCP 서버 목록 조회
router.get('/servers',
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('페이지는 1 이상의 정수여야 합니다.'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('제한은 1-100 사이의 정수여야 합니다.'),
    query('search')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('검색어는 1-100자 사이여야 합니다.'),
    query('status')
      .optional()
      .isIn(['CREATING', 'RUNNING', 'STOPPED', 'ERROR', 'UPDATING'])
      .withMessage('올바른 서버 상태여야 합니다.'),
    query('workspaceId')
      .optional()
      .isUUID()
      .withMessage('올바른 워크스페이스 ID 형식이어야 합니다.'),
    query('sortBy')
      .optional()
      .isIn(['name', 'status', 'createdAt', 'lastHeartbeat'])
      .withMessage('올바른 정렬 기준이어야 합니다.'),
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('정렬 순서는 asc 또는 desc여야 합니다.'),
    validateRequest
  ],
  mcpController.getMCPServers
);

// MCP 서버 생성
router.post('/servers',
  [
    body('name')
      .notEmpty()
      .isLength({ min: 1, max: 100 })
      .withMessage('이름은 1-100자 사이여야 합니다.'),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('설명은 500자 이하여야 합니다.'),
    body('workflowId')
      .isUUID()
      .withMessage('올바른 워크플로우 ID 형식이어야 합니다.'),
    body('capabilities')
      .optional()
      .isObject()
      .withMessage('capabilities는 객체여야 합니다.'),
    body('capabilities.tools')
      .optional()
      .isBoolean()
      .withMessage('tools는 boolean이어야 합니다.'),
    body('capabilities.resources')
      .optional()
      .isBoolean()
      .withMessage('resources는 boolean이어야 합니다.'),
    body('capabilities.prompts')
      .optional()
      .isBoolean()
      .withMessage('prompts는 boolean이어야 합니다.'),
    body('capabilities.logging')
      .optional()
      .isBoolean()
      .withMessage('logging은 boolean이어야 합니다.'),
    validateRequest
  ],
  mcpController.createMCPServer
);

// MCP 서버 통계 조회
router.get('/servers/stats',
  mcpController.getMCPServerStats
);

// MCP 서버 상세 조회
router.get('/servers/:serverId',
  [
    param('serverId')
      .isUUID()
      .withMessage('올바른 서버 ID 형식이어야 합니다.'),
    validateRequest
  ],
  mcpController.getMCPServerById
);

// MCP 서버 업데이트
router.put('/servers/:serverId',
  [
    param('serverId')
      .isUUID()
      .withMessage('올바른 서버 ID 형식이어야 합니다.'),
    body('name')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('이름은 1-100자 사이여야 합니다.'),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('설명은 500자 이하여야 합니다.'),
    body('capabilities')
      .optional()
      .isObject()
      .withMessage('capabilities는 객체여야 합니다.'),
    validateRequest
  ],
  mcpController.updateMCPServer
);

// MCP 서버 삭제
router.delete('/servers/:serverId',
  [
    param('serverId')
      .isUUID()
      .withMessage('올바른 서버 ID 형식이어야 합니다.'),
    validateRequest
  ],
  mcpController.deleteMCPServer
);

export default router; 