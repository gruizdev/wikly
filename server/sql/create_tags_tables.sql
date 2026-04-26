-- Run this in the Supabase SQL Editor after create_objectives_table.sql.
-- Creates user-defined tags and the objective_tags join table.

create table if not exists tags (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  created_at  timestamptz not null default now()
);

create table if not exists objective_tags (
  objective_id uuid not null references objectives(id) on delete cascade,
  tag_id       uuid not null references tags(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (objective_id, tag_id)
);

create index if not exists tags_user_id_idx on tags (user_id);
create unique index if not exists tags_user_name_unique_idx on tags (user_id, lower(name));
create index if not exists objective_tags_user_id_idx on objective_tags (user_id);
create index if not exists objective_tags_tag_id_idx on objective_tags (tag_id);

alter table tags disable row level security;
alter table objective_tags disable row level security;
