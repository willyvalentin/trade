# Action 667M.5H — diagnostic twenty-session normalization

## Outcome

The exact twenty admitted `EQUS.MINI` `trades` sessions were normalized
offline to deterministic diagnostic-only one-minute artifacts under
`market_context_diagnostic_all_reported_trades_candle_policy_v1`.

The resulting dataset contains 100,280 candles and 1,120 explicit gaps across
260 session/symbol partitions. Coverage is `0.988954635108`. No forward fill,
interpolation, corporate-action adjustment, replay, performance evaluation,
canonical binding, or live use occurred.

The output is stored outside Git under the FileVault-protected
`diagnostic-normalized-1m/market_context_diagnostic_all_reported_trades_1m_v1`
directory. Its manifest contains the path, size, and SHA-256 of every
non-manifest artifact. Directories are mode `0700`; files are mode `0600`.

## Duplicate treatment

M.5G's `all_reported_trade_records` semantics and the unique
`source_file_sha256 + zero_based_record_ordinal` identity make duplicate
treatment explicit: every admitted raw identity is included. There is no
deduplication.

The source contains 3,399 byte-identical duplicate occurrences. Of these,
3,395 are inside core sessions and contribute 364,595 units of volume and
3,395 trades. They touch 2,741 candles but do not change any candle's OHLC.
The remaining four duplicate occurrences are outside core sessions and are
retained with excluded dispositions.

## Lineage and gaps

Every one of the 2,420,049 raw identities has exactly one compressed
disposition row. The lineage root is
`fa874fd4747d16f9e1a03ef22ed4e9fa3be2491d767087372805992ab0ba3d5c`.

The dataset preserves all 1,120 missing core minutes as explicit gaps. SPY
has full coverage; the largest gap count is XLRE with 661. Breadth artifacts
use exactly the eleven declared sector ETFs, compare each minute close with
the immediately previous minute close without forward fill, and always carry
`not_full_market_breadth: true`.

## Watermark and semantic boundary

The two-second value remains
`market_context_provisional_diagnostic_watermark_2s_v1` with
`empirically_unvalidated` status. No included record arrives after its
candle-end plus the provisional watermark, but the absent sale-condition
semantics remain unresolved. The output therefore cannot claim official
OHLCV and is not eligible for canonical performance or live ranking.

## Determinism

Independent UTC, Europe/Stockholm, and America/New_York runs generated
byte-identical 303-artifact trees:

`b76048092197c9a18ecfeff8b851a50e60a60142a9bfa4b82b6d5c6269d1fc1e`

The normalized dataset digest is:

`72fd0912e079be176a81748a01cad630dda3dc62322987ee3307e3e0e55b6d8c`

Raw input digest roots before and after normalization are identical.

## Review note

One non-blocking procedural finding is retained as H-001: a three-record,
read-only decoder API probe occurred before the complete current-action hash
preflight. It created no artifact and performed no normalization. All full
normalization runs began after the complete preflight passed, and raw bytes
remained unchanged.

Replay remains separately unauthorized.
