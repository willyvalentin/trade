# Action 666GD — Immutable exit-decision explanation result contract

## Decision

Action 666GD independently reviews the source-only result boundary of Action
666GA/666GC. The projection's returned result is an immutable, closed advisory
value: its outer result object is frozen, its only nested object (the accepted
classification) is frozen, and every other reachable value is a primitive or
`null`.

## Result boundary

Both projected and rejected outcomes have the same fixed eight-key result
shape. Projected outcomes contain a fresh frozen classification projection and
one of the seven fixed Swedish advisory strings. Rejected outcomes contain no
classification and no advisory string. Advisory text is selected solely by the
closed seven-tuple table; no caller-controlled value is interpolated,
preserved, or reflected in it.

The review verifies object freezing, non-writability, result-key closure,
freshness between projections, exact copy for all seven accepted tuples, and
the null-only rejected payload. No implementation change is necessary because
the existing source already provides these properties.

## Delivery decision

This is a source-only review. It creates no evaluator caller and changes no
workflow, required check, branch protection, Netlify configuration or Full CI
deduplication policy. No data, provider, secret, transport, database, writer,
route/UI, broker or execution authority is added. Ready and exact-main
six-shard Full CI remain mandatory.

The next bounded action is `ACTION_666GE`: a source-only rejected-result
canonicality review. It must retain this immutable result boundary and may not
add runtime wiring.
