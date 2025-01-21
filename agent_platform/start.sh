#!/bin/bash

echo "Starting Agent Platform..."
echo "Creating logs directory..."
mkdir -p logs

# Check for existing virtual environment
if [ ! -d "venv" ]; then
    echo "Creating new virtual environment..."
    python -m venv venv
    source venv/Scripts/activate
    echo "Upgrading pip..."
    python -m pip install --upgrade pip
    echo "Installing dependencies..."
    pip install -e ..
    pip install -r requirements.txt
else
    echo "Using existing virtual environment..."
    source venv/Scripts/activate
fi

# Run the FastAPI server
echo "Starting FastAPI server..."
python main.py

echo "Server started at http://localhost:8000"
