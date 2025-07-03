import { Request, Response, NextFunction } from 'express';
import { body, validationResult, param, query } from 'express-validator';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: '입력 데이터가 유효하지 않습니다.',
      details: errors.array(),
    });
  }
  next();
};

export const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('유효한 이메일 주소를 입력해주세요.'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('비밀번호는 최소 8자 이상이어야 합니다.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('비밀번호는 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('이름은 2자 이상 50자 이하로 입력해주세요.'),
  validateRequest,
];

export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('유효한 이메일 주소를 입력해주세요.'),
  body('password')
    .notEmpty()
    .withMessage('비밀번호를 입력해주세요.'),
  validateRequest,
];

export const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('현재 비밀번호를 입력해주세요.'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('새 비밀번호는 최소 8자 이상이어야 합니다.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('새 비밀번호는 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.'),
  validateRequest,
];

export const resetPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('유효한 이메일 주소를 입력해주세요.'),
  validateRequest,
];

export const resetPasswordConfirmValidation = [
  body('token')
    .notEmpty()
    .withMessage('재설정 토큰이 필요합니다.'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('새 비밀번호는 최소 8자 이상이어야 합니다.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('새 비밀번호는 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.'),
  validateRequest,
];

// 인증 관련 검증
export const validateRegister = [
  body('email')
    .isEmail()
    .withMessage('유효한 이메일 주소를 입력해주세요.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('비밀번호는 최소 8자 이상이어야 합니다.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('비밀번호는 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('이름은 2-50자 사이여야 합니다.'),
];

export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('유효한 이메일 주소를 입력해주세요.')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('비밀번호를 입력해주세요.'),
];

// 워크플로우 관련 검증
export const validateCreateWorkflow = [
  body('workspaceId')
    .isString()
    .notEmpty()
    .withMessage('워크스페이스 ID가 필요합니다.'),
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('워크플로우 이름은 1-100자 사이여야 합니다.'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('설명은 최대 500자까지 가능합니다.'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('태그는 배열 형태여야 합니다.')
    .custom((tags) => {
      if (tags && tags.length > 10) {
        throw new Error('태그는 최대 10개까지 가능합니다.');
      }
      if (tags && tags.some((tag: any) => typeof tag !== 'string' || tag.length > 30)) {
        throw new Error('각 태그는 문자열이며 30자 이하여야 합니다.');
      }
      return true;
    }),
  body('definition')
    .optional()
    .isObject()
    .withMessage('워크플로우 정의는 객체 형태여야 합니다.')
    .custom((definition) => {
      if (definition) {
        if (!definition.nodes || !Array.isArray(definition.nodes)) {
          throw new Error('워크플로우 정의에는 nodes 배열이 필요합니다.');
        }
        if (!definition.connections || !Array.isArray(definition.connections)) {
          throw new Error('워크플로우 정의에는 connections 배열이 필요합니다.');
        }
        if (!definition.metadata || typeof definition.metadata !== 'object') {
          throw new Error('워크플로우 정의에는 metadata 객체가 필요합니다.');
        }
      }
      return true;
    }),
];

export const validateUpdateWorkflow = [
  param('id')
    .isString()
    .notEmpty()
    .withMessage('워크플로우 ID가 필요합니다.'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('워크플로우 이름은 1-100자 사이여야 합니다.'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('설명은 최대 500자까지 가능합니다.'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('태그는 배열 형태여야 합니다.')
    .custom((tags) => {
      if (tags && tags.length > 10) {
        throw new Error('태그는 최대 10개까지 가능합니다.');
      }
      if (tags && tags.some((tag: any) => typeof tag !== 'string' || tag.length > 30)) {
        throw new Error('각 태그는 문자열이며 30자 이하여야 합니다.');
      }
      return true;
    }),
  body('status')
    .optional()
    .isIn(['draft', 'active', 'paused', 'archived'])
    .withMessage('상태는 draft, active, paused, archived 중 하나여야 합니다.'),
  body('definition')
    .optional()
    .isObject()
    .withMessage('워크플로우 정의는 객체 형태여야 합니다.')
    .custom((definition) => {
      if (definition) {
        if (!definition.nodes || !Array.isArray(definition.nodes)) {
          throw new Error('워크플로우 정의에는 nodes 배열이 필요합니다.');
        }
        if (!definition.connections || !Array.isArray(definition.connections)) {
          throw new Error('워크플로우 정의에는 connections 배열이 필요합니다.');
        }
        if (!definition.metadata || typeof definition.metadata !== 'object') {
          throw new Error('워크플로우 정의에는 metadata 객체가 필요합니다.');
        }
      }
      return true;
    }),
];

export const validateWorkflowId = [
  param('id')
    .isString()
    .notEmpty()
    .withMessage('워크플로우 ID가 필요합니다.'),
];

export const validateWorkflowQuery = [
  query('workspaceId')
    .optional()
    .isString()
    .withMessage('워크스페이스 ID는 문자열이어야 합니다.'),
  query('status')
    .optional()
    .isIn(['draft', 'active', 'paused', 'archived'])
    .withMessage('상태는 draft, active, paused, archived 중 하나여야 합니다.'),
  query('tags')
    .optional()
    .isString()
    .withMessage('태그는 쉼표로 구분된 문자열이어야 합니다.'),
  query('search')
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage('검색어는 최대 100자까지 가능합니다.'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('페이지는 1 이상의 정수여야 합니다.'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('제한 수는 1-100 사이의 정수여야 합니다.'),
  query('sortBy')
    .optional()
    .isIn(['name', 'createdAt', 'updatedAt', 'lastExecutedAt'])
    .withMessage('정렬 기준은 name, createdAt, updatedAt, lastExecutedAt 중 하나여야 합니다.'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('정렬 순서는 asc 또는 desc여야 합니다.'),
];

export const validateExecuteWorkflow = [
  param('id')
    .isString()
    .notEmpty()
    .withMessage('워크플로우 ID가 필요합니다.'),
  body('inputData')
    .optional()
    .isObject()
    .withMessage('입력 데이터는 객체 형태여야 합니다.'),
  body('triggerType')
    .optional()
    .isString()
    .isLength({ max: 50 })
    .withMessage('트리거 타입은 최대 50자까지 가능합니다.'),
];

export const validateDuplicateWorkflow = [
  param('id')
    .isString()
    .notEmpty()
    .withMessage('워크플로우 ID가 필요합니다.'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('워크플로우 이름은 1-100자 사이여야 합니다.'),
];

// 노드 관련 검증
export const validateCreateNode = [
  body('workflowId')
    .isString()
    .notEmpty()
    .withMessage('워크플로우 ID가 필요합니다.'),
  body('templateId')
    .isString()
    .notEmpty()
    .withMessage('노드 템플릿 ID가 필요합니다.'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('노드 이름은 1-100자 사이여야 합니다.'),
  body('position')
    .isObject()
    .withMessage('노드 위치는 객체 형태여야 합니다.')
    .custom((position) => {
      if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
        throw new Error('노드 위치는 x, y 좌표를 포함해야 합니다.');
      }
      return true;
    }),
  body('config')
    .optional()
    .isObject()
    .withMessage('노드 설정은 객체 형태여야 합니다.'),
];

export const validateUpdateNode = [
  param('workflowId')
    .isString()
    .notEmpty()
    .withMessage('워크플로우 ID가 필요합니다.'),
  param('nodeId')
    .isString()
    .notEmpty()
    .withMessage('노드 ID가 필요합니다.'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('노드 이름은 1-100자 사이여야 합니다.'),
  body('position')
    .optional()
    .isObject()
    .withMessage('노드 위치는 객체 형태여야 합니다.')
    .custom((position) => {
      if (position && (typeof position.x !== 'number' || typeof position.y !== 'number')) {
        throw new Error('노드 위치는 x, y 좌표를 포함해야 합니다.');
      }
      return true;
    }),
  body('config')
    .optional()
    .isObject()
    .withMessage('노드 설정은 객체 형태여야 합니다.'),
];

export const validateNodeParams = [
  param('workflowId')
    .isString()
    .notEmpty()
    .withMessage('워크플로우 ID가 필요합니다.'),
  param('nodeId')
    .isString()
    .notEmpty()
    .withMessage('노드 ID가 필요합니다.'),
];

export const validateTemplateId = [
  param('templateId')
    .isString()
    .notEmpty()
    .withMessage('템플릿 ID가 필요합니다.'),
];

export const validateNodeTemplateQuery = [
  query('category')
    .optional()
    .isString()
    .withMessage('카테고리는 문자열이어야 합니다.'),
  query('type')
    .optional()
    .isString()
    .withMessage('타입은 문자열이어야 합니다.'),
  query('search')
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage('검색어는 최대 100자까지 가능합니다.'),
  query('tags')
    .optional()
    .isString()
    .withMessage('태그는 쉼표로 구분된 문자열이어야 합니다.'),
  query('includeDeprecated')
    .optional()
    .isBoolean()
    .withMessage('includeDeprecated는 불린값이어야 합니다.'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('페이지는 1 이상의 정수여야 합니다.'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('제한 수는 1-100 사이의 정수여야 합니다.'),
];

export const validateNodeConfig = [
  param('templateId')
    .isString()
    .notEmpty()
    .withMessage('템플릿 ID가 필요합니다.'),
  body('config')
    .isObject()
    .withMessage('노드 설정은 객체 형태여야 합니다.'),
]; 