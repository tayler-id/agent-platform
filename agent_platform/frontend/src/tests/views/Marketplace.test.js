import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Marketplace from '../../views/Marketplace';

describe('Marketplace Component', () => {
  const mockAgents = [
    {
      id: '1',
      name: 'Agent 1',
      description: 'Description 1',
      price: 9.99,
      rating: 4.5,
      category: 'Category 1',
      tags: ['tag1', 'tag2']
    },
    {
      id: '2',
      name: 'Agent 2',
      description: 'Description 2',
      price: 19.99,
      rating: 4.0,
      category: 'Category 2',
      tags: ['tag3']
    }
  ];

  const mockCategories = [
    { id: '1', name: 'Category 1' },
    { id: '2', name: 'Category 2' }
  ];

  it('renders agent listings', () => {
    render(<Marketplace agents={mockAgents} />);
    
    expect(screen.getByText(mockAgents[0].name)).toBeInTheDocument();
    expect(screen.getByText(mockAgents[0].description)).toBeInTheDocument();
    expect(screen.getByText(mockAgents[0].price)).toBeInTheDocument();
    expect(screen.getByText(mockAgents[1].name)).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<Marketplace isLoading={true} />);
    
    expect(screen.getByText(/loading agents/i)).toBeInTheDocument();
  });

  it('shows error message', () => {
    const errorMessage = 'Failed to load agents';
    render(<Marketplace error={errorMessage} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('allows filtering by category', () => {
    const mockFilter = jest.fn();
    render(<Marketplace categories={mockCategories} onFilter={mockFilter} />);
    
    fireEvent.change(screen.getByLabelText(/category/i), {
      target: { value: mockCategories[0].id }
    });
    
    expect(mockFilter).toHaveBeenCalledWith({
      category: mockCategories[0].id,
      search: '',
      sort: 'rating',
      tags: []
    });
  });

  it('allows searching agents', () => {
    const mockSearch = jest.fn();
    render(<Marketplace onSearch={mockSearch} />);
    
    fireEvent.change(screen.getByLabelText(/search/i), {
      target: { value: 'test' }
    });
    
    expect(mockSearch).toHaveBeenCalledWith({
      category: '',
      search: 'test',
      sort: 'rating',
      tags: []
    });
  });

  it('allows sorting agents', () => {
    const mockSort = jest.fn();
    render(<Marketplace onSort={mockSort} />);
    
    fireEvent.change(screen.getByLabelText(/sort by/i), {
      target: { value: 'price' }
    });
    
    expect(mockSort).toHaveBeenCalledWith({
      category: '',
      search: '',
      sort: 'price',
      tags: []
    });
  });

  it('allows filtering by tags', () => {
    const mockFilterTags = jest.fn();
    render(<Marketplace onFilterTags={mockFilterTags} />);
    
    fireEvent.click(screen.getByLabelText(/tag1/i));
    
    expect(mockFilterTags).toHaveBeenCalledWith({
      category: '',
      search: '',
      sort: 'rating',
      tags: ['tag1']
    });
  });

  it('allows viewing agent details', () => {
    const mockViewAgent = jest.fn();
    render(<Marketplace agents={mockAgents} onViewAgent={mockViewAgent} />);
    
    fireEvent.click(screen.getByText(mockAgents[0].name));
    
    expect(mockViewAgent).toHaveBeenCalledWith(mockAgents[0].id);
  });

  it('allows purchasing agent', () => {
    const mockPurchase = jest.fn();
    render(<Marketplace agents={mockAgents} onPurchase={mockPurchase} />);
    
    fireEvent.click(screen.getByText(/purchase/i));
    
    expect(mockPurchase).toHaveBeenCalledWith(mockAgents[0].id);
  });

  it('shows purchase confirmation', () => {
    render(<Marketplace agents={mockAgents} isPurchaseSuccess={true} />);
    
    expect(screen.getByText(/purchase successful/i)).toBeInTheDocument();
  });

  it('shows purchase error', () => {
    const purchaseError = 'Failed to purchase agent';
    render(<Marketplace agents={mockAgents} purchaseError={purchaseError} />);
    
    expect(screen.getByText(purchaseError)).toBeInTheDocument();
  });

  it('shows empty state', () => {
    render(<Marketplace agents={[]} />);
    
    expect(screen.getByText(/no agents found/i)).toBeInTheDocument();
  });

  it('shows agent ratings', () => {
    render(<Marketplace agents={mockAgents} />);
    
    expect(screen.getByText(mockAgents[0].rating)).toBeInTheDocument();
    expect(screen.getByText(mockAgents[1].rating)).toBeInTheDocument();
  });

  it('shows agent categories', () => {
    render(<Marketplace agents={mockAgents} />);
    
    expect(screen.getByText(mockAgents[0].category)).toBeInTheDocument();
    expect(screen.getByText(mockAgents[1].category)).toBeInTheDocument();
  });

  it('shows agent tags', () => {
    render(<Marketplace agents={mockAgents} />);
    
    expect(screen.getByText(mockAgents[0].tags[0])).toBeInTheDocument();
    expect(screen.getByText(mockAgents[0].tags[1])).toBeInTheDocument();
    expect(screen.getByText(mockAgents[1].tags[0])).toBeInTheDocument();
  });

  it('allows adding agent to favorites', () => {
    const mockAddFavorite = jest.fn();
    render(<Marketplace agents={mockAgents} onAddFavorite={mockAddFavorite} />);
    
    fireEvent.click(screen.getByLabelText(/add to favorites/i));
    
    expect(mockAddFavorite).toHaveBeenCalledWith(mockAgents[0].id);
  });

  it('shows favorite confirmation', () => {
    render(<Marketplace agents={mockAgents} isFavoriteSuccess={true} />);
    
    expect(screen.getByText(/added to favorites/i)).toBeInTheDocument();
  });

  it('shows favorite error', () => {
    const favoriteError = 'Failed to add to favorites';
    render(<Marketplace agents={mockAgents} favoriteError={favoriteError} />);
    
    expect(screen.getByText(favoriteError)).toBeInTheDocument();
  });

  it('allows viewing agent documentation', () => {
    const mockViewDocumentation = jest.fn();
    render(<Marketplace agents={mockAgents} onViewDocumentation={mockViewDocumentation} />);
    
    fireEvent.click(screen.getByText(/view documentation/i));
    
    expect(mockViewDocumentation).toHaveBeenCalledWith(mockAgents[0].id);
  });

  it('allows viewing agent examples', () => {
    const mockViewExamples = jest.fn();
    render(<Marketplace agents={mockAgents} onViewExamples={mockViewExamples} />);
    
    fireEvent.click(screen.getByText(/view examples/i));
    
    expect(mockViewExamples).toHaveBeenCalledWith(mockAgents[0].id);
  });

  it('allows viewing agent requirements', () => {
    const mockViewRequirements = jest.fn();
    render(<Marketplace agents={mockAgents} onViewRequirements={mockViewRequirements} />);
    
    fireEvent.click(screen.getByText(/view requirements/i));
    
    expect(mockViewRequirements).toHaveBeenCalledWith(mockAgents[0].id);
  });

  it('allows viewing agent dependencies', () => {
    const mockViewDependencies = jest.fn();
    render(<Marketplace agents={mockAgents} onViewDependencies={mockViewDependencies} />);
    
    fireEvent.click(screen.getByText(/view dependencies/i));
    
    expect(mockViewDependencies).toHaveBeenCalledWith(mockAgents[0].id);
  });

  it('allows viewing agent configuration', () => {
    const mockViewConfiguration = jest.fn();
    render(<Marketplace agents={mockAgents} onViewConfiguration={mockViewConfiguration} />);
    
    fireEvent.click(screen.getByText(/view configuration/i));
    
    expect(mockViewConfiguration).toHaveBeenCalledWith(mockAgents[0].id);
  });

  it('allows viewing agent endpoints', () => {
    const mockViewEndpoints = jest.fn();
    render(<Marketplace agents={mockAgents} onViewEndpoints={mockViewEndpoints} />);
    
    fireEvent.click(screen.getByText(/view endpoints/i));
    
    expect(mockViewEndpoints).toHaveBeenCalledWith(mockAgents[0].id);
  });

  it('allows viewing agent rate limits', () => {
    const mockViewRateLimits = jest.fn();
    render(<Marketplace agents={mockAgents} onViewRateLimits={mockViewRateLimits} />);
    
    fireEvent.click(screen.getByText(/view rate limits/i));
    
    expect(mockViewRateLimits).toHaveBeenCalledWith(mockAgents[0].id);
  });

  it('allows viewing agent pricing model', () => {
    const mockViewPricingModel = jest.fn();
    render(<Marketplace agents={mockAgents} onViewPricingModel={mockViewPricingModel} />);
    
    fireEvent.click(screen.getByText(/view pricing model/i));
    
    expect(mockViewPricingModel).toHaveBeenCalledWith(mockAgents[0].id);
  });

  it('allows viewing agent subscription options', () => {
    const mockViewSubscriptionOptions = jest.fn();
    render(<Marketplace agents={mockAgents} onViewSubscriptionOptions={mockViewSubscriptionOptions} />);
    
    fireEvent.click(screen.getByText(/view subscription options/i));
    
    expect(mockViewSubscriptionOptions).toHaveBeenCalledWith(mockAgents[0].id);
  });
});
