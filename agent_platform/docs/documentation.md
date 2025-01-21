# Agent Platform Documentation

## Table of Contents
1. [Core Concepts](#core-concepts)
2. [Agent Framework](#agent-framework)
3. [Marketplace System](#marketplace-system)
4. [Gamification Features](#gamification-features)
5. [Developer Tools](#developer-tools)
6. [API Reference](#api-reference)
7. [User Guides](#user-guides)
8. [Usage Examples](#usage-examples)

## User Guides

- [Authentication & Security](user_authentication.md)

## Core Concepts

### Agents
- Definition and lifecycle
- State management
- Configuration options
- Statistics tracking

### Tools
- Tool registration system
- Built-in tools
- Custom tool development
- Tool sharing via marketplace

### Models
- Supported model types
- Custom model integration
- Performance optimization

## Agent Framework

### Agent Management
- Creating agents
- Starting/stopping agents
- Agent configuration
- Real-time monitoring

### Smolagents Integration
- CodeAgent implementation
- ToolCallingAgent support
- Sandboxed execution
- Advanced tool integration

## Marketplace System

### Listing Types
- Time-limited rentals
- Usage-based pricing
- Subscription models
- Free agents

### Transaction System
- Secure payment processing
- Escrow system
- Dispute resolution
- Usage tracking

### Search & Discovery
- Full-text search
- Advanced filters
- Rating system
- Recommendation engine

## Gamification Features

### Achievements
- Dynamic challenges
- Progress tracking
- Badge system

### Leaderboards
- Top earning agents
- Most used agents
- Highest rated agents
- Most innovative agents

### Competitions
- Seasonal themes
- Judging criteria
- Prize distribution

## Developer Tools

### Debugging
- Step-through execution
- Real-time monitoring
- Error tracking

### Testing
- Unit testing framework
- Integration testing
- Coverage reports

### Documentation
- Real-time generation
- Version control
- Interactive console

## Frontend Authentication

### 2FA Setup Flow
1. User navigates to Security Settings
2. Clicks "Enable Two-Factor Authentication"
3. Scans QR code with authenticator app
4. Enters verification code
5. Saves backup codes

### Login Flow with 2FA
1. User enters email/password
2. If 2FA enabled, redirect to 2FA page
3. User enters 6-digit code
4. System verifies code and logs in user

### Error Handling
- Invalid code: Show error message
- Expired code: Allow new code generation
- Backup code: Special validation flow

## API Reference

For detailed API documentation including authentication, 2FA, and all endpoints, see the [API Documentation](api_documentation.md).

Key features:
- JWT token authentication
- Two-factor authentication (2FA)
- Rate limiting
- WebSocket API for real-time updates
- Comprehensive endpoint documentation

## Usage Examples

### Basic Agent Creation
```python
from agent_platform import Agent

agent = Agent(
    name="MyAgent",
    description="Example agent",
    tools=["search", "calculator"]
)
agent.start()
```

### Marketplace Listing
```python
from agent_platform import Marketplace

listing = Marketplace.create_listing(
    agent_id="agent123",
    pricing_model="usage",
    rate=0.10
)
```

### Gamification Tracking
```python
from agent_platform import Gamification

stats = Gamification.get_stats(user_id="user123")
print(f"Current rank: {stats['rank']}")
```

### Debugging Session
```bash
agent_platform debug --agent agent123 --step-through
```

### Documentation Generation
```bash
agent_platform docs --watch
```

## Realtime Documentation MCP

The Realtime Documentation MCP automatically:
- Watches for file changes
- Generates documentation
- Formats with Prettier
- Updates via WebSocket

Key Features:
- Markdown formatting
- Type-specific documentation
- Version control integration
- Real-time updates
