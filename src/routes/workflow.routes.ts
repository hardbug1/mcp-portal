import { Router } from 'express';
import { WorkflowController } from '../controllers/workflow.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { 
  validateCreateWorkflow,
  validateUpdateWorkflow,
  validateWorkflowId,
  validateWorkflowQuery,
  validateExecuteWorkflow,
  validateDuplicateWorkflow,
  validateRequest
} from '../middleware/validation.middleware.js';

const router = Router();
const workflowController = new WorkflowController();

// 모든 워크플로우 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

// 워크플로우 목록 조회
router.get('/', 
  validateWorkflowQuery, 
  validateRequest,
  (req, res) => workflowController.findAll(req, res)
);

// 워크플로우 생성
router.post('/', 
  validateCreateWorkflow, 
  validateRequest,
  (req, res) => workflowController.create(req, res)
);

// 워크플로우 상세 조회
router.get('/:id', 
  validateWorkflowId, 
  validateRequest,
  (req, res) => workflowController.findById(req, res)
);

// 워크플로우 업데이트
router.put('/:id', 
  validateUpdateWorkflow, 
  validateRequest,
  (req, res) => workflowController.update(req, res)
);

// 워크플로우 삭제
router.delete('/:id', 
  validateWorkflowId, 
  validateRequest,
  (req, res) => workflowController.delete(req, res)
);

// 워크플로우 복사
router.post('/:id/duplicate', 
  validateDuplicateWorkflow, 
  validateRequest,
  (req, res) => workflowController.duplicate(req, res)
);

// 워크플로우 실행
router.post('/:id/execute', 
  validateExecuteWorkflow, 
  validateRequest,
  (req, res) => workflowController.execute(req, res)
);

// 워크플로우 검증
router.get('/:id/validate', 
  validateWorkflowId, 
  validateRequest,
  (req, res) => workflowController.validate(req, res)
);

export default router; 