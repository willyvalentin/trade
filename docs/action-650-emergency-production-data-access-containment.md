# Action 650: Emergency Production Data-Access Containment

## Purpose

Production catalog evidence established that direct anonymous Supabase REST access
can reach core trading data. The application login cookie does not govern those
direct requests. Action 650 provides a forward-only, server-only containment
boundary; it does not establish a user ownership model.

## Inventory and target boundary

| Table group | Current browser dependency | Target after Action 650 | Follow-up |
| --- | --- | --- | --- |
| Recommendations, positions, position updates, settings | Trade App reads and writes directly through the public Supabase client | `PUBLIC`, `anon`, and `authenticated` denied; service role only | Action 651 must move UI reads/writes behind authenticated server routes or ownership-scoped policies. |
| Scanner/calendar/regime caches and symbol metadata | Browser code and server utilities read caches; server utilities write them | Service role only | Move browser presentation data to a bounded server read model. |
| Scan runs, attempts, batches, snapshots, outcomes | Trade App directly reads observability/history; automation/evaluator writes server-side | Service role only | Replace browser history reads with server-owned APIs. |
| Execution records, execution agent/lifecycle/progress events, audit events | No approved browser writer; audit adapter is server-role | Service role only, with append-only triggers for event/audit tables | Action 651 defines any ownership-scoped viewing model. |

### Per-table containment matrix

The reported anonymous count-only evidence confirms direct `SELECT` visibility
for every named core table except the four execution-foundation tables, whose
legacy schema and absent ownership boundary require the same conservative
treatment. The exact pre-apply catalog matrix is an approval checkpoint, not a
reason to defer containment.

| Table | Sensitivity | Current direct-browser dependency | Target | Migration action | Action 651 follow-up |
| --- | --- | --- | --- | --- | --- |
| `recommendations` | trading recommendations | read and status update | server-only | revoke, RLS, remove policies | server read/update route |
| `positions` | positions and trade metadata | read/insert/update | server-only | revoke, RLS, remove policies | owned trade route |
| `position_updates` | trade commentary/history | read/write | server-only | revoke, RLS, remove policies | owned history route |
| `user_settings` | portfolio/risk settings | read/write | server-only | revoke, RLS, remove policies | authenticated settings boundary |
| `scanner_cache` | market/cache payloads | legacy utility read/write | server-only | revoke, RLS, remove policies | bounded cache API |
| `market_calendar_cache` | calendar/provider metadata | server/cache utility | server-only | revoke, RLS, remove policies | bounded calendar API |
| `market_regime_snapshots` | market analytics | Trade App read | server-only | revoke, RLS, remove policies | bounded read model |
| `recommendation_batches` | publication history | Trade App read | server-only | revoke, RLS, remove policies | bounded history API |
| `recommendation_outcomes` | evaluation/calibration data | Trade App read, evaluator write | server-only | revoke, RLS, remove policies | diagnostics API |
| `recommendation_scan_runs` | pipeline diagnostics | Trade App read, automation write | server-only | revoke, RLS, remove policies | diagnostics API |
| `recommendation_snapshots` | recommendation evidence | Trade App read/write, evaluator write | server-only | revoke, RLS, remove policies | server persistence/read API |
| `scheduled_scan_runs` | schedule history | Trade App/settings read, scheduler write | server-only | revoke, RLS, remove policies | schedule history API |
| `scheduled_scan_attempts` | schedule attempts | Trade App read, scheduler write | server-only | revoke, RLS, remove policies | schedule diagnostics API |
| `symbol_metadata` | provider cache | server role utility | server-only | revoke, RLS, remove policies | bounded symbols API |
| `execution_records` | execution/account evidence | no approved client writer | server-only | revoke, RLS, remove policies | reviewed ownership model |
| `execution_agent_runs` | execution diagnostics | no approved client caller | server-only | revoke, RLS, remove policies | reviewed diagnostics model |
| `execution_agent_progress_events` | execution progress evidence | no approved client caller | server-only append-only | revoke, RLS, remove policies, trigger | reviewed diagnostics model |
| `execution_lifecycle_events` | execution audit evidence | no approved client caller | server-only append-only | revoke, RLS, remove policies, trigger | reviewed diagnostics model |
| `execution_record_audit_events` | execution audit evidence | server-role audit writer | server-only append-only | revoke, RLS, remove policies, trigger | reviewed audit read model |

