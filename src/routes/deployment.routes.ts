import { Router } from 'express';
import { DeploymentController } from '../controllers/deployment.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requirePermission, permissions } from '../middleware/rbac.middleware';

const router = Router();
const deploymentController = new DeploymentController();

// 모든 라우트에 인증 필요
router.use(authenticateToken);

// 배포 목록 조회
router.get('/', requirePermission(permissions.MCP_READ), (req, res) => deploymentController.getDeployments(req, res));

// 배포 생성
router.post('/', requirePermission(permissions.MCP_DEPLOY), (req, res) => deploymentController.createDeployment(req, res));

// 배포 통계 조회 (전체)
router.get('/stats', requirePermission(permissions.MCP_READ), (req, res) => deploymentController.getAllDeploymentStats(req, res));

// 특정 배포 조회
router.get('/:id', requirePermission(permissions.MCP_READ), (req, res) => deploymentController.getDeploymentById(req, res));

// 배포 업데이트
router.put('/:id', requirePermission(permissions.MCP_WRITE), (req, res) => deploymentController.updateDeployment(req, res));

// 배포 삭제
router.delete('/:id', requirePermission(permissions.MCP_DELETE), (req, res) => deploymentController.deleteDeployment(req, res));

// 재배포
router.post('/:id/redeploy', requirePermission(permissions.MCP_DEPLOY), (req, res) => deploymentController.redeployment(req, res));

// 배포 통계 조회 (특정 배포)
router.get('/:id/stats', requirePermission(permissions.MCP_READ), (req, res) => deploymentController.getDeploymentStats(req, res));

// 헬스 체크
router.get('/:id/health', requirePermission(permissions.MCP_READ), (req, res) => deploymentController.checkHealth(req, res));

export default router; 