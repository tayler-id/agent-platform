# Agent Platform

A platform for sharing, renting, and selling AI agents with built-in gamification features. Built with FastAPI, Supabase, and a brutalist design approach.

## Features

- 🤖 Agent Management
  - Create, update, and delete agents
  - Configure agent parameters and pricing
  - Real-time status updates
  - Usage analytics

- 💰 Marketplace
  - Buy and rent agents
  - Set pricing models (fixed, usage-based, subscription)
  - Secure transactions
  - Reviews and ratings

- 🎮 Gamification
  - Achievement system
  - Leaderboards
    - Top earning agents
    - Most used agents
    - Highest rated developers
  - Developer rankings
  - Progress tracking

- 🔒 Security
  - JWT authentication
  - Row Level Security
  - Rate limiting
  - Input validation

## Getting Started

### Prerequisites

- Python 3.8+
- [Supabase](https://supabase.com) account
- Node.js 14+ (for frontend development)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/agent-platform.git
cd agent-platform
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up Supabase:

   a. Create a new project at [Supabase](https://supabase.com)
   
   b. Get your project URL and anon key from Settings > API
   
   c. Run the setup script:
   ```bash
   python -m agent_platform.scripts.setup_supabase --url YOUR_PROJECT_URL --key YOUR_SERVICE_ROLE_KEY
   ```
   
   Or use the SQL Editor in the Supabase dashboard:
   1. Open SQL Editor
   2. Copy contents of `scripts/setup_supabase.sql`
   3. Execute the script

5. Configure environment:
```bash
cp .env.example .env
```
Update `.env` with your Supabase credentials and other configurations.

6. Start the server:
```bash
uvicorn agent_platform.main:app --reload
```

7. Run tests:
```bash
python -m agent_platform.tests.test_api
```

### API Documentation

Once the server is running, visit:
- http://localhost:3000/docs - Swagger UI
- http://localhost:3000/redoc - ReDoc

## Database Structure

### Tables

- `agents` - Store agent information and configurations
- `agent_reviews` - User reviews and ratings
- `agent_transactions` - Purchase and rental records
- `user_achievements` - Gamification achievements

### Real-time Features

Supabase provides real-time updates for:
- Agent status changes
- New reviews
- Achievement unlocks
- Transaction updates

### Row Level Security

Policies ensure:
- Users can only modify their own agents
- Anyone can view published agents
- Users can only review agents they've used
- Transaction history is private

## Development

### Architecture

```
agent_platform/
├── core/
│   ├── models/      # Database models
│   ├── tools/       # Agent tools
│   └── utils/       # Utilities
├── routes/          # API endpoints
├── scripts/         # Setup and maintenance
└── tests/           # Test suites
```

### Adding Features

1. Database Changes:
   - Add tables/columns in `scripts/setup_supabase.sql`
   - Update RLS policies as needed
   - Run setup script or execute SQL manually

2. API Endpoints:
   - Add routes in `routes/`
   - Update models in `core/models/`
   - Add tests in `tests/`

3. Frontend:
   - Update HTML/CSS in brutalist style
   - Add real-time subscriptions where needed
   - Implement new UI components

## Gamification

### Achievements

- Agent Creation Milestones
  - Create 5 agents
  - Create 10 agents
  - Create 25 agents

- Earnings Milestones
  - Earn $1,000
  - Earn $10,000
  - Earn $100,000

- Rating Milestones
  - Get 100 reviews
  - Maintain 4.5+ rating
  - Top 10 rated developer

### Leaderboards

- Global Rankings
  - Total earnings
  - Number of agents
  - Average rating
  - Total reviews

- Monthly Rankings
  - Top earners
  - Most active developers
  - Rising stars

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Support

- Documentation: [/docs](http://localhost:3000/docs)
- Issues: GitHub Issues
- Community: Discord Server (coming soon)

## License

MIT License - see LICENSE file for details
