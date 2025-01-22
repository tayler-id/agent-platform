from sqlalchemy.orm import Session
from .models.database import get_db
from .models.agent import Agent, AgentConfig, AgentState, AgentStats
from .models.user import DBUser as User
from typing import Optional

class DBOperations:
    """Handles all database operations for agent persistence"""
    
    @staticmethod
    def create_agent(db: Session, agent_data: dict) -> Agent:
        """Create a new agent with validation and related records"""
        required_fields = ['name', 'model', 'owner_id']
        if not all(field in agent_data for field in required_fields):
            raise ValueError(f"Missing required fields: {required_fields}")

        agent_config = AgentConfig(
            name=agent_data["name"],
            description=agent_data.get("description", ""),
            tools=agent_data.get("tools", []),
            model=agent_data["model"],
            allowed_imports=agent_data.get("allowed_imports", [])
        )
        
        agent_state = AgentState(status="idle")
        agent_stats = AgentStats()
        
        agent = Agent(
            config=agent_config,
            state=agent_state,
            stats=agent_stats,
            owner_id=agent_data["owner_id"]
        )
        
        db.add(agent)
        db.commit()
        db.refresh(agent)
        return agent
        
    @staticmethod
    def get_agent(db: Session, agent_id: int) -> Optional[Agent]:
        """Retrieve an agent by ID"""
        return db.query(Agent).filter(Agent.id == agent_id).first()
        
    @staticmethod
    def update_agent_state(db: Session, agent_id: int, state: str) -> None:
        """Update an agent's state"""
        db.query(AgentState)\
            .filter(AgentState.id == agent_id)\
            .update({"status": state})
        db.commit()
        
    @staticmethod
    def update_agent_stats(db: Session, agent_id: int, stats: dict) -> None:
        """Update an agent's statistics"""
        db.query(AgentStats)\
            .filter(AgentStats.id == agent_id)\
            .update(stats)
        db.commit()
        
    @staticmethod
    def delete_agent(db: Session, agent_id: int) -> None:
        """Delete an agent and related records"""
        agent = db.query(Agent).filter(Agent.id == agent_id).first()
        if not agent:
            raise ValueError("Agent not found")
            
        db.delete(agent.config)
        db.delete(agent.state)
        db.delete(agent.stats)
        db.delete(agent)
        db.commit()


    @staticmethod
    def update_agent(db: Session, agent_id: int, update_data: dict) -> Agent:
        """Update existing agent with partial data"""
        agent = db.query(Agent).filter(Agent.id == agent_id).first()
        if not agent:
            raise ValueError("Agent not found")

        for key, value in update_data.items():
            setattr(agent, key, value)
            
        db.commit()
        db.refresh(agent)
        return agent

    @staticmethod
    def get_user_by_username(db: Session, username: str) -> Optional[User]:
        """Retrieve a user by their username"""
        return db.query(User).filter(User.username == username).first()