The migration applies the same baseline to all 19 identified tables:

1. revoke all table privileges from `PUBLIC`, `anon`, and `authenticated`;
2. grant required access only to `service_role`;
3. enable RLS;
4. remove every existing table policy rather than retaining legacy permissive
   policies;
5. prevent `UPDATE` and `DELETE` on execution audit/lifecycle/progress tables
   with a structural trigger.

No anonymous or authenticated policy is introduced because the existing tables
do not carry a proven, consistently populated ownership identity. Inventing an
`auth.uid()` predicate would be unsafe. This means direct browser Supabase calls
will be denied after rollout by design.

## Effective access matrix

Before rollout, production catalog inspection must capture (without row data):

- table owner, `relrowsecurity`, and `relforcerowsecurity`;
- grants for `PUBLIC`, `anon`, `authenticated`, and `service_role`;
- all policies with command and expressions;
- role behavior for select/insert/update/delete.

`scripts/action-650-production-catalog-readonly.sql` is the exact catalog-only
matrix query for the first four items. It deliberately returns no table rows or
counts. Role behavior must be proven separately in the approved maintenance
window using a disposable verification identity; it is not attempted by this
Action.

After the migration, every listed table must have RLS enabled; `PUBLIC`, `anon`,
and `authenticated` must have no table privileges and no policies; `service_role`
must retain required server/scheduled access. The migration deliberately does not
force RLS because the reviewed Supabase service-role operational model bypasses
RLS. A later ownership design may choose `FORCE RLS` with explicit server policies.

## Caller analysis

Server/service-role callers already cover scheduled scan persistence, scheduled
outcome evaluation, recommendation generation/evaluation, symbol metadata, and
execution-record audit writes. These are expected to keep working.

Immediate UI impact is expected and must be explicitly accepted before apply:

- Trade App refresh reads recommendations, positions, settings, scans, batches,
  snapshots, outcomes, and regime data through `lib/supabase.ts`.
- Trade App also writes recommendation status, positions, and snapshots directly.
- Settings reads/writes settings and scan history directly.
- Several legacy cache utilities import the public client; server callers must
  move to `getServerSupabaseClient()` before those code paths are relied on after
  containment.

Therefore production rollout requires a maintenance/feature containment window
or Action 651 server-boundary delivery first. No anonymous mutation is retained
for compatibility.

## Local role-behavior test

`scripts/action-650-local-db-security-test.mjs` starts an isolated local
PostgreSQL container and applies only the subset of migrations that owns these
tables plus Action 650. It proves effective `anon`, `authenticated`, `PUBLIC`,
and `service_role` privileges, RLS state, and append-only behavior. It excludes
the three prohibited local-only migrations and never contacts Supabase or
production.

Run only with local Docker access:

```sh
node scripts/action-650-local-db-security-test.mjs
```

## Production rollout and containment plan

1. Obtain separate approval for production database mutation and UI containment.
2. Capture a read-only catalog/grant/policy matrix and no-body role checks.
3. Put direct-browser trading/settings/history surfaces into a planned
   maintenance state, or deploy the Action 651 server boundary first.
4. Apply only `20260724002000_contain_production_trading_data_access.sql` through
   the approved migration path. Never use `supabase db push --include-all`.
5. Verify each contained table denies anon/authenticated select/insert/update/
   delete, while required service-role scheduled and evaluator operations remain
   healthy.
6. Verify audit/lifecycle/progress rows reject updates/deletes.
7. Monitor server route errors and client 401/403 behavior. Do not reintroduce
   permissive policies as a rollback shortcut.

Rollback is not a blind grant restoration. A rollback requires a separately
reviewed, least-privilege policy and a decision about the application boundary.

## No-effect boundary

This Action creates no runtime transport, provider, broker, schedule, canary,
credential, deployment, or production mutation path. The migration is only a
locally validated artifact pending explicit production authorization.
