import { Router } from 'express';
import { WorkflowController } from '../controllers/workflow.controller';
import { NodeController } from '../controllers/node.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requirePermission, requireWorkspaceMember, permissions } from '../middleware/rbac.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { body, param, query } from 'express-validator';

const router = Router();
const workflowController = new WorkflowController();

// 모든 라우트에 인증 필요
router.use(authenticateToken);

// 워크플로우 목록 조회 (워크스페이스 멤버)
router.get('/', requirePermission(permissions.WORKFLOW_READ), (req, res) => workflowController.findAll(req, res));

// 워크플로우 생성 (워크스페이스 멤버)
router.post('/', requirePermission(permissions.WORKFLOW_WRITE), (req, res) => workflowController.create(req, res));

// 특정 워크플로우 조회 (워크스페이스 멤버)
router.get('/:id', requirePermission(permissions.WORKFLOW_READ), (req, res) => workflowController.findById(req, res));

// 워크플로우 업데이트 (워크스페이스 멤버)
router.put('/:id', requirePermission(permissions.WORKFLOW_WRITE), (req, res) => workflowController.update(req, res));

// 워크플로우 삭제 (워크스페이스 관리자 이상)
router.delete('/:id', requirePermission(permissions.WORKFLOW_DELETE), (req, res) => workflowController.delete(req, res));

// 워크플로우 복사 (워크스페이스 멤버)
router.post('/:id/duplicate', requirePermission(permissions.WORKFLOW_WRITE), (req, res) => workflowController.duplicate(req, res));

// 워크플로우 실행 (워크스페이스 멤버)
router.post('/:id/execute', requirePermission(permissions.WORKFLOW_EXECUTE), (req, res) => workflowController.execute(req, res));

// 워크플로우 검증 (워크스페이스 멤버)
router.get('/:id/validate', requirePermission(permissions.WORKFLOW_READ), (req, res) => workflowController.validate(req, res));

// 워크플로우 통계 (워크스페이스 멤버)
router.get('/:id/stats', requirePermission(permissions.WORKFLOW_READ), (req, res) => workflowController.getWorkflowStats(req, res));

// 워크플로우 실행 히스토리 (워크스페이스 멤버)
router.get('/:id/executions', requirePermission(permissions.WORKFLOW_READ), (req, res) => workflowController.getWorkflowExecutions(req, res));

export default router; 