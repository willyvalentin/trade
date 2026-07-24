-- Action 652G: shared, login-specific abuse control. The table stores only
-- keyed bucket names containing a SHA-256 client digest; it never stores a
-- password, session, token, or raw network identity.

create table if not exists public.application_login_abuse_buckets (
  bucket_key text primary key,
  failure_count integer not null check (failure_count >= 0 and failure_count <= 1000),
  window_expires_at timestamptz not null,
  updated_at timestamptz not null default now(),
  constraint application_login_abuse_buckets_key_check
    check (bucket_key = 'global' or bucket_key ~ '^client:[0-9a-f]{64}$')
);

alter table public.application_login_abuse_buckets enable row level security;
revoke all on table public.application_login_abuse_buckets from public, anon, authenticated;
grant all on table public.application_login_abuse_buckets to service_role;

create or replace function public.app_login_abuse_reserve(
  p_client_identity_digest text default null
)
returns table (
  allowed boolean,
  retry_after_seconds integer,
  result_code text
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_global_failures integer := 0;
  v_global_expires_at timestamptz := v_now;
  v_identity_failures integer := 0;
  v_identity_expires_at timestamptz := v_now;
  v_retry_seconds integer := 0;
  v_identity_key text := null;
begin
  if p_client_identity_digest is not null and p_client_identity_digest !~ '^[0-9a-f]{64}$' then
    raise exception 'invalid_login_abuse_identity';
  end if;

  if p_client_identity_digest is not null then
    v_identity_key := 'client:' || p_client_identity_digest;
  end if;

  perform pg_advisory_xact_lock(hashtextextended('ture:login-abuse:global', 0));
  if v_identity_key is not null then
    perform pg_advisory_xact_lock(hashtextextended(v_identity_key, 0));
  end if;

  delete from public.application_login_abuse_buckets
  where ctid in (
    select ctid
    from public.application_login_abuse_buckets
    where window_expires_at < v_now - interval '1 day'
    limit 100
  );

  select failure_count, window_expires_at
  into v_global_failures, v_global_expires_at
  from public.application_login_abuse_buckets
  where bucket_key = 'global'
  for update;

  if not found or v_global_expires_at <= v_now then
    v_global_failures := 0;
    v_global_expires_at := v_now + interval '15 minutes';
  end if;

  if v_identity_key is not null then
    select failure_count, window_expires_at
    into v_identity_failures, v_identity_expires_at
    from public.application_login_abuse_buckets
    where bucket_key = v_identity_key
    for update;

    if not found or v_identity_expires_at <= v_now then
      v_identity_failures := 0;
      v_identity_expires_at := v_now + interval '15 minutes';
    end if;
  end if;

  if v_global_failures >= 100 or v_identity_failures >= 5 then
    v_retry_seconds := greatest(
      1,
      ceil(extract(epoch from greatest(v_global_expires_at, v_identity_expires_at) - v_now))::integer
    );
    return query select false, v_retry_seconds, 'rate_limited'::text;
    return;
  end if;

  insert into public.application_login_abuse_buckets as bucket (
    bucket_key, failure_count, window_expires_at, updated_at
  ) values ('global', v_global_failures + 1, v_global_expires_at, v_now)
  on conflict (bucket_key) do update
  set failure_count = excluded.failure_count,
      window_expires_at = excluded.window_expires_at,
      updated_at = excluded.updated_at;

  if v_identity_key is not null then
    insert into public.application_login_abuse_buckets as bucket (
      bucket_key, failure_count, window_expires_at, updated_at
    ) values (v_identity_key, v_identity_failures + 1, v_identity_expires_at, v_now)
    on conflict (bucket_key) do update
    set failure_count = excluded.failure_count,
        window_expires_at = excluded.window_expires_at,
        updated_at = excluded.updated_at;
  end if;

  return query select true, 0, 'reserved'::text;
end;
$$;

create or replace function public.app_login_abuse_finalize_success(
  p_client_identity_digest text default null
)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_identity_key text := null;
begin
  if p_client_identity_digest is not null and p_client_identity_digest !~ '^[0-9a-f]{64}$' then
    raise exception 'invalid_login_abuse_identity';
  end if;

  if p_client_identity_digest is not null then
    v_identity_key := 'client:' || p_client_identity_digest;
  end if;

  perform pg_advisory_xact_lock(hashtextextended('ture:login-abuse:global', 0));
  if v_identity_key is not null then
    perform pg_advisory_xact_lock(hashtextextended(v_identity_key, 0));
  end if;

  update public.application_login_abuse_buckets
  set failure_count = greatest(failure_count - 1, 0), updated_at = clock_timestamp()
  where bucket_key = 'global';

  if v_identity_key is not null then
    update public.application_login_abuse_buckets
    set failure_count = greatest(failure_count - 1, 0), updated_at = clock_timestamp()
    where bucket_key = v_identity_key;
  end if;

  return true;
end;
$$;

revoke all on function public.app_login_abuse_reserve(text) from public, anon, authenticated;
revoke all on function public.app_login_abuse_finalize_success(text) from public, anon, authenticated;
grant execute on function public.app_login_abuse_reserve(text) to service_role;
grant execute on function public.app_login_abuse_finalize_success(text) to service_role;

comment on table public.application_login_abuse_buckets is
  'Action 652G shared login-abuse buckets. Digest-only client identity and coarse global bucket.';
