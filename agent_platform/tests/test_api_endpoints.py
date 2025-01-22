import os
import pytest
from unittest.mock import MagicMock
from sqlalchemy.orm import Session, declarative_base
from fastapi.testclient import TestClient

# Set up environment variables before any imports
@pytest.fixture(scope="session", autouse=True)
def setup_env(monkeypatch):
    monkeypatch.setenv("SUPABASE_URL", "mock://url")
    monkeypatch.setenv("SECRET_KEY", "test-secret-key")
    monkeypatch.setenv("SUPABASE_KEY", "mock-key")

# Now we can safely import our app modules
from agent_platform.main import app, get_current_user
from agent_platform.core.models.user import User
from agent_platform.core.models.agent import Agent
from agent_platform.core.auth import create_access_token

# Mock database Base class
MockBase = declarative_base()

@pytest.fixture(autouse=True)
def mock_db_base(monkeypatch):
    monkeypatch.setattr("agent_platform.core.models.database.Base", MockBase)

# Mock current user dependency
@pytest.fixture
def mock_current_user(test_user):
    async def override_get_current_user():
        return test_user
    return override_get_current_user

# Mock database session
@pytest.fixture
def db_session():
    session = MagicMock(spec=Session)
    return session

# Mock get_db dependency
@pytest.fixture
def override_get_db(db_session):
    def _get_db():
        yield db_session
    return _get_db

# Create test client with mocked dependencies
@pytest.fixture
def client(override_get_db, mock_current_user):
    app.dependency_overrides = {}
    app.dependency_overrides["get_db"] = override_get_db
    app.dependency_overrides["get_current_user"] = mock_current_user
    yield TestClient(app)
    app.dependency_overrides = {}  # Clean up after test

@pytest.fixture
def test_user(db_session):
    user = User(
        id="test-user-id",
        username="testuser",
        email="test@example.com",
        password_hash="hashedpassword"
    )
    db_session.query(User).filter.return_value.first.return_value = user
    return user

@pytest.fixture
def auth_token(test_user):
    return create_access_token({"sub": test_user.id})

def test_create_agent_success(client, auth_token, db_session, test_user):
    """Test successful agent creation with database operations verification"""
    agent_data = {
        "name": "Test Agent",
        "description": "Test description",
        "model": "gpt-4",
        "tools": [],
        "allowed_imports": ["datetime"]
    }
    
    # Create a mock agent to be returned after DB insert
    mock_agent = Agent(
        id="test-agent-id",
        name=agent_data["name"],
        description=agent_data["description"],
        model=agent_data["model"],
        tools=agent_data["tools"],
        allowed_imports=agent_data["allowed_imports"],
        owner_id=test_user.id
    )
    db_session.add.return_value = None
    db_session.commit.return_value = None
    db_session.refresh.side_effect = lambda x: setattr(x, 'id', 'test-agent-id')
    
    response = client.post(
        "/api/v1/agents",
        json=agent_data,
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    
    # Verify response
    assert response.status_code == 200
    response_data = response.json()
    assert response_data["id"] == "test-agent-id"
    assert response_data["name"] == agent_data["name"]
    assert response_data["description"] == agent_data["description"]
    assert response_data["model"] == agent_data["model"]
    
    # Verify database operations
    db_session.add.assert_called_once()
    db_session.commit.assert_called_once()
    db_session.refresh.assert_called_once()
    
    # Verify the agent data passed to add()
    added_agent = db_session.add.call_args[0][0]
    assert isinstance(added_agent, Agent)
    assert added_agent.name == agent_data["name"]
    assert added_agent.description == agent_data["description"]
    assert added_agent.model == agent_data["model"]
    assert added_agent.tools == agent_data["tools"]
    assert added_agent.allowed_imports == agent_data["allowed_imports"]
    assert added_agent.owner_id == test_user.id

def test_create_agent_unauthorized(client):
    """Test agent creation without authentication"""
    agent_data = {
        "name": "Test Agent",
        "description": "Test description",
        "model": "gpt-4",
        "tools": [],
        "allowed_imports": ["datetime"]
    }
    
    response = client.post("/api/v1/agents", json=agent_data)
    assert response.status_code == 401

def test_create_agent_missing_fields(client, auth_token):
    """Test agent creation with missing required fields"""
    agent_data = {
        "description": "Test description",
        "model": "gpt-4",
        "tools": [],
        "allowed_imports": ["datetime"]
    }
    
    response = client.post(
        "/api/v1/agents",
        json=agent_data,
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 422
    assert "name" in response.text

def test_create_agent_invalid_model(client, auth_token):
    """Test agent creation with invalid model"""
    agent_data = {
        "name": "Test Agent",
        "description": "Test description",
        "model": "invalid-model",
        "tools": [],
        "allowed_imports": ["datetime"]
    }
    
    response = client.post(
        "/api/v1/agents",
        json=agent_data,
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 400
    assert "model" in response.text
