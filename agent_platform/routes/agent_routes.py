from fastapi import APIRouter, HTTPException, Body
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from ..core.agent_framework import AgentFramework
from ..core.models.agent import AgentConfig
from ..core.utils import format_error
import logging
from datetime import datetime

class MarketplaceListing(BaseModel):
    agent_id: str
    type: str  # 'sale' or 'rent'
    price: float

class ChatMessage(BaseModel):
    message: str

router = APIRouter()
framework = AgentFramework()
logger = logging.getLogger(__name__)

# In-memory storage for marketplace and stats
marketplace_listings: Dict[str, Dict[str, Any]] = {}
agent_stats: Dict[str, Dict[str, Any]] = {}

@router.post("/agents", response_model=Dict[str, Any])
async def create_agent(config: AgentConfig):
    """Create a new agent"""
    try:
        agent = framework.create_agent(config.dict())
        # Initialize stats for the new agent
        agent_stats[agent.id] = {
            "rating": 0,
            "earnings": 0,
            "tasks_completed": 0,
            "created_at": datetime.now().isoformat()
        }
        return {
            "status": "success",
            "agent_id": agent.id,
            "state": agent.state.value,
            "stats": agent_stats[agent.id]
        }
    except Exception as e:
        logger.error(f"Error creating agent: {str(e)}")
        raise HTTPException(status_code=400, detail=format_error(e))

@router.get("/agents", response_model=List[Dict[str, Any]])
async def list_agents():
    """List all agents with their stats"""
    try:
        agents = framework.list_agents()
        # Attach stats to each agent
        for agent in agents:
            agent_id = agent["id"]
            if agent_id in agent_stats:
                agent.update(agent_stats[agent_id])
        return agents
    except Exception as e:
        logger.error(f"Error listing agents: {str(e)}")
        raise HTTPException(status_code=500, detail=format_error(e))

@router.post("/agents/{agent_id}/start")
async def start_agent(agent_id: str):
    """Start an agent"""
    try:
        framework.start_agent(agent_id)
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Error starting agent {agent_id}: {str(e)}")
        raise HTTPException(status_code=404, detail=format_error(e))

@router.post("/agents/{agent_id}/stop")
async def stop_agent(agent_id: str):
    """Stop an agent"""
    try:
        framework.stop_agent(agent_id)
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Error stopping agent {agent_id}: {str(e)}")
        raise HTTPException(status_code=404, detail=format_error(e))

@router.delete("/agents/{agent_id}")
async def delete_agent(agent_id: str):
    """Delete an agent"""
    try:
        framework.delete_agent(agent_id)
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Error deleting agent {agent_id}: {str(e)}")
        raise HTTPException(status_code=404, detail=format_error(e))

@router.put("/agents/{agent_id}", response_model=Dict[str, Any])
async def update_agent(agent_id: str, update_data: Dict[str, Any] = Body(...)):
    """Update agent details"""
    try:
        agent = framework.get_agent(agent_id)
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        # Update agent details
        for key, value in update_data.items():
            if hasattr(agent, key):
                setattr(agent, key, value)
        
        return {
            "status": "success",
            "agent": {
                "id": agent.id,
                "name": agent.name,
                "description": agent.description,
                "model": agent.model,
                **agent_stats.get(agent_id, {})
            }
        }
    except Exception as e:
        logger.error(f"Error updating agent {agent_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=format_error(e))

@router.get("/marketplace", response_model=List[Dict[str, Any]])
async def list_marketplace():
    """List all marketplace listings"""
    try:
        listings = []
        for listing_id, listing in marketplace_listings.items():
            agent = framework.get_agent(listing["agent_id"])
            if agent:
                listings.append({
                    "id": listing_id,
                    "type": listing["type"],
                    "price": listing["price"],
                    "created_at": listing["created_at"],
                    "agent": {
                        "id": agent.id,
                        "name": agent.name,
                        "description": agent.description,
                        "model": agent.model,
                        **agent_stats.get(agent.id, {})
                    }
                })
        return listings
    except Exception as e:
        logger.error(f"Error listing marketplace: {str(e)}")
        raise HTTPException(status_code=500, detail=format_error(e))

@router.post("/marketplace", response_model=Dict[str, Any])
async def create_listing(listing: MarketplaceListing):
    """Create a marketplace listing"""
    try:
        agent = framework.get_agent(listing.agent_id)
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        listing_id = f"listing_{len(marketplace_listings) + 1}"
        marketplace_listings[listing_id] = {
            "agent_id": listing.agent_id,
            "type": listing.type,
            "price": listing.price,
            "created_at": datetime.now().isoformat()
        }
        
        return {
            "status": "success",
            "listing_id": listing_id
        }
    except Exception as e:
        logger.error(f"Error creating listing: {str(e)}")
        raise HTTPException(status_code=400, detail=format_error(e))

@router.post("/marketplace/{listing_id}/purchase", response_model=Dict[str, Any])
async def purchase_listing(listing_id: str):
    """Purchase or rent an agent from marketplace"""
    try:
        if listing_id not in marketplace_listings:
            raise HTTPException(status_code=404, detail="Listing not found")
        
        listing = marketplace_listings[listing_id]
        agent_id = listing["agent_id"]
        
        # Update agent stats
        if agent_id in agent_stats:
            agent_stats[agent_id]["earnings"] += listing["price"]
        
        # Remove listing after purchase
        del marketplace_listings[listing_id]
        
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Error purchasing listing {listing_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=format_error(e))

@router.post("/agents/{agent_id}/chat", response_model=Dict[str, Any])
async def chat_with_agent(agent_id: str, message: ChatMessage):
    """Chat with an agent"""
    try:
        agent = framework.get_agent(agent_id)
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        # TODO: Implement actual agent chat logic
        response = f"Hello! I am {agent.name}. Thanks for your message: {message.message}"
        
        # Update agent stats
        if agent_id in agent_stats:
            agent_stats[agent_id]["tasks_completed"] += 1
        
        return {
            "status": "success",
            "response": response
        }
    except Exception as e:
        logger.error(f"Error chatting with agent {agent_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=format_error(e))

@router.post("/tools/register")
async def register_tool(tool_config: Dict[str, Any]):
    """Register a new tool"""
    try:
        # TODO: Implement tool registration
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Error registering tool: {str(e)}")
        raise HTTPException(status_code=400, detail=format_error(e))
