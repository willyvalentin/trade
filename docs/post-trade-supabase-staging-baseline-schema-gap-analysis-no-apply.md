# Post-Trade Supabase Staging Baseline Schema Gap Analysis, No Apply

## Summary

Purpose: analyze why Action 409 full-chain initialization of `ture-staging` failed and identify baseline schema assumptions in the local Supabase migration chain.

Result: baseline schema gap analysis ready; no migration apply, repair, schema/data command, or Supabase data write occurred after the failed Action 409 stop.

Decision: `post_trade_supabase_staging_baseline_schema_gap_analysis_ready_no_apply`.

## Context

- Action 409 target: `ture-staging` / `pdvzyuhykomwfqyyztru`
- Action 409 dry-run: matched the approved 13-file full local migration chain.
- Action 409 apply command: `supabase db push --linked`
- Action 409 failure: `ERROR: relation "public.positions" does not exist (SQLSTATE 42P01)`
- No migration was recorded as applied remotely.
- No repair/reset/retry was attempted.
- Production remains blocked.

## Local-Only Analysis Scope

This analysis inspected local migration filenames and local migration SQL only.

No Supabase apply command, reset command, migration repair command, production connection, staging schema/data command, or data write was run.

## First Migration In Order

The first local migration is:

```text
20260520000000_add_execution_metadata_to_positions.sql
```

Its SQL is:

```sql
alter table public.positions
add column if not exists execution_metadata jsonb;
```

This migration requires `public.positions` to exist before the local migration chain begins. It is not an empty-database initializer.

## Visible Baseline Assumptions

Local migration files visibly assume:

| Assumed object | Where visible | Why it matters |
| --- | --- | --- |
| `public.positions` | `20260520000000_add_execution_metadata_to_positions.sql` | First migration alters this table but no local migration creates it first |
| Existing application baseline before May 2026 migrations | Implied by first migration timestamp and alter-only first step | The local migration folder appears to start after some earlier schema already existed |

Other local dependencies are created within the local chain:

- `public.recommendation_outcomes` is created before the later unique-index migration on that table.
- `public.execution_records` is created before `public.execution_record_audit_events` references it.
- `public.execution_agent_runs` is created before `public.execution_agent_progress_events` references it.
- Post-trade tables in `20260708000000_post_trade_persistence_schema_draft.sql` are created in an order that satisfies their local references.

## Completeness Finding

The local migration chain is not complete from an empty database.

It requires a pre-existing baseline that includes at least `public.positions`. Because the first migration fails before any later local migration can run, `ture-staging` cannot be initialized from the current local migration directory alone.

This explains why a clean full-chain staging initialization failed even though the target was correct and the dry-run matched the approved scope.

## Strategy A - New Initial Baseline Migration From Known Expected Schema

Description: create a new earlier baseline migration that defines the missing application baseline schema needed before `20260520000000`.

Use only if:

- expected baseline schema can be reconstructed from source-controlled, reviewed definitions
- `public.positions` and any related base objects are explicitly defined
- the migration is reviewed as a staging/local baseline initializer
- production remains blocked
- a future apply gate explicitly includes the new baseline migration

Benefits:

- source-controls the missing baseline
- makes future staging/local initialization reproducible
- avoids depending on production dumps

Risks:

- requires high confidence in the reconstructed schema
- may miss historical constraints, indexes, policies, or columns if not carefully audited

## Strategy B - Sanitized Production Schema-Only Baseline After Separate Gate

Description: use a schema-only dump from production or another trusted environment to create a sanitized staging baseline.

Use only after a separate approval gate because it may involve production schema access.

Requirements:

- schema-only, no data
- secrets excluded
- no production writes
- no application data, broker data, credentials, cookies, sessions, or BankID material
- reviewed transformation into safe baseline artifacts before staging use

Benefits:

- highest chance of matching real historical baseline
- can capture constraints/indexes not obvious from current local files

Risks:

- requires production connection unless sourced from an existing safe artifact
- must be tightly gated to avoid data or secret exposure
- still needs review before applying to staging

## Strategy C - Recreate Staging After Adding/Repairing Baseline Migrations

Description: once the baseline migration gap is fixed, recreate or cleanly initialize `ture-staging` from the complete migration chain.

Use only if:

- baseline migration set is complete
- `ture-staging` is empty/disposable or explicitly approved for recreation
- target remains `pdvzyuhykomwfqyyztru`
- full-chain scope is approved again

Benefits:

- cleanest end-state for staging history
- avoids partial/manual repair of an ambiguous staging project

Risks:

- requires a separate destructive/recreate gate if existing staging state must be cleared
- cannot proceed until baseline schema is complete

## Strategy D - Pause Staging Initialization

Description: abandon staging initialization until base schema history is reconstructed.

Use if:

- baseline cannot be safely reconstructed
- production schema-only access is not approved
- staging state cannot be treated as disposable

Benefits:

- lowest operational risk
- keeps production, runtime, and data-write boundaries closed

Risks:

- delays non-production schema verification
- leaves post-trade persistence apply blocked

## Recommended Safest Next Strategy

Recommended next step: Strategy A, with a no-apply baseline schema reconstruction plan.

Reasoning:

- The missing `public.positions` table is a local migration-chain completeness problem.
- The safest first move is source-controlled reconstruction of the baseline assumptions from local code and existing docs, without production access.
- If Strategy A cannot confidently reconstruct the baseline, escalate to Strategy B only through a separate production schema-only approval gate.
- Do not retry staging initialization until the baseline migration gap is resolved and reviewed.

## Forbidden In This Action

Forbidden and not run:

```bash
supabase db push
supabase migration up
supabase db reset
```

Also forbidden and not done:

- any migration apply
- any migration repair
- marking migrations as applied
- any DB schema/data command
- any Supabase data write
- production DB connection
- printing or storing secrets
- API activation
- Trade UI execution
- browser automation
- Avanza login
- credential/cookie/session/BankID handling
- order action
- live trade mutation
- live position mutation

## Safety Confirmation

Confirmed after the failed Action 409 stop:

- no migration apply
- no DB schema/data command
- no Supabase data write
- no production state touch
- no secrets printed or stored
- no API activation
- no Trade UI execution
- no Avanza/browser automation
- no credential/session/BankID handling
- no order behavior
- no live trade mutation
- no live position mutation

## Final Decision

`post_trade_supabase_staging_baseline_schema_gap_analysis_ready_no_apply`
