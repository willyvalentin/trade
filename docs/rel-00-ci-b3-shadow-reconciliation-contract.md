# REL-00 CI-B3 — source-only shadow reconciliation receipt

## Bounded objective

CI-B3 adds a pure, unactivated receipt builder for a CI-B2 observation. It
re-reads only CI-B2's immutable scalar binding and one detached raw
`--name-status -z` byte stream, then reparses the fresh bytes through CI-B1.
The resulting receipt remains effective Tier 3 and broad containment in every
case. It does not call Git, invoke a selector, choose tests, serialize raw
bytes, alter a workflow, or make a mergeability decision.

The optional `legacyLabels` input is only a bounded, exact, printable-ASCII
snapshot for later human comparison. It is neither normalized nor matched to a
Draft-selector output. A valid snapshot is explicitly
`captured_non_authoritative_not_comparable`; absent labels are
`not_supplied`. An invalid snapshot yields containment, never a partial
receipt.

## Verified baseline

CI-B2 merged as PR #292 commit
`5ceeb1e52b86d76a8e601096b9fbb979934240e7`, whose tree is
`7f421d3ae6c4d5f3ea4a35ae370e8e71242b8006`. Its Ready Full CI run
`33552767496` and exact-main run `33555929549` passed the unchanged six
shards and strict `provider-free-verification` aggregate. The exact-main
post-merge POC reported `matched`, with no candidate/main mismatch.

CI-B3 neither changes nor relaxes `.github/workflows/milestone-a-ci.yml`,
`scripts/action-660k-run-draft-ci.mjs`, the six Full-CI shard names, the strict
aggregate, required checks, branch protection, concurrency controls, Netlify,
or CI deduplication. It grants no staging, secret, identity, transport,
provider, broker, deployment or production authority.

## Input and containment protocol

The receipt reads these CI-B2 fields exactly once within a guarded access
boundary: contract version, acquired outcome, null reason, canonical
base/expected/merge-base OIDs, byte length, SHA-256 digest, one
`raw_name_status_z` read, and CI-B2's explicit non-authority flags. It does
not inspect CI-B2's parsed `records`; it creates a new byte copy and reparses
it independently using CI-B1.

The B2 contract version must be exactly
`trade.rel00.ci-b2.raw-name-status-acquisition.v1`. The raw stream must be a
nonempty `Uint8Array` of at most 1 MiB whose copied byte length and SHA-256
equal the supplied scalars. CI-B2 must still be Tier 3/broad containment with
all verification, activation, selector, plan and merge-decision flags false.
Getter/Proxy failures, a changed digest or length, malformed bytes, a CI-B1
parse/classification failure, an unexpected CI-B1 containment value, and all
legacy-label validation failures produce a fresh
`broad_containment_required` receipt with no partial binding, parsed data,
labels or raw bytes.

CI-B1's parsed records and classification fields are projected into fresh
plain data. Rename and copy records retain both old and new paths; paths with
newlines or C1 controls are never normalized or collapsed. The returned
receipt has no `raw_name_status_z` or any `Uint8Array` at any depth, is deeply
frozen, and each invocation returns detached nested data.

## Deliberate non-activation

The receipt's reconciliation status is always
`not_comparable_non_authoritative`. It cannot emit a test list, a selector
result, a command, a workflow input, a required-check assessment, a
mergeability decision, or a runtime capability. The module imports CI-B1's
pure parser/classifier rather than CI-B2's Git adapter.

CI-B4 may design required-check and branch-protection proof semantics, but no
workflow, selector, required-check or branch-protection transition is
authorized before separately governed CI-B7. CI-B8 still needs its declared
observation window; the existing Ready/main six-shard Full CI remains
unchanged throughout.
