import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
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
router.get('/',
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
    query('role')
      .optional()
      .isIn(['USER', 'ADMIN', 'SUPER_ADMIN'])
      .withMessage('올바른 역할이어야 합니다.'),
    query('sortBy')
      .optional()
      .isIn(['name', 'email', 'createdAt', 'lastLoginAt'])
      .withMessage('올바른 정렬 기준이어야 합니다.'),
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('정렬 순서는 asc 또는 desc여야 합니다.'),
    validateRequest
  ],
  userController.getUsers
);

// 특정 사용자 조회 (관리자)
router.get('/:userId',
  [
    param('userId')
      .isUUID()
      .withMessage('올바른 사용자 ID 형식이어야 합니다.'),
    validateRequest
  ],
  userController.getUserById
);

// 사용자 정보 업데이트 (관리자)
router.put('/:userId',
  [
    param('userId')
      .isUUID()
      .withMessage('올바른 사용자 ID 형식이어야 합니다.'),
    body('name')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('이름은 1-100자 사이여야 합니다.'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('올바른 이메일 형식이어야 합니다.'),
    body('role')
      .optional()
      .isIn(['USER', 'ADMIN', 'SUPER_ADMIN'])
      .withMessage('올바른 역할이어야 합니다.'),
    body('isEmailVerified')
      .optional()
      .isBoolean()
      .withMessage('이메일 인증 상태는 boolean이어야 합니다.'),
    validateRequest
  ],
  userController.updateUser
);

// 사용자 삭제 (관리자)
router.delete('/:userId',
  [
    param('userId')
      .isUUID()
      .withMessage('올바른 사용자 ID 형식이어야 합니다.'),
    body('transferWorkflowsTo')
      .optional()
      .isUUID()
      .withMessage('워크플로우 이전 대상은 올바른 사용자 ID여야 합니다.'),
    body('deleteWorkflows')
      .optional()
      .isBoolean()
      .withMessage('워크플로우 삭제 옵션은 boolean이어야 합니다.'),
    validateRequest
  ],
  userController.deleteUser
);

// 사용자 통계 조회 (관리자)
router.get('/admin/stats', userController.getUserStats);

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