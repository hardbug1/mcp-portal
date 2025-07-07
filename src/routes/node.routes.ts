import { Router } from 'express';
import { NodeController } from '../controllers/node.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { 
  validateTemplateId,
  validateNodeTemplateQuery,
  validateNodeConfig,
  validateRequest
} from '../middleware/validation.middleware.js';

const router = Router();
const nodeController = new NodeController();

// 모든 노드 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

// 노드 템플릿 관련 라우트 (워크플로우 독립적)
router.get('/templates', 
  validateNodeTemplateQuery, 
  validateRequest,
  nodeController.getTemplates.bind(nodeController)
);

router.get('/templates/:templateId', 
  validateTemplateId, 
  validateRequest,
  nodeController.getTemplate.bind(nodeController)
);

router.post('/templates/:templateId/validate', 
  validateNodeConfig, 
  validateRequest,
  nodeController.validateNode.bind(nodeController)
);

export default router; 