# Action 659C: Local Recovery Round-Trip Validation

## Scope

This document records the disposable PostgreSQL validation of the frozen Action
659B artifacts. The harness never reads production configuration or connects to
Supabase.

## Matrix

The harness builds the canonical baseline, applies `01500`, `01600`, and
`02000`, records their required history contracts, injects one state per fresh
container, and then exercises the source or reviewed SQL Editor bundle for
`03000`.

It covers supported service-role, browser-role, `PUBLIC`, and RLS drift; exact
history failures; missing tables; owner and policy drift; append-only and Action
652 contract drift; a forced pre-history failure; and deliberately adversarial
unknown-scope, function, trigger, and role-grant cases.

Every rejected case compares a catalog/history snapshot before and after the
bundle. Any acceptance of an unknown state is a fail-closed validation failure
that must be corrected in a separate Action 659B.1; this Action does not edit
the frozen artifacts.

## Action 659B.1 revalidation result

The frozen artifacts were exercised in 32 fresh disposable PostgreSQL
containers. The 7 supported ACL/RLS recovery cases passed, as did all 12
history/owner/policy/append-only/RPC/postcondition refusal cases. The revised
unknown-grantee controls passed for direct table `SELECT`, DML, column grants,
runtime-role membership, an unknown role with no target access, and verified
owner access. Source and SQL Editor bundle paths both passed their applicable
successful and unknown-ACL cases.

Three adversarial scope-integrity cases remain blockers:

- an extra public table outside the 19-table allowlist is accepted;
- a semantically altered `action_650_reject_execution_audit_mutation` function
  is accepted when its coarse text/owner/search-path checks still match; and
- an extra trigger with another name on an audit table is accepted because the
  recovery only requires the three expected trigger rows.

In each blocker case the SQL Editor bundle completed its repair and registered
`20260724003000`, so the failure is an artifact fail-closed gap rather than a
harness failure. The local scenario container is discarded after each case;
there was no external or production mutation.

These findings are historical Action 659C evidence. Action 659B.2 subsequently
added the required exact scope, function, and trigger allowlists; Action 659C
must now restart its full two-run determinism matrix against the revised frozen
artifacts.

## Action 659C.1 terminal two-run certification

The revised frozen artifacts were validated in terminal-observable shards from
fresh disposable PostgreSQL containers. Run A used the recovery source and Run
B used the reviewed SQL Editor bundle. Each path executed the same 36 scenario
IDs exactly once in 18 two-scenario shards; every shard exited with code zero
and wrote a machine-readable result under the local temporary directory.

The aggregate outcome was 36 passed, zero failed, zero skipped, and zero
duplicates for each path. Both normalized result sets produced the same SHA-256
digest:

`415b3c9d022233b729d3b5b4becd11f730f5f3dcd238d38702cde7c9447ebd2b`

The matrix includes the supported ACL/RLS repairs, history and no-op refusals,
relation-scope, owner, policy, append-only function, trigger, Action 652 RPC,
direct table/column ACL, runtime-role membership, positive exception,
postcondition, and pre-history bundle-failure cases. Rejected cases compare
pre/post catalog and history snapshots, proving no partial repair or recovery
history insertion. The static Action 650/659B contracts, TypeScript, scoped
ESLint, and `git diff --check` also passed. This remains local-only evidence;
it does not authorize recovery execution or any production mutation.
