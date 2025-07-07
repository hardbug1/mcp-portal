import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { WorkflowNode as WorkflowNodeType } from '../../types/workflow';
import { getNodeTemplateByType } from '../../types/nodeTemplates';

interface CustomNodeData extends WorkflowNodeType {
  selected?: boolean;
  onSelect?: (nodeId: string) => void;
  onDelete?: (nodeId: string) => void;
}

const WorkflowNode: React.FC<NodeProps<CustomNodeData>> = ({ 
  id, 
  data, 
  selected 
}) => {
  const template = getNodeTemplateByType(data.type);
  
  if (!template) {
    return (
      <div className="px-4 py-2 bg-red-100 border border-red-300 rounded-lg">
        <div className="text-red-700 text-sm">Unknown node type: {data.type}</div>
      </div>
    );
  }

  const handleClick = () => {
    data.onSelect?.(id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    data.onDelete?.(id);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        relative min-w-48 bg-white border-2 rounded-lg shadow-sm
        hover:shadow-md transition-all duration-200 cursor-pointer
        ${selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}
      `}
      style={{ borderLeftColor: template.color, borderLeftWidth: '4px' }}
    >
      {/* Input Handles */}
      {template.inputs.length > 0 && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 bg-gray-400 border-2 border-white"
          style={{ left: '-6px' }}
        />
      )}

      {/* Node Header */}
      <div className="p-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{template.icon}</span>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {data.name || template.name}
              </h3>
              <p className="text-xs text-gray-500 truncate">
                {template.description}
              </p>
            </div>
          </div>
          
          {/* Delete Button */}
          <button
            onClick={handleDelete}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            title="노드 삭제"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Node Status */}
      {data.status && (
        <div className="px-3 py-1 bg-gray-50">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(data.status)}`} />
            <span className="text-xs text-gray-600 capitalize">{data.status}</span>
          </div>
        </div>
      )}

      {/* Configuration Preview */}
      {data.config && Object.keys(data.config).length > 0 && (
        <div className="px-3 py-2 text-xs text-gray-600 bg-gray-50 border-t border-gray-100">
          <div className="space-y-1">
            {Object.entries(data.config).slice(0, 2).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="font-medium">{key}:</span>
                <span className="truncate ml-2 max-w-24">
                  {typeof value === 'object' ? '[Object]' : String(value)}
                </span>
              </div>
            ))}
            {Object.keys(data.config).length > 2 && (
              <div className="text-gray-400">
                +{Object.keys(data.config).length - 2} more...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Output Handles */}
      {template.outputs.length > 0 && (
        <>
          {template.outputs.length === 1 ? (
            <Handle
              type="source"
              position={Position.Right}
              className="w-3 h-3 bg-gray-400 border-2 border-white"
              style={{ right: '-6px' }}
            />
          ) : (
            template.outputs.map((output, index) => (
              <Handle
                key={output.name}
                type="source"
                position={Position.Right}
                id={output.name}
                className="w-3 h-3 bg-gray-400 border-2 border-white"
                style={{ 
                  right: '-6px',
                  top: `${30 + (index * 20)}px`
                }}
              />
            ))
          )}
        </>
      )}
    </div>
  );
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'running':
      return 'bg-yellow-400 animate-pulse';
    case 'success':
      return 'bg-green-400';
    case 'error':
      return 'bg-red-400';
    case 'idle':
    default:
      return 'bg-gray-400';
  }
};

export default memo(WorkflowNode); 