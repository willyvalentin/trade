# Action 661J.5R.7 column ACL and policy runtime contract

This additive `rebuild_v1` successor certifies `column_acl_state` and
`policy_state`. It does not alter the R.3A, R.4, R.5, R.6, or R.6A protocols,
collectors, files, or aggregates.

## Authority and verification order

1. Verify the frozen baseline manifest, migration bytes, image identity,
   readiness policy, predecessor reports, predecessor aggregate, and all
   sixteen predecessor result-file hashes.
2. Select the scenario through the closed R7 runtime registry.
3. Capture runtime identity with the read-only R7 collector successor.
4. Establish exactly one declared precondition.
5. Capture the complete nine-domain prestate.
6. Attempt the frozen migration once and persist its sanitized diagnostic.
7. Compare the diagnostic with the scenario policy.
8. Capture the complete poststate and prove canonical pre/post identity.
9. Verify the closed precondition reference and build evidence, record, shard,
   and persisted file.
10. Read back protocol bytes, prove idempotency, and build the exact
    twenty-shard aggregate.

The column-ACL fixture pins `public.historical_candles.ticker` at `attnum=3`,
grantee `action_661j5_column_acl`, grantor `postgres`, privilege `SELECT`, and
`grantable=false`. The entire table- and column-ACL domains remain signed.
Only owner ACL rows materialized by PostgreSQL are excluded from the exact
offending column subset; every non-owner target-column row is compared against
the closed one-row precondition. Additional grants therefore fail closed.

The policy fixture pins one permissive `SELECT` policy named
`action_661j5r7_policy_fixture`, role `action_661j5_policy_role`, `using=true`,
and `with_check=null` on `public.historical_candles`. The complete policy domain
is signed and the exact target-policy subset is verified.

The collector successor is metadata-first and read-only. It adds `attnum` and
`grantor` to column ACL observations and uses the explicit `with_check` policy
field. The predecessor collector remains byte-identical.
