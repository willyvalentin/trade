# Ture Execution Engine

Status: product and delivery contract, 2026-10-07. Runtime acceptance remains
unproven. This document governs future execution; the master roadmap governs
dependency order and the current delivery board selects implementation work.

## Product contract and authority

Ture has a **Recommendation Engine** and an **Execution Engine**. IBKR is the
primary broker. The Execution Engine autonomously decides whether, when and how
to trade eligible recommendations using current market data, portfolio state
and a user-authorized execution mandate. It owns sizing, order construction,
submission, protection, position management, exits and reconciliation.

The user configures and enables a bounded mandate; individual trades require
no user action. Internal Paper, IBKR Paper and Limited Live all target that
autonomous operating model. Limited Live limits capital and scope, not autonomy.
Activation, expanding a mandate and restoring broker authentication are distinct
from approving individual trades. The engine never enlarges its own authority.

This specification changes the future product design, not current account
permissions, runtime flags or broker capabilities. Recommendation graduation,
scientific validation, operational acceptance and account-scoped enablement
remain required. Current research work continues under IF-2b → IF-3 → IF-4 → IF-5.

## Recommendation Engine and Execution Engine boundary

| Owner | Decision and output |
| --- | --- |
| Recommendation Engine | Discover and rank opportunities; publish versioned, attributable recommendation events with market context, proposed entry/stop/target, horizon, quality, uncertainty, expiry and invalidation. A recommendation creates no order authority. |
| Execution Engine decision policy | Combine eligible recommendations with current quotes, events, existing positions, pending orders, available capital and the mandate. Choose `execute`, `wait`, `decline` or `no_trade`; for a position choose `hold`, `reduce`, `adjust_protection` or `exit`. Record reasons and policy version. |
| Deterministic risk and authority controls inside Ture Core | Veto any action outside the effective mandate, release envelope or broker capability. Atomically reserve risk/capital and revalidate before every submit, replace or increase. These controls are mandatory parts of the Execution Engine. |
| IBKR adapter | Resolve the exact contract/account, translate an admitted intent, submit/modify/cancel, consume broker events and report observed state. It cannot select a strategy or grant permission. |
| Shared state and evidence services | Maintain durable decisions, orders, positions, cash, costs and audit lineage. IBKR is authoritative for actual broker orders/fills/positions; Ture is authoritative for its mandate and decision history. |

The Execution Engine can decline a highly ranked recommendation because timing,
spread, liquidity, exposure or remaining budget makes it unsuitable. It cannot
invent a new strategy, trade a research-only candidate or silently reinterpret
an invalidated recommendation. Additional data changes admission or an already
validated management policy; it does not rewrite the original recommendation.
Open positions retain their bound management policy even after entry eligibility
expires. Research/model promotion is a separate versioned process.

## User mandate and settings

Store an immutable, owner/account/environment-bound `execution_mandate_version`
with effective time, optional expiry, enabled strategies/versions and audit of
who activated it. A readable risk profile expands to explicit numeric limits;
labels such as conservative/balanced/aggressive alone grant no authority.
No monetary default in this document is an approved allocation.

| Setting | Required semantics |
| --- | --- |
| Execution budget | Capital allocated to Ture in a declared base currency, independent of the full broker balance. Count filled exposure plus pending/unknown reservations and a fee/FX buffer. Define treatment of P&L, deposits and withdrawals. Reinvestment cannot increase the authorized ceiling without an explicit mandate rule. |
| Maximum trade amount | Maximum gross position notional after an order, including existing and pending quantity for the same position. Splitting or replacing orders cannot evade it. Apply any separate per-order cap too. |
| Maximum risk per trade | Estimated stop-based loss plus conservative execution/fee buffer, in currency and/or percent of a declared risk-capital basis; apply the tighter bound. A notional amount is not a loss budget. Gaps, halts and outages can exceed estimated stop risk. |
| Portfolio risk | Maximum aggregate reserved/open risk, gross/net exposure, open positions, sector/concentration and correlation limits. Unsupported exposure estimates block dependent entries. |
| Loss and drawdown limits | Daily loss and account drawdown limits, with realized/unrealized P&L and costs, session boundary, valuation source and high-water-mark/reset semantics frozen in policy. Late fills/fees update the risk calculation without rewriting historical events. A date change does not silently resume a stopped mandate. |
| Eligible trading | Allowed account, strategy/version, universe, instruments, directions, sessions, minimum data/quality requirements and event exclusions. Model confidence must state whether it is an ordinal score or a calibrated probability. |
| Execution quality | Entry price/slippage/spread limits, liquidity/participation constraints, supported order types/TIF, quote age, intent expiry and maximum decision-to-send age. Unknown limits are not unlimited. |
| Position management | Initial protection, partial/final exit, allowed stop/target changes, maximum holding time, entry cutoff, end-of-day handling and separately bounded emergency exits. First equity pilot has no overnight holding, shorting, leverage or options. |
| Activity and operating cost | Maximum orders/trades per period, retry/message limits, provider/compute budget and reserve for protection/reconciliation. These are ceilings, never targets for generating trades. |
| Operational controls | Enable, pause new entries, revoke mandate, close Ture positions, alert destinations and incident/recovery policy. Display open exposure and remaining obligations after pause/revocation. |

