# Action 661J.5R.8 RPC and append-only runtime contract

This additive `rebuild_v1` successor certifies `rpc_catalog_body_drift` and
`incompatible_append_only_function`. It does not alter any R.3A through R.7
protocol, collector, result file, or aggregate.

## Authority and verification order

1. Verify frozen baseline and migration bytes, image identity, readiness
   policy, predecessor reports, the R7 aggregate, and predecessor result files.
2. Select the scenario through the closed R8 runtime registry.
3. Capture runtime identity with the read-only R8 collector successor.
4. Establish exactly one declared RPC or append-only precondition.
5. Capture all nine Snapshot V2 domains, including complete RPC and function
   catalogs.
6. Attempt the frozen migration once and persist its sanitized diagnostic
   before policy comparison.
7. Require the exact scenario SQLSTATE and reason.
8. Capture poststate and prove canonical pre/post identity.
9. Verify the closed precondition reference, runner identity, evidence,
   record, shard, and persisted file.
10. Independently read back bytes, prove idempotency and collision rejection,
    and build the exact 24-shard aggregate.

## RPC body drift

The selected migration signature is
`public.claim_continuous_intelligence_shadow_canary(text,text,text,date,smallint)`.
Its owner, language, function kind, return type, security mode, volatility,
strictness, parallel mode, `proconfig`, overload count, four role privileges,
and body SHA-256 are closed policy fields. The fixture appends one fixed
comment to `pg_proc.prosrc`; the resulting body digest is
`27d866c0507ae5f56b0b11c8d32463a0e47dd459395fbe24313588e793870f12`.
All eight migration RPC identities are compared with the policy inventory, and
the complete public RPC/function domains remain signed.

The exact terminal is SQLSTATE `P0001` and:

`Action 661J refuses RPC catalog/body drift: public.claim_continuous_intelligence_shadow_canary(text,text,text,date,smallint)`

## Append-only authority

The canonical function is
`public.action_650_reject_execution_audit_mutation()`. The fixture changes only
its `proconfig` from `search_path=pg_catalog` to `search_path=public`; all other
catalog and privilege fields remain pinned. The complete catalog domains remain
signed.

The exact terminal is SQLSTATE `P0001` and:

`Action 661J refuses incompatible canonical append-only function`

## Compatibility and persistence

The R8 collector adds body digest, overload count, role privileges, and explicit
`proconfig` to each RPC observation. R7 and earlier collectors remain
byte-identical. The R8 protocol is not promoted into predecessor protocols.
The aggregate accepts exactly two runs for each of twelve scenarios and
verifies each file with its native predecessor verifier before semantic A/B
comparison.
