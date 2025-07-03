import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('비밀번호는 최소 8자 이상이어야 합니다.');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('비밀번호에는 대문자가 포함되어야 합니다.');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('비밀번호에는 소문자가 포함되어야 합니다.');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('비밀번호에는 숫자가 포함되어야 합니다.');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('비밀번호에는 특수문자가 포함되어야 합니다.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}; 