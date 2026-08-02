# Action 667M.1 — Historical Dataset Contract and Offline Normalization

## Decision

`market_context_historical_dataset_v1` defines the exact offline input
boundary required before a real dataset may be considered by
`market_context_shadow_replay_v1`.

This Action uses repository-generated synthetic fixtures only. It performs no
provider request, download, database read, capture, persistence, replay,
canonical binding, or live integration.

## Versioned contracts

- Dataset: `market_context_historical_dataset_v1`
- Normalizer: `market_context_historical_dataset_normalizer_v1`
- Canonical JSON: `market_context_historical_dataset_canonical_json_v1`
- Synthetic fixtures:
  `market_context_historical_dataset_synthetic_fixtures_v1`
- Acquisition specification:
  `market_context_historical_dataset_acquisition_spec_v1`

## Dataset manifest

The source manifest must declare:

- immutable dataset identity and version;
- provider/source and documented provenance;
- documented rights permitting internal research and offline replay;
- acquisition explicit instant and method;
- exact explicit raw-file IDs, sizes, media types, SHA-256 values, and one
  immutable raw bundle digest;
- normalizer version;
- explicit UTC-date range;
- decision ticker universe;
- SPY and QQQ benchmark universe;
- a named breadth source and constituent universe;
- a complete named sector/industry benchmark universe;
- one candle interval;
- exchange timezone and session/calendar policy;
- observation, provider-source, and received-time policy;
- split, dividend, and adjustment-state policy;
- expected rows, coverage minima, missingness, duplicate, and ordering policy;
- point-in-time/leakage attestation;
- sensitive-identifier reject policy and sanitization attestation.

The admitted output manifest adds:

- immutable normalized digest; and
- raw-file-to-normalized-row lineage counts.

Every normalized row also carries its raw file ID, source line, and raw-line
SHA-256.

## Explicit file boundary

The normalizer accepts only:

1. one explicit manifest file path; and
2. an exact list of `{ file_id, path }` mappings matching the manifest.

It does not discover files, expand globs, scan directories, fetch URLs, read
environment credentials, or contact a provider. A missing, extra, duplicate,
non-file, unreadable, size-mismatched, or digest-mismatched input fails closed.

Input data is newline-delimited JSON. The normalizer reads each raw file,
fingerprints its exact bytes, parses rows, and reads it again to verify the
bytes did not change. It never writes a source file.

## Canonical normalized rows

Rows are bound to a decision ID, ticker, and explicit decision instant.
Observation, provider-source, and received timestamps are canonicalized with
`market_context_explicit_instant_parser_v1`.

Candle rows support benchmark, sector, and industry domains and require:

- declared symbol/context identity;
- interval;
- finite OHLCV with valid high/low geometry and non-negative volume;
- the manifest's adjustment state.

Breadth rows require:

- the declared breadth source;
- expected and observed constituents;
- advancing fraction;
- above-short-average fraction.

Rows are deterministically sorted by decision instant, decision identity,
ticker, domain, context, symbol, observation instant, and stable JSON.
Object keys are recursively sorted for canonical serialization.

## Admission behavior

Admission fails closed when:

- provenance or usage rights are unknown;
- SPY, QQQ, breadth, or any declared context is absent for a decision;
- coverage falls below a declared minimum;
- timestamps are naive, malformed, or outside the declared date range;
- an observation, provider-source timestamp, or received timestamp is after
  the decision instant;
- provider source time is absent;
- received time is absent without the exact declared absence policy/reason;
- corporate-action policy is incomplete;
- OHLCV is non-finite or geometrically invalid;
- duplicates exist;
- a raw size/hash or bundle digest differs;
- production run/request/trace/account/user/job identifiers, UUID-like
  operational values, credentials, secrets, or unknown row fields are found.

Out-of-order rows are counted, then sorted, because the fixed policy is
`sort_and_report`. Gaps and missing intervals are counted and remain explicit.
No fill-forward is performed.

## Digest boundary

The immutable raw digest is SHA-256 over canonical JSON of the sorted raw-file
descriptors. Each descriptor binds file ID, media type, byte length, and raw
SHA-256.

The immutable normalized digest is SHA-256 over canonical JSON containing the
validated source manifest, sorted raw descriptors, raw-to-normalized lineage,
and canonical normalized rows. The digest excludes only itself.

No replay output or performance metric is created.

## Synthetic fixture matrix

The fourteen local fixtures cover:

1. complete admissible dataset;
2. explicitly documented received-time absence;
3. a reported gap without fill-forward;
4. missing QQQ;
5. missing breadth;
6. incomplete sector universe;
7. unknown license;
8. missing provider/received time;
9. naive timestamp;
10. future observation/provider/received leakage;
11. duplicate and out-of-order rows;
12. missing corporate-action policy;
13. production identifier;
14. tampered raw digest.

Separate tests prove repeated-call and explicit-file-map-order determinism,
raw-byte immutability, and byte-identical output under UTC,
Europe/Stockholm, and America/New_York.

## Acquisition specification

The machine-readable future acquisition specification is:

`docs/evidence/action-667m1-market-context-historical-dataset-acquisition-spec.json`

Date range, interval, ticker universe, context universe, breadth source,
provider product, license basis, acquisition method, and cost approval remain
operator parameters. Row volume is expressed only as a parameterized formula;
there is no fixed volume, price, cost, or purchase claim.

## Existing AAPL capture

`docs/first-tiny-historical-candle-corrected-filtered-ohlcv-payload.json`
remains byte-identical and inadmissible. It is not imported, normalized, or
used as replay evidence because it lacks the required market-context universe,
provider/received timestamps, license evidence, and point-in-time proof and
contains an operational production identifier.

## Next gate

Recommended next Action:
**667M.2 — Operator-Approved Historical Dataset Source, License, Cost, and
Acquisition Gate**.

M.2 must select an exact source/product, establish written usage rights,
parameterize the desired range/universe/interval, estimate row volume, freeze
a cost ceiling, and approve exact destination paths before any acquisition.
It must not imply replay approval.
