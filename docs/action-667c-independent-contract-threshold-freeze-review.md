# Action 667C — Independent Contract and Threshold Freeze Review

## Binary decisions

- `action_667c_contract_frozen: true`
- `action_667c_independent_review_approved: false`
- `action_667c_canonical_format_compatible: false`
- Canonical capture/binding: `not_ready`

The freeze decision means that the exact Action 667A–B evidence has been
identified and protected by hashes. It is not an approval to bind, capture,
persist, or use the context in a live consumer.

## Freeze manifest

The machine-readable manifest is
`docs/evidence/action-667c-market-context-freeze-manifest.json`.

- Frozen artifacts: 9
- Start SHA: `f578dd5bedeccb0f95b58c4f15ba2cb3dc1eea33`
- Contract: `market_context_intelligence_v1`
- Thresholds: `market_context_intelligence_thresholds_2026_07_26_v1`
- Shadow adapter: `market_context_shadow_evaluation_adapter_v1`
- Sensitivity study: `market_context_threshold_sensitivity_study_v1`
- Action 667B evidence digest:
  `64c636219a3f204e7b9f2dc73b221ba345f127370134afdf51512e42191487ef`
- Canonical artifact-list digest before regression:
  `eb0ef9eff3318b540ffc060d52d7ba118dfe98bf7303068ab01474fb92168250`
- Required digest after regression:
  `eb0ef9eff3318b540ffc060d52d7ba118dfe98bf7303068ab01474fb92168250`

All nine frozen artifacts are untracked because Actions 667A–C prohibit a
commit. Their untracked status is part of the manifest and is verified.

## Independent review

### Point-in-time and leakage safety

Future price, breadth, sector, and provider-source timestamps are excluded and
counted. Invalid point timestamps are excluded. Stable sorting resolves
out-of-order and duplicate-time input without consulting array order.

Blocking finding `C-001`: the contract accepts any timestamp understood by
`Date.parse`. It does not require `Z` or an explicit UTC offset for the
decision timestamp, candle timestamps, or provider timestamps. An implicit
datetime can therefore represent a different instant under a different
process timezone. This is weaker than Spår 2's explicit-instant contract and
prevents independent approval of the frozen v1 contract.

The review reproduced the ambiguity directly: the same
`2026-07-24T20:00:00` input canonicalizes to `20:00Z` with `TZ=UTC` and
`18:00Z` with `TZ=Europe/Stockholm`.

The optional `received_timestamp` is output metadata and does not affect
classification. A future received timestamp is not marked as future-excluded;
this is a non-blocking documentation gap while the adapter remains inactive.

### Determinism and input order

The 14 golden fixtures, seeded permutations, reversed duplicate-time inputs,
out-of-order candles, timezone-equivalent instants, and DST boundaries are
deterministic for explicit instants. Reason codes and output collections are
sorted. The implicit-timezone gap in `C-001` is the exception to a
cross-environment determinism claim.

### Regime semantics

The terminal labels are finite and explicit. Trend, risk, volatility, breadth,
SPY/QQQ agreement, intraday/multi-day context, and data quality remain
separate. Disagreement and opposite horizons produce
`conflicting_context`; they do not fall through to `neutral_balanced`.
Stale, provider-gap, or insufficient essential data produces
`insufficient_data`.

### Sector strength and rankability

Sector strength uses measured relative return against SPY at short and medium
horizons. Static identity is not presented as strength. A rank is produced
only when the explicit expected sector universe exactly matches the observed
sector IDs and every member is fresh, sufficiently covered, and classifiable.
Otherwise every sector is `not_rankable`.

### Freshness, coverage, and missingness

The output exposes provider timestamps, source-level freshness, aggregate
freshness, essential-index/breadth/sector coverage, and missingness. Gaps and
staleness reduce evidence or prevent classification/ranking. Coverage values
are clamped for output; raw non-finite values are rejected.

### Confidence semantics

`confidence.calibrated_probability` is always `false`; its basis is
`deterministic_rule_evidence_not_probability`. The ordinal
`evidence_strength` is not mapped to Spår 2's probability confidence.

### Threshold behavior and churn

