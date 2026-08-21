# Action 666DF — Canonical Recommendation-Identity Reconciliation

## Decision

Action 666DF closes only the bounded
`action_655g_canonical_recommendation_identity_reconciliation` objective. It
reconciles the default-off, runtime-unwired Action 655G evaluator's
`position_snapshot.recommendation_identity` predicate with the existing Action
664A `canonical_recommendation_identity_v1` grammar. It does not add a route,
worker, queue, client projection, database query, migration, generated-types
refresh, staging apply, production write, provider mutation, broker operation
or production deployment.

The exact predecessor is protected `main` merge
`151b7881819d8ffc8f6a0bfaf11cad165b7c0954`, tree
`06738e1fe2d837e47ffb33d687e1e6e802556631`, with parents
`ddce80b57c9ab21b5210d2aa484271c2da0f60e6` and
`4257b42032aebb46d35c8e6d5db171925e6f0a14`. Its push-triggered exact-main
CI run `32479311239` completed successfully. Action 666DE's lineage contract
remains source-only and grants no backfill authority.

## Exact identity predicate

Action 664A emits only this identity shape:

```text
rec_decision:v1:<encoded source namespace>:<encoded decision id>:<decision epoch milliseconds>
```

Action 655G now accepts an identity only when all of the following hold:

1. the text has exactly five colon-separated segments with fixed
   `rec_decision:v1` prefix/version;
2. both encoded components decode without error;
3. the decoded namespace meets Action 664A's canonical namespace grammar;
4. the decoded decision ID is nonempty, no longer than 240 UTF-16 code units,
   trimmed, NFC and free of control characters;
5. the epoch is one exact safe integer that reconstructs to a valid UTC ISO
   instant; a permitted four-digit Action 664A input whose offset crosses a
   UTC year boundary may reconstruct with an extended UTC year; and
6. re-encoding the decoded values with `encodeURIComponent` and
   `Date.parse(canonicalUtcInstant)` reproduces the supplied identity
   byte-for-byte.

Therefore the former hash-suffix form, unescaped separators, malformed or
lowercase percent escapes, aliases, leading-zero epochs, invalid dates,
whitespace/control text and source or decision substitution all fail closed at
`/position_snapshot/recommendation_identity` before policy resolution or exit
rule evaluation. The evaluator does not derive identity from a ticker,
position, hash, wall clock or caller-provided database data.

## Boundaries that remain closed

This reconciliation keeps the sole 655G runtime export, its local default-off
gate and all private-policy rules unchanged. The only input fixture change is
the canonical Action 664A identity; resulting snapshot, provenance, decision
and result digest vectors are explicitly refrozen. The historic Action 655D.4
contract bytes and all Action 654 paths remain unchanged.

The Action 666DB schema and Action 666DC planning oracles remain bound to their
own historical source revisions. This successor independently binds the current
evaluator, rather than revising their prior observation, catalog, schema target,
SQL authority or evidence.

No migration or backfill has run. Append-only position-version history,
separately reviewed schema migration, isolated staging apply, authorized
production apply, refreshed generated-types provenance, market-observation
provenance, exit-queue design and transactional runtime handoff remain
separate blockers. A Netlify deploy preview is non-production evidence only.