Effective permission is the intersection of user mandate, validated strategy,
release envelope, account permissions and broker/data capabilities. The tightest
applicable limit wins. Users cannot disable core identity, freshness, isolation
or duplicate-effect controls through a risk slider.

Size by the minimum of remaining capital, notional cap, risk-to-stop budget,
portfolio headroom and liquidity allowance. Round to the supported share/tick
increments and recheck price, cost and risk after rounding. Reconcile FX and
buying-power constraints; the pilot uses whole-share USD US equities and no
implicit borrowing or currency conversion.

Settings changes have prospective effective versions. Tightening or revocation
blocks new/increasing intents immediately, rechecks/cancels queued entries and
reconciles cancellation races. Existing fills keep protection and the pre-agreed
reduce/exit policy; do not remove protection to comply with a new entry setting.
Raising limits or adding strategies/accounts/instruments requires a new explicit
mandate and applicable release acceptance. Never silently update in-flight intent
versions. A kill state persists through restart and session rollover.

## Decision and event contracts

These are required interface semantics for implementation, not a claim that the
existing schema already carries every field. Reuse existing identities and
versioned adapters; map gaps explicitly rather than creating parallel ledgers.

| Record | Minimum required content |
| --- | --- |
| Recommendation event | Owner, recommendation ID/version/digest, strategy/model/data versions, symbol/contract scope, direction, proposed plan/horizon, source and availability times, uncertainty, eligibility, expiry, supersession and invalidation. |
| Execution decision | Unique ID; exact recommendation and mandate versions; as-of quote/event/account/portfolio state; choice/reasons, evaluated alternatives, size, risk/cost calculation, policy version and creation/expiry times. Missing data is `blocked_data`, not an evaluated investment `no_trade`. |
| Order intent | Durable ID and idempotency key; owner/account/environment, contract ID, parent decision/position/protection group, side, quantity, order type/TIF, price/tick/currency, reservations, validity, submission attempt identity and permitted management policy. Persist before send. |
| Broker event | Broker order/permanent/execution IDs, correlated intent, source event and receipt times, status, cumulative and incremental quantities, prices, commission/currency, corrections and deduplication identity. Acknowledgement is not a fill. |
| Position and result | Attributable fills/lots, reserved/released capital, actual protection, remaining quantity, realized/unrealized result, execution costs, exit reason and reconciliation status linked to original decisions. |

Recommendation revision/invalidation triggers re-evaluation of unsent and
working entries. Cancel when no longer eligible; a late fill still creates an
owned position requiring protection and reconciliation. Multiple signals for
one instrument share risk reservations and a declared arbitration policy.
Broker contract identity includes conid, security type, exchange and currency;
symbol text alone is insufficient.

## Fast IBKR execution and deployment

Use a persistent server-owned Execution Engine with an authenticated IBKR API
connection, event-driven market/order/position updates and durable recovery.
Execution and protective management operate without a browser, user workstation
or open dashboard. Reuse precomputed recommendation features and resolved
contracts; refresh execution-critical state before send. Keep model inference,
research jobs, reporting and frontend requests outside the critical order path.
No language-model call is required to authorize or transmit an order.

SV-L must select **TWS API with IB Gateway or Web API** using an account-specific
paper probe. Compare supported authentication/recovery, push events, order and
protection capabilities, pacing, measured latency, hosting and operating cost.
Do not claim one is faster before measuring the same journey. Broker-required
reauthentication may still require operator action; stale sessions pause entries
and trigger recovery/alerts. Trading autonomy is not a promise that credentials
never require maintenance.

