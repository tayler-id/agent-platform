"""
Gamification Module

This module defines the gamification elements of the platform including
achievements, badges, and leaderboard tracking.
"""

from dataclasses import dataclass
from enum import Enum
from typing import List, Optional, Dict
from datetime import datetime

class AchievementType(Enum):
    """
    Categories of achievements
    """
    EARNINGS = "earnings"
    TASKS = "tasks"
    RATING = "rating"
    MARKETPLACE = "marketplace"
    INNOVATION = "innovation"

class BadgeRarity(Enum):
    """
    Rarity levels for badges
    """
    COMMON = "common"
    RARE = "rare"
    EPIC = "epic"
    LEGENDARY = "legendary"

@dataclass
class Achievement:
    """
    Represents a specific achievement that can be earned
    
    Attributes:
        id: Unique identifier for the achievement
        name: Display name of the achievement
        description: Detailed description of how to earn it
        type: Category of achievement
        threshold: Value required to earn achievement
        badge: Associated badge awarded
        points: Points awarded for earning
    """
    id: str
    name: str
    description: str
    type: AchievementType
    threshold: float
    badge: str
    points: int

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "type": self.type.value,
            "threshold": self.threshold,
            "badge": self.badge,
            "points": self.points
        }

@dataclass
class Badge:
    """
    Represents a badge that can be displayed on agent profiles
    
    Attributes:
        id: Unique identifier for the badge
        name: Display name of the badge
        description: Description of what the badge represents
        icon: Icon/emoji representing the badge
        rarity: Rarity level of the badge
        achievement_id: ID of associated achievement
    """
    id: str
    name: str
    description: str
    icon: str
    rarity: BadgeRarity
    achievement_id: str

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "icon": self.icon,
            "rarity": self.rarity.value,
            "achievement_id": self.achievement_id
        }

@dataclass
class LeaderboardEntry:
    """
    Represents an entry on a leaderboard
    
    Attributes:
        agent_id: ID of the ranked agent
        score: Numerical score/ranking value
        category: What this ranking is for
        timestamp: When this ranking was recorded
    """
    agent_id: str
    score: float
    category: str
    timestamp: datetime = datetime.now()

    def to_dict(self) -> dict:
        return {
            "agent_id": self.agent_id,
            "score": self.score,
            "category": self.category,
            "timestamp": self.timestamp.isoformat()
        }

@dataclass
class UserProgress:
    """
    Tracks a user's progress in the gamification system
    
    Attributes:
        user_id: ID of the user
        achievements: List of earned achievement IDs
        badges: List of earned badge IDs
        total_points: Cumulative points earned
        level: Current user level
        stats: Additional statistics tracking
    """
    user_id: str
    achievements: List[str]
    badges: List[str]
    total_points: int
    level: int
    stats: Dict[str, float]

    def to_dict(self) -> dict:
        return {
            "user_id": self.user_id,
            "achievements": self.achievements,
            "badges": self.badges,
            "total_points": self.total_points,
            "level": self.level,
            "stats": self.stats
        }

# Pre-defined achievements
ACHIEVEMENTS = {
    # Earnings achievements
    "first_sale": Achievement(
        id="first_sale",
        name="First Sale",
        description="Complete your first agent sale",
        type=AchievementType.EARNINGS,
        threshold=1,
        badge="💰",
        points=100
    ),
    "top_seller": Achievement(
        id="top_seller",
        name="Top Seller",
        description="Earn over $1000 from agent sales",
        type=AchievementType.EARNINGS,
        threshold=1000,
        badge="🏆",
        points=500
    ),
    
    # Task achievements
    "task_master": Achievement(
        id="task_master",
        name="Task Master",
        description="Complete 100 tasks successfully",
        type=AchievementType.TASKS,
        threshold=100,
        badge="⭐",
        points=300
    ),
    
    # Rating achievements
    "five_star": Achievement(
        id="five_star",
        name="Five Star Agent",
        description="Maintain a 5.0 rating for 30 days",
        type=AchievementType.RATING,
        threshold=5.0,
        badge="⭐⭐⭐⭐⭐",
        points=1000
    ),
    
    # Marketplace achievements
    "marketplace_pioneer": Achievement(
        id="marketplace_pioneer",
        name="Marketplace Pioneer",
        description="List an agent on the marketplace",
        type=AchievementType.MARKETPLACE,
        threshold=1,
        badge="🚀",
        points=50
    ),
    
    # Innovation achievements
    "tool_creator": Achievement(
        id="tool_creator",
        name="Tool Creator",
        description="Create a custom tool for your agent",
        type=AchievementType.INNOVATION,
        threshold=1,
        badge="🛠️",
        points=200
    )
}
