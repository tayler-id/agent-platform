from typing import Dict, List, Optional, Any
from smolagents import CodeAgent, HfApiModel
from .models.agent import Agent, AgentConfig, AgentState, AgentStats
from .utils import generate_agent_id, validate_config, log_agent_activity
from .tools.base import BaseTool
import logging

logger = logging.getLogger(__name__)

class AgentFramework:
    """Core framework for managing agents"""
    
    def __init__(self):
        self.agents: Dict[str, Agent] = {}
        self.available_tools: Dict[str, BaseTool] = {}
        
    def register_tool(self, tool: BaseTool):
        """Register a new tool with the framework"""
        if tool.config.name in self.available_tools:
            raise ValueError(f"Tool {tool.config.name} already registered")
            
        self.available_tools[tool.config.name] = tool
        log_agent_activity("framework", "tool_registered", {
            "tool_name": tool.config.name,
            "version": tool.config.version
        })
        
    def create_agent(self, config: Dict[str, Any]) -> Agent:
        """Create a new agent instance"""
        if not validate_config(config):
            raise ValueError("Invalid agent configuration")
            
        agent_id = generate_agent_id(config["name"])
        tools = [self.available_tools[tool_name].tool_instance 
                for tool_name in config.get("tools", [])]
                
        agent_config = AgentConfig(
            id=agent_id,
            name=config["name"],
            description=config["description"],
            tools=config.get("tools", []),
            model=config["model"],
            allowed_imports=config.get("allowed_imports", []),
            metadata=config.get("metadata", {})
        )
        
        agent_instance = CodeAgent(
            tools=tools,
            model=HfApiModel()
        )
        
        agent = Agent(
            id=agent_id,
            config=agent_config,
            instance=agent_instance,
            state=AgentState.CREATED
        )
        
        self.agents[agent_id] = agent
        log_agent_activity(agent_id, "agent_created")
        return agent
        
    def start_agent(self, agent_id: str):
        """Start an agent"""
        agent = self._get_agent(agent_id)
        agent.state = AgentState.RUNNING
        log_agent_activity(agent_id, "agent_started")
        
    def stop_agent(self, agent_id: str):
        """Stop an agent"""
        agent = self._get_agent(agent_id)
        agent.state = AgentState.STOPPED
        log_agent_activity(agent_id, "agent_stopped")
        
    def delete_agent(self, agent_id: str):
        """Delete an agent"""
        agent = self._get_agent(agent_id)
        del self.agents[agent_id]
        log_agent_activity(agent_id, "agent_deleted")
        
    def get_agent(self, agent_id: str) -> Optional[Agent]:
        """Get an agent by ID"""
        return self.agents.get(agent_id)
        
    def list_agents(self) -> List[Dict[str, Any]]:
        """List all agents"""
        return [agent.dict() for agent in self.agents.values()]
        
    def _get_agent(self, agent_id: str) -> Agent:
        """Internal method to get agent with error handling"""
        agent = self.get_agent(agent_id)
        if not agent:
            raise ValueError(f"Agent {agent_id} not found")
        return agent
