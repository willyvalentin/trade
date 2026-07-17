# Post-Trade Read-Only Live Staging Migration Preflight Contract Static Security Review

Action 506 statically reviewed and hardened the read-only live staging migration preflight contract. This action did not collect live Git evidence, run Supabase, execute SQL, deploy a migration, inspect remote state, mutate schema, persist evidence, consume the readiness artifact, invoke execution adapters, or activate API/UI/runtime paths.

## Reviewed Files

- `lib/post-trade-read-only-live-staging-migration-preflight-contract.ts`
- `tests/e2e/post-trade-read-only-live-staging-migration-preflight-contract.spec.ts`
- `docs/post-trade-read-only-live-staging-migration-preflight-contract-no-commands-no-deployment.md`

## Review Findings

The contract remains pure and source-controlled. It models a future read-only evidence envelope and final fail-closed decision, but it does not implement a runner, shell command execution, Supabase command execution, SQL execution, deployment, remote schema inspection, evidence persistence, readiness artifact consumption, or runtime write behavior.

The ready path is now stricter: canonical structural evidence must produce no blocking reasons before it may classify as `ready_for_explicit_staging_deployment_action`.

## Hardening Added

- Evidence source identity must match the expected evidence category.
- Evidence envelopes must include exact required fields, non-empty ids/versions, valid fingerprints, valid timestamps, bounded freshness, and one collection session.
- Collection sessions must be complete, non-future, non-stale, versioned, and bound to redacted repository identity.
- Project refs must be exact lowercase Supabase refs and must reject production, alternate, malformed, whitespace, case, or self-asserted values.
- Worktree, migration inventory, project, target, history, and catalog evidence now use structured observation fingerprints instead of accepting opaque constants alone.
- The catalog fingerprint helper was fixed to hash only the explicit sanitized catalog observation subset.
- The contract rejects unsupported nested values, cycles, unknown fields, broad secret-bearing field names, connection strings, bearer-header fragments, private-key fragments, and personal absolute paths.
- The deployment unit remains exactly one reviewed migration path, with unrelated Action 366-369 and Action 318-320 files explicitly denied from deployment scope.
- Privilege/RLS evidence must keep service-role bypass risk as an operationally remaining consideration; it cannot be marked eliminated.

## Test Coverage Added

The focused spec was expanded with adversarial cases for:

- missing, stale, future, mixed, or malformed collection sessions
- source/category mismatch and caller/manual/environment/self-asserted evidence
- partial, prefix, mismatched, or raw-output-only fingerprints
- structured fingerprint tampering
- Map, Set, function, symbol, cycle, and unsupported nested values
- malformed, alternate, production, whitespace, and case-varied project refs
- raw byte-length mismatch, migration inventory drift, renamed/deleted target migration, and unexpected deployable migrations
- missing/ambiguous catalog evidence, conflicting policies/functions, and missing UUID capability
- missing privilege evidence, broad anon/authenticated grants, and unsafe service-role risk claims
- secret-like keys and values, connection strings, authorization headers, private keys, and personal paths
- API route and Trade UI unwired status

## Static Security Conclusion

The contract is sufficient for a future allowlisted read-only runner implementation gate. It is not sufficient to deploy by itself, and it intentionally cannot gather live evidence or mutate state. A future runner must still be separately implemented and reviewed, must collect only allowlisted read-only evidence, must emit sanitized structured observations, and must stop before deployment.

## Confirmed Non-Events

No live Git evidence collection, Supabase command, SQL command, migration deployment, remote command, staging connection, production connection, remote-state inspection, schema mutation, data write, test row insertion, evidence persistence, readiness artifact consumption, adapter invocation, API/UI/runtime activation, Avanza/browser automation, credential/session/BankID handling, order behavior, settlement retrieval, live trade mutation, or live position mutation occurred.

Decision:

`post_trade_read_only_live_staging_migration_preflight_contract_static_security_review_ready_for_allowlisted_read_only_runner_implementation`

Result:

`post_trade_read_only_live_staging_migration_preflight_contract_static_security_review_completed_no_commands_no_deployment`
