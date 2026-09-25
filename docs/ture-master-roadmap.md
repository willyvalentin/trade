# Ture Master Roadmap

## Active product direction — scientific validation and IBKR first, 2026-09-21

The user's 2026-09-21 specification selects **scientific validation → autonomous
internal paper → autonomous IBKR paper → approved limited live → controlled
live automation**, with options research and separately gated options execution.
IBKR is the primary broker for all new execution work. Avanza is maintenance-only:
preserve existing records, ownership and safety fixes, but build no new Avanza
handoff or automation capability. This supersedes the former Avanza EX-1/EX-2
sequence and the blanket rule parking all execution engineering behind IF-5.
It does not waive evidence gates for real capital or activate any broker.

The repository remains the only control source. The [ledger](./ture-current-state-ledger.md)
selects work; [governance](./roadmap-operating-governance.md) controls delivery.
Notion is not maintained or used for selection. The complete user specification
is preserved in [the dated source specification](./ture-scientific-validation-ibkr-spec-2026-09-21.md).
Its numerical examples are illustrative, not observed results or approved limits.

**2026-09-23 market-timing decision.** The former named morning/midday/power-hour
publication windows are historical operating constraints, not a product
principle or a recommendation quota. A scheduled tick is a bounded observation
opportunity; during a verified regular session Ture should discover, evaluate
and serve a qualified recommendation whenever fresh evidence and provider
capacity permit. The cadence is budget-, freshness- and health-adaptive, not
one API request every second. A legitimate `no_trade` remains a useful result.
Pre-/after-market information stays separately labelled research/watch data;
late-session entry safety is retained until separately validated. This decision
does not itself enable a provider call, scheduled production run or broker action.

### Delivery priority — CLOSED readiness before OPEN, 2026-09-24

Within SV-A/A.2, prioritize a cohesive, reproducible scheduled-runtime → durable
decision → readback delivery before expanding the affected live experiment.
Reuse existing repairs and tests; close demonstrated gaps rather than starting
a competing implementation. Its CLOSED acceptance includes built-runtime
integration with an isolated database, provider-boundary fixtures, controlled
time, failure/restart cases and a tested evidence reader. Its OPEN acceptance
remains a separately authorized, attributable real-session observation.

Follow [operating governance](./roadmap-operating-governance.md) and the
[OPEN test contract](./open-market-test-contract.md): prepare outside market
hours, verify readiness before the session, then run bounded evidence-producing
observations at eligible times. Independent CLOSED slices with satisfied
dependencies continue during waits. This adds no roadmap phase and does not
block all downstream research on alpha or on one pending market observation.

Separate operational reliability, data fitness and recommendation quality in
acceptance. Do not count green CI, one live candidate or a complete `no_trade`
as demonstrated strategy improvement. Efficient observation-series control
(attempt/credit caps, stop conditions and automatic expiry) is a capability to
implement and verify before use, not permission to widen current one-shot limits.

### Destination and retained principles

Ture observes licensed market data, classifies market state, discovers candidates,
forecasts outcomes, ranks net expected value, selects an instrument, allocates
risk, executes through deterministic controls, manages positions, reconciles,
measures costs and outcomes, and tests improvements. Scientific validation and
paper research continue permanently after live launch. Neither implementation
nor a successful simulation guarantees positive alpha.

- Discover beyond a static watchlist; retain the existing zero-to-three public
  equity shortlist policy until a versioned evaluation justifies changing it.
  Research volume is separate from published recommendations and execution.
- `NO TRADE` is a complete decision, never a failure to fill a quota. Positive
  expectancy after costs, uncertainty and portfolio fit matter more than win rate.
- Preserve decision-time truth, immutable lineage, owner isolation, source
  entitlement, coverage, missingness, provider budgets and fail-closed freshness.
- Models propose; deterministic Ture Core owns risk, state and order authority.
  Research findings never rewrite a production strategy automatically.
- Deployed backend services and durable storage run without the dashboard or a
  user's workstation. Dashboard closure, process restart and a missed schedule
  must not lose an order, position or observation.
- `Research`, `Internal Paper`, `IBKR Paper`, `Limited Live` and `Scaled Live`
  have distinct account identities, credentials, routes, ledgers and enablement.
  Research/internal paper must have no live-order credentials or reachable live
  submission capability. No silent paper-to-live fallback is permitted.

### Starting point and reuse — main `0dbdcb53`, 2026-09-20

This is an incremental plan, not a rewrite. Existing IF-0/IF-1 decision records,
IF-2 source/coverage/budget receipts, IF-3 context boundaries, IF-4 baseline
readiness/freeze/pagination and IF-5 policy comparisons are candidate foundations.
`lib/recommendation-policy-comparison.ts` already separates held-out and
walk-forward samples and calibrated probabilities from ordinal confidence.
These source capabilities are not evidence of a completed autonomous portfolio,
production-ready IBKR adapter or validated alpha. Existing paper-session UI and
historical replay helpers must be inspected and reused where suitable; a helper
name or fixture result does not establish an unattended service.

Phase SV-A closes the bounded operational gaps in the current engine and records
remaining evidence honestly. It does not require proving profitability before
building the research infrastructure needed to investigate profitability. Map
IF-2/IF-3 operational acceptance into SV-A and IF-4/IF-5 research implementation
into SV-B/E/F/G/J; keep their receipts and unresolved gates. Historical MVP 18-row
coverage remains historical and is not the denominator for this larger program.

### Release outcomes and dependency order

Phase IDs use `SV-A` through `SV-U` to correspond to specification section 62;
these are not the old Milestone A/B/C labels. Alphabetical order is not a mandate
to postpone prerequisites. Only the ledger-selected primary and optional
independent CLOSED slice are active, within the two-slice limit below.

| Release outcome | Required phases / acceptance | What may follow |
| --- | --- | --- |
| R-SCI-1: autonomous internal equity paper | A, B, C and the basic D observer; C includes baseline risk, event checks, portfolio accounting and cost instrumentation | Collect forward evidence continuously; no live capital |
| R-SCI-2: reproducible scientific laboratory | D, E, F, G, H, I, J, K; calibrated/versioned research and fully attributed results | Admit only strategies whose frozen gates pass; a rejected strategy is a valid scientific result |
| R-IBKR-P: autonomous broker rehearsal | C + L + M, with base N telemetry, account isolation and deterministic risk | Test integration without claiming paper fills reproduce live execution |
| R-IBKR-L: human-approved limited live | Applicable A–G/I/J/K capabilities, F strategy gates, M operational proof and N TCA; O release approval | Human approves each entry; exit permissions are separately bounded |
| R-IBKR-A: controlled equity automation | O live evidence + P scope/limits/ramp/drift/kill-switch gates | Only named validated strategies and allowed accounts/instruments |
| R-OPT: options research, selection and execution | Q → R → S → T with B/E/F/G/I/K/N and separate options validation | Approval-required options first; auto only after its own live evidence |
| R-EXEC: measured execution optimization | U after enough attributable N/O data; separate T data for options | Shadow challenger, then bounded promotion and rollback |

Working order: **A → B → C + basic D → E/F**, expanding G/K context and I/J
controls before live admission. Start L's bounded API/account/deployment feasibility
work after A/B rather than discovering an authentication obstacle at launch;
actual IBKR paper execution waits for C/L. Build N telemetry into C/L and finish
its broker attribution with M. H and options research need not delay a qualified
small equity live release, and options do not require equity full-auto activation.
Q may start after a stable equity evidence path and B/E/F foundations exist, if
the ledger selects it. No parallel stream is created merely by this map.

### First internal-paper pilot — deliberately bounded

The first C release runs **one versioned existing equity strategy, long-only,
whole shares, at most ten eligible liquid US equities and one open paper position
at a time, during regular trading hours only**. A records the actual strategy ID
and versioned symbol-selection rule from existing supported data; this pilot cap
does not replace the eventual market-wide discovery objective. Use one entry
order policy, initial protective stop, partial/final exit and end-of-day handling.
Include simulated partial/unfilled orders, restart/retry and an honest no-trade
path. No options, shorting, live orders, dynamic allocation or new model training
is required to complete this first operational slice.

C records a configurable virtual starting balance, per-trade/open-risk and daily
loss caps before the pilot is enabled; no assumed live-money allocation follows.
Its minimum observer shows engine health, decision/rejection, pending orders,
position, cash/equity and realized result. Advanced D analytics may follow.
Success is a complete unattended backend lifecycle with durable reconciliation,
not a polished dashboard, profitable day or quota of trades. Close the browser
and restart the worker during controlled verification. Expand universe,
concurrency and strategies only after this operational gate passes, within the
existing A–D phase budget. A failed or absent strategy edge does not invalidate
an otherwise working experimental paper service.

### Data, cost and operational acceptance before enabling a pilot

During A.1/A.2, put the following small readiness record in the existing ledger;
do not introduce a new governance service. Reuse actual provider and budget
receipts, and mark unavailable inputs explicitly.

| Record | Required concrete decision and evidence |
| --- | --- |
| Data | Named source/feed, entitlement, retention/research rights, available history/depth, timestamps and revisions, covered symbols and missingness; separate equity, events and later options needs |
| Capacity and cost | Numeric request/credit limits per minute/day, retry reserve, concurrency, storage/retention and compute budget; monthly currency cap and cost attribution; remain within existing approved spend until any increase is authorized |
| Execution feasibility | Quote/bar resolution sufficient for the chosen strategy, fill model and monitoring cadence; unknown intrabar ordering stays conservative/unresolved, not invented |
| Health and recovery | Numeric maximum data age at decision and execution, monitoring/heartbeat interval, detection timeout, decision-to-intent latency, restart/reconciliation deadline and recovery-point objective, with measurement method |
| Failure response | Stale/missing data or missed heartbeat blocks new entries; separately specified management of existing paper positions; no silent quote/strategy substitution |

Freeze the operational thresholds before the observed pilot session. Choose
values from the strategy horizon and demonstrated source capacity, not arbitrary
universal trading constants. Durable acknowledged intents/fills must have zero
loss and zero duplicate economic effects across retries/restarts; any uncertain
state requires reconciliation before new entries. Equity/cash/position checks
must reconcile under an explicit rounding/currency policy. Test each numeric
health/recovery threshold with a timed fault or replay, then verify actual
latency/freshness in the declared OPEN session. Missing numeric limits or
unavailable data block enabling the dependent pilot, not independent CLOSED
implementation. Later IBKR and options phases revalidate these requirements for
their own account, instrument and data path.

### Evidence checkpoints — continue, narrow or stop

These are short ledger decisions inside existing phase budgets, not new phases
or recurring approval paperwork. The technical lead may choose a reversible
continuation within existing scope; external spending and live activation retain
their separate authority requirements.

| Checkpoint | Decision supported by evidence | Next action |
| --- | --- | --- |
| After first autonomous C session | Did the engine operate without the UI, reconcile durable state and meet the pilot's frozen health/risk limits? | Continue only the proven operational scope; otherwise repair the first failure before widening it; update A–D estimate |
| After first E/F replay evaluation | Is the replay reproducible/leakage-safe, are costs credible, and is the strategy result pass/fail/inconclusive under the frozen charter? | Continue a supported hypothesis, narrow an unsupported claim or reject the strategy; do not tune acceptance to its result; update research/data estimate |
| After L feasibility and first complete M broker-paper journey | Do account/session recovery, contracts, orders/protection and reconciliation actually work within the supported API/hosting path? | Confirm or revise the adapter/hosting choice, narrow unsupported order types or park the blocked integration; update L–O estimate; no automatic live activation |

At each checkpoint record evidence/revision/environment, remaining defects,
measured effort if available, changed estimate, chosen scope and one next slice.
Rejecting a strategy is a useful research outcome; it does not justify adding
more infrastructure to rescue the hypothesis.

### Phase plan, effort and market evidence

Hours are **remaining active engineering effort**, including implementation,
focused tests, review, operational checks and necessary documentation, with reuse
of the starting-point code. They are preliminary judgement ranges, not measured
velocity, elapsed model runtime or a promise of profitable strategies. External
waiting, market observation days, account onboarding, paid data acquisition and
infrastructure bills are excluded. Shared work is charged once: C owns baseline
paper risk/accounting/event checks; I/K extend them; C/L own instrumentation and
N extends analysis; B owns registries and later phases consume them.

`CLOSED` means code, CI, replay, historical/data processing or account connectivity
checks that do not require fresh regular-session behavior. Authorized external
services can still be needed. `OPEN` means an actual exchange-calendar-confirmed
regular-session observation, quote/fill/exit or forward cohort. `SPLIT` requires
both. All phases can be coded CLOSED; none require writing code during OPEN.
Market state, environment, dependency readiness and external authority are
separate fields. A closed market is not a reason to bypass missing data or gates.

| Phase | Deliverable and demonstrable completion | Dependencies | CLOSED implementation / checks | OPEN evidence / external wait | Active hours |
| --- | --- | --- | --- | --- | --- |
| SV-A — current engine finish | Reproduce a scheduled scan → decision record → outcome/readback; bound remaining failures and preserve honest no-trade/coverage | Existing IF baseline | Fix first real operational defect; regression, source/cohort and outcome checks | SPLIT: one eligible scheduled session; entitlement/coverage receipt remains required | 32–64 |
| SV-B — decision/model infrastructure | Reconstruct an accepted, rejected and no-trade decision with exact code, data, feature, model and strategy versions | A interface stability; reuse IF-1/4 | Immutable event/schema lineage, model/strategy registry, as-of metadata, durable readback and rollback identity | SPLIT: capture/reconstruct actual scheduled decisions; never infer forward evidence from fixtures | 48–96 |
| SV-C — autonomous internal paper | Backend completes a paper trading day without login, with orders, fills, portfolio, exits, costs and restart recovery | A, B | Shared decision interface, worker/scheduler, persistent order state, realistic fills, ledger, baseline risk/event filters, basic regime label, safe restart and kill controls | SPLIT: start with 3–5 full-session operational observations including no-trade; collect trades only if eligible | 120–220 |
| SV-D — paper/research dashboard | Server state reconciles to account, activity, performance, attribution, calibration and engine-health views | C/B for basic observer; E/F/G/H results for advanced views | Read-only observer, equity/returns/drawdown, sample size/validation labels, cost and freshness disclosure | SPLIT: view real paper session; closing browser has no engine effect | 48–88 |
| SV-E — market replay | Same decision/risk/portfolio/exit core replays a stored day deterministically without future data | B, C; licensed point-in-time data | Virtual clock, event order, symbol/corporate-action history, deterministic random seed, latency/fill simulation, data-gap rejection, restart/replay equivalence | CLOSED: no market window needed; historical coverage/license can block; scale from 1 day to multi-regime corpus, e.g. 250 days | 80–160 |
| SV-F — OOS/walk-forward validation | A frozen experiment yields reproducible pass/fail/inconclusive scorecard on untouched data | B, E; reuse IF-4/5 | Training/validation/test isolation, walk-forward, leakage checks, calibrated probabilities, net metrics, uncertainty, baseline comparisons and versioned gates | SPLIT: forward shadow sample/time requirements remain after historical evaluation; weeks/months may be needed | 64–120 |
| SV-G — market regimes | Point-in-time trend/volatility/breadth/momentum/liquidity/dispersion/index/risk-appetite labels explain conditional strategy results | A, B; reuse IF-3; E for historical testing | Versioned features, regime attribution and shadow strategy enable/disable policy; absent data stays unknown | SPLIT: verify synchronized fresh inputs; multi-regime evidence accumulates without forced trades | 48–96 |
| SV-H — shadow/counterfactuals | Compare baseline and alternative entry, stop, exit and sizing on identical opportunities, including rejects | B, C, E/F infrastructure | Independent simulated portfolios, cost/fill uncertainty, equal budgets, frozen experiment families; no production writes | SPLIT: forward shadow observation; options alternatives join after Q | 64–120 |
| SV-I — portfolio/allocation | Competing signals are selected under cash, open-risk, sector, correlation, beta and concentration limits | C, G, F framework | Extend C accounting to cross-signal net-EV ranking, dynamic sizing and stress scenarios; reject unsupported risk estimates | SPLIT: concurrent-opportunity and exposure readback; lack of opportunities leaves proof pending | 64–120 |
| SV-J — drift/health | Detect feature, regime, performance, calibration and execution deterioration; narrow or pause safely | B, F, G; N inputs when available | Baseline versus rolling-window metrics, minimum sample, alert/pause/rollback and restart tests; separate drift from outages | SPLIT: forward monitoring/false-alarm evidence; 100/200/500-trade windows only when populated | 48–96 |
| SV-K — event risk | Earnings, macro/company events, ex-dividend, splits, halts and expiry affect admission and sizing explicitly | B, G; extend C baseline deny rules | Licensed calendars, point-in-time revisions/timezones, missing-feed policy and historical/synthetic event scenarios | SPLIT: fresh calendar/halts handling; rare events need not be awaited for fault simulation | 40–80 |
| SV-L — IBKR foundation | Separate backend adapter identifies correct account/contracts, persists order intent/events, reconciles and recovers | A/B stable contracts; C lifecycle before order integration | API/session feasibility, persistent hosting, connect/authenticate, account/buying power/position/order reads, submit/modify/cancel, execution/position subscriptions, contract tests | SPLIT: account/auth checks may run CLOSED; fresh quotes and meaningful fills require OPEN; permissions and credentials are external dependencies | 80–160 |
| SV-M — autonomous IBKR paper | Signal → risk → paper order → fill → position → exit → reconciliation with no per-trade user input | C, L, base N telemetry | Failure injection: uncertain submit, duplicate/out-of-order events, disconnect, cancel/replace, orphan protection, restart | SPLIT: plan 5–10 operational paper sessions including reconnection; not a profitability gate or substitute for fills not observed | 64–120 |
| SV-N — transaction cost analysis | Decision, arrival, order and execution reconcile to gross/net edge and attributable cost | B/C telemetry; L/M for broker data | Arrival benchmarks, spread/slippage/latency, missed/partial fills, cancellation, commissions and impact estimate disclosure | SPLIT: paper measures simulation; actual live TCA starts with O and remains a separate cohort | 40–80 |
| SV-O — one-click limited IBKR live | A human-approved, freshly revalidated equity intent executes with verified protection, exit and reconciliation | F scientific gate, G/I/J/K risk context, M operational gate, N telemetry | Approval expiry and exact intent binding, live account allowlist, per-order risk recheck, incident/rollback runbook | OPEN: explicitly authorized supervised small-capital trials; initially plan 5–10 sessions, extend for missing scenarios | 56–104 |
| SV-P — controlled equity auto | Named strategies run within permissions, capital stages and automatic withdrawal rules | O observed live behavior, F/J gates, N paper/live comparison | Permissions by strategy/setup/instrument/universe/confidence/regime/risk, risk reservations, ramp and two distinct emergency controls | OPEN: staged forward live evidence; initial planning allowance 10–20 sessions, never automatic time-based promotion | 64–120 |
| SV-Q — options research data/pricing | Reproducible option chain and forecast distribution yield costed contract scenario results | B/E/F foundation, stable equity evidence path; G/K context | Contract IDs, strike/expiry/DTE/Greeks/IV/bid-ask/volume/OI; forecast calibration, pricing, skew/surface/term structure later; expiry/assignment scenarios | SPLIT: licensed chains/underlying quotes, fresh Greeks/IV and feed alignment; historical data availability is separate | 96–180 |
| SV-R — autonomous options shadow | Each eligible equity opportunity compares stock, long call/put and later defined-risk vertical spreads without capital | Q, C/H, F | Parallel option portfolios, costs/partial fills/exercise/assignment, equity comparison and options attribution | SPLIT: forward observations across expiry, liquidity and volatility conditions; underperformance retained | 64–120 |
| SV-S — instrument selection | Rank stock/call/put/defined spread on calibrated net EV, downside, liquidity and portfolio risk; abstain when unclear | Q/R evidence, F, I, G/K | Common capital/risk basis, uncertainty, theta/IV sensitivity, portfolio Greeks; shadow comparison and rollback | SPLIT: out-of-sample and forward shadow selection before eligible promotion | 64–128 |
| SV-T — IBKR options execution | Approved options trades reconcile by leg and position; auto is a later separate gate | L/M/N/O operational controls, Q/R/S strategy evidence, permissions | Combo orders, tick/multiplier checks, incomplete legs, assignment/exercise/expiry and margin stress; no naked short options | SPLIT: IBKR options paper first, then authorized limited live; initial allowance 5–10 sessions plus relevant expiry evidence | 80–160 |
| SV-U — execution optimization | A cost model improves net execution versus frozen policy without worse fill/risk behavior | N and enough O/P or T instrument-specific live evidence | Market/limit choice, offset, patience, timing and liquidity sizing; paired replay/shadow and holdout validation | SPLIT: prospective bounded live challenger; no automatic change from a historical win | 64–128 |

Observation-session counts are initial **operational planning allowances**, not
statistical acceptance thresholds. A valid no-trade day passes availability checks
but does not prove fills or exits. Use reproducible replay/fault injection for rare
scenarios, and separately record which broker behaviors were actually observed.
Re-estimate each phase when selected, after its first 4–16-hour vertical slice.

### Effort roll-up and calendar limits

- A–D, including the complete D dashboard: **248–468 active hours**. The first
  internal-paper release can ship before advanced D research views, but do not
  claim that reduction until the selected slices establish it.
- All A–U capabilities: **1,328–2,560 active hours** (rounded planning range:
  about 1,300–2,600 hours). This includes options and
  execution optimization; it is not the effort required before the first useful
  paper release.
- At an illustrative 30 effective engineering hours/week, A–D is roughly
  8–16 engineering weeks and the entire scope 44–85
  engineering weeks. These are capacity scenarios, not measured project velocity.
  Parallelization may shorten some elapsed work but does not divide integration,
  review, account setup, dataset acquisition or evidence waits by agent count.
- Observation can overlap later CLOSED implementation. Forecast elapsed time
  from the dependency critical path plus non-overlapping waits, not by adding
  every phase's session allowance. Scientific validation may require months and
  may never support a particular strategy's live promotion.
- Largest uncertainty: current-engine defects, historical point-in-time/options
  coverage, IBKR account/API/session fit, deployed worker operations and the
  number of strategy iterations. Rebaseline after A, first autonomous C session
  and L feasibility; never preserve an obsolete total for appearance of progress.

### Acceptance gates and scientific integrity

Each phase has three separately reported states: **implemented**, **environment
verified**, **release/strategy accepted**. Record exact build, strategy/data/model
versions, environment, market session, fixtures versus observed inputs, pass/fail
criteria and remaining gap. The code may be complete while the scientific gate
is inconclusive or failed. Never count 21 phases as equal effort units.

1. **A/B operational gate:** durable, attributable decisions and truthful coverage,
   freshness/no-trade/outcomes; one bounded licensed data path works without UI.
   Unknown probabilities/EV stay unknown. A heuristic score is not a probability.
2. **C internal-paper gate:** strict isolation, risk veto before every simulated
   order, portfolio/cash/fees invariant checks, restart idempotency, a full session
   without frontend, and first simulated fills/exits reconciled to source inputs.
   Uncalibrated baseline strategies remain explicitly experimental paper-only.
3. **E/F scientific gate:** freeze hypothesis, baseline, population, strategy
   version, evaluation windows, cost/fill assumptions, sample requirements,
   concentration limits and numeric pass/fail thresholds **before evaluation**.
   Training selects parameters, validation selects models, untouched OOS tests
   judge them. Purge/embargo overlapping label horizons and prevent ticker/time
   leakage; use as-of availability timestamps, delisted securities and correct
   corporate actions. Track multiple comparisons and correlated signals; use
   uncertainty intervals/effective samples, not raw trade count alone.
4. **F/J promotion gate:** positive net OOS expectancy with predeclared uncertainty
   and drawdown/calibration/coverage/feasibility limits, across stated periods
   and relevant regimes without one ticker/period dominating; forward shadow,
   explainable attribution, rollback and monitored withdrawal. 5,000–10,000
   timestamped signals is a research target, not sufficient independent trades
   or a universal guarantee. Poor evidence means reject/inconclusive, not tune
   the gate until it passes. Compute calibration curves/error on a specified
   event/horizon, not a generic confidence badge.
5. **M broker gate:** verify account/contract identity, order acknowledgements,
   partial/rejected/unfilled orders, protection/exit semantics, restart and
   reconciliation. IBKR Paper establishes integration, not live execution alpha.
