# SPÅR 2 — Action 665E: Counterfactual Foundation Remediation

Status: implemented locally, inactive and fixture-only.

This Action changes no scanner, generator, route, persistence path, migration,
provider call or live configuration. The builder remains server-only,
default-off and unavailable unless both explicit enablement and a previous
binding lookup are supplied.

## Finding remediation

| 665D finding | Contract remediation | Golden evidence |
| --- | --- | --- |
| Major 1 — self-attested membership | `pre_truncation_candidate_capture_evidence_v1` is created only for the fixed `scanner-full-ranking-boundary-v1` boundary. It binds scan/decision identity, sorted stable candidate identities, positive full count, set digest, cutoff, timestamp and scanner/universe/provider versions. Builder and adapter independently verify it. | Self-consistent candidate omission and tampered evidence fail before projection; valid evidence verifies deterministically. |
| Major 2 — fallback/no-trade contradiction | Completed bundles carry exactly one of `publish_recommendations`, `explicit_no_trade` or `deterministic_fallback`. No-trade evidence is forbidden for the other dispositions, and explicit no-trade with fallback evidence conflicts. | Valid publish/no-trade/fallback cases remain separate; no-trade plus fallback rejects explicitly. |
| Major 3 — outcome lineage not decision-bound | Each candidate binds `canonical_expected_outcome_lineage_v1`: namespace, evaluator contract/version, horizon policy and full decision/candidate lineage keys. It is included in the decision-time candidate digest. Actual outcomes remain excluded from that digest and require a separate evaluation digest over expected lineage, actual lineage and outcome. | Wrong evaluator/horizon contract rejects. A later outcome changes only evaluation digest; outcome tampering without recomputation conflicts. |
| Major 4 — incomplete lineage graph | Completed bundles carry explicit recommendation, rejection or no-trade decision nodes. The adapter cross-validates candidate → scan → batch → decision node → recommendation snapshot or explicit no-trade → expected outcome lineage. It rejects orphaned batch/decision/snapshot nodes, duplicate decision/lineage keys and inconsistent batch snapshot/ticker/count membership. | Complete graph maps; orphaned candidate/batch/decision/snapshot cases conflict. |
| Major 5 — zero provider coverage | `canonical_provider_coverage_v1` fixes denominator semantics to candidate provider observations. Nonempty sets require positive expected coverage; observed must be non-negative and cannot exceed expected. Fresh complete evidence requires equality and no gap reason. | Positive coverage remains ready; `expected=0, observed=0` rejects. |
| Minor 1 — open reason namespace | `canonical_counterfactual_reason_taxonomy_v1` is a closed, versioned allowlist used by canonical contract, adapter and builder. | Known reasons pass; unknown but syntactically valid codes reject. |
| Minor 2 — optional collision check | Enabled builder construction requires `CompleteOpportunitySetPreviousBindingLookup`. The builder is unavailable without it and compares any prior binding before returning ready evidence. | Missing lookup stays disabled; same decision identity with changed semantic binding fails closed. |
| Nit — late presentation validation | `presentation_top_k` is validated in the pre-projection validation sequence. | Invalid top-K returns with both round-trip statuses null. |

## Decision-time versus evaluation-time boundary

The decision evidence digest binds only facts available at the declared
point-in-time cutoff:

```text
capture evidence
+ complete ranked membership
+ exclusive disposition
+ expected evaluator/horizon lineage
+ versions and positive provider coverage
```

Future candle-derived outcomes are never included. When an outcome later
exists, `sha256_canonical_json_v1` binds the expected lineage, actual
evaluator-input lineage and the outcome as a separate evaluation digest. The
adapter recomputes this digest and checks evaluator/provider contract parity.

## Synthetic evidence only

The Action 665A–E fixtures contain no Ture production performance. Coverage
and readiness reports are deterministic contract evidence only and must not
be interpreted as win rate, expectancy, opportunity cost or model quality.

## Remaining integration dependencies

No integration is authorized. A future producer change must place the fixed
capture boundary before summary truncation, derive all identities and versions
from the producer, provide the previous-binding lookup from an idempotency
boundary and retain the exclusive disposition and lineage graph atomically.
