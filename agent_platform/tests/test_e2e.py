import pytest
from fastapi.testclient import TestClient
from datetime import datetime
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from agent_platform.main import app
from agent_platform.core.models.agent import Agent
from agent_platform.core.models.marketplace import MarketplaceListing
from agent_platform.core.models.gamification import Achievement, LeaderboardEntry

@pytest.fixture(scope="module")
def client():
    # Setup test database
    from agent_platform.core.models.database import init_db, SessionLocal
    init_db("sqlite:///:memory:")
    
    db = SessionLocal()
    
    try:
        # Create test data
        from agent_platform.core.models.user import DBUser as User
        from agent_platform.core.models.agent import Agent
        from agent_platform.core.models.marketplace import MarketplaceListing
        
        # Create test user
        test_user = User(
            id="test_user",
            username="test_user",
            email="test@example.com",
            password_hash="test_hash"
        )
        db.add(test_user)
        
        # Create test agent
        test_agent = Agent(
            id="test_agent",
            name="Test Agent",
            description="Test agent description",
            owner_id="test_user",
            tools=[],
            model="gpt-4",
            allowed_imports=["datetime"]
        )
        db.add(test_agent)
        
        # Create test marketplace listing
        test_listing = MarketplaceListing(
            id="test_listing",
            agent_id="test_agent",
            type="rent",
            pricing_model={
                "base_price": 10.0,
                "currency": "USD"
            }
        )
        db.add(test_listing)
        
        db.commit()
        
        yield TestClient(app)
        
    finally:
        # Clean up test data
        db.query(MarketplaceListing).delete()
        db.query(Agent).delete()
        db.query(User).delete()
        db.commit()
        db.close()

def test_agent_lifecycle(client):
    # Create agent
    agent_data = {
        "name": "e2e_test_agent",
        "description": "End-to-end test agent",
        "owner_id": "test_user",
        "tools": [{
            "name": "search",
            "version": "1.0.0",
            "description": "Search the web using DuckDuckGo"
        }],
        "model": "gpt-4",
        "allowed_imports": ["datetime"],
        "agent_metadata": {
            "test": True
        }
    }
    
    # Mock authentication
    client.headers.update({"Authorization": "Bearer test_token"})
    
    create_response = client.post("/api/v1/agents", json=agent_data)
    assert create_response.status_code == 201
    agent_id = create_response.json()["id"]
    
    # Get agent
    get_response = client.get(f"/api/v1/agents/{agent_id}")
    assert get_response.status_code == 200
    assert get_response.json()["name"] == "e2e_test_agent"
    
    # Run agent
    run_response = client.post(f"/api/v1/agents/{agent_id}/run", json={"message": "test task"})
    assert run_response.status_code == 200
    
    # Delete agent
    delete_response = client.delete(f"/api/v1/agents/{agent_id}")
    assert delete_response.status_code == 204

def test_marketplace_operations(client):
    # Create listing
    listing_data = {
        "agent_id": "agent1",
        "type": "rent",
        "pricing_model": {
            "base_price": 10.0,
            "currency": "USD",
            "duration": 24,
            "renewal_policy": "auto",
            "penalties": {
                "late_payment": 5.0
            }
        },
        "terms": {
            "service_level": "standard",
            "uptime_guarantee": 0.99
        }
    }
    
    create_response = client.post("/api/v1/marketplace/listings", json=listing_data)
    assert create_response.status_code == 201
    listing_id = create_response.json()["id"]
    
    # Get listing
    get_response = client.get(f"/api/v1/marketplace/listings/{listing_id}")
    assert get_response.status_code == 200
    assert get_response.json()["details"]["base_price"] == 10.0
    
    # Create rental
    rental_response = client.post(f"/api/v1/marketplace/listings/{listing_id}/rentals", 
                                json={"user_id": "user1"})
    assert rental_response.status_code == 201
    
    # Delete listing
    delete_response = client.delete(f"/api/v1/marketplace/listings/{listing_id}")
    assert delete_response.status_code == 204

