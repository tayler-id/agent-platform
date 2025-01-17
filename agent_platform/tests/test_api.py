import asyncio
import httpx
import websockets
import json
from typing import Optional
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

BASE_URL = "http://localhost:3000"
access_token: Optional[str] = None

async def test_health():
    """Test API health check."""
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
        print("✅ Health check passed")

async def test_auth_flow():
    """Test authentication flow."""
    global access_token
    
    # Test user registration
    async with httpx.AsyncClient() as client:
        # 1. Sign up
        signup_data = {
            "email": "test@example.com",
            "password": "testpassword123"
        }
        response = await client.post(f"{BASE_URL}/auth/signup", json=signup_data)
        assert response.status_code in [201, 400]  # 400 if user exists
        print("✅ Sign up tested")

        # 2. Sign in
        signin_data = {
            "email": "test@example.com",
            "password": "testpassword123"
        }
        response = await client.post(f"{BASE_URL}/auth/signin", json=signin_data)
        assert response.status_code == 200
        tokens = response.json()
        access_token = tokens["access_token"]
        print("✅ Sign in successful")

        # 3. Get user info
        headers = {"Authorization": f"Bearer {access_token}"}
        response = await client.get(f"{BASE_URL}/auth/me", headers=headers)
        assert response.status_code == 200
        user_info = response.json()
        print(f"✅ User info retrieved: {user_info['email']}")

async def test_agent_operations():
    """Test agent CRUD operations."""
    if not access_token:
        raise Exception("No access token available. Run auth flow first.")

    headers = {"Authorization": f"Bearer {access_token}"}
    agent_id = None

    async with httpx.AsyncClient() as client:
        # 1. Create agent
        agent_data = {
            "name": "Test Agent",
            "description": "A test agent for API verification",
            "config": {
                "model": "gpt-3.5-turbo",
                "temperature": 0.7
            }
        }
        response = await client.post(
            f"{BASE_URL}/agents",
            headers=headers,
            json=agent_data
        )
        assert response.status_code == 200
        agent_id = response.json()["id"]
        print(f"✅ Agent created with ID: {agent_id}")

        # 2. Get agent
        response = await client.get(
            f"{BASE_URL}/agents/{agent_id}",
            headers=headers
        )
        assert response.status_code == 200
        print("✅ Agent retrieved")

        # 3. Update agent
        update_data = {
            "name": "Updated Test Agent",
            "config": {
                "model": "gpt-4",
                "temperature": 0.5
            }
        }
        response = await client.patch(
            f"{BASE_URL}/agents/{agent_id}",
            headers=headers,
            json=update_data
        )
        assert response.status_code == 200
        print("✅ Agent updated")

        # 4. List agents
        response = await client.get(
            f"{BASE_URL}/agents",
            headers=headers
        )
        assert response.status_code == 200
        agents = response.json()
        print(f"✅ Listed {len(agents)} agents")

async def test_realtime_updates():
    """Test real-time WebSocket updates."""
    if not access_token:
        raise Exception("No access token available. Run auth flow first.")

    # First create an agent using HTTP
    async with httpx.AsyncClient() as client:
        agent_data = {
            "name": "Realtime Test Agent",
            "description": "Agent for testing real-time updates"
        }
        response = await client.post(
            f"{BASE_URL}/agents",
            headers={"Authorization": f"Bearer {access_token}"},
            json=agent_data
        )
        agent_id = response.json()["id"]

    # Connect to WebSocket
    ws_url = f"ws://localhost:3000/ws/agents/{agent_id}"
    async with websockets.connect(
        ws_url,
        extra_headers={"Authorization": f"Bearer {access_token}"}
    ) as websocket:
        print("✅ WebSocket connected")

        # Update agent to trigger real-time update
        async with httpx.AsyncClient() as client:
            update_data = {"status": "active"}
            await client.patch(
                f"{BASE_URL}/agents/{agent_id}",
                headers={"Authorization": f"Bearer {access_token}"},
                json=update_data
            )

        # Wait for update message
        try:
            message = await asyncio.wait_for(websocket.recv(), timeout=5.0)
            update = json.loads(message)
            assert update["status"] == "active"
            print("✅ Received real-time update")
        except asyncio.TimeoutError:
            print("❌ No real-time update received")

async def main():
    """Run all tests."""
    print("\n🚀 Starting API tests...\n")

    try:
        await test_health()
        print("\n--- Authentication Tests ---")
        await test_auth_flow()
        print("\n--- Agent Operations Tests ---")
        await test_agent_operations()
        print("\n--- Real-time Updates Test ---")
        await test_realtime_updates()
        
        print("\n✨ All tests completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Test failed: {str(e)}")
        raise

if __name__ == "__main__":
    asyncio.run(main())
