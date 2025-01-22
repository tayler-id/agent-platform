import os
import pytest
from unittest.mock import MagicMock
from sqlalchemy.orm import declarative_base

# Set environment variables before any imports
os.environ["SUPABASE_URL"] = "mock://url"
os.environ["SECRET_KEY"] = "test-secret-key"
os.environ["SUPABASE_KEY"] = "mock-key"

# Create mock Base class
MockBase = declarative_base()

# Mock the database Base
import agent_platform.core.models.database
agent_platform.core.models.database.Base = MockBase

# Now we can safely import our app modules
from agent_platform.main import app, get_current_user
from agent_platform.core.models.user import User
from agent_platform.core.models.agent import Agent
from agent_platform.core.auth import create_access_token

@pytest.fixture
def db_session():
    session = MagicMock()
    return session

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

@pytest.fixture
def mock_current_user(test_user):
    async def override_get_current_user():
        return test_user
    return override_get_current_user

@pytest.fixture
def override_get_db(db_session):
    def _get_db():
        yield db_session
    return _get_db

@pytest.fixture
def client(override_get_db, mock_current_user):
    app.dependency_overrides = {}
    app.dependency_overrides["get_db"] = override_get_db
    app.dependency_overrides["get_current_user"] = mock_current_user
    from fastapi.testclient import TestClient
    test_client = TestClient(app)
    yield test_client
    app.dependency_overrides = {}
