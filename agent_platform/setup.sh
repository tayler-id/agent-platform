#!/bin/bash

# Change to agent_platform directory
cd "$(dirname "$0")" || exit

# Install Python dependencies
echo "Installing Python dependencies..."
pip install torch==2.0.1+cpu -f https://download.pytorch.org/whl/torch_stable.html
pip install -r requirements.txt || {
    echo "Failed to install dependencies"
    exit 1
}

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        echo "Creating .env file..."
        cp .env.example .env
        echo "Please update the .env file with your configuration"
    else
        echo "Warning: .env.example not found, creating empty .env"
        touch .env
    fi
fi

# Initialize database
echo "Setting up database..."
python -c "from core.models.database import init_db; init_db()" || {
    echo "Failed to initialize database"
    exit 1
}

# Generate API documentation if realtime_docs is installed
if python -c "import realtime_docs" &>/dev/null; then
    echo "Generating API documentation..."
    python -m realtime_docs generate || {
        echo "Warning: Failed to generate documentation"
    }
else
    echo "Skipping API documentation (realtime_docs not installed)"
fi

echo "Setup complete!"
echo "To start the server, run: python main.py"
