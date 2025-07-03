import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { 
  registerValidation, 
  loginValidation 
} from '../middleware/validation.middleware.js';
import { 
  loginLimiter, 
  registerLimiter
} from '../middleware/rate-limit.middleware.js';

const router = Router();
const authController = new AuthController();

// 회원가입
router.post('/register', registerLimiter, registerValidation, (req, res) => authController.register(req, res));

// 로그인
router.post('/login', loginLimiter, loginValidation, (req, res) => authController.login(req, res));

// 로그아웃
router.post('/logout', authenticateToken, (req, res) => authController.logout(req, res));

// 프로필 조회
router.get('/profile', authenticateToken, (req, res) => authController.getProfile(req, res));

export default router; 