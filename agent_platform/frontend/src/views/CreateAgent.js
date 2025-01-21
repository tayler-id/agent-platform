import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    apiEndpoint: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // TODO: Replace with actual API call
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate successful creation
      const newAgent = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
        rating: 0,
        reviews: []
      };
      
      console.log('Agent created:', newAgent);
      navigate(`/agent/${newAgent.id}`);
    } catch (error) {
      console.error('Error creating agent:', error);
    }
  };

  return (
    <div className="grid">
      <section className="card">
        <h1>Create New Agent</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Agent Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Price (USD)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select category</option>
              <option value="Marketing">Marketing</option>
              <option value="Productivity">Productivity</option>
              <option value="Development">Development</option>
              <option value="Analytics">Analytics</option>
              <option value="Customer Support">Customer Support</option>
            </select>
          </div>

          <div className="form-group">
            <label>Tags (comma separated)</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., social media, automation, content"
            />
          </div>

          <div className="form-group">
            <label>Features (one per line)</label>
            <textarea
              name="features"
              value={formData.features}
              onChange={handleChange}
              placeholder="Enter each feature on a new line"
            />
          </div>

          <div className="form-group">
            <label>Requirements (one per line)</label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              placeholder="Enter each requirement on a new line"
            />
          </div>

          <div className="form-group">
            <label>Documentation URL</label>
            <input
              type="url"
              name="documentation"
              value={formData.documentation}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>API Endpoint</label>
            <input
              type="url"
              name="apiEndpoint"
              value={formData.apiEndpoint}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="primary">
              Create Agent
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => navigate('/marketplace')}
            >
              Cancel
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default CreateAgent;
