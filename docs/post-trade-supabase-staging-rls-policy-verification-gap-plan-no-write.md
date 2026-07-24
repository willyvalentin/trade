# Post-Trade Supabase Staging RLS Policy Verification Gap Plan, No Write

## Summary

Purpose: define a no-write plan to close or explicitly track the remaining staging RLS/policy/grant verification warning from Action 424.

Result: RLS/policy/grant verification gap plan is ready. Runtime/API/UI write-path readiness remains blocked until the warning is closed or explicitly accepted as a known limitation.

Decision: `post_trade_supabase_staging_rls_policy_verification_gap_plan_ready_no_write`.

## Target

- Environment: `ture-staging`
- Project ref / safe identifier: `pdvzyuhykomwfqyyztru`

Local Supabase CLI target marker at planning time:

```text
pdvzyuhykomwfqyyztru
```

Production is not selected.

## Remaining Warning From Action 424

Exact warning:

- Direct remote schema-dump inspection of RLS/policy/grant DDL is still not available because the Docker-based schema-only dump path hung twice in Action 423 and produced a zero-byte ignored artifact.

This warning does not invalidate:

- staging migration-history alignment
- staging table presence verification through generated types
- source-controlled migration evidence
- static migration tests

It does mean direct remote DDL inspection of actual staged RLS/policies/grants remains incomplete.

## Already Verified

Verified in Action 423 and Action 424:

- full local migration chain applied successfully to `ture-staging`
- local and remote migration history are aligned
- generated TypeScript types include expected baseline tables
- generated TypeScript types include expected post-trade persistence tables
- source-controlled baseline migration contains evidenced RLS, policies, and grants for baseline tables where present in the reviewed schema-only artifact
- source-controlled post-trade migration enables RLS on all post-trade persistence tables
- post-trade policy design remains future-gated
- no runtime/API/UI write path is active

## Still Unverified

Remaining gap:

- Direct remote confirmation from staging system catalogs or equivalent UI that the applied RLS/policy/grant state exactly matches expectations.

Specifically still needing direct read-only confirmation where possible:

- RLS enabled status per expected table
- policy names and policy commands per expected table
- policy expressions where safe to inspect
- table grants for expected roles
- confirmation that no unexpected runtime write grants/policies were introduced by migration application

## Safe Alternatives To Docker-Based Schema Dump

### Alternative A: Static Migration SQL Review

Status: already performed.

Use cases:

- confirms intended migration content
- confirms no row data, no runtime activation, and no forbidden command text
- confirms RLS/policy/grant expectations encoded in source control

Limitation:

- does not independently prove the live staging catalog state beyond migration-history alignment.

### Alternative B: Generated Types Confirmation

Status: already performed.

Use cases:

- confirms expected public tables exist in staging
- avoids data export
- avoids row insertion
- avoids schema mutation

Limitation:

- does not expose RLS policies or grants.

### Alternative C: Read-Only Postgres Catalog Introspection

Status: future-only and requires a separate explicit approval gate.

Allowed future shape, only after approval:

- read-only queries against `pg_tables`, `pg_policies`, `pg_class`, `pg_namespace`, and `information_schema.role_table_grants`
- no `insert`, `update`, `delete`, `copy`, `alter`, `drop`, `create`, `grant`, `revoke`, `repair`, `push`, `reset`, or migration command
- no secrets printed or stored
- no connection strings printed or stored
- output limited to table names, RLS booleans, policy names, commands, and safe grant metadata

Expected value:

- directly closes the live staging RLS/policy/grant verification gap without relying on Docker schema dump.

### Alternative D: Supabase Dashboard Manual Read-Only Inspection

Status: future-only and can be used if CLI catalog introspection is not approved or practical.

Allowed future shape:

- manually inspect staging table RLS status, policies, and grants in Supabase dashboard
- record only non-secret table/policy/grant summary
- do not change settings
- do not insert rows
- do not run SQL editor writes

Expected value:

- can close or reduce the warning if catalog access is unavailable.

### Alternative E: Explicit Accepted Limitation

Status: future-only.

Allowed future shape:

- user explicitly accepts that direct live RLS/policy/grant DDL verification remains incomplete
- write-path readiness remains blocked or proceeds only under a separate risk acceptance gate

Expected value:

- tracks the warning honestly if direct verification cannot be performed.

## Pass Criteria To Close Warning

The warning can be closed if one of these is true:

- Read-only catalog introspection confirms expected RLS enabled status, policy definitions, and grants for baseline and post-trade tables.
- Supabase dashboard manual read-only inspection confirms equivalent RLS/policy/grant state and records a non-secret summary.
- The user explicitly accepts the warning as a known limitation under a separate approval gate, with write-path readiness still separately gated.

## Fail Criteria

The warning remains open if:

- direct live RLS/policy/grant state cannot be inspected
- inspection output is ambiguous
- any unexpected broad write policy or grant appears on post-trade persistence tables
- any inspection requires writing data, applying migrations, repairing migrations, or activating runtime/API/UI paths
- production would need to be touched
- secrets or connection strings would need to be printed or stored

## Write-Path Readiness Position

Runtime/API/UI write-path readiness remains blocked until:

- this RLS/policy/grant warning is closed, or
- the warning is explicitly accepted as a known limitation under a separate approval gate.

Even after this warning is closed, separate gates are still required for:

- Supabase real write paths
- API/runtime write activation
- Trade UI execution
- Avanza/browser automation
- production migration/apply

## Forbidden In This Planning Phase

Not run and still forbidden:

- `supabase db push`
- `supabase migration up`
- `supabase db reset`
- migration repair
- migration marking
- staging data write
- test row insertion
- production DB connection
- production Supabase write
- API activation
- Trade UI execution
- runtime write path activation
- browser automation
- Avanza login
- credential/cookie/session/BankID handling
- order action
- settlement retrieval
- live trade mutation
- live position mutation

## Safety Confirmation

Confirmed for Action 425:

- no production connection
- no production state touch
- no staging data write
- no test row insertion
- no migration apply
- no migration repair
- no migration marking
- no DB write
- no Supabase write
- no API activation
- no Trade UI execution
- no runtime write path activation
- no Avanza/browser automation
- no credential/session/BankID handling
- no order behavior
- no settlement retrieval
- no real trade/broker data insertion
- no live trade mutation
- no live position mutation

## Final Decision

`post_trade_supabase_staging_rls_policy_verification_gap_plan_ready_no_write`
