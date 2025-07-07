import React, { useState, useMemo, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { getNodeTemplatesByCategory, getAllNodeTemplates } from '../../types/nodeTemplates';
import type { NodeTemplate, NodeCategory } from '../../types/workflow';

interface DraggableNodeProps {
  template: NodeTemplate;
  onAddToFavorites?: (template: NodeTemplate) => void;
  onRemoveFromFavorites?: (template: NodeTemplate) => void;
  isFavorite?: boolean;
}

const DraggableNode: React.FC<DraggableNodeProps> = ({ 
  template, 
  onAddToFavorites, 
  onRemoveFromFavorites,
  isFavorite = false 
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'node',
    item: { template },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavorite) {
      onRemoveFromFavorites?.(template);
    } else {
      onAddToFavorites?.(template);
    }
  };

  return (
    <div
      ref={drag as any}
      className={`
        group p-3 bg-white border border-gray-200 rounded-lg cursor-move
        hover:shadow-md hover:border-blue-300 transition-all duration-200
        ${isDragging ? 'opacity-50 scale-95' : 'opacity-100'}
        ${isFavorite ? 'ring-1 ring-yellow-300' : ''}
      `}
      style={{ borderLeftColor: template.color, borderLeftWidth: '4px' }}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <span className="text-xl">{template.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {template.name}
            </h4>
            <button
              onClick={handleFavoriteClick}
              className={`
                opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded
                ${isFavorite ? 'text-yellow-500 opacity-100' : 'text-gray-400 hover:text-yellow-500'}
              `}
            >
              <svg className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {template.description}
          </p>
          {template.category && (
            <span className="inline-block mt-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
              {template.category}
            </span>
          )}
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
  templates: NodeTemplate[];
  searchTerm: string;
  favorites: Set<string>;
  onAddToFavorites: (template: NodeTemplate) => void;
  onRemoveFromFavorites: (template: NodeTemplate) => void;
}

const NodeCategorySection: React.FC<NodeCategoryProps> = ({
  category,
  title,
  isExpanded,
  onToggle,
  templates,
  searchTerm,
  favorites,
  onAddToFavorites,
  onRemoveFromFavorites,
}) => {
  const filteredTemplates = useMemo(() => {
    if (!searchTerm) return templates;
    return templates.filter(template =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [templates, searchTerm]);

  if (filteredTemplates.length === 0 && searchTerm) {
    return null;
  }

  return (
    <div className="mb-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <div className="flex items-center space-x-2">
          <span className="font-medium text-gray-900">{title}</span>
          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
            {filteredTemplates.length}
          </span>
        </div>
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
        <div className="mt-3 space-y-2">
          {filteredTemplates.map((template) => (
            <DraggableNode 
              key={template.type} 
              template={template}
              isFavorite={favorites.has(template.type)}
              onAddToFavorites={onAddToFavorites}
              onRemoveFromFavorites={onRemoveFromFavorites}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const NodePalette: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<NodeCategory>>(
    new Set(['triggers', 'actions'])
  );
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [recentNodes, setRecentNodes] = useState<NodeTemplate[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'recent'>('all');

  // Load favorites and recent nodes from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('nodePaletteFavorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }

    const savedRecent = localStorage.getItem('nodePaletteRecent');
    if (savedRecent) {
      setRecentNodes(JSON.parse(savedRecent));
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('nodePaletteFavorites', JSON.stringify([...favorites]));
  }, [favorites]);

  // Save recent nodes to localStorage
  useEffect(() => {
    localStorage.setItem('nodePaletteRecent', JSON.stringify(recentNodes));
  }, [recentNodes]);

  const addToFavorites = (template: NodeTemplate) => {
    setFavorites(prev => new Set([...prev, template.type]));
  };

  const removeFromFavorites = (template: NodeTemplate) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      newFavorites.delete(template.type);
      return newFavorites;
    });
  };

  const addToRecent = (template: NodeTemplate) => {
    setRecentNodes(prev => {
      const filtered = prev.filter(node => node.type !== template.type);
      return [template, ...filtered].slice(0, 10); // Keep only 10 recent items
    });
  };

  const toggleCategory = (category: NodeCategory) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const categories = [
    { key: 'triggers' as NodeCategory, title: '트리거', templates: getNodeTemplatesByCategory('triggers') },
    { key: 'actions' as NodeCategory, title: '액션', templates: getNodeTemplatesByCategory('actions') },
    { key: 'logic' as NodeCategory, title: '로직', templates: getNodeTemplatesByCategory('logic') },
    { key: 'transform' as NodeCategory, title: '변환', templates: getNodeTemplatesByCategory('transform') },
  ];

  const favoriteTemplates = useMemo(() => {
    const allTemplates = getAllNodeTemplates();
    return allTemplates.filter(template => favorites.has(template.type));
  }, [favorites]);

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categories;
    return categories.map(category => ({
      ...category,
      templates: category.templates.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(category => category.templates.length > 0);
  }, [searchTerm]);

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">노드 팔레트</h2>
        
        {/* Search */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="노드 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { key: 'all', label: '전체', count: getAllNodeTemplates().length },
            { key: 'favorites', label: '즐겨찾기', count: favorites.size },
            { key: 'recent', label: '최근', count: recentNodes.length },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`
                flex-1 py-2 px-3 text-xs font-medium rounded-md transition-colors
                ${activeTab === key 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              {label}
              {count > 0 && (
                <span className="ml-1 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'all' && (
          <div className="space-y-1">
            {searchTerm ? (
              // Show search results
              <div>
                {filteredCategories.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                    </svg>
                    <p className="text-sm">'{searchTerm}'에 대한 검색 결과가 없습니다</p>
                  </div>
                ) : (
                  filteredCategories.map(({ key, title, templates }) => (
                    <NodeCategorySection
                      key={key}
                      category={key}
                      title={title}
                      templates={templates}
                      isExpanded={true}
                      onToggle={() => {}}
                      searchTerm={searchTerm}
                      favorites={favorites}
                      onAddToFavorites={addToFavorites}
                      onRemoveFromFavorites={removeFromFavorites}
                    />
                  ))
                )}
              </div>
            ) : (
              // Show categories
              categories.map(({ key, title, templates }) => (
                <NodeCategorySection
                  key={key}
                  category={key}
                  title={title}
                  templates={templates}
                  isExpanded={expandedCategories.has(key)}
                  onToggle={() => toggleCategory(key)}
                  searchTerm={searchTerm}
                  favorites={favorites}
                  onAddToFavorites={addToFavorites}
                  onRemoveFromFavorites={removeFromFavorites}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="space-y-2">
            {favoriteTemplates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <p className="text-sm">즐겨찾기한 노드가 없습니다</p>
                <p className="text-xs text-gray-400 mt-1">별표를 클릭하여 자주 사용하는 노드를 추가하세요</p>
              </div>
            ) : (
              favoriteTemplates.map((template) => (
                <DraggableNode 
                  key={template.type} 
                  template={template}
                  isFavorite={true}
                  onRemoveFromFavorites={removeFromFavorites}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'recent' && (
          <div className="space-y-2">
            {recentNodes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm">최근 사용한 노드가 없습니다</p>
                <p className="text-xs text-gray-400 mt-1">노드를 사용하면 여기에 표시됩니다</p>
              </div>
            ) : (
              recentNodes.map((template) => (
                <DraggableNode 
                  key={template.type} 
                  template={template}
                  isFavorite={favorites.has(template.type)}
                  onAddToFavorites={addToFavorites}
                  onRemoveFromFavorites={removeFromFavorites}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Help */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-blue-50 rounded-lg p-3">
          <h3 className="text-sm font-medium text-blue-900 mb-2">사용 방법</h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• 노드를 드래그하여 캔버스에 추가</li>
            <li>• 별표를 클릭하여 즐겨찾기 추가</li>
            <li>• 검색으로 원하는 노드 빠르게 찾기</li>
            <li>• 탭으로 카테고리별 노드 탐색</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NodePalette; 