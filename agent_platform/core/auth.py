from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from pydantic import BaseModel
import os
import bcrypt
import pyotp
from databases import Database

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "test-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
TOTP_ISSUER = "AgentPlatform"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class User(BaseModel):
    id: str
    username: str
    email: str
    hashed_password: str
    totp_secret: Optional[str] = None
    totp_enabled: bool = False
    disabled: bool = False
    roles: list[str] = []

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class TokenData(BaseModel):
    username: str
    totp_code: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

# Database instance (assuming it's initialized elsewhere)
database = Database("sqlite:///agent_platform.db")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def create_totp_secret() -> str:
    return pyotp.random_base32()

def verify_totp(secret: str, code: str) -> bool:
    totp = pyotp.TOTP(secret)
    return totp.verify(code)

async def create_user(user: UserCreate):
    hashed_password = get_password_hash(user.password)
    totp_secret = create_totp_secret()
    
    query = """
        INSERT INTO users (username, email, hashed_password, totp_secret)
        VALUES (:username, :email, :hashed_password, :totp_secret)
    """
    values = {
        "username": user.username,
        "email": user.email,
        "hashed_password": hashed_password,
        "totp_secret": totp_secret
    }
    
    await database.execute(query=query, values=values)

async def authenticate_user(username: str, password: str):
    query = "SELECT * FROM users WHERE username = :username"
    user = await database.fetch_one(query=query, values={"username": username})
    
    if not user:
        return False
    if not verify_password(password, user["hashed_password"]):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    
    query = "SELECT * FROM users WHERE username = :username"
    user = await database.fetch_one(query=query, values={"username": token_data.username})
    
    if user is None:
        raise credentials_exception
    return User(**user)

async def generate_2fa_secret(username: str):
    user = await database.fetch_one(
        query="SELECT * FROM users WHERE username = :username",
        values={"username": username}
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"secret": user["totp_secret"]}

async def enable_2fa(username: str, code: str):
    user = await database.fetch_one(
        query="SELECT * FROM users WHERE username = :username",
        values={"username": username}
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if not verify_totp(user["totp_secret"], code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid 2FA code"
        )
    
    await database.execute(
        query="UPDATE users SET totp_enabled = 1 WHERE username = :username",
        values={"username": username}
    )
    return {"message": "2FA enabled successfully"}

async def login_for_access_token(form_data: OAuth2PasswordRequestForm):
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # If 2FA is enabled, require TOTP code
    if user["totp_enabled"]:
        if not form_data.totp_code or not verify_totp(user["totp_secret"], form_data.totp_code):
            return {
                "requires2FA": True,
                "user": {
                    "id": user["id"],
                    "username": user["username"],
                    "email": user["email"]
                }
            }
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")
