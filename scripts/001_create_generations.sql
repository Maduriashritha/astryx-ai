create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  prompt text not null,
  response text not null,
  model text not null default 'llama-3.3-70b-versatile',
  created_at timestamptz not null default now()
);

create index if not exists generations_created_at_idx on public.generations (created_at desc);

alter table public.generations enable row level security;
