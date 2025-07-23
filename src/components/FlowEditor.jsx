import React, { useState, useCallback } from 'react';
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Custom node component with delete button
const CustomNode = ({ data, id }) => {
  return (
    <div style={{ padding: 10, border: '1px solid #777', borderRadius: 5, background: 'white' }}>
      <div>{data.label}</div>
      <button 
        data-testid={`delete-node-${id}`}
        onClick={data.onDelete}
        style={{ marginTop: 5, fontSize: 12 }}
      >
        Delete
      </button>
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

const initialNodes = [
  { id: '1', type: 'custom', position: { x: 100, y: 100 }, data: { label: 'Node 1' } },
  { id: '2', type: 'custom', position: { x: 300, y: 100 }, data: { label: 'Node 2' } },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2' },
];

function FlowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nodeId, setNodeId] = useState(3);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const deleteNode = useCallback((nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => 
      edge.source !== nodeId && edge.target !== nodeId
    ));
  }, [setNodes, setEdges]);

  // Update nodes with delete handler
  const nodesWithDelete = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      onDelete: () => deleteNode(node.id),
    },
  }));

  const addNode = () => {
    const newNode = {
      id: nodeId.toString(),
      type: 'custom',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { label: `Node ${nodeId}` },
    };
    setNodes((nds) => nds.concat(newNode));
    setNodeId(nodeId + 1);
  };

  return (
    <div data-testid="flow-editor" style={{ width: '100vw', height: '100vh' }}>
      <button onClick={addNode} style={{ position: 'absolute', zIndex: 10, top: 10, left: 10 }}>
        Add Node
      </button>
      <ReactFlow
        nodes={nodesWithDelete}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}

export default FlowEditor;