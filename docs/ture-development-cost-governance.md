# Ture Development Cost Governance

**Status:** proposed normative companion to EXT-00 External Capability Expansion.

**Purpose:** keep Ture's fixed and usage-based development costs deliberately low while preserving the ability to activate higher-quality external capabilities exactly when the roadmap reaches the gate where they can be evaluated or used productively.

This document does not authorize any subscription, trial, provider activation, annual commitment, production deployment or recurring spend.

```text
development_cost_baseline_authority:operator_confirmed
new_paid_service_authority:false_until_explicit_activation_gate
trial_activation_authority:false_until_eval_ready
annual_commitment_authority:false_during_development_unless_separately_approved
high_cost_vendor_authority:false_until_fallback_and_value_case_reviewed
```

## 1. Permanent principle

Ture shall plan useful capabilities early and pay for them late.

The preferred acquisition order is:

```text
local / open-source
→ public / free primary source
→ vendor sample data / sandbox
→ free tier
→ trial / promotional credits
→ month-to-month paid plan
→ annual or longer commitment only after proven production need
```

A roadmap entry is not spending authority.

A provider integration is not subscription authority.

An API key is not licensing authority.

A technically successful trial is not production-promotion authority.

## 2. Development baseline — 2026-08-20

Operator-confirmed recurring development subscriptions:

| Service | Current state | Monthly cost | Governance classification |
| --- | --- | ---: | --- |
| ChatGPT Pro | active | $250 | KEEP — primary development/architecture/Codex workflow |
| Netlify Personal | active | $9 | KEEP — current hosting/deploy boundary |
| GitHub Pro | active | $4 | KEEP — protected repository/governance requirement |
| Twelve Data | Free | $0 | KEEP FREE — paid capacity deferred until provider-load gate |
| **Total fixed development baseline** |  | **$263/month** | canonical planning baseline |

Annualized fixed baseline if unchanged: `$3,156/year`.

The cost baseline is a planning snapshot, not a vendor price guarantee. It must be refreshed whenever a material subscription changes.

## 3. Cost-state model

Every external service must have one explicit current state:

```text
NOT_NEEDED_YET
FREE_LOCAL
FREE_TIER
SAMPLE_ONLY
TRIAL_READY
TRIAL_ACTIVE
PAID_MONTHLY
PAID_COMMITTED
DEFERRED_COST
REJECTED
```

No provider may silently move from one state to another.

### State meanings

**NOT_NEEDED_YET** — capability exists in roadmap but prerequisites are not mature.

**FREE_LOCAL** — open-source/local development only; no vendor cost.

**FREE_TIER** — vendor account/free quota may be used within documented limits.

**SAMPLE_ONLY** — integration uses static/vendor sample data and does not depend on live licensed production data.

**TRIAL_READY** — adapter, fixtures, eval harness and success criteria are ready; trial may be activated only with explicit operator approval.

**TRIAL_ACTIVE** — time-limited access is running; expiration date and evaluation plan must be recorded.

**PAID_MONTHLY** — recurring plan is justified and can be cancelled/downgraded without long lock-in.

**PAID_COMMITTED** — annual/longer contract. This is disallowed during ordinary development unless explicitly approved after a documented business case.

**DEFERRED_COST** — capability may be valuable but current price is too high relative to Ture's development stage; free alternatives/fallbacks remain active.

**REJECTED** — evidence does not justify cost/complexity.

## 4. Activation package required before recurring spend

Before a new recurring paid service is activated, the roadmap action must record:

- service/provider;
- exact capability being purchased;
- why free/local/sample alternatives are insufficient at this gate;
- current plan/tier;
- monthly recurring cost;
- usage-dependent charges;
- trial or credits already consumed/available;
- billing cadence;
- minimum commitment;
- cancellation/downgrade procedure;
- effective cancellation date;
- licensing/redistribution limitations;
- data retention limitations;
- development versus production rights;
- success metric;
- measurement window;
- expected product benefit;
- cheaper fallback path;
- explicit removal/downgrade criterion;
- operator approval.

If any material commercial term is unknown, the paid activation gate remains open.

## 5. Trial discipline

Trials are scarce development resources and must be activated just-in-time.

