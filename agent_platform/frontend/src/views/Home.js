import React from 'react';

const Home = () => {
  const featuredAgents = [
    {
      id: 1,
      name: 'Marketing Genius',
      description: 'AI-powered marketing strategist',
      rating: 4.8
    },
    {
      id: 2, 
      name: 'Code Wizard',
      description: 'Full-stack development assistant',
      rating: 4.9
    },
    {
      id: 3,
      name: 'Data Scientist',
      description: 'Advanced analytics and ML expert',
      rating: 4.7
    }
  ];

  return (
    <div className="grid">
      {/* Hero Section */}
      <section className="card">
        <h1>Agent Platform</h1>
        <p className="lead">
          Discover, share, and monetize AI agents. Build the future of intelligent automation.
        </p>
        <div className="grid grid-2">
          <button>Explore Marketplace</button>
          <button>Create Your Agent</button>
        </div>
      </section>

      {/* Featured Agents */}
      <section className="card">
        <h2>Featured Agents</h2>
        <div className="grid grid-3">
          {featuredAgents.map(agent => (
            <div key={agent.id} className="card">
              <h3>{agent.name}</h3>
              <p>{agent.description}</p>
              <div>
                Rating: {agent.rating}
              </div>
              <button>View Details</button>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="card">
        <h2>Join the Revolution</h2>
        <div className="grid grid-2">
          <div>
            <h3>For Developers</h3>
            <p>Monetize your AI creations and reach a global audience.</p>
            <button>Start Building</button>
          </div>
          <div>
            <h3>For Businesses</h3>
            <p>Find the perfect AI solutions for your needs.</p>
            <button>Explore Solutions</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
