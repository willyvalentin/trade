# Action 667M.5F — twenty-session raw admission and receive-lag study

Action 667M.5F decoded the five admitted pilot files and fifteen admitted
calibration files read-only with the same pinned M.5A decoder and normative
analysis policy. No credential was loaded and no provider endpoint was
contacted. No raw record was persisted, no candle was created, and no replay
or live consumer ran.

## Admission

All twenty raw files retained their admitted names, sizes, owner-only modes,
and SHA-256 values before and after both complete analysis runs. The two
authoritative calendar artifacts provide exactly twenty distinct XNYS
sessions. There is no market-data file for the 2026-07-03 exchange holiday.

Record reconciliation is exact:

- pilot: `516162`
- calibration: `1903887`
- combined: `2420049`
- symbols: `13`
- publisher: only `95`
- action: only `T`
- flags: only `0` and `128`
- sequence: zero for every record

The fifteen-session calibration input has no undefined, nonpositive, zero,
or sentinel price/size values; no undefined event/receive timestamps; no
negative receive lag; and no unknown action, flag bit, or instrument mapping.
It preserves 2,707 byte-identical duplicates, 9,422 adjacent event-time
inversions, and 3,448 per-symbol event-time inversions. Receive time has zero
adjacent or per-symbol inversions. The stable fallback identity based on raw
file SHA-256 plus zero-based ordinal is unique for all 1,903,887 calibration
records.

## Combined receive lag

For all 2,420,049 records:

- minimum: `17239 ns`
- median: `89817 ns`
- p90: `154379 ns`
- p95: `274357 ns`
- p99: `916381 ns`
- p99.9: `4953390 ns`
- maximum: `244157745 ns`
- negative lags: `0`

There are 47 records above 100 ms receive lag and none above 250 ms. No
record arrives after its one-minute candle end plus any requested watermark
from 100 ms through 10 seconds. The late-record risk at 1, 2, 3, and 5
seconds is therefore `0/2420049` for this admitted sample.

The full machine-readable report contains statistics per file, symbol,
session, and publisher, along with outlier counts and daily stability.

## Watermark decision

The existing decision rule and thresholds were not changed. Exactly twenty
sessions are present, all measurable data-quality checks pass, and the late
after two-second ceiling is zero overall and for every session. The result is
nevertheless `insufficient_evidence` because sale-condition semantics are
not exposed by the DBN `trades` record schema. The normative two-second
watermark remains `empirically_unvalidated`.

The raw admission is ready only for consideration of a separate
normalization authorization. Normalization itself remains unauthorized, and
that future gate must explicitly handle the unavailable sale-condition
semantics and unchanged watermark status.

## Determinism and safety

Two UTC runs, a Stockholm run with reversed input discovery order, and a New
York run are byte-identical:

`b0d8a4ee6ec12f4689a2d3e9aa209c1e1d6a77652d6f835e1115fe2b448c8622`

The canonical report digest is:

`f89ba8123f48c0553e3aa03a361edde1c5f593c8a953d44e385983ca7dc5abe4`

The full report is
`docs/evidence/action-667m5f-twenty-session-receive-lag-report.json`; the
compact admission evidence is
`docs/evidence/action-667m5f-twenty-session-raw-admission.json`.
