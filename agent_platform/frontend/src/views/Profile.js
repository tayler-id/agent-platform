import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    bio: '',
    avatarUrl: '',
    createdAgents: [],
    purchasedAgents: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    bio: ''
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        const response = await api.gamification.getUserStats();
        const profileResponse = await api.gamification.getProfile();
        
        setUserData({
          ...profileResponse.data,
          createdAgents: response.data.createdAgents || [],
          purchasedAgents: response.data.purchasedAgents || []
        });
        
        setFormData({
          username: profileResponse.data.username,
          bio: profileResponse.data.bio
        });
      } catch (error) {
        toast.error('Failed to load profile data');
        console.error('Error fetching profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({
      username: userData.username,
      bio: userData.bio
    });
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const response = await api.gamification.updateAvatar(file);
      setUserData(prev => ({
        ...prev,
        avatarUrl: response.data.avatarUrl
      }));
      toast.success('Avatar updated successfully');
    } catch (error) {
      toast.error('Failed to update avatar');
      console.error('Error updating avatar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      await api.gamification.updateProfile(formData);
      
      setUserData(prev => ({
        ...prev,
        username: formData.username,
        bio: formData.bio
      }));
      
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
            <div className="avatar-container">
              <img 
                src={userData.avatarUrl || '/default-avatar.png'} 
                alt="Profile Avatar"
                className="profile-avatar"
                onClick={() => fileInputRef.current.click()}
              />
              <input
                type="file"
                ref={fileInputRef}
                style={{display: 'none'}}
                accept="image/*"
                onChange={handleAvatarUpload}
              />
            </div>
            <div className="profile-details">
              <h2>{userData.username}</h2>
              <p>{userData.email}</p>
              <p>{userData.bio}</p>
            </div>
          </div>
          <div className="profile-actions">
            <button 
              className="primary"
              onClick={handleEditProfile}
            >
              Edit Profile
            </button>
          </div>
        </div>

        {isEditing && (
          <div className="edit-modal">
            <div className="card">
              <h2>Edit Profile</h2>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  rows="4"
                />
              </div>
              <div className="form-actions">
                <button
                  className="secondary"
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  className="primary"
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

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
