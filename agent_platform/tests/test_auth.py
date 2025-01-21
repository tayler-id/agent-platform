import pytest
from fastapi.testclient import TestClient
from agent_platform.main import app
from agent_platform.core.auth import create_access_token
from datetime import timedelta

client = TestClient(app)

@pytest.fixture
def test_user():
    return {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpassword"
    }

def test_create_user(test_user):
    response = client.post(
        "/users/",
        json=test_user
    )
    assert response.status_code == 200
    assert response.json()["username"] == test_user["username"]

def test_login_without_2fa(test_user):
    # Create user first
    client.post("/users/", json=test_user)
    
    # Test login
    response = client.post(
        "/token",
        data={
            "username": test_user["username"],
            "password": test_user["password"]
        }
    )
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_with_2fa(test_user):
    # Create user first
    client.post("/users/", json=test_user)
    
    # Enable 2FA
    secret_response = client.post(
        "/2fa/generate-secret",
        json={"username": test_user["username"]}
    )
    secret = secret_response.json()["secret"]
    
    # Get a valid code
    import pyotp
    totp = pyotp.TOTP(secret)
    code = totp.now()
    
    # Enable 2FA
    enable_response = client.post(
        "/2fa/enable",
        json={
            "username": test_user["username"],
            "code": code
        }
    )
    assert enable_response.status_code == 200
    
    # Test login with 2FA
    login_response = client.post(
        "/token",
        data={
            "username": test_user["username"],
            "password": test_user["password"],
            "totp_code": code
        }
    )
    assert login_response.status_code == 200
    assert "access_token" in login_response.json()

def test_login_with_invalid_2fa(test_user):
    # Create user first
    client.post("/users/", json=test_user)
    
    # Enable 2FA
    secret_response = client.post(
        "/2fa/generate-secret",
        json={"username": test_user["username"]}
    )
    secret = secret_response.json()["secret"]
    
    # Enable 2FA with valid code
    import pyotp
    totp = pyotp.TOTP(secret)
    code = totp.now()
    
    enable_response = client.post(
        "/2fa/enable",
        json={
            "username": test_user["username"],
            "code": code
        }
    )
    assert enable_response.status_code == 200
    
    # Test login with invalid code
    login_response = client.post(
        "/token",
        data={
            "username": test_user["username"],
            "password": test_user["password"],
            "totp_code": "000000"  # Invalid code
        }
    )
    assert login_response.status_code == 401
    assert login_response.json()["detail"] == "Invalid 2FA code"

def test_generate_2fa_secret(test_user):
    # Create user first
    client.post("/users/", json=test_user)
    
    response = client.post(
        "/2fa/generate-secret",
        json={"username": test_user["username"]}
    )
    assert response.status_code == 200
    assert "secret" in response.json()

def test_enable_2fa(test_user):
    # Create user first
    client.post("/users/", json=test_user)
    
    # Get secret
    secret_response = client.post(
        "/2fa/generate-secret",
        json={"username": test_user["username"]}
    )
    secret = secret_response.json()["secret"]
    
    # Get valid code
    import pyotp
    totp = pyotp.TOTP(secret)
    code = totp.now()
    
    # Enable 2FA
    response = client.post(
        "/2fa/enable",
        json={
            "username": test_user["username"],
            "code": code
        }
    )
    assert response.status_code == 200
    assert response.json()["message"] == "2FA enabled successfully"

def test_enable_2fa_invalid_code(test_user):
    # Create user first
    client.post("/users/", json=test_user)
    
    # Get secret
    secret_response = client.post(
        "/2fa/generate-secret",
        json={"username": test_user["username"]}
    )
    secret = secret_response.json()["secret"]
    
    # Try to enable with invalid code
    response = client.post(
        "/2fa/enable",
        json={
            "username": test_user["username"],
            "code": "000000"  # Invalid code
        }
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid 2FA code"
