from sqlalchemy.orm import Session
from .models.database import get_db
from .models.agent import Agent, AgentConfig, AgentState, AgentStats
from .models.user import DBUser as User
from typing import Optional

class DBOperations:
    """Handles all database operations for agent persistence"""
    
    @staticmethod
    def create_agent(db: Session, config: dict) -> Agent:
        """Create and persist a new agent"""
        agent_config = AgentConfig(
            name=config["name"],
            description=config.get("description", ""),
            tools=config.get("tools", []),
            model=config["model"],
            allowed_imports=config.get("allowed_imports", [])
        )
        
        agent_state = AgentState(status="idle")
        agent_stats = AgentStats()
        
        agent = Agent(
            config=agent_config,
            state=agent_state,
            stats=agent_stats,
            owner_id=config["owner_id"]
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
        if agent:
            db.delete(agent.config)
            db.delete(agent.state)
            db.delete(agent.stats)
            db.delete(agent)
            db.commit()

    @staticmethod
    def get_user_by_username(db: Session, username: str) -> Optional[User]:
        """Retrieve a user by their username"""
        return db.query(User).filter(User.username == username).first()