6. **O/P live gate:** explicit account/strategy/instrument/risk enablement after
   scientific and operational gates. O requires a human-approved entry and
   bounded exit permissions; P permits autonomous entries only within named
   limits. Capital stages advance on evidence, never on elapsed days or an
   implementation checkbox. Compare paper/live fills, costs, latency, expectancy
   and drawdown; deteriorating evidence reduces risk or pauses entry.
7. **Q–T options gate:** calibrated distributions and options-specific OOS,
   paper, lifecycle and limited-live evidence. Start stock/long calls/long puts;
   admit bull-call/bear-put debit spreads separately. No naked short options.
   Defined payoff risk is not a guarantee against assignment, legging, liquidity
   or temporary stock/margin exposure; lifecycle controls must handle these.

Metrics must include gross/net/realized/unrealized P&L, costs, returns by trade/day/
week/month, equity and drawdown depth/duration, volatility/downside deviation,
Sharpe/Sortino/Calmar, profit factor/payoff/expectancy/expected and realized R,
MFE/MAE and their timing, holding duration and sample size. CAGR and VaR are shown
only with stated horizon/model/sufficient data; undefined statistics stay undefined.
Attribution covers setup, ticker, sector/industry/market cap, direction, confidence,
time/day, regime, entry/exit/stop/target/sizing and every version. Options add
DTE/delta/moneyness/IV/liquidity/event proximity. Cost accounting must avoid
subtracting spread/slippage twice when already embedded in fill prices.

### Internal-paper accounting and research completeness

SV-C owns a configurable virtual starting balance (the specification's $100,000
is an example), cash, reserved buying power, settled/unsettled amounts as relevant,
realized/unrealized P&L, equity, open/closed lots, gross/net/sector exposure and
current/maximum drawdown. Reconcile fills, commissions, FX where applicable,
corporate actions and partial exits to the ledger. Model bid/ask, spread,
slippage, latency, partial/rejected/unfilled orders, stops, targets, trailing and
end-of-day exits; bar ambiguity must be conservative or explicitly unresolved.
Do not assume a stop fills at its trigger or that a signal price is a fill.

SV-B preserves accepted/rejected signals and explicit no-trade runs, including
proposed plan, size, holding horizon, confidence/probability/EV with their meaning
and availability, feature/market snapshots and component versions. Store missing
probability or EV as unavailable, never a fabricated calibrated value. SV-C may
run an explicitly experimental baseline; F gates its scientific claims and
Q/S add forecast-distribution and cross-instrument valuation. Preserve point-in-
time raw evidence and dataset manifests under licensed retention rules; use
resource budgets for parallel research, checkpointing and recoverable scheduling.
Shadow portfolios reserve capital independently and cannot double-count one
opportunity as many independent observations. Counters for rejected/missing
samples make storage limits and selection bias visible.

Provider-rights admission must distinguish an active-subscription retention
right from a post-termination deletion obligation. A public instruction to
delete data after a subscription ends is never a numeric right to retain exact
prices or candles while the subscription is active. Public cache examples also
do not establish a retention duration. If exact decision, fill or exit evidence
is reconstructable from provider prices, the applicable plan and account must
have a current, account-scoped provider confirmation that states the numeric
retention ceiling and resolves applicable third-party US-equity terms. A pure
reconciliation result may make that evidence eligible for an independent
database-admission review; it cannot itself admit rights, provision a pilot,
activate a worker or authorize a provider or broker action.

### IBKR design boundaries to resolve in SV-L

Use one domain decision/risk/portfolio core and capability-aware adapters for
internal simulation, IBKR Paper and IBKR Live. Domain interfaces include
connect/authenticate, get account/buying power/positions/open orders, place/modify/
cancel orders, executions and subscriptions. Keep broker transport separate from
strategy logic. Persist intent before send; use durable correlation to broker order
and execution IDs. A submit timeout is **unknown**, not permission to resubmit:
reconcile first. Handle duplicate/out-of-order events, partial-fill/cancel races,
restart, manual broker changes and unknown positions. IBKR is the authority for
actual orders/fills/positions; Ture retains its decision/audit history.

Choose TWS API + IB Gateway versus Web API after a bounded account-specific
feasibility check: supported authentication/reauthentication, account permissions,
market data, connection limits, order types, hosting and recovery. Do not promise
unattended broker authentication before this is demonstrated. Internal paper
must remain autonomous even when a broker session needs operator restoration.
A persistent execution worker needs suitable server-owned hosting; a browser or
short-lived request handler is not the broker connection owner.

Before every submit/replace/increase, validate current strategy permission,
account/environment, price freshness, event state, cash/buying power, per-trade
risk/size, daily loss, open-position count, correlated/sector exposure, drawdown,
allowed instrument/session and broker connectivity. Reserve risk atomically
across concurrent orders. Risk-reducing exits follow a separately defined emergency
policy. Stops do not guarantee an absolute loss cap through gaps or outages.

`STOP AUTOMATION` persistently blocks new entries and handles queued entry orders
without abandoning existing protection. `CLOSE ALL` is a separate authorized,
Ture-position-scoped best-effort action with cancellation/exit/reconciliation and
an incident state if markets or connectivity prevent closure. Fault tests cover
stale/corrupt feeds, loss limits, broker outages, mismatches, extreme events,
abnormal costs and severe drift. No control may claim a fill before confirmation.