Measure recommendation-event receipt → execution decision → durable risk/intent
commit → socket/API send → broker acknowledgement → fill, plus protection and
reconciliation lag. Freeze numeric p50/p95/p99 targets, maximum event/quote age,
queue age, protection deadline and recovery time before the relevant pilot.
Report local processing separately from broker/network delay and market fill
time. A fast acknowledgement is not proof of fast or favorable execution.
Test realistic contention, disconnect/restart and peak event load. Expired work
is rejected rather than replayed as a catch-up burst.

Bound request rates against the selected transport's current global and endpoint
limits; prioritize protection, exits and reconciliation over new entries. Use
one fenced writer per account with durable leases/sequence handling so failover
cannot create two active submitters. Secrets stay server-owned and environment
isolated. Initial deployment is owner-operated with one explicitly selected
account; multi-user brokerage is a separate product and permission scope.

IBKR Web API can return an order reply requiring confirmation. The adapter must
classify it using a versioned, explicitly authorized policy and recheck the exact
intent before responding; unknown warnings block that order and surface an
incident. No blanket acceptance/suppression of broker warnings is implied.

Primary references checked 2026-10-07 (recheck during SV-L selection):
- [TWS API introduction](https://www.interactivebrokers.com/docs/tws-api/doc/introduction): socket interface to TWS/IB Gateway.
- [IBKR Web API documentation](https://www.interactivebrokers.com/campus/ibkr-api-page/webapi-doc/): account/authentication prerequisites, pacing, sessions and order reply workflow. These are transport constraints, not proof of this account's eligibility.

## Order, protection and failure behavior

Track order submission, fills and protection as separate state dimensions.
An intended protective order is not active protection until broker evidence
establishes its state and coverage. Persist every transition and reason.

| Situation | Required behavior and acceptance evidence |
| --- | --- |
| Normal entry | Bind a current eligible recommendation and mandate, reserve capital/risk atomically, persist intent, submit once, correlate acknowledgement/fills and establish protection for actual filled quantity. Observe the entire IBKR Paper journey. |
| Submit timeout or ambiguous response | Mark `submission_unknown`, retain reservations, query/reconcile broker state and block conflicting new risk. Never assume failure and resubmit blindly. |
| Partial fill or cancellation race | Account for every fill, including after cancel request; cover only actual remaining exposure. Release unfilled reservations only on authoritative reconciliation. |
| Protection rejected, missing or late | Block new entries for the affected scope, persist an incident, and run the pre-authorized bounded protect/reduce/close policy within its deadline. If impossible, retain explicit unprotected exposure and alert; never claim flat/safe without fills. |
| Stop/target replacement | Prove parent/child and OCO/OCA semantics for the selected API and order types. Prevent accidental double exits or a gap in required protection; verify replacement/cancel acknowledgement and remaining quantity. Failure follows the protection incident policy. |
| Duplicate/out-of-order/corrected events | Deduplicate economic effects, retain source events and corrections, recompute state conservatively and reconcile ambiguous histories. No negative position quantity or duplicated P&L. |
| Disconnect/restart/worker failover | Recover durable intents/reservations, reconcile open orders/executions/positions and verify protection before resuming entries. Keep supported broker-native protection active during outages. |
| Stale data, halt or closed market | Stop new entries; apply the separately specified existing-position policy. Broker orders, stop triggers and fills cannot be assumed executable while the market is unavailable. |
| Manual/external account activity | Include external exposure in available-capital/risk checks. Do not manage or close unrelated positions. Ambiguous ownership or same-contract interference blocks affected automation pending reconciliation. |
| Session end | Stop entries early enough, cancel remaining entries, execute the configured intraday exit policy and verify residual exposure. A halt/outage leaves an incident, not a fabricated EOD close. |

Prefer broker-native protective orders where the chosen account/API supports the
required semantics; prove those capabilities rather than assuming equivalence
with internal simulation. Freeze emergency price/slippage limits separately
from entry limits. Risk-reducing authority must not permit a reversal or increase
in exposure. Modeled maximum loss remains an estimate, not a guaranteed fill.

## User visibility and emergency controls

The dashboard shows active mandate/version, allocated/used/reserved capital,
remaining risk budget, positions and actual protection, recent decisions and
reasons for waiting/declining, engine/session health, last successful broker
reconciliation, costs and exceptions. Normal trading requires no confirmation
dialog. Notifications emphasize operational exceptions and useful summaries.

**STOP AUTOMATION** durably blocks new/increasing entries, cancels queued/working
entry orders where possible and retains protective management for filled exposure.
**CLOSE TURE POSITIONS** additionally invokes the separately authorized best-effort
cancel/close/reconcile policy for Ture-owned positions. Never affect unrelated
holdings or mark a close successful merely because an exit order was sent.
Loss, severe drift, stale data or reconciliation failures can trigger an automatic
pause. Recovery/resume is explicit under the predeclared policy and recorded;
the engine cannot reset risk limits to make itself eligible again.

## Delivery stages and acceptance

Reuse the SV phases; this is not a second backlog. Every stage reports
`implemented`, `environment_verified` and `accepted` separately. Existing pure
IBKR identity/session validators are reusable foundations, not a connected broker.
Recommendation graduation remains binding before execution becomes primary work.

| Stage | Autonomous product outcome | Required acceptance before expansion |
| --- | --- | --- |
| SV-C/basic D | Internal Paper: one versioned long-only equity strategy, whole shares, at most ten eligible symbols and one open position, regular hours, no overnight. | Full unattended session, conservative fills/costs, mandate/risk/accounting invariants, no-trade, partial fills, exits, restart and useful observer. Data rights and numeric limits established. |
| SV-L/M + base N | Same decision/mandate semantics through IBKR Paper. | Account-specific API/hosting/session proof; actual entry/fill/protection/exit/reconciliation; fault matrix above; zero duplicate or lost economic effects; latency/health limits verified. Paper fill quality is not live evidence. |
| SV-O | Limited autonomous equity live under an explicitly activated small-capital mandate. | Existing scientific gates and M operational acceptance; exact account/strategy/version/instrument scope, numeric capital/risk/latency limits, incident owner and recovery drills. Observe actual live costs and protection; no per-trade approval stage. |
| SV-P | Broader controlled equity automation. | Predeclared evidence supports each expansion; paper/live drift and net costs remain acceptable. Mandate expansion is explicit; time elapsed or trade count alone cannot promote scope. |
| SV-Q/R/S/T | Separate options research, paper and bounded autonomous live mandate. | Options-specific strategy, data, leg/protection/expiry/assignment/margin evidence and account permissions. No implicit options admission through an equity mandate. |
| SV-U | Improve execution policy using attributable fills/costs. | Frozen comparison, held-out/forward evidence, bounded versioned promotion and rollback; no automatic self-modification from recent profits. |

## Decisions that must be closed when implementation is selected

Track these in the existing delivery board, with owner, chosen value/alternative,
evidence, date and remaining limitation. Product owner supplies capital/risk
preferences; technical lead specifies and proves implementation feasibility.

| Decision | Close before | Evidence required |
| --- | --- | --- |
| Mandate schema and first strategy, symbol selection and capital/risk settings | C pilot activation | Exact effective version, currency/P&L/reset semantics, settings-change tests and full decision-to-exit replay. |
| Licensed execution quotes/history/events and feasible monitoring cadence | C pilot and each new environment | Entitlement, quote resolution/freshness, coverage, capacity and complete operating-cost calculation. |
| IBKR transport, account and persistent hosting | L transport integration | Read-only account/session/recovery probe; runtime topology, credential owner and measured latency/capability comparison. |
| Supported entry/stop/target/TIF and emergency policies | M orders | Broker Paper proof for partial fill, cancel/replace, rejected protection, reconnect and manual interference; explicit unsupported behavior. |
| Numeric latency, heartbeat, protection and reconciliation deadlines; alert/incident owner | C/M/O respective activation | Timed fault tests and actual session measurements; costs and escalation path within the enabled mandate. |
| First live envelope, capital ramp and resume/withdrawal conditions | O then P | Scientific and broker acceptance, explicit mandate activation, observed live execution and predeclared expansion/withdrawal criteria. |

Do not create another chain of planning-only helpers. Close each decision in the
smallest end-to-end delivery using existing state, risk and evidence components.
Current planning does not select a broker connection, start a worker or allocate
real capital.
