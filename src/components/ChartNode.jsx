import React, { useState } from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Handle, Position } from 'reactflow';
import './ChartNode.css';

const ChartComponent = ({ chart, onChartClick, nodeId }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (chart.expandable && onChartClick) {
      onChartClick(chart.id);
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const renderChart = () => {
    switch (chart.type) {
      case 'area':
        return (
          <AreaChart data={chart.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" />
            {chart.data[0]?.breakdown && (
              <Area type="monotone" dataKey="breakdown" stroke="#82ca9d" fill="#82ca9d" />
            )}
          </AreaChart>
        );
      case 'bar':
        return (
          <BarChart data={chart.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        );
      case 'line':
        return (
          <LineChart data={chart.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        );
      case 'funnel':
        return (
          <BarChart layout="horizontal" data={chart.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        );
      default:
        return null;
    }
  };

  return (
    <div
      data-testid={`chart-${chart.id}`}
      data-zoomable="true"
      className={`chart-container ${isHovered ? 'chart-hover' : ''} ${chart.expandable ? 'expandable' : ''}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-handleid={`chart-${chart.id}`}
    >
      {/* Source handles for edge connections on all four sides */}
      {chart.expandable && (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id={`chart-${chart.id}-right`}
            style={{
              background: 'transparent',
              border: 'none',
              width: 16,
              height: 16,
              right: -8,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1000,
              opacity: 0,
            }}
          />
          <Handle
            type="source"
            position={Position.Left}
            id={`chart-${chart.id}-left`}
            style={{
              background: 'transparent',
              border: 'none',
              width: 16,
              height: 16,
              left: -8,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1000,
              opacity: 0,
            }}
          />
          <Handle
            type="source"
            position={Position.Top}
            id={`chart-${chart.id}-top`}
            style={{
              background: 'transparent',
              border: 'none',
              width: 16,
              height: 16,
              left: '50%',
              top: -8,
              transform: 'translateX(-50%)',
              zIndex: 1000,
              opacity: 0,
            }}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id={`chart-${chart.id}-bottom`}
            style={{
              background: 'transparent',
              border: 'none',
              width: 16,
              height: 16,
              left: '50%',
              bottom: -8,
              transform: 'translateX(-50%)',
              zIndex: 1000,
              opacity: 0,
            }}
          />
        </>
      )}
      <h4 className="chart-title">{chart.title}</h4>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={120}>
          {renderChart()}
        </ResponsiveContainer>
      </div>
      {chart.expandable && (
        <div className="expand-indicator">
          <span>Click to expand</span>
        </div>
      )}
    </div>
  );
};

const ChartNode = ({ data, id }) => {
  const handleCloseClick = () => {
    if (data.onNodeClose) {
      data.onNodeClose();
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 1: return '#667eea'; // Blue for level 1
      case 2: return '#f093fb'; // Pink for level 2  
      case 3: return '#4facfe'; // Light blue for level 3
      default: return '#667eea';
    }
  };

  const getLevelBackground = (level) => {
    switch (level) {
      case 1: return 'rgba(255, 255, 255, 0.98)'; // Brightest - crisp white for company level
      case 2: return 'rgba(210, 210, 220, 0.90)'; // Much darker gray for second level  
      case 3: return 'rgba(170, 170, 185, 0.85)'; // Very dark gray for third level
      default: return 'rgba(255, 255, 255, 0.98)';
    }
  };

  const levelColor = getLevelColor(data.level);
  const levelBackground = getLevelBackground(data.level);

  return (
    <div 
      data-testid={`node-${id}`}
      className="analytics-node rectangular-node"
      style={{
        borderColor: `${levelColor}40`, // 40 is alpha for transparency
        '--level-color': levelColor,
        background: levelBackground // Apply level-based background
      }}
    >
      {/* Target handles for incoming edge connections on all four sides */}
      <Handle
        type="target"
        position={Position.Left}
        id={`node-${id}-left`}
        style={{
          background: 'transparent',
          border: 'none',
          width: 16,
          height: 16,
          left: -8,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1000,
          opacity: 0,
        }}
      />
      <Handle
        type="target"
        position={Position.Right}
        id={`node-${id}-right`}
        style={{
          background: 'transparent',
          border: 'none',
          width: 16,
          height: 16,
          right: -8,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1000,
          opacity: 0,
        }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id={`node-${id}-top`}
        style={{
          background: 'transparent',
          border: 'none',
          width: 16,
          height: 16,
          left: '50%',
          top: -8,
          transform: 'translateX(-50%)',
          zIndex: 1000,
          opacity: 0,
        }}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id={`node-${id}-bottom`}
        style={{
          background: 'transparent',
          border: 'none',
          width: 16,
          height: 16,
          left: '50%',
          bottom: -8,
          transform: 'translateX(-50%)',
          zIndex: 1000,
          opacity: 0,
        }}
      />
      
      <div className="node-header">
        <h3 style={{ 
          background: `linear-gradient(135deg, ${levelColor} 0%, #764ba2 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          {data.title}
        </h3>
        {data.onNodeClose && (
          <button 
            data-testid={`close-button-${id}`}
            className="close-button"
            onClick={handleCloseClick}
            aria-label="Close node"
            title="Close this node"
          >
            ✕
          </button>
        )}
      </div>
      <div 
        data-testid={`charts-grid-${id}`}
        className="charts-grid charts-grid-2x2"
      >
        {data.charts.map((chart) => (
          <ChartComponent
            key={chart.id}
            chart={chart}
            onChartClick={data.onChartClick}
            nodeId={id}
          />
        ))}
      </div>
    </div>
  );
};

export default ChartNode; 