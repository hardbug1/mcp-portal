import { PrismaClient } from '@prisma/client';
import { prisma } from '../config/database.js';
import {
  Credential,
  CredentialType,
  CreateCredentialRequest,
  UpdateCredentialRequest,
  CredentialListQuery,
  CredentialListResponse,
  CredentialWithData,
  CredentialData,
  CredentialUsage,
  TestCredentialRequest,
  TestCredentialResponse,
  CredentialStats
} from '../types/credential.js';
import {
  encryptCredentialData,
  decryptCredentialData,
  maskCredentialData,
  validateEncryptionKey
} from '../utils/encryption.js';

export class CredentialService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
    
    // 암호화 키 검증
    if (!validateEncryptionKey()) {
      console.error('암호화 키 검증 실패');
      throw new Error('암호화 시스템 초기화에 실패했습니다.');
    }
  }

  // 자격증명 생성
  async createCredential(userId: string, data: CreateCredentialRequest): Promise<Credential> {
    // 워크스페이스 접근 권한 확인
    await this.validateWorkspaceAccess(userId, data.workspaceId);

    // 자격증명 데이터 암호화
    const encryptedData = encryptCredentialData(data.data);

    const credential = await this.prisma.credential.create({
      data: {
        name: data.name,
        type: data.type,
        description: data.description,
        workspaceId: data.workspaceId,
        createdById: userId,
        isShared: data.isShared || false,
        encryptedData: encryptedData.encryptedData,
        iv: encryptedData.iv,
        keyId: encryptedData.keyId
      }
    });

    // 액세스 로그 기록
    await this.logCredentialAccess(credential.id, userId, 'CREATE');

    return this.mapToCredential(credential);
  }

  // 자격증명 목록 조회
  async getCredentials(userId: string, query: CredentialListQuery): Promise<CredentialListResponse> {
    const {
      page = 1,
      limit = 20,
      search,
      type,
      workspaceId,
      isShared,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = query;

    const skip = (page - 1) * limit;
    
    const where: any = {
      OR: [
        { createdById: userId }, // 본인이 생성한 자격증명
        { isShared: true } // 공유된 자격증명
      ]
    };

    if (workspaceId) {
      // 워크스페이스 접근 권한 확인
      await this.validateWorkspaceAccess(userId, workspaceId);
      where.workspaceId = workspaceId;
    }

    if (search) {
      where.AND = where.AND || [];
      where.AND.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      });
    }

    if (type) {
      where.type = type;
    }

    if (isShared !== undefined) {
      where.isShared = isShared;
    }

    const [credentials, total] = await Promise.all([
      this.prisma.credential.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit
      }),
      this.prisma.credential.count({ where })
    ]);

    return {
      credentials: credentials.map(c => this.mapToCredential(c)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  // 자격증명 상세 조회
  async getCredentialById(userId: string, credentialId: string): Promise<Credential | null> {
    const credential = await this.prisma.credential.findFirst({
      where: {
        id: credentialId,
        OR: [
          { createdById: userId },
          { isShared: true }
        ]
      }
    });

    if (!credential) return null;

    // 액세스 로그 기록
    await this.logCredentialAccess(credentialId, userId, 'VIEW');

    return this.mapToCredential(credential);
  }

  // 자격증명 데이터와 함께 조회 (복호화)
  async getCredentialWithData(userId: string, credentialId: string): Promise<CredentialWithData | null> {
    const credential = await this.prisma.credential.findFirst({
      where: {
        id: credentialId,
        OR: [
          { createdById: userId },
          { isShared: true }
        ]
      }
    });

    if (!credential) return null;

    // 자격증명 데이터 복호화
    const encryptedData = {
      encryptedData: credential.encryptedData,
      iv: credential.iv,
      keyId: credential.keyId
    };

    const decryptedData = decryptCredentialData(encryptedData);

    // 액세스 로그 기록
    await this.logCredentialAccess(credentialId, userId, 'VIEW');

    return {
      ...this.mapToCredential(credential),
      data: decryptedData
    };
  }

  // 자격증명 업데이트
  async updateCredential(
    userId: string, 
    credentialId: string, 
    data: UpdateCredentialRequest
  ): Promise<Credential> {
    // 권한 확인 (소유자만 수정 가능)
    const existingCredential = await this.prisma.credential.findFirst({
      where: {
        id: credentialId,
        createdById: userId
      }
    });

    if (!existingCredential) {
      throw new Error('자격증명을 찾을 수 없거나 수정 권한이 없습니다.');
    }

    const updateData: any = {
      updatedAt: new Date()
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.isShared !== undefined) updateData.isShared = data.isShared;

    // 자격증명 데이터 업데이트가 있는 경우
    if (data.data) {
      const encryptedData = encryptCredentialData(data.data);
      updateData.encryptedData = encryptedData.encryptedData;
      updateData.iv = encryptedData.iv;
      updateData.keyId = encryptedData.keyId;
    }

    const updatedCredential = await this.prisma.credential.update({
      where: { id: credentialId },
      data: updateData
    });

    // 액세스 로그 기록
    await this.logCredentialAccess(credentialId, userId, 'UPDATE');

    return this.mapToCredential(updatedCredential);
  }

  // 자격증명 삭제
  async deleteCredential(userId: string, credentialId: string): Promise<void> {
    // 권한 확인 (소유자만 삭제 가능)
    const credential = await this.prisma.credential.findFirst({
      where: {
        id: credentialId,
        createdById: userId
      }
    });

    if (!credential) {
      throw new Error('자격증명을 찾을 수 없거나 삭제 권한이 없습니다.');
    }

    // 사용 중인 워크플로우 확인
    const usageCount = await this.getCredentialUsageCount(credentialId);
    if (usageCount > 0) {
      throw new Error('사용 중인 자격증명은 삭제할 수 없습니다.');
    }

    await this.prisma.credential.delete({
      where: { id: credentialId }
    });

    // 액세스 로그 기록
    await this.logCredentialAccess(credentialId, userId, 'DELETE');
  }

  // 자격증명 테스트
  async testCredential(userId: string, data: TestCredentialRequest): Promise<TestCredentialResponse> {
    const startTime = Date.now();

    try {
      switch (data.type) {
        case CredentialType.API_KEY:
          return await this.testApiKey(data.data, data.testEndpoint);
        
        case CredentialType.BASIC_AUTH:
          return await this.testBasicAuth(data.data, data.testEndpoint);
        
        case CredentialType.BEARER_TOKEN:
          return await this.testBearerToken(data.data, data.testEndpoint);
        
        case CredentialType.DATABASE:
          return await this.testDatabase(data.data);
        
        default:
          return {
            success: false,
            message: '이 자격증명 타입은 테스트를 지원하지 않습니다.',
            responseTime: Date.now() - startTime
          };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '테스트 중 오류가 발생했습니다.',
        responseTime: Date.now() - startTime
      };
    }
  }

  // 자격증명 사용 현황 조회
  async getCredentialUsage(credentialId: string): Promise<CredentialUsage[]> {
    // 실제 구현에서는 워크플로우 실행 로그를 분석하여 사용 현황을 추출
    // 여기서는 기본 구조만 제공
    return [];
  }

  // 자격증명 통계 조회
  async getCredentialStats(userId: string, workspaceId?: string): Promise<CredentialStats> {
    const where: any = {
      OR: [
        { createdById: userId },
        { isShared: true }
      ]
    };

    if (workspaceId) {
      where.workspaceId = workspaceId;
    }

    const [
      totalCredentials,
      credentialsByType,
      sharedCredentials,
      privateCredentials
    ] = await Promise.all([
      this.prisma.credential.count({ where }),
      this.prisma.credential.groupBy({
        by: ['type'],
        where,
        _count: true
      }),
      this.prisma.credential.count({
        where: { ...where, isShared: true }
      }),
      this.prisma.credential.count({
        where: { ...where, isShared: false }
      })
    ]);

    const typeStats = credentialsByType.reduce((acc, item) => {
      acc[item.type as CredentialType] = item._count;
      return acc;
    }, {} as Record<CredentialType, number>);

    // 모든 타입에 대해 0으로 초기화
    Object.values(CredentialType).forEach(type => {
      if (!(type in typeStats)) {
        typeStats[type] = 0;
      }
    });

    return {
      totalCredentials,
      credentialsByType: typeStats,
      sharedCredentials,
      privateCredentials,
      recentlyUsed: 0 // 실제 구현에서는 사용 로그를 기반으로 계산
    };
  }

  // === 프라이빗 메서드 ===

  private mapToCredential(credential: any): Credential {
    return {
      id: credential.id,
      name: credential.name,
      type: credential.type as CredentialType,
      description: credential.description,
      workspaceId: credential.workspaceId,
      createdById: credential.createdById,
      isShared: credential.isShared,
      createdAt: credential.createdAt,
      updatedAt: credential.updatedAt
    };
  }

  private async validateWorkspaceAccess(userId: string, workspaceId: string): Promise<void> {
    const workspaceUser = await this.prisma.workspaceUser.findFirst({
      where: {
        userId,
        workspaceId
      }
    });

    if (!workspaceUser) {
      throw new Error('워크스페이스에 접근 권한이 없습니다.');
    }
  }

  private async logCredentialAccess(
    credentialId: string, 
    userId: string, 
    action: 'VIEW' | 'CREATE' | 'UPDATE' | 'DELETE' | 'USE'
  ): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: `CREDENTIAL_${action}`,
          resourceType: 'CREDENTIAL',
          resourceId: credentialId,
          userId,
          metadata: {
            credentialId,
            action
          }
        }
      });
    } catch (error) {
      console.error('자격증명 액세스 로그 기록 실패:', error);
      // 로그 실패는 주요 기능을 방해하지 않음
    }
  }

  private async getCredentialUsageCount(credentialId: string): Promise<number> {
    // 실제 구현에서는 워크플로우 정의에서 자격증명 사용을 검사
    // 여기서는 기본값 반환
    return 0;
  }

  // === 자격증명 테스트 메서드 ===

  private async testApiKey(data: CredentialData, testEndpoint?: string): Promise<TestCredentialResponse> {
    if (!data.apiKey) {
      return { success: false, message: 'API 키가 제공되지 않았습니다.' };
    }

    if (!testEndpoint) {
      return { success: true, message: 'API 키 형식이 유효합니다.' };
    }

    // 실제 API 호출 테스트 (예시)
    try {
      const response = await fetch(testEndpoint, {
        headers: {
          'Authorization': `Bearer ${data.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: response.ok,
        message: response.ok ? 'API 키 테스트 성공' : `HTTP ${response.status}: ${response.statusText}`,
        details: {
          status: response.status,
          statusText: response.statusText
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `연결 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      };
    }
  }

  private async testBasicAuth(data: CredentialData, testEndpoint?: string): Promise<TestCredentialResponse> {
    if (!data.username || !data.password) {
      return { success: false, message: '사용자명과 비밀번호가 필요합니다.' };
    }

    if (!testEndpoint) {
      return { success: true, message: '기본 인증 정보가 유효합니다.' };
    }

    try {
      const credentials = Buffer.from(`${data.username}:${data.password}`).toString('base64');
      const response = await fetch(testEndpoint, {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: response.ok,
        message: response.ok ? '기본 인증 테스트 성공' : `HTTP ${response.status}: ${response.statusText}`,
        details: {
          status: response.status,
          statusText: response.statusText
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `연결 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      };
    }
  }

  private async testBearerToken(data: CredentialData, testEndpoint?: string): Promise<TestCredentialResponse> {
    if (!data.token) {
      return { success: false, message: '토큰이 제공되지 않았습니다.' };
    }

    if (!testEndpoint) {
      return { success: true, message: '토큰 형식이 유효합니다.' };
    }

    try {
      const response = await fetch(testEndpoint, {
        headers: {
          'Authorization': `Bearer ${data.token}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: response.ok,
        message: response.ok ? '토큰 테스트 성공' : `HTTP ${response.status}: ${response.statusText}`,
        details: {
          status: response.status,
          statusText: response.statusText
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `연결 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      };
    }
  }

  private async testDatabase(data: CredentialData): Promise<TestCredentialResponse> {
    if (!data.host || !data.database) {
      return { success: false, message: '호스트와 데이터베이스 이름이 필요합니다.' };
    }

    // 실제 구현에서는 데이터베이스 연결 테스트
    // 여기서는 기본 검증만 수행
    return {
      success: true,
      message: '데이터베이스 연결 정보가 유효합니다.'
    };
  }
} 