import React, { useState, useEffect, useCallback } from 'react';
import type { WorkflowNode } from '../../types/workflow';
import { getNodeTemplateByType } from '../../types/nodeTemplates';

interface NodeConfigPanelProps {
  node: WorkflowNode | null;
  onUpdateNode: (nodeId: string, updates: Partial<WorkflowNode>) => void;
  onClose: () => void;
}

interface ValidationError {
  field: string;
  message: string;
}

const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({
  node,
  onUpdateNode,
  onClose,
}) => {
  const [config, setConfig] = useState<Record<string, any>>({});
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const template = node ? getNodeTemplateByType(node.type) : null;

  useEffect(() => {
    if (node) {
      setConfig(node.config || {});
      setName(node.name || template?.name || '');
      setErrors([]);
      setHasChanges(false);
      setShowAdvanced(false);
    }
  }, [node, template]);

  const validateConfig = useCallback(async (configToValidate: Record<string, any>, nameToValidate: string) => {
    if (!template) return [];

    const newErrors: ValidationError[] = [];

    // Validate name
    if (!nameToValidate.trim()) {
      newErrors.push({ field: 'name', message: '노드 이름은 필수입니다.' });
    }

    // Validate required fields
    if (template.configSchema?.required) {
      template.configSchema.required.forEach((field: string) => {
        const value = configToValidate[field];
        if (value === undefined || value === null || value === '') {
          const fieldSchema = template.configSchema?.properties?.[field];
          const fieldTitle = fieldSchema?.title || field;
          newErrors.push({ field, message: `${fieldTitle}은(는) 필수 항목입니다.` });
        }
      });
    }

    // Validate field types and constraints
    if (template.configSchema?.properties) {
      Object.entries(template.configSchema.properties).forEach(([field, schema]: [string, any]) => {
        const value = configToValidate[field];
        if (value !== undefined && value !== null && value !== '') {
          // Type validation
          switch (schema.type) {
            case 'number':
              if (isNaN(Number(value))) {
                newErrors.push({ field, message: `${schema.title || field}은(는) 숫자여야 합니다.` });
              } else {
                const numValue = Number(value);
                if (schema.minimum !== undefined && numValue < schema.minimum) {
                  newErrors.push({ field, message: `${schema.title || field}은(는) ${schema.minimum} 이상이어야 합니다.` });
                }
                if (schema.maximum !== undefined && numValue > schema.maximum) {
                  newErrors.push({ field, message: `${schema.title || field}은(는) ${schema.maximum} 이하여야 합니다.` });
                }
              }
              break;
            case 'string':
              if (schema.minLength && value.length < schema.minLength) {
                newErrors.push({ field, message: `${schema.title || field}은(는) 최소 ${schema.minLength}자 이상이어야 합니다.` });
              }
              if (schema.maxLength && value.length > schema.maxLength) {
                newErrors.push({ field, message: `${schema.title || field}은(는) 최대 ${schema.maxLength}자 이하여야 합니다.` });
              }
              if (schema.pattern) {
                const regex = new RegExp(schema.pattern);
                if (!regex.test(value)) {
                  newErrors.push({ field, message: `${schema.title || field}의 형식이 올바르지 않습니다.` });
                }
              }
              break;
            case 'object':
              try {
                if (typeof value === 'string') {
                  JSON.parse(value);
                }
              } catch {
                newErrors.push({ field, message: `${schema.title || field}은(는) 유효한 JSON 형식이어야 합니다.` });
              }
              break;
          }
        }
      });
    }

    return newErrors;
  }, [template]);

  const handleConfigChange = useCallback(async (key: string, value: any) => {
    const newConfig = {
      ...config,
      [key]: value,
    };
    setConfig(newConfig);
    setHasChanges(true);

    // Real-time validation
    setIsValidating(true);
    const validationErrors = await validateConfig(newConfig, name);
    setErrors(validationErrors);
    setIsValidating(false);
  }, [config, name, validateConfig]);

  const handleNameChange = useCallback(async (newName: string) => {
    setName(newName);
    setHasChanges(true);

    // Real-time validation
    setIsValidating(true);
    const validationErrors = await validateConfig(config, newName);
    setErrors(validationErrors);
    setIsValidating(false);
  }, [config, validateConfig]);

  const handleSave = async () => {
    if (!node) return;

    setIsValidating(true);
    const validationErrors = await validateConfig(config, name);
    setErrors(validationErrors);
    setIsValidating(false);

    if (validationErrors.length === 0) {
      onUpdateNode(node.id, {
        name: name.trim() || template?.name,
        config,
      });
      setHasChanges(false);
    }
  };

  const handleReset = () => {
    if (node) {
      setConfig(node.config || {});
      setName(node.name || template?.name || '');
      setErrors([]);
      setHasChanges(false);
    }
  };

  const getFieldError = (field: string) => {
    return errors.find(error => error.field === field)?.message;
  };

  const renderConfigField = (key: string, schema: any) => {
    const value = config[key] ?? schema.default ?? '';
    const error = getFieldError(key);
    const isRequired = template?.configSchema?.required?.includes(key);

    const baseInputClass = `
      w-full px-3 py-2 border rounded-md transition-colors
      focus:outline-none focus:ring-2 focus:ring-blue-500
      ${error ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500'}
    `;

    switch (schema.type) {
      case 'string':
        if (schema.enum) {
          return (
            <div>
              <select
                value={value}
                onChange={(e) => handleConfigChange(key, e.target.value)}
                className={baseInputClass}
              >
                {!isRequired && <option value="">선택하세요</option>}
                {schema.enum.map((option: string) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
            </div>
          );
        }

        if (schema.format === 'textarea' || schema.multiline) {
          return (
            <div>
              <textarea
                value={value}
                onChange={(e) => handleConfigChange(key, e.target.value)}
                placeholder={schema.placeholder}
                rows={schema.rows || 3}
                className={baseInputClass}
              />
              {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
            </div>
          );
        }

        return (
          <div>
            <input
              type={schema.format === 'password' ? 'password' : 'text'}
              value={value}
              onChange={(e) => handleConfigChange(key, e.target.value)}
              placeholder={schema.placeholder}
              className={baseInputClass}
            />
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
            {schema.pattern && (
              <p className="mt-1 text-xs text-gray-500">
                형식: {schema.patternDescription || schema.pattern}
              </p>
            )}
          </div>
        );

      case 'number':
        return (
          <div>
            <input
              type="number"
              value={value}
              onChange={(e) => handleConfigChange(key, Number(e.target.value))}
              min={schema.minimum}
              max={schema.maximum}
              step={schema.multipleOf || 1}
              className={baseInputClass}
            />
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
            {(schema.minimum !== undefined || schema.maximum !== undefined) && (
              <p className="mt-1 text-xs text-gray-500">
                범위: {schema.minimum || '∞'} ~ {schema.maximum || '∞'}
              </p>
            )}
          </div>
        );

      case 'boolean':
        return (
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => handleConfigChange(key, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                {schema.checkboxLabel || '활성화'}
              </span>
            </label>
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
          </div>
        );

      case 'object':
        return (
          <div>
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
              rows={6}
              placeholder="JSON 형식으로 입력하세요"
              className={`${baseInputClass} font-mono text-sm`}
            />
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
            <p className="mt-1 text-xs text-gray-500">
              유효한 JSON 형식으로 입력하세요
            </p>
          </div>
        );

      case 'array':
        const arrayValue = Array.isArray(value) ? value : [];
        return (
          <div>
            <div className="space-y-2">
              {arrayValue.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const newArray = [...arrayValue];
                      newArray[index] = e.target.value;
                      handleConfigChange(key, newArray);
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => {
                      const newArray = arrayValue.filter((_, i) => i !== index);
                      handleConfigChange(key, newArray);
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                onClick={() => handleConfigChange(key, [...arrayValue, ''])}
                className="w-full py-2 px-3 border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:border-blue-300 hover:text-blue-500 transition-colors"
              >
                + 항목 추가
              </button>
            </div>
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
          </div>
        );

      default:
        return (
          <div>
            <input
              type="text"
              value={value}
              onChange={(e) => handleConfigChange(key, e.target.value)}
              className={baseInputClass}
            />
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
          </div>
        );
    }
  };

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

  const basicFields = template.configSchema?.properties ? 
    Object.entries(template.configSchema.properties).filter(([_, schema]: [string, any]) => !schema.advanced) : [];
  const advancedFields = template.configSchema?.properties ? 
    Object.entries(template.configSchema.properties).filter(([_, schema]: [string, any]) => schema.advanced) : [];

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-medium"
              style={{ backgroundColor: template.color }}
            >
              {template.icon}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">노드 설정</h2>
              <p className="text-xs text-gray-500">{template.category}</p>
            </div>
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
        <p className="text-sm text-gray-600 mt-2">{template.description}</p>
      </div>

      {/* Configuration Form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Node Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            노드 이름
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder={template.name}
            className={`
              w-full px-3 py-2 border rounded-md transition-colors
              focus:outline-none focus:ring-2 focus:ring-blue-500
              ${getFieldError('name') ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500'}
            `}
          />
          {getFieldError('name') && (
            <p className="mt-1 text-xs text-red-600">{getFieldError('name')}</p>
          )}
        </div>

        {/* Basic Configuration Fields */}
        {basicFields.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">
              기본 설정
            </h3>
            {basicFields.map(([key, schema]: [string, any]) => (
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

        {/* Advanced Configuration Fields */}
        {advancedFields.length > 0 && (
          <div className="space-y-4">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full text-sm font-medium text-gray-900 border-b border-gray-200 pb-2 hover:text-blue-600 transition-colors"
            >
              <span>고급 설정</span>
              <svg
                className={`w-4 h-4 transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showAdvanced && (
              <div className="space-y-4">
                {advancedFields.map(([key, schema]: [string, any]) => (
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
          </div>
        )}

        {/* Input/Output Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">
            입출력 정보
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            {template.inputs.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-2">입력</h4>
                <div className="space-y-1">
                  {template.inputs.map((input, index) => (
                    <div key={index} className="text-xs text-gray-600">
                      <div className="font-medium">{input.name}</div>
                      {input.description && (
                        <div className="text-gray-500">{input.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {template.outputs.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-2">출력</h4>
                <div className="space-y-1">
                  {template.outputs.map((output, index) => (
                    <div key={index} className="text-xs text-gray-600">
                      <div className="font-medium">{output.name}</div>
                      {output.description && (
                        <div className="text-gray-500">{output.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 space-y-3">
        {/* Validation Status */}
        {isValidating && (
          <div className="flex items-center space-x-2 text-xs text-blue-600">
            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>검증 중...</span>
          </div>
        )}

        {errors.length > 0 && (
          <div className="text-xs text-red-600">
            <div className="font-medium mb-1">오류가 있습니다:</div>
            <ul className="list-disc list-inside space-y-1">
              {errors.slice(0, 3).map((error, index) => (
                <li key={index}>{error.message}</li>
              ))}
              {errors.length > 3 && (
                <li>외 {errors.length - 3}개 더...</li>
              )}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={handleReset}
            disabled={!hasChanges}
            className="flex-1 py-2 px-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            재설정
          </button>
          <button
            onClick={handleSave}
            disabled={errors.length > 0 || !hasChanges || isValidating}
            className="flex-1 py-2 px-3 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isValidating ? '검증 중...' : '저장'}
          </button>
        </div>

        {/* Changes indicator */}
        {hasChanges && (
          <p className="text-xs text-orange-600 text-center">
            저장되지 않은 변경사항이 있습니다
          </p>
        )}
      </div>
    </div>
  );
};

export default NodeConfigPanel; 