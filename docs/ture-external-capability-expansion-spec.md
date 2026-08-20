# Ture External Capability Expansion — Architecture, Cost Discipline and Adoption Specification

**Status:** Proposed cross-cutting architecture and roadmap contract  
**Scope:** External orchestration, market/catalyst data, research infrastructure, observability, independent replay validation and experiment governance  
**Primary objective:** Increase Ture's maximum product quality while keeping development spend low and preserving deterministic Ture authority.

```text
external_capability_runtime_authority:false_until_explicit_activation_gate
paid_subscription_authority:false_until_explicit_cost_gate
annual_commitment_authority:false_during_development_unless_separately_approved
external_signal_live_influence:false_until_shadow_and_ablation_pass
```

## 1. Governing principle

Ture shall plan high-value external capabilities early, but shall activate them only when their prerequisites are mature and their incremental value can be measured.

A capability is not valuable because it is sophisticated, expensive or widely used. It is valuable only if it improves one or more of:

- decision quality;
- reliability;
- execution quality;
- explainability;
- learning quality;
- development speed;
- auditability;
- operating efficiency.

Every external signal or service shall follow:

```text
proposal
→ contract/design
→ local/open-source or free-tier prototype
→ sample/trial/credit evaluation
→ shadow
→ ablation/comparison
→ outcome evidence
→ promotion decision
→ paid/canonical integration only when justified
```

No external capability may bypass Ture Core's deterministic trading truth, risk, state, execution authorization or durable audit.

---

# 2. Development Cost Discipline

## 2.1 Default posture: do not subscribe early

During development, the default is:

```text
NO NEW PAID SUBSCRIPTION
```

until a roadmap Action explicitly reaches the service's paid activation gate.

Planning, interfaces, schemas, adapters, tests and frozen fixtures should be built before the paid resource is activated whenever practical.

## 2.2 Preferred acquisition order

For every external capability, use the cheapest valid development mode in this order:

1. local/open-source implementation;
2. public/free primary source;
3. vendor sample files or sandbox;
4. vendor free tier;
5. trial or promotional credits;
6. month-to-month paid subscription;
7. annual commitment only after canonical production need is proven.

## 2.3 Trial timing rule

Trials and one-time credits should not be activated simply because they are available.

If a trial or credit expires, Ture should first complete:

- interface contract;
- local adapter shell;
- fixture tests;
- storage schema;
- evaluation harness;
- success/failure metrics.

Only then should the trial begin, so the full trial window is spent measuring the real integration rather than writing boilerplate.

## 2.4 Spend protection

Every paid external capability must have:

- a named owner;
- monthly budget ceiling;
- usage telemetry where available;
- cancellation/rollback instructions;
- renewal date or billing cadence;
- explicit reason for activation;
- promotion metric;
- removal criterion.

Ture should prefer month-to-month during development.

## 2.5 External capability classes

Use these planning classifications:

- `LOCAL_FREE` — no vendor account required for meaningful development.
- `FREE_TIER` — vendor account may be required but normal prototype usage can remain free.
- `TRIAL_CREDIT` — one-time evaluation resource; activate just-in-time.
- `QUOTE_ONLY` — commercial terms must be collected before architecture assumes affordability.
- `PAID_LATER` — known paid capability; activation belongs to a later milestone.
- `EVIDENCE_GATED_EXPENSIVE` — only purchase after historical/shadow evidence shows likely incremental value.

---

# 3. EXT-01 — Temporal Durable Workflow Orchestration

## 3.1 Decision

**Recommended: GO, but not as an immediate production dependency.**

Temporal should become Ture's preferred durable orchestration/control-plane candidate for long-running, failure-prone and time-dependent workflows.

Temporal does not replace:

- Supabase canonical domain state;
- market-data streaming;
- Ture risk rules;
- stop/target detection;
- execution authorization;
- broker integration;
- Agents SDK reasoning;
- Ture's canonical trading audit.

## 3.2 Architecture

```text
market/data/agent systems
          ↓
       TURE CORE
          ↓
     domain event
          ↓
       TEMPORAL
          ↓
durable progression
retries / timers / recovery
prioritization / long-lived state
          ↓
      Activities
          ↓
Ture / providers / Agents SDK
```

