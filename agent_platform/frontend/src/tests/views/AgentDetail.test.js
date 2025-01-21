import React from 'react';
import { render, screen } from '@testing-library/react';
import AgentDetail from '../../views/AgentDetail';

describe('AgentDetail Component', () => {
  const mockAgent = {
    id: '1',
    name: 'Test Agent',
    description: 'Test description',
    rating: 4.5,
    price: 9.99
  };

  it('renders agent details correctly', () => {
    render(<AgentDetail agent={mockAgent} />);
    
    expect(screen.getByText(mockAgent.name)).toBeInTheDocument();
    expect(screen.getByText(mockAgent.description)).toBeInTheDocument();
    expect(screen.getByText(`$${mockAgent.price}`)).toBeInTheDocument();
  });

  it('displays loading state when no agent provided', () => {
    render(<AgentDetail agent={null} />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders rating stars correctly', () => {
    render(<AgentDetail agent={mockAgent} />);
    const stars = screen.getAllByRole('img', { name: /star/i });
    expect(stars.length).toBe(5);
  });
});
