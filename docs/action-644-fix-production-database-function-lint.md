# Action 644 — Fix Production Database Function Lint

## Result

`production_database_function_lint_fixed`

## Scope

Action 644 fixes the three production PL/pgSQL lint errors previously reported by `supabase db lint --linked`.

Affected RPCs:

- `public.admit_continuous_intelligence_shadow_canary_manual_execution`
- `public.ci_mca_issue`
- `public.ci_mca_consume`

## Root Causes

### Manual admission digest resolution

The manual admission RPC called `digest(...)` while its bounded `search_path` only included `public`.
The `pgcrypto` function is installed in `extensions`, so PostgreSQL could not resolve `digest(text, unknown)`.

### Manual authorization issue ambiguity

`ci_mca_issue` used unqualified authorization-table columns such as `status`, `expires_at`, and `issued_at`.
These collided with PL/pgSQL output variables.

### Manual authorization consume ambiguity

`ci_mca_consume` and the admission RPC used unqualified columns such as `authorization_id` and `status`.
These collided with PL/pgSQL variables and row fields.

## Implementation

Added migration:

`supabase/migrations/20260724001000_fix_continuous_intelligence_manual_canary_function_lint.sql`

The migration:

- preserves all existing RPC signatures and return contracts
- preserves security-invoker behavior
- preserves service-role-only execution grants
- adds `extensions` to the admission RPC search path
- fully qualifies ambiguous authorization-table columns
- retains the stable RPC names `ci_mca_issue` and `ci_mca_consume`

No feature flags, rollout state, provider calls, claims, writes, schedules, or production execution behavior were changed.

## Validation

- `supabase db reset` passed
- `supabase db lint` reported `No schema errors found`
- focused regression tests: `9 passed`
- `./node_modules/.bin/tsc --noEmit` passed
- scoped ESLint passed
- `git diff --check` passed
- `deno.lock` remained untouched

## Production Status

The migration has not yet been applied to production.
Current linked production lint still reports the three expected pre-migration errors.
After reviewed production application, run `supabase db lint --linked` to confirm no remaining function lint errors.
