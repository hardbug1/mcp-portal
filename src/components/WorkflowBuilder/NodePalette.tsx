import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { NODE_TEMPLATES, getNodeTemplatesByCategory } from '../../types/nodeTemplates';
import { NodeTemplate, NodeCategory } from '../../types/workflow';

interface DraggableNodeProps {
  template: NodeTemplate;
}

const DraggableNode: React.FC<DraggableNodeProps> = ({ template }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'node',
    item: { template },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`
        p-3 bg-white border border-gray-200 rounded-lg cursor-move
        hover:shadow-md transition-shadow duration-200
        ${isDragging ? 'opacity-50' : 'opacity-100'}
      `}
      style={{ borderLeftColor: template.color, borderLeftWidth: '4px' }}
    >
      <div className="flex items-center space-x-2">
        <span className="text-lg">{template.icon}</span>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {template.name}
          </h4>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {template.description}
          </p>
        </div>
      </div>
    </div>
  );
};

interface NodeCategoryProps {
  category: NodeCategory;
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
}

const NodeCategorySection: React.FC<NodeCategoryProps> = ({
  category,
  title,
  isExpanded,
  onToggle,
}) => {
  const templates = getNodeTemplatesByCategory(category);

  return (
    <div className="mb-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-2 text-left bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
      >
        <span className="font-medium text-gray-900">{title}</span>
        <svg
          className={`w-4 h-4 transform transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      
      {isExpanded && (
        <div className="mt-2 space-y-2">
          {templates.map((template) => (
            <DraggableNode key={template.type} template={template} />
          ))}
        </div>
      )}
    </div>
  );
};

const NodePalette: React.FC = () => {
  const [expandedCategories, setExpandedCategories] = useState<Set<NodeCategory>>(
    new Set(['triggers', 'actions'])
  );

  const toggleCategory = (category: NodeCategory) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const categories = [
    { key: 'triggers' as NodeCategory, title: '트리거' },
    { key: 'actions' as NodeCategory, title: '액션' },
    { key: 'logic' as NodeCategory, title: '로직' },
    { key: 'transform' as NodeCategory, title: '변환' },
  ];

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">노드 팔레트</h2>
        <p className="text-sm text-gray-600">
          노드를 드래그하여 워크플로우에 추가하세요
        </p>
      </div>

      <div className="space-y-1">
        {categories.map(({ key, title }) => (
          <NodeCategorySection
            key={key}
            category={key}
            title={title}
            isExpanded={expandedCategories.has(key)}
            onToggle={() => toggleCategory(key)}
          />
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-2">사용 방법</h3>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• 노드를 드래그하여 캔버스에 놓기</li>
          <li>• 노드를 클릭하여 설정 편집</li>
          <li>• 노드 간 연결선으로 흐름 정의</li>
        </ul>
      </div>
    </div>
  );
};

export default NodePalette; 