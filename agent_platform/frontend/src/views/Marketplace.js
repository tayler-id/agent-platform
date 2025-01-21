import React, { useState } from 'react';

const Marketplace = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    priceRange: '',
    rating: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const marketplaceData = [
    {
      id: 1,
      name: 'Social Media Manager',
      description: 'Automates social media posting and engagement',
      price: 49.99,
      rating: 4.8,
      image: 'https://placehold.co/400',
      category: 'Marketing',
      tags: ['social media', 'automation', 'content']
    },
    {
      id: 2,
      name: 'SEO Analyzer Pro',
      description: 'Analyzes and optimizes website SEO',
      price: 29.99,
      rating: 4.7,
      image: 'https://placehold.co/400',
      category: 'SEO',
      tags: ['seo', 'analytics', 'optimization']
    },
    {
      id: 3,
      name: 'Content Generator',
      description: 'Creates high-quality content for blogs and articles',
      price: 39.99,
      rating: 4.6,
      image: 'https://placehold.co/400',
      category: 'Content',
      tags: ['content', 'writing', 'blogging']
    }
  ];

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
    setCurrentPage(1);
  };

  const filteredData = marketplaceData.filter(agent => {
    return (
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (filters.category ? agent.category === filters.category : true) &&
      (filters.priceRange ? {
        '0-50': agent.price <= 50,
        '50-100': agent.price > 50 && agent.price <= 100,
        '100+': agent.price > 100
      }[filters.priceRange] : true) &&
      (filters.rating ? agent.rating >= parseFloat(filters.rating) : true)
    );
  });

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="grid">
      <section className="card">
        <h1>Marketplace</h1>

        <div className="marketplace-controls">
          <input
            type="text"
            placeholder="Search agents..."
            value={searchQuery}
            onChange={handleSearchChange}
          />

          <div className="filters">
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
            >
              <option value="">All Categories</option>
              <option value="Marketing">Marketing</option>
              <option value="SEO">SEO</option>
              <option value="Content">Content</option>
            </select>

            <select
              name="priceRange"
              value={filters.priceRange}
              onChange={handleFilterChange}
            >
              <option value="">All Prices</option>
              <option value="0-50">$0 - $50</option>
              <option value="50-100">$50 - $100</option>
              <option value="100+">$100+</option>
            </select>

            <select
              name="rating"
              value={filters.rating}
              onChange={handleFilterChange}
            >
              <option value="">All Ratings</option>
              <option value="4.5">4.5+ stars</option>
              <option value="4.0">4.0+ stars</option>
              <option value="3.5">3.5+ stars</option>
            </select>
          </div>
        </div>

        <div className="grid grid-3">
          {paginatedData.map(agent => (
            <div key={agent.id} className="card">
              {agent.rating >= 4.8 && (
                <div className="card-badge">Top Agent</div>
              )}
              <img src={agent.image} alt={agent.name} />
              <h2>{agent.name}</h2>
              <p>{agent.description}</p>
              
              <div className="card-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span 
                    key={star}
                    className={star <= Math.round(agent.rating) ? 'active' : ''}
                  />
                ))}
              </div>
              
              <div className="card-capabilities">
                {agent.tags.map(tag => (
                  <div key={tag} className="card-capability">
                    {tag}
                  </div>
                ))}
              </div>
              
              <div className="agent-meta">
                <span>${agent.price.toFixed(2)}</span>
                <button>View Details</button>
              </div>
            </div>
          ))}
        </div>

        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </section>
    </div>
  );
};

export default Marketplace;
