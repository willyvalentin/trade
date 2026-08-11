# Action 660 — MA05 independent review and activation package

Status: **source-only; Draft PR; no production apply; no Auth change; no merge;
no deploy**.

## Review finding and correction

The independent review rejected the earlier classification of
`recommendation_scan_runs`, `recommendation_batches`, and
`recommendation_outcomes` as system-shared.

- Scan-run payloads contain the visible recommendation set.
- Batch payloads contain the official or diagnostic recommendations served to
  the user.
- Outcome rows and payloads are derived from owner-bound recommendation
  snapshots.

Leaving those tables unfiltered would allow a service-role read to cross the
owner boundary even though browser privileges remained revoked. The Draft PR
therefore now adds `owner_user_id`, Auth foreign keys, owner-required checks,
indexes, RLS policies, explicit service-role filters, and server-side owner
stamping for all three tables.

System-shared classification remains limited to market/reference data,
scanner caches, and scheduled-run operational observability that does not
contain the visible recommendation set or account-specific result history.

## Non-executing operator package

`supabase/operations/action-660-ma05-owner-activation/` contains:

- a read-only, explicit-UUID preflight;
- one transactionally bounded legacy backfill and constraint activation;
- a standalone readback covering owner counts, physical `NOT NULL`, validated
  constraints, RLS, table ACLs, and the owner-aware RPC grant boundary;
- a rollback-only, non-production two-principal RLS proof.

Every UUID placeholder is deliberately invalid. The activation also requires
an explicit writer-pause boolean and confirmation phrase. It updates only
currently null owner fields, refuses any conflicting non-null owner, verifies
the exact Auth row, reconciles row counts, validates every reviewed constraint,
and then adds physical `NOT NULL`.

No script in the package was executed by this action. The package does not
authorize migration apply, owner selection, environment configuration, merge,
or deploy.

## Remaining activation gates

MA05 remains open until the operator explicitly confirms the canonical Auth
UUID, pauses writers, separately approves and executes the production
maintenance sequence, obtains clean readback, configures the Functions-scoped
owner value without disclosure, and completes route/data-layer/RPC/RLS
two-principal negative tests in a disposable test environment.
