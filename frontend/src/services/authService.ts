import apiService from './api';
import type { AuthResponse, LoginRequest, RegisterRequest, UserProfile } from '../types/auth';

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return apiService.post<AuthResponse>('/auth/login', credentials);
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return apiService.post<AuthResponse>('/auth/register', userData);
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    return apiService.post<{ accessToken: string }>('/auth/refresh', { refreshToken });
  }

  async getUserProfile(): Promise<UserProfile> {
    return apiService.get<UserProfile>('/auth/me');
  }

  async logout(): Promise<void> {
    await apiService.post('/auth/logout');
  }

  // OAuth 로그인 메서드들
  loginWithGoogle(): void {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    window.location.href = `${baseUrl}/auth/google`;
  }

  loginWithGitHub(): void {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    window.location.href = `${baseUrl}/auth/github`;
  }

  // OAuth 콜백 처리 (URL에서 토큰 추출)
  handleOAuthCallback(): { accessToken?: string; refreshToken?: string; error?: string } {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('token');
    const refreshToken = urlParams.get('refreshToken');
    const error = urlParams.get('error');

    if (error) {
      return { error: decodeURIComponent(error) };
    }

    if (accessToken && refreshToken) {
      // URL에서 토큰 파라미터 제거
      window.history.replaceState({}, document.title, window.location.pathname);
      return { accessToken, refreshToken };
    }

    return {};
  }
}

export const authService = new AuthService();
export default authService; 