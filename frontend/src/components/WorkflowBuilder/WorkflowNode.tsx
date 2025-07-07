import React, { useState, useEffect } from 'react';
import type { NodeProps } from '@xyflow/react';
import { Handle, Position } from '@xyflow/react';
import { getNodeTemplateByType } from '../../types/nodeTemplates';

const WorkflowNode: React.FC<NodeProps> = ({
  id,
  data,
  selected,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showHandles, setShowHandles] = useState(false);

  // Safely access our custom data
  const nodeData = data as any;

  if (!nodeData || !nodeData.type) {
    return (
      <div className="p-4 bg-red-100 border-2 border-red-300 rounded-lg shadow-sm">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div className="text-red-700 text-sm font-medium">Invalid node data</div>
        </div>
      </div>
    );
  }

  const template = getNodeTemplateByType(nodeData.type);

  if (!template) {
    return (
      <div className="p-4 bg-red-100 border-2 border-red-300 rounded-lg shadow-sm">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div className="text-red-700 text-sm font-medium">Unknown node type: {nodeData.type}</div>
        </div>
      </div>
    );
  }

  const handleClick = () => {
    nodeData.onSelect?.(id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    nodeData.onDelete?.(id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-yellow-400';
      case 'success':
        return 'bg-green-400';
      case 'error':
        return 'bg-red-400';
      case 'warning':
        return 'bg-orange-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return (
          <svg className="w-3 h-3 animate-spin text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case 'success':
        return (
          <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-3 h-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const hasInputs = template.inputs && template.inputs.length > 0;
  const hasOutputs = template.outputs && template.outputs.length > 0;

  // Show handles on hover or when selected
  useEffect(() => {
    setShowHandles(isHovered || selected);
  }, [isHovered, selected]);

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        group relative bg-white border-2 rounded-lg shadow-sm cursor-pointer
        transition-all duration-200 hover:shadow-lg
        ${selected ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg' : 'border-gray-200 hover:border-blue-300'}
        ${nodeData.status === 'error' ? 'border-red-300 bg-red-50' : ''}
        ${nodeData.status === 'success' ? 'border-green-300 bg-green-50' : ''}
        ${nodeData.status === 'running' ? 'border-yellow-300 bg-yellow-50' : ''}
        min-w-[220px] max-w-[320px]
      `}
      style={{ 
        borderLeftColor: template.color, 
        borderLeftWidth: '6px',
        transform: selected ? 'scale(1.02)' : 'scale(1)',
      }}
    >
      {/* Input Handle */}
      {hasInputs && (
        <Handle
          type="target"
          position={Position.Left}
          className={`
            w-3 h-3 border-2 border-white transition-all duration-200
            ${showHandles ? 'opacity-100' : 'opacity-0'}
            ${template.color ? 'bg-blue-500' : 'bg-gray-400'}
          `}
          style={{ 
            left: '-8px',
            backgroundColor: showHandles ? template.color : '#9ca3af'
          }}
        />
      )}

      {/* Node Content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="flex-shrink-0 relative">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg font-medium"
                style={{ backgroundColor: template.color }}
              >
                {template.icon}
              </div>
              {/* Status indicator */}
              {nodeData.status && nodeData.status !== 'idle' && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white border-2 border-white flex items-center justify-center">
                  {getStatusIcon(nodeData.status)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {nodeData.name || template.name}
              </h3>
              <p className="text-xs text-gray-500 truncate">
                {template.category}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className={`flex items-center space-x-1 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            {/* Settings button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                nodeData.onSelect?.(id);
              }}
              className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
              title="설정"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {/* Delete Button */}
            <button
              onClick={handleDelete}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
              title="삭제"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Status Message */}
        {nodeData.status && nodeData.status !== 'idle' && (
          <div className={`
            flex items-center space-x-2 mb-3 px-3 py-2 rounded-md text-xs font-medium
            ${nodeData.status === 'running' ? 'bg-yellow-100 text-yellow-800' : ''}
            ${nodeData.status === 'success' ? 'bg-green-100 text-green-800' : ''}
            ${nodeData.status === 'error' ? 'bg-red-100 text-red-800' : ''}
            ${nodeData.status === 'warning' ? 'bg-orange-100 text-orange-800' : ''}
          `}>
            {getStatusIcon(nodeData.status)}
            <span className="capitalize">
              {nodeData.status === 'running' && '실행 중...'}
              {nodeData.status === 'success' && '완료됨'}
              {nodeData.status === 'error' && '오류 발생'}
              {nodeData.status === 'warning' && '경고'}
            </span>
          </div>
        )}

        {/* Configuration Preview */}
        {nodeData.config && Object.keys(nodeData.config).length > 0 && (
          <div className="bg-gray-50 rounded-md p-3 space-y-2">
            <h4 className="text-xs font-medium text-gray-700">설정</h4>
            <div className="space-y-1">
              {Object.entries(nodeData.config).slice(0, 3).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center text-xs">
                  <span className="text-gray-600 truncate">{key}:</span>
                  <span className="text-gray-900 truncate ml-2 max-w-[120px]" title={String(value)}>
                    {String(value)}
                  </span>
                </div>
              ))}
              {Object.keys(nodeData.config).length > 3 && (
                <div className="text-xs text-gray-500 text-center pt-1 border-t border-gray-200">
                  +{Object.keys(nodeData.config).length - 3}개 더...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty state */}
        {(!nodeData.config || Object.keys(nodeData.config).length === 0) && (
          <div className="text-center py-3 text-gray-400">
            <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-xs">클릭하여 설정</p>
          </div>
        )}

        {/* Input/Output Info */}
        {(hasInputs || hasOutputs) && isHovered && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-2 text-xs">
              {hasInputs && (
                <div>
                  <div className="font-medium text-gray-700 mb-1">입력</div>
                  <div className="space-y-1">
                    {template.inputs.slice(0, 2).map((input, index) => (
                      <div key={index} className="text-gray-600 truncate" title={input.description}>
                        {input.name}
                      </div>
                    ))}
                    {template.inputs.length > 2 && (
                      <div className="text-gray-500">+{template.inputs.length - 2}개 더</div>
                    )}
                  </div>
                </div>
              )}
              {hasOutputs && (
                <div>
                  <div className="font-medium text-gray-700 mb-1">출력</div>
                  <div className="space-y-1">
                    {template.outputs.slice(0, 2).map((output, index) => (
                      <div key={index} className="text-gray-600 truncate" title={output.description}>
                        {output.name}
                      </div>
                    ))}
                    {template.outputs.length > 2 && (
                      <div className="text-gray-500">+{template.outputs.length - 2}개 더</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Output Handle */}
      {hasOutputs && (
        <Handle
          type="source"
          position={Position.Right}
          className={`
            w-3 h-3 border-2 border-white transition-all duration-200
            ${showHandles ? 'opacity-100' : 'opacity-0'}
            ${template.color ? 'bg-blue-500' : 'bg-gray-400'}
          `}
          style={{ 
            right: '-8px',
            backgroundColor: showHandles ? template.color : '#9ca3af'
          }}
        />
      )}

      {/* Selection indicator */}
      {selected && (
        <div className="absolute inset-0 rounded-lg ring-2 ring-blue-400 ring-opacity-50 pointer-events-none" />
      )}
    </div>
  );
};

export default React.memo(WorkflowNode); 