import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Home = () => {
  const [featuredAgents, setFeaturedAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeaturedAgents = async () => {
      try {
        const response = await api.agents.listAgents();
        setFeaturedAgents(response.data.slice(0, 3)); // Get top 3 agents
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedAgents();
  }, []);

  return (
    <div className="grid">
      {/* Hero Section */}
      <section className="card">
        <h1>Agent Platform</h1>
        <p className="lead">
          Discover, share, and monetize AI agents. Build the future of intelligent automation.
        </p>
        <div className="grid grid-2">
          <button onClick={() => navigate('/marketplace')}>Explore Marketplace</button>
          <button onClick={() => navigate('/create-agent')}>Create Your Agent</button>
        </div>
      </section>

      {/* Featured Agents */}
      <section className="card">
        <h2>Featured Agents</h2>
        {loading ? (
          <div>Loading featured agents...</div>
        ) : error ? (
          <div className="error">Error loading agents: {error}</div>
        ) : (
          <div className="grid grid-3">
            {featuredAgents.map(agent => (
              <div key={agent.id} className="card">
                <h3>{agent.name}</h3>
                <p>{agent.description}</p>
                <div>
                  Rating: {agent.rating || 'No ratings yet'}
                </div>
                <button onClick={() => navigate(`/agents/${agent.id}`)}>
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Call to Action */}
      <section className="card">
        <h2>Join the Revolution</h2>
        <div className="grid grid-2">
          <div>
            <h3>For Developers</h3>
            <p>Monetize your AI creations and reach a global audience.</p>
            <button onClick={() => navigate('/create-agent')}>Start Building</button>
          </div>
          <div>
            <h3>For Businesses</h3>
            <p>Find the perfect AI solutions for your needs.</p>
            <button onClick={() => navigate('/marketplace')}>Explore Solutions</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
