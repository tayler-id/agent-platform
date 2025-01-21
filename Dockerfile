# Use official Python image
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Install Node.js and Chrome for browser testing
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && curl -fsSL https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb -o chrome.deb \
    && apt-get install -y ./chrome.deb \
    && rm chrome.deb

# Set working directory
WORKDIR /app

# Copy requirements first to leverage Docker layer caching
COPY agent_platform/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install pytest for testing
RUN pip install pytest

# Copy application code
COPY . .

# Expose ports
EXPOSE 8000
EXPOSE 9222

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV DISPLAY=:99

# Install ChromeDriver
RUN npm install -g chromedriver

# Start Xvfb and Chrome
RUN apt-get install -y xvfb
RUN Xvfb :99 -screen 0 1920x1080x24 &

# Start command
CMD ["python", "agent_platform/main.py"]