def test_gamification_features(client):
    # Create agent first
    agent_data = {
        "name": "gamification_test_agent",
        "description": "Test agent for gamification",
        "tools": ["search"],
        "model": "gpt-4",
        "owner_id": "user1",
        "allowed_imports": ["datetime"]
    }
    create_response = client.post("/api/v1/agents", json=agent_data)
    agent_id = create_response.json()["id"]
    
    # Run agent to generate stats
    client.post(f"/api/v1/agents/{agent_id}/run", json={"task": "test task"})
    
    # Check achievements
    achievements_response = client.get(f"/api/v1/users/user1/achievements")
    assert achievements_response.status_code == 200
    achievements = achievements_response.json()
    assert len(achievements) > 0
    assert any(a["type"] == "first_agent" for a in achievements)
    
    # Get leaderboard
    leaderboard_response = client.get("/api/v1/leaderboard")
    assert leaderboard_response.status_code == 200
    leaderboard = leaderboard_response.json()
    
    # Validate leaderboard structure
    assert "earnings" in leaderboard
    assert "rating" in leaderboard 
    assert "tasks" in leaderboard
    assert "weekly" in leaderboard
    assert "monthly" in leaderboard
    
    # Validate leaderboard entries
    assert len(leaderboard["earnings"]) > 0
    assert len(leaderboard["rating"]) > 0
    assert len(leaderboard["tasks"]) > 0
    assert len(leaderboard["weekly"]) > 0
    assert len(leaderboard["monthly"]) > 0
    
    # Validate achievement triggers
    trigger_response = client.post(f"/api/v1/users/user1/achievements/trigger",
                                 json={"type": "first_agent"})
    assert trigger_response.status_code == 200

def test_tool_operations(client):
    # Register tool with versioning
    tool_data = {
        "name": "test_tool",
        "version": "1.0.0",
        "description": "Test tool for e2e testing",
        "config": {
            "parameters": {
                "param": {
                    "type": "string",
                    "description": "Test parameter"
                }
            }
        },
        "dependencies": {
            "required": ["numpy"],
            "optional": ["pandas"]
        }
    }
    
    # Register initial version
    register_response = client.post("/api/v1/tools", json=tool_data)
    assert register_response.status_code == 201
    tool_id = register_response.json()["id"]
    
    # Register new version
    tool_data["version"] = "2.0.0"
    update_response = client.post(f"/api/v1/tools/{tool_id}/versions", json=tool_data)
    assert update_response.status_code == 201
    
    # Get tool versions
    versions_response = client.get(f"/api/v1/tools/{tool_id}/versions")
    assert versions_response.status_code == 200
    versions = versions_response.json()
    assert len(versions) == 2
    assert any(v["version"] == "1.0.0" for v in versions)
    assert any(v["version"] == "2.0.0" for v in versions)
    
    # Execute tool through agent
    agent_data = {
        "name": "tool_test_agent",
        "description": "Test agent for tool operations",
        "tools": ["test_tool"],
        "model": "gpt-4",
        "owner_id": "user1",
        "allowed_imports": ["datetime"]
    }
    create_response = client.post("/api/v1/agents", json=agent_data)
    agent_id = create_response.json()["id"]
    
    execute_response = client.post(f"/api/v1/agents/{agent_id}/run", 
                                 json={"task": "use test_tool with param=value"})
    assert execute_response.status_code == 200

def test_api_endpoints(client):
    # Test health check
    health_response = client.get("/api/v1/health")
    assert health_response.status_code == 200
    assert health_response.json() == {"status": "ok"}
    
    # Test 404 response
    not_found_response = client.get("/api/v1/nonexistent")
    assert not_found_response.status_code == 404
    
    # Test transactions
    transactions_response = client.get("/api/v1/transactions")
    assert transactions_response.status_code == 200
    
    # Test user progress
    progress_response = client.get("/api/v1/users/user1/progress")
    assert progress_response.status_code == 200
    
    # Test rate limiting
    for _ in range(10):
        client.get("/api/v1/health")
    rate_limit_response = client.get("/api/v1/health")
    assert rate_limit_response.status_code == 429
    
    # Test authentication
    unauthorized_response = client.get("/api/v1/agents")
    assert unauthorized_response.status_code == 401
    
    # Test with valid token
    client.headers.update({"Authorization": "Bearer test_token"})
    authorized_response = client.get("/api/v1/agents")
    assert authorized_response.status_code == 200
    
    # Test with invalid token
    client.headers.update({"Authorization": "Bearer invalid_token"})
    invalid_token_response = client.get("/api/v1/agents")
    assert invalid_token_response.status_code == 403

