# Action 667M.2B — Independent Trade-to-Candle Freeze Review

Review date: `2026-07-27`

- `action_667m2b_trade_to_candle_frozen: true`
- `action_667m2b_independent_review_approved: false`
- `action_667m3_dataset_acquisition_ready: false`

This Action did not change any frozen M.2A byte. It did not remediate findings,
inspect credentials, access an authenticated provider endpoint, normalize real
data, run replay, bind canonical data, persist data, or affect live behavior.

## Freeze

The freeze contains exactly five M.2A artifacts. The machine-readable manifest
is:

`docs/evidence/action-667m2b-trade-to-candle-freeze-manifest.json`

Freeze digest:

`28b5ef0a42023605d299671c05d926e4fbf7e129f421f4feed02a6c6b02f9370`

The digest is SHA-256 over the path-sorted concatenation of each artifact's
path, artifact type, version, and SHA-256, separated by NUL bytes and ending
each record with LF. Pre- and post-regression hashes are byte-identical.

## Regression

- M.2A Playwright: `22/22 passed`
- Cross-TZ child processes: `UTC`, `Europe/Stockholm`,
  `America/New_York`
- Cross-TZ byte parity: `passed`
- Cross-TZ digest:
  `0b2df5ba6e6b29d97afe91d304ece0094c9fdfebee3e72b4b4ce4177b331044f`
- TypeScript: `passed`
- Scoped ESLint: `passed`
- `git diff --check`: `passed`
- M.2A evidence JSON parity: `passed`
- Provider/database/replay/live imports: `0`
- Dependency and `deno.lock` changes: `0`

## Independent findings

### Blocker B-001 — Provider timestamp precision is not lossless

The reviewed provider schema describes `ts_event` and `ts_recv` as
nanosecond-resolution integer timestamps. The shared strict instant parser
accepts at most three fractional decimal places and canonicalizes to epoch
milliseconds. The preparation contract therefore cannot directly preserve
provider nanoseconds.

An acquisition adapter would have to truncate or round before invoking M.2A.
That can collapse distinct event/receive instants and can alter ordering or
watermark behavior near a boundary. A caller-supplied tie-break does not restore
the lost receive-time precision. Real provider acquisition must remain blocked
until an explicitly versioned lossless timestamp representation is reviewed.

### Major M-001 — Reused or ambiguous tie-break identities do not fail closed

Missing and empty `tie_break_id` values are invalid, but uniqueness is not
enforced for equal event time and sequence. Reused tie-break values are accepted
and the comparator silently falls through to lexicographic `raw_record_id`.
Open/close can therefore depend on caller-assigned raw identities rather than a
declared provider ordering semantic.

Additionally, malformed runtime input with a missing tie-break can reach the
out-of-order diagnostic comparator before accumulated validation errors are
returned. Equal event/sequence records can then invoke `localeCompare` on the
missing value instead of returning the declared fail-closed result.

### Major M-002 — Mid-session as-of can label future minutes as missing

Future event and receive records correctly reject. However, gap generation
iterates the complete declared session regardless of
`preparation_as_of_timestamp`. Only buckets represented by an observed record
are added to the unfinalized set. When as-of is inside a session, later
unobserved buckets can be emitted as `missing_minute_no_eligible_trade`, with
bucket timestamps after as-of.

That representation is deterministic but is not point-in-time-safe coverage
semantics. V1 must either require as-of after every declared session watermark
or distinguish all not-yet-observable buckets from true historical missingness.

### Major M-003 — Output is not a lossless Action 667M.1 handoff

The preparation output carries candles, event/receive bounds, provider and
dataset versions, adjustment state, gaps, dispositions, and digests. It does
not carry all M.1-required semantics:

- decision identity, decision instant and ticker;
- domain and context identity for benchmark/sector/industry rows;
- source provenance, documented usage rights and acquisition metadata;
- raw-file descriptors and byte-level file lineage;
- full split/dividend policy text and calendar artifact identity;
- expected rows, minimum coverage and missingness policy;
- sensitive-identifier sanitization attestation;
- the exact raw-to-normalized M.1 row mapping.

