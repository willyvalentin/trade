# Action 666GE — Canonical rejected exit-explanation result contract

## Decision

Action 666GE independently reviews the two rejection paths of the source-only
Action 666GA exit-decision explanation projection. Every malformed input has
one canonical `invalid_input_shape` result; every exact closed but unmatched
classification has one canonical `unsupported_decision_classification` result.

## Rejection boundary

Both rejection classes return a fresh frozen, fixed eight-key data object. The
contract version, projection state, authority, null classification, null
advisory copy, runtime flag and side-effect flag are identical. Only
`rejection_code` differs. Rejected results carry no input value, nested object,
symbol, accessor or caller-controlled text, so invalid input cannot become an
advisory or execution signal.

The review verifies representative primitive, null, collection and empty-object
inputs, a valid-shaped unmatched tuple, fresh results, descriptor closure,
non-writability and the exact two-code partition. No implementation change is
necessary because `invalidResult` already constructs that closed value.

## Delivery decision

This is a source-only review. It creates no evaluator caller and changes no
workflow, required check, branch protection, Netlify configuration or Full CI
deduplication policy. No data, provider, secret, transport, database, writer,
route/UI, broker or execution authority is added. Ready and exact-main
six-shard Full CI remain mandatory.

The next bounded action is `ACTION_666GF`: a source-only accepted-versus-
rejected partition review for this same contract. It must preserve canonical
rejections and may not add runtime wiring.
