# Action 645: Production Release and Canary Preflight Automation

## Purpose

Action 645 provides one repeatable, read-only operator check before requesting authorization for Action 643. It prevents a stale Git ref, deployment assertion, production deploy, schema state, usage balance, or request builder from being mistaken for a ready production canary.

## Script

Run from the repository root:

```sh
node scripts/action-645-production-release-and-canary-preflight.mjs
```

The script emits structured JSON followed by one concise human-readable status line. It performs only:

- Git read commands and GitHub remote-ref inspection;
- Netlify read APIs and a read of the one public deployment-commit assertion;
- Supabase linked schema lint and migration-history reads;
- the authenticated read-only usage-accounting route; and
- static inspection of `/tmp/ture-action-643-build-request.cjs`.

It never executes the builder, sends a dry-run request, creates a claim, calls a provider, writes a durable row, changes an environment variable, triggers a deployment, applies a migration, or modifies Git or `deno.lock`.

## Contracts

The preflight requires all of these to agree:

- local `main`, `origin/main`, GitHub default branch, the published production deploy, and `TURE_CONTINUOUS_INTELLIGENCE_DEPLOYMENT_COMMIT`;
- a ready production/main Netlify deploy with successful plugins, no error, and zero normal or enhanced secret-scan matches;
- linked Supabase lint success, Action 644 migration `20260724001000` applied, and no forbidden draft migration remotely;
- clean UTC-day usage accounting across scheduled, manual, reconciliation, total-ledger, and claim-capacity scopes; and
- a completed Action 643 window and a builder whose deployment identity and canonical window values match.

The Action 643 window is fixed to `2026-07-24T13:30:00.000Z` through `2026-07-24T14:00:00.000Z`, cadence `regular_session_30m_1400Z`.

## Deterministic Statuses

`preflight_ready` is the only status that recommends requesting explicit authorization for one scheduled dry-run. All other results fail closed:

- `window_not_completed`
- `git_identity_mismatch`
- `deployment_identity_mismatch`
- `assertion_mismatch`
- `production_schema_unhealthy`
- `forbidden_migration_detected`
- `usage_not_clean`
- `builder_stale`
- `preflight_unavailable`

The JSON report preserves every observed blocker and warning even when precedence selects a single final status.

## Operator Procedure

1. Run the script only after a production release is known complete.
2. Read the JSON status, blockers, warning list, identities, timing, usage, and zero-effect counters.
3. Resolve reported blockers through separately authorized operations. Never bypass a gate in the preflight.
4. When and only when status is `preflight_ready`, request explicit authorization for a single Action 643 dry-run request.
5. Run a fresh preflight immediately before that separate authorized request.
