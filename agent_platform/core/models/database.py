from supabase import create_client, Client
import os
from datetime import datetime
from typing import Optional, Dict, Any

# Initialize Supabase client
supabase: Client = create_client(
    os.getenv('SUPABASE_URL', ''),
    os.getenv('SUPABASE_KEY', '')
)

class Database:
    @staticmethod
    async def create_agent(
        name: str,
        owner_id: str,
        description: Optional[str] = None,
        config: Optional[Dict[str, Any]] = None
    ):
        """Create a new agent in the database."""
        data = {
            'name': name,
            'description': description,
            'config': config,
            'owner_id': owner_id,
            'status': 'inactive',
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        result = supabase.table('agents').insert(data).execute()
        return result.data[0] if result.data else None

    @staticmethod
    async def get_agent(agent_id: str):
        """Retrieve an agent by ID."""
        result = supabase.table('agents').select('*').eq('id', agent_id).execute()
        return result.data[0] if result.data else None

    @staticmethod
    async def update_agent(agent_id: str, data: Dict[str, Any]):
        """Update an agent's information."""
        data['updated_at'] = datetime.utcnow().isoformat()
        result = supabase.table('agents').update(data).eq('id', agent_id).execute()
        return result.data[0] if result.data else None

    @staticmethod
    async def delete_agent(agent_id: str):
        """Delete an agent from the database."""
        result = supabase.table('agents').delete().eq('id', agent_id).execute()
        return result.data[0] if result.data else None

    @staticmethod
    async def list_agents(owner_id: Optional[str] = None):
        """List all agents, optionally filtered by owner."""
        query = supabase.table('agents').select('*')
        if owner_id:
            query = query.eq('owner_id', owner_id)
        result = query.execute()
        return result.data

# SQL for creating the agents table in Supabase:
"""
create table public.agents (
    id uuid default uuid_generate_v4() primary key,
    name varchar(100) not null,
    description text,
    config jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    owner_id uuid not null references auth.users(id),
    status varchar(20) default 'inactive'::character varying
);

-- Set up Row Level Security (RLS)
alter table public.agents enable row level security;

-- Create policies
create policy "Users can create their own agents"
    on public.agents for insert
    with check (auth.uid() = owner_id);

create policy "Users can view their own agents"
    on public.agents for select
    using (auth.uid() = owner_id);

create policy "Users can update their own agents"
    on public.agents for update
    using (auth.uid() = owner_id);

create policy "Users can delete their own agents"
    on public.agents for delete
    using (auth.uid() = owner_id);
"""
