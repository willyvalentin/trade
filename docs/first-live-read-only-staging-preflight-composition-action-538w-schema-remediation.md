# Action 538W - Nested Authority and Resolver Metadata Schema Remediation

## Summary

Action 538W closes the Action 538V nested-authority blocker without activating the composition contract or adding live behavior.

No live resolver call occurred, no filesystem operation occurred, no executable was run, no CLI version was collected, no process was spawned, no shell was used, no credential or environment value was read, no network request occurred, no API/UI/runner/observer/spawn boundary was activated, no Avanza interaction occurred, no order or position behavior changed, and no deployment occurred.

## A538V-H1 Remediation

Resolver metadata is now validated through a closed schema before fixture resolver evidence can be built or accepted by the composition validator.

The only allowed resolver metadata keys are:

- `deviceId`
- `inode`
- `sizeBytes`
- `mode`
- `modifiedTimeMs`

Validation rejects:

- unknown top-level metadata keys
- symbol-keyed additions
- inherited enumerable properties
- `__proto__`, `constructor`, and `prototype` injection attempts
- arrays, null, class instances, exotic prototypes, accessors, functions, and nested objects
- nested authority, permissions, grants, capabilities, access, or privileges structures
- authority-related field names regardless of nesting
- malformed value types
- `NaN`, `Infinity`, and other non-finite numbers
- missing required metadata fields
- alternate semantic aliases such as `fileId`

Invalid metadata fails closed with `resolver_metadata_schema_rejected`.

## A538V-M1 Remediation

The focused suite was expanded from 11 to 13 tests. New tests cover:

- authority flags nested directly in resolver metadata
- authority flags nested inside objects
- nested authority/permissions/grants/capabilities/access/privileges structures
- unknown scalar and array metadata keys
- symbol-keyed metadata additions
- inherited unknown properties
- `__proto__`, `constructor`, and `prototype` injection attempts
- accessor properties
- function/class/exotic metadata shapes
- malformed numeric/string metadata values
- missing required metadata fields
- alternate semantic fields
- fixture builder closure for unknown, nested, and authority-bearing metadata overrides
- emitted metadata immutability
- valid synthetic metadata remaining accepted

## Prototype And Accessor Safety Model

Evidence and resolver metadata records must use an accepted plain-object prototype. Symbol keys, inherited enumerable fields, prototype-pollution keys, accessors, and setters are rejected before schema-specific validation proceeds. The metadata validator uses property descriptors and exact key comparison rather than broad sanitization.

## Fixture Builder Restrictions

`buildResolverEvidenceLink` now distinguishes a missing metadata override from an explicit invalid override. Explicit `metadata: null` and all malformed metadata overrides are rejected instead of defaulted. Fixture convenience APIs no longer accept arbitrary resolver metadata spreads.

## Contract API Change

The export surface remains unchanged except for the additional blocking reason introduced by this remediation:

- `resolver_metadata_schema_rejected`

No live adapter import, server-only import, filesystem primitive, process primitive, credential primitive, network primitive, persistence helper, API/UI/runner wiring, or runtime activation was added.

## Decision

Decision: `post_trade_first_live_read_only_staging_preflight_composition_nested_authority_and_schema_closed_ready_for_final_re_review`

Result status: `post_trade_first_live_read_only_staging_preflight_composition_action_538w_remediation_completed`

Recommended next action: Action 538X - Final Independent Re-Review of First-Live Read-Only Staging Preflight Composition Contract.
