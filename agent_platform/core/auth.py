from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import jwt
from .models.database import supabase

security = HTTPBearer()

class User(BaseModel):
    id: str
    email: str
    created_at: datetime
    last_sign_in: Optional[datetime]
    user_metadata: Optional[dict]

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    """Validate JWT token and return current user."""
    try:
        # Verify the JWT token using Supabase
        user = supabase.auth.get_user(credentials.credentials)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token"
            )

        return User(
            id=user.id,
            email=user.email,
            created_at=user.created_at,
            last_sign_in=user.last_sign_in_at,
            user_metadata=user.user_metadata
        )

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )

class AuthService:
    """Service for handling authentication operations."""
    
    @staticmethod
    async def sign_up(email: str, password: str) -> User:
        """Register a new user."""
        try:
            auth_response = supabase.auth.sign_up({
                "email": email,
                "password": password
            })
            
            return User(
                id=auth_response.user.id,
                email=auth_response.user.email,
                created_at=auth_response.user.created_at,
                last_sign_in=None,
                user_metadata=auth_response.user.user_metadata
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )

    @staticmethod
    async def sign_in(email: str, password: str) -> dict:
        """Authenticate a user and return tokens."""
        try:
            auth_response = supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            
            return {
                "access_token": auth_response.session.access_token,
                "refresh_token": auth_response.session.refresh_token,
                "token_type": "bearer",
                "expires_in": auth_response.session.expires_in,
                "user": User(
                    id=auth_response.user.id,
                    email=auth_response.user.email,
                    created_at=auth_response.user.created_at,
                    last_sign_in=auth_response.user.last_sign_in_at,
                    user_metadata=auth_response.user.user_metadata
                )
            }
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=str(e)
            )

    @staticmethod
    async def refresh_token(refresh_token: str) -> dict:
        """Refresh access token using refresh token."""
        try:
            auth_response = supabase.auth.refresh_session(refresh_token)
            
            return {
                "access_token": auth_response.session.access_token,
                "refresh_token": auth_response.session.refresh_token,
                "token_type": "bearer",
                "expires_in": auth_response.session.expires_in
            }
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=str(e)
            )

    @staticmethod
    async def sign_out(access_token: str):
        """Sign out a user."""
        try:
            supabase.auth.sign_out(access_token)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )

    @staticmethod
    async def reset_password(email: str):
        """Send password reset email."""
        try:
            supabase.auth.reset_password_email(email)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )

    @staticmethod
    async def update_user(
        user_id: str,
        updates: dict,
        access_token: str
    ) -> User:
        """Update user information."""
        try:
            user = supabase.auth.update_user(
                access_token,
                updates
            )
            
            return User(
                id=user.id,
                email=user.email,
                created_at=user.created_at,
                last_sign_in=user.last_sign_in_at,
                user_metadata=user.user_metadata
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
