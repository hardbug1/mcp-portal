import apiService from './api';

export interface Credential {
  id: string;
  name: string;
  type: CredentialType;
  description?: string;
  isActive: boolean;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
  // 실제 데이터는 마스킹되어 반환됨
  maskedData?: Record<string, any>;
  usageCount?: number;
}

export type CredentialType = 
  | 'api_key'
  | 'oauth2'
  | 'basic_auth'
  | 'database'
  | 'ssh_key'
  | 'certificate'
  | 'webhook'
  | 'custom';

export interface CreateCredentialRequest {
  name: string;
  type: CredentialType;
  description?: string;
  data: Record<string, any>;
}

export interface UpdateCredentialRequest {
  name?: string;
  description?: string;
  data?: Record<string, any>;
  isActive?: boolean;
}

export interface CredentialTestRequest {
  credentialId: string;
  testType?: 'connection' | 'authentication' | 'query';
  testParams?: Record<string, any>;
}

export interface CredentialTestResult {
  success: boolean;
  message: string;
  details?: Record<string, any>;
  responseTime?: number;
}

export interface CredentialStats {
  totalCredentials: number;
  activeCredentials: number;
  credentialsByType: Record<CredentialType, number>;
  recentlyUsed: Credential[];
  totalUsage: number;
}

class CredentialService {
  async getCredentials(): Promise<Credential[]> {
    return apiService.get<Credential[]>('/credentials');
  }

  async getCredential(id: string): Promise<Credential> {
    return apiService.get<Credential>(`/credentials/${id}`);
  }

  async createCredential(data: CreateCredentialRequest): Promise<Credential> {
    return apiService.post<Credential>('/credentials', data);
  }

  async updateCredential(id: string, data: UpdateCredentialRequest): Promise<Credential> {
    return apiService.put<Credential>(`/credentials/${id}`, data);
  }

  async deleteCredential(id: string): Promise<void> {
    return apiService.delete<void>(`/credentials/${id}`);
  }

  async testCredential(data: CredentialTestRequest): Promise<CredentialTestResult> {
    return apiService.post<CredentialTestResult>('/credentials/test', data);
  }

  async getCredentialStats(): Promise<CredentialStats> {
    return apiService.get<CredentialStats>('/credentials/stats');
  }

  async getCredentialUsage(id: string): Promise<any[]> {
    return apiService.get<any[]>(`/credentials/${id}/usage`);
  }

  // 자격증명 타입별 기본 스키마 가져오기
  async getCredentialSchema(type: CredentialType): Promise<Record<string, any>> {
    return apiService.get<Record<string, any>>(`/credentials/schema/${type}`);
  }
}

export const credentialService = new CredentialService();
export default credentialService; 