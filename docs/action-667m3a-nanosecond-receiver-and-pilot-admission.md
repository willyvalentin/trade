# Action 667M.3A — Nanosecond Receiver and Pilot Admission

Status: local contract implementation only. No provider request, purchase,
download, real-data normalization, replay, persistence, canonical binding, or
live integration is authorized or performed.

## Versioned contracts

- Receiver:
  `market_context_historical_dataset_nanosecond_receiver_v1`
- M.1 extension:
  `market_context_historical_dataset_nanosecond_extension_v1`
- Receiver canonicalization:
  `market_context_historical_dataset_nanosecond_canonical_json_v1`
- DBN extraction lineage:
  `market_context_databento_dbn_extraction_lineage_v1`
- Pilot admission:
  `market_context_five_session_pilot_admission_v1`
- Pilot policy:
  `market_context_five_session_pilot_policy_2026_07_27_v1`

The receiver is additive. It does not alter the frozen
`market_context_historical_dataset_v1`, the reviewed M.2A implementation, or
the M.2C preparation/binding artifacts.

## Nanosecond receiver

The receiver accepts only a successful M.2C-to-M.1 binding result and explicit
caller-supplied receiver metadata. Observation (`ts_event`) and receive
(`ts_recv`) values remain canonical unsigned UNIX-nanosecond strings. No
conversion through JavaScript `Date` or millisecond numbers occurs in
ordering, coverage, lineage, or digest generation.

The normalized candle rows carry:

- observation, provider-source, and received UNIX nanoseconds;
- the provider product, provider build, and dataset revision;
- lossless raw-record lineage;
- normalized-file and source-DBN identities and SHA-256 values;
- domain coverage with first/last observation, provider-source, and receive
  times;
- immutable upstream, lineage, row, coverage, and receiver digests.

The receiver returns `not_bindable` when provider build, encoder build,
dataset revision, revision evidence, stable tie-break evidence, written
license reference, source-file metadata, or extraction lineage is absent or
invalid. The publisher policy is fixed to publisher `95`, trade action `T`,
allowed flag mask `129`, and empty sale conditions. Unknown actions, flags,
and conditions are rejected by M.2C before receipt; receiver metadata cannot
weaken those rules.

The two-second watermark remains
`empirically_unvalidated`, with `calibrated: false`.

## Exact five-session pilot admission

The contract applies only to:

- dataset/schema: `EQUS.MINI` / `trades`;
- encoding/compression: `dbn` / `zstd`;
- publisher: `95`;
- symbols: `SPY`, `QQQ`, and `XLB`, `XLC`, `XLE`, `XLF`, `XLI`, `XLK`,
  `XLP`, `XLRE`, `XLU`, `XLV`, `XLY`, with their fixed resolved instrument
  IDs;
- interval:
  `[2026-07-20T00:00:00Z, 2026-07-25T00:00:00Z)`;
- adjustment state: `raw_unadjusted`.

The five regular XNYS session boundaries are fixed as immutable UNIX
nanoseconds. All five provider conditions must be exactly `available`;
`degraded`, `pending`, or `missing` fails admission.

Hard caps:

- estimated cost: USD 0.25;
- billable uncompressed bytes: 32 MiB;
- estimated transfer bytes: 32 MiB;
- combined local raw/normalized footprint: 1 GiB.

A quote and entitlement check must be no more than 900 seconds old at
evaluation and must be refreshed immediately before any separately authorized
download. Admission additionally requires explicit provider/encoder/dataset
revision evidence, stable tie-break evidence, written license confirmation,
raw-unadjusted corporate-action status, encrypted destination outside Git,
and complete post-download file lineage and digests.

The contract has two non-authorizing stages. `pre_download` requires an
immutable lineage plan and reports that post-download lineage is still
pending. `post_download_verification` requires the actual source-file sizes
and compressed/uncompressed SHA-256 values plus the combined lineage-manifest
digest. This avoids demanding nonexistent file hashes before acquisition
while ensuring that the full admission cannot pass without them.

Even a satisfied synthetic pre-download or post-download result carries:

- `download_authorized: false`;
- `dataset_acquisition_ready: false`;
- `normalization_authorized: false`;
- `replay_authorized: false`;
- `shadow_only: true`;
- `live_ranking_effect: false`.

## External gates still open

Real pilot admission remains fail-closed until all of the following are
supplied immediately before a separately authorized acquisition:

1. a fresh exact quote and entitlement result for the fixed scope;
2. provider confirmation that all five dates are `available`;
3. written license answers referenced by immutable evidence;
4. actual provider build, DBN encoder build, dataset revision, and stable
   tie-break semantics;
5. publisher-specific action, flag, and sale-condition mapping;
6. an approved immutable XNYS calendar artifact;
7. explicit raw-unadjusted corporate-action limitations;
8. an encrypted destination and storage ceiling attestation;
9. an operator-approved download action.

The synthetic fixtures exercise the contract only. They are not license,
entitlement, quote, calendar, or market-data evidence.
