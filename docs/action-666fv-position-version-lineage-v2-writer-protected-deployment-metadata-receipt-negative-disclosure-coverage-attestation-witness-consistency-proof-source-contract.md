# Action 666FV — Witness-consistency-proof source contract

## Bounded objective

Action 666FV defines only the static source contract required before any future
witness-consistency proof can be considered for admission. It describes the
requirements for a future independent source without choosing, locating,
reading or validating a concrete source artifact.

## Static contract

A future source must be bound to an immutable revision, an integrity digest and
explicit provenance. Its authority must be independent from any future proof
consumer, and its representation must remain value-free and redaction-safe.
The source contract itself is not a source validation, a proof execution or an
automated integrity check.

## Fail-closed boundary

This action performs no source-artifact read, digest calculation, provenance
lookup, provider authentication, deployment/environment/secret metadata read,
transport implementation, database connection, routine or writer invocation.
It does not issue or verify an attestation or receipt. All runtime authority
remains fail-closed.

## Completion and next gate

The source-contract design is complete, but no concrete source is selected or
validated and proof execution remains unadmitted. Action 666FW may define a
static value-free witness-input contract only; it may not select or read a
source, execute a proof or open runtime authority.
