# Action 661J.5R.4 relation-state runtime contract

This additive `rebuild_v1` successor covers only `non_table` and
`wrong_owner`. It does not modify or promote the R.3A registry, protocol,
runner, evidence, or four-shard aggregate.

Both scenarios target `public.historical_candles`. The frozen migration
resolves that relation and checks `relkind = 'r'` and owner `postgres` before
catalog mutation. A controlled relation-state rejection has SQLSTATE `P0001`
and exact reason:

`Action 661J unexpected target relation state for historical_candles`

`non_table` binds relkind `v`, owner `postgres`, and classification
`controlled_non_table_rejection`. `wrong_owner` binds relkind `r`, owner
`action_661j5_fixture_owner`, and classification
`controlled_wrong_owner_rejection`.

The precondition reference binds the closed policy registry, target
inventory, relation state, observed relkind/owner, terminal SQLSTATE/reason,
and Snapshot V2 contracts. Invalid-state targets have no guarded read;
their rows and data digest are `null`.

Runtime verification order is readiness receipt, runtime identity, baseline,
scenario precondition, pre-snapshot, diagnostic persistence, terminal policy,
post-snapshot, no-transition verification, evidence, record, shard, file,
readback, and idempotent rewrite.

The R.4 aggregate accepts exactly eight verified files: the four historical
R.3A shards plus fresh A/B shards for each new scenario. It compares semantics
per scenario and rejects duplicate, missing, extra, substituted, or
cross-protocol inputs. The historical R.3A aggregate remains a separate
artifact and authority.