def test_health_check(client):
    """Test the health check endpoint with detailed service status"""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    
    health_data = response.json()
    assert health_data["status"] == "ok"
    assert "services" in health_data
    assert "database" in health_data["services"]
    assert health_data["services"]["database"] == "connected"
    assert "cache" in health_data["services"]
    assert health_data["services"]["cache"] == "connected"
    assert "message_queue" in health_data["services"]
    assert health_data["services"]["message_queue"] == "connected"
    assert "uptime" in health_data
    assert isinstance(health_data["uptime"], float)
    assert health_data["uptime"] > 0

def test_authentication_system(client):
    """Test the authentication system including token validation and roles"""
    # Test login with valid credentials
    login_response = client.post("/api/v1/auth/login", json={
        "username": "test_user",
        "password": "test_password"
    })
    assert login_response.status_code == 200
    assert "access_token" in login_response.json()
    assert "refresh_token" in login_response.json()
    
    # Test token refresh
    refresh_response = client.post("/api/v1/auth/refresh", json={
        "refresh_token": login_response.json()["refresh_token"]
    })
    assert refresh_response.status_code == 200
    assert "access_token" in refresh_response.json()
    
    # Test role-based access
    client.headers.update({"Authorization": f"Bearer {login_response.json()['access_token']}"})
    
    # Test admin-only endpoint
    admin_response = client.get("/api/v1/admin/users")
    assert admin_response.status_code == 403  # Forbidden for non-admin
    
    # Test token expiration
    expired_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.4Adcj3UFYzPUVaVF43FmMab6RlaQD8A9V8wFzzht-KQ"
    client.headers.update({"Authorization": f"Bearer {expired_token}"})
    expired_response = client.get("/api/v1/agents")
    assert expired_response.status_code == 401
    
    # Test invalid token
    client.headers.update({"Authorization": "Bearer invalid_token"})
    invalid_response = client.get("/api/v1/agents")
    assert invalid_response.status_code == 403
    
    # Test logout
    logout_response = client.post("/api/v1/auth/logout")
    assert logout_response.status_code == 200
    
    # Verify token is invalid after logout
    logged_out_response = client.get("/api/v1/agents")
    assert logged_out_response.status_code == 401

def test_marketplace_transactions(client):
    """Test marketplace transaction system including payments and rentals"""
    # Create test agent
    agent_data = {
        "name": "transaction_test_agent",
        "description": "Test agent for transactions",
        "tools": ["search"],
        "model": "gpt-4",
        "owner_id": "test_user",
        "allowed_imports": ["datetime"]
    }
    create_response = client.post("/api/v1/agents", json=agent_data)
    agent_id = create_response.json()["id"]
    
    # Create marketplace listing
    listing_data = {
        "agent_id": agent_id,
        "type": "rent",
        "pricing_model": {
            "base_price": 10.0,
            "currency": "USD",
            "duration": 24,
            "renewal_policy": "auto",
            "penalties": {
                "late_payment": 5.0
            }
        },
        "terms": {
            "service_level": "standard",
            "uptime_guarantee": 0.99
        }
    }
    listing_response = client.post("/api/v1/marketplace/listings", json=listing_data)
    listing_id = listing_response.json()["id"]
    
    # Create payment method
    payment_method_response = client.post("/api/v1/payments/methods", json={
        "type": "card",
        "details": {
            "number": "4242424242424242",
            "exp_month": 12,
            "exp_year": 2025,
            "cvc": "123"
        }
    })
    assert payment_method_response.status_code == 201
    payment_method_id = payment_method_response.json()["id"]
    
    # Create rental agreement
    rental_response = client.post(f"/api/v1/marketplace/listings/{listing_id}/rentals", json={
        "user_id": "test_user",
        "payment_method_id": payment_method_id,
        "terms_accepted": True
    })
    assert rental_response.status_code == 201
    rental_id = rental_response.json()["id"]
    
    # Verify payment was processed
    payment_response = client.get(f"/api/v1/payments/{rental_id}")
    assert payment_response.status_code == 200
    payment = payment_response.json()
    assert payment["status"] == "succeeded"
    assert payment["amount"] == 10.0
    assert payment["currency"] == "USD"
    
    # Verify rental agreement
    rental_agreement_response = client.get(f"/api/v1/rentals/{rental_id}")
    assert rental_agreement_response.status_code == 200
    agreement = rental_agreement_response.json()
    assert agreement["status"] == "active"
    assert agreement["agent_id"] == agent_id
    assert agreement["user_id"] == "test_user"
    
    # Test rental usage
    usage_response = client.post(f"/api/v1/rentals/{rental_id}/usage", json={
        "action": "run",
        "details": {
            "task": "test task"
        }
    })
    assert usage_response.status_code == 200
    
    # Test rental cancellation
    cancel_response = client.post(f"/api/v1/rentals/{rental_id}/cancel")
    assert cancel_response.status_code == 200
    assert cancel_response.json()["status"] == "cancelled"
    
    # Verify refund was processed
    refund_response = client.get(f"/api/v1/payments/{rental_id}/refund")
    assert refund_response.status_code == 200
    refund = refund_response.json()
    assert refund["status"] == "succeeded"
    assert refund["amount"] == 10.0

