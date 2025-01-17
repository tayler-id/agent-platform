from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from dotenv import load_dotenv
import os

from .routes import agent_routes, auth_routes
from .core.models.database import Database

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Agent Platform API",
    description="API for managing and interacting with AI agents",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add trusted host middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]  # In production, replace with specific hosts
)

# Include routers
app.include_router(auth_routes.router, tags=["Authentication"])
app.include_router(agent_routes.router, tags=["Agents"])

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup."""
    # Verify Supabase configuration
    if not os.getenv("SUPABASE_URL") or not os.getenv("SUPABASE_KEY"):
        raise HTTPException(
            status_code=500,
            detail="Supabase configuration missing. Please check your .env file."
        )
    
    # Test Supabase connection
    try:
        # Simple query to verify connection
        Database.supabase.table('agents').select("*").limit(1).execute()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to connect to Supabase: {str(e)}"
        )

@app.get("/", tags=["Health"])
async def health_check():
    """API health check endpoint."""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "supabase_connected": True
    }

@app.get("/api-info", tags=["Documentation"])
async def api_info():
    """Get API information and available endpoints."""
    return {
        "name": "Agent Platform API",
        "version": "1.0.0",
        "description": "API for managing and interacting with AI agents",
        "documentation": "/docs",  # FastAPI auto-generated docs
        "redoc": "/redoc",        # Alternative documentation
        "features": [
            "User Authentication",
            "Agent Management",
            "Real-time Updates",
            "Rate Limiting",
            "CORS Support"
        ],
        "endpoints": {
            "auth": [
                "POST /auth/signup - Register new user",
                "POST /auth/signin - Authenticate user",
                "POST /auth/refresh - Refresh access token",
                "POST /auth/signout - Sign out user",
                "GET /auth/me - Get current user info"
            ],
            "agents": [
                "POST /agents - Create new agent",
                "GET /agents - List user's agents",
                "GET /agents/{id} - Get specific agent",
                "PATCH /agents/{id} - Update agent",
                "DELETE /agents/{id} - Delete agent",
                "WS /ws/agents/{id} - Real-time agent updates"
            ]
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 3000)),
        reload=os.getenv("NODE_ENV") == "development"
    )
