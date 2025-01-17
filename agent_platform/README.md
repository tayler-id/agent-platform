# Agent Platform

A platform for sharing, renting, and selling AI agents with gamification features.

## Features

- Agent marketplace
- Agent execution environment
- Gamification system (leaderboards, achievements)
- Developer tools for agent creation
- Brutalism-style UI design

## Installation

1. Clone the repository
2. Create and activate virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```
5. Run the platform:
   ```bash
   ./start.sh
   ```

## API Documentation

The API is available at `http://localhost:8000/docs` when running locally.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
