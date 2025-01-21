import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    username: 'johndoe',
    email: 'john@example.com',
    bio: 'AI enthusiast and agent developer',
    createdAgents: [],
    purchasedAgents: []
  });

  // TODO: Replace with actual API call
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Simulate fetched data
        const data = {
          username: 'johndoe',
          email: 'john@example.com',
          bio: 'AI enthusiast and agent developer',
          createdAgents: [
            {
              id: '1',
              name: 'Marketing Automator',
              description: 'Automates social media posting',
              rating: 4.5,
              price: 49.99
            },
            {
              id: '2',
              name: 'Code Reviewer',
              description: 'Automated code review assistant',
              rating: 4.2,
              price: 99.99
            }
          ],
          purchasedAgents: [
            {
              id: '3',
              name: 'SEO Optimizer',
              description: 'Automated SEO analysis',
              rating: 4.7,
              price: 79.99
            }
          ]
        };
        
        setUserData(data);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    fetchData();
  }, []);

  const handleEditProfile = () => {
    // TODO: Implement profile editing
    console.log('Edit profile clicked');
  };

  const handleViewAgent = (agentId) => {
    navigate(`/agent/${agentId}`);
  };

  const handleCreateAgent = () => {
    navigate('/create-agent');
  };

  return (
    <div className="grid">
      <section className="card">
        <h1>Profile</h1>
        
        <div className="profile-header">
          <div className="profile-info">
            <h2>{userData.username}</h2>
            <p>{userData.email}</p>
            <p>{userData.bio}</p>
          </div>
          <button 
            className="primary"
            onClick={handleEditProfile}
          >
            Edit Profile
          </button>
        </div>

        <div className="profile-sections">
          <section className="profile-section">
            <h2>Created Agents</h2>
            {userData.createdAgents.length > 0 ? (
              <div className="agent-list">
                {userData.createdAgents.map(agent => (
                  <div 
                    key={agent.id}
                    className="agent-card"
                    onClick={() => handleViewAgent(agent.id)}
                  >
                    <h3>{agent.name}</h3>
                    <p>{agent.description}</p>
                    <div className="agent-meta">
                      <span>Rating: {agent.rating}</span>
                      <span>Price: ${agent.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No agents created yet</p>
            )}
            <button 
              className="primary"
              onClick={handleCreateAgent}
            >
              Create New Agent
            </button>
          </section>

          <section className="profile-section">
            <h2>Purchased Agents</h2>
            {userData.purchasedAgents.length > 0 ? (
              <div className="agent-list">
                {userData.purchasedAgents.map(agent => (
                  <div 
                    key={agent.id}
                    className="agent-card"
                    onClick={() => handleViewAgent(agent.id)}
                  >
                    <h3>{agent.name}</h3>
                    <p>{agent.description}</p>
                    <div className="agent-meta">
                      <span>Rating: {agent.rating}</span>
                      <span>Price: ${agent.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No agents purchased yet</p>
            )}
          </section>
        </div>
      </section>
    </div>
  );
};

export default Profile;
