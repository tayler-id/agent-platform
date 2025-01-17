-- Setup script for Supabase project
-- Run this in the Supabase SQL editor to set up your database

-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_crypto";

-- Create agents table
create table public.agents (
    id uuid default uuid_generate_v4() primary key,
    name varchar(100) not null,
    description text,
    config jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    owner_id uuid not null references auth.users(id),
    status varchar(20) default 'inactive'::character varying,
    price numeric(10,2),
    rental_rate numeric(10,2) per hour,
    total_earnings numeric(10,2) default 0,
    rating numeric(3,2),
    review_count integer default 0
);

-- Create agent_reviews table
create table public.agent_reviews (
    id uuid default uuid_generate_v4() primary key,
    agent_id uuid references public.agents(id) on delete cascade,
    reviewer_id uuid references auth.users(id),
    rating integer check (rating >= 1 and rating <= 5),
    review_text text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create agent_transactions table
create table public.agent_transactions (
    id uuid default uuid_generate_v4() primary key,
    agent_id uuid references public.agents(id) on delete cascade,
    buyer_id uuid references auth.users(id),
    seller_id uuid references auth.users(id),
    transaction_type varchar(20) check (transaction_type in ('purchase', 'rental')),
    amount numeric(10,2) not null,
    status varchar(20) default 'pending',
    start_time timestamp with time zone,
    end_time timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user_achievements table
create table public.user_achievements (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id),
    achievement_type varchar(50) not null,
    achievement_data jsonb,
    unlocked_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create leaderboard view
create view public.leaderboard as
select 
    a.owner_id,
    u.email,
    count(distinct a.id) as total_agents,
    sum(a.total_earnings) as total_earnings,
    avg(a.rating) as avg_rating,
    sum(a.review_count) as total_reviews
from public.agents a
join auth.users u on a.owner_id = u.id
group by a.owner_id, u.email
order by total_earnings desc;

-- Set up Row Level Security (RLS)

-- Agents table policies
alter table public.agents enable row level security;

create policy "Users can view all agents"
    on public.agents for select
    using (true);

create policy "Users can create their own agents"
    on public.agents for insert
    with check (auth.uid() = owner_id);

create policy "Users can update their own agents"
    on public.agents for update
    using (auth.uid() = owner_id);

create policy "Users can delete their own agents"
    on public.agents for delete
    using (auth.uid() = owner_id);

-- Reviews table policies
alter table public.agent_reviews enable row level security;

create policy "Users can view all reviews"
    on public.agent_reviews for select
    using (true);

create policy "Users can create reviews"
    on public.agent_reviews for insert
    with check (auth.uid() = reviewer_id);

create policy "Users can update their own reviews"
    on public.agent_reviews for update
    using (auth.uid() = reviewer_id);

create policy "Users can delete their own reviews"
    on public.agent_reviews for delete
    using (auth.uid() = reviewer_id);

-- Transactions table policies
alter table public.agent_transactions enable row level security;

create policy "Users can view their transactions"
    on public.agent_transactions for select
    using (auth.uid() in (buyer_id, seller_id));

create policy "Users can create transactions"
    on public.agent_transactions for insert
    with check (auth.uid() = buyer_id);

-- Achievements table policies
alter table public.user_achievements enable row level security;

create policy "Users can view their achievements"
    on public.user_achievements for select
    using (auth.uid() = user_id);

-- Create functions for gamification

-- Function to update agent rating
create or replace function public.update_agent_rating()
returns trigger as $$
begin
    update public.agents
    set 
        rating = (
            select avg(rating)::numeric(3,2)
            from public.agent_reviews
            where agent_id = new.agent_id
        ),
        review_count = (
            select count(*)
            from public.agent_reviews
            where agent_id = new.agent_id
        ),
        updated_at = now()
    where id = new.agent_id;
    return new;
end;
$$ language plpgsql security definer;

-- Trigger for updating agent rating
create trigger on_review_change
    after insert or update or delete on public.agent_reviews
    for each row execute function public.update_agent_rating();

-- Function to update user achievements
create or replace function public.check_achievements()
returns trigger as $$
declare
    agent_count integer;
    total_earnings numeric;
    review_count integer;
begin
    -- Check number of agents
    select count(*) into agent_count
    from public.agents
    where owner_id = new.owner_id;

    if agent_count >= 5 and not exists (
        select 1 from public.user_achievements
        where user_id = new.owner_id and achievement_type = 'agent_count_5'
    ) then
        insert into public.user_achievements (user_id, achievement_type, achievement_data)
        values (new.owner_id, 'agent_count_5', '{"agents": 5}'::jsonb);
    end if;

    -- Check earnings
    select sum(total_earnings) into total_earnings
    from public.agents
    where owner_id = new.owner_id;

    if total_earnings >= 1000 and not exists (
        select 1 from public.user_achievements
        where user_id = new.owner_id and achievement_type = 'earnings_1000'
    ) then
        insert into public.user_achievements (user_id, achievement_type, achievement_data)
        values (new.owner_id, 'earnings_1000', '{"earnings": 1000}'::jsonb);
    end if;

    return new;
end;
$$ language plpgsql security definer;

-- Trigger for checking achievements
create trigger check_user_achievements
    after insert or update on public.agents
    for each row execute function public.check_achievements();

-- Enable real-time subscriptions for these tables
alter publication supabase_realtime add table public.agents;
alter publication supabase_realtime add table public.agent_reviews;
alter publication supabase_realtime add table public.agent_transactions;
alter publication supabase_realtime add table public.user_achievements;