def test_gamification_system(client):
    """Test gamification features including achievements and leaderboards"""
    # Create test agent
    agent_data = {
        "name": "gamification_test_agent",
        "description": "Test agent for gamification",
        "tools": ["search"],
        "model": "gpt-4",
        "owner_id": "test_user",
        "allowed_imports": ["datetime"]
    }
    create_response = client.post("/api/v1/agents", json=agent_data)
    agent_id = create_response.json()["id"]
    
    # Run agent to generate stats
    run_response = client.post(f"/api/v1/agents/{agent_id}/run", json={
        "task": "test task"
    })
    assert run_response.status_code == 200
    
    # Check achievements
    achievements_response = client.get(f"/api/v1/users/test_user/achievements")
    assert achievements_response.status_code == 200
    achievements = achievements_response.json()
    assert len(achievements) > 0
    assert any(a["type"] == "first_agent" for a in achievements)
    
    # Verify achievement triggers
    trigger_response = client.post(f"/api/v1/users/test_user/achievements/trigger", json={
        "type": "first_agent"
    })
    assert trigger_response.status_code == 200
    
    # Test leaderboard updates
    leaderboard_response = client.get("/api/v1/leaderboard")
    assert leaderboard_response.status_code == 200
    leaderboard = leaderboard_response.json()
    
    # Validate leaderboard structure
    assert "earnings" in leaderboard
    assert "rating" in leaderboard
    assert "tasks" in leaderboard
    assert "weekly" in leaderboard
    assert "monthly" in leaderboard
    
    # Validate leaderboard entries
    assert len(leaderboard["earnings"]) > 0
    assert len(leaderboard["rating"]) > 0
    assert len(leaderboard["tasks"]) > 0
    assert len(leaderboard["weekly"]) > 0
    assert len(leaderboard["monthly"]) > 0
    
    # Test specific leaderboard category
    earnings_response = client.get("/api/v1/leaderboard/earnings")
    assert earnings_response.status_code == 200
    earnings = earnings_response.json()
    assert len(earnings) > 0
    assert any(e["user_id"] == "test_user" for e in earnings)
    
    # Test achievement progress
    progress_response = client.get(f"/api/v1/users/test_user/progress")
    assert progress_response.status_code == 200
    progress = progress_response.json()
    assert "achievements" in progress
    assert "leaderboard" in progress
    assert "tasks_completed" in progress

