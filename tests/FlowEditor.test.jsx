import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FlowEditor from '../src/components/FlowEditor';

describe('FlowEditor Component', () => {
  test('renders without crashing', () => {
    render(<FlowEditor />);
    expect(screen.getByTestId('flow-editor')).toBeInTheDocument();
  });

  test('displays initial nodes', () => {
    render(<FlowEditor />);
    expect(screen.getByText('Node 1')).toBeInTheDocument();
    expect(screen.getByText('Node 2')).toBeInTheDocument();
  });

  test('allows adding a new node on button click', () => {
    render(<FlowEditor />);
    
    const addButton = screen.getByText('Add Node');
    fireEvent.click(addButton);
    
    expect(screen.getByText('Node 3')).toBeInTheDocument();
  });

  test('allows deleting a node', async () => {
    render(<FlowEditor />);
    
    // First verify node exists
    expect(screen.getByText('Node 1')).toBeInTheDocument();
    
    // Find and click the delete button for Node 1
    const deleteButton = screen.getByTestId('delete-node-1');
    fireEvent.click(deleteButton);
    
    // Wait for the node to be removed
    await waitFor(() => {
      expect(screen.queryByText('Node 1')).not.toBeInTheDocument();
    });
  });
});