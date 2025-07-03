import { Router } from 'express';
import { NodeController } from '../controllers/node.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { 
  validateCreateNode,
  validateUpdateNode,
  validateNodeParams,
  validateTemplateId,
  validateNodeTemplateQuery,
  validateNodeConfig,
  validateRequest
} from '../middleware/validation.middleware.js';

const router = Router();
const nodeController = new NodeController();

// 모든 노드 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

// 노드 템플릿 관련 라우트
router.get('/templates', 
  validateNodeTemplateQuery, 
  validateRequest,
  (req, res) => nodeController.getTemplates(req, res)
);

router.get('/templates/:templateId', 
  validateTemplateId, 
  validateRequest,
  (req, res) => nodeController.getTemplate(req, res)
);

router.post('/templates/:templateId/validate', 
  validateNodeConfig, 
  validateRequest,
  (req, res) => nodeController.validateNode(req, res)
);

// 워크플로우 내 노드 관리 라우트
router.post('/', 
  validateCreateNode, 
  validateRequest,
  (req, res) => nodeController.createNode(req, res)
);

router.get('/workflows/:workflowId/nodes', 
  validateRequest,
  (req, res) => nodeController.getNodes(req, res)
);

router.get('/workflows/:workflowId/nodes/:nodeId', 
  validateNodeParams, 
  validateRequest,
  (req, res) => nodeController.getNode(req, res)
);

router.put('/workflows/:workflowId/nodes/:nodeId', 
  validateUpdateNode, 
  validateRequest,
  (req, res) => nodeController.updateNode(req, res)
);

router.delete('/workflows/:workflowId/nodes/:nodeId', 
  validateNodeParams, 
  validateRequest,
  (req, res) => nodeController.deleteNode(req, res)
);

export default router; 