Temporal owns **workflow progression**, not trading truth.

## 3.3 Intended workflows

Candidate workflows include:

- `TradingDayWorkflow`
- `HotCandidateWorkflow`
- `OutcomeCompletionWorkflow`
- `ProviderRecoveryWorkflow`
- `NightlyResearchWorkflow`
- `HistoricalBackfillWorkflow`
- `AgentShadowEvalWorkflow`
- bounded `PositionFollowUpWorkflow`

## 3.4 Hard real-time boundary

Temporal must not become the primary market-event detector or ultra-low-latency stream processor.

Correct:

```text
market event
→ deterministic Ture detector
→ immediate safety/decision path
→ signal Temporal for durable continuation
```

Incorrect:

```text
market tick
→ Temporal polling
→ detect stop
→ trade decision
```

## 3.5 Workflow state policy

Temporal Workflow history should carry bounded identifiers/state:

- candidate ID;
- recommendation ID;
- position ID;
- snapshot ID;
- trace ID;
- workflow version;
- bounded status;
- timestamps.

Large candle arrays, full feature matrices, research datasets, private user payloads and full agent contexts remain in Ture-owned storage.

## 3.6 Activity policy

All non-deterministic I/O belongs in Activities, including:

- market-data calls;
- Supabase calls;
- Benzinga/SEC calls;
- OpenAI Agents SDK runs;
- object-storage I/O;
- external notifications.

LLM/model calls must not execute directly inside deterministic Workflow code.

## 3.7 Priority mapping

Temporal task priority should mirror Ture's existing workload hierarchy:

```text
CRITICAL
positions / exits / execution

HIGH
outcomes / hot candidates / recovery

NORMAL
candidate lifecycle / agent shadow

BACKGROUND
backfill / replay / research / model review
```

Background work must not starve critical/high workflows.

## 3.8 Privacy

Temporal payloads are durable records and must be treated accordingly.

Requirements:

- secrets never passed as Workflow/Activity arguments;
- credentials resolved inside Activities;
- opaque IDs preferred to user/account data;
- sensitive payload encryption where required;
- canonical Ture audit remains independent of Temporal history.

## 3.9 Long-running workflow policy

Use bounded histories and `Continue-As-New` for long-lived workflows.

Worker deployments must use version-safe rollout/rollback before any critical production orchestration depends on Temporal.

## 3.10 Development path and cost gate

Development mode:

```text
TEMP-00/01
Temporal TypeScript SDK + local Temporal dev server
cost: $0
```

Do not create a paid Cloud dependency for the first prototype.

Cloud-specific evaluation may begin only after local workflow contracts, replay tests and failure behavior are green.

Temporal Cloud currently offers free trial credits; if Ture later reaches the Cloud evaluation gate, activate the credits then, not earlier.

If the company meets Temporal's startup-program eligibility, evaluate startup credits before paying normal plan fees.

Expected later paid baseline:

```text
Temporal Cloud Essentials: from $100/month
Worker hosting: local $0 during development;
                production hosting selected later
```

A small always-on worker can later be hosted separately from the web app. Hosting vendor selection is intentionally late-bound.

## 3.11 Roadmap sequence

- `TEMP-00` — Canonical Temporal architecture contract.
- `TEMP-01` — Local TypeScript prototype using the integrated/local dev server.
- `TEMP-02` — Non-critical durable workflow pilot, preferably Agent eval or outcome completion.
- `TEMP-03` — Failure/retry/replay/priority verification.
- `TEMP-04` — Temporal Cloud trial/credit evaluation if local evidence justifies it.
- `TEMP-05` — Hot-candidate durable orchestration.
- `TEMP-06` — Position-follow-up boundary and critical-workload review.
- `TEMP-07` — Formal production promotion decision.

## 3.12 Timing

Plan now.

Prototype only after Milestone B's server-owned durable state contracts are stable enough that Temporal orchestrates canonical Ture commands rather than becoming a substitute for unfinished domain state.

Production promotion should occur before Ture depends heavily on long-running automated workflows.

---

# 4. EXT-02 — Catalyst Intelligence Layer

## 4.1 Objective

Allow Ture to distinguish technical movement from event-driven movement and understand *why* a stock is moving.

