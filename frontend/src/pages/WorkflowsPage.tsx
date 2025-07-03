import React from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, CogIcon } from '@heroicons/react/24/outline';

const WorkflowsPage: React.FC = () => {
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-bold text-gray-900">워크플로우</h1>
            <p className="mt-2 text-sm text-gray-700">
              MCP 서버를 생성하고 관리하는 워크플로우 목록입니다.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Link to="/workflows/new" className="btn-primary">
              <PlusIcon className="h-5 w-5 mr-2" />
              새 워크플로우
            </Link>
          </div>
        </div>

        <div className="text-center py-12">
          <CogIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">워크플로우가 없습니다</h3>
          <p className="mt-1 text-sm text-gray-500">
            첫 번째 워크플로우를 만들어 MCP 서버를 생성해보세요.
          </p>
          <div className="mt-6">
            <Link to="/workflows/new" className="btn-primary">
              <PlusIcon className="h-5 w-5 mr-2" />
              새 워크플로우 만들기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowsPage; 