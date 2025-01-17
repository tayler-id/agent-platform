const API_BASE_URL = 'http://localhost:8000/api/v1';

class AgentPlatformUI {
    constructor() {
        this.agentList = document.getElementById('agent-list');
        this.marketplaceList = document.getElementById('marketplace-list');
        this.createAgentBtn = document.getElementById('create-agent-btn');
        this.refreshAgentsBtn = document.getElementById('refresh-agents-btn');
        this.chatWindow = document.getElementById('chat-window');
        this.chatMessages = document.getElementById('chat-messages');
        this.chatInput = document.getElementById('chat-input');
        
        this.currentTab = 'agents';
        this.activeChat = null;
        
        this.initEventListeners();
        this.loadAgents();
        this.loadMarketplace();
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

    async loadAgents() {
        try {
            const response = await fetch(`${API_BASE_URL}/agents`);
            const agents = await response.json();
            this.renderAgents(agents);
        } catch (error) {
            console.error('Error loading agents:', error);
        }
    }

    async loadMarketplace() {
        try {
            const response = await fetch(`${API_BASE_URL}/marketplace`);
            const listings = await response.json();
            this.renderMarketplace(listings);
        } catch (error) {
            console.error('Error loading marketplace:', error);
        }
    }

    showCreateAgentModal() {
        const name = prompt('Enter agent name:');
        if (!name) return;
        
        const description = prompt('Enter agent description:');
        if (!description) return;
        
        const model = prompt('Enter model (e.g., gpt-4, claude-2):', 'gpt-4');
        if (!model) return;
        
        this.createAgent(name, description, model);
    }

    async createAgent(name, description, model) {
        const agentData = {
            name,
            description,
            model,
            tools: [],
            rating: 0,
            earnings: 0,
            tasks_completed: 0
        };

        try {
            const response = await fetch(`${API_BASE_URL}/agents`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(agentData)
            });
            
            if (response.ok) {
                this.loadAgents();
            }
        } catch (error) {
            console.error('Error creating agent:', error);
        }
    }

    renderAgents(agents) {
        this.agentList.innerHTML = '';
        
        agents.forEach(agent => {
            const card = document.createElement('div');
            card.className = 'agent-card';
            
            const rating = agent.rating || 0;
            const earnings = agent.earnings || 0;
            const tasksCompleted = agent.tasks_completed || 0;
            
            card.innerHTML = `
                <h3>${agent.name}</h3>
                <p>${agent.description}</p>
                <div class="agent-meta">
                    <span>Model: ${agent.model}</span>
                    <span>Status: ${agent.status || 'Idle'}</span>
                </div>
                <div class="agent-stats">
                    <span class="agent-rating">⭐️ ${rating.toFixed(1)}</span>
                    <span class="agent-earnings">$${earnings}</span>
                    <span>Tasks: ${tasksCompleted}</span>
                </div>
                <div class="agent-actions">
                    <button onclick="agentUI.editAgent('${agent.id}')">Edit</button>
                    <button onclick="agentUI.listOnMarketplace('${agent.id}')">List</button>
                    <button onclick="agentUI.startChat('${agent.id}', '${agent.name}')">Chat</button>
                    <button onclick="agentUI.deleteAgent('${agent.id}')">Delete</button>
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
            
            card.innerHTML = `
                <div class="marketplace-status ${statusClass}">
                    ${listing.type === 'sale' ? 'For Sale' : 'For Rent'}
                </div>
                <h3>${listing.agent.name}</h3>
                <p>${listing.agent.description}</p>
                <div class="agent-stats">
                    <span class="agent-rating">⭐️ ${listing.agent.rating.toFixed(1)}</span>
                    <span>Price: $${listing.price}</span>
                </div>
                <div class="agent-actions">
                    <button onclick="agentUI.purchaseAgent('${listing.id}')">
                        ${listing.type === 'sale' ? 'Purchase' : 'Rent'}
                    </button>
                    <button onclick="agentUI.startChat('${listing.agent.id}', '${listing.agent.name}')">Chat</button>
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

    async listOnMarketplace(agentId) {
        const type = prompt('Enter listing type (sale/rent):', 'sale');
        if (!type || !['sale', 'rent'].includes(type)) return;
        
        const price = prompt('Enter price:', '100');
        if (!price) return;
        
        try {
            const response = await fetch(`${API_BASE_URL}/marketplace`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    agent_id: agentId,
                    type,
                    price: parseFloat(price)
                })
            });
            
            if (response.ok) {
                this.loadMarketplace();
                this.switchTab('marketplace');
            }
        } catch (error) {
            console.error('Error listing agent:', error);
        }
    }

    async purchaseAgent(listingId) {
        try {
            const response = await fetch(`${API_BASE_URL}/marketplace/${listingId}/purchase`, {
                method: 'POST'
            });
            
            if (response.ok) {
                this.loadAgents();
                this.loadMarketplace();
                alert('Purchase successful!');
            }
        } catch (error) {
            console.error('Error purchasing agent:', error);
        }
    }

    startChat(agentId, agentName) {
        this.activeChat = agentId;
        this.chatWindow.style.display = 'block';
        document.getElementById('chat-agent-name').textContent = agentName;
        this.chatMessages.innerHTML = '';
    }

    closeChat() {
        this.chatWindow.style.display = 'none';
        this.activeChat = null;
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
