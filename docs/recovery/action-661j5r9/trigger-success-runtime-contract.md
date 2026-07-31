# Action 661J.5R.9 trigger rejection and successful containment

This additive `rebuild_v1` contract certifies the final two runtime fixtures. It
does not alter any R.3A-R.8 carrier, result file, aggregate, collector, or
migration byte.

## Authority order

Verification is closed and ordered:

1. select the implemented scenario from the R.9 runtime registry;
2. verify the R.9 policy registry and scenario precondition reference;
3. verify the pinned runner module receipt and PostgreSQL runtime identity;
4. verify the complete Snapshot V2 prestate and guarded-read inventory;
5. persist the terminal diagnostic receipt;
6. verify the scenario-specific terminal and transition contract;
7. build and independently verify evidence, record, shard, and canonical file;
8. verify the exact 28-shard inventory and per-scenario A/B semantics.

## Pre-existing trigger rejection

`preexisting_proof_audit_trigger` installs one non-internal trigger on
`public.bounded_shadow_collector_proof_audits`, with name
`action_661j5r9_preexisting_proof_audit_fixture`, function
`action_650_reject_execution_audit_mutation()`, enabled state `O`, and trigger
type `27`. The frozen migration must terminate with SQLSTATE `P0001` and:

`Action 661J refuses pre-existing proof-audit trigger state`

All nine domains must be byte-equivalent pre/post. Its atomicity decision is
`no_transition_verified`.

## Successful containment

`successful_containment` begins from the exact clean baseline and commits the
frozen migration exactly once. The local migration-history adapter then records
version `20260726000000`, name
`contain_continuous_intelligence_data_access`, and statement count `1`.

The closed transition permits only:

- eight pinned RPCs becoming security-definer with
  `search_path=pg_catalog, public, extensions`;
- the exact service-role table privileges declared by the migration;
- trigger `action_661j_proof_audit_append_only`;
- the single canonical migration-history row.

Schema relation inventory, target rows, RLS policy inventory, column ACLs, and
function bodies remain identical. Existing RLS flags are already enabled and
must remain unchanged. No policy or column ACL may appear. This carrier binds
`migration_applied:true`, `terminal_state:completed`, and
`atomicity_decision:closed_transition_verified`; it cannot be relabelled as a
failure/no-transition carrier.

## Canonical and compatibility boundary

Every object uses a closed field inventory and SHA-256 over canonical JSON,
excluding only its own digest field. Run and shard identities remain signed in
record/shard/file layers and are excluded only by the aggregate's explicit
per-scenario semantic projection. Runtime readiness receipts remain outside
the semantic evidence.

The R.9 aggregate verifies each predecessor file with its own historical
verifier and accepts exactly 28 shards: two runs for each of 14 scenarios.
There is no cross-version promotion. The prior 4-, 8-, 12-, 16-, 20-, and
24-shard aggregates remain historical immutable evidence.
