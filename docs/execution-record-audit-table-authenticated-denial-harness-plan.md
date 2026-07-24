# Execution Record Audit Table Authenticated Denial Harness Plan

## 1. Purpose

The local harness `scripts/verify-audit-table-authenticated-denial.mjs` is for explicit authenticated/client denial verification against `public.execution_record_audit_events`.

Harness creation is not authenticated denial proof. The harness was not run in Action 787.

## 2. Required Environment Variables

The harness uses the project public Supabase client environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

It supports either safe password-based test credentials:

- `AUDIT_DENIAL_TEST_USER_EMAIL`
- `AUDIT_DENIAL_TEST_USER_PASSWORD`

or an existing safe test session:

- `AUDIT_DENIAL_TEST_ACCESS_TOKEN`
- `AUDIT_DENIAL_TEST_REFRESH_TOKEN`

The harness validates env vars by name only. It must not print values, commit credentials, or require `.env.local` changes.

If no authenticated test credential/session exists, the harness classifies as `config_missing`. The optional `--allow-missing-auth` flag lets a future setup check exit successfully while still recording missing auth config.

## 3. Harness Behavior

The harness is explicit-trigger only and dev/test-only.

It performs authenticated session setup through either password or session mode, then:

- authenticated SELECT denial check against `public.execution_record_audit_events`
- authenticated INSERT denial check against `public.execution_record_audit_events`
- same-authenticated-client cleanup attempt if INSERT is unexpectedly allowed
- result classification as `denied`, `unexpectedly_allowed`, `inconclusive`, `config_missing`, or `execution_error`
- non-zero exit on unexpectedly allowed access
- non-zero exit on missing config unless `--allow-missing-auth` is explicitly passed

The INSERT attempt uses unique UUID values and marker payloads. If INSERT unexpectedly succeeds, cleanup is attempted using the same authenticated client only. The harness never uses service-role cleanup and reports whether any row may have persisted.

The harness does not call production routes, audit writer code, app runtime code, stats/PnL/trade mutation paths, broker/order behavior, Avanza/browser behavior, or automatic mode.

## 4. Safety Boundaries

- Harness creation is not denial proof.
- Harness creation is not generated types proof.
- Harness creation is not writer implementation.
- Harness creation is not route/auth proof.
- Harness creation is not write-path approval.
- Downstream behavior remains unauthorized.
- Broker/Avanza/automatic behavior remains unauthorized.

## 5. Recommended Next Action

Action 788 - Provide Safe Authenticated Denial Harness Environment.

## 6. Verification

Required validation for Action 787:

- runtime import check for `scripts/verify-audit-table-authenticated-denial.mjs`
- `git diff --check`
- `find docs -type f -size 0`
- `./node_modules/.bin/tsc --noEmit`
- `npm run lint`

## Action 788 Environment Check

- Created `docs/execution-record-audit-table-authenticated-denial-environment-proof.md`.
- Public Supabase client env is present.
- Email/password authenticated test env is absent.
- Access/refresh token authenticated test env is absent.
- Ran `node scripts/verify-audit-table-authenticated-denial.mjs --allow-missing-auth`.
- Harness classified the state as `config_missing` and stopped before SELECT/INSERT tests.
- The harness was not run with authenticated denial attempts.
- No rows were inserted.
- Env values were not printed.
- Recommended next action: Action 789 - Provide Authenticated Test User Or Session.

## Action 789 Setup Update

- Created `docs/execution-record-audit-table-authenticated-denial-test-session-setup.md`.
- The setup doc gives placeholder-only temporary shell export templates for email/password and access/refresh token modes.
- Authenticated test env remains missing.
- The harness was not run with authenticated denial attempts.
- No rows were inserted.
- Recommended next action: Action 790 - Operator Provides Authenticated Test Environment.

## Action 790 Environment Verification Update

- Confirmed the harness file exists.
- Confirmed runtime app code does not import the harness.
- Public Supabase env is present.
- Authenticated test env is still missing for both email/password and access/refresh-token modes.
- Ran only the safe config-check command: `node scripts/verify-audit-table-authenticated-denial.mjs --allow-missing-auth`.
- Harness proof artifact: `docs/proofs/execution-record-audit-table-authenticated-denial-proof.txt`.
- Harness classification: `config_missing`.
- Authenticated SELECT was not run.
- Authenticated INSERT was not run.
- Cleanup was not needed and no row may have persisted from this action.
- No service-role key was used, no env values were printed, no `.env.local` changes were made, and no runtime write path was added.
- Status: `authenticated_denial_test_env_still_missing`.
- Recommended next action: Action 791 - Operator Provides Authenticated Test Environment.

## Action 791 Environment Verification Update

- Confirmed the harness file exists.
- Confirmed runtime app code does not import the harness.
- Public Supabase env is present.
- Authenticated test env is still missing for both email/password and access/refresh-token modes.
- Full authenticated denial harness command was not run.
- Harness proof artifact: `docs/proofs/execution-record-audit-table-authenticated-denial-proof.txt`.
- Authenticated SELECT was not run.
- Authenticated INSERT was not run.
- Cleanup was not needed and no row may have persisted from this action.
- No service-role key was used, no env values were printed, no `.env.local` changes were made, and no runtime write path was added.
- Status: `authenticated_denial_test_env_still_missing`.
- Recommended next action: Action 792 - Operator Provides Authenticated Test Environment.

## Action 792 Manual Harness Proof Update

- Operator manually ran `node scripts/verify-audit-table-authenticated-denial.mjs`.
- Codex did not rerun the harness.
- Proof artifact: `docs/proofs/execution-record-audit-table-authenticated-denial-proof.txt`.
- Manual overall classification: `denied`.
- Auth mode: password.
- Authenticated SELECT result: `denied`, `rows_visible: 0`, `error_code: null`.
- Authenticated INSERT result: `denied`, `error_code: 42501`, cleanup not needed, `may_have_persisted: false`.
- Service-role used: false.
- Production routes called: false.
- App runtime mutated: false.
- No secrets were included in the pasted output summary.
- No `.env.local` changes, migrations, type generation, generated type edits, service-role code, writer, route calls, runtime write path, broker/Avanza behavior, or automatic mode were added.
- Status: `audit_table_authenticated_denial_verified_manual_operator_proof`.
- Recommended next action: Action 793 - Generate Audit Table Supabase Types.
