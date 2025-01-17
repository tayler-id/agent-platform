from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

from ..core.auth import AuthService, User, get_current_user

router = APIRouter()

class SignUpRequest(BaseModel):
    email: EmailStr
    password: str

class SignInRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    expires_in: int
    user: User

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class TokenRefreshResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    expires_in: int

class UpdateUserRequest(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    user_metadata: Optional[dict] = None

@router.post("/auth/signup", response_model=User, status_code=status.HTTP_201_CREATED)
async def sign_up(request: SignUpRequest):
    """Register a new user."""
    return await AuthService.sign_up(
        email=request.email,
        password=request.password
    )

@router.post("/auth/signin", response_model=TokenResponse)
async def sign_in(request: SignInRequest):
    """Authenticate user and return tokens."""
    return await AuthService.sign_in(
        email=request.email,
        password=request.password
    )

@router.post("/auth/refresh", response_model=TokenRefreshResponse)
async def refresh_token(request: RefreshTokenRequest):
    """Refresh access token using refresh token."""
    return await AuthService.refresh_token(
        refresh_token=request.refresh_token
    )

@router.post("/auth/signout", status_code=status.HTTP_204_NO_CONTENT)
async def sign_out(current_user: User = Depends(get_current_user)):
    """Sign out current user."""
    await AuthService.sign_out(current_user.id)

@router.post("/auth/reset-password", status_code=status.HTTP_204_NO_CONTENT)
async def reset_password(email: EmailStr):
    """Request password reset email."""
    await AuthService.reset_password(email)

@router.get("/auth/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information."""
    return current_user

@router.patch("/auth/me", response_model=User)
async def update_user_info(
    updates: UpdateUserRequest,
    current_user: User = Depends(get_current_user)
):
    """Update current user information."""
    return await AuthService.update_user(
        user_id=current_user.id,
        updates=updates.dict(exclude_unset=True),
        access_token=current_user.id  # Using user ID as token for this example
    )

# Example usage of protected route
@router.get("/auth/protected-example")
async def protected_route(current_user: User = Depends(get_current_user)):
    """Example of a protected route that requires authentication."""
    return {
        "message": "This is a protected route",
        "user_id": current_user.id,
        "email": current_user.email
    }
