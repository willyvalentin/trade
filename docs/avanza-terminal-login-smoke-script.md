# Avanza terminal login smoke script

## Current status

The terminal-only script scaffold now exists at
`scripts/avanza-login-smoke-test.local.ts`.

It uses the hard-gated isolated login smoke test runner model and remains
disconnected from Trade UI, disconnected from API routes, disconnected from
order flow, default-safe and hard-gated, and not production-ready.

## Required local gates

The script is local-dev only and is blocked in CI. It requires:

- `TURE_AVANZA_LOGIN_SMOKE_TEST=1`
- `TURE_LOCAL_DEV_CONFIRM=I_UNDERSTAND_THIS_IS_LOCAL_ONLY`

Without the separate `TURE_AVANZA_LOGIN_REAL_RUN=1` flag, the script remains in
safe dry-run/model-report mode.

## Real-run boundary

`TURE_AVANZA_LOGIN_REAL_RUN=1` is required before the script can model
`local_dev_explicit_real_run`.

Even with that flag present, this scaffold does not import Playwright, does not
resolve credential material, does not open Avanza, and does not execute login
actions. Future real local execution must wire injected dependencies in a
separate reviewed phase.

## Credential boundary

Do not put credentials in command lines, docs, fixtures, reports, or
environment variables. The script has no environment credential fallback and
does not read credential values directly.

Safe output is limited to booleans such as `credentialRuntimeBundleUsed`,
`usernameUsed`, and `passwordUsed`.

## Safety guarantees

- Terminal-only.
- Local-dev only.
- CI blocked.
- Explicit env opt-in required.
- Manual local confirmation required.
- Separate real-run flag required.
- No credentials in command line.
- No credentials in env vars.
- No env fallback for credentials.
- No credential logging.
- No cookies/session handling.
- No BankID automation.
- No BankID bypass.
- No order submission.
- No final KÖP/SÄLJ click.
- No Trade UI wiring.
- No API route wiring.
- No Supabase execution write.

## Safe local checklist

Before any future manual local run:

1. Confirm this is a local terminal session and not CI.
2. Confirm `TURE_AVANZA_LOGIN_SMOKE_TEST=1`.
3. Confirm `TURE_LOCAL_DEV_CONFIRM=I_UNDERSTAND_THIS_IS_LOCAL_ONLY`.
4. Confirm whether `TURE_AVANZA_LOGIN_REAL_RUN=1` is intentionally present.
5. Confirm no credential value is passed through command line or env vars.
6. Confirm no cookie/session export is planned.
7. Confirm BankID or MFA remains manual-action only.
8. Confirm no order submission path exists.
9. Confirm no final KÖP/SÄLJ click path exists.
10. Confirm Trade UI and API routes remain disconnected.

## Package script status

No `package.json` script was added in this phase because the project does not
currently include `tsx` or another TypeScript script runner dependency for this
flow. The scaffold is present for future local runner selection, but it is not
referenced by build, test, lint, Trade UI, or API routes.

## Visibility layer

Static fixture states live in
`lib/avanza-terminal-login-smoke-script-fixtures.ts`, with an isolated harness
in `components/execution/AvanzaTerminalLoginSmokeScriptHarness.tsx`.

The dev-only visual QA route renders those fixtures as fixture/model-only
visibility. Rendering the route does not run the script.

## Settings UI Boundary

The passive Ture Settings UI scaffold now exists at
`components/execution/AvanzaExecutionSettingsProfilePanel.tsx`.

It models account type and credential readiness only. It does not execute login,
does not run this terminal smoke script, does not call a browser, does not call
an API route, does not access Keychain, does not expose raw username/password
values, and does not submit orders or final KÖP/SÄLJ.
