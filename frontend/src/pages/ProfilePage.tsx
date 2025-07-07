import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { useLoading } from '../hooks/useLoading';
import { useToast } from '../hooks/useToast';
import authService from '../services/authService';
import { loadUserProfile } from '../store/slices/authSlice';

interface ProfileFormData {
  name: string;
  email: string;
  bio?: string;
  company?: string;
  location?: string;
  website?: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { withLoading } = useLoading();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'preferences'>('profile');
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    name: '',
    email: '',
    bio: '',
    company: '',
    location: '',
    website: '',
  });
  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    workflowUpdates: true,
    securityAlerts: true,
    marketingEmails: false,
    theme: 'light' as 'light' | 'dark' | 'system',
    language: 'ko' as 'ko' | 'en',
  });

  // 사용자 정보 로드
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        company: user.company || '',
        location: user.location || '',
        website: user.website || '',
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await withLoading(async () => {
        // TODO: API 연동
        await new Promise(resolve => setTimeout(resolve, 1000)); // 임시 딜레이
        
        showToast('프로필이 성공적으로 업데이트되었습니다.', 'success');
        dispatch(loadUserProfile());
      });
    } catch (error) {
      showToast('프로필 업데이트 중 오류가 발생했습니다.', 'error');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('새 비밀번호가 일치하지 않습니다.', 'error');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      showToast('비밀번호는 최소 8자 이상이어야 합니다.', 'error');
      return;
    }

    try {
      await withLoading(async () => {
        // TODO: API 연동
        await new Promise(resolve => setTimeout(resolve, 1000)); // 임시 딜레이
        
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        showToast('비밀번호가 성공적으로 변경되었습니다.', 'success');
      });
    } catch (error) {
      showToast('비밀번호 변경 중 오류가 발생했습니다.', 'error');
    }
  };

  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await withLoading(async () => {
        // TODO: API 연동
        await new Promise(resolve => setTimeout(resolve, 1000)); // 임시 딜레이
        
        showToast('설정이 성공적으로 저장되었습니다.', 'success');
      });
    } catch (error) {
      showToast('설정 저장 중 오류가 발생했습니다.', 'error');
    }
  };

  const tabs = [
    { id: 'profile', name: '프로필', icon: '👤' },
    { id: 'password', name: '비밀번호', icon: '🔒' },
    { id: 'preferences', name: '환경설정', icon: '⚙️' },
  ];

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">계정 설정</h1>
        <p className="mt-2 text-gray-600">
          프로필 정보, 비밀번호, 환경설정을 관리하세요.
        </p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* 프로필 탭 */}
      {activeTab === 'profile' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">프로필 정보</h2>
            <p className="mt-1 text-sm text-gray-500">
              공개 프로필 정보를 관리하세요.
            </p>
          </div>
          
          <form onSubmit={handleProfileSubmit} className="px-6 py-4 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  이름 *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  이메일 *
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                  회사
                </label>
                <input
                  type="text"
                  id="company"
                  value={profileForm.company}
                  onChange={(e) => setProfileForm({ ...profileForm, company: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  위치
                </label>
                <input
                  type="text"
                  id="location"
                  value={profileForm.location}
                  onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                  웹사이트
                </label>
                <input
                  type="url"
                  id="website"
                  value={profileForm.website}
                  onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                  자기소개
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="자신에 대해 간단히 소개해주세요..."
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                프로필 저장
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 비밀번호 탭 */}
      {activeTab === 'password' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">비밀번호 변경</h2>
            <p className="mt-1 text-sm text-gray-500">
              계정 보안을 위해 정기적으로 비밀번호를 변경하세요.
            </p>
          </div>
          
          <form onSubmit={handlePasswordSubmit} className="px-6 py-4 space-y-6">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                현재 비밀번호 *
              </label>
              <input
                type="password"
                id="currentPassword"
                required
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                새 비밀번호 *
              </label>
              <input
                type="password"
                id="newPassword"
                required
                minLength={8}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                최소 8자 이상, 대소문자, 숫자, 특수문자를 포함하는 것을 권장합니다.
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                새 비밀번호 확인 *
              </label>
              <input
                type="password"
                id="confirmPassword"
                required
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                비밀번호 변경
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 환경설정 탭 */}
      {activeTab === 'preferences' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">환경설정</h2>
            <p className="mt-1 text-sm text-gray-500">
              알림, 테마, 언어 등의 설정을 관리하세요.
            </p>
          </div>
          
          <form onSubmit={handlePreferencesSubmit} className="px-6 py-4 space-y-6">
            {/* 알림 설정 */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">알림 설정</h3>
              <div className="space-y-4">
                {[
                  { key: 'emailNotifications', label: '이메일 알림', description: '중요한 업데이트를 이메일로 받습니다.' },
                  { key: 'workflowUpdates', label: '워크플로우 업데이트', description: '워크플로우 실행 결과를 알림으로 받습니다.' },
                  { key: 'securityAlerts', label: '보안 알림', description: '계정 보안 관련 알림을 받습니다.' },
                  { key: 'marketingEmails', label: '마케팅 이메일', description: '새로운 기능과 팁을 이메일로 받습니다.' },
                ].map((item) => (
                  <div key={item.key} className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        id={item.key}
                        checked={preferences[item.key as keyof typeof preferences] as boolean}
                        onChange={(e) => setPreferences({ ...preferences, [item.key]: e.target.checked })}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor={item.key} className="font-medium text-gray-700">
                        {item.label}
                      </label>
                      <p className="text-gray-500">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 테마 설정 */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">테마</h3>
              <div className="space-y-2">
                {[
                  { value: 'light', label: '라이트 모드' },
                  { value: 'dark', label: '다크 모드' },
                  { value: 'system', label: '시스템 설정 따름' },
                ].map((option) => (
                  <div key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      id={`theme-${option.value}`}
                      name="theme"
                      value={option.value}
                      checked={preferences.theme === option.value}
                      onChange={(e) => setPreferences({ ...preferences, theme: e.target.value as any })}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    />
                    <label htmlFor={`theme-${option.value}`} className="ml-3 text-sm font-medium text-gray-700">
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* 언어 설정 */}
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                언어
              </label>
              <select
                id="language"
                value={preferences.language}
                onChange={(e) => setPreferences({ ...preferences, language: e.target.value as any })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="ko">한국어</option>
                <option value="en">English</option>
              </select>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                설정 저장
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProfilePage; 