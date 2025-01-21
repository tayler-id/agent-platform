@echo off

:: Set environment variables
set HOST=0.0.0.0
set PORT=8000
set ENVIRONMENT=development
set LOG_LEVEL=info

:: Create virtual environment if it doesn't exist
if not exist ".venv" (
    echo Creating virtual environment...
    python -m venv .venv
)

:: Activate virtual environment
call .venv\Scripts\activate

:: Install dependencies
python -m pip install --upgrade pip
python -m pip install -r agent_platform\requirements.txt

:: Run database migrations
:: TODO: Add migration commands once database is implemented

:: Start the FastAPI server
cd agent_platform
uvicorn main:app --host %HOST% --port %PORT% --reload --log-level %LOG_LEVEL%