def test_agent_framework(client):
    """Test core agent functionality including tool usage and execution"""
    # Create test agent with tools
    agent_data = {
        "name": "framework_test_agent",
        "description": "Test agent for framework functionality",
        "tools": ["search", "calculator"],
        "model": "gpt-4",
        "owner_id": "test_user",
        "allowed_imports": ["datetime", "math"]
    }
    create_response = client.post("/api/v1/agents", json=agent_data)
    agent_id = create_response.json()["id"]
    
    # Test agent initialization
    get_response = client.get(f"/api/v1/agents/{agent_id}")
    assert get_response.status_code == 200
    agent = get_response.json()
    assert agent["name"] == "framework_test_agent"
    assert len(agent["tools"]) == 2
    assert "search" in agent["tools"]
    assert "calculator" in agent["tools"]
    
    # Test tool execution
    execution_response = client.post(f"/api/v1/agents/{agent_id}/run", json={
        "task": "Calculate 2 + 2 using the calculator tool"
    })
    assert execution_response.status_code == 200
    result = execution_response.json()
    assert "result" in result
    assert result["result"] == 4
    
    # Test tool chaining
    chained_response = client.post(f"/api/v1/agents/{agent_id}/run", json={
        "task": "Search for the population of Paris, then calculate what 1% of that population would be"
    })
    assert chained_response.status_code == 200
    chained_result = chained_response.json()
    assert "result" in chained_result
    assert isinstance(chained_result["result"], float)
    
    # Test error handling
    error_response = client.post(f"/api/v1/agents/{agent_id}/run", json={
        "task": "Use a non-existent tool"
    })
    assert error_response.status_code == 400
    error = error_response.json()
    assert "error" in error
    assert "Tool not found" in error["error"]
    
    # Test memory persistence
    memory_response = client.post(f"/api/v1/agents/{agent_id}/run", json={
        "task": "Remember that my favorite color is blue"
    })
    assert memory_response.status_code == 200
    
    recall_response = client.post(f"/api/v1/agents/{agent_id}/run", json={
        "task": "What is my favorite color?"
    })
    assert recall_response.status_code == 200
    recall_result = recall_response.json()
    assert "result" in recall_result
    assert "blue" in recall_result["result"].lower()
    
    # Test agent state management
    state_response = client.get(f"/api/v1/agents/{agent_id}/state")
    assert state_response.status_code == 200
    state = state_response.json()
    assert "memory" in state
    assert "tools" in state
    assert "model" in state

def test_auth_system(client):
    """Test authentication system including registration, login, and token management"""
    # Test user registration
    register_data = {
        "username": "test_user",
        "email": "test@example.com",
        "password": "test_password"
    }
    register_response = client.post("/api/v1/auth/register", json=register_data)
    assert register_response.status_code == 201
    assert "id" in register_response.json()
    
    # Test duplicate registration
    duplicate_response = client.post("/api/v1/auth/register", json=register_data)
    assert duplicate_response.status_code == 400
    
    # Test login with valid credentials
    login_response = client.post("/api/v1/auth/login", json={
        "username": "test_user",
        "password": "test_password"
    })
    assert login_response.status_code == 200
    assert "access_token" in login_response.json()
    assert "refresh_token" in login_response.json()
    
    # Test login with invalid credentials
    invalid_login_response = client.post("/api/v1/auth/login", json={
        "username": "test_user",
        "password": "wrong_password"
    })
    assert invalid_login_response.status_code == 401
    
    # Test token refresh
    refresh_response = client.post("/api/v1/auth/refresh", json={
        "refresh_token": login_response.json()["refresh_token"]
    })
    assert refresh_response.status_code == 200
    assert "access_token" in refresh_response.json()
    
    # Test protected endpoint with valid token
    client.headers.update({"Authorization": f"Bearer {login_response.json()['access_token']}"})
    protected_response = client.get("/api/v1/users/me")
    assert protected_response.status_code == 200
    assert protected_response.json()["username"] == "test_user"
    
    # Test protected endpoint with invalid token
    client.headers.update({"Authorization": "Bearer invalid_token"})
    invalid_token_response = client.get("/api/v1/users/me")
    assert invalid_token_response.status_code == 403
    
    # Test role-based access control
    admin_response = client.get("/api/v1/admin/users")
    assert admin_response.status_code == 403
    
    # Test logout
    logout_response = client.post("/api/v1/auth/logout")
    assert logout_response.status_code == 200
    
    # Verify token is invalid after logout
    logged_out_response = client.get("/api/v1/users/me")
    assert logged_out_response.status_code == 401
    
    # Test password reset flow
    reset_request_response = client.post("/api/v1/auth/reset-password", json={
        "email": "test@example.com"
    })
    assert reset_request_response.status_code == 200
    
    # Test password update with reset token
    reset_token = "test_reset_token"  # Normally this would come from email
    reset_update_response = client.post(f"/api/v1/auth/reset-password/{reset_token}", json={
        "new_password": "new_password"
    })
    assert reset_update_response.status_code == 200
    
    # Verify new password works
    new_login_response = client.post("/api/v1/auth/login", json={
        "username": "test_user",
        "password": "new_password"
    })
    assert new_login_response.status_code == 200

