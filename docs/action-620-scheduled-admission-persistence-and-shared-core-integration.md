# Action 620: Scheduled Admission Persistence and Shared-Core Integration

## Decision

`scheduled_admission_persistence_shared_core_ready`

Action 620 prepares the durable scheduled-admission and shared-core handoff
locally. It does not deploy, declare a schedule, enable the canary, release the
kill switch, contact a provider, or create a production claim, audit, or ledger
entry.

## Durable Identity Model

The canonical Action 619 occurrence remains the root identity. Action 620 maps
it to these bounded, non-secret values:

- `execution_id`: `scheduled_canary_execution_<occurrence_id>`
- `claim_id`: `canary_claim_<execution_id>`
- `source_receipt_id`: `scheduled_canary_receipt_<occurrence_id>`
- `ledger_entry_id`: `credit_ledger_<source_receipt_id>`

The market request fingerprint remains the existing shared-core fingerprint:
`AAPL|5min|<start>|<end>`. This retains compatibility with the bounded
execution core without making the daily lifecycle identity collide with manual
execution. Manual IDs use the `manual_canary_execution_` namespace; scheduled
IDs use `scheduled_canary_execution_`.

The occurrence derives from deployment commit, scheduler contract, UTC market
date, completed 30-minute window, cadence slot, ticker, interval, and Action
565 planner profile. No scheduler secret, header, authorization, lease, random
client value, or provider response can enter a durable identifier.

## Admission Adapter

`lib/server/continuous-intelligence-shadow-canary-scheduled-admission-persistence.ts`
is a narrow server-only adapter over the existing Action 574 atomic claim RPC.
It does not calculate capacity, create an alternate claim table, begin an
attempt, finalize an attempt, or contact a provider. It maps the existing
durable outcomes to these explicit scheduled categories:

- `scheduled_claim_admitted`
- `scheduled_claim_already_terminal`
- `scheduled_claim_active_conflict`
- `scheduled_budget_exhausted`
- `scheduled_daily_usage_unavailable`
- `unknown` (fail closed)

The same occurrence receives the same lifecycle identity and therefore remains
idempotent. A claimed or attempted retry is an active conflict; a completed or
failed retry is terminal. Different slots or deployments receive distinct
scheduled IDs. Existing daily run/credit caps and durable-read failures are
preserved without reinterpretation.

## Source Metadata and Handoff

The prepared metadata contains only: `source: scheduled`, scheduler contract,
deployment commit, occurrence ID, market date/window, cadence slot, `AAPL`,
`5min`, planner profile, and the exact `377 / 57 / 320` policy. The canonical
handoff is created only after `scheduled_claim_admitted` and carries:

- admitted claim/execution/request-fingerprint identity;
- scheduled occurrence and source metadata;
- one-request/one-credit execution scope;
- Action 565 planner profile and normal-capacity policy inputs;
- scheduled audit/ledger correlation IDs.

It is labelled `scheduled_execution_handoff_ready`. The public scheduled route
then returns `scheduled_execution_disabled_locally`: provider calls, audit
writes, and ledger writes remain false. This keeps the handoff separate from
the future server-controlled workflow that must perform runtime recheck,
begin-attempt, provider request, terminal finalization, audit, and ledger in
one deterministic chain.

## Preflight and Result Mapping

Action 619 gates remain mandatory before any durable handoff: scheduler auth,
exact deployment, canary flag, kill switch, schedule state, market window,
calendar, provider, planner, audit, ledger, usage, budget, active-claim, and
persistence-stop state. Ready and blocked preflight outcomes are exposed as:

- `scheduled_admission_ready`
- `scheduled_budget_exhausted`
- `scheduled_daily_usage_unavailable`
- `scheduled_claim_active_conflict`
- `scheduled_persistence_stop_active`
- `unknown` (fail closed)

The route itself intentionally remains dry and cannot import or call the claim,
begin-attempt, finalization, audit, ledger, or provider functions.

## Schema Assessment

No migration is required. The existing daily-claim table and atomic RPC already
support independent bounded `claim_id` and `execution_id` values, a shared
market request fingerprint, one estimated credit, exact day-scoped capacity,
and terminal source-receipt linkage. The scheduled namespace is within the
existing length constraints and requires no new column. Scheduled audit and
ledger entry kinds already exist; this action only prepares their stable
correlation metadata.

## Test Evidence

Focused Action 620 coverage proves deterministic identity, deployment and slot
separation, manual namespace isolation, secret-free metadata, exact claim
result mapping, idempotent/terminal/active handling, typed budget and usage
failures, fail-closed unknown results, the single admitted handoff, local
execution disablement, retained Action 619 blockers, persistence-stop mapping,
and the absence of provider or durable-write imports in the public route.

## Remaining Gap and Action 621

**Action 621 - Server-Controlled Scheduled Execution Chain** should wire the
server-only adapter into one explicit, feature-gated workflow: final scheduler
recheck, atomic scheduled claim admission, immediate runtime recheck, atomic
begin-attempt, one provider request, terminal finalization, linked scheduled
audit, and linked scheduled ledger. It must remain undeclared in Netlify until
that complete chain has independent deployment and production-readiness review.
