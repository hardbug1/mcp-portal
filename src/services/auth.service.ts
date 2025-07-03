import { User } from '@prisma/client';
import { prisma } from '../config/database.js';
import { hashPassword, comparePassword, validatePassword } from '../utils/password.js';
import { generateTokens, generatePasswordResetToken, verifyPasswordResetToken } from '../utils/jwt.js';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  OAuthProfile,
  ChangePasswordRequest,
  ResetPasswordRequest,
  ResetPasswordConfirmRequest
} from '../types/auth.js';

export class AuthService {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const { email, password, name } = data;

    // 이메일 중복 확인
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('이미 등록된 이메일입니다.');
    }

    // 비밀번호 유효성 검사
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors.join(' '));
    }

    // 비밀번호 해싱
    const passwordHash = await hashPassword(password);

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        emailVerified: false,
      },
    });

    // 토큰 생성
    const { accessToken, refreshToken } = generateTokens({
      userId: user.id,
      email: user.email,
    });

    // 리프레시 토큰 저장
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return {
      user: this.sanitizeUser(user),
      token: accessToken,
      refreshToken,
    };
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const { email, password } = data;

    // 사용자 조회
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    // 비밀번호 확인
    if (!user.passwordHash) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
    
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    // 토큰 생성
    const { accessToken, refreshToken } = generateTokens({
      userId: user.id,
      email: user.email,
    });

    // 리프레시 토큰 저장
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        refreshToken,
        lastLoginAt: new Date(),
      },
    });

    return {
      user: this.sanitizeUser(user),
      token: accessToken,
      refreshToken,
    };
  }

  async oauthLogin(profile: OAuthProfile): Promise<AuthResponse> {
    const { email, name, avatarUrl, provider } = profile;

    // 기존 사용자 조회
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // 새 사용자 생성
      user = await prisma.user.create({
        data: {
          email,
          name,
          avatarUrl,
          emailVerified: true,
          oauthProvider: provider,
          passwordHash: '', // OAuth 사용자는 비밀번호 없음
        },
      });
    } else {
      // 기존 사용자 정보 업데이트
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          avatarUrl,
          lastLoginAt: new Date(),
          oauthProvider: provider,
        },
      });
    }

    // 토큰 생성
    const { accessToken, refreshToken } = generateTokens({
      userId: user.id,
      email: user.email,
    });

    // 리프레시 토큰 저장
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return {
      user: this.sanitizeUser(user),
      token: accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    // 리프레시 토큰으로 사용자 조회
    const user = await prisma.user.findFirst({
      where: { refreshToken },
    });

    if (!user) {
      throw new Error('유효하지 않은 리프레시 토큰입니다.');
    }

    // 새 토큰 생성
    const { accessToken, refreshToken: newRefreshToken } = generateTokens({
      userId: user.id,
      email: user.email,
    });

    // 리프레시 토큰 업데이트
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    return {
      user: this.sanitizeUser(user),
      token: accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async changePassword(userId: string, data: ChangePasswordRequest): Promise<void> {
    const { currentPassword, newPassword } = data;

    // 사용자 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    // 현재 비밀번호 확인
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new Error('현재 비밀번호가 올바르지 않습니다.');
    }

    // 새 비밀번호 유효성 검사
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors.join(' '));
    }

    // 새 비밀번호 해싱
    const newPasswordHash = await hashPassword(newPassword);

    // 비밀번호 업데이트
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });
  }

  async requestPasswordReset(data: ResetPasswordRequest): Promise<string> {
    const { email } = data;

    // 사용자 조회
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('해당 이메일로 등록된 사용자가 없습니다.');
    }

    // 비밀번호 재설정 토큰 생성
    const resetToken = generatePasswordResetToken(email);

    // 토큰을 데이터베이스에 저장 (선택사항)
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        passwordResetToken: resetToken,
        passwordResetTokenExpiry: new Date(Date.now() + 3600000), // 1시간 후 만료
      },
    });

    return resetToken;
  }

  async confirmPasswordReset(data: ResetPasswordConfirmRequest): Promise<void> {
    const { token, newPassword } = data;

    // 토큰 검증
    const { email } = verifyPasswordResetToken(token);

    // 사용자 조회
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.passwordResetToken !== token) {
      throw new Error('유효하지 않은 비밀번호 재설정 토큰입니다.');
    }

    // 토큰 만료 확인
    if (user.passwordResetTokenExpiry && user.passwordResetTokenExpiry < new Date()) {
      throw new Error('비밀번호 재설정 토큰이 만료되었습니다.');
    }

    // 새 비밀번호 유효성 검사
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors.join(' '));
    }

    // 새 비밀번호 해싱
    const newPasswordHash = await hashPassword(newPassword);

    // 비밀번호 업데이트 및 토큰 제거
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        passwordHash: newPasswordHash,
        passwordResetToken: null,
        passwordResetTokenExpiry: null,
      },
    });
  }

  async logout(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  async getUserById(userId: string): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    return user ? this.sanitizeUser(user) : null;
  }

  private sanitizeUser(user: User): Omit<User, 'passwordHash'> {
    const { passwordHash, ...sanitizedUser } = user;
    return sanitizedUser;
  }
} 