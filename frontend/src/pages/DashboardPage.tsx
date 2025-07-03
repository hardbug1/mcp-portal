import React from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../hooks/redux';
import {
  PlusIcon,
  CogIcon,
  ChartBarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const DashboardPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  const stats = [
    {
      name: '활성 워크플로우',
      value: '3',
      icon: CogIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: '총 실행 횟수',
      value: '127',
      icon: ChartBarIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: '이번 주 실행',
      value: '24',
      icon: ClockIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  const recentWorkflows = [
    {
      id: '1',
      name: '고객 데이터 동기화',
      status: 'active',
      lastRun: '2시간 전',
      executions: 45,
    },
    {
      id: '2',
      name: '이메일 자동 응답',
      status: 'active',
      lastRun: '1일 전',
      executions: 32,
    },
    {
      id: '3',
      name: '주문 처리 자동화',
      status: 'inactive',
      lastRun: '3일 전',
      executions: 18,
    },
  ];

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            안녕하세요, {user?.name}님! 👋
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            MCP 서버 생성 플랫폼에 오신 것을 환영합니다.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">빠른 시작</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Link
                  to="/workflows/new"
                  className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200"
                >
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-primary-50 text-primary-600 ring-4 ring-white">
                      <PlusIcon className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      새 워크플로우 만들기
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      드래그 앤 드롭으로 쉽게 MCP 서버를 생성해보세요.
                    </p>
                  </div>
                </Link>

                <Link
                  to="/workflows"
                  className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200"
                >
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-600 ring-4 ring-white">
                      <CogIcon className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      워크플로우 관리
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      기존 워크플로우를 확인하고 관리해보세요.
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">현황</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.name} className="card p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`p-3 rounded-md ${stat.bgColor}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stat.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Workflows */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">최근 워크플로우</h2>
            <Link
              to="/workflows"
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              모두 보기 →
            </Link>
          </div>
          <div className="card">
            <div className="px-4 py-5 sm:p-6">
              <div className="flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                  {recentWorkflows.map((workflow) => (
                    <li key={workflow.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            workflow.status === 'active'
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            <CogIcon className="h-5 w-5" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {workflow.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            마지막 실행: {workflow.lastRun} • {workflow.executions}회 실행
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            workflow.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {workflow.status === 'active' ? '활성' : '비활성'}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 