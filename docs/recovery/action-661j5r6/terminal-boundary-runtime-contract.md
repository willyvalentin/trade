# Action 661J.5R.6 terminal-boundary runtime contract

This additive `rebuild_v1` successor covers only
`duplicate_containment_history` and `unknown_acl_state`. It preserves the
R.3A, R.4, and R.5 protocols, persisted evidence, and aggregates.

The duplicate fixture binds version `20260726000000`, name
`action_661j5r6_duplicate_fixture`, and statement count `1`. It is rejected
with SQLSTATE `P0001` and exact reason:

`Action 661J refuses incident or duplicate containment history`

The closed policy also retains incident version `20260724003000`, but the
positive R.6 runtime fixture uses only the duplicate version.

The ACL fixture binds exactly one unknown table ACL on
`public.historical_candles`: grantee `action_661j5_unknown_acl`, privilege
`SELECT`, grantor `postgres`, and grantable `false`. It is rejected with
SQLSTATE `P0001` and exact reason:

`Action 661J refuses unknown or column ACL state for historical_candles`

`column_acl` is a closed alternative policy case and is not a positive R.6
runtime fixture. The precondition reference binds the exact target relation,
selected ACL state, full ACL identity, closed ACL variants, complete sorted
migration-history inventory and digest, terminal policy, and Snapshot V2
contract.

The carrier verifies all nine pre/post domains, exact history and target ACL
inventories, no target column ACL in the positive fixtures, guarded reads,
runtime identity, diagnostic, policy, registry, reference, and runner
receipt. Diagnostic persistence occurs before terminal policy verification.
Evidence, record, shard, and persisted file each have independent canonical
digests. File writes are atomic, canonical-readback verified, idempotent only
for identical bytes, and collision closed.

The R.6 aggregate accepts exactly sixteen files: the twelve certified
predecessor shards and fresh A/B shards for both R.6 scenarios. Semantic A/B
comparison remains scenario-specific. Cross-scenario, cross-protocol,
duplicate, missing, unexpected, or recomputed unauthorized inputs are
rejected. Earlier four-, eight-, and twelve-shard aggregates remain separate
byte-preserved authorities.
