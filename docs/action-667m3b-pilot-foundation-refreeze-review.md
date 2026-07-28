# Action 667M.3B — Pilot Foundation Re-freeze and Independent Review

## Decisions

- `action_667m3b_pilot_foundation_frozen: true`
- `action_667m3b_test_portability_verified: true`
- `action_667m3b_independent_review_approved: true`
- `action_667m3b_local_checkpoint_ready: true`
- `action_667m4_dataset_acquisition_ready: false`

Local checkpoint readiness covers only the repository artifacts. It does not
authorize provider contact, quote refresh, purchase, download, normalization,
replay, persistence, canonical binding, or live integration.

## Freeze model

The current-state manifest freezes every relevant Action 667K–667M.3A
artifact plus the two minimally revised historical freeze tests and this
review. Every non-manifest artifact has an exact path, semantic version,
SHA-256, Git status at freeze, classification, and predecessor lineage.

The manifest classifies artifacts as:

- `current_normative`;
- `superseded_but_retained`;
- `historical_review_evidence`;
- `fixture_test`;
- `documentation`;
- `acquisition_blocking_external_evidence`.

The manifest excludes only its own bytes from the artifact digest to avoid a
self-referential hash. Its own SHA-256 is reported after generation.

The M.2A/v1 implementation freeze remains
`28b5ef0a42023605d299671c05d926e4fbf7e129f421f4feed02a6c6b02f9370`.
The M.2C/v2 implementation freeze remains
`f5b3ad14fb10fb8fd7fed6547f521f430d8b30895bccb5b684db457160e2de4f`.
All implementation artifacts listed by those manifests were rehashed from
disk and matched byte-for-byte.

## Test portability remediation

The Action 667C and 667E manifests correctly preserve that their artifacts
were untracked at their historical freeze points. Their tests previously
treated that provenance value as a permanent current-worktree requirement.
After the reviewed PR was committed, unchanged tracked files therefore caused
false failures.

The two tests now:

1. assert the historical manifest status remains exactly `untracked`;
2. continue to verify historical hashes and aggregate digests;
3. accept only a hash-matching current artifact that is:
   - untracked before staging;
   - staged as an intended addition or the exact portable test revision; or
   - clean and tracked after commit;
4. reject unstaged modifications, deletions, renames, conflicts, and other
   status forms;
5. rely on the new current-state manifest for the two portable test revisions;
6. retain exact path and unexpected-file inventory checks.

No market-context classification, threshold, replay, preparation, candle,
admission, or ranking logic changed.

## Independent review

### Approved local properties

- `ts_event` and `ts_recv` remain canonical UNIX-nanosecond strings.
- Raw trade lineage retains event time, receive time, source record identity,
  sequence/tie-break identity, normalized-file identity, DBN-file identity,
  and compressed/uncompressed SHA-256.
- M.2C preparation and the additive M.1 receiver reject missing or conflicting
  stable tie-break evidence.
- Point-in-time checks reject future event/receive values and only finalize
  observable buckets.
- Pilot admission is explicitly two-stage: pre-download requirements and
  post-download file-lineage verification.
- Cost, billable-byte, transfer-byte, and local-storage ceilings are hard
  fail-closed boundaries.
- Every pilot day must be `available`; degraded, pending, or missing days are
  rejected.
- Provider build, encoder build, dataset revision, evidence references, and
  immutable XNYS calendar boundaries are mandatory.
- Unknown actions, flags, and sale conditions are rejected.
- Corporate-action state is explicit `raw_unadjusted`, with no inferred
  adjustment.
- Written license evidence is mandatory.
- The two-second watermark remains visibly
  `empirically_unvalidated` and `calibrated: false`.
- No credential, provider client, database, capture, persistence, canonical,
  replay-runtime, or live consumer import was introduced.

### Findings

Blocker: 0. Major: 0. Minor: 3. Nit: 0.

- `M3B-001` — The two-second watermark still needs empirical validation using
  separately authorized real evidence.
- `M3B-002` — Publisher-specific action, flag, sale-condition, and stable
  tie-break semantics still require written/provider evidence.
- `M3B-003` — DBN decoder/build provenance and post-download source-file
  digests can only be completed after a separately authorized acquisition.

These findings do not block a local source checkpoint. They do block dataset
acquisition and any claim of real-data readiness.

## Exact external license responses still required

Written provider confirmation must identify the governing agreement version,
effective date, and supporting sections for:

1. local raw DBN retention and retention duration;
2. encrypted local backup rights, deletion rules, access controls, and
   geography restrictions;
3. private internal non-display research;
4. deterministic derived one-minute OHLCV candles and their retention;
5. retention of derived coverage, quality, classification, and digest
   evidence;
6. deterministic offline replay;
7. raw, backup, derived-data, and evidence deletion obligations after account
   cancellation or closure;
8. audit-log and attestation obligations and retention period;
9. named-user versus internal-team scope and any additional fees;
10. redistribution restrictions for raw records, derived candles, and
    non-reconstructable evidence;
11. corporate-action entitlement, applicable product, usage rights, and
    price;
12. repeated-download and redownload charging;
13. exchange, license, tax, storage, or other additional fees.

Until those responses and all fresh quote, entitlement, calendar, revision,
storage, and provenance evidence exist,
`action_667m4_dataset_acquisition_ready` remains `false`.
