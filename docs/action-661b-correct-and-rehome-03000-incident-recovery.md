# Action 661B: Correct and re-home 03000 incident recovery

## Status

Current and local. This document supersedes the earlier global-`public`
relation inventory claim for recovery `20260724003000`; historical validation
documents remain evidence of the prior design and its discovered limitation.

## Decision

Recovery `03000` is an incident-only forward-recovery package, not a normal
Supabase migration. The reviewed source, SQL Editor bundle, and readback live
under `supabase/incident-recovery/20260724003000-action-650-containment/`.
Normal migration discovery considers `supabase/migrations`, which has no 03000
artifact. Nothing in this package can be applied by ordinary migration release
flow.

## Contract

The package repairs only the exact 19 Action 650 containment tables. Before any
mutation it verifies each target's name, relation type, owner, direct and
effective ACL state, RLS, policy state, append-only function/trigger contract,
and dependent Action 652 RPC contract. It retains the transaction boundary,
advisory transaction lock, exact `02000` history prerequisite, absent `03000`
history prerequisite, postconditions before history registration, and
fail-closed behavior. It never recreates browser access, replaces unknown
objects, uses `CREATE OR REPLACE`, or rewrites history.

The package does not enumerate or repair unrelated `public` relations. This
avoids treating continuous-intelligence and historical-data relations as a
hidden extension of the Action 650 contract. Those domains remain explicitly
out of scope and require their own containment design if one is needed.

## Role membership

The package accepts only the verified production-shaped platform membership
edges into `anon`, `authenticated`, and `service_role`: `authenticator` with
non-inheriting, settable membership, and `postgres` with its verified
administrative membership. Any other membership into a runtime role fails
closed. Unknown roles without target access remain allowed; unknown direct or
column privileges on a target remain rejected.

## Operator boundary

`manifest.json` and the incident-package README make the execution boundary
explicit. A future use requires a separate incident decision and authorization;
this Action neither authorizes nor performs recovery.

## Focused local evidence

Disposable PostgreSQL validation exercised both the source and SQL Editor bundle
paths with a repairable target-table drift and ten production-shaped
continuous-intelligence/historical tables. Both paths repaired the 19-table
contract while preserving the unrelated-table catalog snapshot, with result-set
digest `34d55d42957d5aa7a57373be5c6d9346d0729f77d1dd1b5699a6377f2286eb12`.
The same focused harness accepted the verified platform memberships and rejected
an unallowlisted runtime-role membership and an unknown target column grant
without creating recovery history. This is focused Action 661B evidence, not a
replacement for the full two-run matrix required by the next validation action.