def test_marketplace_system(client):
    """Test marketplace functionality including listings, rentals, and transactions"""
    # Create test agent
    agent_data = {
        "name": "marketplace_test_agent",
        "description": "Test agent for marketplace",
        "tools": ["search"],
        "model": "gpt-4",
        "owner_id": "test_user",
        "allowed_imports": ["datetime"]
    }
    create_response = client.post("/api/v1/agents", json=agent_data)
    agent_id = create_response.json()["id"]
    
    # Create marketplace listing
    listing_data = {
        "agent_id": agent_id,
        "type": "rent",
        "pricing_model": {
            "base_price": 10.0,
            "currency": "USD",
            "duration": 24,
            "renewal_policy": "auto",
            "penalties": {
                "late_payment": 5.0
            }
        },
        "terms": {
            "service_level": "standard",
            "uptime_guarantee": 0.99
        }
    }
    listing_response = client.post("/api/v1/marketplace/listings", json=listing_data)
    assert listing_response.status_code == 201
    listing_id = listing_response.json()["id"]
    
    # Get listing details
    get_listing_response = client.get(f"/api/v1/marketplace/listings/{listing_id}")
    assert get_listing_response.status_code == 200
    listing = get_listing_response.json()
    assert listing["agent_id"] == agent_id
    assert listing["type"] == "rent"
    assert listing["pricing_model"]["base_price"] == 10.0
    
    # Create rental agreement
    rental_data = {
        "user_id": "test_renter",
        "payment_method_id": "test_payment_method",
        "terms_accepted": True
    }
    rental_response = client.post(f"/api/v1/marketplace/listings/{listing_id}/rentals", json=rental_data)
    assert rental_response.status_code == 201
    rental_id = rental_response.json()["id"]
    
    # Verify rental agreement
    get_rental_response = client.get(f"/api/v1/rentals/{rental_id}")
    assert get_rental_response.status_code == 200
    rental = get_rental_response.json()
    assert rental["status"] == "active"
    assert rental["listing_id"] == listing_id
    assert rental["user_id"] == "test_renter"
    
    # Test rental usage
    usage_response = client.post(f"/api/v1/rentals/{rental_id}/usage", json={
        "action": "run",
        "details": {
            "task": "test task"
        }
    })
    assert usage_response.status_code == 200
    
    # Test rental cancellation
    cancel_response = client.post(f"/api/v1/rentals/{rental_id}/cancel")
    assert cancel_response.status_code == 200
    assert cancel_response.json()["status"] == "cancelled"
    
    # Verify transaction history
    transactions_response = client.get(f"/api/v1/rentals/{rental_id}/transactions")
    assert transactions_response.status_code == 200
    transactions = transactions_response.json()
    assert len(transactions) > 0
    assert any(t["type"] == "payment" for t in transactions)
    assert any(t["type"] == "refund" for t in transactions)
    
    # Test listing update
    update_listing_response = client.put(f"/api/v1/marketplace/listings/{listing_id}", json={
        "pricing_model": {
            "base_price": 15.0
        }
    })
    assert update_listing_response.status_code == 200
    updated_listing = update_listing_response.json()
    assert updated_listing["pricing_model"]["base_price"] == 15.0
    
    # Test listing deletion
    delete_listing_response = client.delete(f"/api/v1/marketplace/listings/{listing_id}")
    assert delete_listing_response.status_code == 204
    
    # Verify listing is gone
    get_deleted_response = client.get(f"/api/v1/marketplace/listings/{listing_id}")
    assert get_deleted_response.status_code == 404
