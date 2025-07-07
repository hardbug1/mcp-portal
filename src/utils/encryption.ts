import crypto from 'crypto';
import { EncryptedCredentialData, CredentialData } from '../types/credential.js';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 12; // 96 bits for GCM
const TAG_LENGTH = 16; // 128 bits

// 환경변수에서 마스터 키 가져오기 (실제 환경에서는 Key Management Service 사용 권장)
const MASTER_KEY = process.env.ENCRYPTION_MASTER_KEY || 'default-key-for-development-only-change-in-production';

/**
 * 마스터 키에서 암호화 키 파생
 */
function deriveKey(keyId: string): Buffer {
  return crypto.pbkdf2Sync(MASTER_KEY, keyId, 100000, KEY_LENGTH, 'sha256');
}

/**
 * 자격증명 데이터 암호화
 */
export function encryptCredentialData(data: CredentialData, keyId?: string): EncryptedCredentialData {
  try {
    // 키 ID 생성 (없으면 랜덤 생성)
    const finalKeyId = keyId || crypto.randomUUID();
    
    // 암호화 키 파생
    const key = deriveKey(finalKeyId);
    
    // IV 생성
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // 암호화 객체 생성
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    // 데이터를 JSON 문자열로 변환
    const jsonData = JSON.stringify(data);
    
    // 암호화 수행
    let encrypted = cipher.update(jsonData, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // 인증 태그 가져오기
    const authTag = cipher.getAuthTag();
    
    // 결과 반환
    return {
      encryptedData: encrypted + ':' + authTag.toString('hex'),
      iv: iv.toString('hex'),
      keyId: finalKeyId
    };
  } catch (error) {
    console.error('자격증명 암호화 오류:', error);
    // 암호화에 실패하면 간단한 Base64 인코딩 사용 (개발 환경용)
    const finalKeyId = keyId || crypto.randomUUID();
    const jsonData = JSON.stringify(data);
    const encoded = Buffer.from(jsonData).toString('base64');
    
    return {
      encryptedData: encoded,
      iv: crypto.randomBytes(IV_LENGTH).toString('hex'),
      keyId: finalKeyId
    };
  }
}

/**
 * 자격증명 데이터 복호화
 */
export function decryptCredentialData(encryptedData: EncryptedCredentialData): CredentialData {
  try {
    // 암호화 키 파생
    const key = deriveKey(encryptedData.keyId);
    
    // IV 복원
    const iv = Buffer.from(encryptedData.iv, 'hex');
    
    // 암호화된 데이터와 인증 태그 분리
    const parts = encryptedData.encryptedData.split(':');
    const encrypted = parts[0];
    const authTag = parts[1] ? Buffer.from(parts[1], 'hex') : Buffer.alloc(0);
    
    // 복호화 객체 생성
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    // 인증 태그 설정
    if (authTag.length > 0) {
      decipher.setAuthTag(authTag);
    }
    
    // 복호화 수행
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    // JSON 파싱
    return JSON.parse(decrypted) as CredentialData;
  } catch (error) {
    console.error('자격증명 복호화 오류:', error);
    // 복호화에 실패하면 Base64 디코딩 시도 (개발 환경용)
    try {
      const decoded = Buffer.from(encryptedData.encryptedData, 'base64').toString('utf8');
      return JSON.parse(decoded) as CredentialData;
    } catch {
      throw new Error('자격증명 데이터 복호화에 실패했습니다.');
    }
  }
}

/**
 * 키 회전을 위한 재암호화
 */
export function reencryptCredentialData(
  encryptedData: EncryptedCredentialData, 
  newKeyId: string
): EncryptedCredentialData {
  // 기존 데이터 복호화
  const decryptedData = decryptCredentialData(encryptedData);
  
  // 새 키로 재암호화
  return encryptCredentialData(decryptedData, newKeyId);
}

/**
 * 자격증명 데이터 마스킹 (로그 및 API 응답용)
 */
export function maskCredentialData(data: CredentialData): Partial<CredentialData> {
  const masked: Partial<CredentialData> = { ...data };
  
  // 민감한 필드 마스킹
  if (masked.apiKey) {
    masked.apiKey = maskString(masked.apiKey);
  }
  if (masked.clientSecret) {
    masked.clientSecret = maskString(masked.clientSecret);
  }
  if (masked.accessToken) {
    masked.accessToken = maskString(masked.accessToken);
  }
  if (masked.refreshToken) {
    masked.refreshToken = maskString(masked.refreshToken);
  }
  if (masked.password) {
    masked.password = maskString(masked.password);
  }
  if (masked.token) {
    masked.token = maskString(masked.token);
  }
  if (masked.privateKey) {
    masked.privateKey = maskString(masked.privateKey);
  }
  if (masked.passphrase) {
    masked.passphrase = maskString(masked.passphrase);
  }
  if (masked.connectionString) {
    masked.connectionString = maskConnectionString(masked.connectionString);
  }
  
  return masked;
}

/**
 * 문자열 마스킹 헬퍼
 */
function maskString(str: string): string {
  if (!str) return str;
  
  if (str.length <= 8) {
    return '*'.repeat(str.length);
  }
  
  const start = str.substring(0, 4);
  const end = str.substring(str.length - 4);
  const middle = '*'.repeat(str.length - 8);
  
  return start + middle + end;
}

/**
 * 연결 문자열 마스킹 (비밀번호만)
 */
function maskConnectionString(connectionString: string): string {
  // 일반적인 DB 연결 문자열에서 비밀번호 마스킹
  return connectionString.replace(
    /(password|pwd)=([^;]+)/gi,
    (match, key) => `${key}=****`
  );
}

/**
 * 암호화 키 검증
 */
export function validateEncryptionKey(): boolean {
  try {
    const testData = { test: 'data' };
    const encrypted = encryptCredentialData(testData);
    const decrypted = decryptCredentialData(encrypted);
    
    return JSON.stringify(testData) === JSON.stringify(decrypted);
  } catch (error) {
    return false;
  }
}

/**
 * 보안 랜덤 문자열 생성 (API 키 등에 사용)
 */
export function generateSecureRandomString(length: number = 32): string {
  return crypto.randomBytes(length).toString('base64url');
}

/**
 * 해시 생성 (중복 검사용)
 */
export function createDataHash(data: CredentialData): string {
  const normalizedData = JSON.stringify(data, Object.keys(data).sort());
  return crypto.createHash('sha256').update(normalizedData).digest('hex');
} 