These values cannot be invented from M.2A output. A future adapter must require
them from an admitted M.1 manifest and fail closed; the current output alone
cannot satisfy M.1 without additional caller data and a reviewed mapping.

### Minor m-001 — Provider numeric bounds are wider than the reviewed schema

`size` accepts any positive JavaScript safe integer rather than `uint32`, and
aggregate volume is not checked for safe-integer overflow. Price is a positive
finite number but the reviewed scaled-`int64` representation and conversion
policy are not frozen. This does not break current synthetic determinism, but it
is too permissive for lossless provider admission.

### Minor m-002 — The two-second watermark has no empirical admission evidence

The watermark is explicit, deterministic, and correctly documented as a lab
policy rather than a provider SLA. Late records are excluded and retained in
record dispositions. No real distribution or sensitivity evidence supports two
seconds, so the policy must not be treated as validated for provider data.

### Minor m-003 — XNYS identity depends on unverified caller-supplied sessions

Session opens/closes are explicit, minute-aligned and overlap-checked. The
implementation does not verify that the supplied local date, regular/half-day
label, hours, or calendar version correspond to an immutable official XNYS
calendar artifact. That calendar artifact and digest remain an external
admission requirement.

### Nit n-001 — Late-only buckets use a generic gap label

A finalized bucket containing only late records has per-record
`late_receive_after_watermark` dispositions, but its gap is labeled
`missing_minute_no_eligible_trade`. No information is lost while the raw
dispositions remain attached, but a dedicated gap reason would make downstream
quality summaries less dependent on joining dispositions.

## Areas approved within the synthetic boundary

- `ts_event` selects the event-time minute; `ts_recv` controls availability.
- Explicit instants reject naive timestamps and are cross-environment stable at
  millisecond precision.
- Corrections, cancels, modifies, unsupported actions/record types, unsafe
  receive/book flags, publisher-specific flags and unmapped conditions fail
  closed.
- OHLCV is deterministic for validated input; session close is exclusive.
- Missing minutes remain gaps and are never forward-filled.
- Corporate-action state is declared and attested rather than inferred.
- Raw record digests, dispositions, candle lineage and normalized digest are
  deterministic and tamper-sensitive for the represented fields.
- Duplicate raw IDs, duplicate source positions and identical economic records
  reject.
- Eleven-sector participation is complete-or-reject and permanently labeled
  `not_full_market_breadth: true`.
- No classification, ranking, replay, performance or live effect is produced.

These approvals do not override B-001 or the major findings and do not authorize
real data acquisition.

## External license, entitlement, and cost questions

An operator must obtain written, provider-specific answers to all of the
following without disclosing or reusing the revoked credential:

1. Which exact Databento product/dataset/schema supplies SPY, QQQ and all eleven
   declared sector ETFs with both event and receive timestamps?
2. Does the account have entitlement to the exact symbols, schema, date range,
   timestamp precision, adjustment/corporate-action data and delivery method?
3. Do the terms permit local raw and normalized storage, deterministic internal
   research/replay, derived candles, retained lineage/digests and backups?
4. What retention limits, deletion duties, audit duties and redistribution
   restrictions apply to raw records and derived outputs?
5. Is the quoted history point-in-time reproducible, and what immutable
   dataset/build/revision metadata can be supplied?
6. What are the exact one-time and recurring price, credits/calls, overage,
   exchange/license fees, taxes and total cost ceiling?
7. Is a separate corporate-action source or entitlement required, and what are
   its split/dividend/adjustment semantics?
8. Can a metadata-only quote and entitlement response be obtained without any
   data download or authenticated API call?

## Exact next Action

`SPÅR 3 — Action 667M.3: Metadata-Only Databento Quote, Entitlement and License Gate`

That Action must require fresh explicit operator authorization, must use no
revoked credential, must request no historical rows, and must perform no
download. It may collect only written/commercial metadata needed to answer the
questions above. Dataset acquisition remains separately blocked by B-001 and
the major findings until a remediation and re-freeze Action is approved.