Before a trial begins, Ture should already have where technically possible:

- provider-independent domain contract;
- adapter interface;
- sample fixtures;
- parser tests;
- normalization tests;
- persistence contract if required;
- shadow path;
- baseline comparison;
- success metrics;
- cost/value metric;
- trial end date and shutdown plan.

Trial time should be spent measuring the provider, not building basic plumbing.

## 6. Usage-based spend discipline

Usage-based services require hard budgets.

Each such integration should define:

```text
per_run_budget
daily_budget
monthly_soft_budget
monthly_hard_budget
warning_threshold
kill_switch
```

The hard budget must fail closed with respect to additional optional usage.

Critical Ture safety/state work may have separately approved budget behavior, but background research must not cause uncontrolled spend.

## 7. High-cost vendor policy

A provider is classified as `high_cost_vendor` when its expected recurring cost would materially change Ture's development baseline.

Default planning threshold:

```text
high_cost_vendor_threshold = greater of:
- $250/month incremental recurring cost, or
- 50% of current non-ChatGPT infrastructure baseline
```

Because Ture's present non-ChatGPT infrastructure baseline is only $13/month, the practical `$250/month` threshold governs for now.

A high-cost vendor requires all of the following before paid activation:

1. free/sample/trial evaluation where available;
2. documented incremental value hypothesis;
3. cheaper-source/fallback analysis;
4. shadow or historical evidence where technically possible;
5. explicit operator cost approval;
6. month-to-month preference unless impossible;
7. documented exit plan.

If price is disproportionate to Ture's current stage, classify the capability `DEFERRED_COST` rather than deleting it from the roadmap.

## 8. Current external-capability cost ledger

| Capability/provider | Current development state | Current recurring cost | Earliest paid activation gate | Fallback if expensive |
| --- | --- | ---: | --- | --- |
| Twelve Data | FREE_TIER | $0 | meaningful broad live/shadow/backfill capacity required | keep Free, local cache, narrower workload |
| OpenAI API / Agents SDK runtime | NOT_NEEDED_YET for new agent layer | $0 fixed; future usage-based | AI-02+ runtime/eval work | small models, hard budgets, baseline Ture |
| Temporal local | FREE_LOCAL | $0 | after local durability/replay contracts prove need for managed Cloud | continue local/self-hosted during development |
| Temporal Cloud | NOT_NEEDED_YET | $0 | TEMP cloud activation gate | local Temporal; use credits before paid |
| Massive News + Finnhub Company News | EXISTING_ACCOUNTS / NOT_ACTIVATED | $0 incremental paid commitment | separately approved CAT-03 bounded read-only shadow gate | SEC EDGAR + issuer/regulatory/macro primary sources; do not infer a catalyst from absence |
| SEC EDGAR | public/free | $0 | none | canonical free primary-source foundation |
| Alpaca Basic | FREE_TIER candidate | $0 | SIP execution-shadow gate | existing market-data provider / free tier |
| Alpaca paid SIP/OPRA | NOT_NEEDED_YET | $0 | SIP evidence gate before meaningful semi-auto execution | free/basic quotes; defer precision layer |
| Market Breadth derived locally | FREE_LOCAL | $0 | only if external breadth proves necessary | derive from already licensed market data |
| Parquet + DuckDB + Polars | FREE_LOCAL | $0 | none | local research storage/analytics |
| Cloudflare R2 | NOT_NEEDED_YET / future free tier | $0 | remote durable research-storage need | local Parquet first |
| QuantConnect LEAN | FREE_LOCAL | $0 | none | local open-source validator |
| OpenTelemetry | FREE_LOCAL | $0 | none | local/open-source observability |
| Sentry | NOT_NEEDED_YET / future free tier | $0 | production observability quota/retention need | OpenTelemetry + free plan |
| MLflow | NOT_NEEDED_YET / future FREE_LOCAL | $0 | Milestone D experiment proliferation | Ture-native version ledger until needed |
| Databento historical depth | NOT_NEEDED_YET | $0 | MICRO historical experiment gate | omit microstructure signal |
| Databento live depth | DEFERRED_COST by default | $0 | only after historical/shadow microstructure evidence + explicit procurement | do not activate; SIP/top-of-book only |
| Dedicated options data | NOT_NEEDED_YET | $0 | OPT research gate | reuse OPRA if already included elsewhere; omit signal |

