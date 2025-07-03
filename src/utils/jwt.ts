import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { JwtPayload } from '../types/auth.js';

export const generateTokens = (payload: JwtPayload) => {
  const accessToken = jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  } as jwt.SignOptions);

  const refreshToken = jwt.sign(payload, config.refreshTokenSecret, {
    expiresIn: config.refreshTokenExpiresIn,
  } as jwt.SignOptions);

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, config.jwtSecret) as JwtPayload;
  } catch (error) {
    throw new Error('Invalid access token');
  }
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, config.refreshTokenSecret) as JwtPayload;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

export const generatePasswordResetToken = (email: string): string => {
  return jwt.sign({ email }, config.jwtSecret, {
    expiresIn: '1h',
  });
};

export const verifyPasswordResetToken = (token: string): { email: string } => {
  try {
    return jwt.verify(token, config.jwtSecret) as { email: string };
  } catch (error) {
    throw new Error('Invalid or expired password reset token');
  }
}; 