# Action 642 — Add Bounded Historical Reconciliation Usage Read RPC

## Result

`historical_reconciliation_usage_read_rpc_added`

## Root cause

Action 641 integrated historical reconciliation evidence into scheduled usage accounting by reading `public.ci_hur_reconciliations` directly through the server Supabase client.

The table intentionally grants no direct privileges to `service_role`. Access is restricted to narrow `SECURITY DEFINER` RPCs. The direct PostgREST table read therefore returned `permission denied`, causing usage accounting to fail closed as `historical_usage_unavailable`.

## Implementation

Added:

- `public.ci_hur_read_for_usage_accounting(date)`
- SQL, `STABLE`, `SECURITY DEFINER`
- locked `search_path = pg_catalog, public`
- bounded to one `historical_utc_day`
- returns only the strict reconciliation fields required by scheduled usage accounting
- executable only by `service_role`
- no direct table grant
- no mutation capability

Updated the server usage-accounting read path to call the RPC instead of reading `ci_hur_reconciliations` directly.

Updated regression coverage to require the bounded RPC and forbid direct reconciliation-table access.

## Safety properties

- Existing table isolation remains unchanged.
- `public`, `anon`, and `authenticated` cannot execute the RPC.
- `service_role` receives only execute permission on the bounded read RPC.
- No provider calls, claims, ledger writes, audit writes, or usage mutations are introduced.
- Usage accounting continues to fail closed on RPC, database, or validation failure.

## Validation

- Focused Action 641/642 tests: 4 passed
- Relevant regression suite: 19 passed
- TypeScript: passed
- Scoped ESLint: passed
- `git diff --check`: passed
- Production build: passed
- Supabase linked schema lint reported three pre-existing unrelated function errors; no Action 642 RPC issue was reported.

## Production note

The migration must be applied before deploying the server change. Otherwise the server read path will fail closed because the RPC does not yet exist.
