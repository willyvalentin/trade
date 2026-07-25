# Action 654: Harden Action 650 Containment Migration and Evidence

## Status

`action_654_containment_hardening_ready` is a local-review result only. Migration
`20260724002000` remains absent from production and PR #44 remains a draft.

## Defects corrected

Action 653 found that the original migration could replace a function with
`CREATE OR REPLACE` and remove an existing trigger with `DROP TRIGGER IF EXISTS`.
Those operations are removed. The hardened migration first rejects any existing
`public.action_650_reject_execution_audit_mutation` overload, Action-650-named
policy, or `action_650_append_only` trigger on the three append-only tables.
The catalog checks include the conflicting function identity arguments and owner,
and trigger definition/enabled-state evidence. A conflict occurs before any ACL,
RLS, or policy mutation.

Legacy non-Action-650 policies on the 19 target tables remain an intentional input
to containment: they are removed in the containment body. This avoids preserving
a browser-facing policy merely because it predates Action 650.

The migration also revokes legacy `service_role` grants before granting only
runtime DML. It does not grant `TRUNCATE`, `REFERENCES`, or `TRIGGER`.

## Evidence matrix

The exact scope remains 19 tables:

`recommendations`, `positions`, `position_updates`, `user_settings`,
`scanner_cache`, `market_calendar_cache`, `market_regime_snapshots`,
`recommendation_batches`, `recommendation_outcomes`, `recommendation_scan_runs`,
`recommendation_snapshots`, `scheduled_scan_runs`, `scheduled_scan_attempts`,
`symbol_metadata`, `execution_records`, `execution_agent_runs`,
`execution_agent_progress_events`, `execution_lifecycle_events`, and
`execution_record_audit_events`.

The local effective-role harness proves `19 x 4 x 7 = 532` ACL combinations for
`PUBLIC`, `anon`, `authenticated`, and `service_role`, across `SELECT`, `INSERT`,
`UPDATE`, `DELETE`, `TRUNCATE`, `REFERENCES`, and `TRIGGER`. `PUBLIC` uses catalog
ACL inspection because it is not a role that can be used with `SET ROLE`;
the remaining roles receive both catalog and `SET ROLE` checks. No check is
skipped. `postgres` ownership and `service_role` BYPASSRLS remain acceptable only
because browser access is denied and application persistence is server-owned.

## Reviewed SQL Editor contract

`scripts/action-654-apply-20260724002000.sql` is a complete one-time SQL Editor
bundle. It starts a transaction, obtains a fixed advisory transaction lock,
rejects duplicate/forbidden history, requires 01500 and 01600, executes the six
reviewed migration statements, verifies RLS and policy postconditions, records
the exact ordered six-element statement array, and commits. Any failure rolls
back the entire transaction. It contains no shell command, connection string,
placeholder, or secret.

The reviewed source migration SHA-256 is
`5fa6ba977db3767d4ff1b35685fa8851222ba6db65b1cd96e8a2cf2bef5a0973`.
The reviewed bundle SHA-256 is
`b0191faaecebbc2b4363558cabb8dcef777de9056ce7eb5b0440e1affb541497`.
The migration version is `20260724002000`, its name is
`contain_production_trading_data_access`, and the exact history contract is an
ordered six-statement array.

`scripts/action-654-production-containment-readback.sql` is read-only. It returns
`action_650_containment_verified` only when migration history, all 19 tables,
RLS, the seven-privilege denial matrix, service-role DML contract, append-only
function/triggers, Action 652 contracts, and forbidden-migration absence match.

## Local failure safety

The disposable bundle suite covers the happy path, duplicate history/execution,
same- and wrong-signature functions, named triggers, missing tables, an
Action-650-named policy, forbidden history, browser/service ACL regressions,
RLS regression, incorrect history count, and a forced postcondition rollback.
Each rejected bundle case checks that history was not inserted and containment
state did not partially change.

## Static Playwright mode

`npm run test:e2e:static` is the repository-owned static containment runner.
It sets `PLAYWRIGHT_SKIP_WEB_SERVER=true` in a cross-platform Node runner and
runs only the Action 650, 652B, 652C, and 652F source-contract suites. In this
mode `playwright.config.ts` omits `webServer`, so Next is not started and no
public Supabase configuration, local environment file, or network destination
is needed. Ordinary `npm run test:e2e` behavior is unchanged.

## Production gates

Production application remains separately approved work. Before an operator can
apply this bundle: review PR #44, re-read production catalog/prestate, use only
the reviewed SQL Editor bundle, run the readback immediately, and separately
verify browser/server routes. No deploy, provider, broker, schedule, or data
operation is part of Action 654.
