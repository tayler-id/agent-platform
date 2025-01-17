from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from ..core.models.database import Database
from ..core.auth import get_current_user, User

router = APIRouter()

class AgentCreate(BaseModel):
    name: str
    description: Optional[str] = None
    config: Optional[dict] = None

class AgentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    config: Optional[dict] = None
    status: Optional[str] = None

class AgentResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    config: Optional[dict]
    status: str
    created_at: datetime
    updated_at: datetime
    owner_id: str

@router.post("/agents", response_model=AgentResponse)
async def create_agent(
    agent: AgentCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new agent."""
    try:
        db_agent = await Database.create_agent(
            name=agent.name,
            description=agent.description,
            config=agent.config,
            owner_id=current_user.id
        )
        return db_agent
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/agents", response_model=List[AgentResponse])
async def list_agents(
    current_user: User = Depends(get_current_user)
):
    """List all agents owned by the current user."""
    try:
        agents = await Database.list_agents(owner_id=current_user.id)
        return agents
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/agents/{agent_id}", response_model=AgentResponse)
async def get_agent(
    agent_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get a specific agent by ID."""
    agent = await Database.get_agent(agent_id)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    if agent['owner_id'] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this agent"
        )
    return agent

@router.patch("/agents/{agent_id}", response_model=AgentResponse)
async def update_agent(
    agent_id: str,
    agent_update: AgentUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update an agent's information."""
    existing = await Database.get_agent(agent_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    if existing['owner_id'] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this agent"
        )
    
    update_data = agent_update.dict(exclude_unset=True)
    try:
        updated = await Database.update_agent(agent_id, update_data)
        return updated
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.delete("/agents/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_agent(
    agent_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete an agent."""
    existing = await Database.get_agent(agent_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    if existing['owner_id'] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this agent"
        )
    
    await Database.delete_agent(agent_id)

# Real-time subscriptions example
@router.websocket("/ws/agents/{agent_id}")
async def agent_status_updates(
    websocket,
    agent_id: str,
    current_user: User = Depends(get_current_user)
):
    """WebSocket endpoint for real-time agent status updates."""
    try:
        # Verify agent access
        agent = await Database.get_agent(agent_id)
        if not agent or agent['owner_id'] != current_user.id:
            await websocket.close(code=status.WS_1003_UNSUPPORTED_DATA)
            return

        await websocket.accept()
        
        # Subscribe to Supabase real-time updates
        subscription = Database.supabase.table('agents')\
            .on('UPDATE', lambda payload: websocket.send_json(payload))\
            .eq('id', agent_id)\
            .subscribe()

        try:
            while True:
                await websocket.receive_text()
        except:
            subscription.unsubscribe()
            await websocket.close()
            
    except Exception as e:
        if not websocket.closed:
            await websocket.close(code=status.WS_1011_INTERNAL_ERROR)
