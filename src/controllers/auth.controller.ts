import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { 
  LoginRequest, 
  RegisterRequest, 
  ChangePasswordRequest,
  ResetPasswordRequest,
  ResetPasswordConfirmRequest,
  RefreshTokenRequest
} from '../types/auth.js';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const data: RegisterRequest = req.body;
      const result = await authService.register(data);
      
      res.status(201).json({
        message: '회원가입이 완료되었습니다.',
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : '회원가입에 실패했습니다.',
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const data: LoginRequest = req.body;
      const result = await authService.login(data);
      
      res.json({
        message: '로그인이 완료되었습니다.',
        data: result,
      });
    } catch (error) {
      res.status(401).json({
        error: error instanceof Error ? error.message : '로그인에 실패했습니다.',
      });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        res.status(400).json({ error: '리프레시 토큰이 필요합니다.' });
        return;
      }

      const result = await authService.refreshToken(refreshToken);
      
      res.json({
        message: '토큰이 갱신되었습니다.',
        data: result,
      });
    } catch (error) {
      res.status(401).json({
        error: error instanceof Error ? error.message : '토큰 갱신에 실패했습니다.',
      });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: '인증이 필요합니다.' });
        return;
      }

      await authService.logout(req.user.id);
      
      res.json({
        message: '로그아웃이 완료되었습니다.',
      });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : '로그아웃에 실패했습니다.',
      });
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: '인증이 필요합니다.' });
        return;
      }

      res.json({
        message: '프로필 정보를 가져왔습니다.',
        data: { user: req.user },
      });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : '프로필 정보를 가져오는데 실패했습니다.',
      });
    }
  }
} 