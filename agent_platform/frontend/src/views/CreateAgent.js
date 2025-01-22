import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './CreateAgent.css';

const CreateAgent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    tags: '',
    features: '',
    requirements: '',
    documentation: '',
    apiEndpoint: '',
    agentType: '',
    platforms: [],
    integrations: [],
    gamification: {
      leaderboard: false,
      achievements: false,
      badges: false
    },
    previewImage: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const agentData = {
        name: formData.name,
        description: formData.description,
        model: formData.agentType,
        tools: formData.integrations,
        allowed_imports: [],
        metadata: {
          price: parseFloat(formData.price),
          category: formData.category,
          tags: formData.tags.split(',').map(tag => tag.trim()),
          features: formData.features.split('\n').filter(f => f.trim()),
          requirements: formData.requirements.split('\n').filter(r => r.trim()),
          documentation_url: formData.documentation,
          api_endpoint: formData.apiEndpoint,
          platforms: formData.platforms,
          gamification: formData.gamification,
          preview_image: formData.previewImage
        }
      };
      
      const response = await api.agents.createAgent(agentData);
      navigate(`/agents/${response.data.id}`);
    } catch (error) {
      setError(error.message || 'Failed to create agent');
      console.error('Error creating agent:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="brutalist-container">
      <section className="brutalist-form">
        <h1 className="brutalist-title">CREATE NEW AGENT</h1>
        <form onSubmit={handleSubmit} className="brutalist-form-content">
          {error && <div className="brutalist-error">{error}</div>}
          <div className="brutalist-form-group">
            <label className="brutalist-label">AGENT NAME</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="brutalist-input"
              required
            />
          </div>

          <div className="brutalist-form-group">
            <label className="brutalist-label">DESCRIPTION</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="brutalist-textarea"
              required
            />
          </div>

          <div className="brutalist-form-group">
            <label className="brutalist-label">PRICE (USD)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="brutalist-input"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="brutalist-form-group">
            <label className="brutalist-label">CATEGORY</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="brutalist-select"
              required
            >
              <option value="">SELECT CATEGORY</option>
              <option value="Marketing">MARKETING</option>
              <option value="Productivity">PRODUCTIVITY</option>
              <option value="Development">DEVELOPMENT</option>
              <option value="Analytics">ANALYTICS</option>
              <option value="Customer Support">CUSTOMER SUPPORT</option>
            </select>
          </div>

          <div className="brutalist-form-group">
            <label className="brutalist-label">TAGS (COMMA SEPARATED)</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="brutalist-input"
              placeholder="SOCIAL MEDIA, AUTOMATION, CONTENT"
            />
          </div>

          <div className="brutalist-form-group">
            <label className="brutalist-label">FEATURES (ONE PER LINE)</label>
            <textarea
              name="features"
              value={formData.features}
              onChange={handleChange}
              className="brutalist-textarea"
              placeholder="ENTER EACH FEATURE ON A NEW LINE"
            />
          </div>

          <div className="brutalist-form-group">
            <label className="brutalist-label">REQUIREMENTS (ONE PER LINE)</label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              className="brutalist-textarea"
              placeholder="ENTER EACH REQUIREMENT ON A NEW LINE"
            />
          </div>

          <div className="brutalist-form-group">
            <label className="brutalist-label">DOCUMENTATION URL</label>
            <input
              type="url"
              name="documentation"
              value={formData.documentation}
              onChange={handleChange}
              className="brutalist-input"
            />
          </div>

          <div className="brutalist-form-group">
            <label className="brutalist-label">API ENDPOINT</label>
            <input
              type="url"
              name="apiEndpoint"
              value={formData.apiEndpoint}
              onChange={handleChange}
              className="brutalist-input"
            />
          </div>

          <div className="brutalist-form-group">
            <label className="brutalist-label">AGENT TYPE</label>
            <select
              name="agentType"
              value={formData.agentType}
              onChange={handleChange}
              className="brutalist-select"
              required
            >
              <option value="">SELECT TYPE</option>
              <option value="LLM Service">LLM SERVICE</option>
              <option value="Standalone Agent">STANDALONE AGENT</option>
              <option value="Hybrid">HYBRID</option>
            </select>
          </div>

          <div className="brutalist-form-group">
            <label className="brutalist-label">SUPPORTED PLATFORMS</label>
            <div className="brutalist-checkbox-group">
              {['Web', 'Mobile', 'Desktop', 'API'].map(platform => (
                <label key={platform} className="brutalist-checkbox-label">
                  <input
                    type="checkbox"
                    name="platforms"
                    value={platform}
                    checked={formData.platforms.includes(platform)}
                    onChange={(e) => {
                      const { checked, value } = e.target;
                      setFormData(prev => ({
                        ...prev,
                        platforms: checked
                          ? [...prev.platforms, value]
                          : prev.platforms.filter(p => p !== value)
                      }));
                    }}
                  />
                  {platform}
                </label>
              ))}
            </div>
          </div>

          <div className="brutalist-form-group">
            <label className="brutalist-label">INTEGRATIONS</label>
            <div className="brutalist-checkbox-group">
              {['Slack', 'Discord', 'Teams', 'Zapier', 'API'].map(integration => (
                <label key={integration} className="brutalist-checkbox-label">
                  <input
                    type="checkbox"
                    name="integrations"
                    value={integration}
                    checked={formData.integrations.includes(integration)}
                    onChange={(e) => {
                      const { checked, value } = e.target;
                      setFormData(prev => ({
                        ...prev,
                        integrations: checked
                          ? [...prev.integrations, value]
                          : prev.integrations.filter(i => i !== value)
                      }));
                    }}
                  />
                  {integration}
                </label>
              ))}
            </div>
          </div>

          <div className="brutalist-form-group">
            <label className="brutalist-label">GAMIFICATION</label>
            <div className="brutalist-checkbox-group">
              {Object.entries(formData.gamification).map(([key, value]) => (
                <label key={key} className="brutalist-checkbox-label">
                  <input
                    type="checkbox"
                    name={key}
                    checked={value}
                    onChange={(e) => {
                      const { checked, name } = e.target;
                      setFormData(prev => ({
                        ...prev,
                        gamification: {
                          ...prev.gamification,
                          [name]: checked
                        }
                      }));
                    }}
                  />
                  {key.toUpperCase()}
                </label>
              ))}
            </div>
          </div>

          <div className="brutalist-form-group">
            <label className="brutalist-label">PREVIEW IMAGE URL</label>
            <input
              type="url"
              name="previewImage"
              value={formData.previewImage}
              onChange={handleChange}
              className="brutalist-input"
              placeholder="ENTER IMAGE URL FOR PREVIEW"
            />
            {formData.previewImage && (
              <div className="brutalist-preview">
                <img src={formData.previewImage} alt="Agent Preview" className="brutalist-preview-image" />
              </div>
            )}
          </div>

          <div className="brutalist-form-actions">
            <button type="submit" className="brutalist-button primary" disabled={loading}>
              {loading ? 'CREATING...' : 'CREATE AGENT'}
            </button>
            <button
              type="button"
              className="brutalist-button secondary"
              onClick={() => navigate('/marketplace')}
            >
              CANCEL
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default CreateAgent;
