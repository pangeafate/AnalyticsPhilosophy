import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  MarkerType,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import ChartNode from './ChartNode';
import './AnalyticsFlow.css';

const nodeTypes = {
  chartNode: ChartNode,
};

// Edge marker definitions for better visibility
const defaultEdgeOptions = {
  style: { strokeWidth: 4, stroke: '#ffffff' }, // Changed to bright white
  type: 'smoothstep',
  animated: true,
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: '#ffffff', // Changed to bright white
    width: 20,
    height: 20,
  },
};

// Mock data for analytics
const mockData = {
  totalExpenses: [
    { name: 'Q1', value: 120000, breakdown: 80000 },
    { name: 'Q2', value: 135000, breakdown: 85000 },
    { name: 'Q3', value: 142000, breakdown: 92000 },
    { name: 'Q4', value: 158000, breakdown: 98000 },
  ],
  businessUnitExpenses: [
    { name: 'Q1', value: 45000 },
    { name: 'Q2', value: 52000 },
    { name: 'Q3', value: 48000 },
    { name: 'Q4', value: 55000 },
  ],
  areaExpenses: [
    { name: 'Q1', value: 35000 },
    { name: 'Q2', value: 33000 },
    { name: 'Q3', value: 44000 },
    { name: 'Q4', value: 43000 },
  ],
  productExpenses: [
    { name: 'Q1', value: 25000 },
    { name: 'Q2', value: 28000 },
    { name: 'Q3', value: 30000 },
    { name: 'Q4', value: 32000 },
  ],
  totalRevenue: [
    { name: 'Q1', value: 250000 },
    { name: 'Q2', value: 280000 },
    { name: 'Q3', value: 295000 },
    { name: 'Q4', value: 320000 },
  ],
};

// Level 2 chart data generator
const generateLevel2Data = (chartId) => {
  const baseData = [
    { name: 'Q1', value: Math.floor(Math.random() * 50000) + 10000 },
    { name: 'Q2', value: Math.floor(Math.random() * 50000) + 10000 },
    { name: 'Q3', value: Math.floor(Math.random() * 50000) + 10000 },
    { name: 'Q4', value: Math.floor(Math.random() * 50000) + 10000 },
  ];
  return baseData;
};

// Level 3 chart data generator
const generateLevel3Data = () => {
  return [
    { name: 'Q1', value: Math.floor(Math.random() * 25000) + 5000 },
    { name: 'Q2', value: Math.floor(Math.random() * 25000) + 5000 },
    { name: 'Q3', value: Math.floor(Math.random() * 25000) + 5000 },
    { name: 'Q4', value: Math.floor(Math.random() * 25000) + 5000 },
  ];
};

// Initial nodes - only 2 nodes: Company Expenses and Company Revenue
const initialNodes = [
  {
    id: 'company-expenses',
    type: 'chartNode',
    position: { x: 50, y: 100 }, // Moved further left
    data: {
      title: 'Company-level Expenses',
      level: 1,
      charts: [
        {
          id: 'total-expenses',
          title: 'Total Expenses',
          data: mockData.totalExpenses,
          type: 'area',
          expandable: true
        },
        {
          id: 'business-unit-expenses',
          title: 'Business Unit Expenses', 
          data: mockData.businessUnitExpenses,
          type: 'area',
          expandable: true
        },
        {
          id: 'area-expenses',
          title: 'Area Expenses',
          data: mockData.areaExpenses,
          type: 'area',
          expandable: true
        },
        {
          id: 'product-expenses',
          title: 'Product Expenses',
          data: mockData.productExpenses,
          type: 'area',
          expandable: true
        }
      ]
    }
  },
  {
    id: 'company-revenue',
    type: 'chartNode',
    position: { x: 900, y: 100 }, // Moved further right
    data: {
      title: 'Company-level Revenue',
      level: 1,
      charts: [
        {
          id: 'total-revenue',
          title: 'Total Revenue',
          data: mockData.totalRevenue,
          type: 'area',
          expandable: true
        },
        {
          id: 'business-unit-revenue',
          title: 'Business Unit Revenue',
          data: mockData.businessUnitExpenses.map(d => ({ ...d, value: d.value * 2.5 })),
          type: 'area',
          expandable: true
        },
        {
          id: 'area-revenue',
          title: 'Area Revenue', 
          data: mockData.areaExpenses.map(d => ({ ...d, value: d.value * 3 })),
          type: 'area',
          expandable: true
        },
        {
          id: 'product-revenue',
          title: 'Product Revenue',
          data: mockData.productExpenses.map(d => ({ ...d, value: d.value * 4 })),
          type: 'area',
          expandable: true
        }
      ]
    }
  }
];

