# Action 666AX — Frozen Improvement Binding Snapshot and Read-Only Store

## Scope

Action 666AX defines an inactive, server-only and fixture-only contract for
the two lookup boundaries already consumed by Actions 666AJ, 666AC and
666AQ. It does not introduce a writer, database table, provider, real
snapshot, live consumer or persistence path.

The normative contract versions are:

```text
canonical_improvement_binding_snapshot_v1
canonical_improvement_binding_entry_v1
canonical_improvement_binding_store_v1
canonical_improvement_binding_snapshot_authority_v1
canonical_improvement_binding_owner_boundary_v1
canonical_improvement_binding_lookup_result_v1
```

## Snapshot contract

A snapshot binds its stable identity, external owner identity, positive
publication sequence and epoch, predecessor state, publication/effective
instants, sorted closed entry inventory, expected external trust root and
canonical digest.

The first snapshot must be sequence/epoch `1/1` with an explicit `genesis`
predecessor. A later snapshot must link the immediately preceding sequence,
an earlier epoch and a full predecessor digest. The owner authority pins the
expected snapshot identity, bytes, owner, sequence, epoch, predecessor and
external root. Supplying an older snapshot under a newer authority therefore
fails closed.

All stored instants use explicit UTC with nine fractional digits. Inputs with
explicit offsets are converted through the project's strict nanosecond
instant parser. Equivalent offsets produce identical canonical bytes. Naive,
malformed or unsupported instants are rejected.

## Entry contract

The inventory is closed to:

```text
previous_binding
capture_binding
```

`previous_binding` is further identified as a proposal or experiment
binding; `capture_binding` is identified as a capture binding. Every entry
binds:

- a canonical entry identity and lookup key;
- its proposal, experiment or capture identity;
- the observed semantic binding digest;
- the literal verified state;
- a type-compatible source evidence namespace and digest;
- its effective instant;
- its canonical entry digest.

Unknown types, duplicate entry identities, duplicate typed lookup keys,
conflicting bytes and cross-type reuse of one bound identity invalidate the
entire snapshot. The store never repairs or deduplicates the inventory.

## External authority boundary

Lookup requests contain only the lookup identity/type and `as_of`. Closed
request schemas reject any additional field, including a caller-provided
snapshot root, trusted payload, observed status/digest or owner approval.

The expected authority and snapshot are read from a separate
`canonical_improvement_binding_owner_boundary_v1` dependency. The authority
identity and digest are separately pinned as immutable owner-boundary values;
the returned authority cannot authenticate itself by merely recomputing its
public digest. Those pins are checked before the snapshot reader can run.
The authority digest and snapshot digest are then independently recomputed
before any entry is visible. The capture/replay caller receives only the read
adapters and cannot replace the owner dependency through an AJ/AC/AQ request.

This fixture implementation demonstrates the boundary. A future real owner
must provide the authority and verified immutable snapshot from a separately
governed source; Action 666AX does not create that source.

## Read-only store

The public store exposes only:

```text
lookup_previous_binding
lookup_capture_binding
```

Results are closed to:

```text
found
absent
conflicting
not_effective
invalid_snapshot
```

Each result binds the canonical lookup identity, canonicalized `as_of`,
observed snapshot identity/digest and epoch, matching entry identity/digest,
observed semantic digest, reason-code inventory and result digest.

The compatibility adapters expose exactly the existing methods:

```text
lookup_proposal_binding
lookup_experiment_binding
lookup_capture_binding
```

`found` becomes the existing `{ semantic_digest }` value, `absent` becomes
`null`, and every fail-closed status becomes a sanitized exception that the
existing AJ/AC/AQ boundaries already classify. No write, append, update,
delete, approval, rotation, promotion or persistence method exists.

## Point-in-time behavior

A lookup can observe an entry only when:

- the owner-pinned snapshot is structurally and cryptographically valid;
- `as_of` is an explicit supported instant;
- the snapshot was both published and effective by `as_of`;
- the entry was effective by `as_of`.

A future snapshot or entry returns `not_effective`. Authority/root drift,
rollback, invalid predecessor state or a malformed inventory returns
`invalid_snapshot`.

## Default-off boundary

The factory defaults to:

```text
enabled: false
kill_switch_engaged: true
```

Both gates return before reading the owner dependency. Disabled and
kill-switch tests observe zero request reads, snapshot reads, clones,
authority lookups, entry lookups, digest operations and AJ/AC/AQ executions.

On the current-main rebuild, activation requires the two literal values
`enabled:true` and `kill_switch_engaged:false`. Active option, counter and
owner-dependency shells use exact enumerable data properties. Hidden keys,
symbols, accessors, proxies and malformed values fail closed. Owner methods,
authority bytes, snapshot bytes, lookup methods and `as_of` are captured at
construction, and optional caller counters are never mutated.

Snapshot and lookup inputs are recursively checked before clone or nested
access. Cycles, non-plain objects, accessors, symbols, proxies, sparse arrays,
extra array keys and non-finite numbers cannot become store authority.
After authority bytes are cloned, their complete semantic and cryptographic
contract is validated before the snapshot reader can run. Any authority
version, digest, identity, owner/root, sequence, epoch or predecessor drift
therefore observes zero snapshot reads and zero snapshot clones. Expected
owner and snapshot identities must be canonically typed, formatted and bound;
self-consistent rehashing cannot legitimize malformed identity values.
Every digest, root and pin is accepted only as an actual full-hash string;
implicit regular-expression coercion of arrays, objects, numbers or null is
forbidden across builders and trust-path validation.
Predecessor and entry schemas remain exact even if an attacker recomputes all
public digests. Malformed lookups return a canonical conflict and never expose
an exception, backend message or stack.

## Synthetic interop evidence

Frozen fixture-only evidence verifies:

- absent first capture;
- matching and conflicting previous binding;
- matching and conflicting capture binding;
- external-root substitution and rollback rejection;
- future snapshot, duplicate inventory and cross-type collision rejection;
- AJ `captured`;
- AC `mapped`;
- AQ deterministic `completed / proposal_ready`.

The golden report is synthetic contract evidence. It contains no real Ture
performance and is not publishable.

All outputs retain:

```text
shadow_only: true
live_ranking_effect: false
automatic_training_allowed: false
automatic_change_allowed: false
automatic_promotion_allowed: false
external_ai_canonical_truth_authority: false
synthetic_evidence: true
not_publishable: true
```
