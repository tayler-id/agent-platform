import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const AgentDetail = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    // TODO: Replace with actual API call
    const fetchAgent = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const sampleAgent = {
          id: id,
          name: 'Social Media Manager',
          description: 'Automates social media posting and engagement',
          price: 49.99,
          rating: 4.8,
          image: 'https://placehold.co/800x400',
          category: 'Marketing',
          tags: ['social media', 'automation', 'content'],
          details: {
            features: [
              'Automated posting schedule',
              'Content suggestions',
              'Engagement analytics',
              'Multi-platform support'
            ],
            requirements: [
              'Social media accounts',
              'Content guidelines',
              'Posting schedule'
            ],
            documentation: 'https://example.com/docs',
            apiEndpoint: 'https://api.example.com/social-media-manager'
          },
          reviews: [
            {
              id: 1,
              user: 'JohnDoe123',
              rating: 5,
              comment: 'Great tool for managing multiple accounts!',
              date: '2023-08-15'
            },
            {
              id: 2,
              user: 'MarketingPro',
              rating: 4,
              comment: 'Saves me hours every week. Could use more analytics.',
              date: '2023-08-10'
            }
          ]
        };
        
        setAgent(sampleAgent);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [id]);

  const handleStopAgent = async () => {
    try {
      // TODO: Implement API call to stop agent
      const response = await fetch(`/api/agents/${id}/stop`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to stop agent');
      }
      
      // Update local state
      setAgent(prev => ({ ...prev, status: 'idle' }));
      toast.success('Agent stopped successfully');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteAgent = async () => {
    try {
      const response = await fetch(`/api/agents/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete agent');
      }
      
      toast.success('Agent deleted successfully');
      navigate('/agents');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="grid">
      <section className="card">
        <div className="agent-header">
          <img src={agent.image} alt={agent.name} className="agent-image" />
          <div className="agent-info">
            <h1>{agent.name}</h1>
            <div className="agent-meta">
              <span>${agent.price.toFixed(2)}</span>
              <span>{agent.rating} ★</span>
              <span className="category">{agent.category}</span>
            </div>
            <div className="agent-tags">
              {agent.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="agent-content">
          <div className="agent-description">
            <h2>Description</h2>
            <p>{agent.description}</p>
          </div>

          <div className="agent-details">
            <h2>Features</h2>
            <ul>
              {agent.details.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>

            <h2>Requirements</h2>
            <ul>
              {agent.details.requirements.map((requirement, index) => (
                <li key={index}>{requirement}</li>
              ))}
            </ul>

            <div className="documentation">
              <h2>Documentation</h2>
              <a href={agent.details.documentation} target="_blank" rel="noopener noreferrer">
                View Documentation
              </a>
            </div>

            <div className="api-endpoint">
              <h2>API Endpoint</h2>
              <code>{agent.details.apiEndpoint}</code>
            </div>
          </div>

          <div className="agent-reviews">
            <h2>Reviews</h2>
            {agent.reviews.map(review => (
              <div key={review.id} className="review">
                <div className="review-header">
                  <span className="user">{review.user}</span>
                  <span className="rating">{review.rating} ★</span>
                  <span className="date">{review.date}</span>
                </div>
                <p>{review.comment}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="agent-actions">
          {agent.owner === currentUser?.id && (
            <>
              <button 
                className="warning"
                onClick={handleStopAgent}
                disabled={agent.status !== 'busy'}
              >
                {agent.status === 'busy' ? 'Stop Agent' : 'Agent Idle'}
              </button>
              <button 
                className="danger"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete Agent
              </button>
            </>
          )}
          
          {agent.owner !== currentUser?.id && (
            <>
              <button className="primary">Purchase</button>
              <button className="secondary">Rent</button>
              <button className="tertiary">Add to Wishlist</button>
            </>
          )}
        </div>

        {showDeleteConfirm && (
          <div className="confirmation-modal">
            <div className="modal-content">
              <p>Are you sure you want to delete this agent? This action cannot be undone.</p>
              <div className="modal-actions">
                <button 
                  className="danger"
                  onClick={handleDeleteAgent}
                >
                  Confirm Delete
                </button>
                <button 
                  className="secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default AgentDetail;
