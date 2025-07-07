import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useToast } from '../hooks/useToast';
import type { RootState } from '../store';

interface Credential {
  id: string;
  name: string;
  type: CredentialType;
  description?: string;
  createdAt: string;
  updatedAt: string;
  lastUsed?: string;
}

type CredentialType = 
  | 'api_key'
  | 'oauth2'
  | 'basic_auth'
  | 'database'
  | 'ssh_key'
  | 'certificate'
  | 'webhook'
  | 'custom';

interface CredentialFormData {
  name: string;
  type: CredentialType;
  description: string;
  data: Record<string, any>;
}

const CREDENTIAL_TYPES = [
  { value: 'api_key', label: 'API 키', icon: '🔑' },
  { value: 'oauth2', label: 'OAuth 2.0', icon: '🔐' },
  { value: 'basic_auth', label: '기본 인증', icon: '👤' },
  { value: 'database', label: '데이터베이스', icon: '🗃️' },
  { value: 'ssh_key', label: 'SSH 키', icon: '🔒' },
  { value: 'certificate', label: '인증서', icon: '📜' },
  { value: 'webhook', label: '웹훅', icon: '🌐' },
  { value: 'custom', label: '사용자 정의', icon: '⚙️' },
];

const CredentialsPage: React.FC = () => {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<CredentialType | 'all'>('all');

  const { showToast } = useToast();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    setIsLoading(true);
    try {
      // TODO: API 호출
      // const response = await credentialService.getCredentials();
      // setCredentials(response.data);
      
      // Mock data for now
      setCredentials([
        {
          id: '1',
          name: 'OpenAI API Key',
          type: 'api_key',
          description: 'ChatGPT API 접근용',
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          lastUsed: '2024-01-20T14:20:00Z',
        },
        {
          id: '2',
          name: 'PostgreSQL 데이터베이스',
          type: 'database',
          description: '프로덕션 데이터베이스 연결',
          createdAt: '2024-01-10T09:15:00Z',
          updatedAt: '2024-01-18T16:45:00Z',
          lastUsed: '2024-01-21T11:30:00Z',
        },
      ]);
    } catch (error) {
      showToast('자격증명을 불러오는데 실패했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (credential: Credential) => {
    if (!confirm(`"${credential.name}" 자격증명을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      // TODO: API 호출
      // await credentialService.deleteCredential(credential.id);
      setCredentials(prev => prev.filter(c => c.id !== credential.id));
      showToast('자격증명이 삭제되었습니다.', 'success');
    } catch (error) {
      showToast('자격증명 삭제에 실패했습니다.', 'error');
    }
  };

  const handleEdit = (credential: Credential) => {
    setSelectedCredential(credential);
    setIsEditModalOpen(true);
  };

  const filteredCredentials = credentials.filter(credential => {
    const matchesSearch = credential.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         credential.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || credential.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeInfo = (type: CredentialType) => {
    return CREDENTIAL_TYPES.find(t => t.value === type) || CREDENTIAL_TYPES[0];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <svg className="w-6 h-6 animate-spin text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="text-lg text-gray-700">자격증명을 불러오는 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">자격증명 관리</h1>
              <p className="mt-2 text-gray-600">
                워크플로우에서 사용할 API 키, 데이터베이스 연결 정보 등을 안전하게 관리하세요.
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              새 자격증명 추가
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="자격증명 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="sm:w-48">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as CredentialType | 'all')}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">모든 유형</option>
                {CREDENTIAL_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Credentials List */}
        <div className="bg-white shadow rounded-lg">
          {filteredCredentials.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">자격증명이 없습니다</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterType !== 'all' 
                  ? '검색 조건에 맞는 자격증명이 없습니다.' 
                  : '첫 번째 자격증명을 추가해보세요.'
                }
              </p>
              {(!searchTerm && filterType === 'all') && (
                <div className="mt-6">
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    새 자격증명 추가
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      이름
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      유형
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      마지막 사용
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      생성일
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCredentials.map((credential) => {
                    const typeInfo = getTypeInfo(credential.type);
                    return (
                      <tr key={credential.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {credential.name}
                            </div>
                            {credential.description && (
                              <div className="text-sm text-gray-500">
                                {credential.description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-lg mr-2">{typeInfo.icon}</span>
                            <span className="text-sm text-gray-900">{typeInfo.label}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {credential.lastUsed ? formatDate(credential.lastUsed) : '사용 안함'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(credential.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleEdit(credential)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              편집
                            </button>
                            <button
                              onClick={() => handleDelete(credential)}
                              className="text-red-600 hover:text-red-900"
                            >
                              삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      총 자격증명
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {credentials.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      활성 자격증명
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {credentials.filter(c => c.lastUsed).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      가장 많은 유형
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {credentials.length > 0 ? getTypeInfo(
                        Object.entries(
                          credentials.reduce((acc, cred) => {
                            acc[cred.type] = (acc[cred.type] || 0) + 1;
                            return acc;
                          }, {} as Record<CredentialType, number>)
                        ).sort(([,a], [,b]) => b - a)[0]?.[0] as CredentialType
                      ).label : '-'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      미사용 자격증명
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {credentials.filter(c => !c.lastUsed).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal would go here */}
      {/* TODO: Implement CredentialModal component */}
    </div>
  );
};

export default CredentialsPage; 