The frozen study contains 21 versioned numeric leaf thresholds, 63 boundary
cases, and 10 sweeps. Nineteen thresholds have one bounded transition, two
have no observable effect, and none has excessive local churn. All six
conservative invariants pass. No threshold change is justified or made in
this action.

### Versions and rollback

The threshold policy prohibits silent changes. Numeric values, comparison
inclusivity, units, clocks, denominators, or threshold bindings require a new
threshold version. Additive compatible metadata requires a minor contract
version; semantic, requiredness, leakage, ranking, label, or live-effect
changes require a major contract version. Candidate evidence digest,
side-by-side shadow comparison, previous versions, reason, approver, and
approval time are required rollback metadata.

### Shadow-only and no live effect

The output is fixed to `shadow_only: true` and
`live_ranking_effect: false`. The adapter is inactive, unbound, capture-off,
persistence-off, and has no database relation. No live scanner, generator,
ranking, universe, AI, publication, provider, or persistence module imports
the lab.

### Unknown data is not neutral

Essential stale, missing, or provider-gap data terminates as
`insufficient_data`. Cross-index and cross-horizon conflict terminates as
`conflicting_context`. Tests expressly prohibit either state from silently
becoming neutral.

## Review of inert thresholds

Both `freshness_minutes.intraday` and
`freshness_minutes.sector_short` are classified as **minor technical debt**.

They are versioned and detected by the sensitivity evidence, but the engine
does not bind them to point-age decisions. They cannot be considered
"intentionally reserved and correctly documented" because the 667A threshold
table describes freshness limits without marking these two as inactive. They
are not a blocker to preserving or running this shadow-only lab because they
cannot affect output. They must be resolved in a separately versioned,
reviewed action before historical comparison or canonical binding; this
Action neither changes nor removes them.

## Read-only Spår 2 semantic comparison

Compared read-only against the untracked Spår 2 contracts in
`/private/tmp/trade-action-664a`:

- `canonical-recommendation-evaluation.ts`
- `canonical-evaluation-projection-adapters.ts`
- Action 664A and 664B contract documents

No import, copy, persistence relation, or canonical binding was created.

| Required semantic | Frozen adapter | Spår 2 semantic | Review |
| --- | --- | --- | --- |
| context version | `context_version` | no dedicated context-version field | requires an agreed additive context envelope |
| threshold version | `threshold_version` | full canonical version bundle has no threshold-version field | requires an agreed additive context envelope |
| decision timestamp | top-level ISO string | explicit instant with `Z` or offset | blocked by `C-001` validation mismatch |
| regime/sector classifications | regime plus sector contexts | scalar `regime` and `sector` strings | regime is representable; multiple sector contexts need an explicit encoding |
| evidence strength | ordinal evidence value | probability confidence is separately constrained | must remain context evidence, never canonical probability confidence |
| provider timestamps | present in lab output, omitted from adapter | provider identity and source timestamp required by Spår 2 design | missing from adapter |
| freshness | present in lab output, omitted from adapter | scalar freshness plus age-at-decision required by Spår 2 design | missing from adapter |
| coverage | structured aggregate coverage | `CanonicalCoverage` has status and candle counts | semantic mismatch; no lossless direct mapping |
| reason codes | aggregate reason-code array | coverage and projection diagnostics have scoped reason codes | needs explicit scope-preserving mapping |
| version metadata | context and threshold versions only | nine required engine/build/provider fields | missing; must not be guessed |

The format is therefore not semantically bindable without guessing or losing
information. This is not an actual canonical binding. Canonical
capture/binding stays `not_ready` until a separately reviewed adapter revision
and an approved historical shadow comparison exist.

## Required next checkpoint

Recommended Action 667D:
**Explicit-Instant and Canonical-Adapter Remediation Decision**.

That checkpoint should decide, without silent mutation, whether timestamp
validation and the two inert freshness thresholds require a new contract
and/or threshold version; define a lossless additive context envelope for the
missing Spår 2 mappings; repeat A–C side-by-side tests; and only then decide
whether a reviewed local commit is appropriate. It must not start canonical
capture or historical evaluation automatically.
