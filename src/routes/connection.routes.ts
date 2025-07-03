import { Router } from 'express';
import { body, param } from 'express-validator';
import { ConnectionController } from '../controllers/connection.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';

const router = Router();
const connectionController = new ConnectionController();

// 모든 연결 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

/**
 * @route POST /api/workflows/:workflowId/connections
 * @desc 새 연결 생성
 * @access Private
 */
router.post('/:workflowId/connections',
  param('workflowId').isUUID().withMessage('유효한 워크플로우 ID를 입력해주세요.'),
  body('sourceNodeId').notEmpty().withMessage('소스 노드 ID는 필수입니다.'),
  body('targetNodeId').notEmpty().withMessage('타겟 노드 ID는 필수입니다.'),
  body('sourcePort').notEmpty().withMessage('소스 포트는 필수입니다.'),
  body('targetPort').notEmpty().withMessage('타겟 포트는 필수입니다.'),
  validateRequest,
  connectionController.createConnection.bind(connectionController)
);

/**
 * @route PUT /api/workflows/:workflowId/connections/:connectionId
 * @desc 연결 정보 수정
 * @access Private
 */
router.put('/:workflowId/connections/:connectionId',
  param('workflowId').isUUID().withMessage('유효한 워크플로우 ID를 입력해주세요.'),
  param('connectionId').notEmpty().withMessage('유효한 연결 ID를 입력해주세요.'),
  body('sourcePort').optional().notEmpty().withMessage('소스 포트가 비어있을 수 없습니다.'),
  body('targetPort').optional().notEmpty().withMessage('타겟 포트가 비어있을 수 없습니다.'),
  validateRequest,
  (req, res) => connectionController.updateConnection(req, res)
);

/**
 * @route DELETE /api/workflows/:workflowId/connections/:connectionId
 * @desc 연결 삭제
 * @access Private
 */
router.delete('/:workflowId/connections/:connectionId',
  param('workflowId').isUUID().withMessage('유효한 워크플로우 ID를 입력해주세요.'),
  param('connectionId').notEmpty().withMessage('유효한 연결 ID를 입력해주세요.'),
  validateRequest,
  (req, res) => connectionController.deleteConnection(req, res)
);

/**
 * @route GET /api/workflows/:workflowId/connections
 * @desc 워크플로우의 모든 연결 조회
 * @access Private
 */
router.get('/:workflowId/connections',
  param('workflowId').isUUID().withMessage('유효한 워크플로우 ID를 입력해주세요.'),
  validateRequest,
  (req, res) => connectionController.getConnections(req, res)
);

/**
 * @route GET /api/workflows/:workflowId/connections/:connectionId
 * @desc 특정 연결 조회
 * @access Private
 */
router.get('/:workflowId/connections/:connectionId',
  param('workflowId').isUUID().withMessage('유효한 워크플로우 ID를 입력해주세요.'),
  param('connectionId').notEmpty().withMessage('유효한 연결 ID를 입력해주세요.'),
  validateRequest,
  (req, res) => connectionController.getConnection(req, res)
);

/**
 * @route POST /api/workflows/:workflowId/connections/validate
 * @desc 연결 검증
 * @access Private
 */
router.post('/:workflowId/connections/validate',
  param('workflowId').isUUID().withMessage('유효한 워크플로우 ID를 입력해주세요.'),
  body('sourceNodeId').notEmpty().withMessage('소스 노드 ID는 필수입니다.'),
  body('targetNodeId').notEmpty().withMessage('타겟 노드 ID는 필수입니다.'),
  body('sourcePort').notEmpty().withMessage('소스 포트는 필수입니다.'),
  body('targetPort').notEmpty().withMessage('타겟 포트는 필수입니다.'),
  validateRequest,
  (req, res) => connectionController.validateConnection(req, res)
);

/**
 * @route GET /api/workflows/:workflowId/connections/analyze
 * @desc 워크플로우 연결 분석
 * @access Private
 */
router.get('/:workflowId/connections/analyze',
  param('workflowId').isUUID().withMessage('유효한 워크플로우 ID를 입력해주세요.'),
  validateRequest,
  (req, res) => connectionController.analyzeConnections(req, res)
);

/**
 * @route GET /api/workflows/:workflowId/nodes/:nodeId/connections
 * @desc 노드의 연결 정보 조회
 * @access Private
 */
router.get('/:workflowId/nodes/:nodeId/connections',
  param('workflowId').isUUID().withMessage('유효한 워크플로우 ID를 입력해주세요.'),
  param('nodeId').notEmpty().withMessage('유효한 노드 ID를 입력해주세요.'),
  validateRequest,
  (req, res) => connectionController.getNodeConnectionInfo(req, res)
);

export default router; 