This directly extends the product's existing News/Catalyst Awareness concept.

## 4.2 Source architecture

```text
commercial fast source
(Benzinga candidate)
        ↓
fast structured catalyst context

SEC EDGAR
        ↓
primary-source filing evidence

Ture deterministic normalization
        ↓
CatalystSnapshot
        ↓
scanner / ranking / Agent Intelligence
```

## 4.3 Candidate commercial data

Benzinga is currently the preferred commercial candidate because relevant datasets include:

- Why Is It Moving;
- Stock Market News;
- Press Releases;
- Analyst Ratings;
- Earnings;
- Corporate Guidance;
- FDA Calendar;
- Economic Calendar;
- other structured event datasets when useful.

## 4.4 Primary-source verification

SEC EDGAR should be integrated independently for filing-related evidence.

SEC data is a public/free source and should be used before paying for redundant filing access where possible.

## 4.5 Canonical catalyst contract

Suggested fields:

```text
catalyst_detected
catalyst_type
catalyst_timestamp
source
primary_source_available
primary_source_verified
catalyst_summary
catalyst_confidence
catalyst_risk
expected_time_sensitivity
news_driven_move
technical_only_move
```

## 4.6 Authority boundary

An LLM/agent may summarize or classify supplied evidence.

It may not invent a catalyst or turn unsupported web/news text into canonical market truth.

## 4.7 Development path and cost gate

Start with:

- SEC EDGAR: `$0`;
- Benzinga public samples/documentation where available: `$0`;
- Benzinga commercial terms: information gathering only.

Benzinga offers a free-trial request path, but the trial should not be started until Ture has a working adapter contract and eval harness.

Public pricing is not assumed. Treat Benzinga as `QUOTE_ONLY` until terms are received.

## 4.8 Manual vendor-discovery requirement

Before paid or trial activation, collect from Benzinga:

- trial length;
- trial datasets/endpoints included;
- whether Why Is It Moving is included;
- real-time news/press-release coverage;
- analyst ratings, earnings, guidance, FDA and economic-calendar availability;
- rate limits and streaming options;
- latency/SLAs;
- historical access included in trial/paid plan;
- single-user/private internal development terms;
- future multi-user/commercial redistribution terms;
- monthly vs annual minimum commitment;
- setup/onboarding fees;
- cancellation terms;
- startup/early-stage discounts;
- whether trial activation can be deferred until integration is ready.

## 4.9 Roadmap sequence

- `CAT-00` — Catalyst taxonomy and normalized contract.
- `CAT-01` — SEC primary-source adapter.
- `CAT-02` — Benzinga sample/fixture adapter without paid subscription.
- `CAT-03` — Vendor quote/trial readiness review.
- `CAT-04` — Just-in-time Benzinga free trial.
- `CAT-05` — Catalyst outcome dataset and ablation.
- `CAT-06` — Controlled recommendation/ranking influence.

## 4.10 Timing

Integrate SEC and contract work relatively early.

Activate a commercial real-time feed only when Ture is ready to measure whether catalyst context changes recommendation quality.

---

# 5. EXT-03 — Precision Market Data Layer / SIP

## 5.1 Objective

Keep broad scanning cost-efficient while adding high-quality quote-level data only for the small subset of candidates close to execution.

## 5.2 Architecture

```text
existing broad market-data provider
→ universe / candles / screening

qualified candidate
→ precision quote source
→ bid / ask / spread / quote state

execution candidate
→ entry/liquidity validation
```

## 5.3 Candidate provider

Alpaca is the preferred initial precision-data candidate because development can begin on the Basic plan and full US exchange coverage can be activated later.

## 5.4 Data features

Potential features:

- NBBO bid/ask;
- spread and spread percentage;
- bid/ask size;
- quote freshness;
- trade/quote sequence;
- exchange context;
- short-term quote stability.

## 5.5 Development path and cost gate

Use Alpaca Basic first:

```text
cost: $0
```

Build the contract, adapter, tests and shadow metrics against the free tier.

Do not activate Algo Trader Plus until Ture reaches execution-focused shadow testing where full US exchange SIP data is actually required.

Known later cost:

```text
Algo Trader Plus: $99/month
```

