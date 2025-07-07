import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchDashboardData } from '../store/slices/workflowSlice';
import {
  PlusIcon,
  CogIcon,
  ChartBarIcon,
  ClockIcon,
  RocketLaunchIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { dashboardData, isDashboardLoading, error } = useAppSelector((state) => state.workflow);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  // 로딩 상태일 때 기본값 사용
  const stats = [
    {
      name: '총 워크플로우',
      value: isDashboardLoading ? '-' : (dashboardData?.stats.totalWorkflows?.toString() || '0'),
      icon: CogIcon,
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      change: '+12%',
      changeType: 'increase',
    },
    {
      name: '활성 워크플로우',
      value: isDashboardLoading ? '-' : (dashboardData?.stats.activeWorkflows?.toString() || '0'),
      icon: RocketLaunchIcon,
      color: 'text-emerald-600',
      bgColor: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
      change: '+8%',
      changeType: 'increase',
    },
    {
      name: '총 실행 횟수',
      value: isDashboardLoading ? '-' : (dashboardData?.stats.totalExecutions?.toString() || '0'),
      icon: ChartBarIcon,
      color: 'text-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100',
      change: '+23%',
      changeType: 'increase',
    },
    {
      name: '이번 달 실행',
      value: isDashboardLoading ? '-' : '1,234',
      icon: ArrowTrendingUpIcon,
      color: 'text-amber-600',
      bgColor: 'bg-gradient-to-br from-amber-50 to-amber-100',
      change: '+15%',
      changeType: 'increase',
    },
  ];

  const recentWorkflows = dashboardData?.recentWorkflows || [];

  const quickActions = [
    {
      title: '새 워크플로우 만들기',
      description: '드래그 앤 드롭으로 쉽게 MCP 서버를 생성해보세요.',
      href: '/workflows/new',
      icon: PlusIcon,
      color: 'from-blue-500 to-indigo-600',
      iconBg: 'bg-gradient-to-r from-blue-500 to-indigo-600',
    },
    {
      title: '워크플로우 관리',
      description: '기존 워크플로우를 확인하고 관리해보세요.',
      href: '/workflows',
      icon: CogIcon,
      color: 'from-emerald-500 to-teal-600',
      iconBg: 'bg-gradient-to-r from-emerald-500 to-teal-600',
    },
    {
      title: '자격증명 설정',
      description: 'API 키와 연결 정보를 안전하게 관리하세요.',
      href: '/credentials',
      icon: SparklesIcon,
      color: 'from-purple-500 to-pink-600',
      iconBg: 'bg-gradient-to-r from-purple-500 to-pink-600',
    },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="slide-up">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                안녕하세요, <span className="gradient-text">{user?.name}</span>님! 👋
              </h1>
              <p className="mt-2 text-slate-600">
                오늘도 멋진 MCP 서버를 만들어보세요. 현재 시간: {new Date().toLocaleTimeString('ko-KR')}
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="glass-card rounded-xl px-4 py-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-slate-700">시스템 정상</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="slide-up" style={{ animationDelay: '100ms' }}>
          <h2 className="text-xl font-bold text-slate-900 mb-6">빠른 시작</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={action.title}
                to={action.href}
                className="group card-hover"
                style={{ animationDelay: `${150 + index * 50}ms` }}
              >
                <div className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-12 h-12 ${action.iconBg} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors duration-200">
                      {action.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {action.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <EyeIcon className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="slide-up" style={{ animationDelay: '200ms' }}>
          <h2 className="text-xl font-bold text-slate-900 mb-6">통계 현황</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={stat.name}
                className="card-hover"
                style={{ animationDelay: `${250 + index * 50}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">{stat.name}</p>
                    <div className="flex items-baseline space-x-2">
                      <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                      {stat.change && (
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          stat.changeType === 'increase' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {stat.change}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Workflows */}
        <div className="slide-up" style={{ animationDelay: '300ms' }}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">최근 워크플로우</h2>
            <Link
              to="/workflows"
              className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center space-x-1 group"
            >
              <span>모두 보기</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          <div className="card">
            {isDashboardLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-3">
                  <div className="loading-spinner h-8 w-8"></div>
                  <span className="text-slate-500 font-medium">데이터를 불러오는 중...</span>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="text-red-600 font-medium mb-2">데이터를 불러오는데 실패했습니다</p>
                <button
                  onClick={() => dispatch(fetchDashboardData())}
                  className="btn-secondary text-sm"
                >
                  다시 시도
                </button>
              </div>
            ) : recentWorkflows.length > 0 ? (
              <div className="space-y-4">
                {recentWorkflows.map((workflow, index) => (
                  <div
                    key={workflow.id}
                    className="flex items-center space-x-4 p-4 rounded-xl hover:bg-slate-50 transition-colors duration-200 group"
                    style={{ animationDelay: `${350 + index * 50}ms` }}
                  >
                    <div className="flex-shrink-0">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                        workflow.status === 'active'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        <CogIcon className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors duration-200">
                          {workflow.name}
                        </p>
                        <span className={`badge ${
                          workflow.status === 'active' ? 'badge-success' : 'badge-info'
                        }`}>
                          {workflow.status === 'active' ? '활성' : '비활성'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 truncate">
                        {workflow.description || '설명이 없습니다.'}
                      </p>
                    </div>
                    <div className="flex-shrink-0 flex items-center space-x-2">
                      <div className="text-xs text-slate-400">
                        <ClockIcon className="h-4 w-4 inline mr-1" />
                        {new Date(workflow.updatedAt).toLocaleDateString('ko-KR')}
                      </div>
                      <button className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CogIcon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">워크플로우가 없습니다</h3>
                <p className="text-slate-500 mb-6">
                  첫 번째 워크플로우를 만들어 MCP 서버를 생성해보세요.
                </p>
                <Link to="/workflows/new" className="btn-primary">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  새 워크플로우 만들기
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 