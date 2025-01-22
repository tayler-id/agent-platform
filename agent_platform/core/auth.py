from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from typing import Optional
import os
from supabase import create_client, Client
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["auth"])

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

class User(BaseModel):
    id: str
    email: str
    role: str
    metadata: dict

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    metadata: Optional[dict] = None

class ResetPasswordRequest(BaseModel):
    email: str

class TwoFASecretResponse(BaseModel):
    secret: str
    uri: str

class Enable2FARequest(BaseModel):
    totp_secret: str
    code: str

@router.post("/login")
async def login(credentials: LoginRequest):
    try:
        response = supabase.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password
        })
        return {
            "user": response.user,
            "session": response.session
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )

@router.post("/register")
async def register(credentials: RegisterRequest):
    try:
        response = supabase.auth.sign_up({
            "email": credentials.email,
            "password": credentials.password,
            "options": {
                "data": credentials.metadata or {}
            }
        })
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/logout")
async def logout(token: str = Depends(oauth2_scheme)):
    try:
        supabase.auth.sign_out()
        return {"message": "Logged out successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/session")
async def get_session(token: str = Depends(oauth2_scheme)):
    try:
        response = supabase.auth.get_user(token)
        return {
            "user": response.user,
            "session": {
                "access_token": token,
                "expires_at": datetime.now().timestamp() + 3600
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )

@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    try:
        response = supabase.auth.reset_password_for_email(request.email)
        return {"message": "Password reset email sent"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/2fa/secret")
async def generate_2fa_secret(token: str = Depends(oauth2_scheme)):
    try:
        response = supabase.rpc('generate_2fa_secret').execute()
        return TwoFASecretResponse(
            secret=response.data.get('secret'),
            uri=response.data.get('uri')
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/2fa/enable")
async def enable_2fa(request: Enable2FARequest, token: str = Depends(oauth2_scheme)):
    try:
        response = supabase.rpc('enable_2fa', {
            "totp_secret": request.totp_secret,
            "code": request.code
        }).execute()
        return {"message": "2FA enabled successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Verify and decode the Supabase JWT
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated"
        )
        
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
            
        # Get user from Supabase
        user = supabase.auth.get_user(token)
        if not user:
            raise credentials_exception
            
        return User(
            id=user_id,
            email=payload.get("email"),
            role=payload.get("role"),
            metadata=payload.get("user_metadata", {})
        )
        
    except JWTError:
        raise credentials_exception