At that point it also provides OPRA options data, which may cover the later Options Context experiment without an additional subscription.

## 5.6 Roadmap sequence

- `SIP-00` — Quote/liquidity contract.
- `SIP-01` — Free-tier/IEX adapter and fixtures.
- `SIP-02` — Execution-shadow readiness review.
- `SIP-03` — Activate one month of full SIP only when eval-ready.
- `SIP-04` — Spread/liquidity/slippage outcome analysis.
- `SIP-05` — Controlled Execution Ready influence.

## 5.7 Timing

Before meaningful semi-automatic execution.

No need to pay during broad scanner development.

---

# 6. EXT-04 — Market Breadth & Regime Intelligence V2

## 6.1 Objective

Improve Market Regime classification by measuring whether index movement is broadly supported.

Potential inputs:

- SPY, QQQ, IWM;
- sector ETFs;
- VIX where licensed/available;
- advance/decline proxies;
- percent of monitored universe positive/negative;
- percent above VWAP;
- up/down volume;
- new highs/new lows where available;
- sector participation;
- dispersion/concentration.

## 6.2 Cost policy

Prefer deriving breadth from data Ture already licenses.

Expected early incremental cost:

```text
~$0
```

Do not purchase a dedicated breadth feed until internal breadth calculations have been evaluated first.

## 6.3 Roadmap sequence

- `BREADTH-00` — Feature contract.
- `BREADTH-01` — Historical/local calculation.
- `BREADTH-02` — Live shadow regime comparison.
- `BREADTH-03` — Outcome ablation.
- `BREADTH-04` — Controlled regime influence.

## 6.4 Timing

Medium priority and likely before advanced Agent Intelligence promotion because regime quality benefits every downstream recommendation.

---

# 7. EXT-05 — Research Data Lake

## 7.1 Objective

Separate canonical product state from the growing research/history estate.

## 7.2 Architecture

```text
SUPABASE
canonical application truth

+

PARQUET OBJECT STORAGE
immutable research history

+

DUCKDB / POLARS
replay / analytics / feature engineering / evals
```

## 7.3 Data candidates

Research storage may contain:

- candles;
- feature snapshots;
- candidate snapshots;
- research/shadow samples;
- agent assessments;
- catalyst snapshots;
- historical replay packages;
- microstructure samples;
- outcome datasets.

## 7.4 Development path and cost gate

Start completely local:

- Parquet files: `$0`;
- DuckDB: `$0` software;
- Polars: `$0` software.

Only add remote object storage when local datasets need durable/shareable storage.

Cloudflare R2 is the preferred initial candidate because its current Standard free tier includes 10 GB-month storage, 1 million Class A operations and 10 million Class B operations per month.

Expected early remote cost:

```text
$0 while inside free tier
```

Beyond the free tier, current Standard storage pricing begins at `$0.015/GB-month` plus operations.

## 7.5 Roadmap sequence

- `DATA-00` — Research dataset/provenance contract.
- `DATA-01` — Local Parquet export.
- `DATA-02` — DuckDB/Polars analysis path.
- `DATA-03` — R2 free-tier pilot if remote durability is needed.
- `DATA-04` — Historical/backfill integration.
- `DATA-05` — Canonical research-provenance gate.

## 7.6 Timing

Before Milestone D creates large historical/shadow datasets, or earlier if Supabase research volume becomes material.

---

# 8. EXT-06 — Independent Replay & Backtest Validator

## 8.1 Objective

Prevent Ture from trusting only its own historical/replay implementation.

Use QuantConnect LEAN or another independently implemented event-driven engine as a second validator for material hypotheses.

## 8.2 Architecture

```text
frozen historical package
          ↓
      ┌───┴────┐
      ↓        ↓
Ture Replay   LEAN
      ↓        ↓
      └───┬────┘
          ↓
compare
          ↓
disagreement → investigate before promotion
```

## 8.3 Targeted failure classes

- lookahead leakage;
- session/time-zone mistakes;
- corporate-action mistakes;
- fill-model differences;
- historical ordering errors;
- price-reference mistakes;
- hidden Ture replay assumptions.

## 8.4 Development path and cost gate

LEAN can be used as open-source software locally.

Expected software cost:

