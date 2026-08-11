-- NON-PRODUCTION ONLY. Requires two distinct, pre-created local/staging Auth
-- users. This transaction temporarily grants SELECT and always rolls back.
-- Expected for both result rows: visible_own_rows = 1, visible_other_rows = 0.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '30s';

create temporary table ma05_test_principals (
  principal_name text primary key,
  owner_user_id uuid unique not null
) on commit drop;

insert into ma05_test_principals (principal_name, owner_user_id) values
  ('owner_a', 'REPLACE_WITH_STAGING_OWNER_A_AUTH_UUID'::uuid),
  ('owner_b', 'REPLACE_WITH_STAGING_OWNER_B_AUTH_UUID'::uuid);

do $$
begin
  if (select count(*) from ma05_test_principals) <> 2
    or (select count(*) from auth.users
        where id in (select owner_user_id from ma05_test_principals)) <> 2
  then
    raise exception 'ma05_two_distinct_staging_auth_users_required';
  end if;
end;
$$;

insert into public.recommendation_scan_runs (
  id,
  run_fingerprint,
  owner_user_id,
  "window",
  status
) values
  (
    'ma05-two-principal-owner-a',
    'ma05-two-principal-owner-a',
    (select owner_user_id from ma05_test_principals where principal_name = 'owner_a'),
    'test',
    'test'
  ),
  (
    'ma05-two-principal-owner-b',
    'ma05-two-principal-owner-b',
    (select owner_user_id from ma05_test_principals where principal_name = 'owner_b'),
    'test',
    'test'
  );

grant select on table public.recommendation_scan_runs to authenticated;

select set_config(
  'ma05.owner_a',
  (select owner_user_id::text from ma05_test_principals where principal_name = 'owner_a'),
  true
);
select set_config(
  'ma05.owner_b',
  (select owner_user_id::text from ma05_test_principals where principal_name = 'owner_b'),
  true
);

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  current_setting('ma05.owner_a'),
  true
);
select
  'owner_a' as principal,
  count(*) filter (where id = 'ma05-two-principal-owner-a') as visible_own_rows,
  count(*) filter (where id = 'ma05-two-principal-owner-b') as visible_other_rows
from public.recommendation_scan_runs
where id like 'ma05-two-principal-%';

reset role;
set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  current_setting('ma05.owner_b'),
  true
);
select
  'owner_b' as principal,
  count(*) filter (where id = 'ma05-two-principal-owner-b') as visible_own_rows,
  count(*) filter (where id = 'ma05-two-principal-owner-a') as visible_other_rows
from public.recommendation_scan_runs
where id like 'ma05-two-principal-%';

reset role;
rollback;
