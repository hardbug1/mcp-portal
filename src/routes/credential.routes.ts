import { Router } from 'express';
import { CredentialController } from '../controllers/credential.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { body, param, query } from 'express-validator';

const router = Router();
const credentialController = new CredentialController();

// 자격증명 타입 목록 조회 (인증 불필요)
router.get('/types', credentialController.getCredentialTypes);

// 모든 자격증명 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

// 자격증명 목록 조회
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
    query('type')
      .optional()
      .isIn(['API_KEY', 'OAUTH2', 'BASIC_AUTH', 'BEARER_TOKEN', 'SSH_KEY', 'DATABASE', 'WEBHOOK', 'CUSTOM'])
      .withMessage('올바른 자격증명 타입이어야 합니다.'),
    query('workspaceId')
      .optional()
      .isUUID()
      .withMessage('올바른 워크스페이스 ID 형식이어야 합니다.'),
    query('isShared')
      .optional()
      .isBoolean()
      .withMessage('공유 여부는 boolean이어야 합니다.'),
    query('sortBy')
      .optional()
      .isIn(['name', 'type', 'createdAt', 'updatedAt'])
      .withMessage('올바른 정렬 기준이어야 합니다.'),
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('정렬 순서는 asc 또는 desc여야 합니다.'),
    validateRequest
  ],
  credentialController.getCredentials
);

// 자격증명 생성
router.post('/',
  [
    body('name')
      .notEmpty()
      .isLength({ min: 1, max: 100 })
      .withMessage('이름은 1-100자 사이여야 합니다.'),
    body('type')
      .isIn(['API_KEY', 'OAUTH2', 'BASIC_AUTH', 'BEARER_TOKEN', 'SSH_KEY', 'DATABASE', 'WEBHOOK', 'CUSTOM'])
      .withMessage('올바른 자격증명 타입이어야 합니다.'),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('설명은 500자 이하여야 합니다.'),
    body('workspaceId')
      .isUUID()
      .withMessage('올바른 워크스페이스 ID 형식이어야 합니다.'),
    body('isShared')
      .optional()
      .isBoolean()
      .withMessage('공유 여부는 boolean이어야 합니다.'),
    body('data')
      .isObject()
      .withMessage('자격증명 데이터는 객체여야 합니다.'),
    validateRequest
  ],
  credentialController.createCredential
);

// 자격증명 테스트 (새 자격증명)
router.post('/test',
  [
    body('type')
      .isIn(['API_KEY', 'OAUTH2', 'BASIC_AUTH', 'BEARER_TOKEN', 'SSH_KEY', 'DATABASE', 'WEBHOOK', 'CUSTOM'])
      .withMessage('올바른 자격증명 타입이어야 합니다.'),
    body('data')
      .isObject()
      .withMessage('자격증명 데이터는 객체여야 합니다.'),
    body('testEndpoint')
      .optional()
      .isURL()
      .withMessage('테스트 엔드포인트는 올바른 URL이어야 합니다.'),
    validateRequest
  ],
  credentialController.testCredential
);

// 자격증명 통계 조회
router.get('/stats',
  [
    query('workspaceId')
      .optional()
      .isUUID()
      .withMessage('올바른 워크스페이스 ID 형식이어야 합니다.'),
    validateRequest
  ],
  credentialController.getCredentialStats
);

// 자격증명 상세 조회
router.get('/:credentialId',
  [
    param('credentialId')
      .isUUID()
      .withMessage('올바른 자격증명 ID 형식이어야 합니다.'),
    validateRequest
  ],
  credentialController.getCredentialById
);

// 자격증명 데이터와 함께 조회 (마스킹됨)
router.get('/:credentialId/data',
  [
    param('credentialId')
      .isUUID()
      .withMessage('올바른 자격증명 ID 형식이어야 합니다.'),
    validateRequest
  ],
  credentialController.getCredentialWithData
);

// 자격증명 업데이트
router.put('/:credentialId',
  [
    param('credentialId')
      .isUUID()
      .withMessage('올바른 자격증명 ID 형식이어야 합니다.'),
    body('name')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('이름은 1-100자 사이여야 합니다.'),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('설명은 500자 이하여야 합니다.'),
    body('isShared')
      .optional()
      .isBoolean()
      .withMessage('공유 여부는 boolean이어야 합니다.'),
    body('data')
      .optional()
      .isObject()
      .withMessage('자격증명 데이터는 객체여야 합니다.'),
    validateRequest
  ],
  credentialController.updateCredential
);

// 자격증명 삭제
router.delete('/:credentialId',
  [
    param('credentialId')
      .isUUID()
      .withMessage('올바른 자격증명 ID 형식이어야 합니다.'),
    validateRequest
  ],
  credentialController.deleteCredential
);

// 기존 자격증명 테스트
router.post('/:credentialId/test',
  [
    param('credentialId')
      .isUUID()
      .withMessage('올바른 자격증명 ID 형식이어야 합니다.'),
    body('testEndpoint')
      .optional()
      .isURL()
      .withMessage('테스트 엔드포인트는 올바른 URL이어야 합니다.'),
    validateRequest
  ],
  credentialController.testExistingCredential
);

// 자격증명 사용 현황 조회
router.get('/:credentialId/usage',
  [
    param('credentialId')
      .isUUID()
      .withMessage('올바른 자격증명 ID 형식이어야 합니다.'),
    validateRequest
  ],
  credentialController.getCredentialUsage
);

export default router; 