```text
$0
```

Use local compute first. Dedicated cloud compute is optional and should be added only when large replay workloads justify it.

## 8.5 Roadmap sequence

- `REPLAY-00` — Common frozen input contract.
- `REPLAY-01` — One reference setup.
- `REPLAY-02` — Cross-engine result comparison.
- `REPLAY-03` — Known lookahead/time-zone negative cases.
- `REPLAY-04` — Promotion-package integration.

## 8.6 Timing

Required before major Milestone D learning/scoring promotions rely materially on historical simulation.

---

# 9. EXT-07 — Production Observability Layer

## 9.1 Objective

Separate runtime health observability from trading-domain audit.

```text
Ture ActiveScanTrace
= domain decision truth

Temporal history
= workflow progression

OpenAI trace
= agent reasoning/tool observability

OpenTelemetry / Sentry
= runtime errors, performance and health
```

## 9.2 Development path and cost gate

OpenTelemetry software is open/free.

Sentry Developer can be used at `$0/month` for one user and includes error monitoring/tracing.

Do not upgrade to a paid Sentry tier until actual collaboration/integration/quota needs justify it.

Known current Team baseline:

```text
$26/month
```

## 9.3 Roadmap sequence

- `OBS-00` — Correlation-ID and privacy contract.
- `OBS-01` — OpenTelemetry baseline.
- `OBS-02` — Sentry Developer free-tier integration.
- `OBS-03` — Agent/Temporal/domain trace correlation.
- `OBS-04` — Paid-tier review only if needed.

## 9.4 Timing

Before Temporal and Agent Intelligence become meaningful production dependencies.

---

# 10. EXT-08 — Model, Prompt & Experiment Registry

## 10.1 Objective

Provide controlled identity, lineage and comparison once Ture has multiple real model/prompt/scoring/calibration variants.

Potential tracked objects:

- Setup Analyst versions;
- prompt versions;
- scoring versions;
- Market Regime versions;
- Entry Timing versions;
- Confidence Calibration versions;
- Strategy Selector versions;
- PostTradeAnalyst versions.

## 10.2 Candidate platform

MLflow is the preferred initial candidate for experiment tracking, prompt/model registry and evaluation linkage.

## 10.3 Authority boundary

MLflow records candidates and evidence.

Ture's own Model Change Governance remains authoritative.

A registry alias such as `production` must never by itself deploy a trading-policy change.

## 10.4 Development path and cost gate

Use either:

- MLflow open-source self-hosted: `$0` software; or
- MLflow Cloud current free managed offering where acceptable.

No paid registry infrastructure should be added until experiment proliferation creates a real governance problem.

## 10.5 Roadmap sequence

- `MLOPS-00` — Experiment identity contract.
- `MLOPS-01` — Free/local tracking.
- `MLOPS-02` — Prompt/model registry.
- `MLOPS-03` — Ture promotion-package linkage.
- `MLOPS-04` — Remote/paid registry review only if needed.

## 10.6 Timing

Late Milestone D.

---

# 11. EXT-09 — Market Microstructure / Depth Research

## 11.1 Objective

Determine whether Level 2/Level 3 information materially improves Ture's entry timing and execution quality.

Potential features:

- market-by-price depth;
- market-by-order depth;
- order-book imbalance;
- microprice;
- depth-weighted spread;
- liquidity depletion;
- quote pressure;
- short-horizon book instability.

## 11.2 Evidence rule

Depth data begins as `research_only`.

Required question:

> Does Ture with microstructure information outperform the same Ture without it on out-of-sample entry/execution metrics?

## 11.3 Development path and cost gate

Databento historical usage-based data is preferred for the first experiment.

New accounts currently receive `$125` of historical-data credits that expire after six months.

Therefore:

**Do not create/activate the Databento evaluation account until `MICRO-01` is implementation-ready.**

Use the credit window for a frozen experiment, not generic exploration.

Live Databento US Equities is currently expensive and must be classified `EVIDENCE_GATED_EXPENSIVE`.

Known current live plan reference:

```text
Databento US Equities: ~$4,000/month
```

This must not be activated during normal development unless historical/shadow evidence first demonstrates likely material value and the operator explicitly approves the cost.

