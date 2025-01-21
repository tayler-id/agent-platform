const API_BASE_URL = 'http://localhost:8000/api/v1';

class AgentPlatformUI {
    constructor() {
        // DOM Elements
        this.agentList = document.getElementById('agent-list');
        this.marketplaceList = document.getElementById('marketplace-list');
        this.createAgentBtn = document.getElementById('create-agent-btn');
        this.refreshAgentsBtn = document.getElementById('refresh-agents-btn');
        this.chatWindow = document.getElementById('chat-window');
        this.chatMessages = document.getElementById('chat-messages');
        this.chatInput = document.getElementById('chat-input');
        this.leaderboardList = document.getElementById('leaderboard-list');
        this.achievementsList = document.getElementById('achievements-list');
        
        // State
        this.currentTab = 'agents';
        this.activeChat = null;
        this.userStats = null;
        this.achievements = null;
        this.agents = [];
        this.availableTools = {
            'search': { name: 'Web Search' },
            'calculator': { name: 'Calculator' },
            'calendar': { name: 'Calendar' },
            'email': { name: 'Email' }
        };
        
        this.initEventListeners();
        this.loadInitialData();
    }

    async loadAgents() {
        try {
            const response = await fetch(`${API_BASE_URL}/agents`, {
                headers: {
                    'Authorization': 'Bearer test-token'
                }
            });
            if (response.ok) {
                this.agents = await response.json();
                this.renderAgents(this.agents);
            }
        } catch (error) {
            console.error('Error loading agents:', error);
        }
    }

    async loadInitialData() {
        await Promise.all([
            this.loadAgents(),
            this.loadMarketplace(),
            this.loadUserStats(),
            this.loadAchievements(),
            this.loadLeaderboards()
        ]);
    }

    initEventListeners() {
        this.createAgentBtn.addEventListener('click', () => this.showCreateAgentModal());
        this.refreshAgentsBtn.addEventListener('click', () => this.loadAgents());
        
        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Chat input handling
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    switchTab(tabName) {
        // Update active tab
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // Show/hide content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = content.id === `${tabName}-tab` ? 'block' : 'none';
        });
        
        this.currentTab = tabName;
        
