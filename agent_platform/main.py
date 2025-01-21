from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional, Dict
import uvicorn
import os
from datetime import datetime

from agent_platform.core.agent_framework import AgentFramework
from core.models.marketplace import ListingType, RentalDuration, PricingModel
from core.models.gamification import AchievementType, BadgeRarity
from core.auth import get_current_user
from core.models.database import Base, engine

# Initialize FastAPI app and framework
app = FastAPI(title="Agent Platform API")
framework = AgentFramework()

# Initialize database tables
Base.metadata.create_all(bind=engine)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/api/v1/health")
async def health_check():
    return {"status": "ok"}

# Pydantic models
class AgentCreate(BaseModel):
    name: str
    description: str
    model: str
    tools: List[str] = []
    allowed_imports: List[str] = []

class AgentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    model: Optional[str] = None
    tools: Optional[List[str]] = None

class ListingCreate(BaseModel):
    agent_id: str
    type: ListingType
    base_price: float
    usage_fee: Optional[float] = None
    subscription_fee: Optional[float] = None
    duration: Optional[RentalDuration] = None

class RentalCreate(BaseModel):
    listing_id: str

class ChatMessage(BaseModel):
    message: str

class UserStats(BaseModel):
    achievements: List[str]
    badges: List[str]
    total_points: int
    level: int
    stats: Dict[str, float]

# Agent routes
@app.get("/api/v1/agents")
async def get_agents(user=Depends(get_current_user)):
    # Return all agents for now, regardless of owner
    return [agent.to_dict() for agent in framework.agents.values()]

@app.post("/api/v1/agents")
async def create_agent(agent: AgentCreate, user=Depends(get_current_user)):
    config = {
        "name": agent.name,
        "description": agent.description,
        "model": agent.model,
        "tools": agent.tools,
        "allowed_imports": agent.allowed_imports,
        "owner_id": user.id
    }
    created_agent = framework.create_agent(config)
    return created_agent.to_dict()

@app.get("/api/v1/agents/{agent_id}")
async def get_agent(agent_id: str, user=Depends(get_current_user)):
    agent = framework.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    if agent.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return agent.to_dict()

@app.post("/api/v1/agents/{agent_id}/run")
async def run_agent(agent_id: str, message: ChatMessage, user=Depends(get_current_user)):
    agent = framework.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
        
    try:
        result = await framework.run_agent(agent_id, message.message)
        return {"response": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Marketplace routes
@app.get("/api/v1/marketplace")
async def get_marketplace_listings():
    return [listing.to_dict() for listing in framework.listings.values()]

@app.post("/api/v1/marketplace")
async def create_listing(listing: ListingCreate, user=Depends(get_current_user)):
    agent = framework.get_agent(listing.agent_id)
    if not agent or agent.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    pricing = PricingModel(
        base_price=listing.base_price,
        usage_fee=listing.usage_fee,
        subscription_fee=listing.subscription_fee,
        duration=listing.duration
    )
    
    return framework.create_listing(
        agent_id=listing.agent_id,
        listing_type=listing.type,
        pricing=pricing
    ).to_dict()

@app.post("/api/v1/marketplace/{listing_id}/rent")
async def rent_agent(listing_id: str, user=Depends(get_current_user)):
    try:
        rental = framework.create_rental(listing_id, user.id)
        return rental.to_dict()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/marketplace/{listing_id}/purchase")
async def purchase_agent(listing_id: str, user=Depends(get_current_user)):
    listing = framework.listings.get(listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
        
    if listing.type != ListingType.SALE:
        raise HTTPException(status_code=400, detail="Listing is not for sale")
        
    try:
        framework._record_transaction(listing, user.id)
        framework.listings.pop(listing_id)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Gamification routes
@app.get("/api/v1/users/me/stats")
async def get_user_stats(user=Depends(get_current_user)):
    progress = framework.user_progress.get(user.id)
    if not progress:
        raise HTTPException(status_code=404, detail="User progress not found")
    return progress.to_dict()

@app.get("/api/v1/leaderboard/{category}")
async def get_leaderboard(category: str):
    if category not in framework.leaderboard:
        raise HTTPException(status_code=404, detail="Leaderboard category not found")
    return [entry.to_dict() for entry in framework.leaderboard[category]]

@app.get("/api/v1/achievements")
async def get_achievements():
    return {id: achievement.to_dict() for id, achievement in ACHIEVEMENTS.items()}

# Mount static files after API routes
app.mount("/", StaticFiles(directory="c:/Users/ramsa/Documents/my_smol_project/agent_platform", html=True), name="static")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