## 11.4 Roadmap sequence

- `MICRO-00` — Historical depth research design.
- `MICRO-01` — Fixture pipeline ready; then activate Databento free credits.
- `MICRO-02` — Small frozen historical dataset.
- `MICRO-03` — Feature extraction and entry-timing shadow comparison.
- `MICRO-04` — Execution-quality ablation.
- `MICRO-05` — Procurement/promotion decision.

## 11.5 Timing

Late, preferably after meaningful semi-automatic execution data exists.

---

# 12. EXT-10 — Options Context Intelligence

## 12.1 Objective

Test whether options-market context provides incremental information for equity day-trade decisions.

Potential research features:

- unusual options activity;
- put/call imbalance;
- implied volatility context;
- short-dated/0DTE concentration;
- activity changes around catalysts.

## 12.2 Boundary

Options context is initially auxiliary `research_only` evidence, not a trigger.

## 12.3 Development path and cost gate

If Alpaca Algo Trader Plus has already been activated for SIP, OPRA options coverage is included and the initial options-context experiment can use the same subscription.

Expected incremental cost after SIP activation:

```text
$0 additional
```

If deeper dedicated OPRA history/live access is later required, a separate data source may be evaluated. Databento OPRA Standard is currently around `$199/month`, but it should not be activated unless the Alpaca-based experiment proves the signal is worth pursuing.

## 12.4 Roadmap sequence

- `OPT-00` — Options context schema.
- `OPT-01` — Use already-paid/available data where possible.
- `OPT-02` — Historical/shadow collection.
- `OPT-03` — Setup/outcome correlation.
- `OPT-04` — Ablation against baseline.
- `OPT-05` — Optional controlled influence.

## 12.5 Timing

Late Milestone D or beyond.

Lower priority than catalyst intelligence, breadth, SIP, core learning and execution quality.

---

# 13. Cost-minimized roadmap order

## Phase X0 — Planning only; no new subscriptions

Plan and contract:

- Temporal;
- Catalyst Intelligence;
- SIP precision layer;
- Breadth V2;
- Research Data Lake;
- Independent Replay Validator;
- Observability;
- Experiment Registry;
- Microstructure;
- Options Context.

Target incremental vendor cost:

```text
$0/month
```

## Phase X1 — Free/local foundations

Use:

- Temporal local dev server;
- SEC EDGAR;
- Alpaca Basic;
- local Parquet/DuckDB/Polars;
- LEAN local;
- OpenTelemetry;
- Sentry Developer;
- MLflow free/local;
- vendor sample files.

Target incremental vendor cost:

```text
~$0/month
```

## Phase X2 — Just-in-time trials/credits

Only when eval harnesses are ready:

- Temporal Cloud free credits;
- Benzinga free trial;
- Databento $125 historical credits;
- Railway or equivalent worker-host trial if remote worker testing is needed.

Target incremental cash spend:

```text
~$0 if credits/trials remain within limits
```

## Phase X3 — First justified recurring subscriptions

Likely candidates:

```text
Temporal Cloud Essentials      from $100/month
Alpaca Algo Trader Plus        $99/month
Sentry                         $0 initially; Team $26 if needed
R2                             usually $0 early; usage-based later
Benzinga                       quote-dependent
```

These must be activated only at their explicit roadmap gates.

## Phase X4 — Evidence-gated expensive capabilities

Examples:

- live Level 2/3 US equities;
- dedicated options feeds;
- enterprise data redistribution licenses;
- higher Temporal plans;
- paid model/experiment infrastructure.

No automatic progression from prototype to these tiers is allowed.

---

# 14. Current public price/trial planning snapshot — August 2026

This table is planning evidence only and must be rechecked at activation time.

