import pytest
from unittest.mock import MagicMock, patch, Mock
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Dict, Any
import uuid
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from agent_platform.core.agent_framework import AgentFramework
from agent_platform.core.db_operations import DBOperations
from agent_platform.core.models.agent import Agent, AgentConfig, AgentState, AgentStats

@pytest.fixture
def mock_db_session():
    session = MagicMock(spec=Session)
    return session

@pytest.fixture
def mock_get_db(mock_db_session):
    def get_db():
        try:
            yield mock_db_session
        finally:
            pass
    return get_db

@pytest.fixture
def agent_framework(mock_get_db):
    with patch('agent_platform.core.agent_framework.get_db', mock_get_db):
        framework = AgentFramework()
        # Register duckduckgo tool
        mock_tool = MagicMock()
        mock_tool.config = MagicMock()
        mock_tool.config.name = "duckduckgo"
        framework.available_tools = {"duckduckgo": mock_tool}
        framework.agents = {}  # Add agents dictionary
        yield framework

def test_create_agent(agent_framework, mock_db_session):
    config = {
        "name": "test_agent",
        "description": "test description",
        "tools": ["duckduckgo"],
        "model": "gpt-4",
        "owner_id": "user1",
        "allowed_imports": ["datetime"]
    }
    
    # Test successful creation
    with patch('agent_platform.core.db_operations.AgentState') as mock_state:
        mock_state.return_value = MagicMock(
            status="idle",
            last_updated=datetime.now()
        )
        with patch('agent_platform.core.db_operations.Agent') as mock_agent:
            mock_agent.return_value = MagicMock(
                id=str(uuid.uuid4()),
                created_at=datetime.now(),
                updated_at=datetime.now(),
                state=mock_state.return_value
            )
            result = agent_framework.create_agent(config)
            assert isinstance(result, Agent)
            mock_db_session.add.assert_called()
            mock_db_session.commit.assert_called()
            mock_db_session.refresh.assert_called()

def test_get_agent(agent_framework, mock_db_session):
    # Setup mock agent
    mock_agent = MagicMock(spec=Agent)
    mock_db_session.query.return_value.filter.return_value.first.return_value = mock_agent
    
    # Test retrieval
    result = agent_framework._get_agent(1)
    assert result == mock_agent
    mock_db_session.query.assert_called()

def test_update_agent_state(agent_framework, mock_db_session):
    # Setup mock agent
    mock_agent = MagicMock(spec=Agent)
    mock_agent.state = MagicMock()
    mock_db_session.query.return_value.filter.return_value.first.return_value = mock_agent
    
    # Test state update
    agent_framework.run_agent(1, "test task")
    mock_agent.state.status = "busy"
    mock_db_session.commit.assert_called()

def test_update_agent_stats(agent_framework, mock_db_session):
    # Setup mock agent
    mock_agent = MagicMock(spec=Agent)
    mock_agent.stats = MagicMock()
    mock_agent.stats.tasks_completed = 0
    mock_db_session.query.return_value.filter.return_value.first.return_value = mock_agent
    
    # Test stats update
    agent_framework.run_agent(1, "test task")
    assert mock_agent.stats.tasks_completed == 1
    mock_db_session.commit.assert_called()

def test_create_listing(agent_framework, mock_db_session):
    # Test listing creation
    listing = agent_framework.create_listing("agent1", "rent", {"base_price": 10.0})
    assert listing.id.startswith("listing_")
    assert listing.agent_id == "agent1"

def test_register_tool(agent_framework):
    # Test tool registration
    mock_tool = MagicMock()
    mock_tool.config = MagicMock()
    mock_tool.config.name = "test_tool"
    
    agent_framework.register_tool(mock_tool)
    assert "test_tool" in agent_framework.available_tools

def test_create_rental(agent_framework, mock_db_session):
    # Create a listing first
    listing = agent_framework.create_listing("agent1", "rent", {"base_price": 10.0})
    
    # Test rental creation
    rental = agent_framework.create_rental(listing.id, "user1")
    assert rental.id.startswith("rental_")
    assert rental.listing_id == listing.id

def test_record_transaction(agent_framework, mock_db_session):
    # Create a listing first
    listing = agent_framework.create_listing("agent1", "rent", {"base_price": 10.0})
    
    # Test transaction recording
    agent_framework._record_transaction(listing, "user1")
    assert len(agent_framework.transactions) == 1
    assert agent_framework.transactions[0].amount == 10.0

def test_check_achievements(agent_framework, mock_db_session):
    # Setup user progress
    agent_framework.user_progress["user1"] = {
        "tasks_completed": 5,
        "transactions": 3,
        "earnings": 100.0
    }
    
    # Setup mock achievements
    mock_achievement = MagicMock()
    mock_db_session.query.return_value.filter.return_value.all.return_value = [mock_achievement]
    
    # Test achievement checking
    agent_framework._check_achievements("user1")
    mock_db_session.commit.assert_called()
    mock_db_session.add.assert_called()

def test_update_leaderboard(agent_framework, mock_db_session):
    # Create an agent first
    config = {
        "name": "test_agent",
        "description": "test description",
        "tools": ["duckduckgo"],
        "model": "gpt-4",
        "owner_id": "user1",
        "allowed_imports": ["datetime"]
    }
    agent = agent_framework.create_agent(config)
    
    # Test leaderboard update
    agent_framework._update_leaderboard(agent.id)
    assert len(agent_framework.leaderboard["earnings"]) > 0
    assert len(agent_framework.leaderboard["rating"]) > 0
    assert len(agent_framework.leaderboard["tasks"]) > 0
