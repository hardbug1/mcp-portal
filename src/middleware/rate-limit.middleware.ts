import rateLimit from 'express-rate-limit';

// 일반 API 요청 제한
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 최대 100개 요청
  message: {
    error: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 로그인 시도 제한
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5, // 최대 5번 시도
  message: {
    error: '로그인 시도가 너무 많습니다. 15분 후 다시 시도해주세요.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// 회원가입 제한
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1시간
  max: 3, // 최대 3번 시도
  message: {
    error: '회원가입 시도가 너무 많습니다. 1시간 후 다시 시도해주세요.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 비밀번호 재설정 제한
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1시간
  max: 3, // 최대 3번 시도
  message: {
    error: '비밀번호 재설정 요청이 너무 많습니다. 1시간 후 다시 시도해주세요.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 워크플로우 실행 제한
export const workflowExecutionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: 10, // 최대 10번 실행
  message: {
    error: '워크플로우 실행 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
  },
  standardHeaders: true,
  legacyHeaders: false,
}); 