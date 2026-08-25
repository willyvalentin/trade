# CAT-00 — Catalyst Intelligence / WhyMove Engine Governance

**Status:** Draft, documentation-only successor to EXT-00.  
**Purpose:** Replace Benzinga completely as a planned Catalyst Intelligence dependency and govern Ture's own WhyMove Engine.

~~~text
new_paid_subscription_authority:false
provider_runtime_activation_authority:false
external_signal_live_influence:false
Benzinga_planned_dependency:false
incremental_paid_provider_commitment:$0
~~~

## Decision

Ture will build a source-aware WhyMove Engine rather than depend on a commercial why-is-it-moving feed. Massive News and Finnhub Company News are planned external discovery/evidence leads. SEC EDGAR, issuer IR/press releases, FDA and official Federal Reserve/BLS/BEA publications form the primary-source layer when relevant.

Massive and Finnhub accounts already exist, but neither account authorizes credential inspection, source calls, configuration, retention, scheduler work or any runtime activation.

Benzinga is removed from the roadmap. It is not a future premium dependency, trial, renewal, fallback, adapter target or re-evaluation path.

## Evidence and truth boundary

~~~text
Discovery lead → relevant primary-source check → Ture deterministic normalization
→ CatalystSnapshot / WhyMove assessment → shadow + ablation evidence
→ separate advisory-promotion review
~~~

A discovery lead is not automatically a verified catalyst. The future contract must preserve source identity/class, external item ID, source publication time, observation/receipt time, corroboration/conflict state, primary-source availability/verification, freshness, snapshot-time availability and explicit missing reason.

The WhyMove result must distinguish at least supported, competing_evidence, no_verified_catalyst and evidence_unavailable. No result from a news source does not prove a technical-only move. An LLM/agent may summarize supplied evidence but may not invent a cause, citation, timestamp or verification result. Ture Core retains canonical market truth, ranking, risk and execution authority.

## Cost, licensing and retention

No new paid subscription, trial or credit activation is authorized. Before any source can be evaluated, a separate bounded gate must record the exact endpoint/plan semantics, rate and cost ceiling, internal-use and retention rights, derived-data rights, adapter contract, static fixture, success metric, removal criterion and rollback.

Raw-response and derived-metadata persistence are not authorized by CAT-00. No license/right is inferred from an existing account, an API key or a successful technical response.

## Required rollout order

1. **CAT-01 — contract and local fixtures:** source-aware taxonomy, anti-leakage/missing/conflict states and static normalizer inputs only.
2. **CAT-02 — local ablation harness:** compare technical baseline, discovery-only, primary-only and combined normalized evidence. No network or persistence.
3. **CAT-03 — bounded read-only shadow:** only after a separate source, licensing and cost gate. No route, write, scanner/ranking/recommendation, risk or execution effect.
4. **CAT-04 — outcome/calibration analysis:** evaluate coverage, source-time alignment, freshness, conflict/factual-audit error rate, latency, cost and incremental outcome/calibration usefulness.
5. **CAT-05 — advisory promotion review:** separately approve only if the combined stack materially beats the technical baseline and simpler ablations. Live influence remains separately gated.

## PR merge order

~~~text
#121 current Milestone B candidate → #122 AI-00 → #123 EXT-00 → CAT-00
~~~

This PR must remain Draft and be rebased/refrozen onto the exact merged AI-00/EXT-00 state before review. Its PR diff is limited to:

- docs/cat-00-whymove-engine-governance.md;
- docs/ture-external-capability-expansion-spec.md;
- docs/ture-development-cost-governance.md; and
- docs/ture-master-roadmap.md.

No runtime, dependency, configuration, migration, generated, test, source-sync or credential file is in scope.
