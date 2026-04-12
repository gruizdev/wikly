-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- to create the objectives table.

create table if not exists objectives (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  title         text not null,
  icon          text,
  frequency     text not null check (frequency in ('daily', 'weekly', 'monthly', 'yearly')),
  color         text not null check (color in ('purple', 'pink', 'blue', 'green', 'orange', 'yellow')),
  completed_dates text[] not null default '{}',
  position      integer not null default 0,
  created_at    timestamptz not null default now()
);

-- Index to speed up per-user queries
create index if not exists objectives_user_id_idx on objectives (user_id);

-- Disable Row Level Security — the Express server enforces auth via JWTs.
-- The service role key used by the server bypasses RLS regardless, but
-- disabling it makes the intent explicit.
alter table objectives disable row level security;
