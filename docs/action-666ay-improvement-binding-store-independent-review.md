# Action 666AY — Improvement Binding Store Independent Review

## Review identity

- Review contract: `action_666ay_independent_review_v1`
- Review date: `2026-07-29`
- Branch: `codex/action-666ax-frozen-improvement-binding-store`
- Base/HEAD: `3f61c4c8a9f2215e687a94c0744f925117580286`
- Normative artifact count: `5`
- Normative digest:
  `e0e2e623c999cd6844d01e6553ab83bf512f4bdd15849822d176fba3b578057e`
- Review mode: clean-room and read-only against the frozen normative bytes
- Remediation performed: none

The freeze manifest, this report and the machine-readable threat/finding
matrix are self-excluded from the normative five-artifact digest.

## Binary decisions

```text
action_666ay_binding_store_foundation_frozen: true
action_666ay_external_authority_verified: true
action_666ay_read_only_boundary_verified: true
action_666ay_point_in_time_rollback_verified: true
action_666ay_interop_verified: true
action_666ay_independent_review_approved: true
action_666ay_local_checkpoint_ready: true
```

## Finding counts

```text
blocker: 0
major: 0
minor: 0
nit: 0
```

No finding was changed or remediated during this review.

## Snapshot and external-authority review

The owner boundary is versioned separately from lookup requests. The public
request schemas accept only the canonical identity/type and `as_of`; an
extra snapshot root, payload, status, observed digest or owner approval is
classified as `lookup_request_schema_invalid`.

The owner-controlled dependency supplies the expected authority and verified
snapshot independently of AJ/AC/AQ request bytes. Authority validation binds
the boundary identity, authority identity/digest, expected snapshot
identity/digest, owner identity, sequence, epoch, predecessor digest and
external trust root. Snapshot validation independently rebuilds the entry
inventory and complete snapshot digest before any entry can return `found`.

A caller-side self-consistent replacement cannot cross this boundary because
the caller has no authority or snapshot field. Replacing owner dependency
bytes would be a replacement of the explicitly trusted external dependency,
not a request capability. A future real integration must therefore preserve
separate ownership of that dependency; Action 666AX deliberately introduces
no operational snapshot source.

## Read-only boundary review

The store exposes only:

```text
lookup_previous_binding
lookup_capture_binding
```

The compatibility adapters expose only:

```text
lookup_proposal_binding
lookup_experiment_binding
lookup_capture_binding
```

No writer, insert, append, update, delete, approval, rotation, promotion or
persistence operation exists. The implementation has no filesystem,
provider, network or database import. It is marked `server-only` and no live
route, page, component or other live consumer imports it.

Lookup results cryptographically bind the observed snapshot identity/digest,
publication sequence/epoch, owner boundary, authority identity/digest,
expected external root, matching entry identity/digest, observed semantic
binding digest, status and sorted reason inventory. Invalid and
not-yet-effective observations remain forensic evidence but never become a
`found` adapter value.

## Point-in-time and rollback review

All snapshot, entry and lookup instants pass through the project's strict
explicit-instant parser. Canonical output uses UTC and exactly nine
fractional digits. Offset-equivalent timestamps therefore produce identical
bytes; naive and malformed values fail closed. Comparisons use epoch
nanoseconds, preserving exact boundary order.

A snapshot or entry published/effective after `as_of` returns
`not_effective`. A future entry's identity may be retained in the forensic
result digest so distinct rejected observations remain distinguishable, but
the compatibility adapter throws a sanitized status and never exposes it as
a semantic binding.

Genesis is deterministic at sequence/epoch `1/1` with null predecessor
fields. Later snapshots require the immediately preceding sequence, an
earlier publication epoch and a full predecessor digest. The authority pins
the expected current sequence, epoch and snapshot bytes, so an older
snapshot cannot replace the current chain.

Unknown entry types, source-namespace mismatches, duplicate entry identities,
duplicate typed keys, conflicting bytes and cross-type identity reuse
invalidate the complete snapshot. No repair or implicit deduplication is
performed.

## AJ/AC/AQ interoperability review

The synthetic interop exercises the unchanged canonical consumers:

- AJ returns `captured` for absent, matching previous and matching capture
  observations, and returns explicit semantic conflicts for mismatches.
- AC consumes the same adapters and returns deterministic `mapped`.
- AQ completes as `proposal_ready` and independently rebuilds the complete
  capture, adapter and proposal chain.

The adapters translate only `found` to `{ semantic_digest }` and `absent` to
`null`; `conflicting`, `not_effective` and `invalid_snapshot` are sanitized
fail-closed exceptions. AJ/AC/AQ retain their existing lookup-observation and
terminal rebuild verification. They accept no caller-provided verified,
complete, mapped or proposal-ready flags.

Distinct collision bytes alter the entry digest, inventory digest, snapshot
digest and lookup result digest. Previous-binding and capture-binding
collisions also remain separate namespaces and therefore cannot collapse
into one forensic identity.

## Default-off and safety review

The factory defaults to `enabled:false` with the kill switch engaged. Both
disabled states return before the owner dependency getter. Instrumented
counters remain zero for request reads, snapshot reads, authority lookups,
clones, entry lookups, digest operations and AJ/AC/AQ executions.

Every applicable harness, store and terminal lookup result carries:

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

The golden report additionally declares
`evidence_classification:synthetic_fixture_only`,
`performance_claimed:false` and `publishable:false`. It cannot be interpreted
as actual Ture performance evidence.

## Regression evidence

The disposable clean-room checkout used exact base
`3f61c4c8a9f2215e687a94c0744f925117580286`, copied only the five normative
bytes and installed 371 packages with `npm ci --ignore-scripts`.

- Focused Action 666AX: `15/15`
- Relevant Action 665/666: `277/277`
- Action 664 foundation: `163/163`
- Separate PostgreSQL matrix: `13/13`
- TypeScript: passed
- Scoped ESLint: passed with zero warnings
- JSON parity: passed
- Production build: passed
- `git diff --check`: passed
- Untracked whitespace: passed
- Liveimport, writer, persistence, provider, DB, migration, dependency,
  lockfile, environment and secret scans: passed
- Clean-room checkout removed after review: yes

Only the disposable PostgreSQL tests accessed local Docker. The matrix
reported `production_interaction:false` and
`external_database_interaction:false`.

## Digest parity

The canonical normative digest was independently recomputed:

```text
pre-regression:
e0e2e623c999cd6844d01e6553ab83bf512f4bdd15849822d176fba3b578057e

post-regression:
e0e2e623c999cd6844d01e6553ab83bf512f4bdd15849822d176fba3b578057e

post-review:
e0e2e623c999cd6844d01e6553ab83bf512f4bdd15849822d176fba3b578057e
```

## Canonical review-evidence digest

Algorithm:
`sha256_over_recursively_key_sorted_json_utf8_v1`.

The digest covers the versioned `review_evidence_projection` in the
machine-readable threat/finding matrix, including base SHA, normative digest,
finding counts, regression evidence and all binary decisions:

```text
fdab04e4c5452fb387154b7f753ae4c758be765ba83cf4810b2a7a54eea7674e
```
