import React from 'react';
import { useGlobalLoading } from '../hooks/useLoading';

const GlobalLoadingSpinner: React.FC = () => {
  const { isLoading, loadingMessage } = useGlobalLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="glass-card rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4 fade-in">
        <div className="flex flex-col items-center space-y-6">
          {/* 현대적인 로딩 스피너 */}
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
            <div className="absolute top-2 left-2 w-12 h-12 border-2 border-indigo-400 rounded-full animate-ping"></div>
          </div>
          
          {/* 로딩 메시지 */}
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-slate-900">
              {loadingMessage || '처리 중입니다'}
            </h3>
            <p className="text-sm text-slate-500">
              잠시만 기다려주세요...
            </p>
          </div>

          {/* 진행 표시 점들 */}
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalLoadingSpinner; 