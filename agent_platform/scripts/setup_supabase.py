#!/usr/bin/env python3
import os
import sys
from pathlib import Path
from supabase import create_client, Client
from dotenv import load_dotenv
import argparse
import time

def load_sql_script():
    """Load the SQL setup script."""
    script_dir = Path(__file__).parent
    sql_path = script_dir / 'setup_supabase.sql'
    
    if not sql_path.exists():
        print("❌ SQL setup script not found!")
        sys.exit(1)
        
    return sql_path.read_text()

def split_sql_commands(sql_script: str) -> list:
    """Split SQL script into individual commands."""
    # Basic splitting on semicolons, preserving function definitions
    commands = []
    current_command = []
    in_function = False
    
    for line in sql_script.split('\n'):
        stripped = line.strip()
        
        # Skip comments and empty lines
        if not stripped or stripped.startswith('--'):
            continue
            
        if stripped.startswith('create function') or stripped.startswith('create or replace function'):
            in_function = True
            
        current_command.append(line)
        
        if in_function:
            if stripped.endswith('language plpgsql;'):
                commands.append('\n'.join(current_command))
                current_command = []
                in_function = False
        elif stripped.endswith(';'):
            commands.append('\n'.join(current_command))
            current_command = []
            
    return commands

def setup_supabase(url: str, key: str, debug: bool = False):
    """Set up Supabase project with required tables and policies."""
    try:
        # Initialize Supabase client
        supabase: Client = create_client(url, key)
        
        # Load and split SQL commands
        sql_script = load_sql_script()
        commands = split_sql_commands(sql_script)
        
        print("\n🚀 Starting Supabase setup...\n")
        
        # Execute each command
        for i, command in enumerate(commands, 1):
            if debug:
                print(f"\nExecuting command {i}/{len(commands)}:")
                print(command)
                print("-" * 50)
            
            try:
                # Execute the command
                supabase.table('dummy').select('*').execute()  # Verify connection
                result = supabase.rpc('exec_sql', {'sql': command}).execute()
                
                if debug:
                    print(f"✅ Command {i} executed successfully")
                else:
                    print(f"✅ Progress: {i}/{len(commands)} commands executed")
                    
                # Small delay to prevent rate limiting
                time.sleep(0.5)
                
            except Exception as e:
                print(f"\n❌ Error executing command {i}:")
                print(f"Error: {str(e)}")
                print("\nCommand was:")
                print(command)
                
                if not debug:
                    print("\nRun with --debug for more detailed output")
                    
                if input("\nContinue? (y/n): ").lower() != 'y':
                    sys.exit(1)
        
        print("\n✨ Supabase setup completed successfully!")
        print("\nNext steps:")
        print("1. Update your .env file with your Supabase credentials")
        print("2. Start the API server: uvicorn agent_platform.main:app --reload")
        print("3. Run the tests: python -m agent_platform.tests.test_api")
        
    except Exception as e:
        print(f"\n❌ Setup failed: {str(e)}")
        if not debug:
            print("Run with --debug for more detailed output")
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description='Set up Supabase project for Agent Platform')
    parser.add_argument('--url', help='Supabase project URL')
    parser.add_argument('--key', help='Supabase service role key')
    parser.add_argument('--debug', action='store_true', help='Enable debug output')
    parser.add_argument('--env-file', help='Path to .env file')
    
    args = parser.parse_args()
    
    # Try to load from .env file if specified
    if args.env_file:
        load_dotenv(args.env_file)
    else:
        load_dotenv()
    
    # Get credentials from arguments or environment
    url = args.url or os.getenv('SUPABASE_URL')
    key = args.key or os.getenv('SUPABASE_KEY')
    
    if not url or not key:
        print("❌ Supabase credentials not found!")
        print("\nPlease provide credentials either:")
        print("1. As command line arguments: --url and --key")
        print("2. In a .env file specified with --env-file")
        print("3. In the default .env file in the project root")
        sys.exit(1)
    
    setup_supabase(url, key, args.debug)

if __name__ == '__main__':
    main()
