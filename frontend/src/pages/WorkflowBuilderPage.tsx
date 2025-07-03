import React from 'react';
import { useParams } from 'react-router-dom';

const WorkflowBuilderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isNewWorkflow = id === undefined;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {isNewWorkflow ? '새 워크플로우' : '워크플로우 편집'}
            </h1>
            <p className="text-sm text-gray-500">
              드래그 앤 드롭으로 MCP 서버를 구성해보세요
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="btn-secondary">
              미리보기
            </button>
            <button className="btn-primary">
              저장
            </button>
          </div>
        </div>
      </div>

      {/* Builder Content */}
      <div className="flex-1 flex">
        {/* Node Palette */}
        <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-4">노드 팔레트</h3>
          <div className="space-y-3">
            <div className="p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:shadow-sm">
              <div className="text-sm font-medium text-gray-900">수동 트리거</div>
              <div className="text-xs text-gray-500">수동으로 워크플로우 시작</div>
            </div>
            <div className="p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:shadow-sm">
              <div className="text-sm font-medium text-gray-900">HTTP 요청</div>
              <div className="text-xs text-gray-500">API 호출 실행</div>
            </div>
            <div className="p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:shadow-sm">
              <div className="text-sm font-medium text-gray-900">조건 분기</div>
              <div className="text-xs text-gray-500">조건에 따라 분기</div>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-gray-100 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-400 text-lg mb-2">🎨</div>
              <div className="text-gray-500 text-sm">
                왼쪽에서 노드를 드래그해서 워크플로우를 만들어보세요
              </div>
            </div>
          </div>
        </div>

        {/* Properties Panel */}
        <div className="w-80 bg-white border-l border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-4">속성</h3>
          <div className="text-sm text-gray-500">
            노드를 선택하면 속성을 편집할 수 있습니다.
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowBuilderPage; 