import { Request, Response } from 'express';
import { CredentialService } from '../services/credential.service.js';
import {
  CreateCredentialRequest,
  UpdateCredentialRequest,
  CredentialListQuery,
  TestCredentialRequest,
  CredentialType
} from '../types/credential.js';
import { AuthenticatedRequest } from '../types/express.js';
import { maskCredentialData } from '../utils/encryption.js';

export class CredentialController {
  private credentialService: CredentialService;

  constructor() {
    this.credentialService = new CredentialService();
  }

  // 자격증명 생성
  createCredential = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const credentialData: CreateCredentialRequest = req.body;

      const credential = await this.credentialService.createCredential(userId, credentialData);

      res.status(201).json({
        success: true,
        message: '자격증명이 성공적으로 생성되었습니다.',
        data: { credential }
      });
    } catch (error) {
      console.error('자격증명 생성 오류:', error);
      
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: '자격증명 생성 중 오류가 발생했습니다.'
        });
      }
    }
  };

  // 자격증명 목록 조회
  getCredentials = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const query: CredentialListQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        search: req.query.search as string,
        type: req.query.type as CredentialType,
        workspaceId: req.query.workspaceId as string,
        isShared: req.query.isShared === 'true' ? true : req.query.isShared === 'false' ? false : undefined,
        sortBy: req.query.sortBy as any || 'createdAt',
        sortOrder: req.query.sortOrder as any || 'desc'
      };

      const result = await this.credentialService.getCredentials(userId, query);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('자격증명 목록 조회 오류:', error);
      
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: '자격증명 목록 조회 중 오류가 발생했습니다.'
        });
      }
    }
  };

  // 자격증명 상세 조회
  getCredentialById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { credentialId } = req.params;

      const credential = await this.credentialService.getCredentialById(userId, credentialId);

      if (!credential) {
        res.status(404).json({
          success: false,
          message: '자격증명을 찾을 수 없습니다.'
        });
        return;
      }

      res.json({
        success: true,
        data: { credential }
      });
    } catch (error) {
      console.error('자격증명 조회 오류:', error);
      
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: '자격증명 조회 중 오류가 발생했습니다.'
        });
      }
    }
  };

  // 자격증명 데이터와 함께 조회 (마스킹된 데이터)
  getCredentialWithData = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { credentialId } = req.params;

      const credentialWithData = await this.credentialService.getCredentialWithData(userId, credentialId);

      if (!credentialWithData) {
        res.status(404).json({
          success: false,
          message: '자격증명을 찾을 수 없습니다.'
        });
        return;
      }

      // 민감한 데이터 마스킹
      const maskedData = maskCredentialData(credentialWithData.data);

      res.json({
        success: true,
        data: {
          credential: {
            ...credentialWithData,
            data: maskedData
          }
        }
      });
    } catch (error) {
      console.error('자격증명 데이터 조회 오류:', error);
      
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: '자격증명 데이터 조회 중 오류가 발생했습니다.'
        });
      }
    }
  };

  // 자격증명 업데이트
  updateCredential = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { credentialId } = req.params;
      const updateData: UpdateCredentialRequest = req.body;

      const updatedCredential = await this.credentialService.updateCredential(
        userId, 
        credentialId, 
        updateData
      );

      res.json({
        success: true,
        message: '자격증명이 성공적으로 업데이트되었습니다.',
        data: { credential: updatedCredential }
      });
    } catch (error) {
      console.error('자격증명 업데이트 오류:', error);
      
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: '자격증명 업데이트 중 오류가 발생했습니다.'
        });
      }
    }
  };

  // 자격증명 삭제
  deleteCredential = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { credentialId } = req.params;

      await this.credentialService.deleteCredential(userId, credentialId);

      res.json({
        success: true,
        message: '자격증명이 성공적으로 삭제되었습니다.'
      });
    } catch (error) {
      console.error('자격증명 삭제 오류:', error);
      
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: '자격증명 삭제 중 오류가 발생했습니다.'
        });
      }
    }
  };

  // 자격증명 테스트
  testCredential = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const testData: TestCredentialRequest = req.body;

      const testResult = await this.credentialService.testCredential(userId, testData);

      res.json({
        success: true,
        data: { testResult }
      });
    } catch (error) {
      console.error('자격증명 테스트 오류:', error);
      
      res.status(500).json({
        success: false,
        message: '자격증명 테스트 중 오류가 발생했습니다.'
      });
    }
  };

  // 기존 자격증명 테스트
  testExistingCredential = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { credentialId } = req.params;
      const { testEndpoint } = req.body;

      // 자격증명 데이터 가져오기
      const credentialWithData = await this.credentialService.getCredentialWithData(userId, credentialId);

      if (!credentialWithData) {
        res.status(404).json({
          success: false,
          message: '자격증명을 찾을 수 없습니다.'
        });
        return;
      }

      // 테스트 수행
      const testResult = await this.credentialService.testCredential(userId, {
        type: credentialWithData.type,
        data: credentialWithData.data,
        testEndpoint
      });

      res.json({
        success: true,
        data: { testResult }
      });
    } catch (error) {
      console.error('기존 자격증명 테스트 오류:', error);
      
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: '자격증명 테스트 중 오류가 발생했습니다.'
        });
      }
    }
  };

  // 자격증명 사용 현황 조회
  getCredentialUsage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { credentialId } = req.params;

      const usage = await this.credentialService.getCredentialUsage(credentialId);

      res.json({
        success: true,
        data: { usage }
      });
    } catch (error) {
      console.error('자격증명 사용 현황 조회 오류:', error);
      
      res.status(500).json({
        success: false,
        message: '자격증명 사용 현황 조회 중 오류가 발생했습니다.'
      });
    }
  };

  // 자격증명 통계 조회
  getCredentialStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const workspaceId = req.query.workspaceId as string;

      const stats = await this.credentialService.getCredentialStats(userId, workspaceId);

      res.json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      console.error('자격증명 통계 조회 오류:', error);
      
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: '자격증명 통계 조회 중 오류가 발생했습니다.'
        });
      }
    }
  };

  // 자격증명 타입 목록 조회
  getCredentialTypes = async (req: Request, res: Response): Promise<void> => {
    try {
      const types = Object.values(CredentialType).map(type => ({
        value: type,
        label: this.getCredentialTypeLabel(type),
        description: this.getCredentialTypeDescription(type)
      }));

      res.json({
        success: true,
        data: { types }
      });
    } catch (error) {
      console.error('자격증명 타입 조회 오류:', error);
      
      res.status(500).json({
        success: false,
        message: '자격증명 타입 조회 중 오류가 발생했습니다.'
      });
    }
  };

  // === 프라이빗 메서드 ===

  private getCredentialTypeLabel(type: CredentialType): string {
    const labels: Record<CredentialType, string> = {
      [CredentialType.API_KEY]: 'API 키',
      [CredentialType.OAUTH2]: 'OAuth 2.0',
      [CredentialType.BASIC_AUTH]: '기본 인증',
      [CredentialType.BEARER_TOKEN]: 'Bearer 토큰',
      [CredentialType.SSH_KEY]: 'SSH 키',
      [CredentialType.DATABASE]: '데이터베이스',
      [CredentialType.WEBHOOK]: '웹훅',
      [CredentialType.CUSTOM]: '사용자 정의'
    };

    return labels[type] || type;
  }

  private getCredentialTypeDescription(type: CredentialType): string {
    const descriptions: Record<CredentialType, string> = {
      [CredentialType.API_KEY]: 'API 키를 사용한 인증',
      [CredentialType.OAUTH2]: 'OAuth 2.0 프로토콜을 사용한 인증',
      [CredentialType.BASIC_AUTH]: 'HTTP 기본 인증 (사용자명/비밀번호)',
      [CredentialType.BEARER_TOKEN]: 'Bearer 토큰을 사용한 인증',
      [CredentialType.SSH_KEY]: 'SSH 키 기반 인증',
      [CredentialType.DATABASE]: '데이터베이스 연결 정보',
      [CredentialType.WEBHOOK]: '웹훅 URL 및 헤더',
      [CredentialType.CUSTOM]: '사용자 정의 자격증명'
    };

    return descriptions[type] || '';
  }
}