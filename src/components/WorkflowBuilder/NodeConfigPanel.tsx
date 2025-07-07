import React, { useState, useEffect } from 'react';
import { WorkflowNode } from '../../types/workflow';
import { getNodeTemplateByType } from '../../types/nodeTemplates';

interface NodeConfigPanelProps {
  node: WorkflowNode | null;
  onUpdateNode: (nodeId: string, updates: Partial<WorkflowNode>) => void;
  onClose: () => void;
}

const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({
  node,
  onUpdateNode,
  onClose,
}) => {
  const [config, setConfig] = useState<Record<string, any>>({});
  const [name, setName] = useState('');

  const template = node ? getNodeTemplateByType(node.type) : null;

  useEffect(() => {
    if (node) {
      setConfig(node.config || {});
      setName(node.name || template?.name || '');
    }
  }, [node, template]);

  if (!node || !template) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-4">
        <div className="text-center text-gray-500 mt-8">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <p className="text-sm">노드를 선택하여 설정을 편집하세요</p>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    onUpdateNode(node.id, {
      name: name.trim() || template.name,
      config,
    });
  };

  const handleConfigChange = (key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const renderConfigField = (key: string, schema: any) => {
    const value = config[key] ?? schema.default ?? '';

    switch (schema.type) {
      case 'string':
        if (schema.enum) {
          return (
            <select
              value={value}
              onChange={(e) => handleConfigChange(key, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {schema.enum.map((option: string) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          );
        }
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleConfigChange(key, e.target.value)}
            placeholder={schema.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleConfigChange(key, Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );

      case 'boolean':
        return (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleConfigChange(key, e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">활성화</span>
          </label>
        );

      case 'object':
        return (
          <textarea
            value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleConfigChange(key, parsed);
              } catch {
                handleConfigChange(key, e.target.value);
              }
            }}
            rows={4}
            placeholder="JSON 형식으로 입력하세요"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleConfigChange(key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{template.icon}</span>
            <h2 className="text-lg font-semibold text-gray-900">노드 설정</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1">{template.description}</p>
      </div>

      {/* Configuration Form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Node Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            노드 이름
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={template.name}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Configuration Fields */}
        {template.configSchema?.properties && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">설정</h3>
            {Object.entries(template.configSchema.properties).map(([key, schema]: [string, any]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {schema.title || key}
                  {template.configSchema?.required?.includes(key) && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                {schema.description && (
                  <p className="text-xs text-gray-500 mb-2">{schema.description}</p>
                )}
                {renderConfigField(key, schema)}
              </div>
            ))}
          </div>
        )}

        {/* Input/Output Information */}
        <div className="space-y-4">
          {template.inputs.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">입력</h3>
              <div className="space-y-2">
                {template.inputs.map((input) => (
                  <div key={input.name} className="text-xs bg-gray-50 p-2 rounded">
                    <div className="font-medium text-gray-700">
                      {input.name} ({input.type})
                      {input.required && <span className="text-red-500 ml-1">*</span>}
                    </div>
                    {input.description && (
                      <div className="text-gray-500 mt-1">{input.description}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {template.outputs.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">출력</h3>
              <div className="space-y-2">
                {template.outputs.map((output) => (
                  <div key={output.name} className="text-xs bg-gray-50 p-2 rounded">
                    <div className="font-medium text-gray-700">
                      {output.name} ({output.type})
                    </div>
                    {output.description && (
                      <div className="text-gray-500 mt-1">{output.description}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            저장
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodeConfigPanel; 