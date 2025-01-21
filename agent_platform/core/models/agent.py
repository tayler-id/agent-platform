from datetime import datetime
from typing import List, Dict, Optional
from pydantic import BaseModel
from sqlalchemy import Column, String, Integer, Float, JSON, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from .database import Base

class AgentConfig(BaseModel):
    """Configuration for an agent"""
    name: str
    description: Optional[str] = None
    tools: List[str] = []
    model: str
    allowed_imports: List[str] = []
    metadata: Dict[str, str] = {}

class AgentState(BaseModel):
    """Current state of an agent"""
    status: str
    last_updated: datetime

class AgentStats(BaseModel):
    """Statistics for an agent"""
    tasks_completed: int = 0
    earnings: float = 0.0
    rating: float = 0.0
    last_active: Optional[datetime] = None

class Agent(BaseModel):
    """Business logic model for an agent"""
    id: str
    config: AgentConfig
    state: AgentState
    stats: AgentStats
    owner_id: str
    created_at: datetime
    updated_at: datetime

class DBAgent(Base):
    """Database model for agents"""
    __tablename__ = "agents"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)
    tools = Column(JSON, default=list)
    model = Column(String, nullable=False)
    allowed_imports = Column(JSON, default=list)
    agent_metadata = Column(JSON, default=dict)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)

    # Relationships
    owner = relationship("DBUser", back_populates="agents")
    listings = relationship("DBListing", back_populates="agent")
    rentals = relationship("DBRental", back_populates="agent")
    stats = relationship("DBAgentStats", uselist=False, back_populates="agent")

class DBAgentStats(Base):
    """Database model for agent statistics"""
    __tablename__ = "agent_stats"

    id = Column(Integer, primary_key=True, autoincrement=True)
    agent_id = Column(String, ForeignKey("agents.id"), unique=True)
    tasks_completed = Column(Integer, default=0)
    earnings = Column(Float, default=0.0)
    rating = Column(Float, default=0.0)
    last_active = Column(DateTime)

    # Relationships
    agent = relationship("DBAgent", back_populates="stats")

class DBAgentState(Base):
    """Database model for agent state"""
    __tablename__ = "agent_states"

    id = Column(Integer, primary_key=True, autoincrement=True)
    agent_id = Column(String, ForeignKey("agents.id"), unique=True)
    state = Column(String, nullable=False)
    last_updated = Column(DateTime, nullable=False)

    # Relationships
    agent = relationship("DBAgent")