        // Load content based on tab
        if (tabName === 'marketplace') {
            this.loadMarketplace();
        } else if (tabName === 'agents') {
            this.loadAgents();
        }
    }

    async loadUserStats() {
        try {
            const response = await fetch(`${API_BASE_URL}/users/me/stats`);
            if (response.ok) {
                this.userStats = await response.json();
                this.updateUserStatsDisplay();
            }
        } catch (error) {
            console.error('Error loading user stats:', error);
        }
    }

    async loadAchievements() {
        try {
            const response = await fetch(`${API_BASE_URL}/achievements`);
            if (response.ok) {
                this.achievements = await response.json();
                this.updateAchievementsDisplay();
            }
        } catch (error) {
            console.error('Error loading achievements:', error);
        }
    }

    async loadLeaderboards() {
        try {
            const categories = ['earnings', 'rating', 'tasks'];
            const leaderboards = await Promise.all(
                categories.map(async category => {
                    const response = await fetch(`${API_BASE_URL}/leaderboard/${category}`);
                    if (response.ok) {
                        return {
                            category,
                            entries: await response.json()
                        };
                    }
                    return null;
                })
            );
            this.updateLeaderboardsDisplay(leaderboards.filter(Boolean));
        } catch (error) {
            console.error('Error loading leaderboards:', error);
        }
    }

    updateUserStatsDisplay() {
        const statsContainer = document.getElementById('user-stats');
        if (!statsContainer || !this.userStats) return;

        statsContainer.innerHTML = `
            <div class="stats-card">
                <h3>YOUR STATS</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-label">LEVEL</span>
                        <span class="stat-value">${this.userStats.level}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">POINTS</span>
                        <span class="stat-value">${this.userStats.total_points}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">ACHIEVEMENTS</span>
                        <span class="stat-value">${this.userStats.achievements.length}</span>
                    </div>
                </div>
                <div class="badges-container">
                    ${this.userStats.badges.map(badge => `
                        <span class="badge">${badge}</span>
                    `).join('')}
                </div>
            </div>
        `;
    }

    updateAchievementsDisplay() {
        const container = document.getElementById('achievements-list');
        if (!container || !this.achievements) return;

        container.innerHTML = Object.entries(this.achievements)
            .map(([id, achievement]) => `
                <div class="achievement-card ${this.userStats?.achievements.includes(id) ? 'earned' : 'locked'}">
                    <div class="achievement-icon">${achievement.badge}</div>
                    <div class="achievement-info">
                        <h4>${achievement.name}</h4>
                        <p>${achievement.description}</p>
                        <div class="achievement-meta">
                            <span class="points">+${achievement.points} PTS</span>
                            <span class="type">${achievement.type}</span>
                        </div>
                    </div>
                </div>
            `).join('');
    }

    updateLeaderboardsDisplay(leaderboards) {
        const container = document.getElementById('leaderboard-list');
        if (!container) return;

        container.innerHTML = leaderboards.map(({category, entries}) => `
            <div class="leaderboard-section">
                <h3>${category.toUpperCase()} LEADERBOARD</h3>
                ${entries.slice(0, 10).map((entry, index) => `
                    <div class="leaderboard-item">
                        <span class="rank">${index + 1}</span>
                        <span class="agent-name">${this.getAgentName(entry.agent_id)}</span>
                        <span class="score">${this.formatScore(category, entry.score)}</span>
                    </div>
                `).join('')}
            </div>
        `).join('');
    }

    formatScore(category, score) {
        switch (category) {
            case 'earnings':
                return `$${score.toFixed(2)}`;
            case 'rating':
                return `⭐️ ${score.toFixed(1)}`;
            case 'tasks':
                return score;
            default:
                return score;
        }
    }

    getAgentName(agentId) {
        const agent = this.agents?.find(a => a.id === agentId);
        return agent ? agent.name : 'Unknown Agent';
    }

    showCreateAgentModal() {
        const modalHtml = `
            <div class="modal-content">
                <h3>CREATE NEW AGENT</h3>
                <form id="create-agent-form">
                    <input type="text" name="name" placeholder="Agent Name" required>
                    <textarea name="description" placeholder="Agent Description" required></textarea>
                    <select name="model" required>
                        <option value="gpt-4">GPT-4</option>
                        <option value="claude-2">Claude 2</option>
                        <option value="llama-2">Llama 2</option>
                    </select>
                    <div class="tools-section">
                        <h4>AVAILABLE TOOLS</h4>
                        <div class="tool-options">
                            ${Object.entries(this.availableTools).map(([id, tool]) => `
                                <label class="tool-option">
                                    <input type="checkbox" name="tools" value="${id}">
                                    ${tool.name}
                                </label>
                            `).join('')}
                        </div>
                    </div>
                    <button type="submit">CREATE AGENT</button>
                </form>
            </div>
        `;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = modalHtml;
        document.body.appendChild(modal);

        const form = modal.querySelector('form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            await this.createAgent({
                name: formData.get('name'),
                description: formData.get('description'),
                model: formData.get('model'),
                tools: Array.from(formData.getAll('tools'))
            });
            document.body.removeChild(modal);
        });
    }

    async createAgent(data) {
        try {
            const response = await fetch(`${API_BASE_URL}/agents`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                await this.loadAgents();
                this.showNotification('Agent created successfully!', 'success');
            }
        } catch (error) {
            console.error('Error creating agent:', error);
            this.showNotification('Failed to create agent', 'error');
        }
    }

    getBadges(agent) {
        const badges = [];
        const rating = agent.rating || 0;
        const earnings = agent.earnings || 0;
        const tasksCompleted = agent.tasks_completed || 0;

        // Achievement badges
        if (rating >= 4.8) badges.push('<span class="badge achievement">MASTER</span>');
        else if (rating >= 4.5) badges.push('<span class="badge achievement">EXPERT</span>');
        else if (rating >= 4.0) badges.push('<span class="badge achievement">SKILLED</span>');

        // Earnings badges
        if (earnings >= 1000) badges.push('<span class="badge level">ELITE</span>');
        else if (earnings >= 500) badges.push('<span class="badge level">PRO</span>');
        else if (earnings >= 100) badges.push('<span class="badge level">RISING</span>');

        // Task badges
        if (tasksCompleted >= 100) badges.push('<span class="badge achievement">VETERAN</span>');
        else if (tasksCompleted >= 50) badges.push('<span class="badge achievement">EXPERIENCED</span>');
        else if (tasksCompleted >= 10) badges.push('<span class="badge achievement">ROOKIE</span>');

        return badges.join(' ');
    }

    renderAgents(agents) {
        this.agentList.innerHTML = '';
        
        agents.forEach(agent => {
            const card = document.createElement('div');
            card.className = 'agent-card';
            
            const rating = agent.rating || 0;
            const earnings = agent.earnings || 0;
            const tasksCompleted = agent.tasks_completed || 0;
            const badges = this.getBadges(agent);
            
            card.innerHTML = `
                <div class="agent-header">
                    <h3>${agent.name}</h3>
                    <div class="agent-icons">
                        <span class="model-icon" title="${agent.model}">🤖</span>
                        ${badges}
                    </div>
                </div>
                <p>${agent.description}</p>
                <div class="agent-meta">
                    <span class="meta-item">
                        <span class="meta-icon">📊</span>
                        <span class="meta-text">MODEL: ${agent.model}</span>
                    </span>
                    <span class="meta-item">
                        <span class="meta-icon">📈</span>
                        <span class="meta-text">STATUS: ${agent.status || 'IDLE'}</span>
                    </span>
                </div>
                <div class="agent-stats">
                    <div class="stat-item">
                        <span class="stat-icon">⭐️</span>
                        <span class="stat-value">${rating.toFixed(1)}</span>
                        <span class="stat-label">Rating</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-icon">💰</span>
                        <span class="stat-value">$${earnings}</span>
                        <span class="stat-label">Earnings</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-icon">✅</span>
                        <span class="stat-value">${tasksCompleted}</span>
                        <span class="stat-label">Tasks</span>
                    </div>
                </div>
                <div class="agent-actions">
                    <button onclick="agentUI.editAgent('${agent.id}')" title="Edit Agent">✏️</button>
                    <button onclick="agentUI.listOnMarketplace('${agent.id}')" title="List on Marketplace">🏷️</button>
                    <button onclick="agentUI.startChat('${agent.id}', '${agent.name}')" title="Chat with Agent">💬</button>
                    <button onclick="agentUI.deleteAgent('${agent.id}')" title="Delete Agent">🗑️</button>
                </div>
            `;
            
            this.agentList.appendChild(card);
        });
    }

    renderMarketplace(listings) {
        this.marketplaceList.innerHTML = '';
        
        listings.forEach(listing => {
            const card = document.createElement('div');
            card.className = 'agent-card';
            
            const statusClass = listing.type === 'sale' ? 'for-sale' : 'for-rent';
            const badges = this.getBadges(listing.agent);
            
            card.innerHTML = `
                <div class="marketplace-status ${statusClass}">
                    <span class="status-icon">${listing.type === 'sale' ? '💰' : '⏳'}</span>
                    ${listing.type === 'sale' ? 'FOR SALE' : 'FOR RENT'}
                </div>
                <div class="agent-header">
                    <h3>${listing.agent.name}</h3>
                    <div class="agent-icons">
                        <span class="model-icon" title="${listing.agent.model}">🤖</span>
                        ${badges}
                    </div>
                </div>
                <p>${listing.agent.description}</p>
                <div class="agent-stats">
                    <div class="stat-item">
                        <span class="stat-icon">⭐️</span>
                        <span class="stat-value">${listing.agent.rating.toFixed(1)}</span>
                        <span class="stat-label">Rating</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-icon">💰</span>
                        <span class="stat-value">$${listing.price}</span>
                        <span class="stat-label">Price</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-icon">📅</span>
                        <span class="stat-value">${listing.duration || 'N/A'}</span>
                        <span class="stat-label">Duration</span>
                    </div>
                </div>
                <div class="agent-actions">
                    <button onclick="agentUI.purchaseAgent('${listing.id}')" title="${listing.type === 'sale' ? 'Purchase' : 'Rent'} Agent">
                        ${listing.type === 'sale' ? '💰 Purchase' : '⏳ Rent'}
                    </button>
                    <button onclick="agentUI.startChat('${listing.agent.id}', '${listing.agent.name}')" title="Chat with Agent">💬 Chat</button>
                </div>
            `;
            
            this.marketplaceList.appendChild(card);
        });
    }

    async editAgent(agentId) {
        const agent = await this.fetchAgent(agentId);
        if (!agent) return;
        
        const name = prompt('Enter new name:', agent.name);
        if (!name) return;
        
        const description = prompt('Enter new description:', agent.description);
        if (!description) return;
        
        const model = prompt('Enter new model:', agent.model);
        if (!model) return;
        
        try {
            const response = await fetch(`${API_BASE_URL}/agents/${agentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, description, model })
            });
            
            if (response.ok) {
                this.loadAgents();
            }
        } catch (error) {
            console.error('Error updating agent:', error);
        }
    }

    showListingModal(agentId) {
        const modalHtml = `
            <div class="modal-content">
                <h3>CREATE LISTING</h3>
                <form id="create-listing-form">
                    <select name="type" required>
                        <option value="sale">For Sale</option>
                        <option value="rent">For Rent</option>
                        <option value="subscription">Subscription</option>
                    </select>
                    
                    <div class="pricing-section">
                        <input type="number" name="base_price" placeholder="Base Price" required>
                        <input type="number" name="usage_fee" placeholder="Usage Fee (optional)">
                        <input type="number" name="subscription_fee" placeholder="Subscription Fee (optional)">
                        
                        <select name="duration">
                            <option value="">No Duration</option>
                            <option value="hourly">Hourly</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                        </select>
                    </div>
                    
                    <button type="submit">CREATE LISTING</button>
                </form>
            </div>
        `;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = modalHtml;
        document.body.appendChild(modal);

        const form = modal.querySelector('form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            
            const listingData = {
                agent_id: agentId,
                type: formData.get('type'),
                base_price: parseFloat(formData.get('base_price')),
                usage_fee: formData.get('usage_fee') ? parseFloat(formData.get('usage_fee')) : null,
                subscription_fee: formData.get('subscription_fee') ? parseFloat(formData.get('subscription_fee')) : null,
                duration: formData.get('duration') || null
            };

            await this.createListing(listingData);
            document.body.removeChild(modal);
        });
    }

    async createListing(data) {
        try {
            const response = await fetch(`${API_BASE_URL}/marketplace`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                await this.loadMarketplace();
                this.switchTab('marketplace');
                this.showNotification('Listing created successfully!', 'success');
            }
        } catch (error) {
            console.error('Error creating listing:', error);
            this.showNotification('Failed to create listing', 'error');
        }
    }

    async purchaseOrRentAgent(listingId, type) {
        try {
            const endpoint = type === 'rent' ? 'rent' : 'purchase';
            const response = await fetch(`${API_BASE_URL}/marketplace/${listingId}/${endpoint}`, {
                method: 'POST'
            });
            
            if (response.ok) {
                await Promise.all([
                    this.loadAgents(),
                    this.loadMarketplace(),
                    this.loadUserStats()
                ]);
                this.showNotification(`${type === 'rent' ? 'Rental' : 'Purchase'} successful!`, 'success');
            }
        } catch (error) {
            console.error(`Error ${type}ing agent:`, error);
            this.showNotification(`Failed to ${type} agent`, 'error');
        }
    }

    async startChat(agentId, agentName) {
        this.activeChat = agentId;
        this.chatWindow.style.display = 'block';
        document.getElementById('chat-agent-name').textContent = agentName;
        this.chatMessages.innerHTML = '';
        
        // Load chat history if available
        try {
            const response = await fetch(`${API_BASE_URL}/agents/${agentId}/chat/history`);
            if (response.ok) {
                const history = await response.json();
                history.forEach(msg => this.addChatMessage(msg.role, msg.content));
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => document.body.removeChild(notification), 500);
        }, 3000);
    }

    async sendMessage() {
        if (!this.activeChat) return;
        
        const message = this.chatInput.value.trim();
        if (!message) return;
        
        // Add user message to chat
        this.addChatMessage('user', message);
        this.chatInput.value = '';
        
        try {
            const response = await fetch(`${API_BASE_URL}/agents/${this.activeChat}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });
            
            if (response.ok) {
                const data = await response.json();
                this.addChatMessage('agent', data.response);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }

    addChatMessage(sender, message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}`;
        messageDiv.textContent = message;
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    async fetchAgent(agentId) {
        try {
            const response = await fetch(`${API_BASE_URL}/agents/${agentId}`);
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Error fetching agent:', error);
        }
        return null;
    }

    async deleteAgent(agentId) {
        if (!confirm('Are you sure you want to delete this agent?')) return;
        
        try {
            const response = await fetch(`${API_BASE_URL}/agents/${agentId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                this.loadAgents();
            }
        } catch (error) {
            console.error('Error deleting agent:', error);
        }
    }
}

const agentUI = new AgentPlatformUI();
