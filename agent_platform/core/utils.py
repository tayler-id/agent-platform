import uuid
import logging

logger = logging.getLogger(__name__)

def generate_agent_id(name: str) -> str:
    """Generates a unique agent ID."""
    return f"{name.lower().replace(' ', '_')}-{uuid.uuid4().hex[:6]}"

def validate_config(config: dict) -> bool:
    """Validates the agent configuration."""
    required_fields = ["name", "owner_id", "model"]
    return all(field in config for field in required_fields)

def log_agent_activity(agent_id: str, activity_type: str, agent_metadata: dict = None):
    """Logs agent activity."""
    log_message = f"Agent ID: {agent_id} - Activity: {activity_type}"
    if agent_metadata:
        log_message += f" - Metadata: {agent_metadata}"
    logger.info(log_message)
