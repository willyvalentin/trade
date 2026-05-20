alter table public.positions
add column if not exists execution_metadata jsonb;
