import hashlib
import json
from typing import Any, Dict
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

def generate_agent_id(name: str) -> str:
    """Generate a unique ID for an agent based on its name and timestamp"""
    timestamp = datetime.now().isoformat()
    unique_str = f"{name}-{timestamp}"
    return hashlib.sha256(unique_str.encode()).hexdigest()[:16]

def validate_config(config: Dict[str, Any]) -> bool:
    """Validate agent configuration"""
    required_fields = ["name", "description", "model"]
    return all(field in config for field in required_fields)

def serialize_agent(agent: Any) -> Dict[str, Any]:
    """Serialize an agent instance to a dictionary"""
    if not hasattr(agent, "config"):
        raise ValueError("Invalid agent instance")
        
    return {
        "id": agent.config.id,
        "name": agent.config.name,
        "description": agent.config.description,
        "state": agent.state.value,
        "stats": agent.stats.dict(),
        "metadata": agent.config.metadata
    }

def log_agent_activity(agent_id: str, action: str, details: Dict[str, Any] = None):
    """Log agent activity"""
    log_data = {
        "timestamp": datetime.now().isoformat(),
        "agent_id": agent_id,
        "action": action
    }
    
    if details:
        log_data.update(details)
        
    logger.info(json.dumps(log_data))

def format_error(error: Exception) -> Dict[str, Any]:
    """Format an exception for API responses"""
    return {
        "error": str(error),
        "type": error.__class__.__name__,
        "timestamp": datetime.now().isoformat()
    }
