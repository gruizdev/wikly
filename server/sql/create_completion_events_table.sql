-- Run this in the Supabase SQL Editor after create_objectives_table.sql
-- Creates the completion_events table and backfills data from the legacy
-- completed_dates array on the objectives table.

create table if not exists completion_events (
  id            uuid primary key default gen_random_uuid(),
  objective_id  uuid not null references objectives(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  completed_on  date not null,
  -- Prevents duplicate completions for the same objective on the same day
  constraint completion_events_unique unique (objective_id, completed_on)
);

create index if not exists completion_events_objective_id_idx on completion_events (objective_id);
create index if not exists completion_events_user_id_idx on completion_events (user_id);
create index if not exists completion_events_completed_on_idx on completion_events (completed_on);

-- Backfill existing completions from the legacy completed_dates array.
-- unnest() expands each array element into its own row.
-- ON CONFLICT DO NOTHING makes the migration idempotent (safe to re-run).
insert into completion_events (objective_id, user_id, completed_on)
select
  id          as objective_id,
  user_id,
  unnest(completed_dates)::date as completed_on
from objectives
where array_length(completed_dates, 1) > 0
on conflict do nothing;