| Capability | Development path | Expected development cash cost | Later known/public cost |
| --- | --- | ---: | ---: |
| Temporal local | local TypeScript SDK/dev server | $0 | $0 local |
| Temporal Cloud | activate credits only when cloud eval-ready | $0 during available credits | Essentials from $100/mo |
| Temporal startup program | apply only if eligible | $0 | $6,000 credits/1 year if accepted |
| SEC EDGAR | public API/data | $0 | $0 |
| Benzinga | samples + sales discovery; trial just-in-time | $0 before paid activation | quote-dependent |
| Alpaca Basic | free adapter/prototype | $0 | $0 |
| Alpaca full SIP/OPRA | activate at execution-shadow gate | $0 before gate | $99/mo |
| Breadth derived locally | existing data | ~$0 | ~$0 incremental |
| Parquet/DuckDB/Polars | local | $0 | $0 software |
| Cloudflare R2 | only when remote lake needed | $0 within free tier | $0.015/GB-month Standard beyond free storage allowance + ops |
| QuantConnect LEAN | local open source | $0 | compute only |
| OpenTelemetry | open source | $0 | $0 software |
| Sentry Developer | free tier | $0 | Team $26/mo if needed |
| MLflow | local OSS or free Cloud | $0 | paid hosting only if later required |
| Databento historical | activate $125 credits only at MICRO-01 | $0 within credits | usage-based |
| Databento live US Equities | do not activate during normal development | $0 before gate | ~$4,000/mo |
| Dedicated Databento OPRA | not initially needed if Alpaca paid plan already active | $0 before gate | ~$199/mo if later justified |

---

# 15. Manual procurement/discovery actions

## Benzinga — do now, but do not activate trial

The operator should contact Benzinga now solely to collect commercial and trial terms.

Preferred request posture:

- private/internal single-user development today;
- possible future commercial/multi-user product later;
- US equities day-trading use case;
- interest in Why Is It Moving, real-time news/press releases, analyst ratings, earnings, corporate guidance, FDA and economic calendar;
- request a quote and free-trial details;
- explicitly ask whether the trial can be started later when integration is ready.

Do not sign an annual contract or begin a paid subscription as part of vendor discovery.

## Temporal — do not subscribe yet

No manual Cloud signup is required for `TEMP-00/01`.

Use local Temporal first.

When Cloud-specific testing becomes necessary, use the available free credits; if eligible, evaluate the startup program before paying the normal monthly plan.

## Databento — wait

Do not create the credit-bearing account until the historical microstructure experiment is ready because the current free credits expire six months after signup.

## Alpaca — paid plan later

The Basic plan is enough for adapter development.

Do not activate the $99 plan until the execution-shadow Action explicitly requires complete SIP/OPRA coverage.

---

# 16. Promotion and removal rules

Every external capability promotion package must include:

### Identity

- provider/product;
- plan/tier;
- adapter version;
- contract version;
- code revision;
- dataset/time period.

### Cost

- trial/free-tier status;
- monthly recurring cost;
- usage-dependent cost;
- renewal/commitment terms;
- cancellation path.

### Quality

- baseline result;
- variant result;
- out-of-sample comparison;
- subgroup/regime/setup breakdown where applicable.

### Reliability

- uptime/error behavior;
- latency;
- stale/missing-data behavior;
- fallback behavior.

### Privacy/licensing

- data retention rules;
- redistribution rights;
- account/user-data implications;
- secret handling.

### Rollback

- feature flag or provider switch;
- baseline path;
- data migration requirement, if any.

A capability should be removed or remain unpromoted if it adds complexity/cost without measurable value.

---

# 17. Definition of Done — EXT-00 planning adoption

The external-capability architecture is considered planned when:

- this specification is canonical/reviewed;
- every external capability has an explicit purpose;
- each capability has a free/trial-first development path where possible;
- each recurring subscription has an activation gate;
- expensive live-data products are explicitly late/evidence-gated;
- Temporal is defined as orchestration, not trading truth;
- catalyst sources are separated into fast commercial context and primary-source verification;
- the data lake is separated from canonical application state;
- independent replay validation is required before major historical-learning promotions;
- observability is separated from domain audit;
- product/model registry authority remains subordinate to Ture Model Change Governance;
- roadmap merge order is reconciled against current main before delivery.

---

# 18. Permanent external-capability rule

> **Plan useful capabilities early. Pay for them late. Promote them only after evidence.**

The target architecture is:

```text
more relevant evidence
+
better durability
+
better independent verification
+
stronger evaluation
+
strict cost discipline
+
deterministic Ture authority
=
better Ture
```

not:

```text
more vendors
+
more subscriptions
+
more signals
+
more complexity
=
better Ture
```
