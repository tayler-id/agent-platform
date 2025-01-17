from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from agent_platform.routes.agent_routes import router as agent_router
from agent_platform.core.agent_framework import AgentFramework
import uvicorn
import logging
import os

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

app = FastAPI(
    title="Agent Platform API",
    description="API for managing AI agents and tools",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(agent_router, prefix="/api/v1")

# Get the current directory
current_dir = os.path.dirname(os.path.abspath(__file__))

# Mount static files
app.mount("/", StaticFiles(directory=current_dir, html=True), name="static")

@app.on_event("startup")
async def startup_event():
    """Initialize the agent framework"""
    # Initialize any required services here
    pass

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up resources on shutdown"""
    # Clean up any resources here
    pass

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
