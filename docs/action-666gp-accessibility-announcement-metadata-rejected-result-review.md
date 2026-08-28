# Action 666GP — Accessibility-announcement metadata rejected-result review

## Decision

Action 666GP independently performs a canonical rejected-result review of
Action 666GM's source-only accessibility-announcement metadata projection.
Every malformed input returns one fresh frozen `invalid_input_shape` result;
every exact closed shape with an unadmitted presentation key returns one fresh
frozen `unsupported_presentation_key` result.

## Rejected-result contract

Each rejected result has exactly seven own data fields:
`contract_version`, `projection_state`, `authority`,
`accessibility_announcement_key`, `rejection_code`, `runtime_wired` and
`side_effects_performed`. Its fixed values declare the existing v1 contract,
`rejected` state, metadata-only non-execution authority, a null announcement
key and both runtime/side-effect flags false. The result is frozen, has no
symbol or accessor property, and carries no caller-controlled input value.

Only `rejection_code` differs between the two rejection classes. The review
exercises primitives, collections, null-prototype, expanded, getter-backed and
descriptor-throwing inputs, verifies each malformed result is fresh, and
compares the two closed rejection classes after normalizing that single code.

## Delivery decision

No implementation change is necessary. This action is a source-only review:
it adds no caller, localized copy, rendered accessibility UI, ARIA binding,
evaluator invocation, data read, provider, secret, transport, database,
writer, route/UI, deployment, broker or execution capability. It changes no
workflow, required check, branch protection, Netlify setting, POC policy or
Full CI deduplication policy; Ready and exact-main six-shard Full CI remain
mandatory.

`ACTION_666GQ` may only independently review the immutability and canonical
shape of Action 666GM's accepted projected results. It may not widen the
closed seven-key vocabulary, add a runtime consumer or render an announcement.
