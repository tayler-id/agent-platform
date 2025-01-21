from typing import Dict, List, Optional, Any
from smolagents import CodeAgent, HfApiModel, DuckDuckGoSearchTool
from .models.agent import Agent, AgentConfig, AgentState, AgentStats
from .tools.duckduckgo import DuckDuckGoTool
from .tools.voice_tools import TextToSpeechTool, SpeechToTextTool
from .models.marketplace import MarketplaceListing as Listing, Rental, Transaction, ListingType, PricingModel
from .models.gamification import Achievement, Badge, LeaderboardEntry, UserProgress, ACHIEVEMENTS, AchievementType
from .utils import generate_agent_id, validate_config, log_agent_activity
from .tools.base import BaseTool
from .db_operations import DBOperations
from .models.database import get_db
import logging
from datetime import datetime
from contextlib import contextmanager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AgentFramework:
    """Core framework for managing agents and marketplace functionality"""
    
    def __init__(self):
        self.available_tools: Dict[str, BaseTool] = {}
        self.listings: Dict[str, Listing] = {}
        self.rentals: Dict[str, Rental] = {}
        self.transactions: List[Transaction] = []
        self.user_progress: Dict[str, UserProgress] = {}
        self.leaderboard: Dict[str, List[LeaderboardEntry]] = {}
        
        # Initialize database session
        self.db = next(get_db())
        
        # Register default tools
        self.register_tool(DuckDuckGoTool())
        self.register_tool(TextToSpeechTool())
        self.register_tool(SpeechToTextTool())
        # Use our custom DuckDuckGoTool wrapper instead of raw search tool

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
                
        # Initialize with smolagents
        agent_instance = CodeAgent(
            tools=tools,
            model=HfApiModel(),
            additional_authorized_imports=config.get("allowed_imports", [])
        )
        
        # Create agent in database
        agent = DBOperations.create_agent(self.db, {
            "id": agent_id,
            "name": config["name"],
            "description": config["description"],
            "owner_id": config["owner_id"],
            "tools": config.get("tools", []),
            "model": config["model"],
            "allowed_imports": config.get("allowed_imports", []),
            "agent_metadata": config.get("agent_metadata", {})
        })
        
        # Add instance reference
        agent.instance = agent_instance
        
        # Initialize user progress if needed
        if config["owner_id"] not in self.user_progress:
            self.user_progress[config["owner_id"]] = UserProgress(
                user_id=config["owner_id"],
                achievements=[],
                badges=[],
                total_points=0,
                level=1,
                stats={}
            )
        
        log_agent_activity(agent_id, "agent_created")
        return agent
        
    def run_agent(self, agent_id: str, task: str) -> str:
        """Run an agent on a specific task"""
        agent = self._get_agent(agent_id)
        
        # Check rental status if applicable
        rental = self._get_active_rental(agent_id)
        if rental:
            rental.usage_count += 1
            
        try:
            # Update state directly for testing
            agent.state.status = "busy"
            self.db.commit()
            
            # Run synchronously for testing
            result = agent.instance.run(task)
            
            # Update stats directly
            agent.stats.tasks_completed += 1
            self.db.commit()
            
            self._check_achievements(agent.owner_id)
            self._update_leaderboard(agent_id)
            
            return result
            
        except Exception as e:
            agent.state.status = "error"
            self.db.commit()
            logger.error(f"Error running agent {agent_id}: {str(e)}")
            raise
            
        finally:
            agent.state.status = "idle"
            self.db.commit()

    def stop_agent(self, agent_id: str) -> None:
        """Stop a running agent"""
        agent = self._get_agent(agent_id)
        
        if agent.state.status == "idle":
            return
            
        try:
            # Stop any running operations
            if hasattr(agent.instance, 'stop'):
                agent.instance.stop()
                
            agent.state.status = "idle"
            self.db.commit()
            logger.info(f"Agent {agent_id} stopped successfully")
            
        except Exception as e:
            agent.state.status = "error"
            self.db.commit()
            logger.error(f"Error stopping agent {agent_id}: {str(e)}")
            raise

    def delete_agent(self, agent_id: str) -> None:
        """Permanently delete an agent"""
        agent = self._get_agent(agent_id)
        
        try:
            # Stop agent if running
            if agent.state.status != "idle":
                self.stop_agent(agent_id)
                
            # Remove from database
            DBOperations.delete_agent(self.db, agent_id)
            
            # Clean up any related resources
            if hasattr(agent, 'instance'):
                del agent.instance
                
            logger.info(f"Agent {agent_id} deleted successfully")
            
        except Exception as e:
            logger.error(f"Error deleting agent {agent_id}: {str(e)}")
            raise
        
    def create_listing(self, agent_id: str, listing_type: ListingType, pricing: PricingModel) -> Listing:
        """Create a new marketplace listing"""
        agent = self._get_agent(agent_id)
        
        listing = Listing(
            id=f"listing_{len(self.listings)}",
            agent_id=agent_id,
            seller_id=agent.owner_id,
            type=listing_type,
            pricing=pricing
        )
        
        self.listings[listing.id] = listing
        
        # Award marketplace achievement
        self._check_achievement(agent.owner_id, "marketplace_pioneer")
        
        return listing
        
    def create_rental(self, listing_id: str, renter_id: str) -> Rental:
        """Create a new rental agreement"""
        listing = self.listings.get(listing_id)
        if not listing or listing.type != ListingType.RENT:
            raise ValueError("Invalid listing for rental")
            
        rental = Rental(
            id=f"rental_{len(self.rentals)}",
            listing_id=listing_id,
            renter_id=renter_id,
            start_time=datetime.now()
        )
        
        self.rentals[rental.id] = rental
        
        # Record transaction
        self._record_transaction(listing, renter_id)
        
        return rental
        
    def _check_achievements(self, user_id: str):
        """Check and award any newly earned achievements"""
        progress = self.user_progress[user_id]
        
        for achievement_id, achievement in ACHIEVEMENTS.items():
            if achievement_id not in progress.achievements:
                if self._check_achievement_criteria(user_id, achievement):
                    progress.achievements.append(achievement_id)
                    progress.badges.append(achievement.badge)
                    progress.total_points += achievement.points
                    progress.level = 1 + (progress.total_points // 1000)
        
    def _check_achievement_criteria(self, user_id: str, achievement: Achievement) -> bool:
        """Check if a user meets criteria for an achievement"""
        progress = self.user_progress[user_id]
        
        if achievement.type == AchievementType.EARNINGS:
            total_earnings = sum(t.amount for t in self.transactions 
                               if t.seller_id == user_id)
            return total_earnings >= achievement.threshold
            
        elif achievement.type == AchievementType.TASKS:
            total_tasks = sum(a.stats.tasks_completed for a in self.agents.values()
                            if a.owner_id == user_id)
            return total_tasks >= achievement.threshold
            
        elif achievement.type == AchievementType.RATING:
            agents = [a for a in self.agents.values() if a.owner_id == user_id]
            if not agents:
                return False
            avg_rating = sum(a.stats.rating for a in agents) / len(agents)
            return avg_rating >= achievement.threshold
            
        return False
        
    def _update_leaderboard(self, agent_id: str):
        """Update leaderboard entries for an agent"""
        agent = self._get_agent(agent_id)
        
        # Update earnings leaderboard
        earnings_entry = LeaderboardEntry(
            agent_id=agent_id,
            score=agent.stats.earnings,
            category="earnings"
        )
        self._add_leaderboard_entry("earnings", earnings_entry)
        
        # Update rating leaderboard
        rating_entry = LeaderboardEntry(
            agent_id=agent_id,
            score=agent.stats.rating,
            category="rating"
        )
        self._add_leaderboard_entry("rating", rating_entry)
        
        # Update tasks leaderboard
        tasks_entry = LeaderboardEntry(
            agent_id=agent_id,
            score=agent.stats.tasks_completed,
            category="tasks"
        )
        self._add_leaderboard_entry("tasks", tasks_entry)
    
    def _add_leaderboard_entry(self, category: str, entry: LeaderboardEntry):
        """Add an entry to a specific leaderboard category"""
        if category not in self.leaderboard:
            self.leaderboard[category] = []
            
        self.leaderboard[category].append(entry)
        self.leaderboard[category].sort(key=lambda x: x.score, reverse=True)
        
        # Keep only top 100 entries
        if len(self.leaderboard[category]) > 100:
            self.leaderboard[category] = self.leaderboard[category][:100]
    
    def _record_transaction(self, listing: Listing, buyer_id: str):
        """Record a marketplace transaction"""
        transaction = Transaction(
            id=f"tx_{len(self.transactions)}",
            listing_id=listing.id,
            buyer_id=buyer_id,
            seller_id=listing.seller_id,
            amount=listing.pricing.base_price,
            type=listing.type
        )
        
        self.transactions.append(transaction)
        
        # Update seller stats
        seller_agent = self._get_agent(listing.agent_id)
        seller_agent.stats.earnings += transaction.amount
        
        # Check seller achievements
        self._check_achievements(listing.seller_id)
    
    def _get_active_rental(self, agent_id: str) -> Optional[Rental]:
        """Get active rental for an agent if it exists"""
        for rental in self.rentals.values():
            listing = self.listings.get(rental.listing_id)
            if listing and listing.agent_id == agent_id and rental.status == "active":
                return rental
        return None
    
    def _get_agent(self, agent_id: str) -> Agent:
        """Internal method to get agent with error handling"""
        agent = DBOperations.get_agent(self.db, agent_id)
        if not agent:
            raise ValueError(f"Agent {agent_id} not found")
            
        # Load instance if needed
        if not hasattr(agent, 'instance'):
            tools = [self.available_tools[tool_name].tool_instance 
                    for tool_name in agent.config.tools]
            agent.instance = CodeAgent(
                tools=tools,
                model=HfApiModel(),
                additional_authorized_imports=agent.config.allowed_imports
            )
            
        return agent