// Initial edges - no connections between main nodes
const initialEdges = [];

function AnalyticsFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { fitView } = useReactFlow();
  const nodePositions = useRef(new Map()); // Track all node positions for collision detection

  // Initialize position tracking with initial nodes
  React.useEffect(() => {
    nodePositions.current.clear();
    initialNodes.forEach(node => {
      nodePositions.current.set(node.id, {
        x: node.position.x,
        y: node.position.y,
        width: 550, // Node width + margin
        height: 400  // Node height + margin
      });
    });
  }, []);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Collision detection function
  const checkCollision = (newPos, newSize, excludeNodeId = null) => {
    for (let [nodeId, pos] of nodePositions.current.entries()) {
      if (nodeId === excludeNodeId) continue;
      
      // Check if rectangles overlap (with reduced margin for tighter spacing)
      const margin = 50; // Reduced margin for better node density
      if (newPos.x < pos.x + pos.width + margin &&
          newPos.x + newSize.width + margin > pos.x &&
          newPos.y < pos.y + pos.height + margin &&
          newPos.y + newSize.height + margin > pos.y) {
        return true; // Collision detected
      }
    }
    return false;
  };

  // Find non-overlapping position using spiral search
  const findNonOverlappingPosition = (preferredPos, nodeSize, excludeNodeId = null) => {
    const nodeWidth = nodeSize.width || 550;
    const nodeHeight = nodeSize.height || 400;
    
    // Start with preferred position
    if (!checkCollision(preferredPos, { width: nodeWidth, height: nodeHeight }, excludeNodeId)) {
      return preferredPos;
    }

    // Spiral search for available position with tighter spacing
    const maxRadius = 1500; // Reduced maximum search radius
    const angleStep = Math.PI / 6; // Smaller angle steps (30 degrees)
    const radiusStep = 100; // Smaller step size for radius

    for (let radius = radiusStep; radius <= maxRadius; radius += radiusStep) {
      for (let angle = 0; angle < 2 * Math.PI; angle += angleStep) {
        const testPos = {
          x: preferredPos.x + Math.cos(angle) * radius,
          y: preferredPos.y + Math.sin(angle) * radius
        };

        if (!checkCollision(testPos, { width: nodeWidth, height: nodeHeight }, excludeNodeId)) {
          return testPos;
        }
      }
    }

    // Fallback: place in a grid pattern if spiral search fails
    const gridSize = 600; // Reduced grid size for tighter spacing
    for (let gridX = 0; gridX < 8; gridX++) {
      for (let gridY = 0; gridY < 8; gridY++) {
        const testPos = {
          x: preferredPos.x + (gridX - 4) * gridSize,
          y: preferredPos.y + (gridY - 4) * gridSize
        };
        
        if (!checkCollision(testPos, { width: nodeWidth, height: nodeHeight }, excludeNodeId)) {
          return testPos;
        }
      }
    }

    // Final fallback: place closer to preferred position
    return {
      x: preferredPos.x + Math.random() * 1000 + 500,
      y: preferredPos.y + Math.random() * 1000 + 500
    };
  };

  // Enhanced position calculation with collision detection
  const calculatePosition = (level, sourcePosition, sourceNodeId) => {
    let basePosition;
    
    if (level === 2) {
      // For level 2, use source position as center and find spots around it
      // Calculate angle based on existing nodes to distribute evenly
      const existingLevel2Nodes = nodes.filter(n => n.data.level === 2);
      const angleStep = (2 * Math.PI) / 4; // 4 possible positions around the source
      const angle = existingLevel2Nodes.length * angleStep;
      const radius = 600; // Reduced radius for tighter clustering
      basePosition = {
        x: sourcePosition.x + Math.cos(angle) * radius,
        y: sourcePosition.y + Math.sin(angle) * radius
      };
    } else if (level === 3) {
      // For level 3, position relative to level 2 parent with more space
      // Calculate angle based on existing level 3 nodes from same parent
      const existingLevel3Nodes = nodes.filter(n => 
        n.data.level === 3 && n.data.parentNodeId === sourceNodeId
      );
      const angleStep = (2 * Math.PI) / 4; // 4 possible positions around the parent
      const angle = existingLevel3Nodes.length * angleStep;
      const radius = 750; // Increased radius for more space between level 2 and 3
      basePosition = {
        x: sourcePosition.x + Math.cos(angle) * radius,
        y: sourcePosition.y + Math.sin(angle) * radius
      };
    } else {
      return sourcePosition;
    }

    // Find non-overlapping position with tighter spacing
    return findNonOverlappingPosition(basePosition, { width: 550, height: 400 });
  };

  // Calculate closest sides for edge connection
  const calculateClosestSides = (sourcePosition, targetPosition) => {
    const deltaX = targetPosition.x - sourcePosition.x;
    const deltaY = targetPosition.y - sourcePosition.y;
    
    let sourceHandle, targetHandle;
    
    // Determine source handle (which side of source chart)
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal connection is primary
      sourceHandle = deltaX > 0 ? 'right' : 'left';
    } else {
      // Vertical connection is primary
      sourceHandle = deltaY > 0 ? 'bottom' : 'top';
    }
    
    // Determine target handle (opposite side of target node)
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal connection is primary
      targetHandle = deltaX > 0 ? 'left' : 'right';
    } else {
      // Vertical connection is primary
      targetHandle = deltaY > 0 ? 'top' : 'bottom';
    }
    
    return { sourceHandle, targetHandle };
  };

  const handleNodeClose = useCallback((nodeId) => {
    // Remove the node and all its connected edges
    setNodes((nds) => nds.filter(node => node.id !== nodeId));
    setEdges((eds) => eds.filter(edge => 
      edge.source !== nodeId && edge.target !== nodeId
    ));
    
    // Remove from position tracking
    nodePositions.current.delete(nodeId);
    
    // Recalculate positions with better zoom control
    setTimeout(() => {
      fitView({ 
        padding: 0.1, // 10% padding to achieve 80% viewport utilization
        duration: 600,
        minZoom: 0.3, // Increased minimum zoom to prevent over-zooming
        maxZoom: 1.2
      });
    }, 100);
  }, [setNodes, setEdges, fitView]);

  const handleChartClick = useCallback((chartId, nodeId) => {
    const sourceNode = nodes.find(n => n.id === nodeId);
    if (!sourceNode) return;

    const chart = sourceNode.data.charts.find(c => c.id === chartId);
    if (!chart?.expandable) return;

    const newNodeId = `${chartId}-detail`;
    
    // Check if node already exists
    const existingNode = nodes.find(n => n.id === newNodeId);
    if (existingNode) return;

    let newNodeData;
    const sourceLevel = sourceNode.data.level || 1;
    
    if (sourceLevel === 1) {
      // Creating Level 2 node
      newNodeData = {
        title: chart.title,
        level: 2,
        parentNodeId: nodeId,
        parentChartId: chartId,
        charts: [
          {
            id: `${chartId}-breakdown-1`,
            title: `${chart.title} - Breakdown 1`,
            data: generateLevel2Data(chartId),
            type: 'area',
            expandable: true // Only first chart is expandable to level 3
          },
          {
            id: `${chartId}-breakdown-2`,
            title: `${chart.title} - Breakdown 2`,
            data: generateLevel2Data(chartId),
            type: 'bar',
            expandable: false
          },
          {
            id: `${chartId}-breakdown-3`,
            title: `${chart.title} - Breakdown 3`,
            data: generateLevel2Data(chartId),
            type: 'line',
            expandable: false
          },
          {
            id: `${chartId}-breakdown-4`,
            title: `${chart.title} - Breakdown 4`,
            data: generateLevel2Data(chartId),
            type: 'area',
            expandable: false
          }
        ]
      };
    } else if (sourceLevel === 2) {
      // Creating Level 3 node (only from expandable charts in level 2)
      newNodeData = {
        title: `${chart.title} - Details`,
        level: 3,
        parentNodeId: nodeId,
        parentChartId: chartId,
        charts: [
          {
            id: `${chartId}-detail-1`,
            title: `${chart.title} - Detail 1`,
            data: generateLevel3Data(),
            type: 'area',
            expandable: false
          },
          {
            id: `${chartId}-detail-2`,
            title: `${chart.title} - Detail 2`,
            data: generateLevel3Data(),
            type: 'bar',
            expandable: false
          },
          {
            id: `${chartId}-detail-3`,
            title: `${chart.title} - Detail 3`,
            data: generateLevel3Data(),
            type: 'line',
            expandable: false
          },
          {
            id: `${chartId}-detail-4`,
            title: `${chart.title} - Detail 4`,
            data: generateLevel3Data(),
            type: 'area',
            expandable: false
          }
        ]
      };
    } else {
      return; // No level 4
    }

    // Calculate position with collision detection
    const newPosition = calculatePosition(sourceLevel + 1, sourceNode.position, nodeId);
    
    const newNode = {
      id: newNodeId,
      type: 'chartNode',
      position: newPosition,
      data: newNodeData
    };

    // Add to position tracking before updating state
    nodePositions.current.set(newNodeId, {
      x: newPosition.x,
      y: newPosition.y,
      width: 550,
      height: 400
    });

    // Calculate closest sides for optimal edge routing
    const { sourceHandle, targetHandle } = calculateClosestSides(sourceNode.position, newPosition);

    // Add edge from source chart to new node with enhanced dotted styling
    const newEdge = {
      id: `edge-${chartId}-${newNodeId}`,
      source: nodeId,
      target: newNodeId,
      sourceHandle: `chart-${chartId}-${sourceHandle}`, // Use calculated closest source side
      targetHandle: `node-${newNodeId}-${targetHandle}`, // Use calculated closest target side
      type: 'smoothstep', // Use built-in smoothstep type
      animated: true, // Add animation to make edges more visible
      style: { 
        stroke: '#ffffff', // Changed to bright white
        strokeWidth: 4, // Thicker for better visibility
        strokeDasharray: '8,4', // More pronounced dotted pattern
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#ffffff', // Changed to bright white
        width: 20,
        height: 20
      },
      data: {
        sourceChartId: chartId,
        sourceNodeId: nodeId,
        targetNodeId: newNodeId
      }
    };

    // Update nodes and edges atomically
    setNodes((nds) => nds.concat(newNode));
    setEdges((eds) => eds.concat(newEdge));
    
    // Auto-zoom to fit all nodes with better timing and zoom control
    setTimeout(() => {
      fitView({ 
        padding: 0.1, // 10% padding to achieve 80% viewport utilization
        duration: 800, // Faster animation
        minZoom: 0.3, // Increased minimum zoom to prevent over-zooming
        maxZoom: 1.2
      });
    }, 300); // Shorter delay for more responsive feel
  }, [nodes, setNodes, setEdges, fitView]);

  // Enhanced nodes change handler to track position updates
  const onNodesChangeWithTracking = useCallback((changes) => {
    // Update position tracking when nodes move
    changes.forEach(change => {
      if (change.type === 'position' && change.position) {
        nodePositions.current.set(change.id, {
          x: change.position.x,
          y: change.position.y,
          width: 550,
          height: 400
        });
      }
    });
    
    onNodesChange(changes);
  }, [onNodesChange]);

  // Update nodes with handlers
  const nodesWithHandlers = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      onChartClick: (chartId) => handleChartClick(chartId, node.id),
      onNodeClose: node.data.level > 1 ? () => handleNodeClose(node.id) : undefined,
    },
  }));

  return (
    <div data-testid="analytics-flow" className="analytics-flow">
      <ReactFlow
        nodes={nodesWithHandlers}
        edges={edges}
        onNodesChange={onNodesChangeWithTracking}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ 
          padding: 0.1, // 10% padding to achieve 80% viewport utilization
          minZoom: 0.3, // Increased minimum zoom to prevent over-zooming
          maxZoom: 1.2,
          includeHiddenNodes: false
        }}
        deleteKeyCode={null} // Disable delete key to prevent accidental deletions
        multiSelectionKeyCode={null} // Disable multi-selection
        nodesDraggable={true} // Allow dragging for manual repositioning
        minZoom={0.3} // Set minimum zoom at component level
        maxZoom={1.2} // Set maximum zoom at component level
      >
        <MiniMap 
          nodeStrokeColor="#8b5cf6"
          nodeColor="#f8fafc"
          nodeBorderRadius={8}
          style={{ width: 100, height: 75 }}
        />
        <Controls 
          showZoom={true}
          showFitView={true}
          showInteractive={false}
        />
        <Background 
          variant="dots" 
          gap={20} 
          size={1}
          color="#e2e8f0"
        />
      </ReactFlow>
    </div>
  );
}

// Wrap with ReactFlowProvider in a separate component
function AnalyticsFlowWrapper() {
  return (
    <ReactFlowProvider>
      <AnalyticsFlow />
    </ReactFlowProvider>
  );
}

export default AnalyticsFlowWrapper; 