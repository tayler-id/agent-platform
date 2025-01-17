#!/bin/bash

# Remove existing virtual environment if it exists
rm -rf venv

# Create new virtual environment
python -m venv venv

# Activate virtual environment
source venv/Scripts/activate

# Upgrade pip
python -m pip install --upgrade pip

# Install package in development mode
pip install -e ..

# Run the FastAPI server
python main.py
