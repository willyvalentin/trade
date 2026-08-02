# Action 667M.2C — Independent V2 Re-freeze Review

Review date: `2026-07-27`

- `action_667m2c_nanosecond_remediated: true`
- `action_667m2c_tiebreak_and_asof_remediated: true`
- `action_667m2c_m1_binding_adapter_ready: true`
- `action_667m2c_refreeze_complete: true`
- `action_667m2c_independent_review_approved: true`
- `action_667m3_dataset_acquisition_ready: false`

Approval applies only to the synthetic, offline v2 contract and adapter. It is
not permission to acquire data or implement the required M.1 receiver
extension.

## Freeze decisions

- v1 after-digest:
  `28b5ef0a42023605d299671c05d926e4fbf7e129f421f4feed02a6c6b02f9370`
- v2 artifact count: `6`
- v2 freeze digest:
  `f5b3ad14fb10fb8fd7fed6547f521f430d8b30895bccb5b684db457160e2de4f`
- manifest:
  `docs/evidence/action-667m2c-v2-freeze-manifest.json`

All five v1 artifact hashes remain byte-identical. All six v2 artifact hashes
are identical before and after the final regression.

## Independent review

### Nanosecond time and leakage

Event, receive, decision, session and watermark values use canonical decimal
UNIX nanoseconds parsed with `BigInt`. Ordering and comparisons never convert
to milliseconds. Exact same-millisecond nanoseconds and watermark
minus/equal/plus one nanosecond are covered.

The `uint64` undefined timestamp sentinel rejects. Human ISO values are derived
after decisions and retain nine fractional digits. Future event or receive
values reject.

Mid-session gap generation stops at the last finalized observable bucket.
Unfinalized observed buckets are pending and future session minutes do not
become historical missingness.

### Tie-break and runtime safety

Sequence zero is permitted only alongside a non-empty globally unique
tie-break. Reused identities reject before aggregation. The raw record digest
binds the tie-break. Untyped malformed values are caught at the public boundary
and return deterministic rejection without a partial candle.

### Eligibility and numerical boundaries

Size and sequence enforce `uint32`; flags enforce `uint8`. Fixed prices remain
signed-`int64` decimal strings and `UNDEF_PRICE` rejects. The declared US ETF
scope additionally requires positive prices. Unsupported actions, flags,
conditions, corrections and cancels fail closed.

### Calendar, aggregation, gaps and lineage

The caller supplies a SHA-256-bound XNYS calendar artifact with identity,
version and explicit sessions. DST and half-day fixtures remain host-timezone
independent. Aggregation preserves exact event/receive bounds, integer OHLCV,
raw record hashes, nanosecond lineage and deterministic normalized digests.
Missing, pending and late-only buckets are distinct and never forward-filled.

### M.1 adapter

The adapter requires full caller-supplied dataset, provider product/build/
revision, decision, context, provenance, rights, acquisition, calendar,
corporate-action, quality, coverage, raw-file and raw-record lineage metadata.
It rechecks prepared and candle-lineage digests. Missing or inconsistent values
return `not_bindable`; metadata is never inferred.

Lossless output requires
`market_context_historical_dataset_nanosecond_extension_v1`. The adapter is
ready as a frozen bridge schema, while actual M.1 receiver support and canonical
binding remain `not_ready`.

### Breadth

Breadth still requires exactly the eleven declared sector ETFs and is
permanently labeled `not_full_market_breadth: true`.

## Findings

### Blocker: 0

### Major: 0

### Minor m2c-001 — Watermark remains empirically unvalidated

Two seconds is deterministic and versioned but has no authorized real-data
latency study. It must not be presented as a provider SLA or production-ready
threshold.

### Minor m2c-002 — M.1 receiver extension is not implemented

The adapter is lossless and explicit, but the current M.1 receiver does not yet
store the nanosecond extension. Actual canonical ingestion remains blocked.

### Minor m2c-003 — Strict eligibility may reduce eventual coverage

Unmapped sale conditions and publisher-specific semantics reject rather than
guess. This is safe, but the eventual product/schema decision must determine
whether documented additional semantics require another policy version.

### Nit n2c-001 — Historical freeze status assertions are pre-commit-specific

Two older C/E tests expect A–E artifacts to remain untracked. At the approved
PR #51 head those files are tracked, so those two Git-status-only assertions
fail. The other 110 semantic tests pass. Neither old tests nor old manifests
were changed.

## Regression

- scoped M.2C: `22/22 passed`
- semantic A–E/M.1/M.2A/M.2C: `110/110 passed`
- full invocation including two historical status assertions:
  `110 passed, 2 status-only failures`
- cross-TZ digest:
  `99eaa771ccf73b61e0f66e8df8db304fc90ce38ec65eb5785c225e11ea73b076`
- TypeScript: `passed`
- scoped ESLint: `passed`
- whitespace/diff checks: `passed`
- provider/database/replay/live imports: `0`
- dependency and `deno.lock` changes: `0`

The K historical replay suite was not executed because this Action explicitly
prohibits historical replay.

## Remaining metadata, license and cost gates

Before any separate acquisition authorization, an operator must approve:

1. exact provider product, dataset, schema, delivery encoding and all thirteen
   symbols;
2. account entitlement and exchange-specific rights;
3. a stable tie-break derivation from documented delivered fields;
4. provider dataset build/revision and reproducibility metadata;
5. written local raw/normalized retention, internal research/replay, backup and
   derived-output rights;
6. redistribution, audit, deletion and retention restrictions;
7. exact one-time/recurring price, credits, exchange fees, overage, tax and
   total cost ceiling;
8. corporate-action source and split/dividend/adjustment semantics;
9. licensed immutable XNYS calendar artifact;
10. condition/flag/publisher eligibility mappings for the selected product;
11. non-repository encrypted raw and normalized storage paths;
12. implementation and separate review of the M.1 nanosecond receiver
    extension;
13. fresh explicit acquisition authorization that does not use the revoked
    credential.

No provider call, quote, entitlement check or download was performed.
