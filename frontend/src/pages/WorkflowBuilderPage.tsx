import React, { useState, useCallback, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import WorkflowCanvas from '../components/WorkflowBuilder/WorkflowCanvas';
import NodePalette from '../components/WorkflowBuilder/NodePalette';
import NodeConfigPanel from '../components/WorkflowBuilder/NodeConfigPanel';
import { useToast } from '../hooks/useToast';

import type { WorkflowNode, WorkflowConnection } from '../types/workflow';
import type { RootState } from '../store';
import { workflowService } from '../services/workflowService';

const WorkflowBuilderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  
  const [workflow, setWorkflow] = useState<any>(null);
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [connections, setConnections] = useState<WorkflowConnection[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { user } = useSelector((state: RootState) => state.auth);

  // Load workflow if editing existing one
  useEffect(() => {
    if (id && id !== 'new') {
      loadWorkflow(id);
    } else {
      // Initialize new workflow
      setWorkflow({
        name: '새 워크플로우',
        description: '',
        isActive: false,
      });
    }
  }, [id]);

  // Auto-save functionality
  useEffect(() => {
    if (hasUnsavedChanges && workflow) {
      const autoSaveTimer = setTimeout(() => {
        handleAutoSave();
      }, 30000); // Auto-save every 30 seconds

      return () => clearTimeout(autoSaveTimer);
    }
  }, [hasUnsavedChanges, workflow, nodes, connections]);

  // Prevent leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const loadWorkflow = async (workflowId: string) => {
    setIsLoading(true);
    try {
      const response = await workflowService.getWorkflow(workflowId);
      setWorkflow(response.data);
      setNodes(response.data.nodes || []);
      setConnections(response.data.connections || []);
      setLastSaved(new Date(response.data.updatedAt));
    } catch (error) {
      showToast('워크플로우를 불러오는데 실패했습니다.', 'error');
      navigate('/workflows');
    } finally {
      setIsLoading(false);
    }
  };

  const validateWorkflow = useCallback(() => {
    const errors: string[] = [];

    // Check if workflow has a name
    if (!workflow?.name?.trim()) {
      errors.push('워크플로우 이름이 필요합니다.');
    }

    // Check for nodes
    if (nodes.length === 0) {
      errors.push('최소 하나의 노드가 필요합니다.');
    }

    // Check for trigger nodes
    const triggerNodes = nodes.filter(node => node.type.startsWith('trigger'));
    if (triggerNodes.length === 0) {
      errors.push('최소 하나의 트리거 노드가 필요합니다.');
    }

    // Check for disconnected nodes
    const connectedNodeIds = new Set();
    connections.forEach(conn => {
      connectedNodeIds.add(conn.sourceNodeId);
      connectedNodeIds.add(conn.targetNodeId);
    });
    
    const disconnectedNodes = nodes.filter(node => 
      !connectedNodeIds.has(node.id) && nodes.length > 1
    );
    if (disconnectedNodes.length > 0) {
      errors.push(`${disconnectedNodes.length}개의 연결되지 않은 노드가 있습니다.`);
    }

    // Check for cycles
    const hasCycle = checkForCycles();
    if (hasCycle) {
      errors.push('워크플로우에 순환 참조가 있습니다.');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  }, [workflow, nodes, connections]);

  const checkForCycles = useCallback(() => {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycleDFS = (nodeId: string): boolean => {
      if (recursionStack.has(nodeId)) return true;
      if (visited.has(nodeId)) return false;

      visited.add(nodeId);
      recursionStack.add(nodeId);

      const outgoingConnections = connections.filter(conn => conn.sourceNodeId === nodeId);
      for (const conn of outgoingConnections) {
        if (hasCycleDFS(conn.targetNodeId)) return true;
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const node of nodes) {
      if (!visited.has(node.id)) {
        if (hasCycleDFS(node.id)) return true;
      }
    }

    return false;
  }, [nodes, connections]);

  const handleWorkflowChange = useCallback((newNodes: WorkflowNode[], newConnections: any[]) => {
    setNodes(newNodes);
    setConnections(newConnections.map(conn => ({
      id: conn.id,
      sourceNodeId: conn.sourceNodeId,
      targetNodeId: conn.targetNodeId,
      sourceHandle: conn.sourceHandle,
      targetHandle: conn.targetHandle,
    })));
    setHasUnsavedChanges(true);
  }, []);

  const handleNodeUpdate = useCallback((nodeId: string, updates: Partial<WorkflowNode>) => {
    setNodes(prevNodes => 
      prevNodes.map(node => 
        node.id === nodeId ? { ...node, ...updates } : node
      )
    );
    setHasUnsavedChanges(true);
  }, []);

  const handleSave = async () => {
    if (!validateWorkflow()) {
      showToast('워크플로우 검증에 실패했습니다. 오류를 확인해주세요.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const workflowData = {
        ...workflow,
        nodes,
        connections,
      };

      let response;
      if (id && id !== 'new') {
        response = await workflowService.updateWorkflow(id, workflowData);
      } else {
        response = await workflowService.createWorkflow(workflowData);
        navigate(`/workflows/${response.data.id}/edit`, { replace: true });
      }

      setWorkflow(response.data);
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      showToast('워크플로우가 저장되었습니다.', 'success');
    } catch (error) {
      showToast('워크플로우 저장에 실패했습니다.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAutoSave = async () => {
    if (!workflow || !hasUnsavedChanges || isSaving) return;

    try {
      const workflowData = {
        ...workflow,
        nodes,
        connections,
      };

      if (id && id !== 'new') {
        await workflowService.updateWorkflow(id, workflowData);
        setHasUnsavedChanges(false);
        setLastSaved(new Date());
        showToast('자동 저장되었습니다.', 'info');
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  const handleExecute = async () => {
    if (!validateWorkflow()) {
      showToast('워크플로우를 실행하기 전에 오류를 수정해주세요.', 'error');
      return;
    }

    try {
      if (id && id !== 'new') {
        await workflowService.executeWorkflow(id);
        showToast('워크플로우가 실행되었습니다.', 'success');
      } else {
        showToast('워크플로우를 먼저 저장해주세요.', 'warning');
      }
    } catch (error) {
      showToast('워크플로우 실행에 실패했습니다.', 'error');
    }
  };

  const handleWorkflowNameChange = (name: string) => {
    setWorkflow(prev => ({ ...prev, name }));
    setHasUnsavedChanges(true);
  };

  const handleWorkflowDescriptionChange = (description: string) => {
    setWorkflow(prev => ({ ...prev, description }));
    setHasUnsavedChanges(true);
  };

  const selectedNode = selectedNodeId ? nodes.find(node => node.id === selectedNodeId) : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <svg className="w-6 h-6 animate-spin text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="text-lg text-gray-700">워크플로우를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/workflows')}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="flex-1">
                <input
                  type="text"
                  value={workflow?.name || ''}
                  onChange={(e) => handleWorkflowNameChange(e.target.value)}
                  className="text-xl font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                  placeholder="워크플로우 이름"
                />
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-sm text-gray-500">
                    {nodes.length}개 노드, {connections.length}개 연결
                  </span>
                  {lastSaved && (
                    <span className="text-sm text-gray-500">
                      마지막 저장: {lastSaved.toLocaleTimeString()}
                    </span>
                  )}
                  {hasUnsavedChanges && (
                    <span className="text-sm text-orange-600 font-medium">
                      저장되지 않은 변경사항
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Validation Status */}
              {validationErrors.length > 0 && (
                <div className="flex items-center space-x-2 text-red-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-sm font-medium">{validationErrors.length}개 오류</span>
                </div>
              )}

              {/* Execute Button */}
              <button
                onClick={handleExecute}
                disabled={validationErrors.length > 0 || !workflow}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h1m4 0h1M9 6h6" />
                </svg>
                <span>실행</span>
              </button>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={isSaving || !hasUnsavedChanges}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                )}
                <span>{isSaving ? '저장 중...' : '저장'}</span>
              </button>
            </div>
          </div>

          {/* Workflow Description */}
          <div className="mt-3">
            <input
              type="text"
              value={workflow?.description || ''}
              onChange={(e) => handleWorkflowDescriptionChange(e.target.value)}
              className="w-full text-sm text-gray-600 bg-transparent border-none focus:outline-none focus:ring-0 p-0"
              placeholder="워크플로우 설명을 입력하세요..."
            />
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-red-800">검증 오류</h4>
                  <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Node Palette */}
          <NodePalette />
          
          {/* Canvas */}
          <WorkflowCanvas
            selectedNodeId={selectedNodeId}
            onNodeSelect={setSelectedNodeId}
            onNodeUpdate={handleNodeUpdate}
            onWorkflowChange={handleWorkflowChange}
          />
          
          {/* Node Config Panel */}
          <NodeConfigPanel
            node={selectedNode}
            onUpdateNode={handleNodeUpdate}
            onClose={() => setSelectedNodeId(null)}
          />
        </div>
      </div>
    </DndProvider>
  );
};

export default WorkflowBuilderPage; 