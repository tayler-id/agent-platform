"""
Marketplace Module

This module defines the data structures for the marketplace functionality,
including listings, rentals, and transactions.
"""

from dataclasses import dataclass
from enum import Enum
from typing import Optional, List
from datetime import datetime
from sqlalchemy import (
    Column, String, Float, DateTime, Enum as SQLEnum, ForeignKey, 
    Integer, Boolean, Text
)
from sqlalchemy.orm import relationship
from .base import Base
from .agent import Agent, DBAgent

class ListingType(Enum):
    """
    Types of marketplace listings
    """
    SALE = "sale"
    RENT = "rent"
    SUBSCRIPTION = "subscription"

class RentalDuration(Enum):
    """
    Standard rental duration options
    """
    HOURLY = "hourly"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"

@dataclass
class PricingModel:
    """
    Defines pricing structure for listings
    
    Attributes:
        base_price: Base price for sale/rental
        usage_fee: Optional per-use fee for usage-based pricing
        subscription_fee: Optional recurring fee for subscription model
        duration: Optional rental duration for time-based rentals
    """
    base_price: float
    usage_fee: Optional[float] = None
    subscription_fee: Optional[float] = None
    duration: Optional[RentalDuration] = None

class DBListing(Base):
    """SQLAlchemy model for marketplace listings"""
    __tablename__ = 'listings'
    
    id = Column(String, primary_key=True)
    agent_id = Column(String, ForeignKey('agents.id'))
    seller_id = Column(String, ForeignKey('users.id'))
    type = Column(SQLEnum(ListingType))
    base_price = Column(Float)
    usage_fee = Column(Float, nullable=True)
    subscription_fee = Column(Float, nullable=True)
    duration = Column(SQLEnum(RentalDuration), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="active")
    
    # Relationships
    agent = relationship("DBAgent", back_populates="listings")
    seller = relationship("DBUser", back_populates="listings")
    rentals = relationship("DBRental", back_populates="listing")
    transactions = relationship("DBTransaction", back_populates="listing")

@dataclass
class MarketplaceListing:
    """
    Marketplace listing for an agent
    
    Attributes:
        id: Unique identifier for the listing
        agent_id: ID of the listed agent
        seller_id: ID of the agent's owner
        type: Type of listing (sale/rent/subscription)
        pricing: Pricing model for the listing
        created_at: Timestamp of listing creation
        status: Current status of the listing
    """
    id: str
    agent_id: str
    seller_id: str
    type: ListingType
    pricing: PricingModel
    created_at: datetime = datetime.now()
    status: str = "active"

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "agent_id": self.agent_id,
            "seller_id": self.seller_id,
            "type": self.type.value,
            "pricing": {
                "base_price": self.pricing.base_price,
                "usage_fee": self.pricing.usage_fee,
                "subscription_fee": self.pricing.subscription_fee,
                "duration": self.pricing.duration.value if self.pricing.duration else None
            },
            "created_at": self.created_at.isoformat(),
            "status": self.status
        }

class DBRental(Base):
    """SQLAlchemy model for agent rentals"""
    __tablename__ = 'rentals'
    
    id = Column(String, primary_key=True)
    listing_id = Column(String, ForeignKey('listings.id'))
    renter_id = Column(String, ForeignKey('users.id'))
    start_time = Column(DateTime)
    end_time = Column(DateTime, nullable=True)
    usage_count = Column(Integer, default=0)
    status = Column(String, default="active")
    
    # Relationships
    listing = relationship("DBListing", back_populates="rentals")
    renter = relationship("DBUser", back_populates="rentals")

@dataclass
class Rental:
    """
    Tracks rental of an agent
    
    Attributes:
        id: Unique identifier for the rental
        listing_id: ID of the associated listing
        renter_id: ID of the user renting the agent
        start_time: Start of rental period
        end_time: Optional end of rental period
        usage_count: Number of times agent was used
        status: Current status of the rental
    """
    id: str
    listing_id: str
    renter_id: str
    start_time: datetime
    end_time: Optional[datetime] = None
    usage_count: int = 0
    status: str = "active"

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "listing_id": self.listing_id,
            "renter_id": self.renter_id,
            "start_time": self.start_time.isoformat(),
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "usage_count": self.usage_count,
            "status": self.status
        }

class DBTransaction(Base):
    """SQLAlchemy model for marketplace transactions"""
    __tablename__ = 'transactions'
    
    id = Column(String, primary_key=True)
    listing_id = Column(String, ForeignKey('listings.id'))
    buyer_id = Column(String, ForeignKey('users.id'))
    seller_id = Column(String, ForeignKey('users.id'))
    amount = Column(Float)
    type = Column(SQLEnum(ListingType))
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    listing = relationship("DBListing", back_populates="transactions")
    buyer = relationship("DBUser", foreign_keys=[buyer_id])
    seller = relationship("DBUser", foreign_keys=[seller_id])

@dataclass
class Transaction:
    """
    Records marketplace transactions
    
    Attributes:
        id: Unique identifier for the transaction
        listing_id: ID of the associated listing
        buyer_id: ID of the buyer/renter
        seller_id: ID of the seller
        amount: Transaction amount
        type: Type of transaction
        timestamp: When the transaction occurred
    """
    id: str
    listing_id: str
    buyer_id: str
    seller_id: str
    amount: float
    type: ListingType
    timestamp: datetime = datetime.now()

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "listing_id": self.listing_id,
            "buyer_id": self.buyer_id,
            "seller_id": self.seller_id,
            "amount": self.amount,
            "type": self.type.value,
            "timestamp": self.timestamp.isoformat()
        }