## 9. WhyMove Engine cost and licensing governance

CAT-00 fixes Catalyst Intelligence as a Ture-owned WhyMove Engine. Massive News and Finnhub Company News are planned discovery/evidence leads; SEC EDGAR, issuer IR/press releases, FDA, and official Federal Reserve/BLS/BEA publications are the planned primary-source layer.

~~~text
massive_account_exists:true
finnhub_account_exists:true
provider_runtime_activation_authority:false
primary_source_runtime_call_authority:false
new_paid_subscription_authority:false
incremental_paid_provider_commitment:$0
Benzinga_planned_dependency:false
~~~

An existing account, API key, sample response or roadmap entry does not establish rights to use a dataset, retain its response/derived metadata, or make it canonical. Before a bounded source evaluation, document the exact endpoint and plan semantics, rate/cost ceiling, internal-use and retention rights, redistribution limits, fixture, success metric, removal criterion and rollback.

### WhyMove Engine decision tree

~~~text
local fixture + technical baseline
      ↓
source-aware normalizer and ablation harness ready?
   /                                      \
 NO                                      YES
  ↓                                        ↓
wait                         separately approve bounded read-only shadow
                                            ↓
                              material incremental value over baseline?
                                  /                       \
                                NO                         YES
                                ↓                           ↓
                       retain research-only         separate advisory
                       / remove source path         promotion review
~~~

No trial, paid plan or recurring spend is a default branch of this tree. Benzinga has no re-evaluation branch because it is no longer a planned dependency.

## 10. WhyMove Engine evidence architecture

Catalyst Intelligence is designed to remain buildable without a paid news dependency:

```text
SEC EDGAR
+ company investor-relations releases
+ regulator/government primary sources
+ macro release calendars from official/public sources
+ already licensed/free market data
+ optional free/RSS news metadata where licensing permits
        ↓
Ture deterministic catalyst normalization
        ↓
Agent Intelligence may summarize supplied evidence
```

Potential free/public sources include SEC EDGAR and, where relevant to later CAT design, official Federal Reserve, BLS, BEA, Census/FRED-style macro calendars/data and company primary releases.

The absence of a premium news license must not block core Ture milestones.

Commercial real-time catalyst coverage is an enhancement whose promotion is evidence- and budget-gated.

## 11. Downgrade and cancellation gates

Every paid service must have a defined path back down.

Examples:

**Twelve Data paid → Free** when broad live/shadow/backfill capacity is no longer actively required.

**Temporal Cloud → local/self-hosted** during long development pauses if managed durability is not actively being tested.

**Paid SIP → Basic/free** when execution-shadow or live execution validation is paused.

**Any later paid WhyMove discovery feed → primary-source evidence stack** if the evaluation window ends, product benefit is not material, or budget priority changes.

**Sentry paid → free/OpenTelemetry** if quota/retention/team requirements no longer justify the plan.

The existence of historical data in a paid service must not create accidental lock-in. Retention/export rights must be understood before activation.

## 12. Monthly cost review

At least whenever a new paid capability is proposed, Ture should generate a cost snapshot:

```text
current_fixed_monthly_cost
current_usage_based_month_to_date
new_proposed_monthly_cost
new_projected_total
activation_gate
expected_duration
cancel_date_or_review_date
```

A recurring subscription that is not currently serving an active roadmap/evaluation need should be considered for downgrade or pause.

## 13. Production transition

Development cost minimization must not become false economy once Ture reaches production-critical stages.

When reliable execution, market-data completeness, workflow durability or audit obligations genuinely require a paid capability, Ture may activate it after the corresponding roadmap gate.

The principle changes from:

```text
minimize development spend
```

to:

```text
maximize risk-adjusted product reliability and decision quality per dollar
```

Only after the product requires it.

## 14. Permanent rule

> **Ture shall not pay early for future capability. It shall prepare the integration cheaply, activate trials just-in-time, pay only when evidence or a production requirement justifies the cost, and retain a downgrade/fallback path wherever practical.**
