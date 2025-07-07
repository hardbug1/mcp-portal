import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { loginUser, clearError } from '../store/slices/authSlice';
import { authService } from '../services/authService';
import type { LoginRequest } from '../types/auth';

const loginSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
  });

  React.useEffect(() => {
    // Clear any existing errors when component mounts
    dispatch(clearError());
  }, [dispatch]);

  const onSubmit = async (data: LoginRequest) => {
    try {
      await dispatch(loginUser(data)).unwrap();
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by the slice
    }
  };

  const handleGoogleLogin = () => {
    authService.loginWithGoogle();
  };

  const handleGitHubLogin = () => {
    authService.loginWithGitHub();
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero section */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Animated background elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-1/3 right-20 w-32 h-32 bg-blue-300/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-purple-300/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        <div className="relative z-10 flex items-center justify-center p-12">
          <div className="text-center text-white space-y-8">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold">M</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                MCP Portal에<br />오신 것을 환영합니다
              </h1>
              <p className="text-xl text-blue-100 max-w-md mx-auto leading-relaxed">
                노코드로 강력한 AI 워크플로우를 만들고 MCP 서버를 쉽게 배포하세요
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-6 max-w-sm mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold">1000+</div>
                <div className="text-sm text-blue-200">워크플로우</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">50+</div>
                <div className="text-sm text-blue-200">통합 서비스</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">99.9%</div>
                <div className="text-sm text-blue-200">가동률</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 max-w-md lg:max-w-lg mx-auto lg:mx-0">
        <div className="w-full space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <h2 className="text-2xl font-bold gradient-text">MCP Portal</h2>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-slate-900">
              로그인
            </h2>
            <p className="text-slate-600">
              계정이 없으신가요?{' '}
              <Link
                to="/register"
                className="font-semibold text-blue-600 hover:text-blue-500 transition-colors duration-200"
              >
                회원가입
              </Link>
            </p>
          </div>

          {/* OAuth 로그인 버튼들 */}
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500 font-medium">소셜 계정으로 빠른 로그인</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex items-center justify-center px-4 py-3 border border-slate-200 rounded-xl shadow-sm bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 hover:shadow-md transition-all duration-200 group"
              >
                <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>

              <button
                type="button"
                onClick={handleGitHubLogin}
                className="flex items-center justify-center px-4 py-3 border border-slate-200 rounded-xl shadow-sm bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 hover:shadow-md transition-all duration-200 group"
              >
                <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </button>
            </div>
          </div>

          {/* 구분선 */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500 font-medium">또는 이메일로 로그인</span>
            </div>
          </div>

          {/* 로그인 폼 */}
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="glass-card border-red-200 bg-red-50/50 p-4 rounded-xl">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div className="text-sm font-medium text-red-800">{error}</div>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="form-label">
                  이메일 주소
                </label>
                <div className="input-group">
                  <svg className="input-group-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                  <input
                    {...register('email')}
                    type="email"
                    autoComplete="email"
                    className="form-input"
                    placeholder="your@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="form-error">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="form-label">
                  비밀번호
                </label>
                <div className="input-group">
                  <svg className="input-group-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    {...register('password')}
                    type="password"
                    autoComplete="current-password"
                    className="form-input"
                    placeholder="비밀번호를 입력하세요"
                  />
                </div>
                {errors.password && (
                  <p className="form-error">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700">
                  로그인 상태 유지
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
                  비밀번호 찾기
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary group"
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner h-5 w-5 mr-3"></div>
                  로그인 중...
                </>
              ) : (
                <>
                  로그인
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-xs text-slate-500">
              로그인하시면 MCP Portal의{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500">이용약관</a>과{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500">개인정보처리방침</a>에 동의하는 것으로 간주됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 