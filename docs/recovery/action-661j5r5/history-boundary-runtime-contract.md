# Action 661J.5R.5 migration-history boundary runtime contract

This additive `rebuild_v1` successor covers only
`missing_action_650_history` and `incident_history_present`. It does not
modify or promote the R.3A or R.4 registries, protocols, runners, persisted
evidence, or aggregates.

The frozen migration evaluates the exact Action 650 history row before the
closed incident/duplicate set. The required predecessor is version
`20260724002000`, name `contain_production_trading_data_access`, and statement
count `6`. Its absence is a controlled `P0001` rejection with exact reason:

`Action 661J requires exact Action 650 history`

The incident policy binds the closed versions `20260724003000` and
`20260726000000`. Positive A/B runtime certification selects only
`20260724003000`; the alternative duplicate version remains a negative policy
case. The controlled rejection has SQLSTATE `P0001` and exact reason:

`Action 661J refuses incident or duplicate containment history`

Each precondition reference binds the complete sorted migration-history
inventory and its digest, the exact required predecessor identity, the closed
incident set, the selected positive incident row where applicable, and the
terminal SQLSTATE/reason. Caller-supplied history authority is not accepted.

The result protocol verifies the complete Snapshot V2 prestate and poststate,
all nine domain digests, exact migration-history inventory, guarded reads,
runtime identity, diagnostic sidecar, policy/registry/reference authorities,
and runner receipt before constructing evidence, record, shard, and persisted
file. All four layers have separate canonical digests. Persistence uses an
atomic temporary write and rename, verifies canonical readback, permits only
an identical idempotent rewrite, and rejects an existing different file.

Runtime verification order is readiness receipt, PostgreSQL runtime identity,
baseline, scenario precondition, pre-snapshot, one migration attempt,
diagnostic persistence, terminal policy comparison, post-snapshot,
no-transition verification, evidence, record, shard, file, readback, and
idempotent rewrite. A terminal mismatch is not retried.

The R.5 aggregate accepts exactly twelve verified files: four historical R.3A
files, four R.4 relation-state files, and four fresh R.5 history-boundary
files. Semantic A/B comparison is performed separately for all six scenarios.
Missing, duplicate, extra, relabelled, cross-protocol, or digest-substituted
inputs fail closed. The earlier four- and eight-shard aggregates remain
independent byte-preserved artifacts.
