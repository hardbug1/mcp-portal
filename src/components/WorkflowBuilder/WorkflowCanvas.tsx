import React, { useCallback, useState, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import { useDrop } from 'react-dnd';
import { v4 as uuidv4 } from 'uuid';

import WorkflowNode from './WorkflowNode';
import { WorkflowNode as WorkflowNodeType, NodeTemplate } from '../../types/workflow';
import { getNodeTemplateByType } from '../../types/nodeTemplates';

import '@xyflow/react/dist/style.css';

const nodeTypes = {
  workflowNode: WorkflowNode,
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
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition } = useReactFlow();

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
    const newWorkflowNode: WorkflowNodeType = {
      id: newNodeId,
      type: template.type,
      name: template.name,
      config: {},
      position,
      status: 'idle',
    };

    const newReactFlowNode: Node = {
      id: newNodeId,
      type: 'workflowNode',
      position,
      data: {
        ...newWorkflowNode,
        onSelect: onNodeSelect,
        onDelete: deleteNode,
      },
    };

    setNodes((nds) => nds.concat(newReactFlowNode));
  }, [onNodeSelect]);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    if (selectedNodeId === nodeId) {
      onNodeSelect(null);
    }
  }, [selectedNodeId, onNodeSelect]);

  const onConnect = useCallback(
    (params: Connection) => {
      const edge: Edge = {
        ...params,
        id: uuidv4(),
        type: 'smoothstep',
        animated: true,
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    []
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

  // Update node data when external updates occur
  React.useEffect(() => {
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

  // Update node configuration
  const handleNodeUpdate = useCallback((nodeId: string, updates: Partial<WorkflowNodeType>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          const updatedData = { ...node.data, ...updates };
          onNodeUpdate(nodeId, updates);
          return {
            ...node,
            data: updatedData,
          };
        }
        return node;
      })
    );
  }, [onNodeUpdate, setNodes]);

  // Notify parent of workflow changes
  React.useEffect(() => {
    const workflowNodes: WorkflowNodeType[] = nodes.map((node) => ({
      id: node.id,
      type: node.data.type,
      name: node.data.name,
      config: node.data.config,
      position: node.position,
      status: node.data.status,
    }));

    const connections = edges.map((edge) => ({
      id: edge.id,
      sourceNodeId: edge.source,
      targetNodeId: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
    }));

    onWorkflowChange(workflowNodes, connections);
  }, [nodes, edges, onWorkflowChange]);

  return (
    <div
      ref={(el) => {
        drop(el);
        reactFlowWrapper.current = el;
      }}
      className={`flex-1 h-full ${isOver ? 'bg-blue-50' : 'bg-gray-50'}`}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        className="bg-gray-50"
      >
        <Background color="#e5e7eb" gap={16} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const template = getNodeTemplateByType(node.data?.type);
            return template?.color || '#6b7280';
          }}
          className="bg-white border border-gray-200"
        />
      </ReactFlow>

      {/* Drop Overlay */}
      {isOver && (
        <div className="absolute inset-0 bg-blue-100 bg-opacity-50 flex items-center justify-center pointer-events-none">
          <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-blue-300 border-dashed">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto mb-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <p className="text-lg font-medium text-blue-900">노드를 여기에 놓으세요</p>
            </div>
          </div>
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