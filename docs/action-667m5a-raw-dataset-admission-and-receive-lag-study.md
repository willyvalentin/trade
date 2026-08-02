# Action 667M.5A — Raw dataset admission and receive-lag study

The five M.4C files were decoded read-only with `databento-dbn 0.63.0`
and DBN library version 3. The native decoder build, Python runtime, DBN
metadata version, file digests, calendar, symbology mappings, and analysis
policy are explicitly bound in the machine-readable report.

No credential was loaded and no provider endpoint was contacted. No candle
was created, no historical replay ran, and no raw record was written to the
repository.

## Raw admission

The support total reconciled exactly: 516,162 decoded records across five
files, five session dates, thirteen mapped symbols, and publisher ID 95.
All records have action `T`. Flags are only `0` or `LAST`; there are no
unknown flag bits, publisher-specific flags, bad-receive-timestamp flags,
undefined timestamps, invalid price/size sentinels, or negative receive
lags.

Provider sequence is zero for every record. The versioned fallback identity
`source_file_sha256 + zero_based_record_ordinal` produced 516,162 unique
identities with zero collisions.

The source ordering contains 2,700 adjacent event-time inversions, including
983 within-symbol inversions, while receive time has zero adjacent
inversions. There are 692 byte-identical record duplicates. These facts are
preserved as raw-quality evidence and are not silently reordered or
deduplicated.

The request covers full UTC days. The authoritative XNYS core-session check
classifies 514,273 records as core session, 1,524 before core, and 365 after
core. No event falls outside its source date or requested dataset range.

## Receive lag

`receive_lag_ns = ts_recv - ts_event` was calculated for all 516,162
records:

- minimum: 17,328 ns
- median: 90,439 ns
- p90: 159,503 ns
- p95: 300,494 ns
- p99: 959,754 ns
- p99.9: 5,940,924 ns
- maximum: 66,456,177 ns
- negative lag: 0

Every record is within 100 ms, and therefore within every requested larger
receive-lag threshold. For actual one-minute candle finalization, zero
records arrive after the bucket end plus 100 ms; consequently zero arrive
after the bucket end plus 2 seconds.

The complete machine-readable report includes the same statistics per raw
file, symbol, session, and publisher, plus outlier counts and five-day
stability ranges.

## Watermark recommendation

The recommendation is `insufficient_evidence`. The normative two-second
watermark remains `empirically_unvalidated` and was not changed.

Although the pilot observed zero records after the two-second candle
finalization boundary and is byte-deterministic across two UTC runs,
Stockholm, and New York, the versioned decision rule requires at least 20
sessions. Only five are present. Sale-condition semantics are also not
exposed by the DBN trades record schema and were not inferred.

## Safety state

- Raw dataset admitted: `true`
- Decoder provenance verified: `true`
- Record inventory reconciled: `true`
- Receive-lag study complete: `true`
- Two-run determinism passed: `true`
- Watermark recommendation: `insufficient_evidence`
- Normalization authorized: `false`
- Replay authorized: `false`
- Canonical binding ready: `false`
- Live ranking effect: `false`

The canonical full report is
`docs/evidence/action-667m5a-raw-receive-lag-report.json`; the compact
admission evidence is
`docs/evidence/action-667m5a-raw-dataset-admission.json`.
