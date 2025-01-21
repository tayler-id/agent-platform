from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.orm import relationship
from .base import Base

class DBUser(Base):
    """Database model for users"""
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    totp_secret = Column(String)
    totp_enabled = Column(Boolean, default=False)
    disabled = Column(Boolean, default=False)
    roles = Column(String)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    agents = relationship("DBAgent", back_populates="owner")

    def enable_2fa(self):
        """Enable 2FA for the user"""
        self.totp_enabled = True

    def disable_2fa(self):
        """Disable 2FA for the user"""
        self.totp_enabled = False
        self.totp_secret = None
