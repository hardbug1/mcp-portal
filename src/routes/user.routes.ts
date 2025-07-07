import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requireRole, requirePermission, permissions } from '../middleware/rbac.middleware.js';
import { UserRole } from '../types/user';
import { validateRequest } from '../middleware/validation.middleware.js';
import { body, param, query } from 'express-validator';

const router = Router();
const userController = new UserController();

// 모든 사용자 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

// === 일반 사용자 API ===

// 현재 사용자 프로필 조회
router.get('/profile', userController.getProfile);

// 사용자 프로필 업데이트
router.put('/profile', 
  [
    body('name')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('이름은 1-100자 사이여야 합니다.'),
    body('avatar')
      .optional()
      .isURL()
      .withMessage('올바른 URL 형식이어야 합니다.'),
    validateRequest
  ],
  userController.updateProfile
);

// 비밀번호 변경
router.put('/password',
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('현재 비밀번호는 필수입니다.'),
    body('newPassword')
      .isLength({ min: 8, max: 128 })
      .withMessage('새 비밀번호는 8-128자 사이여야 합니다.')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('새 비밀번호는 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.'),
    validateRequest
  ],
  userController.changePassword
);

// 사용자 워크스페이스 목록 조회
router.get('/workspaces', userController.getUserWorkspaces);

// === 관리자 전용 API ===

// 사용자 목록 조회 (관리자)
router.get('/', requirePermission(permissions.USER_READ), (req, res) => userController.getUsers(req, res));

// 특정 사용자 조회 (관리자)
router.get('/:userId', requirePermission(permissions.USER_READ), (req, res) => userController.getUserById(req, res));

// 사용자 정보 업데이트 (관리자)
router.put('/:userId', requirePermission(permissions.USER_WRITE), (req, res) => userController.updateUser(req, res));

// 사용자 삭제 (관리자)
router.delete('/:userId', requireRole(UserRole.SUPER_ADMIN), (req, res) => userController.deleteUser(req, res));

// 사용자 통계 조회 (관리자)
router.get('/admin/stats', requirePermission(permissions.USER_READ), (req, res) => userController.getUserStats(req, res));

// 사용자 이메일 인증 (관리자)
router.post('/:userId/verify-email',
  [
    param('userId')
      .isUUID()
      .withMessage('올바른 사용자 ID 형식이어야 합니다.'),
    validateRequest
  ],
  userController.verifyUserEmail
);

export default router; 