export interface Credential {
  id: string;
  name: string;
  type: CredentialType;
  description?: string;
  workspaceId: string;
  createdById: string;
  isShared: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum CredentialType {
  API_KEY = 'API_KEY',
  OAUTH2 = 'OAUTH2',
  BASIC_AUTH = 'BASIC_AUTH',
  BEARER_TOKEN = 'BEARER_TOKEN',
  SSH_KEY = 'SSH_KEY',
  DATABASE = 'DATABASE',
  WEBHOOK = 'WEBHOOK',
  CUSTOM = 'CUSTOM'
}

export interface CreateCredentialRequest {
  name: string;
  type: CredentialType;
  description?: string;
  workspaceId: string;
  isShared?: boolean;
  data: CredentialData;
}

export interface UpdateCredentialRequest {
  name?: string;
  description?: string;
  isShared?: boolean;
  data?: CredentialData;
}

export interface CredentialData {
  // API Key
  apiKey?: string;
  
  // OAuth2
  clientId?: string;
  clientSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: Date;
  authUrl?: string;
  tokenUrl?: string;
  scope?: string[];
  
  // Basic Auth
  username?: string;
  password?: string;
  
  // Bearer Token
  token?: string;
  
  // SSH Key
  privateKey?: string;
  publicKey?: string;
  passphrase?: string;
  
  // Database
  host?: string;
  port?: number;
  database?: string;
  connectionString?: string;
  
  // Webhook
  url?: string;
  headers?: Record<string, string>;
  
  // Custom
  customFields?: Record<string, any>;
}

export interface EncryptedCredentialData {
  encryptedData: string;
  iv: string;
  keyId: string;
}

export interface CredentialListQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: CredentialType;
  workspaceId?: string;
  isShared?: boolean;
  sortBy?: 'name' | 'type' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CredentialListResponse {
  credentials: Credential[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CredentialWithData extends Credential {
  data: CredentialData;
}

export interface CredentialUsage {
  credentialId: string;
  workflowId: string;
  workflowName: string;
  nodeId: string;
  nodeName: string;
  lastUsedAt: Date;
}

export interface CredentialAccessLog {
  id: string;
  credentialId: string;
  userId: string;
  action: 'VIEW' | 'CREATE' | 'UPDATE' | 'DELETE' | 'USE';
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface CredentialPermission {
  credentialId: string;
  userId: string;
  permission: 'READ' | 'write' | 'admin';
  grantedAt: Date;
  grantedBy: string;
}

export interface TestCredentialRequest {
  type: CredentialType;
  data: CredentialData;
  testEndpoint?: string;
}

export interface TestCredentialResponse {
  success: boolean;
  message: string;
  details?: any;
  responseTime?: number;
}

export interface CredentialStats {
  totalCredentials: number;
  credentialsByType: Record<CredentialType, number>;
  sharedCredentials: number;
  privateCredentials: number;
  recentlyUsed: number;
} 