from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .base import Base
from .user import DBUser

SQLALCHEMY_DATABASE_URL = "sqlite:///./agent_platform.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Database:
    def __init__(self):
        self.engine = engine
        self.SessionLocal = SessionLocal
        self.Base = Base

    def get_db(self):
        db = self.SessionLocal()
        try:
            yield db
        finally:
            db.close()

def init_db(database_url=None):
    """Initialize the database by creating all tables
    
    Args:
        database_url: Optional database URL to use instead of default
    """
    if database_url:
        global engine
        engine = create_engine(
            database_url, connect_args={"check_same_thread": False}
        )
        Base.metadata.create_all(bind=engine)
    else:
        Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
