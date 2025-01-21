import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Home from '../../views/Home';

describe('Home Component', () => {
  const mockAgents = [
    {
      id: '1',
      name: 'Chatbot',
      description: 'Basic conversational agent',
      rating: 4.5,
      owner: 'user1'
    },
    {
      id: '2',
      name: 'Analytics',
      description: 'Data analysis agent',
      rating: 4.2,
      owner: 'user2'
    }
  ];

  it('renders loading state initially', () => {
    render(<Home agents={null} />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders agent cards when loaded', () => {
    render(<Home agents={mockAgents} />);
    
    mockAgents.forEach(agent => {
      expect(screen.getByText(agent.name)).toBeInTheDocument();
      expect(screen.getByText(agent.description)).toBeInTheDocument();
      expect(screen.getByText(agent.rating.toFixed(1))).toBeInTheDocument();
    });
  });

  it('filters agents by search term', () => {
    render(<Home agents={mockAgents} />);
    
    fireEvent.change(screen.getByPlaceholderText(/search agents/i), {
      target: { value: 'Chat' }
    });
    
    expect(screen.getByText('Chatbot')).toBeInTheDocument();
    expect(screen.queryByText('Analytics')).not.toBeInTheDocument();
  });

  it('shows empty state when no agents match search', () => {
    render(<Home agents={mockAgents} />);
    
    fireEvent.change(screen.getByPlaceholderText(/search agents/i), {
      target: { value: 'Nonexistent' }
    });
    
    expect(screen.getByText(/no agents found/i)).toBeInTheDocument();
  });

  it('sorts agents by rating', () => {
    render(<Home agents={mockAgents} />);
    
    fireEvent.click(screen.getByText(/sort by/i));
    fireEvent.click(screen.getByText(/rating/i));
    
    const ratings = screen.getAllByText(/\d\.\d/);
    expect(Number(ratings[0].textContent)).toBeGreaterThanOrEqual(
      Number(ratings[1].textContent)
    );
  });

  it('sorts agents by name', () => {
    render(<Home agents={mockAgents} />);
    
    fireEvent.click(screen.getByText(/sort by/i));
    fireEvent.click(screen.getByText(/name/i));
    
    const names = screen.getAllByText(/(Chatbot|Analytics)/);
    expect(names[0].textContent).toBe('Analytics');
    expect(names[1].textContent).toBe('Chatbot');
  });

  it('navigates to agent details when card is clicked', () => {
    const mockNavigate = jest.fn();
    render(<Home agents={mockAgents} onNavigate={mockNavigate} />);
    
    fireEvent.click(screen.getByText(mockAgents[0].name));
    expect(mockNavigate).toHaveBeenCalledWith('/agent/1');
  });
});