Official IBKR sources rechecked 2026-09-25 for the L.1 contract boundary:
- [Paper trading limitations](https://www.interactivebrokers.com/docs/tws-api/doc/notes-limitations/limitations/paper-trading): simulated execution can differ from live; plan separate live evidence.
- [Web API sessions](https://www.interactivebrokers.com/docs/web-api/authentication/sessions): brokerage sessions and username-specific permissions constrain authentication; do not assume simultaneous sessions.
- [Current Web API documentation](https://ibkrcampus.com/campus/ibkr-api-page/webapi-doc/): authenticated usernames have global and endpoint-specific pacing limits, `/iserver` has a daily maintenance interruption, and individual access has account-type/funding prerequisites. These are future adapter inputs, not evidence that Ture's account is eligible.
- [First-party OAuth workflow](https://ibkrcampus.com/docs/web-api/authentication/oauth-1a/first-party-oauth/first-party-o-auth-workflow): creating a live session token does not itself initialize a brokerage session; session initialization and recovery remain explicit L gates.
- [API market-data requirements](https://www.interactivebrokers.com/docs/general/market-data-subscriptions/introduction): applicable subscriptions must be verified. IBKR-first execution does not automatically replace licensed research/discovery data sources or supply historical options coverage.

Implement SV-L in separately reviewable authority steps. L.1 owns durable paper
order identity and supplied-event reconciliation without transport. L.2 owns the
redacted read-only account/session feasibility contract and requires a persistent
server connection owner, explicit pacing/maintenance handling, exact paper
account and stock-permission readback, and visible authentication/recovery debt.
A later bounded environment probe may supply that receipt, but must keep all
submit/modify/cancel and live-account capabilities disabled. Only after an
account-specific route and recovery model are verified may a subsequent L slice
introduce a transport adapter, still behind deterministic Core authority.

### Market-window scheduling and first slices

Use the instrument's exchange calendar and `America/New_York`, including DST,
holidays and shortened sessions; never hard-code a fixed Swedish UTC offset.
Regular US-equity session observations are normally 09:30–16:00 New York time;
verify instrument/session eligibility before each test. Extended-hours evidence
is separately labelled and cannot substitute for regular-session fill/liquidity.
Options and stocks may have different instrument-specific closing/expiry rules.

| Window | Selected work | Evidence returned |
| --- | --- | --- |
| CLOSED / weekend | Build next 4–16-hour vertical slice, deterministic replay/fault tests, licensed historical processing, reports and baseline freeze | Reproducible behavior on fixed data; no claim of a new live session |
| Before OPEN | Deploy already verified candidate if authorized; check account/env, feed entitlements, limits, session and rollback | Ready or explicit blocker; avoid changing the experiment during observation |
| OPEN | Run predeclared bounded forward/data/paper/broker checks; collect decisions, fills and health automatically | Session/date/revision/cohort plus reconciliation; no forced trades |
| After CLOSE | Finalize due outcomes and fees, reconcile, detect gaps, update scorecard and select next failure | Durable evidence and one next slice; no automatic policy promotion |

Keep **at most two development slices**: one primary and, when useful, one
explicitly selected independent CLOSED slice. The second is allowed while OPEN
observations wait or while stable interfaces permit genuinely independent work;
it is not permission to skip phase dependencies or launch a second product
release. Automatic observation and after-session processing may continue within
their declared budgets; they are operating jobs, not extra development slots.

Each development slice has a named owner, acceptance criterion, 4–16h budget,
isolated branch/worktree, stable versioned interface, write/schema ownership and
integration order recorded in the ledger. One owner changes shared order,
portfolio or schema contracts at a time; dependent consumers wait for that
contract or use its frozen version. Integrate and verify against current main
before declaring either result complete. If collision, review backlog or
integration failures erase the gain, reduce to one slice and finish it.

Keep the observed OPEN candidate frozen: code, configuration, data contract,
strategy version and experiment charter. Develop separately; deploy a new
candidate between observations. A critical incident may stop the observation,
but the interrupted evidence stays labelled and the changed candidate requires
fresh relevant checks. Do not pool different candidates as one clean session.
At the next eligible OPEN window, run the prepared observation; do not miss it
to start another CLOSED task. Session, credential, entitlement, budget and sample
blockers are distinct and must not be relabelled as completed work.

Examples after their phase dependencies are met: E replay development while C
collects forward evidence; D observer development against C's stable read model
while L adapter integration uses its own stable contracts. Two simultaneous
rewrites of the same portfolio/order model are not independent. Measure verified
behavior, lead time and integration/rework cost before increasing concurrency;
this plan authorizes no more than two development slices.

First selections (budgets are subdivisions of A/B, not extra phase estimates):
- **A.1, 4–8h CLOSED:** verify latest main, current IF-2 probe status, reusable
  decision/baseline/outcome paths and one reproducible operational gap. End with
  a failing behavior or a verified path, not another architecture framework.
- **A.2, 8–16h SPLIT:** repair that first gap; take the next authorized scheduled
  observation and durable readback. Keep source/coverage limitations explicit.
- **B.1, 8–16h CLOSED:** attach a complete version/availability envelope to one
  real existing decision and reconstruct it through the existing readback.
  This is the first candidate for the second development slot once its
  interface/dependency conditions are met, including an A.2 OPEN wait.
- **B.2/C.1, 8–16h slices after predecessors:** one frozen decision produces one
  internal-paper intent/fill/ledger update with exact retry and restart behavior,
  then add exit and observer readback. No broker call or live-mode path.

### Specification coverage and completion reporting

The source document is the field-level checklist; the phase table is the delivery
plan. Do not silently omit a field because it is abbreviated in the table.

| Specification sections | Planned home |
| --- | --- |
| 1–4 | Destination, principles, release and scientific gates across A–U |
| 5–7 | C autonomous service/account and D observer dashboard |
| 8–9 | B immutable signal/model/strategy registries |
| 10–12 | E replay and point-in-time integrity |
| 13 | C realistic paper execution; calibrated with N/U |
| 14–15 | H parallel shadow/counterfactuals; R options extensions |
| 16–18 | C/D/F/N metrics, attribution, calibration |
| 19–20 | G market regimes and strategy use |
| 21 | C minimum event veto, K full event-risk coverage |
| 22–26 | E/F leakage, OOS, walk-forward, validation and scorecards |
| 27–28 | J all drift categories |
| 29–31 | C basic portfolio; I allocation/correlation/portfolio risk |
| 32–39 | Q forecast/options data/simulation, R shadow/attribution, S instrument selection |
| 40–42 | N TCA and U execution optimization |
| 43–49 | L adapter/service/lifecycle/idempotency/reconciliation |
| 50 | C shared baseline risk; I/K extensions; L/M/O/P per-order enforcement |
| 51–55 | O approval-first, C/M autonomous paper exits, P permissioned live exits/auto/ramp/kill controls |
| 56–58 | Environment separation, C internal paper, L/M autonomous IBKR paper |
| 59–60 | O/P capital ramp and paper/live divergence, N/J measurement |
| 61 | Permanent C/E/H/R research collection with B lineage |
| 62 | SV-A–SV-U phase map and dependencies above |
| 63–64 | Release outcomes and gates; every success item must have behavior evidence |

Track per selected phase: completed acceptance checks / its declared checks,
implementation versus environment/scientific acceptance, net-new behavior,
active hours if measured, waiting sessions, defects, next OPEN window and selected
CLOSED fallback. Do not invent total percent complete or turn commits into hours.
A strategy failing validation can complete a research experiment while remaining
ineligible for capital. Refine estimates from observed slice lead time and actual
defects; keep external data/market waits separate.

## Historical product direction — intelligence first, 2026-09-15 (superseded in selection)

Decision: **build the recommendation engine before expanding trade execution.**
Ture's next product outcome is not a richer broker workflow. It is a genuinely
useful US-equity day-trading engine: one that can discover opportunities beyond
a static watchlist, rank them honestly, publish only the strongest few and
become demonstrably better from its own attributable outcomes.

The repository is the only current product-control surface. This master roadmap,
the [current-state ledger](./ture-current-state-ledger.md) and
[roadmap operating governance](./roadmap-operating-governance.md) supersede any
Notion roadmap or status mirror. Do not update, reconcile or use Notion to pick
work. Retained history below remains evidence, not an active instruction.

### Product destination

Ture continuously observes the eligible US equity market, identifies developing
setups and surfaces **zero to three** trade-ready opportunities when the data
supports them. It explains each decision, preserves an immutable decision-time
record and learns which setups work for which ticker, sector, market regime and
time window. A correct `no_trade` is a first-class product result.

“Market-wide discovery” means that no hand-maintained watchlist is the ceiling:
the intended universe is every US-listed equity that is available from licensed
sources and passes explicit availability, liquidity, price and tradability
filters. It does not mean pretending that unavailable, stale or unlicensed data
is coverage.

The final product phase is controlled autonomous execution: Ture may submit a
BUY or SELL to Avanza only after the engine has proven useful and the order has
passed deterministic Ture Core risk, authority, idempotency, reconciliation,
monitoring and kill-switch controls. An AI model never has a direct broker path.

### Non-negotiable product principles

1. **Discover broadly, publish selectively.** Research candidates may be many;
   trade-ready recommendations are scarce.
2. **No fill quotas.** A weak candidate is never promoted merely to meet a
   target count or an active time window.
3. **Decision-time truth.** Every score, source timestamp, reject reason and
   plan must be attributable to the moment Ture made the decision.
4. **Research is not a recommendation.** Observing, developing, qualified,
   trade-ready, rejected, expired and no-trade are separate states.
5. **Measure before promotion.** A model, prompt, threshold or ranking change
   remains shadow-only until it beats a frozen baseline on the stated evidence.
6. **Deterministic authority surrounds probabilistic intelligence.** Ture Core
   owns risk, data class, state, execution limits and broker authority.
7. **Data quality is part of quality.** Missingness, freshness, source coverage,
   cost and provider reliability are measured inputs, never silent fallbacks.
8. **Quality is demonstrated, not asserted.** Recommendation quality is measured
   against predeclared, versioned criteria by setup and market regime. A high
   score, a single trade or a profitable day is never sufficient evidence.
9. **Cloud-native operation, no workstation dependency.** Scheduled collection,
   outcome evaluation, historical replay and shadow assessment run from
   deployed, server-owned compute with durable storage. A user workstation may
   inspect or approve work, but is never a required runtime dependency.
10. **Historical evidence is research, not live proof.** Point-in-time
   historical replays may generate hypotheses and eliminate weak policies. They
   remain separate from forward-live evidence, preserve source/version/time
   lineage, and cannot by themselves promote a ranking, confidence or
   publication-policy change.
11. **Capacity serves evidence, not consumption.** Provider capacity is used
    for the highest-value admissible observations with reserved retry and
    degradation headroom. Spending a quota is never a product outcome.
12. **Observe continuously, publish independently.** A scheduler may wake a
   bounded observation cycle, but a clock label must never decide that a
   candidate is worthy of publication. Observation cadence, provider spend,
   ranking and publication are separate, versioned decisions.

### Delivery and environment model

All product code and steering documents target `main` through small reviewed
branches and pull requests. `staging` is an integration environment, not a
second product line: use it only for bounded checks that need real provider,
schedule, authentication, migration or market-session behavior. Do not merge
the divergent staging branch wholesale; selectively transfer a change only when
its scope, test and current-main compatibility are understood.

The existing advisory, manual-recording, ownership and outcome infrastructure
is retained as a reusable foundation. Its historical MVP acceptance board stays
historical evidence; it no longer determines the next engine slice.

### Intelligence-first release map

| Release | User outcome | Acceptance evidence |
| --- | --- | --- |
| IF-0 — foundation reconciliation | One canonical main line can observe the whole existing scan flow safely and report provider limits precisely | Selected staging safeguards are ported with focused tests; no staging-only branch is required for ordinary product development |
| IF-1 — candidate decision record | Ture can explain every scan: what was considered, what was rejected and why no strong candidate was published | Immutable scan/candidate identities, complete pre-truncation membership, structured reject/no-trade reasons, source/freshness/version metadata and readback in the app |
| IF-2 — market-wide discovery | Ture can discover eligible movers beyond a static universe without exceeding provider capacity | Versioned universe policy, symbol coverage/readiness, dynamic mover and relative-volume intake, provider budget/coverage diagnostics, controlled backoff and a documented data-operations cadence |
| IF-3 — contextual quality engine | Ture ranks candidates using market, sector and ticker context rather than isolated chart signals | Point-in-time SPY/QQQ/IWM, sector/industry relative strength and catalyst-presence snapshots; one published quality policy with explainable components |
| IF-4 — measured learning dataset | Ture has the right evidence to know whether its selections were good | Complete visible, research, rejected and explicit no-trade samples; canonical outcomes, deduplication, outcome coverage, point-in-time replay and a frozen evaluation charter |
| IF-5 — shadow learning and promotion | Ture improves a policy only when evidence shows it helps | Held-out and walk-forward comparison; quality, calibration, feasibility, cost and reliability measures; shadow winner, versioned rollback-capable promotion and post-promotion monitoring |
| EX-1 — execution preparation | A proven recommendation can become a correct, human-confirmed Avanza order package | Account/instrument binding, deterministic order admission, risk limits, durable intent, reconciliation and recovery |
| EX-2 — controlled autonomous execution | Ture can submit and later close a narrowly scoped Avanza position automatically | Sustained engine evidence, explicit enablement, per-order and portfolio limits, kill switch, idempotency, audit, real-time monitoring, broker reconciliation and incident recovery |

### Market-window delivery map

The tags below classify work by the evidence it needs, not merely by when code
can be written. They make normal development capacity available outside the
regular US session without recasting fixture, replay or historical evidence as
current-market proof.

| Tag | Meaning | Boundary |
| --- | --- | --- |
| `CLOSED` | Can be implemented and verified locally, in CI, against durable evidence, or by an expressly authorized off-market research job. | It must not request current market data, publish a trade-ready candidate or represent an off-market result as current. |
| `OPEN` | Its acceptance evidence needs an observed eligible regular US session, fresh provider response, current market date or a forward-live decision. | Run only in a calendar-confirmed session and within its declared provider, retry and time-band budget. |
| `SPLIT` | Build and fail-closed verification are `CLOSED`; the final bounded live-admission proof is `OPEN`. | A passing closed phase never substitutes for the open-market acceptance evidence. |
| `PARKED` | The work is technically market-independent but blocked by release order or a missing evidence gate. | It is not an off-market capacity task until its predecessor is accepted and the ledger selects it. |

These tags do not create parallel product releases. The ledger still owns the
single active delivery. When that delivery is genuinely waiting only for an
`OPEN` observation, governance permits at most one separately selected
`CLOSED` supporting vertical slice; it must return to the market-bound
acceptance as soon as that session is available.

| Roadmap work | `CLOSED` lane — build, test or research | `OPEN` lane — bounded evidence that must wait | Current guardrail |
| --- | --- | --- | --- |
| IF-0 / IF-1 foundation and decision-record maintenance | Schema/readback compatibility, immutable-envelope validation and fixture/contract regressions. | A normal scan only when acceptance claims current source/freshness facts rather than stored historical evidence. | Completed foundation evidence does not establish a new current-market observation. |
| IF-2a Basic Free reference intake | Receipt/readback code, budget/backoff and partial-catalog containment tests. | A separately authorized normal scheduled catalog observation, live provider entitlement/credit receipt and current-environment readback. | The verified one-page receipt remains reference-only; no further request follows from it. |
| IF-2b symbol master, coverage and relative-volume contracts | Symbol identity/pagination, coverage-denominator, volume-admission and UI/readback contracts; fail-closed local tests and migrations when separately approved. | An actual collector/provider adapter with observed entitlement, complete coverage receipt, fresh regular-session volume and current-market readback. | A partial catalog or historical disclosure cannot expand discovery. |
| IF-2c paid-provider transition and data operations | Vendor-neutral provenance/cohort model, time-band budgets, backoff, receipt/UI and degradation tests. | Observed paid-source entitlement/feed scope and the declared forward-live shadow cohort. | No purchase, credential, provider request or public-data use is implied by the plan. |
| IF-3 contextual inputs and explainable quality policy | Point-in-time admission contracts, ranking explanations, data-gap UI and provider-free/caller-payload tests. | Fresh synchronized benchmark, sector, relative-volume or catalyst observations before an input can affect ranking. | A live-adapter or ranking-policy change also needs a versioned baseline comparison. |
| IF-4 measured learning and IF-4a outcomes/replay | Charter/baseline, durable receipts, outcome integrity, historical replay, coverage/missingness and readback work; after-session outcome evaluation is research-only. | Immutable decision-time capture and the forward-live samples needed to measure an actual policy. | Historical/replay and live-forward cohorts remain separate. |
| IF-5 shadow learning and promotion | Held-out/walk-forward evaluators, policy-versioning, rollback and drift-monitor implementation against frozen evidence. | The declared comparable forward-live shadow window and post-promotion monitoring. | A historical win, one candidate or one market day cannot promote a policy. |
| EX-1 / EX-2 execution | Deterministic Core design and safety-test preparation are market-independent in principle. | Any broker-facing order, reconciliation or real-time execution proof. | `PARKED` until IF-5 has sustained useful-quality evidence; no off-market exception opens execution work. |

### Operating schedule by market state

| Market state | Permitted high-value work | Never infer |
| --- | --- | --- |
| Regular US session (`OPEN`) | Highest-cadence admissible discovery/context observation, current-market admission, shortlist tracking and immutable decision capture. | That an API quota, partial response or a candidate count proves broad coverage or quality. |
| Pre-market / after-hours | Separately labelled extended-hours observation and catalyst/context collection only when the relevant policy and entitlement allow it. | Regular-session liquidity, freshness, tradability or trade-ready status. |
| After the regular session (`CLOSED`) | Due-outcome evaluation, source reconciliation, integrity checks and bounded historical/shadow replay. | A post-market result is a current recommendation or a policy promotion. |
| Weekend, holiday or other non-trading interval (`CLOSED`) | Reference/event ingest where licensed, data-quality checks, feature preparation, historical evaluation, replay and the selected closed supporting slice. | A closed-market observation is current, fresh trade data. |

### Engine capability sequence

#### IF-0 — foundation reconciliation

Port only the current-main-compatible staging changes that improve discovery
reliability: provider-credit/rate-limit classification and bounded,
provider-governed universe rotation. Preserve their bounded provider budgets.
Do not port the one-ticker manual rotation: it is a useful staging experiment
but contradicts market-wide discovery as a product strategy.

#### IF-1 — candidate decision record

Persist one complete decision envelope per scan before ranking results are
truncated or candidates are filtered. It must contain the universe/version,
all members, ranking and tie-break evidence, structured eligibility/rejection
codes, source/provider timestamps, freshness, data gaps, explicit no-trade
disposition and the engine/scoring/ranking/build versions.

The UI must show a scan report that answers: coverage, data health, strongest
unpublished candidates and why they did not become trade-ready. This is the
next active vertical slice.

#### IF-2 — market-wide discovery

Build a versioned symbol master and discovery policy for eligible US equities.
Add dynamic inputs in a deliberate order: real-time mover/relative-volume data,
then timestamped catalyst presence/type, then broader sector and event context.
Every provider decision needs a documented entitlement, rate/cost budget,
freshness contract, retry/backoff policy and coverage metric. Backfill begins
with the decisions Ture actually made, then expands only when the capacity data
supports it.

**IF-2a — bounded mover-intake foundation.** Before expanding provider scope,
ship a default-off, versioned admission for one explicitly costed mover request.
It must distinguish configured plan mode from observed provider entitlement,
require an explicit request budget, prevent diagnostic paths from spending
credits, apply persisted refresh/error backoff and retain a browser-readable
receipt. Dynamic intake may fill existing scanner capacity beyond static
symbols; it may not expand the per-run candidate budget or change ranking,
confidence or publication policy. This establishes reliable intake behavior;
it is not evidence of market-wide coverage or better recommendations.

**IF-2a acceptance evidence.** Local proof includes policy, budget, backoff,
selection-boundary and untrusted-receipt tests. Market-session proof requires a
normal authenticated scan with provider entitlement and credit budget observed
in the relevant environment, followed by persisted receipt readback. Only then
may IF-2 proceed to a real symbol master, explicit coverage denominator and
relative-volume provider contract.

**IF-2a Basic Free compatibility variant.** When the verified provider profile
is Basic Free, do not reinterpret it as Grow or Pro and do not request the
Pro-only market-movers endpoint. The only initial Basic-compatible intake is a
default-off observation of one `/stocks` page filtered to US common stocks.
It must reserve the documented one credit before the request under both an
explicit daily allowance and per-minute allowance, retain the reservation after
failure or timeout, capture the provider's catalog-count denominator, and show
a versioned browser receipt. A single catalog page is reference-only: it must
hard-code `collection_complete = false` and `discovery_feed_allowed = false`,
and cannot alter the scanner universe, ranking, confidence, publication or
execution.

**IF-2a Basic Free acceptance evidence.** Local proof covers the default-off
gate, exact one-winner reservation, daily and per-minute limits, untrusted
receipt rejection and the immutable partial-catalog boundary. Relevant
environment proof requires the additive reservation migration, a normal
open-market scheduled observation with the explicit Basic runtime and two
budget settings, persisted receipt readback and verification that no candidate
or recommendation path ran. That receipt proves only the observed page and
its denominator; it is never market-wide discovery acceptance.

**IF-2b — provider-free coverage and volume contracts.** Before any further
provider request, make the future data boundaries explicit and fail closed in
code. The symbol-master contract must preserve provider row lineage and access
metadata, require complete pagination proof, and accept only the declared US
common-stock scope with unambiguous ticker/exchange identity. The
relative-volume contract must require a verified regular session, matching New
York market date and elapsed-session minute, an adequate historical baseline,
point-in-time ordering and an explicit freshness limit. These contracts may
classify caller-supplied payloads but do not fetch, persist, alter scanner
selection, ranking, confidence or publication.

**IF-2b acceptance evidence.** Local tests must prove a partial catalog cannot
expand discovery, conflicting tickers are excluded, and stale, unverified,
misaligned or look-ahead volume data is not admissible. The later provider
adapter needs its own documented entitlement, credit/frequency budget,
coverage denominator, persisted receipt and current-market readback before it
can supply discovery.

**IF-2b Basic Free dynamic-coverage boundary.** A finalized `/stocks` receipt
can establish only the historical catalog denominator; it cannot make a Basic
Free profile market-wide dynamic discovery. Before any collector is admitted,
the product must retain a versioned capacity disclosure that derives the
one-credit-per-symbol lower bound from that receipt and its declared daily
budget, marks the Pro-only market-movers path unavailable on the configured
Basic Free profile, and hard-codes `discovery_feed_allowed = false`. This
disclosure must be pure and historical: it cannot read a current quote, infer
entitlement from configuration, request a page, choose a symbol, alter ranking
or publication, or authorize execution. A larger catalog page size is not
proven merely because the bounded eight-record observation succeeded; the
[provider documentation](https://twelvedata.com/docs) exposes `outputsize` but
does not itself prove a Basic-Free-safe page-size ceiling or storage envelope.
A future collection design needs separate provider-capability evidence and a
bounded, explicitly authorized rollout.

**IF-2c — paid-provider transition and continuous data operations.** Twelve
Data Basic remains the current development source and its reference-only
receipt must never be represented as broad real-time coverage. When Ture is
ready to begin owner-only forward-live collection for the learning dataset, the
current preferred evaluation candidate is Massive (formerly Polygon) Stocks
Advanced. That is a planning direction, not a purchase, configured credential,
provider entitlement, runtime authorization or claim that a marketed plan will
remain available on the same terms.

**Observation-cycle orchestration transition.** A scheduler or later event
source is only a safe wake-up mechanism, never a publication policy. A
versioned observation cycle must decide whether current data is warranted from
verified session, freshness, material market change, coverage, candidate state,
explicit provider budget and persisted retry/backoff facts. It must retain one
attributable receipt whether it observes, deliberately makes no request,
rejects data, evaluates research, publishes a trade-ready recommendation or
records `no_trade`. Observation, discovery/evaluation and publication remain
independently versioned decisions.

The provider boundary stays vendor-neutral. Every admitted observation and
derived feature must retain the provider, feed class, entitlement/profile,
coverage scope, upstream and receipt timestamps, adapter/build versions,
request cost and response-quality disposition. A source change creates a new
explicitly labelled learning cohort and baseline; Twelve Data and a new source
may be compared, but cannot be silently pooled for calibration, evaluation or
promotion.

Individual data plans are for owner-only/internal operation. Before Ture shows
third parties a recommendation whose material market data is externally
licensed, a separate business/display/redistribution decision must verify the
exact vendor rights, exchange obligations, attribution, retention, derived-data
and user-count terms. No individual-plan credential can become a public-product
data authority by configuration alone.

**IF-2c acceptance evidence.** Before a paid source affects discovery, a
provider-specific adapter must prove its actual entitlement and feed scope from
an observed response, retain versioned receipts and provider counters, enforce
a time-band budget/backoff policy, and fail closed on partial, stale, delayed,
ambiguous or unavailable data. It must then collect a declared comparable
forward-live shadow cohort without changing ranking, confidence or publication.
Only an IF-4 baseline that keeps the source cohorts separate may evaluate a
later source-backed policy change. A plan price, vendor webpage, successful
request or single candidate is not acceptance evidence.

**Observation-orchestration acceptance.** Preserve the existing scheduler's
kill switch, private invocation, idempotent trigger claim and durable attempt
record while moving to generic cycle receipts. Local proof must show that a
duplicate trigger cannot duplicate provider work; an unavailable claim fails
closed; stale, incomplete or unbudgeted data cannot reach ranking or
publication; and an observation can be recorded without generating a candidate.
Browser readback must distinguish trigger, admission, request, provider
response, freshness, discovery/evaluation and publication facts. Do not retire
`scheduled_scan_runs` or window-derived diagnostics until their consumers have
moved to compatible cycle readback; historical records remain intact. This
transition establishes safe observation behavior, not market-wide coverage,
better ranking quality or execution authority.

**Data-operations policy.** Ture is continuously operated from deployed,
server-owned compute, but it must not mistake an open API quota for market
information:

- During the eligible regular US session, run the highest-cadence admissible
  discovery, context and shortlisted-candidate observations.
- Treat pre-market and after-hours as separately labelled extended-hours data
  classes with their own freshness, liquidity, publication and provider rules.
- After the session, finalize due outcomes, reconcile source quality and run
  bounded historical or shadow replays. Those jobs are research-only unless a
  separately approved policy promotion says otherwise.
- During weekends, holidays and other non-trading intervals, process lawful
  reference/event data, integrity checks, feature preparation and historical
  evaluation. Never label an off-market observation as a current trade-ready
  signal.
- Allocate explicit budgets by time band and reserve capacity for retries,
  reconnects and provider degradation. Every scheduled request must be
  attributable; quota exhaustion, duplicate delivery or a provider fault must
  fail closed rather than widen discovery or publish a candidate.

#### IF-3 — contextual quality engine

Promote the existing shadow ideas only after their inputs are live and
point-in-time safe. Rank each candidate with independent, inspectable evidence:
market regime, sector/industry strength, relative strength, liquidity/volume,
setup quality, entry geometry, catalyst context and data quality. A score is an
internal ranking measure; confidence becomes a probability claim only after
calibration evidence exists.

**IF-3a — point-in-time market-context admission.** Before a regime can affect
selection quality, require one synchronized SPY/QQQ/IWM snapshot from a single
provider, verified regular-session and New York-date context, individual
freshness and explicit observation-time skew. A partial, stale, future,
duplicate or cross-provider snapshot must be unavailable rather than inferred
from a daily label or neutral fallback. This admission layer is context-only;
it does not fetch, persist or change ranking, confidence or publication.

**IF-3a acceptance evidence.** Local tests must prove each freshness, session,
timestamp, provider and benchmark-completeness boundary fails closed. A later
provider adapter must carry an explicit budget, persisted point-in-time receipt,
readback, a versioned ranking-policy change and comparable baseline evaluation
before its regime can affect candidates.

#### IF-4 — measured learning dataset

Evaluate visible recommendations, research candidates, rejected candidates and
explicit no-trade decisions without lookahead or horizon double counting. Keep
15m/30m/60m diagnostics, use one canonical primary outcome per decision and
measure MFE, MAE, R, trigger rate, outcome coverage and missingness. Freeze the
baseline before changing a threshold, prompt, source weighting or strategy.

Each evaluation must also preserve the decision-time inputs, derived features,
policy version and outcome rules needed to reproduce the result. It must report
outcomes by setup, ticker class, sector, market regime and time window, with
coverage and concentration visible for every reported aggregate. Rejected and
`no_trade` samples may not be silently excluded from the evaluation population.

**IF-4a — after-market outcome and historical-replay workflow.** During the
market session, Ture captures immutable decision-time evidence. After the
market, server-owned jobs complete due outcomes, assess outcome coverage and
missingness, validate data integrity, and run bounded historical replays of
explicitly versioned hypotheses.

Historical replay inputs must preserve the universe available at the historical
decision time, point-in-time source timestamps, corporate-action treatment and
all policy versions. They must reject lookahead, survivorship-biased, stale,
revised or incomplete input. Live-forward samples and historical/replay samples
remain separately identifiable and cannot be silently pooled.

Each completed job emits a durable, readable receipt: input scope, source and
policy versions, coverage, freshness, costs, failures, result disposition and
whether the output is eligible only for research or for later shadow comparison.
No after-market job may alter a live ranking, publication policy,
recommendation, position or broker state.

#### IF-5 — shadow learning and promotion

Test one hypothesis at a time against a held-out sample: for example, whether
sector-relative strength improves precision among the top-ranked candidates.
Compare precision@K, expectancy in R, calibration, coverage, provider cost and
reliability. A winning version runs in shadow first; promotion is one versioned,
reversible policy change with continuous post-promotion monitoring.

Historical replay can reject a weak hypothesis and prioritize a promising one,
but it cannot prove a policy improvement. Promotion requires both a frozen,
held-out historical comparison and subsequent forward-live shadow evidence over
a declared comparable sample. A promoted policy must outperform the frozen
baseline on the declared quality, coverage, reliability and cost measures, with
a versioned rollback rule and continuous post-promotion monitoring.

### Recommendation quality and promotion standard

The recommendation engine is judged by decision quality, not candidate volume
or isolated P&L. Before an IF-4 evaluation begins, its owner must freeze a
versioned evaluation charter. The charter is part of the durable evidence and
must define:

- the hypothesis, policy versions, eligible universe, setup and regime slices;
- the decision-time data contract, primary outcome semantics and all horizons;
- the minimum completed sample, held-out period and walk-forward window for the
  overall population and each material slice;
- the baseline and the predeclared numeric promotion thresholds for
  precision@K, expectancy in R, calibration error, outcome coverage,
  missingness, provider cost and reliability;
- the permitted concentration in a ticker, sector, setup or market regime, and
  the treatment of a sparse or unavailable slice; and
- whether feasibility inputs include spread, liquidity, volatility, halt risk,
  trigger attainment and conservative slippage. If an input is unavailable, the
  result must disclose that limitation and cannot claim executable performance.

Numeric thresholds must be selected before the policy's evaluation data is
read, justified against the frozen baseline and changed only through a new
versioned charter. They must never be relaxed merely to create a promotion.

A policy is eligible for shadow promotion only when it improves the
predeclared quality measures on held-out and walk-forward evidence without a
material regression in calibration, coverage, feasibility, data quality,
provider cost or reliability. It must then run alongside the active policy for
the charter's defined shadow window. Live promotion requires that this result
persists, remains explainable by setup and regime, is rollback-capable and has
post-promotion drift and withdrawal monitors. A monitor breach returns the
policy to shadow or `no_trade`; it never silently widens the publication gate.

### Publication quality bar

A trade-ready recommendation must have all of the following:

- fresh, attributable market data and an eligible tradability/liquidity state;
- a setup, timing rule, entry, invalidation, stop and target with valid risk
  geometry;
- evidence that the setup is realistically actionable for the stated time
  window, including the available liquidity and execution-feasibility limits;
- an explainable market, sector and ticker context, with all material gaps
  visible;
- a current engine/ranking policy version and decision-time snapshot;
- a score above the active publication gate; and
- no dominant risk, freshness, provider, position or execution-policy blocker.

Anything below that bar remains research, developing, rejected or no-trade. It
must never be presented as a strong trade merely because the market is open.

### Planning and acceptance rules

Use 4–16 active-hour vertical slices, but do not break the engine into
ceremonial contract-only work. Each slice reaches the UI, runtime and durable
evidence whenever that is needed for its claim. Tests and a ledger update ship
with the change. A lack of strong candidates on one market day is neither
success nor failure; it becomes meaningful only against the decision record and
outcome baseline.

A scheduler cadence is an implementation detail, not an intelligence or
publication policy. It may be changed only with a versioned observation policy,
bounded provider-cost evidence and compatible cycle readback; replacing a
calendar label must never weaken freshness, no-trade, quality or execution
boundaries.

Do not begin EX-1 or EX-2 until IF-5 has demonstrated sustained, useful
recommendation quality. Existing manual tracking may be maintained for safety
or data integrity, but it is not the primary product investment.

## Historical roadmap and technical evidence — not the active work queue

## Historical operating dashboard — legacy evidence only (formerly “Current operating dashboard”)

This dashboard is the short operational view of the roadmap. The detailed
Action history, source, exact-main CI and authorized readbacks remain the
evidence authority; this dashboard never creates runtime, provider, broker,
database, deployment, secret, transport, writer, route or UI authority.

| Control | Current state | Next required outcome |
| --- | --- | --- |
| Product direction | Privacy-first trading decision support; Milestone B is `complete_under_local_sandbox_acceptance_profile_v1`, while live runtime remains closed and deferred | Start a separate, explicitly authorized runtime milestone only if that product outcome is later chosen |
| Current bounded workstream | AI-02.3 through AI-02.15 are completed on exact main. AI-02.17's one separately authorized staging source invocation closed fail-closed with only HTTP 404 before any marker, provider, source or outcome evidence. AI-02.18's HTTP 401 is now attributed to the repository-owned `proxy.ts` session gate before dispatch for its non-allowlisted route, not to an unknown Netlify layer. AI-02.20 then used the existing `/api/automation/` public prefix for one temporary no-provider route proof, but received only HTTP 404 rather than its receipt. The missing local server-owned owner principal remains separately blocked. Temporary PRs, branches and worktrees were removed and proof-secret cleanup was invoked. The existing `historical_synthetic` receipt remains reproducible but non-evaluable, and the private legacy-evidence relation remains `legacy_incomplete` / `not_admitted` | Preserve v1 provenance and default-deny. AI-02.17, AI-02.18 and AI-02.20 are consumed: no retry, cohort, migration, active-evidence write, offline evaluation, promotion, runtime, deployment, broker or production work follows without a new decision. |
| B-01 source-only follow-on | PR #312 verifies an unbound canonical position-lineage projection on exact main; it is source evidence only, not canonical live state | No automatic successor; retain the closed runtime boundary unless a new product decision admits one |
| B-03 staging readiness | PR #314 verifies only an opaque-reference admission candidate. Action 666IY verified the private writer package, RLS containment and direct-table denial. [ACTION 666IZ](./action-666iz-b03-staging-private-transport-proof-containment.md) then verified current metadata for an existing dedicated least-privileged writer principal and direct-port reachability, but stopped before an authenticated session when its proof token lacked a secret-safe outbound caller path. [ACTION 666JB](./action-666jb-b03-private-transport-path-decision.md) retains the literal private-transport requirement and selects Supabase PrivateLink plus a same-region AWS VPC as the future path; current Pro cannot provide it. [ACTION 666JC](./action-666jc-b03-decision-accountability-reconciliation.md) records the autonomous controller, delivery automation and independent-verification boundaries for that defer decision. IP network restrictions remain public-path allowlisting, not a private path. | Keep B-03 `not_admitted` until the selected external infrastructure is explicitly provisioned. Then require a new staging-only non-public-path verification before a separately reviewed secret-safe caller, one dedicated-principal rollback call and an independent zero-row readback. |
| D-01.1 credential alias boundary | PR #329 is merged and exact-main verified as a source-only fail-closed resolver for server service-role aliases | It selects no secret value and admits no remote call, staging, runtime, deployment, provider, broker or production authority |
| C-01 canonical execution-intent audit foundation | [ACTION 666JD](./action-666jd-c01-canonical-execution-intent-audit-foundation.md) defines a source-only, owner-bound pre-broker intent identity and a proposed append-only audit relation. The contract accepts only exact semi-automatic, lineage-complete intents with `broker_result = null`, freezes the prepared candidate, and has no database or broker capability. Its proposed schema independently requires a nonblank, control-free market, an exact trigger/priority pair and finite positive quantity/price values. [ACTION 666JE](./action-666je-c01-adversarial-input-containment.md) additionally rejects uninspectable caller-owned object graphs before canonicalization and contains inspection faults in the existing rejected result. | Do not apply the migration or create a writer from these Actions. A later separately reviewed server-owned writer needs generated types, authenticated owner context, approved private transport, rollback and independent readback before any prepare-only broker integration is considered. |
| REL-03 provider degradation / freshness planning | [ACTION 666JF](./action-666jf-rel03-provider-degradation-fail-closed-defaults.md) makes the existing continuous-intelligence planner default to `unknown` capacity unless it receives both the exact `available` provider state and an affirmative capacity attestation. A caller-supplied optimistic degradation level cannot override unavailable, missing or false provider capacity metadata. | This is source-only allocation planning. It creates no provider observation, freshness measurement, runtime, route, database, deployment, broker or production authority. A later operational REL-03 step requires separately admitted real provider-health/freshness evidence. |
| CI cancellation reliability | PR #330 established the command-level boundary; follow-up PR #417 is merged and exact-main verified, forwarding cancellation to the active provider-free command's dedicated Unix process group and blocking later commands in that shard | The six-shard suite, required-check identity, fail-closed aggregate, branch protection and development CI profile are unchanged |
| REL-00 CI-B8 observation | CI-B0 is verified on exact main and CI-B7 is merged as PR #300. The former CI-B8 observation is superseded on 2026-09-04 by the explicit development-CI-profile decision; CI-B0 through CI-B7 and the partial CI-B8 record remain historical evidence, but CI-B8 is not claimed complete | Do not collect a further 14-day/10-PR CI-B8 decision record. Before any external release, provider, broker or production authority, start a separately authorized CI re-hardening review. |
| Next decision | [AI-02.17's staging actual-evidence operation](./ai-02.17-staging-actual-evidence-decision.md), [AI-02.18](./ai-02.18-preview-route-attestation-closeout.md) and [AI-02.20](./ai-02.20-proxy-route-attestation-closeout.md) are all closed. AI-02.20 resolved the earlier proxy attribution but did not receive a success receipt. CAT-00.12 consumed its one disposable identity and stopped fail-closed. ACTION 666IZ established that B-03 has an existing dedicated principal and a reachable **public** direct port, then closed fail-closed before a writer call. [ACTION 666JB](./action-666jb-b03-private-transport-path-decision.md) selects the future literal-private path: Supabase PrivateLink plus a same-region AWS VPC; the current Pro subscription cannot provide it. | Do not retry consumed AI/CAT proofs or treat 666IZ as a writer result. Do not silently downgrade the private-transport requirement. No remote proof is schedulable until the selected external infrastructure is explicitly provisioned; then a new staging-only non-public-path verification must precede any secret-safe caller or rollback-only proof. No current receipt authorizes runtime, deployment, broker or production work. |
| Deferred runtime gates | B-01's runtime capability and B-05 through B-12 are re-homed as unverified follow-on runtime work; PR #312's B-01 source projection does not alter that status, and remote staging remains `not_admitted` | Retain default-deny behavior and do not render the qualified closeout as live-capability completion |
| Delivery health | The executable workflow on protected `main` remains the authority. The selected development profile prioritizes a protected Full Ready gate, low merge-path duplication and independent regression coverage; this roadmap decision changes no workflow itself | Verify each CI change in its own protected PR. A scheduled or attested CI result never authorizes runtime, provider, broker, deployment or release activity. |
| Accountable controls | [ACTION 666JC](./action-666jc-b03-decision-accountability-reconciliation.md) records the Codex autonomous governance controller, delivery automation and independent automated verification for the B-03 defer decision | Apply the declared autonomous decision policy; do not infer authority from an Action, test, fixture or CI result |
| Cross-cutting AI-00 / EXT-00 / CAT-00 governance | The current-main refreeze in [AI-00 / EXT-00 / CAT-00 governance](./ai-ext-cat-governance-refreeze.md) preserves the one-agent, evidence-only Ture Core boundary; cost-gated external capabilities; and the Ture-owned WhyMove direction from historical PRs #122, #123 and #183 | It creates no agent-to-broker path, provider, spend, runtime, source call, deployment or production authority. Any such work needs a separate product and technical decision. |
| CAT-00.1 WhyMove evidence envelope | Completed provider-free, caller-supplied evidence-envelope boundary on exact main as PR #351 | It distinguishes discovery leads from attributable primary evidence and returns `evidence_validated_not_admitted` even for a valid paired fixture; no external adapter or product authority is created. |
| CAT-00.2 SEC EDGAR evidence receipt | Completed provider-free receipt validator on exact main as PR #354 | It binds only caller-supplied CAT-00.1 primary-evidence IDs to strict SEC archive locator, accession, digest and point-in-time receipt fields. A valid receipt remains `sec_edgar_receipts_validated_not_admitted`; no fetch, credential, persistence, runtime or product authority is created. |
| CAT-00.3 SEC EDGAR filing-content binding | Completed provider-free filing-content validator on exact main as PR #358 | It binds only dense caller-supplied UTF-8 filing text to an already valid CAT-00.2 receipt by exact digest and byte length. A valid result remains `sec_edgar_filing_content_validated_not_admitted`; no fetch, credential, persistence, runtime or product authority is created. |
| CAT-00.4 SEC EDGAR retrieval evidence | Completed provider-free retrieval-evidence validator on exact main as PR #362 | It binds one caller-supplied GET/no-redirect/credential-omit/200/text-HTML response capsule and filing body to each CAT-00.2 receipt, then rechecks CAT-00.3 body integrity. A valid result remains `sec_edgar_retrieval_evidence_validated_not_admitted`; no fetch, credential, persistence, runtime or product authority is created. |
| CAT-00.5 SEC EDGAR read-operation plan | Completed provider-free single-plan validator on exact main as PR #366 | It permits only one receipt-bound GET/no-redirect/credential-omit read plan with 200/text-HTML and response-cap constraints, and requires validate-only/no-persistence plus no runtime/advisory/broker effect. A valid result remains `sec_edgar_read_operation_plan_validated_not_executed`; no request or authority is created. |
| CAT-00.6 SEC EDGAR pre-read authorization | Completed provider-free pre-read authorization validator on exact main as PR #370 | It resolves only the receipt-before-first-read planning circularity by binding one CAT-00.1 SEC primary-evidence ID to one exact SEC archive locator and fixed validate-only request constraints. It creates no request, credential, persistence, runtime or external authority; an actual public read still needs separately authorized, machine-verifiable execution scope. |
| CAT-00.7 SEC EDGAR execution-scope policy | Completed provider-free execution-scope policy validator on exact main as PR #384 | It binds only a CAT-00.6-valid authorization to the same request constraints, one request, independent readback, containment and `not_authorized_not_executed`; a valid result creates no request, credential, persistence, runtime or external authority. |
| CAT-00.8 SEC EDGAR operator-record template | Completed provider-free operator-record validator on exact main as PR #388 | It keeps its four CI and containment requirements at `required_not_verified`; no request, credential, CI-policy, runtime, deployment, broker or production authority follows. |
| CAT-00.9 SEC EDGAR evidence-bundle contract | Completed provider-free contract on exact main as PR #399 | It keeps all four future CI/readback claims `claimed_complete_not_independently_verified` and validates no external fact; neither its protected delivery nor its exact-main provenance prove a policy readback, credential scope or external request authority. |
| CAT-00.10 GitHub evidence read-plan | Completed provider-free request-plan on exact main as PR #401 | Ready Full CI run `34132001317` passed the unchanged six-shard suite and protected aggregate; exact-main run `34134611027` passed the aggregate and post-merge provenance attestation. It fixes a future least-privilege identity requirement and five GET-only GitHub readback shapes, but makes no request, reads no environment, has no credential, policy, runtime, deployment, broker or production authority. |
| CAT-00.11 GitHub evidence-receipt validator | Completed on exact main as PR #407 (`1873030185e57d00ae055d4baa1748d53139c314`). Ready Full CI run `34238994272` passed the unchanged six-shard suite, protected aggregate and merge-candidate provenance; exact-main run `34242221280` passed the aggregate and post-merge provenance attestation. The provider-free validator binds only caller-supplied redacted metadata for CAT-00.10's five fixed GET paths and converts faulting proxy input into a fail-closed result. | It cannot make a GitHub request, read a credential or raw response, change CI/branch protection, persist data or authorize the later SEC EDGAR operation. A locally valid result is not independent proof that GitHub was contacted. Any external operation remains separately gated by a dedicated least-privileged identity, a fresh operator decision and independent evidence. |
| Agent Intelligence AI-00.1–AI-00.6 | Closed provider-free design/contract sequence; AI-00.6 exact-main verification is complete | Do not create a follow-on automatically. A baseline/outcome dataset or human promotion review needs a fresh product decision and separately authorized scope |
| Agent Intelligence AI-01.1 | Completed provider-free, source-only multi-fixture baseline-comparison contract on exact main as PR #317 | Keep the comparison in memory and default-deny; a real dataset, measured result or human promotion needs a new decision |
| Agent Intelligence AI-01.2 | Completed provider-free adversarial review of AI-01.1's frozen fixture-array boundary on exact main as PR #318 | Keep the comparison in memory and default-deny; no dataset, runtime or promotion authority is created |
| Agent Intelligence AI-01.3 | Completed provider-free fixture identity-collision review on exact main as PR #319 | Keep the comparison in memory and default-deny; no dataset, runtime or promotion authority is created |
| Agent Intelligence AI-01.4 | Completed provider-free issuer-admission review on exact main as PR #320 | Keep the check in-process and default-deny; a real dataset, measured result or human promotion needs a new decision |
| Agent Intelligence AI-02.1 | Completed server-only canonical-outcome projection boundary on exact main as PR #322 | Keep the projection source-only; a repository query, data collection or offline-evaluation/promotion admission needs a separate decision |
| Agent Intelligence AI-02.2 | Completed source-only issuer boundary for AI-02.1's redacted outcome projections on exact main as PR #324 | Keep provenance process-local and default-deny; it creates no durable receipt, repository query, dataset, evaluation or promotion authority |
| Agent Intelligence AI-02.3 | Completed source-only preflight for a bounded, in-memory cohort of AI-02.2-issued projections on exact main as PR #332; staging metadata reports no canonical rows. A production legacy-outcome aggregate found no row suitable for the canonical relation, and a staging synthetic fixture verified only rollback without persistence | It returns redacted cohort metadata only. Neither legacy outcomes nor the rollback proof are an eligible cohort; a separate decision must scope real eligible evidence creation before a dataset, evaluation or promotion can exist |
| Agent Intelligence AI-02 legacy evidence | The separately authorized staging-only operation created a private append-only relation and imported 500 redacted historical outcome records, each with an opaque source hash and fixed `legacy_incomplete` / `not_admitted` disposition | It is preservation evidence only, not a canonical cohort, evaluator input, writer, runtime, provider/model, deployment, broker or production authority |
| Agent Intelligence AI-02.4 | Completed provider-free, server-only quality assessment on exact main as PR #341, with governance closeout PR #342 | It accepts only a frozen aggregate legacy-evidence profile and confirms `noncanonical_preservation_confirmed` / `not_admitted`; it cannot read an environment, form a dataset, evaluate, invoke a writer or model, bind runtime, or affect deployment, broker or production authority |
| Agent Intelligence AI-02.5 | Completed server-only, provider-free source selection on exact main as PR #343 and separately authorized staging receipt proof | One append-only `historical_synthetic` receipt now exists in staging with deterministic digest/readback evidence. It remains `inactive_readiness_only` and creates no evaluator, promotion, writer/runtime binding, model/provider, deployment, broker or production authority |
| Agent Intelligence AI-02.6 | Completed server-only, I/O-free canonical-evidence receipt profile on exact main as PR #346 | It accepts only the exact separately verified inactive receipt metadata and returns `receipt_profiled_not_admitted`; it cannot query an environment, form a dataset, evaluate, invoke a model or writer, bind runtime, or affect deployment, broker or production authority |
| Agent Intelligence AI-02.7 | Completed [roadmap transition decision](./ai-02.7-canonical-evidence-creation-decision.md) on exact main | It records that no automatic static successor is permitted: only a separately authorized, staging-only creation of genuinely complete canonical decision-and-outcome evidence can unblock later cohort work. |
| Agent Intelligence AI-02.8 | Completed server-only, I/O-free [staging evidence-creation admission contract](./ai-02.8-staging-evidence-creation-admission.md) on exact main as PR #373 | It validates one exact future staging-only plan and returns `staging_scope_validated_not_authorized_not_executed`; it cannot access a database, form a cohort, evaluate, invoke a writer/model, bind runtime or affect deployment, broker or production authority. |
| Agent Intelligence AI-02.10 | Completed on exact main as PR #376: the additive `canonical_active_evaluation_evidence` v2 relation is separate from v1, RLS-contained, append-only and has no application-role grant; its seven-scenario disposable PostgreSQL proof passed on 2026-09-06 | It does not apply a migration to a shared database, bind a source, write evidence, form a dataset, evaluate, bind runtime or affect provider/model, deployment, broker or production authority. |
| Agent Intelligence AI-02.11 | The [server-owned completed-outcome source profile](./ai-02.11-server-owned-completed-outcome-source-profile.md) is completed on exact main as PR #377. It is I/O-free, selects the authenticated official scheduled outcome-evaluation shape over `public.recommendation_outcomes`, and its separately authorized [staging availability preflight](./ai-02.11-staging-availability-preflight.md) returned `no_completed_bundle_available` using an aggregate-only query | The selected source is unavailable today. Creating genuine server-owned completed outcome evidence needs a separate product and operational decision; this preflight creates no migration, source-row read, evidence write, evaluator, promotion, runtime, provider/model, deployment, broker or production authority. |
| Agent Intelligence AI-02.12 | [Staging completed-outcome source-creation admission](./ai-02.12-staging-completed-outcome-source-creation-admission.md) is provider-free and I/O-free. It fixes one future staging one-shot design to one server-owned official snapshot and at most one complete 15/30/60-minute outcome bundle, while excluding the scheduled function's five-batch/ten-snapshot default | Only a separately authorized staging-only cost, credential-identity and one-shot-transport preflight may consider preparing the isolated adapter. It creates no source-row read, secret read, provider invocation, outcome persistence, v2 migration, evidence write, evaluator, promotion, runtime, deployment, broker or production authority. |
| Agent Intelligence AI-02.13 | [Staging one-shot cost and transport admission](./ai-02.13-staging-one-shot-cost-transport-admission.md) is completed on exact main as PR #381. It validates only the exact future one-snapshot/one-batch/deploy-preview shape and caps its reusable official candle request at one for the 15/30/60-minute bundle | Only a separately authorized staging-only, non-secret credential-presence and branch-transport preflight may determine whether a temporary adapter can be prepared. It creates no credential-value or source-row read, provider/evaluator invocation, adapter deployment, outcome persistence, v2 migration, evidence write, evaluator, promotion, runtime, deployment, broker or production authority. |
| Agent Intelligence AI-02.14 | [Staging non-secret preflight admission](./ai-02.14-staging-nonsecret-preflight-admission.md) is completed on exact main as PR #382. It validates only the future staging metadata boundary: non-secret credential presence, required application-owner confirmation and deploy-preview context, with no connection or value read | Only a separately authorized staging-only execution may return minimized evidence under that boundary. It creates no credential-value or source-row read, provider/evaluator invocation, adapter deployment, outcome persistence, v2 migration, evidence write, evaluator, promotion, runtime, deployment, broker or production authority. |
| Agent Intelligence AI-02.15 | [Staging nonsecret preflight receipt admission](./ai-02.15-staging-nonsecret-preflight-receipt-admission.md) is completed on exact main as PR #383. It is provider-free and I/O-free and accepts only the fixed-redaction receipt for AI-02.14's three permitted facts. A later one-time Git deploy-preview proof built its temporary function artifact, but an inline client shell assignment yielded an empty request header and no receipt; the proof was fully cleaned | It does not admit a future one-shot adapter. The attempted preview produces no credential value or name, owner, deploy, source-row or staging-access evidence; provider/evaluator invocation, deployment, persistence, evaluation, runtime, broker and production remain excluded. |
| Agent Intelligence AI-02.17 | The [staging actual-evidence operation](./ai-02.17-staging-actual-evidence-decision.md) consumed its one authorized source attempt on 2026-09-08. The temporary Draft adapter returned fail-closed HTTP 404 before a marker, canonical-route dispatch, provider request or source/outcome creation; cleanup removed its secret, PR, remote branch and worktree | Closed. Do not retry or infer any staging cohort, migration, promotion, runtime, deployment, broker or production authority. A future replacement needs a separate decision and fresh containment evidence. |
| Agent Intelligence AI-02.18–AI-02.20 | [AI-02.20 closeout](./ai-02.20-proxy-route-attestation-closeout.md) preserves the predecessor facts and resolves the earlier 401 attribution: `proxy.ts` required an application session before dispatch for the non-allowlisted AI-02.18 path. AI-02.20's one temporary public-prefix function request then returned only HTTP `404`, not its fixed receipt | The former unknown-upstream hypothesis is closed, but no working preview transport is proven. Proof-secret cleanup was invoked and temporary PR #412, branches and worktree were removed. No source, provider, database, outcome, evaluator, runtime, deployment, broker or production authority follows. Do not retry. |

CAT-00.5 closed on exact main after PR #366 auto-merged as
`d2c6a43dcecd25f4f4af87ccc31b613dd2dc24c6`. Ready Full CI run
`34030816202` passed all six unchanged provider-free shards, the protected
aggregate and merge-candidate provenance POC; exact-main run `34032132038`
passed provider-free verification and the post-merge provenance attestation
for that exact commit. The local-only contract accepts exactly one
caller-supplied plan tied to one valid CAT-00.2 receipt: its exact archive
URL and evidence ID, `GET`, `redirect: "error"`, `credentials: "omit"`,
200/text-HTML and a 1 MiB-or-smaller response cap. It requires
validate-only/no-persistence, no runtime/advisory/broker action, not-executed
status and the CI re-hardening marker. Even a valid result remains
`sec_edgar_read_operation_plan_validated_not_executed`; it performs no fetch,
credential use, persistence, runtime, deployment, broker or production
behavior. CAT-00.1 through CAT-00.5 have no automatic external-data
successor: any actual public SEC read still needs a separately selected
product decision, exact machine-verifiable authority policy, independent
readback evidence, containment/rollback plan and CI re-hardening review.

CAT-00.6 closed on exact main after PR #370 auto-merged as
`67983c651d3e9ece44211d4c02b378dd787d684a`. Ready Full CI run
`34034952756` passed all six unchanged provider-free shards, the protected
aggregate and merge-candidate provenance POC; exact-main run `34036129374`
passed provider-free verification and the post-merge provenance attestation
for that exact commit. Under the selected development profile, the exact-main
matrix is intentionally skipped; it is not a second six-shard claim.

CAT-00.7 closed on exact main after PR #384 auto-merged as
`faedb0c1f351440fb28e4cb55d61068745eebb43`. Ready Full CI run
`34071460193` passed all six unchanged provider-free shards, the protected
aggregate and merge-candidate provenance POC; exact-main run `34072650899`
passed the applicable aggregate and post-merge candidate-provenance
attestation. Under the selected development profile, the exact-main matrix is
intentionally skipped; it is not a second six-shard claim.

CAT-00.7 remains a local, one-request execution-scope validator: no actual SEC
request, operator authority, CI re-hardening attestation, persistence or
runtime binding is supplied by its output. Its separate contract records the
exact future evidence and containment gate. The source-only
[external-read CI re-hardening review](./cat-00-external-read-ci-rehardening-review.md)
now fixes the future Ready/exact-main/readback/rollback evidence shape without
changing the selected development CI profile or supplying external authority.
CAT-00.8 now turns that shape into one provider-free, fail-closed operator
record template bound to a CAT-00.7-valid scope. It fixes every CI item as
`required_not_verified` and records no authority or network activity, so it
cannot be mistaken for a verified CI or operator decision.

CAT-00.6 is the bounded provider-free validator that resolves the first-read
planning circularity without weakening that boundary. Unlike CAT-00.5's
post-read receipt-bound plan, it starts only from a CAT-00.1-valid SEC primary
evidence ID and one exact SEC archive locator/accession pair, with the same
GET/no-redirect/credential-omit, 200/text-HTML, response-cap,
validate-only/no-persistence and no runtime/advisory/broker constraints. A
successful local validation remains
`sec_edgar_pre_read_authorization_validated_not_executed`; it does not make a
request or grant external authority. The actual public read, any receipt,
content/retrieval validation, persistence or later product use remain separate
and default-deny.

CAT-00.4 closed on exact main after PR #362 auto-merged as
`0587223326439084e9434c10fb7a59146109cff4`. Ready Full CI run
`34026946746` passed all six unchanged provider-free shards, the protected
aggregate and merge-candidate provenance POC; exact-main run `34028236542`
passed provider-free verification and the post-merge provenance attestation
for that exact commit. The local-only contract accepts exactly one
caller-supplied response capsule per CAT-00.2 receipt only when it records
the exact receipt URL and time, `GET`, `redirect: "error"`,
`credentials: "omit"`, HTTP 200 and `text/html`, then rechecks the supplied
filing body through CAT-00.3. It rejects missing, duplicate, unexpected,
stale, URL-mismatched, unsafe-method/redirect/credential, non-200,
non-HTML and digest-mismatched input. Even a valid result remains
`sec_edgar_retrieval_evidence_validated_not_admitted`; it performs no fetch,
credential use, persistence, runtime, deployment, broker or production
behavior.

CAT-00.3 closed on exact main after PR #358 auto-merged as
`669f8e2b3026b26a3982fbf6756d2af11af2173c`. Ready Full CI run
`34022886991` passed all six unchanged provider-free shards, the protected
aggregate and merge-candidate provenance POC; exact-main run `34024146282`
passed provider-free verification and the post-merge provenance attestation
for that exact commit. The local-only contract accepts only dense
caller-supplied UTF-8 filing text whose digest and byte length match an
already valid CAT-00.2 receipt. It rejects duplicate, missing, unexpected,
accessor-backed, oversized and digest-mismatched input. Even a valid result
remains `sec_edgar_filing_content_validated_not_admitted`; it performs no
fetch, credential use, persistence, runtime, deployment, broker or production
behavior.

CAT-00.2 closed on exact main after PR #354 auto-merged as
`2a596a565f36d1f29433918a1a4e094fb02c5286`. Ready Full CI run
`34019164045` (successful attempt 2) passed all six unchanged provider-free
shards, the protected aggregate and merge-candidate provenance POC; exact-main
run `34020920269` passed provider-free verification and the post-merge
provenance attestation for that exact commit. The local-only contract accepts
only strict caller-supplied SEC EDGAR receipt fixtures that bind an already
validated CAT-00.1 primary-evidence ID to an archive locator, accession, digest
and point-in-time fields. Even a valid receipt remains
`sec_edgar_receipts_validated_not_admitted`; it performs no fetch, credential
use, persistence, runtime, deployment, broker or production behavior.

CAT-00.1 closed on exact main after PR #351 merged as
`941367096f66b22a2e95d34555a9c1b73aff05ed`. Ready Full CI run
`34015714857` passed all six provider-free shards, the protected aggregate and
merge-candidate provenance POC; exact-main run `34016967161` passed
provider-free verification and the post-merge provenance attestation. The
local-only contract accepts only strict plain-data fixtures, rejects accessor
and future-leakage input before semantic use, requires paired primary evidence
for discovery leads, and still returns a non-promotable default-deny result. It
has no network, provider, credential, database, runtime, deployment, broker or
production behavior.

AI-00.1 is the separately selected, provider-free Agent Intelligence successor.
It freezes only a typed `Ture Setup Analyst` request/assessment boundary around
an already canonical candidate and existing entry/stop/target plan. It declares
six future read-only context-tool identifiers, validates a closed assessment
shape and permanently rebuilds every accepted result with shadow-only authority.
It implements no model or Agents SDK call, tool adapter, route, queue, database
write, Netlify binding, recommendation/ranking mutation, risk change or broker
path.

AI-00.2 is the separately selected, provider-free Agent Intelligence
successor. It defines a strict default-off request boundary for those same six
future context-tool identifiers. Each future request must be snapshot-time
bound, provenance/freshness-aware and policy-minimized, but the boundary itself
performs no I/O and grants no canonical recommendation, ranking, risk,
position, execution or broker authority. A later separate slice may review a
single adapter or response contract only; it cannot infer runtime authority
from this boundary.

AI-00.3 is the separately selected, provider-free Agent Intelligence
successor. It defines one immutable metadata-only trace record for an accepted
shadow assessment: bound identity and versions, declared tool identifiers,
latency, token counts and estimated cost. It retains no raw prompt/model output
and denies I/O, persistence/export and every canonical-state or broker action.
A later separate slice may review a trace sink or shadow runner only; it cannot
infer either runtime or execution authority from this record contract.

AI-00.4 is the separately selected, provider-free Agent Intelligence
successor. It defines one deterministic in-process-only boundary that consumes
an accepted frozen assessment and returns only the existing AI-00.3
metadata-only trace in a fresh immutable envelope. It invokes no provider or
context tool and has no I/O, persistence/export, route, queue, UI, canonical
state, execution or broker authority. A later adapter, trace sink or evaluation
harness needs its own separate bounded review.

AI-00.5 is the separately selected, provider-free Agent Intelligence
successor. It defines one deterministic, local fixture-only evaluation boundary
over an accepted assessment, admitted AI-00.4 trace and frozen canonical
decision/outcome sample. It returns only a small immutable comparison record;
it has no outcome source, sink, batch path, provider/model call, promotion
decision, I/O, route, queue, UI, canonical state, execution or broker
authority. A future measured evaluation dataset or promotion review needs its
own separate bounded review.

AI-00.6 is the separately selected, provider-free Agent Intelligence
successor. It defines one fail-closed in-memory review over an already admitted
AI-00.5 fixture evaluation. It reports that a lone local fixture cannot
demonstrate measurable incremental value or admit promotion without a
current-Ture baseline, a multi-fixture realized-outcome set and a human
decision. It has no provider/model or context-tool invocation, I/O,
persistence, outcome source/sink, route, queue, UI, runtime binding, promotion
mechanism, canonical-state, execution or broker authority. A future evaluation
dataset or human review requires its own separate bounded decision.

AI-00.6 closed on exact main after PR #310 merged as
`11394ecf738e4bc6f50eb37fcbf7cb99db1aa079`. Exact-main run `33843781339`
completed the unchanged six-shard provider-free suite, aggregate and
post-merge candidate-provenance POC. Its one `foundation` retry addressed an
unrelated `npm audit` network timeout; it did not change source or CI policy.
The completed AI-00.1–AI-00.6 sequence intentionally has no automatic
successor: its local fixture demonstrates only evidence incompleteness. A
measured evaluation dataset, baseline comparison or human review must first be
selected as a new product decision with its own authority boundary.

AI-01.1 is that separately selected, provider-free and source-only product
slice. It may compare multiple already-admitted, frozen AI-00.5 local fixture
evaluations against their represented current-Ture decision baseline and emit
only a detached immutable aggregate. It retains `evidence_incomplete` and a
default-deny promotion disposition regardless of the local fixture values. It
does not introduce a provider/model call, outcome source/sink, data collection,
I/O, persistence, route/queue/UI, runtime binding, canonical-state change,
execution or broker authority. A real evidence dataset, measured result or
human promotion review requires another separately authorized decision.

AI-01.2 is the separately selected, provider-free and source-only adversarial
review of AI-01.1. It may inspect only already-admitted in-memory local fixture
arrays and the comparator's detached result or public rejection. It proves that
widened, symbol-bearing, sparse, nonstandard-prototype and accessor-backed
containers fail closed without evaluating hostile getters, while ordinary
frozen arrays yield fresh default-deny aggregates. It creates no dataset,
provider/model call, context-tool invocation, I/O, persistence, route/queue/UI,
runtime binding, canonical-state change, execution, broker or promotion
authority. A real dataset, measured evaluation or human promotion remains a
separate decision.

AI-01.3 is the separately selected, provider-free and source-only identity
integrity follow-on to AI-01.1 and AI-01.2. It may retain local
recommendation/trace scalar identities only long enough to reject duplicate
underlying evidence behind a distinct fixture label, then returns only the
existing detached aggregate. It verifies scalar stability for reordered valid
sets, but introduces no dataset, provider/model call, context-tool invocation,
I/O, persistence, route/queue/UI, runtime binding, canonical-state change,
execution, broker or promotion authority. A real dataset, measured evaluation
or human promotion remains a separate decision.

AI-01.4 was the separately selected, provider-free and source-only
issuer-admission follow-on to AI-01.1 through AI-01.3. It marks only an
exact, already frozen result emitted by the local fixture evaluator as
admitted during that same process, so a structurally identical manually built
lookalike fails closed before its shape is read. The marker is a private
in-memory identity check, not a durable receipt, dataset, cross-process trust
mechanism or promotion evidence. It introduces no provider/model call,
context-tool invocation, I/O, persistence, route/queue/UI, runtime binding,
canonical-state change, execution, broker or promotion authority. A real
dataset, measured evaluation or human promotion remains a separate decision.

AI-01.4 closed on exact main after PR #320 merged as
`49cc243a12b411405c0280577dc81969fb93c4b7`. Its Ready Full CI passed all six
provider-free shards, the aggregate and merge-candidate POC; exact-main run
`33928489483` then succeeded with the post-merge POC attestation. The
in-process issuer marker is not cross-process trust, dataset or promotion
evidence, and the completed AI-01.1–AI-01.4 local sequence has no automatic
successor.

AI-02.1 closed on exact main after PR #322 merged as
`7f993aa30f17e9e9689560b910757098caaf50bb`. Its Ready Full CI passed all six
provider-free shards, the aggregate and merge-candidate POC; exact-main run
`33934174211` then succeeded with the post-merge POC attestation. It projects
only one supplied frozen and eligible canonical quality read-model snapshot
into a fresh redacted DTO for a future offline evaluation. It performs no
repository query, provider/model or context-tool invocation, I/O, persistence,
route/queue/UI or runtime binding. Its output remains `not_admitted` for
offline evaluation and model/policy promotion. A read-only cohort query,
frozen holdout, measured result or human review remains a separate decision.

AI-02.2 closed on exact main after PR #324 merged as
`a4ebc1b16f39374b22d4907f206c845526e7b69d`. Its Ready Full CI run
`33937425023` passed the unchanged six provider-free shards, aggregate and
merge-candidate POC. Exact-main run `33939053253` then passed the aggregate
and post-merge POC attestation for that exact merge commit. The slice adds
only process-local issuer provenance to AI-02.1's already redacted projection:
a future in-memory consumer can distinguish that module's actual frozen output
from a structural lookalike. It adds no serialized receipt, cross-process
trust, data collection, query, evaluation, promotion or runtime authority.
There is no automatic successor; select another product slice only through a
fresh bounded decision.

AI-02.3 closed on exact main after PR #332 merged as
`7509323f46b38bd6c4c96d89cc5c60fc5b367cba`. Ready Full CI run `33982269276`
passed the unchanged six provider-free shards, aggregate and merge-candidate
POC; exact-main run `33983595731` then passed the aggregate and post-merge POC
attestation for that exact merge commit. The slice validates only a bounded,
caller-supplied in-memory batch of AI-02.2 projections issued by the same
process, emits frozen redacted cohort metadata, and rejects lookalikes, foreign
issuers, duplicates, mixed cohorts, mutable or sparse arrays, and
accessor-backed inputs. It remains `not_admitted` for repository reads, a
dataset, offline evaluation and policy or model promotion. The following
staging availability preflight is recorded below; it did not admit a query,
dataset, evaluator or promotion path.

The authorized staging metadata preflight on 2026-09-05 then found
`public.canonical_evaluation_decisions` present with RLS enabled but reporting
`0` rows. A single subsequent staging-only read of the minimal outcome-only
projection from `public.recommendation_outcomes` also returned `0` rows; it
selected no owner or source identifier, JSON field or secret. Neither check
made a data, schema, deployment, runtime, provider, broker or production
change. Therefore there is no canonical-outcome cohort or existing eligible
legacy source to query or evaluate. The next meaningful product decision is a
separately scoped staging-only source of eligible canonical decision evidence;
that decision cannot infer writer, runtime, evaluator, provider/model or
promotion authority.

On 2026-09-06, a separately authorized production GET-only assessment read
only the `recommendation_outcomes` schema plus an outcome-minimized aggregate:
it selected no owner identifier, ticker, source-record value, JSON payload,
warning, secret or broker data and made no production change. The aggregate
reported 5,715 historical outcome rows spanning 2026-06-05 through 2026-09-04,
including 1,658 60-minute rows, but zero rows with the minimally complete
60-minute scalar used by the proposed import. More fundamentally, the legacy
relation contains none of the canonical decision identity, lineage, version,
confidence-semantics, reproducibility or immutable-envelope evidence required
by `canonical_evaluation_decisions`. The staging relation remained at zero
rows. No legacy row was coerced into a fabricated canonical decision, and no
staging schema or data changed. If that history is to be preserved, a separate
staging-only, append-only redacted legacy-evidence relation must be designed
and explicitly kept ineligible for evaluation or promotion until a real
canonical source exists.

The separately authorized staging-only rollback proof on 2026-09-06 used the
already locally validated `historical_synthetic` canonical-decision fixture.
The relation had zero matching rows before the proof; the fixture was accepted
inside one savepoint-scoped transaction, that savepoint was rolled back, and an
independent post-transaction count again returned zero matching rows. This
verifies schema and constraint acceptance plus rollback behavior only. It
leaves no fixture row or usable cohort and admits no writer/runtime binding,
evaluator, provider/model, deployment, broker or production path.

Later on 2026-09-06, the separately authorized AI-02 legacy-evidence operation
created `private.ai_02_legacy_outcome_evidence` in `ture-staging` only. It is
RLS-enabled with no policies, all privileges revoked from `anon`,
`authenticated` and `service_role`, and a trigger rejects every update or
delete. The bounded production outcome read returned only the approved
redacted fields; the source fingerprint was hashed before transfer and no
owner identifier, ticker, source-record identifier, JSON payload, warning,
secret or broker field was stored. After strict field-contract and dedupe
validation, one append-only transaction imported 500 rows with 500 distinct
opaque hashes. The in-transaction update proof was rejected, and all rows are
fixed as `legacy_incomplete` and `not_admitted`. This is non-canonical history
preservation only: it creates no evaluator input, model/policy promotion,
writer, runtime, provider/model, deployment, broker or production authority.

AI-02.4 then closed the only bounded quality-assessment successor on exact
main after PR #341 merge-commit auto-merged as
`2158ed285a8d5d8156fba94fdee3604fc967af86`. Ready Full CI run `34001756113`
passed the unchanged six provider-free shards, protected aggregate and
merge-candidate provenance POC; exact-main run `34002963284` passed the
verification gate and post-merge candidate-provenance attestation. The
server-only, provider-free assessment accepts only a frozen aggregate profile
and can emit only `noncanonical_preservation_confirmed` / `not_admitted`.
It cannot query either environment, form an evaluation dataset, invoke a
writer or model, bind runtime, or affect deployment, broker or production.
The extended replay-lineage regression was retained and passed unchanged;
its 27-minute duration is recorded as existing test evidence, not a reason to
weaken or deduplicate the safety gate.

The AI-02.4 governance closeout then merged as documentation-only PR #342,
commit `b3438908a5c21367a16cc3158fcd1e182b1b6bef`. Its Ready Full CI run
`34003550932` and exact-main run `34004761818` passed the existing protected
verification and provenance gates without changing them.

AI-02.5 then closed the next bounded decision on exact main after PR #343
auto-merged as `f091b837bac8bf6649e7a364fe562e6818c1d27f`. Ready Full CI run
`34005658991` passed the unchanged six provider-free shards, protected
aggregate and merge-candidate provenance POC; exact-main run `34006868489`
passed the verification gate and post-merge candidate-provenance attestation.
The server-only, provider-free selection accepts only a frozen proposal for
one future staging-only `historical_synthetic` append-only decision in
`public.canonical_evaluation_decisions`. It returns `not_admitted`, performs
no I/O and creates no row, receipt, writer/runtime binding, evaluator,
provider/model, deployment, broker or production authority.

The separately authorized receipt proof then reconstructed the same fixture
locally through the existing storage validator and produced deterministic
digest `e67b746f2be28d7fdeeefb33284fe607e5361d2b61e02184057d48160db68975`.
After a staging-only identity/digest preflight found no matching row, one
idempotent append-only transaction inserted the receipt in `ture-staging`.
Minimal readback matched its identity and digest and confirmed
`historical_synthetic`, `inactive_readiness_only=true`, no primary outcome
and zero diagnostic horizons. The receipt's `quality_metrics_eligible=true`
is a storage-contract property of this reproducible synthetic fixture, not an
evaluator, dataset, promotion, writer/runtime, provider/model, deployment,
broker or production admission. The prior rollback proof and append-only
trigger evidence remain unchanged.

AI-02.6 then closed the receipt-profile boundary on exact main when PR #346
auto-merged as `78f3866b1ea3f69b5d8e76f19572d9c312ef9ea6`. Ready Full CI run
`34010643544` passed the unchanged six provider-free shards, protected
aggregate and merge-candidate provenance POC; exact-main run `34011826623`
passed the verification gate and post-merge candidate-provenance attestation.
The server-only profile accepts only the exact frozen metadata of the
separately verified receipt and returns `receipt_profiled_not_admitted`. It
performs no I/O and cannot query staging or production, form a cohort or
dataset, evaluate, invoke a model or writer, bind runtime, or affect
deployment, broker or production authority.

AI-02.7 closes this bounded AI-02 implementation queue at the real product
dependency rather than creating further fixture-only successors. The verified
record shows that neither the one `historical_synthetic` staging receipt nor
the private legacy-preservation relation contains a complete primary outcome
and diagnostic horizons suitable for a canonical cohort. The existing
server-only capture preparation is not an authority to create that missing
evidence. A future evidence-creation slice must be separately selected and
must state an exact staging-only identity, the bounded decision and outcome
material, append-only/rollback containment, independent minimal readback and
the continued exclusions for evaluator, runtime, provider/model, deployment,
broker and production activity. No automatic static, synthetic or legacy-data
successor is selected by this decision.

The immediately preceding bounded sequence remains closed and recorded:
Action 666GI selected the finite presentation-key successor, Action 666GJ
implemented its source-only projection, and Action 666GK independently verified
the seven-key static containment. Action 666GL selected the separately declared
accessibility-metadata boundary, Action 666GM implements only its pure
source-only metadata projection, Action 666GN independently confirms its
static containment, Action 666GO independently confirms its finite
accepted-versus-rejected partition, and Action 666GP independently confirms
the canonical rejected-result shape and immutability. Action 666GQ
independently confirms the canonical accepted projected-result shape,
immutability and caller-state detachment. Action 666GR independently confirms
cross-result detachment between accepted and rejected outcomes; the ten-action
continuation then closes pending exact-main Full CI and POC verification.

Action 666GS then selected one source-only Milestone B successor and completed
its Ready/exact-main six-shard CI plus matched post-merge provenance. Action
666GT now implements only the selected deterministic V2 private command digest
over the frozen four-field projection. It is server-only and unbound; neither
the selection nor the builder grants transport, credential, database, writer,
route/UI, provider, broker, deployment or runtime authority.

Action 666GU independently reviews that completed local builder using reordered
valid records and malicious widened or malformed input. The review makes no
implementation change and cannot admit a caller, transport, credential,
database, writer, route/UI or runtime path.

Action 666GT completed the canonical command digest and Action 666GV now
selects one separate pure successor: a strict decoder of the already frozen V2
committed-result mapping. Its selected future implementation may validate only
the four declared result columns, the two committed dispositions, version one
and the owner-bound initial-history identity. The selection creates no
transport, credential, database/writer, route/UI, provider, broker, deployment
or runtime authority.

Action 666GW implements only that pure decoder. It validates an existing
in-memory result record against the four frozen wire columns, permitted
dispositions, canonical UUIDs, version one and the owner-bound initial-history
identity. It resolves no identity and makes no transport, credential,
database/writer, route/UI, provider, broker, deployment or runtime binding.

Action 666GX independently reviews the completed decoder using reordered valid
records plus widened and malformed result material. The review makes no decoder
implementation change and cannot admit a caller, owner resolution, transport,
credential, database/writer, route/UI, provider, broker, deployment or runtime
path.

Action 666GY selects one separate pure successor: an immutable receipt
projection for an already decoded committed result and the existing canonical
command digest. Its selected future implementation may validate and freeze only
that in-memory scalar evidence. The selection creates no storage, transport,
credential, database/writer, route/UI, provider, broker, deployment or runtime
authority.

Action 666GZ implements only that immutable receipt projection. It accepts an
already decoded frozen result plus a canonical lowercase digest, revalidates the
closed scalar boundary and returns a fresh frozen receipt. It opens no
transport, credential, database/writer, storage, route/UI, provider, broker,
deployment or runtime path; a separately bounded independent review is the
only possible successor.

Action 666HA independently reviews the completed receipt projection against
both committed dispositions and malformed, widened or noncanonical material.
It changes no projection source and admits no caller, transport, credential,
database/writer, storage, route/UI, provider, broker, deployment or runtime
authority. Only a separately bounded selection may follow.

Action 666HB selects one separate source-only successor: an independent
cross-result detachment review of the immutable V2 committed-result receipt
projection. The future review may compare two separately decoded valid result
records and distinct canonical digests only to prove fresh frozen scalar
receipts with no input or cross-receipt aliasing. The selection creates no
storage, caller, transport, credential, owner resolution, database/writer,
provider, broker, route/UI, deployment or runtime authority.

Action 666HC independently reviews that cross-result detachment using two
separately decoded valid records and distinct canonical digests. It changes no
receipt implementation and admits no receipt consumer, storage, caller,
transport, credential, owner resolution, database/writer, provider, broker,
route/UI, deployment or runtime authority. Only a separately bounded selection
may follow.

Action 666HD selects one separate source-only successor: a strict immutable
V2 committed-result receipt equivalence comparator. Its future implementation
may accept two already immutable receipt values, compare only their five
declared scalar fields and return a fresh frozen scalar-only equivalence
verdict after fail-closing malformed receipt material. The selection creates no
receipt consumer, storage, caller, transport, credential, owner resolution,
database/writer, provider, broker, route/UI, deployment or runtime authority.

Action 666HE implements only that pure server-only comparator. It accepts two
already immutable receipts, independently validates their closed five-scalar
boundary and returns a fresh frozen `{ equivalent: boolean }` verdict. It
retains neither input and reconstructs no decoded result or command. Mutable,
widened, inherited, accessor, symbol-bearing, malformed or noncanonical
material fails closed; storage, caller, transport, credential, owner
resolution, database/writer, provider, broker, route/UI, deployment and
runtime authority remain closed. Only a separately bounded independent review
may follow.

Action 666HF independently reviews that completed comparator. It compares
separately allocated equivalent receipts, valid mismatching receipt pairs and
malformed material to confirm fresh frozen verdicts, exact scalar containment
and fail-closed rejection. It changes no comparator source and admits no
receipt consumer, storage, caller, transport, credential, owner resolution,
database/writer, provider, broker, route/UI, deployment or runtime authority.
Only a separately bounded decision may follow.

Action 666HG selects one separate source-only successor: an independent strict
scalar-isolation and argument-order-symmetry review of the completed immutable
V2 committed-result receipt equivalence comparator. The future review may
compare only already immutable canonical receipts, prove that each admitted
valid mismatch changes exactly one permitted scalar, and confirm that swapping
the two inputs preserves the same boolean while yielding a fresh frozen
scalar-only verdict. It changes no comparator source and admits no receipt
consumer, storage, caller, transport, credential, owner resolution,
database/writer, provider, broker, route/UI, deployment or runtime authority.
Only the separately bounded review may follow.

Action 666HH independently performs that review. It confirms one literal valid
scalar difference at a time for digest, disposition and history identity in
both argument orders, and confirms fresh frozen scalar-only verdicts. Because
canonical history identity is bound to position ID, a literal position-ID-only
change fails closed; a canonical changed position identity requires its
dependent history-identity update and is non-equivalent in either order. The
review changes no comparator source and admits no receipt consumer, storage,
caller, transport, credential, owner resolution, database/writer, provider,
broker, route/UI, deployment or runtime authority. Only a separately bounded
decision may follow.

Action 666HI selects one separate source-only successor: an independent strict
repeated-verdict-detachment review of the completed immutable V2 committed-
result receipt equivalence comparator. The future review may invoke the
comparator repeatedly for separately allocated equal and valid non-equivalent
canonical receipt pairs in both argument orders, proving stable booleans and
fresh distinct frozen scalar-only verdicts without input or cross-verdict
aliasing. It changes no comparator source and admits no receipt consumer,
storage, caller, transport, credential, owner resolution, database/writer,
provider, broker, route/UI, deployment or runtime authority. Only the
separately bounded review may follow.

Action 666HJ independently performs that review. It invokes the completed
comparator three times per argument order for separately allocated equal and
valid non-equivalent canonical receipt pairs, confirming stable booleans and
that every verdict is distinct, frozen and scalar-only with no receipt or
cross-verdict aliasing. The review changes no comparator source and admits no
receipt consumer, storage, caller, transport, credential, owner resolution,
database/writer, provider, broker, route/UI, deployment or runtime authority.
Only a separately bounded decision may follow.

Action 666HK selects one separate source-only successor: an independent strict
rejected-error-detachment review of the completed immutable V2 committed-result
receipt equivalence comparator. The future review may invoke the comparator
only with in-memory malformed or noncanonical receipt material in either
argument slot, proving fresh dedicated comparator errors with a stable public
name and message without input or cross-error aliasing. It changes no
comparator source and admits no receipt consumer, storage, caller, transport,
credential, owner resolution, database/writer, provider, broker, route/UI,
deployment or runtime authority. Only the separately bounded review may
follow.

Action 666HL independently performs that review. It invokes the completed
comparator three times in each argument order for four malformed or
noncanonical receipt variants, confirming every rejection is a fresh dedicated
comparator error with a stable public name and message and no input or
cross-error aliasing. The review changes no comparator source and admits no
receipt consumer, storage, caller, transport, credential, owner resolution,
database/writer, provider, broker, route/UI, deployment or runtime authority.
Only a separately bounded decision may follow.

Action 666HM selects one separate source-only successor: an independent strict
cross-invocation outcome-detachment review of the completed immutable V2
committed-result receipt equivalence comparator. The future review may
interleave canonical receipt comparisons with malformed or noncanonical receipt
comparisons, proving fresh frozen verdicts and fresh dedicated errors with no
input or cross-outcome aliasing. It changes no comparator source and admits no
receipt consumer, storage, caller, transport, credential, owner resolution,
database/writer, provider, broker, route/UI, deployment or runtime authority.
Only the separately bounded review may follow.

Action 666HN independently performs that review. It interleaves three cycles
of canonical equal and non-equivalent receipt comparisons with malformed and
noncanonical receipt comparisons, confirming each valid call returns a fresh
frozen scalar verdict and each rejection a fresh dedicated comparator error.
No outcome aliases an input or another outcome. The review changes no
comparator source and admits no receipt consumer, storage, caller, transport,
credential, owner resolution, database/writer, provider, broker, route/UI,
deployment or runtime authority. Only a separately bounded decision may
follow.

Action 666HO selects one separate source-only successor: an independent strict
object-fault rejection review of the completed immutable V2 committed-result
receipt equivalence comparator. The future review may invoke the comparator
only with in-memory objects whose prototype, key or descriptor introspection
traps throw, proving fresh dedicated comparator errors without input or
cross-error aliasing. It changes no comparator source and admits no receipt
consumer, storage, caller, transport, credential, owner resolution,
database/writer, provider, broker, route/UI, deployment or runtime authority.
Only the separately bounded review may follow.

Action 666HP independently performs that review. It invokes the completed
comparator three times in each argument order for frozen in-memory objects
whose prototype, key or descriptor introspection traps throw, confirming every
rejection is a fresh dedicated comparator error with a stable public name and
message and no input or cross-error aliasing. The review changes no comparator
source and admits no receipt consumer, storage, caller, transport, credential,
owner resolution, database/writer, provider, broker, route/UI, deployment or
runtime authority. It closes the current twelve-action continuation without
selecting another successor.

Action 666HQ selects one separate source-only successor: an independent strict
accessor-fault rejection review of the completed immutable V2 committed-result
receipt equivalence comparator. The future review may invoke only frozen
in-memory receipt-shaped objects with one own throwing accessor descriptor in
place of a declared scalar, proving rejection before getter invocation and
fresh dedicated comparator errors without input or cross-error aliasing. It
changes no comparator source and admits no receipt consumer, storage, caller,
transport, credential, owner resolution, database/writer, provider, broker,
route/UI, deployment or runtime authority. Only the separately bounded review
may follow.

Action 666HR independently performs that review. It invokes the completed
comparator three times in each argument order for frozen in-memory
receipt-shaped objects that replace each declared scalar in turn with one own
throwing accessor descriptor. Every comparison rejects before getter invocation
with a fresh dedicated comparator error carrying the stable public name and
message, without input or cross-error aliasing. The review changes no comparator
source and admits no receipt consumer, storage, caller, transport, credential,
owner resolution, database/writer, provider, broker, route/UI, deployment or
runtime authority. Only a separately bounded decision may follow.

Action 666HS selects one separate source-only successor: an independent strict
scalar-coercion-fault rejection review of the completed immutable V2
committed-result receipt equivalence comparator. The future review may invoke
only frozen in-memory receipt-shaped objects that replace one declared scalar
at a time with a boxed or coercion-trapped object that would throw if primitive
conversion were attempted, proving rejection without coercion and fresh
dedicated comparator errors without input or cross-error aliasing. It changes
no comparator source and admits no receipt consumer, storage, caller,
transport, credential, owner resolution, database/writer, provider, broker,
route/UI, deployment or runtime authority. Only the separately bounded review
may follow.

Action 666HT independently performs that review. It invokes the completed
comparator three times in each argument order for frozen in-memory
receipt-shaped objects that replace each declared scalar in turn with a boxed
or coercion-trapped object whose primitive-conversion hook throws. Every
comparison rejects without primitive conversion with a fresh dedicated
comparator error carrying the stable public name and message, without input or
cross-error aliasing. The review changes no comparator source and admits no
receipt consumer, storage, caller, transport, credential, owner resolution,
database/writer, provider, broker, route/UI, deployment or runtime authority.
Only a separately bounded decision may follow.

Action 666HU selects one separate source-only successor: an independent strict
cross-realm rejection review of the completed immutable V2 committed-result
receipt equivalence comparator. The future review may compare only a locally
valid immutable receipt with a frozen receipt-shaped object created in a
foreign JavaScript realm, in both argument orders, proving stable fresh
dedicated errors without adaptation, input or cross-error aliasing. It changes
no comparator source and admits no receipt consumer, storage, caller,
transport, credential, owner resolution, database/writer, provider, broker,
route/UI, deployment or runtime authority. Only the separately bounded review
may follow.

Action 666HV records the explicit strict fail-closed local-realm policy after
the selected review's exact-main observation showed that the completed
comparator admitted a valid frozen foreign-realm receipt-shaped object. It
supersedes only that unexecuted review shape: the comparator now admits an
immutable receipt only when its direct prototype is exactly the comparator
realm's `Object.prototype`, while retaining its closed field, descriptor,
scalar and dedicated-error checks. It proves local admission plus fresh
rejection of a separately created frozen foreign-realm object three times in
each argument order, without adaptation or input/cross-error aliasing. It
creates no receipt consumer, storage, caller, transport, credential, owner
resolution, database/writer, provider, broker, route/UI, deployment or runtime
authority. Ready and exact-main six-shard Full CI plus matched provenance remain
mandatory; no CI deduplication is authorized. Only a separately bounded
independent review may follow.

Action 666HW independently reviews the completed Action 666HV policy. It
confirms a local valid frozen receipt remains admissible and that a separately
created frozen foreign-realm receipt-shaped object rejects with a fresh
dedicated comparator error three times in each argument order, without input
or cross-error aliasing or foreign-material adaptation. The review changes no
comparator source and admits no receipt consumer, storage, caller, transport,
credential, owner resolution, database/writer, provider, broker, route/UI,
deployment or runtime authority. Ready and exact-main six-shard Full CI plus
matched provenance remain mandatory; no CI deduplication is authorized. Only a
separately bounded decision may follow.

Action 666HX selects one separate source-only successor: an independent review
of a frozen local receipt-shaped object with a direct `null` prototype and
otherwise exact canonical own data fields. The future review may compare only
that record against a valid local immutable receipt control three times in each
argument order, proving fresh dedicated comparator errors without input or
cross-error aliasing while the ordinary local control remains admissible. It
changes no comparator source and admits no receipt consumer, storage, caller,
transport, credential, owner resolution, database/writer, provider, broker,
route/UI, deployment or runtime authority. Only the separately bounded review
may follow.

Action 666HY independently reviews that selected frozen local null-prototype
receipt shape. It confirms that the object is frozen, owns exactly the five
canonical immutable data fields and has direct prototype `null`, while ordinary
local valid receipts remain admissible. The comparator must reject the
null-prototype object with a fresh dedicated error three times in each argument
order, without input or cross-error aliasing. The review creates no proxy,
accessor, symbol, foreign-realm material, prototype mutation, adaptation,
normalization or import; changes no comparator source; and admits no receipt
consumer, storage, caller, transport, credential, owner resolution,
database/writer, provider, broker, route/UI, deployment or runtime authority.
Ready and exact-main six-shard Full CI plus matched provenance remain mandatory;
no CI deduplication is authorized. Only a separately bounded decision may
follow.

Action 666HZ selects one separate source-only successor: an independent strict
non-enumerable own-data rejection review of the completed immutable V2
committed-result receipt equivalence comparator. Its future review may compare
only five frozen local ordinary receipt-shaped objects with exact canonical
scalar values and direct local Object.prototype; one declared canonical own
data field is non-enumerable in each fixture. It must prove fresh dedicated
comparator errors three times in each argument order without input or
cross-error aliasing, while ordinary local controls remain admissible with
fresh frozen scalar-only verdicts. It changes no comparator source and admits
no receipt consumer, storage, caller, transport, credential, owner resolution,
database/writer, provider, broker, route/UI, deployment or runtime authority.
Ready and exact-main six-shard Full CI plus matched provenance remain mandatory;
no CI deduplication is authorized. Only the separately bounded review may
follow.

Action 666IA independently reviews that selected frozen local ordinary receipt
shape. It confirms that each fixture owns exactly the five canonical immutable
data fields with canonical scalar values and direct local Object.prototype,
while exactly one declared own data field at a time is non-enumerable. Ordinary
local valid receipts remain admissible with fresh frozen scalar-only verdicts;
every non-enumerable fixture rejects with a fresh dedicated comparator error
three times in each argument order without input or cross-error aliasing. The
review creates no proxy, accessor, symbol, foreign-realm material, null or
custom prototype, prototype mutation, adaptation, normalization or import;
changes no comparator source; and admits no receipt consumer, storage, caller,
transport, credential, owner resolution, database/writer, provider, broker,
route/UI, deployment or runtime authority. Ready and exact-main six-shard Full
CI plus matched provenance remain mandatory; no CI deduplication is authorized.
Only a separately bounded decision may follow.

Action 666IB selects one separate source-only successor: an independent strict
non-enumerable extra-own-data rejection review of the completed immutable V2
committed-result receipt equivalence comparator. Its future review may compare
only a frozen local ordinary receipt with direct local Object.prototype, the
five canonical enumerable own data fields and canonical scalar values, and one
additional non-enumerable `legacySnapshotId` string own data key. It must prove
that hidden extra own data cannot evade Reflect.ownKeys exact-key-set validation: the fixture
rejects with fresh dedicated comparator errors three times in each argument
order without input or cross-error aliasing, while ordinary local controls
remain admissible with fresh frozen scalar-only verdicts. It changes no
comparator source and admits no receipt consumer, storage, caller, transport,
credential, owner resolution, database/writer, provider, broker, route/UI,
deployment or runtime authority. Ready and exact-main six-shard Full CI plus
matched provenance remain mandatory; no CI deduplication is authorized. Only
the separately bounded review may follow.

Action 666IC independently reviews that selected frozen local ordinary receipt
shape. It confirms that the five canonical immutable data fields remain
enumerable with canonical scalar values and direct local Object.prototype,
while exactly one additional non-enumerable `legacySnapshotId` own data key
with literal `"forbidden"` remains visible to `Reflect.ownKeys`. Ordinary
local valid receipts remain admissible with fresh frozen scalar-only verdicts;
the extra-own-data fixture rejects with fresh dedicated comparator errors three
times in each argument order without input or cross-error aliasing. The review
creates no proxy, accessor, symbol, foreign-realm material, null or custom
prototype, prototype mutation, coercion hook, adaptation, normalization or
import; changes no comparator source; and admits no receipt consumer, storage,
caller, transport, credential, owner resolution, database/writer, provider,
broker, route/UI, deployment or runtime authority. Ready and exact-main
six-shard Full CI plus matched provenance remain mandatory; no CI deduplication
is authorized. Only a separately bounded decision may follow.

Action 666ID selects one separate source-only successor: an independent strict
wrong-name substitution rejection review of the completed immutable V2
committed-result receipt equivalence comparator. Its future review may compare
only a frozen local ordinary receipt with direct local Object.prototype and
exactly five enumerable canonical-scalar data fields, where
`legacyCanonicalCommandDigest` replaces `canonicalCommandDigest` one-for-one
with the same canonical digest scalar. It must prove that Reflect.ownKeys sees
the exact five-key wrong-name shape, then reject with fresh dedicated comparator
errors three times in each argument order without input or cross-error aliasing,
while ordinary local controls remain admissible with fresh frozen scalar-only
verdicts. It changes no comparator source and admits no receipt consumer,
storage, caller, transport, credential, owner resolution, database/writer,
provider, broker, route/UI, deployment or runtime authority. A four-key omitted
canonical-field fixture remains separate. Ready and exact-main six-shard Full
CI plus matched provenance remain mandatory; no CI deduplication is authorized.
Only the separately bounded review may follow.

Action 666IE independently reviews that selected frozen local ordinary receipt
shape. It confirms that the fixture has direct local Object.prototype and
exactly five enumerable immutable normal own data fields, with
`legacyCanonicalCommandDigest` replacing `canonicalCommandDigest` one-for-one
while retaining the same canonical digest scalar. Object.keys and
Reflect.ownKeys expose the exact five-key wrong-name shape and the canonical
digest field is absent. Ordinary local valid receipts remain admissible with
fresh frozen scalar-only verdicts; the wrong-name fixture rejects with fresh
dedicated comparator errors three times in each argument order without input or
cross-error aliasing. The review creates no proxy, accessor, symbol,
foreign-realm material, null or custom prototype, prototype mutation, coercion
hook, adaptation, normalization or import; changes no comparator source; and
admits no receipt consumer, storage, caller, transport, credential, owner
resolution, database/writer, provider, broker, route/UI, deployment or runtime
authority. Ready and exact-main six-shard Full CI plus matched provenance remain
mandatory; no CI deduplication is authorized. Only a separately bounded
decision may follow.

Action 666IF selects one separate source-only successor: an independent strict
omitted-canonical-own-data rejection review of the completed immutable V2
committed-result receipt equivalence comparator. Its future review may compare
only a frozen local ordinary receipt with direct local Object.prototype and
exactly four enumerable immutable normal own data fields:
`disposition`, `initialHistoryIdentity`, `positionId` and `positionVersion`.
The canonical `canonicalCommandDigest` field is absent with no replacement,
extra or hidden key. It must prove that Object.keys and Reflect.ownKeys expose
the exact four-key omission shape, then reject with fresh dedicated comparator
errors three times in each argument order without input or cross-error aliasing,
while ordinary local five-key controls remain admissible with fresh frozen
scalar-only verdicts. It changes no comparator source and admits no receipt
consumer, storage, caller, transport, credential, owner resolution,
database/writer, provider, broker, route/UI, deployment or runtime authority.
Omission of another canonical field and every wrong-name, extra-key,
descriptor or prototype variation remain separate. Ready and exact-main
six-shard Full CI plus matched provenance remain mandatory; no CI deduplication
is authorized. Only the separately bounded review may follow.

Action 666IG independently reviews that selected frozen local ordinary receipt
shape. It confirms direct local Object.prototype and exactly four enumerable
immutable normal own data fields: `disposition`, `initialHistoryIdentity`,
`positionId` and `positionVersion`. Object.keys and Reflect.ownKeys expose this
exact four-key shape while `canonicalCommandDigest` is absent without a
replacement, extra or hidden key. Ordinary local valid five-key receipts remain
admissible with fresh frozen scalar-only verdicts; the omission fixture rejects
with fresh dedicated comparator errors three times in each argument order
without input or cross-error aliasing. The review creates no proxy, accessor,
symbol, foreign-realm material, null or custom prototype, prototype mutation,
coercion hook, adaptation, normalization or import; changes no comparator
source; and admits no receipt consumer, storage, caller, transport, credential,
owner resolution, database/writer, provider, broker, route/UI, deployment or
runtime authority. Ready and exact-main six-shard Full CI plus matched
provenance remain mandatory; no CI deduplication is authorized. Only a
separately bounded decision may follow.

Action 666IH selects one separate source-only successor: an independent strict
omitted-disposition-own-data rejection review of the completed immutable V2
committed-result receipt equivalence comparator. Its future review may compare
only a frozen local ordinary receipt with direct local Object.prototype and
exactly four enumerable immutable normal own data fields:
`canonicalCommandDigest`, `initialHistoryIdentity`, `positionId` and
`positionVersion`. The canonical `disposition` field is absent with no
replacement, extra or hidden key. It must prove that Object.keys and
Reflect.ownKeys expose the exact four-key omission shape, then reject with
fresh dedicated comparator errors three times in each argument order without
input or cross-error aliasing, while ordinary local five-key controls remain
admissible with fresh frozen scalar-only verdicts. It changes no comparator
source and admits no receipt consumer, storage, caller, transport, credential,
owner resolution, database/writer, provider, broker, route/UI, deployment or
runtime authority. Omission of another canonical field and every wrong-name,
extra-key, undefined-value, descriptor or prototype variation remain separate.
Ready and exact-main six-shard Full CI plus matched provenance remain mandatory;
no CI deduplication is authorized. Only the separately bounded review may
follow.

Action 666II independently reviews that selected frozen local ordinary receipt
shape. It confirms direct local Object.prototype and exactly four enumerable
immutable normal own data fields: `canonicalCommandDigest`,
`initialHistoryIdentity`, `positionId` and `positionVersion`. Object.keys
and Reflect.ownKeys expose this exact four-key shape while `disposition` is
absent without a replacement, extra or hidden key. Ordinary local valid
five-key receipts remain admissible with fresh frozen scalar-only verdicts; the
omission fixture rejects with fresh dedicated comparator errors three times in
each argument order without input or cross-error aliasing. The review creates
no scalar-invalid, undefined-own-key, extra-key, non-enumerable-key,
descriptor, accessor, proxy, symbol, foreign-realm, prototype, coercion,
adaptation, normalization or import variation; changes no comparator source;
and admits no receipt consumer, storage, caller, transport, credential, owner
resolution, database/writer, provider, broker, route/UI, deployment or runtime
authority. Ready and exact-main six-shard Full CI plus matched provenance remain
mandatory; no CI deduplication is authorized. Only a separately bounded
decision may follow.

Action 666IJ selects one separate source-only successor: an independent strict
omitted-initial-history-identity-own-data rejection review of the completed
immutable V2 committed-result receipt equivalence comparator. Its future review
may compare only a frozen local ordinary receipt with direct local
Object.prototype and exactly four enumerable immutable normal own data fields:
`canonicalCommandDigest`, `disposition`, `positionId` and `positionVersion`.
The canonical `initialHistoryIdentity` field is absent with no replacement,
extra or hidden key. It must prove that Object.keys and Reflect.ownKeys expose
the exact four-key omission shape, then reject with fresh dedicated comparator
errors three times in each argument order without input or cross-error aliasing,
while ordinary local five-key controls remain admissible with fresh frozen
scalar-only verdicts. It changes no comparator source and admits no receipt
consumer, storage, caller, transport, credential, owner resolution,
database/writer, provider, broker, route/UI, deployment or runtime authority.
Omission of another canonical field and every wrong-name, extra-key,
undefined-value, descriptor or prototype variation remain separate. Ready and
exact-main six-shard Full CI plus matched provenance remain mandatory; no CI
deduplication is authorized. Only the separately bounded review may follow.

Action 666IK independently reviews that selected frozen local ordinary receipt
shape. It confirms direct local Object.prototype and exactly four enumerable
immutable normal own data fields: `canonicalCommandDigest`, `disposition`,
`positionId` and `positionVersion`. Object.keys and Reflect.ownKeys expose
this exact four-key shape while `initialHistoryIdentity` is absent without a
replacement, extra or hidden key. Ordinary local valid five-key receipts remain
admissible with fresh frozen scalar-only verdicts; the omission fixture rejects
with fresh dedicated comparator errors three times in each argument order
without input or cross-error aliasing. The review creates no scalar-invalid,
undefined-own-key or inherited replacement, extra-key, non-enumerable-key,
descriptor, accessor, proxy, symbol, foreign-realm, prototype, coercion,
adaptation, normalization or
import variation; changes no comparator source; and admits no receipt consumer,
storage, caller, transport, credential, owner resolution, database/writer,
provider, broker, route/UI, deployment or runtime authority. Ready and
exact-main six-shard Full CI plus matched provenance remain mandatory; no CI
deduplication is authorized. Only a separately bounded decision may follow.

Action 666IL selects one separate source-only successor: an independent strict
omitted-position-id-own-data rejection review of the completed immutable V2
committed-result receipt equivalence comparator. Its future review may compare
only a frozen local ordinary receipt with direct local Object.prototype and
exactly four enumerable immutable normal own data fields:
`canonicalCommandDigest`, `disposition`, `initialHistoryIdentity` and
`positionVersion`. The canonical `positionId` field is absent with no
replacement, extra or hidden key. It must prove that Object.keys and
Reflect.ownKeys expose the exact four-key omission shape, then reject with
fresh dedicated comparator errors three times in each argument order without
input or cross-error aliasing, while ordinary local five-key controls remain
admissible with fresh frozen scalar-only verdicts. It changes no comparator
source and admits no receipt consumer, storage, caller, transport, credential,
owner resolution, database/writer, provider, broker, route/UI, deployment or
runtime authority. Omission of another canonical field and every wrong-name,
extra-key, undefined-value, descriptor or prototype variation remain separate.
Ready and exact-main six-shard Full CI plus matched provenance remain mandatory;
no CI deduplication is authorized. Only the separately bounded review may
follow.

Action 666IM independently reviews that selected frozen local ordinary receipt
shape. It confirms direct local Object.prototype and exactly four enumerable
immutable normal own data fields: canonicalCommandDigest, disposition,
initialHistoryIdentity and positionVersion. Object.keys and Reflect.ownKeys
expose this exact four-key shape while positionId is absent without a
replacement, extra or hidden key. Ordinary local valid five-key receipts remain
admissible with fresh frozen scalar-only verdicts; the omission fixture rejects
with fresh dedicated comparator errors three times in each argument order
without input or cross-error aliasing. The review creates no scalar-invalid,
undefined-own-key or inherited replacement, extra-key, non-enumerable-key,
descriptor, accessor, proxy, symbol, foreign-realm, prototype, coercion,
adaptation, normalization or import variation; changes no comparator source;
and admits no receipt consumer, storage, caller, transport, credential, owner
resolution, database/writer, provider, broker, route/UI, deployment or runtime
authority. Ready and exact-main six-shard Full CI plus matched provenance remain
mandatory; no CI deduplication is authorized. Only a separately bounded
decision may follow.

Action 666IN selects one separate source-only successor: an independent strict
omitted-position-version-own-data rejection review of the completed immutable
V2 committed-result receipt equivalence comparator. Its future review may
compare only a frozen local ordinary receipt with direct local Object.prototype
and exactly four enumerable immutable normal own data fields:
`canonicalCommandDigest`, `disposition`, `initialHistoryIdentity` and
`positionId`. The canonical `positionVersion` field is absent with no
replacement, extra or hidden key. It must prove that Object.keys and
Reflect.ownKeys expose the exact four-key omission shape, then reject with
fresh dedicated comparator errors three times in each argument order without
input or cross-error aliasing, while ordinary local five-key controls remain
admissible with fresh frozen scalar-only verdicts. It changes no comparator
source and admits no receipt consumer, storage, caller, transport, credential,
owner resolution, database/writer, provider, broker, route/UI, deployment or
runtime authority. Omission of another canonical field and every wrong-name,
extra-key, undefined-value, descriptor or prototype variation remain separate.
Ready and exact-main six-shard Full CI plus matched provenance remain mandatory;
no CI deduplication is authorized. Only the separately bounded review may
follow.

Action 666IO independently reviews exactly the source-only omitted-position-version
own-data rejection boundary selected by Action 666IN. It compares only one
frozen local ordinary receipt with direct local Object.prototype and exactly
four enumerable immutable normal own data fields:
canonicalCommandDigest, disposition, initialHistoryIdentity and positionId.
The canonical positionVersion own data key is absent without a replacement,
extra or hidden key. The review proves Object.keys and Reflect.ownKeys expose
the exact four-key omission shape, preserves ordinary local five-key controls
with fresh frozen scalar-only verdicts, and rejects the omission with fresh
dedicated comparator errors three times in each argument order without input or
cross-error aliasing. It changes no comparator source and creates no
scalar-invalid, undefined-own-key, inherited replacement, extra-key,
non-enumerable-key, descriptor, accessor, proxy, symbol, foreign-realm,
prototype, coercion, adaptation, normalization or import variation; it admits
no receipt consumer, storage, caller, transport, credential, owner resolution,
database/writer, provider, broker, route/UI, deployment or runtime authority.
Ready and exact-main six-shard Full CI plus matched provenance remain mandatory;
no CI deduplication is authorized. Only a separately bounded decision may
follow.

Action 666IP selects one separate source-only successor: an independent strict
undefined-canonical-command-digest-own-data rejection review of the completed
immutable V2 committed-result receipt equivalence comparator. Its future review
may compare only a frozen local ordinary receipt with direct local
Object.prototype and exactly five enumerable immutable normal own data fields:
canonicalCommandDigest, disposition, initialHistoryIdentity, positionId and
positionVersion. The canonicalCommandDigest own data field has the value
undefined while the other four fields retain canonical scalar values; no key is
missing, replaced, extra or hidden. It must prove that Object.keys and
Reflect.ownKeys expose the exact five-key shape, then reject with fresh
dedicated comparator errors three times in each argument order without input
or cross-error aliasing, while ordinary local five-key controls remain
admissible with fresh frozen scalar-only verdicts. It changes no comparator
source and admits no receipt consumer, storage, caller, transport, credential,
owner resolution, database/writer, provider, broker, route/UI, deployment or
runtime authority. Every omitted-key, wrong-name, extra-key, non-enumerable,
descriptor or prototype variation remains separate. Ready and exact-main
six-shard Full CI plus matched provenance remain mandatory; no CI deduplication
is authorized. Only the separately bounded review may follow.

Action 666IQ independently reviews exactly the source-only undefined
canonical-command-digest-own-data rejection boundary selected by Action 666IP.
It compares only one frozen local ordinary receipt with direct local
Object.prototype and exactly five enumerable immutable normal own data fields:
canonicalCommandDigest, disposition, initialHistoryIdentity, positionId and
positionVersion. The canonicalCommandDigest own data field has the value
undefined while the other four fields retain canonical scalar values; no key is
missing, replaced, extra or hidden. The review proves Object.keys and
Reflect.ownKeys expose the exact five-key shape and the direct immutable
canonicalCommandDigest descriptor has value undefined, preserves ordinary
local five-key controls with fresh frozen scalar-only verdicts, and rejects the
undefined value with fresh dedicated errors three times in each argument order
without input or cross-error aliasing. It creates no omitted-key, wrong-name,
extra-key, non-enumerable-key, descriptor, accessor, proxy, symbol,
foreign-realm, prototype, coercion, adaptation, normalization or import
variation; it admits no receipt consumer, storage, caller, transport,
credential, owner resolution, database/writer, provider, broker, route/UI,
deployment or runtime authority. Ready and exact-main six-shard Full CI plus
matched provenance remain mandatory; no CI deduplication is authorized. Only a
separately bounded decision may follow.

Action 666IR selects one separate source-only successor: an independent strict
undefined-disposition-own-data rejection review of the completed immutable V2
committed-result receipt equivalence comparator. Its future review may compare
only a frozen local ordinary receipt with direct local Object.prototype and
exactly five enumerable immutable normal own data fields: canonicalCommandDigest,
disposition, initialHistoryIdentity, positionId and positionVersion. The
disposition own data field has the value undefined while the other four fields
retain canonical scalar values; no key is missing, replaced, extra or hidden.
It must prove that Object.keys and Reflect.ownKeys expose the exact five-key
shape, then reject with fresh dedicated comparator errors three times in each
argument order without input or cross-error aliasing, while ordinary local
five-key controls remain admissible with fresh frozen scalar-only verdicts. It
changes no comparator source and admits no receipt consumer, storage, caller,
transport, credential, owner resolution, database/writer, provider, broker,
route/UI, deployment or runtime authority. Every omitted-key, wrong-name,
extra-key, non-enumerable, descriptor or prototype variation remains separate.
Ready and exact-main six-shard Full CI plus matched provenance remain mandatory;
no CI deduplication is authorized. Only the separately bounded review may
follow.

Action 666IS independently reviews exactly the source-only undefined-disposition
own-data rejection boundary selected by Action 666IR. It compares only one
frozen local ordinary receipt with direct local Object.prototype and exactly
five enumerable immutable normal own data fields: canonicalCommandDigest,
disposition, initialHistoryIdentity, positionId and positionVersion. The
disposition own data field has the value undefined while the other four fields
retain canonical scalar values; no key is missing, replaced, extra or hidden.
The review proves Object.keys and Reflect.ownKeys expose the exact five-key
shape and the direct immutable disposition descriptor has value undefined,
preserves ordinary local five-key controls with fresh frozen scalar-only
verdicts, and rejects the undefined value with fresh dedicated errors three
times in each argument order without input or cross-error aliasing. It creates
no omitted-key, wrong-name, extra-key, non-enumerable-key, descriptor, accessor,
proxy, symbol, foreign-realm, prototype, coercion, adaptation, normalization or
import variation; it admits no receipt consumer, storage, caller, transport,
credential, owner resolution, database/writer, provider, broker, route/UI,
deployment or runtime authority. Ready and exact-main six-shard Full CI plus
matched provenance remain mandatory; no CI deduplication is authorized. Only a
separately bounded decision may follow.

Action 666IT is that separately bounded decision. It closes the `666GS`–`666IS`
pure source chain for automatic extension, rejects another receipt permutation
and reconciles the result against Milestone B's actual capability definition of
done. B-02 append-only history and B-04's pure deterministic evaluator remain
verified foundations, but B-01, B-03 and B-05 through B-12 remain unclosed
capability gates. Milestone B is therefore `not_complete` and runtime remains
closed. The decision is `redesign_or_stop` for additional source-only receipt
work: the next product outcome must be one policy-admitted runtime capability
slice with protected secrets, least-privileged identity, private transport,
writer binding, durable behavior, client-projection containment and bounded
owner-bound recovery evidence. This record grants none of that authority, and
Notion remains program tracking rather than runtime or production evidence.

Action 666IU is the separately authorized local B-03 behavior slice. It keeps
the application unbound and all provider, broker, deployment, production and
remote staging targets closed. A disposable internal Docker PostgreSQL database
applies the immutable V2 writer source followed by a forward-only replay
qualification repair after the first real sandbox replay exposed a PL/pgSQL
output-parameter/column ambiguity. The sandbox then proves, without emitting
row values, an exact created/replayed pair, denial of direct table access for
the dedicated writer identity, atomic rollback of a rejected invocation and
container/network destruction. This is local evidence only: B-01 and B-03
remain in progress, B-05 through B-08 remain blocked for a real environment,
and B-09 through B-12 remain planned. It authorizes neither remote staging nor
production work, application transport, route/UI binding, Netlify, a broker
order, branch-protection change or CI deduplication.

Action 666IV follows the verified local proof with a static, value-free remote
staging admission decision. All required remote gates remain unattested: a
named staging-only principal, protected non-public material provenance, a
dedicated least-privileged writer identity and grant matrix, a private
non-data-API transport path, and a remote rollback/containment plan. Historical
staging catalog proofs are context only, not current B-03 administration
authority. The outcome is therefore `not_admitted`: no authentication, material
read, identity/grant change, connection, query, migration, writer invocation,
runtime binding, route/UI work, deployment, provider, broker or production
action is allowed. A later action must first record a separately authorized
value-free staging principal-and-scope attestation; it must still not contact
the remote environment. Milestone B remains `not_complete`, and Notion remains
program tracking only.

Action 666IW makes that next gate explicit without mistaking an unavailable
input for a negative external fact. No independent non-secret attestation
reference was supplied in the Action's static scope for the named staging-only
principal, protected-material provenance descriptor, writer grant matrix,
private transport criteria or rollback/containment plan. Each field is
therefore `not_supplied_in_action_scope`, not an invented placeholder or an
assertion about the remote environment. The decision remains `not_admitted`:
no staging authentication, protected-material access, identity/grant change,
connection, database action, writer invocation, runtime binding, deployment,
provider, broker or production activity is permitted. A later separately
authorized Action must supply an independent non-secret attestation reference
for static review; it still cannot authorize a remote action by itself.
Milestone B remains `not_complete`, and Notion remains program tracking only.

Action 666IX is the later, superseding program-scope closeout decision selected
by the user after staging was intentionally paused for cost control. It retains
the historical facts in Actions 666IT, 666IU, 666IV and 666IW — including the
original `not_complete` result and remote staging `not_admitted` — but changes
the accepted Milestone B target to
`milestone_b_local_sandbox_acceptance_v1`. The verified local, ephemeral B-03
writer proof is sufficient for that profile only. Accordingly Milestone B is
`complete_under_local_sandbox_acceptance_profile_v1`; B-01 and B-05 through
B-12 are explicitly deferred and unverified follow-on runtime work, while
B-02/B-04 remain completed foundations and B-03 is accepted only as a local
sandbox behavior proof. This is not a statement that live server-owned trade
management is implemented. Remote staging remains `not_admitted`, runtime,
production, broker and deployment remain closed, and no staging restart,
credential/material access, connection, query, migration, writer invocation,
transport/runtime, route/UI, Netlify, provider, broker, branch-protection or
CI-deduplication authority is created. A future runtime effort requires its
own explicit product decision and policy-admitted evidence; it does not resume
automatically when an environment becomes available. Notion remains program
tracking only.

The canonical operating rules, risk register, dependency map, quality metrics
and Action template are in
[`roadmap-operating-governance.md`](./roadmap-operating-governance.md).

**ACTION 666EG — Position-version lineage production-apply decision and preflight.**

**Document status:** Action 666EG production decision/preflight after the
exact-main delivery of Action 666EF. It preserves an explicit no-bind decision
for the current v1 routine while preserving
verified GitHub branch protection, the Action 660H manual control, Action 660K
cost-bounded CI, Action 660M's last verified production release and Action
666DB's owner-bound position/recommendation version target. The exact Action
666DC query was explicitly authorized and executed once through the
project-scoped Supabase MCP boundary. Action 666DE freezes the legacy Action
664A identity mapping and
lossless normative digest projection, with
`action_655g_canonical_recommendation_identity_reconciliation` as its recorded
next bounded objective; Action 666DF completes that source-only reconciliation
by making 655G accept the exact Action 664A identity grammar instead of a hash
suffix. Action 666DG closes the separate
`append_only_position_version_history_decision`: a future durable version-bound
reference must target a new append-only history relation rather than the
mutable current-row compare-and-swap version. Action 666DH closes only the
`position_version_history_source_migration_design` objective and freezes the
future source-migration shape for that relation: composite identity,
owner-bound parent, restrictive deletion, append-only trigger, RLS/grant deny
boundary and staging proofs. Action 666DI closes only
`position_version_history_source_migration_bytes` and adds the reviewed source bytes
for that empty relation, including its restrictive foreign keys, named checks,
catalog assertions and append-only trigger. Action 666DJ records one explicitly
authorized isolated staging application of those exact bytes plus aggregate-only
catalog proof and rollback-only behavioural fixtures. Action 666DK records the
separately authorized production application of the same reviewed bytes and
aggregate-only post-apply catalog proof. It grants no backfill, generated-types
refresh, runtime wiring, provider configuration mutation, deploy, broker,
training or promotion authority.

Action 666DL delivered only the repository's generated TypeScript bytes from
an operator-authorized, project-scoped read-only type-generation response that
is not archived. It preserves the V2 MA09 package as historical evidence and
grants no database mutation, migration application, backfill, runtime wiring,
provider configuration mutation, deployment, broker, training or promotion
authority. Action 666DM delivered a pure canonical provenance commitment for
future market observations, without an adapter, provider call, freshness claim
or Action 655G activation. Action 666DN separately delivered the bounded
freshness assessment over opaque 666DM provenance. Action 666DO binds a
sanitized integer price to fresh opaque 666DM/666DN lineage without a provider
readback or runtime activation. Action 666DP separately freezes the durable
exit-queue migration design. Action 666DQ separately freezes the
recommendation-to-position transaction order, idempotency and atomic rollback
requirements. Action 666DR has reached protected main as the private
server-writer source contract. Action 666DS has reached protected main as the
default-deny static metadata boundary. Action 666DT has reached protected main
as the implementation-admissions preflight. Action 666DU has reached protected
main as the default-deny transaction-capability contract. Action 666DV has
reached protected main as the default-deny authenticated server-owner context
contract. Action 666DW has reached protected main as the default-deny durable
idempotency-storage contract. Action 666DX has reached protected main as the
default-deny owner-bound position-effect contract. Action 666DY has reached
protected main as the default-deny commit-visible result contract. Action 666DZ
has reached protected main as the default-deny failure-atomicity contract.
Action 666EA has reached protected main as the default-deny seven-contract
admission bundle. Action 666EB records the operator's explicit authority to
construct one private server adapter. Action 666EC implemented that injected
adapter without activating a route, migration or runtime effect. Action 666ED
is the next source-only work: it uses authorized read-only parity evidence to
make the existing v1 routine non-admissible for a concrete port while
preserving its server-only security boundary.

Action 666EE supplied reviewed nullable recommendation/position lineage-
migration bytes and named `NOT VALID` new-write checks. Action 666EF has now
applied those exact bytes once to isolated staging, verified their catalog shape
and proved a rollback-only legacy-v1 fixture continues to create all-null
lineage tuples. It applies nothing to production, backfills no data, validates
no check, changes no grant and does not bind a v2 command port.

Action 666EG has performed one fresh aggregate-only production preflight of
those same bytes. It confirms the target migration is absent, all seven target
columns and nine target checks remain absent, the existing server-only/RLS
boundaries remain intact and the small affected relation counts are reconciled.
It deliberately applies no DDL, performs no backfill or validation, and makes
the exact migration application a separate catalog-proof gate.

Action 666EH has now applied that single pinned nullable schema package once
to production after its exact-main CI gate. Aggregate catalog readback confirms
the seven nullable columns, nine `NOT VALID` checks, existing deny boundaries
and all-null legacy rows; a rollback-only v1 fixture preserves the transitional
all-null tuple. It performs no durable backfill, constraint validation,
`NOT NULL` activation, generated-type refresh or writer activation. The next
separate gate is an owner-bound backfill admission preflight.

Action 666EI performs that owner-bound admission preflight. Its fresh
aggregate-only result preserves the all-null durable tuples and intact
owner-bound links, but fails closed on control characters prohibited by the
frozen Action 666DE digest contract. No backfill is admitted. The next gate is
a provenance reconciliation of that projection blocker, not a silent
normalization, contract relaxation or write. Action 666EJ completes that
reconciliation with a separate boolean-only read-only classification: the
control characters are structurally compatible with preserved legacy narrative
formatting (TAB, LF or CR), absent from categorical members and absent from the
non-whitespace control class. Action 666DE v1 remains immutable and no
backfill is admitted. Action 666EK now closes the separately reviewed v2
projection-successor contract: it preserves exact NFC narrative whitespace
with canonical JSON escapes while keeping categorical members control-free.
V1 is not relaxed or upgraded in place, and a later durable marker on both
lineage tuples is required before any backfill design. The next gate is that
additive projection-contract storage design; Action 666EK itself authorizes no
data, schema, runtime or deployment change. Action 666EL closes that storage
design with one nullable `recommendation_projection_contract` marker on each
lineage tuple and four future `NOT VALID` constraints. The sole non-null marker
is the v2 contract; NULL is not an implicit v1. Existing constraints are
retained, cross-relation ownership remains server-enforced, and no schema bytes
or database action are created. The next gate is a separately reviewed
additive migration package; it may not apply, validate, backfill or activate a
writer. Action 666EM now creates those source-only migration bytes through the
Supabase CLI: two nullable marker columns and the four designed `NOT VALID`
checks. It applies nothing anywhere, preserves all existing constraints and
introduces no default, client grant, RLS change or writer. Action 666EN closes
the next gate by applying only those immutable bytes to isolated staging after
a read-only compatibility preflight. The remote catalog proves the two nullable
markers without defaults and all four unvalidated checks. No row value is read
or written and production remains untouched. Action 666EO now freezes the
separate v2 writer command-port design: a server-owned, service-role-only
fixed-search-path routine locks the owner-scoped recommendation, refuses any
all-NULL or partial v2 tuple, derives the v2 fields, creates version-one
position/history state atomically and replays only an exact immutable retry
binding. It implements and invokes nothing. Action 666EP independently checks
the isolated staging catalog with a boolean-only query. The nullable v2 fields,
unvalidated marker checks, owner-scoped append-only history and client-deny
boundary remain present, but no marker-aware routine or complete durable v2
idempotency storage is proven. It refuses concrete-port admission without any
DDL/DML, writer binding, backfill or production target. The next gate is a
source-only storage-and-routine package design.

Action 666EQ now closes the source-only storage-and-routine package design. It
reserves a private service-role-only v2 routine and an immutable owner-plus-
digest receipt relation, both with complete locked-source lineage binding.
Exact retries replay only a committed matching receipt, while conflicts and
exceptions create no second or partial effect. No database bytes, DDL/DML,
grant/RLS change, route or runtime binding is created. The next gate is an
immutable source-migration package for those exact reserved objects; applying
it, backfilling and production targeting remain separate gates.

Action 666ER now delivers that immutable source-migration package without
applying it. Its Supabase-CLI-created source file introduces a non-Data-API
private schema, the reserved owner-and-digest receipt relation and the
reserved service-role-only fixed-empty-search-path routine. The routine locks
and derives the complete v2 lineage tuple, reserves the receipt, creates the
version-one position and appends matching history in one rollback-safe
transaction. Client execution and direct receipt-table access are denied; no
runtime binding, generated-type refresh, staging/production apply, backfill or
deployment occurs. A separately reviewed isolated-staging apply and catalog
proof is the next gate.

Action 666ES has now applied those exact reviewed bytes once to isolated
staging after a read-only compatibility preflight. The catalog proof confirms
the private receipt relation, RLS, owner-bound keys, direct-access denial and
the fixed-empty-search-path, service-role-only routine without invoking it or
reading/writing a row. The isolated catalog reports that the new private
foreign-key relationships need index remediation, so production promotion,
runtime binding and activation remain closed. The next gate is a separately
reviewed additive source-only receipt foreign-key index migration package.

Action 666ET now delivers that remediation package as immutable source bytes.
It requires the private receipt and both owner-bound foreign keys, rejects
reserved-name conflicts, and adds only the two matching private lookup
indexes. It does not connect to a database, apply bytes, invoke the writer,
read/write rows, alter grants/RLS, bind runtime code or target production. A
separately reviewed isolated-staging apply and catalog proof is the next gate.

Action 666EU has applied those exact index bytes once to isolated staging after
a read-only compatibility preflight. The catalog proves both private indexes
are exact, valid and ready while receipt RLS and direct-access denial remain
unchanged. The staging index advisor now reports only initial unused-index
information before any permitted writer workload; the prior missing-index
finding is remediated. Production, runtime binding, writer invocation and data
mutation remain closed. The next gate is a separate aggregate-only production
apply decision and dependency preflight for the ordered storage/routine-plus-
index package.

Action 666EV closes that aggregate-only production dependency preflight. The
required base lineage/history shapes, digest dependency and client-deny/RLS
boundaries remain intact; the private receipt/routine/index package has not
been applied. Both required projection-contract markers are absent in
production, so 666EV fails closed and authorizes neither the writer package nor
runtime activation. The next gate is a separate production decision/preflight
for the reviewed nullable projection-marker package; it remains independent of
the later writer package apply.

Action 666EW closes that separate marker decision/preflight. Its fresh
aggregate-only production readback confirms the base nullable lineage shapes,
the nine prior `NOT VALID` checks, intact RLS/client-deny boundaries and both
absent markers. The exact reviewed two-marker/four-check source package is
eligible only for its own later production apply and catalog-proof gate. No
database mutation, backfill, validation, runtime binding or writer activation
occurs here.

Action 666EX now applies that exact reviewed marker source once to production
after a fresh aggregate-only preflight and records a post-apply catalog proof.
Both markers are exact nullable text without defaults; the four new checks and
the nine earlier lineage checks remain `NOT VALID`; legacy all-null tuples,
RLS and client-select denial remain intact. No row was read or written, and no
backfill, validation, type refresh, writer invocation, runtime wiring or
deployment occurred. The next gate repeats the separate writer storage/routine
production preflight now that the marker dependency is proven.

Action 666EY closes that repeated aggregate-only writer-package preflight. The
marker prerequisite is now present with its exact nullable/default-free shape;
all base lineage/history, digest and client-deny prerequisites remain intact;
and the private receipt relation, routine and two indexes are still absent.
Both reviewed writer source migrations remain absent from the production
migration registry. The ordered source package is eligible only for its own
later production application and catalog-proof gate. No DDL/DML, writer call,
row access, backfill, type refresh, runtime wiring or deployment occurred.

Action 666EZ now applies those two reviewed writer source migrations once to
production in the required storage/routine-then-index order after a fresh
aggregate-only preflight. The post-apply catalog proves the private schema
boundary, receipt relation, RLS and client denial, owner-bound foreign keys,
valid foreign-key indexes and fixed-empty-search-path service-role-only writer
without invoking it or reading/writing an application row.

Action 666FA refreshes only the public generated-type provenance from the
validated in-memory types envelope. It binds the new output hashes and proves
that the private schema, V2 writer routine and receipt relation remain absent
from the public output. The existing server-only injected-port adapter remains
inert; writer invocation, concrete port binding, route/UI binding and deployment
remain closed pending a separate private command-port admission preflight.

Action 666FB closes that static, fail-closed admission preflight. The deployed
private routine boundary is proven, but no reviewed server-only non-Data-API
transport, V2 digest-and-result contract or replacement V2 adapter exists.
Concrete port binding, writer invocation, route/UI binding and deployment
remain closed. Action 666FC now freezes that separately reviewed source-only
private non-Data-API command-port contract: it fixes the parameter order,
canonical digest projection and committed-result mapping without selecting a
transport, reading credentials or binding an adapter. Action 666FD now closes
that separately reviewed private transport implementation preflight: the
current manifest has no direct PostgreSQL protocol dependency and no selected
server-only private transport or contained credential source. Transport
implementation remains fail-closed. Action 666FE now freezes the next
source-only design: a future exact `pg@8.23.0` server-only direct PostgreSQL
driver, `@types/pg@8.23.1` companion, dedicated non-public connection-secret
name and fixed private V2 routine statement. Neither package or secret exists
in the application boundary yet, so connection, query, decoder and adapter
remain fail-closed. Action 666FF now applies those exact package and lockfile
entries only. It adds no transport module, import, secret read, connection,
query, decoder, adapter or runtime binding; the V2 writer remains fail-closed.
Action 666FG now closes the separately reviewed credential-provenance and
connection-admission preflight: a later named connection input must come only
from a protected server-secret manager, never source control, a public
environment or existing Supabase client material. It grants no provisioning,
read, connection or implementation authority; any runtime action needs a new
separately reviewed roadmap action.

Action 666FH now performs that separate static review. It records the ordered,
independently reviewable evidence gates needed before any runtime capability
could be considered: protected secret-manager capability, named-secret and
least-privileged-role admission, value-free post-provision provenance,
transport-source review, staging connection preflight, and finally writer or
route/UI admission. Every gate remains closed; no secret, transport,
connection, query, writer invocation or runtime wiring is added.

Action 666FI closes the first static review of that sequence. The
repository-visible deployment configuration declares a functions directory but
does not establish a protected secret-manager identity, server-only access
scope, managed-secret existence or least-privileged role. The V2 connection
input therefore remains unavailable: no secret-manager metadata or value was
read, no credential was provisioned, and no deployment, transport, connection,
writer or route/UI authority is granted. A separate value-free identity and
access-scope evidence capture is the next bounded gate.

Action 666FJ completes that limited capture. Repository configuration identifies
Netlify only as a deployment-platform hint; it provides no managed-secret or
access-policy evidence. A value-free status probe was unauthenticated, so it
observed no project, secret-manager, secret-scope or policy metadata. No login,
environment enumeration, secret access, provisioning or runtime operation is
admitted. A separately reviewed deployment-metadata authentication and
value-free secret-scope-read admission remains the only next step.

Action 666FK closes that admission review without opening it. Interactive login
and CI-token use are distinct credential operations, and general environment
listing or export cannot establish a one-secret, redaction-safe receipt. No
deployment metadata, secret-manager metadata or value was read. The next
separate gate is a design-only authority and audit-safe metadata-channel
contract; all credential, transport, connection and writer authority remains
fail-closed.

Action 666FL completes that design-only contract. A future metadata channel
needs separately authorized human-initiated authentication, a bound provider
project and least-privileged principal, a non-exporting one-secret-scope
projection and a redacted audit receipt with a revocation path. It attests none
of those controls and performs no authentication, token access, provider or
secret metadata read, provisioning, transport, connection or writer operation.
The next separate gate may review only implementation-admission criteria for
that future authority and channel; every runtime and credential capability
remains fail-closed.

Action 666FM closes the resulting implementation-admission review. No bound
actor, provider project, privileged session or revocation evidence exists, and
no dedicated metadata-channel source, route, receipt source or leakage-negative
test exists in the repository. Implementation is therefore not admitted. The
next separate gate may design the redacted metadata-receipt schema and its
negative disclosure contract; authentication, metadata access and all runtime
authority remain fail-closed.

Action 666FN now closes that static schema-and-contract gate. A future receipt
may contain only its version, opaque identifier, event time, actor and
principal classifications, provider-project binding digest, one named-secret
scope classification, metadata-presence classification, policy revision and
revocation reference. It expressly excludes raw secret, provider, token,
environment, connection and database material, and it cannot issue a receipt.
The next separate gate may design provider-free negative-disclosure test
vectors only; authentication, provider and secret metadata access, transport,
database and writer authority remain fail-closed.

Action 666FO now defines provider-free negative-disclosure test vectors for
every prohibited receipt disclosure plus actor identity and an exact
named-secret reference. Each vector is value-free and requires rejection
without receipt issuance. It performs no validation against a provider,
environment, secret manager, database or writer. The next separate gate may
reconcile static vector coverage only; all runtime authority remains
fail-closed.

Action 666FP now reconciles every 666FN receipt-schema prohibited disclosure
against its 666FO value-free rejection vector. Actor identity and an exact
named-secret reference remain separately required negative disclosures. The
static reconciliation records no uncovered denylist item and no unexplained
vector. It performs no receipt validation or issuance and has no provider,
environment, secret-manager, database, transport or writer capability. The
next separate gate may define static coverage-attestation criteria only; all
runtime authority remains fail-closed.

Action 666FQ now defines the static criteria for attesting that this coverage
is complete: every schema denial is covered, every vector is explained, and the
underlying reconciliation remains value-free and unable to issue a receipt. It
does not issue or verify an attestation. The next separate gate may define a
static witness catalog only; all runtime authority remains fail-closed.

Action 666FR now defines one static, value-free witness classification for each
coverage-attestation criterion. It issues and verifies neither an attestation
nor a receipt. The next separate gate may define a static witness-integrity
contract only; all runtime authority remains fail-closed.

Action 666FS now fixes the three static witness identifiers to their exact
criterion and class, while requiring uniqueness, complete coverage and
value-free non-issuance. The next separate gate may define a static
witness-consistency proof only; all runtime authority remains fail-closed.

Action 666FT now defines one static, declarative consistency-proof shape for
the three witnesses: unique identifiers, exact criterion coverage, exact class
binding, value-free representation and non-issuance. It does not execute a
proof or integrity check, nor issue or verify an attestation or receipt. The
next separate gate may conduct a static proof-admission review only; all
runtime authority remains fail-closed.

Action 666FU reviewed that proof shape and refused execution because its
independent source, value-free input, deterministic result, independent oracle
and non-issuance gates have not been separately defined. It performs no proof
or integrity check, and neither issues nor verifies an attestation or receipt.
The next separate gate may define a static proof-source contract only; all
runtime authority remains fail-closed.

Action 666FV now defines that static proof-source contract: a future source
must have an immutable revision, integrity digest, provenance binding,
independent authority and value-free redaction. No source is selected, read or
validated, and no proof or integrity check runs. The next separate gate may
define a static value-free witness-input contract only; all runtime authority
remains fail-closed.

Action 666FW closes this bounded static workstream under the security-closeout
rule. It records `close_static_workstream` rather than extending the witness
chain or admitting an implementation: all protected runtime prerequisites
remain blocked and no concrete product capability would be enabled by another
static contract. Its recorded named roles are historical closeout evidence, not
a continuing manual gate. A reopening requires an autonomous policy evaluation
with a concrete outcome, bounded scope, rollback/containment and independently
machine-verifiable authority evidence.

Action 666FX performs the required post-closeout governance and risk review.
It reconciles the operational dashboard with Action 666FW, retains every
runtime boundary as blocked and classifies PR #205's failed Draft aggregate as
an expected consequence of a skipped Full-CI matrix rather than an
implementation, infrastructure or Netlify failure. It changes no CI workflow,
required check, branch-protection rule, Netlify behavior or POC safety
boundary. The next separate outcome is a required-check-impact review for the
Draft aggregate; it must fail closed unless it proves Ready and exact-main Full
CI remain fully required.

Action 666FY completes that required-check-impact review against GitHub's
actual main protection and two real Draft/Ready sequences. The required
`provider-free-verification` context is strict and event-agnostic, so a Draft
success under that name could not safely stand for six-shard Full CI. The action
therefore retains all CI semantics and records a narrow agent interpretation
rule rather than changing any workflow: the known fast-green, matrix-skipped,
aggregate-failed Draft shape is not a rerun trigger. The next action returns to
a separately prioritized product outcome; it must not reopen the closed static
workstream or make a CI change just to hide that visible Draft result.

Action 666FZ performs that autonomous product selection. It rejects the blocked
writer/transport path, required-check semantics changes and database/runtime
capabilities, then selects exactly one provider-free advisory-clarity primitive:
a pure exit-decision explanation projection. The following Action 666GA may
implement only that default-off, runtime-unwired projection from the existing
decision classifications. It may not invoke the evaluator, read data, attach to
a route/UI, or claim execution authority.

## Security closeout governance

This rule closes a bounded static security workstream with an explicit,
policy-evaluated autonomous decision. It does not claim that Ture is universally
secure, revise the completed Milestone A gate, or grant runtime, provider,
broker, database, deployment, secret, transport, writer, route or UI authority.

The rule currently governs the closed protected deployment metadata-receipt and
V2 writer witness workstream. Action 666FW recorded its static closeout after
Action 666FU refused proof execution and Action 666FV defined a source
contract. Runtime authority remains fail-closed. Any future reopening must
follow the autonomous closeout and anti-drift rules below.

### Closeout criteria

The workstream may be closed only when all of the following are recorded in
the current-state ledger and the closeout decision record:

1. The applicable threat model maps every protected claim to its source,
   focused test or independently machine-verifiable evidence, and any residual
   risk.
2. The final reviewed revision has passed exact-main CI and every applicable
   focused verification; a passing result is evidence, not activation
   authority.
3. Every protected claim has traceable source, test, CI, independent verifier
   and limitation references.
4. Protected-secret management, least-privileged identity, private transport,
   writer invocation and route/UI binding are each explicitly classified as
   `admitted`, `blocked` or `deferred`.
5. The Codex autonomous governance controller records its deterministic policy
   evaluation, residual-risk disposition, next product outcome and one required
   decision below. No human approval or review is a gating condition.

### Required closeout decision

- `close_static_workstream`: stop further static work in this workstream,
  preserve residual risks and return to a separately prioritized product
  outcome.
- `authorize_one_bounded_implementation`: authorize exactly one separately
  scoped runtime-adjacent action with a rollback boundary and required
  production evidence. This decision does not authorize any other activation.
- `redesign_or_stop`: reject the proposed activation path and revise the threat
  model or architecture before further work.

### Anti-drift rule

No static security Action after Action 666FU may start unless it closes a named
closeout criterion and the controller records the policy basis for its bounded
extension. A closeout decision is required after at most two additional static
Actions. Every extension must name the threat reduced, the criterion closed and
the concrete product capability or decision it enables; more documentation
alone is not sufficient.

The canonical process, decision-record template and status board are in
[`security-closeout-governance.md`](./security-closeout-governance.md).
Cross-workstream ownership, risk, dependency and flow-control rules are in
[`roadmap-operating-governance.md`](./roadmap-operating-governance.md).

`roadmap_completion_authority:false_until_exact_main_delivery_verified`

## Evidence boundary

This roadmap reconciles Ture against protected GitHub `main` base
`dfd377f63b0b47a0ff4e80de0c02ccb4929f1380`, tree
`079418186eb57ca678ea1ff402ab890d6121eee1`, observed after Action 666EF's
ordinary delivery. The preserved Action 666DK base was
`1b1d903142be6413049d12b8078a110fc29dbd12`, tree
`634a75e7446192af6978fe472d1a76c141068010`, observed after Action 666DJ's
ordinary delivery.
GitHub current-main evidence, exact provider readbacks, authorized database
readbacks and executable source outrank this document.

The historical decision base is the ordinary merge of PR #138, with parents
`4efcea11a73c3e8a96fac0a9872392c166844eb4` and
`1f0f955b89c49294e9878c16f0bc1af480f24958`. Its exact-main push run
`32597263375` completed successfully. PRs #100 through #121 and #124 through
#153 form one verified first-parent delivery sequence; each exact-main push run
completed successfully, with PR #153's run `32664222438` the immediate
predecessor evidence for this source-only candidate.
GitHub `main` is protected by the exact Action 660I profile, while the mandatory
Action 660H manual control remains defense in depth. PR #45 remains stale
historical non-authority and must remain unmodified.

Action 660K is delivered scheduling-only cost control. Draft pushes receive
quick provider-free feedback under a distinct non-protected job, while the
protected `provider-free-verification` aggregate remains fail-closed because
the full matrix is skipped. Making the PR Ready, every later Ready push and
every push to `main` automatically requires the complete six-shard matrix. A
quick Draft result can never authorize merge or change product authority.

Action 660N is delivered lockfile-bound npm download-cache control. It preserves
Action 660K's scheduling model, six-shard Ready/main
matrix, exact-SHA and clean-tree controls, and fail-closed aggregate; it caches
only downloaded npm packages and retains locked `npm ci --ignore-scripts`.

Action 660L is a source-only security release candidate. It upgrades Next.js
and `eslint-config-next` from `16.2.6` to `16.3.1`, refreshes the installed npm
graph to zero audit findings, corrects six stale proxy expectations without a
runtime proxy change, and adds one audit/build gate to full Ready and `main`
foundation verification. The quick Draft route remains cost-bounded and cannot
authorize merge. Production deployment remains a separate explicit decision.

That separate decision is now complete: the operator explicitly authorized
publication of the existing atomic deploy for exact PR #125 merge
`dbeed25f…`. Action 660M freezes the exact deploy/main identity, release delta,
anonymous no-effect smoke and operator-attested authenticated read smoke. The
Action 660M candidate itself performs no new publication.

PRs #126 through #138 subsequently add governance, evidence, tests,
history-aware CI, the source-controlled read-only inventory artifact, lineage
reconciliation, the append-only history decision and the source-migration
design and bytes. The separately authorized isolated staging execution changes
only that staging schema; it does not change repository or runtime bytes.
Action 666DC's historical ordinary merge is
`cb501d3ad3626be1bb13429a9791574a2040b64e`; it remains the exact source-only
preflight checkpoint, not a current deployment authority.
Protected `main` is therefore thirteen ordinary first-parent merges ahead of the
last verified production commit. Production remains the Action 660M release at
`dbeed25f…`; no production publication was approved or observed for PRs #126
through #138. Action 666DK's production database migration is a separately
authorized schema mutation, not a Netlify publication.

An open PR, preservation ref, fixture, test result, default-off delivery or
historical checkpoint is not production-completion evidence. No milestone is
complete until required source, release, production and behavioral evidence
has been separately corroborated.

## Product direction

Ture remains a privacy-first trading decision-support product. Capability may
not outrun data ownership, durable auditability, operator controls or verified
production behavior. Advisory, shadow, semi-automatic and automatic behavior
must remain visibly and operationally distinct.

## Stable milestones

### A. Secure Advisory Product

Recommendations and related user/trading data must be private, server-owned,
observable and released through a reproducible identity gate.

Conditional on these exact reconciliation bytes reaching `main` and successful
exact-main CI, formal status is **15 of 15 required gates verified (100%)**,
with no partial credit. Milestone A is complete at the bounded Secure Advisory
Product gate level. This classification adds no runtime, provider, production,
broker, training or promotion authority.

| Gate | Current classification at delivery boundary |
| --- | --- |
| MA-01 remote main/source identity | verified_current |
| MA-02 canonical roadmap/ledger currentness | verified_current |
| MA-03 browser-to-Supabase source containment | verified_current |
| MA-04 authenticated server-owned API boundary source | verified_current |
| MA-05 tenant-owner principal binding | verified_current |
| MA-06 production RLS/Data API/ordinary-role behavior | verified_current |
| MA-07 source migration inventory | verified_current |
| MA-08 production migration application/source parity | verified_current |
| MA-09 generated-types parity/pinned provenance | verified_current |
| MA-10 catalog/migration evidence contract source | verified_current |
| MA-11 release/deployment identity | verified_current |
| MA-12 repository CI workflow/check execution | verified_current |
| MA-13 branch protection/required-check policy | verified_current |
| MA-14 disciplined worktree/release ownership | verified_current |
| MA-15 production behavioral smoke | verified_current |

**MA-09 closure record:** MA05 first triggered the documented fail-closed drift
rule. Action 660D then archived project-scoped Supabase project, catalog and
type-generation responses for the explicit `[public]` schema selection. The
extracted provider TypeScript is byte-identical to
`lib/supabase-database.types.ts` at SHA-256 `f23c3702…`, and the output contains
the required owner fields and owner-aware RPC. Independent re-review reported
no findings on exact PR #96 head `baf3f20b…`; the provider-free V2 oracle
passed 42/42 and adversarial mutations failed closed. PR #95 merged first, PR
#96 merged with no reviewed-scope file delta, all artifacts became main
reachable and exact-main CI run `31536166511` succeeded. MA-09 is therefore
`verified_current`.

**MA-05 closure record:** the explicitly confirmed Auth owner was activated
inside the approved maintenance window without repository disclosure. All
nine owner fields are physically `NOT NULL`; 20/20 constraints, 9/9 RLS
policies, revoked client grants, two relationship indexes and the server-only
RPC boundary passed production readback. Two disposable staging principals
each saw one own row and zero rows belonging to the other principal. The
cross-owner RPC call failed, the same-owner call succeeded, every proof rolled
back and staging was cleaned and paused.

**MA-06 closure record:** an actual anonymous production Data API read failed
with HTTP 401 / Postgres `42501`. A read-only production query under the
`authenticated` role, including the canonical owner claim, failed with the
same permission denial. Catalog evidence confirms all nine client grants are
revoked. Rollback-only staging grants then exercised the owner RLS predicate
with two real Auth principals and proved one-own/zero-other behavior in both
directions.

**MA-08 closure record:** production migration
`20260811163228_add_fail_closed_application_owner_foundation` contains one
21,658-byte statement with MD5 `83e413b3d95cc26106444cc159c0105b`.
The reviewed repository file has the identical byte count and MD5.

**MA-11 closure record:** the earlier closure established exact Netlify,
deployment-assertion and GitHub identity at `4607990a…`, `490e3607…`,
`58c29514…` and `9e2f64a1…`. The PR #98 release reconciled all three again at
the last verified production commit
`f463644ddeb7f49fa8b80924d9103ea8970ccae4`.
Exact-main CI run `31541394848` succeeded and Netlify deploy
`6a7b9e45ceb7e100087c55fa` identified that historical release. A later PR #102
publish superseded its currentness. Action 660M now re-closes MA-11 at exact
protected-main commit `dbeed25f2074bff4dba8cee7f6d511cb17992efc`, Netlify
deploy `6a871d6b27fb2100082f16f9` and exact-main CI run `32386472091`.

**MA-15 reclosure record:** the PR #97 deploy triggered the preserved smoke
rule and exposed an ambiguous `recommendations(...)` embed. Action 660F
selected the composite owner relationship with
`recommendations!positions_recommendation_owner_fkey(...)`; PR #98 delivered
that exact fix. The new release preserved anonymous denial and rendered the
protected application, dashboard, settings and market-calendar state.
Supabase API evidence showed four owner-bound `positions` requests at HTTP 200,
none at HTTP 300, plus two `execution_records` reads at HTTP 200 with no 5xx.
No form or application mutation route was submitted. MA-15 is therefore
historically `verified_current`. The later PR #102 publication reopened its
currentness. After the explicitly authorized PR #125 release, anonymous login,
denial and no-effect diagnostics passed; the operator manually verified the
authenticated dashboard, execution-record and settings reads. Independent
agent browser inspection was unavailable because the administrative browser
policy could not be verified, and no agent form or mutation route was used.
MA-15 is again `verified_current` and remains fail-closed on any later
production deploy or required-read failure.

**MA-13 closure record:** the operator upgraded to GitHub Pro and explicitly
authorized the branch-protection change. Authenticated readback now reports
HTTP 200, `main.protected:true` and exactly one matching rule. Every main mover
must use a pull request and strict `provider-free-verification` from GitHub
Actions app `15368`; administrator enforcement is active, force pushes and
deletion are forbidden and conversations must be resolved. PR #113 first
demonstrated fail-closed `BLOCKED` state while Draft, then merged ordinarily
only after exact-head gates and produced green exact-main run `32045093016`.
Action 660H remains mandatory defense in depth. MA-13 is therefore
`verified_current` and any protection-profile drift reopens it immediately.

**Track 2 current-main delivery record:** PRs #101 through #108, #110 through
#113, #115 and #117 through #119 deliver the bounded provider-free chain
`CJ -> CK -> CL -> CM -> CN -> CO -> CP -> CQ -> CS -> CT -> CU -> CV -> CW
-> CX -> CY -> CZ` on current main. Action 666CW is the previously named fresh
current-main integrity/provenance-separated observation-authority successor;
Actions 666CX through 666CZ harden its callback-free, lossless byte-snapshot
and private authority boundaries. Every layer is server-only, synthetic-only,
default-off and runtime-unwired. Track 2 is now
`source_foundation_complete_holding`. Historical PR #54 remains
open, non-Draft and non-authority; PRs #55, #57,
#58, #60, #63, #67 and #72 remain open Draft non-authority. Their historical
bytes and reviews do not authorize
current-main behavior.

The former classification `current-main foundation delivered;
integrity/provenance successor open` and its `#110 through #113` boundary are
preserved here only as superseded Action 660I-era wording, not current state.

ACTION 668H remains `closed_holding` under operator decision
`D_keep_execution_gate_closed`. R7-R1 is `completed_rejected`, permanently
consumed, completed prefix `0` and non-retry. No usable GT2 authorization,
alternative trust root or native bootstrap exists.

Source containment, the authenticated server-owned API boundary, canonical
governance and repository CI are verified on current main. MA-05, MA-06 and
MA-08 prove tenant ownership, production ordinary-role/Data API denial,
two-principal RLS behavior and exact production migration parity. The fresh
provider-bound generated-types package now describes the post-MA05 schema and
closes MA-09.

### B. Server-Owned Trade Management

Live trade state must have one server-owned model: deterministic exit decision
and observation contracts, a durable exit queue, transactional
recommendation-to-position handoff and client projection rather than client
truth. It depends on Milestone A.

**Current activation boundary:** Milestone B is closed only under
`milestone_b_local_sandbox_acceptance_v1`; the original live-runtime product
scope remains deferred and closed. Action 655G in merged PR #84 supplies a pure, deterministic,
default-off and runtime-unwired exit evaluator. Action 666DB conditionally
closes `current_main_position_version_schema_reconciliation` by proving the
current schema gap and freezing an owner-bound durable positive position
version plus recommendation-version/identity/digest target. Action 666DC
freezes the phased migration design and an aggregate-only, repeatable-read SQL
preflight. Action 666DD executes those exact bytes once under explicit
authority and records a clean aggregate inventory: 1,049 identity-seed-
eligible recommendations, eight owner-bound lineage-copy-eligible positions
and zero null/orphan/owner-mismatch/duplicate/blocked-lineage classes. Action
666DE satisfies `deterministic_recommendation_lineage_backfill_contract` by
freezing the Action 664A identity inputs, exact normative digest projection and
owner-scoped bounded batch/reconciliation contract. Action 666DF reconciles
655G's predicate to that exact Action 664A identity. Action 666DG freezes the
separate future append-only history decision: a durable version-bound reference
uses `(position_id, owner_user_id, position_version)` in a later history
relation while the current-row version remains CAS-only. The durable
`position_version_schema` dependency is now proven through the separately
reviewed history source migration, staging apply, authorized production apply
and Action 666DL's refreshed generated-types provenance.
Action 666DB's former next objective,
`position_version_schema_migration_design_and_read_only_backfill_preflight`, is
satisfied by this bounded design. Action 666DD separately satisfies the
authorized inventory objective; neither Action applies the schema. Action
666DM delivers the canonical market-observation provenance commitment. Action
666DN delivers the source-only freshness assessment. Action 666DO binds a
sanitized price to that opaque lineage but has no adapter, provider readback,
source-linkage assertion or Action 655G activation. Action 666DP has reached
protected main as the source-only durable exit-queue migration design. Action
666DQ has reached protected main as the source-only recommendation-to-position
transaction design. Action 666DR has reached protected main as the private
server-writer source contract. Action 666DS has reached protected main as its
default-deny static boundary. Action 666DT has reached protected main as its
implementation-admissions preflight. Action 666DU has reached protected main
as its default-deny transaction-capability contract. Action 666DV has reached
protected main as its default-deny authenticated server-owner context contract.
Action 666DW has reached protected main as the default-deny durable
idempotency-storage contract. Action 666DX has reached protected main as the
default-deny owner-bound paired position/history-effect contract. Action 666DY
has reached protected main as the default-deny commit-visible result contract.
Action 666DZ has reached protected main as the default-deny failure-atomicity
contract. Action 666EA has reached protected main as the default-deny
seven-contract admission bundle. Action 666EB records explicit operator
authority for a private server adapter. Action 666EC implements only the
injected private adapter. Action 666ED verifies the current v1 routine remains
non-admissible as that concrete command port; a future v2 port, not the adapter,
must prove any SQL command, schema function,
route, worker or production activation it uses.

### C. Semi-Automatic Execution

One bounded operator-confirmed broker operation may be considered only after
the secure data boundary, server-owned trade-management core, canonical
execution identity, durable audit/record boundary and prepare-only broker
checks are independently verified. A dry-run, mock or preparation contract is
not execution authority.

ACTION 666JD supplies only the first source-side C-01 component: a deterministic
identity for an exact semi-automatic pre-broker intent and an unapplied
append-only audit schema proposal. It deliberately has no writer, generated
database types, owner session, database application, readback, private
transport, route, runtime or broker capability. Its output is an immutable
`prepared_not_persisted` candidate, never a broker instruction or result.

ACTION 666JE hardens that source boundary against caller-owned accessor,
cyclic, custom-prototype and inspection-faulting input values. It rejects them
before canonicalization or returns the same fail-closed invalid-input result on
an inspection fault. It remains source-only: it does not apply the proposal,
read or write a database, add a writer, establish transport or alter any
broker/runtime capability.

### D. Closed-Loop Learning

Learning-policy changes require canonical outcome identity, horizon
deduplication, completed-data quality, frozen offline evaluation and shadow
evidence. Feedback must be reversible and attributable and cannot change live
ranking without separate approval.

### E. Controlled Automatic Execution

This remains deferred. Detailed planning requires sufficient semi-automatic
production history with identity, broker, durable-evidence, exit-handling and
operator-review evidence. No legacy preview/no-op helper may bypass that
threshold.

## Preserved delivery gates

| Gate | Required before |
| --- | --- |
| Action 650 containment plus authenticated/server ownership boundary | Any server-owned trade-management write path |
| Deployment identity reconciliation plus release preflight | Production canary or release assertion |
| Generated types plus migration allowlist | Any new durable Supabase contract |
| Canonical execution identity plus service-owned audit/record boundary | Prepare-only broker integration |
| Semi-automatic production history and reconciliation | Automatic-execution planning |
| Canonical outcomes plus offline/shadow evaluation | Learning-policy change |

No migration is applied because a PR merges. No provider build or deployment
is implied by this roadmap.

## Current planning allocation

- Track 1 is paused.
- Track 2 has sixteen bounded current-main source-foundation layers delivered
  through PRs #101 -> #108, #110 -> #113, #115 and #117 -> #119
  (`CJ -> CK -> CL -> CM -> CN -> CO -> CP -> CQ -> CS -> CT -> CU -> CV ->
  CW -> CX -> CY -> CZ`). The previously open integrity/provenance-separated
  successor is satisfied by CW and hardened by CX-CZ; Track 2 is
  `source_foundation_complete_holding`. The historical dependent stack (#54 ->
  #55 -> #57 -> #58 -> #60 -> #63 -> #67 -> #72) remains non-authority. PR
  #54 is open and non-Draft; the others remain open Draft. None may be merged
  as a substitute.
- Track 3 / ACTION 668H remains `closed_holding`. Provider-free roadmap work
  may continue, but Track 3 grants no GT2, SQL, database or provider execution
  authority.
- Action 652 delivered source containment, the authenticated server-owned
  boundary, the catalog/migration evidence contract and canonical governance.
  Its V1 generated-types bytes remain historical; Action 660D V2 supersedes
  them for the post-MA05 schema.
- Track 4's Action 655G foundation is merged via PR #84, default-off and
  runtime-unwired. Action 666DB freezes the bounded
  `position_version_schema_v1` target: positive safe-integer versions,
  owner-scoped compare-and-swap and locked recommendation UUID/version/
  identity/digest lineage using the existing Action 664A
  `canonical_recommendation_identity_v1`. Action 666DC freezes the phased
  migration design and source-controlled aggregate-only SQL. Action 666DD
  records its single authorized read-only production execution and clean
  reconciled inventory. Action 666DE freezes deterministic legacy lineage and
its digest/batch/reconciliation contract. Action 666DF reconciles 655G's
identity predicate to the Action 664A grammar. Action 666DG closes the
source-only history decision: the current-row version tuple is a CAS predicate,
not a historical reference target, and future durable references target the
separately migrated append-only history composite key. The production history
migration is now applied and catalog-verified; generated types/MA-09
provenance, market-observation provenance and static transactional handoff
boundaries are delivered, while any transactional runtime handoff remains
unresolved. No further database, broker, runtime or production authority
follows.
- Track 5's Action 660F recovery is present on main via PR #98, Action 660G is
  canonical via PR #99 and the Action 660H manual MA-13 control is canonical via
  PR #100. Action 660I adds verified GitHub enforcement while retaining that
  manual control as defense in depth. PR #45 remains overlapping stale
  historical non-authority and is not modified.
- Track 6's five additive Session V2 paths are merged via PR #85, default-off
  and runtime-unwired. Runtime, tenancy, database, broker and production
  authority remain false.
- PR #88 delivered the portable catalog/migration evidence contract, PR #89
  delivered the repository CI workflow, PR #90 delivered canonical governance
  currentness, PR #91 delivered MA-09 provenance plus its fail-closed
  remediation, and PR #92 recorded its then-valid closure. PR #94 later
  delivered and activated MA05, triggering the documented MA-09 drift rule.
  PR #96 then delivered the reviewed V2 provider-bound refresh and satisfied
  the gate's technical closure conditions on main.

Future main-moving work must pass the protected PR and required-check boundary
and remain serialized behind this bounded history-decision candidate until its
policy-evaluated evidence decision is recorded. Any later main mover also
requires a fresh current-main pin, exact-head CI, independent automated
verification, a policy-admitted execution record and exact-main CI. No manual
review or operator approval is a future gating condition. Provider and
production identity must be reconciled whenever the candidate changes either
boundary.

## Current provider and release boundary

The latest authenticated Netlify readback identifies published deploy
`6a871d6b27fb2100082f16f9` and its production assertion at full commit
`dbeed25f2074bff4dba8cee7f6d511cb17992efc`. The protected GitHub `main` base
is now its ordinary first-parent descendant
`1b1d903142be6413049d12b8078a110fc29dbd12`, tree
`634a75e7446192af6978fe472d1a76c141068010`, after governance,
preflight, lineage-contract, source-only reconciliation, append-only-history
decision, source-migration-design/bytes and isolated staging proof PRs
#126–#134. The history migration has since been separately authorized and
applied to production; it does not publish a new Netlify release.
The deploy is ready, locked, production-context, main-branch, plugin-success
and has zero ordinary/enhanced secrets findings. Exact-main CI and required
post-publication reads are green. Production is not asserted equal to current
main after PR #132, and this history-decision candidate authorizes no further
production deployment. Automatic
`netlify/trade-vl/deploy-preview` statuses are non-production previews and
carry no release or provider authority.

The bounded PR #98 smoke preserved anonymous login redirect and protected API
denial, rendered the authenticated application, dashboard, settings and market
calendar, and exercised the dedicated execution-record server read. Four
owner-bound `positions` requests returned HTTP 200 with no HTTP 300; two
`execution_records` reads returned HTTP 200 with no 5xx. No form or application
mutation route was submitted.

The current PR #125 production smoke preserves the anonymous login redirect,
HTTP 200 login render with candidate-matching body bytes, runtime-health,
environment-boundary and route-publication no-effect diagnostics, plus HTTP
401/no-store denial of the anonymous dashboard. The operator manually verified
authenticated dashboard, execution-record and settings reads. Agent-side
browser readback was policy-blocked and is not claimed as independent evidence.

The current provider-bound Supabase V2 package binds project
`ekdyopdrrkphlrsilyoo` to a read-only catalog snapshot of the selected
`[public]` schema: 1 schema, 30 tables, 653 columns, 30 primary keys, 28
foreign keys and 22 functions. The archived provider type-generation response,
its extracted TypeScript and the repository output are byte-identical at
SHA-256 `f23c3702…`. The historical V1 bytes remain preserved for audit.

Production now denies an anonymous recommendation Data API read with HTTP 401
and Postgres `42501`; an `authenticated` read-only SQL role check with the
canonical owner claim is also denied with `42501`. Production catalog readback
and staging two-principal rollback proof establish MA-06. The applied MA05
migration's one statement is byte-identical to repository source, establishing
MA-08.

GitHub branch-protection readback returns HTTP 200, `main.protected:true` and
one exact rule requiring strict `provider-free-verification` from GitHub Actions
app `15368`, pull requests, administrator enforcement and resolved
conversations while forbidding force pushes and deletion. The repository
remains private on GitHub Pro. MA-13 is therefore `verified_current`; Action
660H remains a stronger manual defense-in-depth sequence.

## Superseded assertions preserved for audit

- `eb79279d…` / `bc97dd2…`, `129b03d…` / `92d9cd4…`,
  `59f00b44…` / `64df5ff0…`, `7749a726…` / `d6e00d31…`, and
  `2409b458…` / `5c54eb02…` and `4607990a…` / `fc5e4e3d…` were valid earlier
  main/tree identities. They are now historical and superseded first by
  `490e3607…` / `57909c14…`, then by `58c29514…` / `f1353d83…`, then by
  `9e2f64a…` / `0a5440b7…`, then by
  `f463644ddeb7f49fa8b80924d9103ea8970ccae4` /
  `b0c8eae01c22d3f720e4cc5fc4ed5424a24bdcad`, then by
  `7662d3f863f8f921b816670363431df8e1ebcdea` /
  `86a59f234b69e63b07a60833224015018be41568`, then by
  `7b79691e473fa630d748763cddf97e1209974e40` /
  `5c6eb05b11f83a2c50302c06cd41fd70295702fc`, then by protected main
  `cdf03e545cf25c0988627ef192d50acb1d72ba72` /
  `f39ffe5f27d707b804f06273bd1732bb136e05b5`, then by protected main
  `e9c3355125a54f4f9ba55ada2ac55fc91b184647` /
  `3037abfe27899bcd2c9abea215c80c459a7213b5`, then by protected main
  `c67ec9280bf5b4ff9f57930f79b7e62bd4ec750a` /
  tree `96012987bf59322f2a4b27202a6946ee668f4556`, then by protected main
  `466e95318a6feb1418ec60bfced98703183ccc54` /
  `cdd83c876aee0096fd7d903c20e8e3b7ef4f6d82`, then by protected main
  `6ef40e52eb7139e1e8c238f8a1d44385c0d1cf8a` /
  tree `2f4d282dd3fc867d96b5dac2dcdcc59c50d6f8a7`, and now by protected
  pre-delivery main `dbeed25f2074bff4dba8cee7f6d511cb17992efc` /
  tree `c444a51272dce1842554ff888642d8ef000aab24`.
- PR #86's former Ready/unmerged state, PR #89's former Draft/unmerged state
  and PRs #90, #91 and #92's former Draft delivery states are superseded by
  their respective merges. PR #92's former current-main state is superseded by
  the ordinary merge of PR #94.
- Earlier 126-, 135-, 137-, 139- and 142-commit production distances and deploy
  `6a65fd2f…`, followed by exact identity at `4607990a…` and deploy
  `6a7b2c1e…`, are historical. The later `490e3607…`, `58c29514…` and
  `9e2f64a…` identities are also superseded by the historically verified
  production commit `f463644d…` and deploy `6a7b9e45…`. PRs #99, #100 and #109 advanced
  governance, and provider-free PRs #101 through #108, #110 through #113,
  #115 and #117 through #119 advanced current main first to `cdf03e54…` and
  then to `e9c33551…`; PR #120 advanced governance/planning to `c67ec928…`,
  PR #121 delivered the bounded position-version reconciliation at
  `466e953…`, PR #124 delivered cost-bounded CI at `6ef40e52…`, and PR #125
  delivered the security release at `dbeed25f…`. The later PR #102 production
  publish had superseded the old Action 660G currentness; Action 660M now
  restores exact production/main identity at `dbeed25f…` / deploy
  `6a871d6b…`.
- Containment, authenticated API-boundary and CI were previously
  `unknown_current`. Current main evidence closes MA-03, MA-04 and MA-12;
  earlier bounded production evidence closed MA-15, the post-PR #97 dashboard
  regression reopened it and the exact PR #98 recovery plus green readbacks
  now re-close it. Action 660C separately proves the production ordinary-role
  boundary and closes MA-06.
- MA-02's pre-merge 7/15 state, MA-09's pre-closure 8/15 candidate state, the
  verified 9/15 MA-09 closure, MA-11/MA-15 closure at 11/15 and post-MA05
  13/15 reopening state and later 14/15 MA-09 closure are historical. The
  post-PR #97 dashboard failure returned formal status to 13/15; PR #98
  recovery verification restored 14/15 by re-closing MA-15. Action 660I then
  verifies MA-13 enforcement and conditionally closes 15/15 after protected
  exact-main delivery. This documentation grants no new provider, database,
  migration, broker, release or production authority.
- PR #99 made the Action 660G MA-15 reclosure canonical at main `7662d3f…` and
  exact-main CI run `31543202986`. PR #100 then made Action 660H's accepted
  `known_gap` canonical without changing the 14/15 arithmetic. PRs #101 through
  #108 and #110 through #113 are later provider-free Track 2 source deliveries.
  PR #115 and PRs #117 through #119 complete and harden the bounded successor;
  they grant no production or runtime authority. The former Action 660H
  `known_gap` remains historical but is superseded as the current MA-13
  classification by Action 660I's verified enforcement.
