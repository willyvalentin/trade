# Action 667D — Explicit-Instant and Lossless Canonical-Adapter Remediation

## Scope and decisions

This action adds a versioned remediation layer without modifying the frozen
Action 667A–C artifacts or changing regime and sector classification rules.

- Context contract: `market_context_intelligence_v2`
- Threshold version:
  `market_context_intelligence_thresholds_2026_07_26_v2`
- Explicit-instant parser: `market_context_explicit_instant_parser_v1`
- Shadow adapter: `market_context_shadow_evaluation_adapter_v2`
- Standalone bridge schema: `market_context_canonical_bridge_schema_v1`
- `action_667d_explicit_instant_remediated: true`
- `action_667d_lossless_adapter_ready: true`
- `canonical_binding_ready: false`
- `canonical_format_compatible: false`

The v2 contract delegates the unchanged market classifications to the frozen
v1 implementation only after v2 validation succeeds. The output identifies
the v2 contract and threshold versions. No v1 threshold or classification is
silently changed.

## Explicit-instant contract

Every non-null timestamp must include seconds and either uppercase `Z` or an
explicit `±HH:MM` offset. The shared parser validates:

- decision timestamp;
- SPY and QQQ intraday and multi-day datapoints;
- breadth datapoints;
- sector and industry short- and medium-horizon datapoints;
- provider source timestamps;
- optional provider received timestamps when supplied.

The parser rejects naive datetimes, date-only values, impossible calendar
dates, leap seconds, offsets beyond `±14:00`, malformed offsets, lowercase
`z`, surrounding whitespace, and non-string values. Invalid input fails
before v1 analysis can run.

Equivalent explicit instants canonicalize to the same UTC ISO timestamp.
Cross-process tests run the same complete context under `TZ=UTC`,
`TZ=Europe/Stockholm`, and `TZ=America/New_York` and compare a fixed SHA-256
of the full JSON output.

## Threshold decision

The threshold version is bumped because the semantic status of two declared
values is now machine-readable:

| Threshold | Value | v2 status | Classification effect |
| --- | ---: | --- | --- |
| `freshness_minutes.intraday` | 30 minutes | `reserved_inactive` | none |
| `freshness_minutes.sector_short` | 30 minutes | `reserved_inactive` | none |

Their decision string is
`retained_for_versioned_schema_continuity_not_evaluated_by_v2`.
They are not active freshness or classification boundaries and must not be
interpreted as such. The other 19 values retain `active` status and unchanged
numeric values. Activating either reserved value later requires another
threshold version and side-by-side shadow evidence.

## Lossless shadow bridge

`market_context_canonical_bridge_schema_v1` carries:

- canonical explicit decision instant;
- context and threshold versions;
- required caller-supplied engine, scoring, ranking, setup-taxonomy,
  confidence-contract, evaluator, provider-contract, Git, and build versions;
- every provider source/received timestamp, freshness age/state, coverage, and
  missing-point count, with its data domain;
- aggregate freshness;
- exact coverage and missingness;
- regime classification and every regime dimension;
- the full ordered sector/industry context collection;
- ordinal evidence strength and the original confidence object with
  `calibrated_probability: false`;
- all reason codes and leakage counters;
- immutable shadow/no-live-effect flags.

The round-trip restorer reconstructs the exact v2 context output. It does not
convert evidence strength into probability confidence or compress sector,
provider, coverage, freshness, reason-code, or leakage information.

Missing or malformed producer/build/provider version metadata produces:

```text
binding_status: not_bindable
payload: null
```

No value is inferred from the repository, process, provider, or Spår 2.

## Future Spår 2 receiver mapping

The comparison remains read-only. No Spår 2 file is imported or copied.

Spår 2 later needs an explicitly reviewed receiver representation for:

| Bridge field | Required future receiver field |
| --- | --- |
| `decision_instant` | explicit decision-context timestamp |
| `versions.context_contract_version` | market-context contract version |
| `versions.threshold_version` | market-context threshold version |
| `versions.producer.*` | full canonical producer/build/provider version bundle |
| `regime_classification` | decision-time market regime |
| `dimensions` | typed market-regime dimensions |
| `sector_contexts[]` | lossless repeated sector/industry contexts |
| `evidence` | non-probabilistic context evidence namespace |
| `provider_domains[]` | repeated provider timestamps and per-domain freshness |
| `aggregate_freshness` | aggregate context freshness |
| `coverage_and_missingness` | native market-context coverage schema |
| `reason_codes[]` | scoped market-context reason codes |
| `leakage_control` | point-in-time exclusion counters |
| shadow flags | immutable no-live-effect assertions |

Current Spår 2 projection has scalar regime, sector, freshness, and provider
fields plus a candle-oriented coverage contract. It has no reviewed lossless
receiver for the repeated provider/sector collections, market-context
dimensions, threshold version, evidence namespace, native coverage, or
leakage metadata. Therefore:

- bridge serialization readiness: ready;
- actual canonical binding: not ready;
- canonical format compatibility: false.

## Non-live boundary

The v2 context and bridge remain pure, local, and shadow-only. They make no
provider call, create no storage relation, import no scanner/recommendation
consumer, and activate no capture. Historical comparison and the final
re-freeze are deliberately deferred to separate approval.

## Action 667E

Recommended next action:
**Action 667E — Independent V2 Re-freeze and Canonical-Receiver Delta Review**.

It should inventory and hash the new v2 artifacts, independently rerun all
v1/v2 regressions under the three required process timezones, review the
bridge schema against the then-current read-only Spår 2 receiver contract, and
issue new freeze/approval decisions. It must not start historical shadow
evaluation or canonical capture automatically.
