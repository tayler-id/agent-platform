from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime
from smolagents import CodeAgent

class ListingType(str, Enum):
    """Types of marketplace listings"""
    SALE = "sale"
    RENT = "rent"

class AgentState(str, Enum):
    """Possible states of an agent"""
    CREATED = "created"
    RUNNING = "running"
    STOPPED = "stopped"
    ERROR = "error"

class AgentConfig(BaseModel):
    """Configuration for creating an agent"""
    id: str = Field(..., description="Unique identifier for the agent")
    name: str = Field(..., description="Human-readable name of the agent")
    description: str = Field(..., description="Description of the agent's purpose")
    tools: List[str] = Field(default_factory=list, 
                           description="List of tool names available to this agent")
    model: str = Field(..., description="Model identifier to use for this agent")
    allowed_imports: List[str] = Field(default_factory=list,
                                     description="List of additional allowed imports")
    metadata: Dict[str, Any] = Field(default_factory=dict,
                                   description="Additional metadata for the agent")

class MarketplaceListing(BaseModel):
    """Represents a marketplace listing"""
    id: str = Field(..., description="Unique identifier for the listing")
    agent_id: str = Field(..., description="ID of the agent being listed")
    type: ListingType = Field(..., description="Type of listing (sale/rent)")
    price: float = Field(..., description="Price of the listing")
    created_at: datetime = Field(default_factory=datetime.now)
    seller_id: Optional[str] = Field(None, description="ID of the seller")
    duration: Optional[int] = Field(None, description="Duration in days for rental listings")

class AgentStats(BaseModel):
    """Runtime statistics for an agent"""
    # Performance metrics
    total_requests: int = 0
    successful_requests: int = 0
    failed_requests: int = 0
    average_response_time: float = 0.0
    last_error: Optional[str] = None
    
    # Gamification metrics
    rating: float = Field(default=0.0, description="Average rating (0-5)")
    total_ratings: int = Field(default=0, description="Number of ratings received")
    earnings: float = Field(default=0.0, description="Total earnings from marketplace")
    tasks_completed: int = Field(default=0, description="Total tasks completed")
    level: int = Field(default=1, description="Agent's experience level")
    experience_points: int = Field(default=0, description="Points earned from tasks")
    achievements: List[str] = Field(default_factory=list, description="List of earned achievements")
    
    # Marketplace metrics
    times_purchased: int = Field(default=0, description="Number of times purchased")
    times_rented: int = Field(default=0, description="Number of times rented")
    current_owner: Optional[str] = Field(None, description="ID of current owner")
    marketplace_status: Optional[str] = Field(None, description="Current marketplace status")

class AgentRating(BaseModel):
    """Represents a rating given to an agent"""
    id: str = Field(..., description="Unique identifier for the rating")
    agent_id: str = Field(..., description="ID of the rated agent")
    rater_id: str = Field(..., description="ID of the user who rated")
    rating: float = Field(..., description="Rating value (0-5)")
    comment: Optional[str] = Field(None, description="Optional comment")
    created_at: datetime = Field(default_factory=datetime.now)

class Agent(BaseModel):
    """Represents an agent instance"""
    id: str
    config: AgentConfig
    instance: CodeAgent
    state: AgentState = AgentState.CREATED
    stats: AgentStats = Field(default_factory=AgentStats)
    created_at: datetime = Field(default_factory=datetime.now)
    last_active: Optional[datetime] = None
    owner_id: Optional[str] = None
    
    def update_stats(self, successful: bool, response_time: float):
        """Update agent statistics after a request"""
        self.stats.total_requests += 1
        if successful:
            self.stats.successful_requests += 1
            self.stats.tasks_completed += 1
            self.stats.experience_points += 10
            
            # Level up logic
            level_threshold = self.stats.level * 100
            if self.stats.experience_points >= level_threshold:
                self.stats.level += 1
                self.stats.achievements.append(f"Reached Level {self.stats.level}")
        else:
            self.stats.failed_requests += 1
        
        # Update average response time
        total_requests = self.stats.successful_requests + self.stats.failed_requests
        self.stats.average_response_time = (
            (self.stats.average_response_time * (total_requests - 1) + response_time) 
            / total_requests
        )
        self.last_active = datetime.now()
    
    def add_rating(self, rating: float):
        """Add a new rating for the agent"""
        self.stats.total_ratings += 1
        self.stats.rating = (
            (self.stats.rating * (self.stats.total_ratings - 1) + rating)
            / self.stats.total_ratings
        )
    
    class Config:
        arbitrary_types_allowed = True
