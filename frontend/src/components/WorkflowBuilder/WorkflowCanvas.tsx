import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  ReactFlowProvider,
  useReactFlow,
  SelectionMode,
  useKeyPress,
  useOnSelectionChange,
} from '@xyflow/react';
import { useDrop } from 'react-dnd';
import { v4 as uuidv4 } from 'uuid';

import WorkflowNode from './WorkflowNode';
import type { WorkflowNode as WorkflowNodeType, NodeTemplate, NodeType } from '../../types/workflow';
import '@xyflow/react/dist/style.css';

const nodeTypes = {
  workflowNode: WorkflowNode as any,
};

interface WorkflowCanvasProps {
  selectedNodeId: string | null;
  onNodeSelect: (nodeId: string | null) => void;
  onNodeUpdate: (nodeId: string, updates: Partial<WorkflowNodeType>) => void;
  onWorkflowChange: (nodes: WorkflowNodeType[], connections: any[]) => void;
}

const WorkflowCanvasInner: React.FC<WorkflowCanvasProps> = ({
  selectedNodeId,
  onNodeSelect,
  onNodeUpdate,
  onWorkflowChange,
}) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<string[]>([]);
  const { screenToFlowPosition, getViewport, setViewport } = useReactFlow();

  // Keyboard shortcuts
  const deletePressed = useKeyPress('Delete');
  const copyPressed = useKeyPress(['Meta+c', 'Control+c']);
  const pastePressed = useKeyPress(['Meta+v', 'Control+v']);
  const selectAllPressed = useKeyPress(['Meta+a', 'Control+a']);
  const undoPressed = useKeyPress(['Meta+z', 'Control+z']);

  // Drop zone for dragging nodes from palette
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'node',
    drop: (item: { template: NodeTemplate }, monitor) => {
      const clientOffset = monitor.getClientOffset();
      if (clientOffset && reactFlowWrapper.current) {
        const boundingRect = reactFlowWrapper.current.getBoundingClientRect();
        const position = screenToFlowPosition({
          x: clientOffset.x - boundingRect.left,
          y: clientOffset.y - boundingRect.top,
        });

        addNode(item.template, position);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const addNode = useCallback((template: NodeTemplate, position: { x: number; y: number }) => {
    const newNodeId = uuidv4();

    const newReactFlowNode: Node = {
      id: newNodeId,
      type: 'workflowNode',
      position,
      data: {
        type: template.type,
        name: template.name,
        config: {},
        status: 'idle',
        onSelect: onNodeSelect,
        onDelete: deleteNode,
        onUpdate: onNodeUpdate,
      } as any,
    };

    setNodes((nds) => [...nds, newReactFlowNode]);
  }, [onNodeSelect, onNodeUpdate]);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    if (selectedNodeId === nodeId) {
      onNodeSelect(null);
    }
  }, [selectedNodeId, onNodeSelect]);

  const deleteSelectedElements = useCallback(() => {
    if (selectedNodes.length > 0) {
      setNodes((nds) => nds.filter((node) => !selectedNodes.includes(node.id)));
      setEdges((eds) => eds.filter((edge) => 
        !selectedNodes.includes(edge.source) && !selectedNodes.includes(edge.target)
      ));
    }
    if (selectedEdges.length > 0) {
      setEdges((eds) => eds.filter((edge) => !selectedEdges.includes(edge.id)));
    }
    onNodeSelect(null);
  }, [selectedNodes, selectedEdges, onNodeSelect]);

  const duplicateSelectedNodes = useCallback(() => {
    if (selectedNodes.length === 0) return;

    const nodesToDuplicate = nodes.filter(node => selectedNodes.includes(node.id));
    const newNodes: Node[] = [];

    nodesToDuplicate.forEach(node => {
      const newNodeId = uuidv4();
      const newNode: Node = {
        ...node,
        id: newNodeId,
        position: {
          x: node.position.x + 50,
          y: node.position.y + 50,
        },
        selected: false,
      };
      newNodes.push(newNode);
    });

    setNodes((nds) => [...nds, ...newNodes]);
  }, [nodes, selectedNodes]);

  const selectAllNodes = useCallback((e: KeyboardEvent) => {
    e.preventDefault();
    const allNodeIds = nodes.map(node => node.id);
    setSelectedNodes(allNodeIds);
    setNodes((nds) => nds.map(node => ({ ...node, selected: true })));
  }, [nodes]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (deletePressed) {
      deleteSelectedElements();
    }
  }, [deletePressed, deleteSelectedElements]);

  useEffect(() => {
    if (copyPressed && selectedNodes.length > 0) {
      // Store in localStorage for simplicity
      const selectedNodeData = nodes.filter(node => selectedNodes.includes(node.id));
      localStorage.setItem('copiedNodes', JSON.stringify(selectedNodeData));
    }
  }, [copyPressed, selectedNodes, nodes]);

  useEffect(() => {
    if (pastePressed) {
      const copiedNodes = localStorage.getItem('copiedNodes');
      if (copiedNodes) {
        try {
          const nodeData = JSON.parse(copiedNodes);
          const viewport = getViewport();
          const pastePosition = { x: viewport.x + 100, y: viewport.y + 100 };
          
          nodeData.forEach((nodeData: any, index: number) => {
            const newNodeId = uuidv4();
            const newNode: Node = {
              ...nodeData,
              id: newNodeId,
              position: {
                x: pastePosition.x + (index * 20),
                y: pastePosition.y + (index * 20),
              },
              selected: false,
            };
            setNodes((nds) => [...nds, newNode]);
          });
        } catch (error) {
          console.error('Failed to paste nodes:', error);
        }
      }
    }
  }, [pastePressed, getViewport]);

  useEffect(() => {
    if (selectAllPressed) {
      selectAllNodes(selectAllPressed as any);
    }
  }, [selectAllPressed, selectAllNodes]);

  const onConnect = useCallback(
    (params: Connection) => {
      // Validate connection
      if (params.source === params.target) {
        return; // Prevent self-connection
      }

      // Check for existing connection
      const existingEdge = edges.find(
        edge => edge.source === params.source && edge.target === params.target
      );
      if (existingEdge) {
        return; // Prevent duplicate connections
      }

      const edge: Edge = {
        ...params,
        id: uuidv4(),
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#6366f1', strokeWidth: 2 },
      } as Edge;
      setEdges((eds) => addEdge(edge, eds));
    },
    [edges]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onNodeSelect(node.id);
    },
    [onNodeSelect]
  );

  const onPaneClick = useCallback(() => {
    onNodeSelect(null);
  }, [onNodeSelect]);

  // Handle selection changes
  useOnSelectionChange({
    onChange: ({ nodes: selectedNodes, edges: selectedEdges }) => {
      setSelectedNodes(selectedNodes.map(node => node.id));
      setSelectedEdges(selectedEdges.map(edge => edge.id));
    },
  });

  // Update node data when external updates occur
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNodeId) {
          return {
            ...node,
            selected: true,
          };
        }
        return {
          ...node,
          selected: false,
        };
      })
    );
  }, [selectedNodeId, setNodes]);

  // Update node with new data
  const updateNodeData = useCallback((nodeId: string, updates: Partial<WorkflowNodeType>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...updates,
            },
          };
        }
        return node;
      })
    );
    onNodeUpdate(nodeId, updates);
  }, [onNodeUpdate]);

  // Notify parent of workflow changes
  useEffect(() => {
    const workflowNodes: WorkflowNodeType[] = nodes.map((node) => {
      const nodeData = node.data as any;
      return {
        id: node.id,
        type: (nodeData?.type || '') as NodeType,
        name: nodeData?.name || '',
        config: nodeData?.config || {},
        position: node.position,
        status: nodeData?.status || 'idle',
      };
    });

    const connections = edges.map((edge) => ({
      id: edge.id,
      sourceNodeId: edge.source,
      targetNodeId: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
    }));

    onWorkflowChange(workflowNodes, connections);
  }, [nodes, edges, onWorkflowChange]);

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    // Select edge for deletion
    setSelectedEdges([edge.id]);
    setEdges((eds) => eds.map(e => ({ ...e, selected: e.id === edge.id })));
  }, []);

  return (
    <div
      ref={(el) => {
        drop(el);
        reactFlowWrapper.current = el;
      }}
      className={`flex-1 h-full relative ${isOver ? 'bg-blue-50' : 'bg-gray-50'}`}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        className="bg-gray-50"
        selectionMode={SelectionMode.Partial}
        multiSelectionKeyCode="Meta"
        deleteKeyCode="Delete"
        snapToGrid={true}
        snapGrid={[20, 20]}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.1}
        maxZoom={4}
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
      >
        <Background 
          variant="dots" 
          gap={20} 
          size={1} 
          color="#e5e7eb"
        />
        <Controls 
          showZoom={true}
          showFitView={true}
          showInteractive={true}
          position="bottom-left"
        />
        <MiniMap 
          nodeColor="#6366f1"
          nodeStrokeWidth={3}
          pannable={true}
          zoomable={true}
          position="bottom-right"
          style={{ 
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
          }}
        />
      </ReactFlow>

      {/* Drop overlay */}
      {isOver && (
        <div className="absolute inset-0 bg-blue-100 bg-opacity-50 flex items-center justify-center pointer-events-none z-10">
          <div className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>노드를 여기에 놓으세요</span>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard shortcuts help */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 text-xs text-gray-600 max-w-xs opacity-75 hover:opacity-100 transition-opacity">
        <h4 className="font-medium text-gray-900 mb-2">키보드 단축키</h4>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>삭제:</span>
            <kbd className="px-1 py-0.5 bg-gray-100 rounded">Delete</kbd>
          </div>
          <div className="flex justify-between">
            <span>복사:</span>
            <kbd className="px-1 py-0.5 bg-gray-100 rounded">Cmd+C</kbd>
          </div>
          <div className="flex justify-between">
            <span>붙여넣기:</span>
            <kbd className="px-1 py-0.5 bg-gray-100 rounded">Cmd+V</kbd>
          </div>
          <div className="flex justify-between">
            <span>전체 선택:</span>
            <kbd className="px-1 py-0.5 bg-gray-100 rounded">Cmd+A</kbd>
          </div>
        </div>
      </div>

      {/* Selection info */}
      {(selectedNodes.length > 0 || selectedEdges.length > 0) && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg px-4 py-2 text-sm text-gray-700">
          {selectedNodes.length > 0 && (
            <span>{selectedNodes.length}개 노드 선택됨</span>
          )}
          {selectedNodes.length > 0 && selectedEdges.length > 0 && <span>, </span>}
          {selectedEdges.length > 0 && (
            <span>{selectedEdges.length}개 연결 선택됨</span>
          )}
        </div>
      )}
    </div>
  );
};

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner {...props} />
    </ReactFlowProvider>
  );
};

export default WorkflowCanvas; 