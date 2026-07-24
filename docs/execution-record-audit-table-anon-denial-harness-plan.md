# Execution Record Audit Table Anon Denial Harness Plan

## 1. Purpose

The local harness `scripts/verify-audit-table-anon-denial.mjs` is for explicit anon/client denial verification against `public.execution_record_audit_events`.

Harness creation is not denial proof. The harness was not run in Action 785.

## 2. Required Environment Variables

The harness uses the project public Supabase client environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

The harness validates that these variables exist by name only. It must not print values, commit keys, or require `.env.local` changes.

## 3. Harness Behavior

The harness is explicit-trigger only and dev/test-only.

It performs:

- anon SELECT denial check against `public.execution_record_audit_events`
- anon INSERT denial check against `public.execution_record_audit_events`
- same-anon-client cleanup attempt if INSERT is unexpectedly allowed
- result classification as `denied`, `unexpectedly_allowed`, `inconclusive`, `config_missing`, or `execution_error`
- non-zero exit on unexpectedly allowed access
- non-zero exit on missing configuration

The INSERT attempt uses unique UUID values and marker payloads. If INSERT unexpectedly succeeds, cleanup is attempted using the same anon client only. The harness never uses service-role cleanup and reports whether any row may have persisted.

The harness does not call production routes, audit writer code, app runtime code, stats/PnL/trade mutation paths, broker/order behavior, Avanza/browser behavior, or automatic mode.

## 4. Safety Boundaries

- Harness creation is not denial proof.
- Harness creation is not generated types proof.
- Harness creation is not writer implementation.
- Harness creation is not route/auth proof.
- Harness creation is not write-path approval.
- Harness creation is not audit append approval.
- Downstream behavior remains unauthorized.
- Broker/Avanza/automatic behavior remains unauthorized.

## 5. Recommended Next Action

Action 786 - Run Anon Denial Verification Harness.

## 6. Verification

Required validation for Action 785:

- `git diff --check`
- `find docs -type f -size 0`
- `./node_modules/.bin/tsc --noEmit`
- `npm run lint`

## Action 786 Run Result

- The harness was run from the local terminal.
- Proof artifact: `docs/proofs/execution-record-audit-table-anon-denial-proof.txt`
- Overall classification: `denied`.
- Anon SELECT classification: `denied`.
- Anon INSERT classification: `denied`.
- Same-anon-client cleanup was not needed.
- The harness reported `may_have_persisted: false`.
- Env values were not printed.
- Service-role was not used.
- No runtime app integration was added.
- Recommended next action: Action 787 - Create Authenticated Denial Verification Harness.

## Action 787 Follow-Up

- Created `scripts/verify-audit-table-authenticated-denial.mjs`.
- Created `docs/execution-record-audit-table-authenticated-denial-harness-plan.md`.
- The authenticated harness was not run in Action 787.
- Anon denial remains verified; authenticated denial remains pending.
- Recommended next action: Action 788 - Provide Safe Authenticated Denial Harness Environment.
