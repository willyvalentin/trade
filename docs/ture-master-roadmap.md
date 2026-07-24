# Ture Master Roadmap

**Action 651 — Canonical Ture Master Roadmap and Current-State Ledger.**

**Status: canonical/current.**

This is the governing product roadmap as of the verification timestamp in
[the current-state ledger](./ture-current-state-ledger.md). It supersedes
fragmented roadmap, readiness, and checkpoint claims in older Action documents.
Those documents remain **historical reference**: they preserve evidence about a
specific past scope, but cannot establish current product state on their own.

## Evidence Authority

- Executable source and exact production readbacks outrank documentation,
  planning claims, and historical checkpoint narratives.
- An open pull request is not `main`, and local uncommitted work is not a
  delivered capability.
- Passing tests are necessary evidence but do not, by themselves, prove
  production readiness or authorize a production mutation.
- Roadmap Actions adapt to new corroborated evidence; the product vision and
  stable milestones do not change without explicit product approval.

## Product Vision

Ture is a trustworthy trading decision-support product that can progress from
secure advisory recommendations to carefully bounded, evidence-backed trade
management and eventually controlled execution. Product capability must never
outrun its data ownership, auditability, operator controls, or demonstrated
production behavior.

## Product Principles

- Treat trading, portfolio, user, execution, provider, and broker data as
  private by default.
- Make server ownership and durable evidence prerequisites for any stateful
  trading action.
- Prefer explicit, deterministic identities, contracts, limits, and terminal
  states over inferred or best-effort behavior.
- Keep advisory, shadow, semi-automatic, and automatic behavior visibly
  separate. A preview, mock, or readiness result is not execution authority.
- Fail closed on unavailable configuration, ambiguous identity, missing
  evidence, unverified schema, or unknown provider/broker state.
- Prove a narrow production behavior before widening scope. Never substitute
  documentation volume for runtime evidence.

## Absolute Execution And Safety Contracts

1. No direct browser access to private Supabase trading or execution tables.
   Action 650 is the containment package; Action 652 establishes the reviewed
   authenticated/server boundary needed before containment can be applied
   without abandoning product flows.
2. Every provider or broker request requires an explicit server-owned contract,
   immutable identity, bounded budget, and a durable terminal record.
3. Manual authorization is single-use, short-lived, exact-contract-bound, and
   cannot become a transferable execution permit.
4. An execution admission must be atomic with its durable claim/attempt. A
   terminal path may not leave a reusable credential or dangling active claim.
5. Audit and ledger evidence must be sanitized, linked to the same attempt, and
   idempotent per canonical attempt identity. Raw credentials, cookies, broker
   pages, and provider payloads are never durable evidence.
6. Scheduled execution remains disabled unless an independently verified,
   explicit rollout approval enables it. A dry-run is not live execution.
7. Learning inputs are offline/shadow-only until outcome quality, identity,
   deduplication, and calibration evidence are independently verified.

## Stable Milestones

### A. Secure Advisory Product

**Outcome:** recommendations and related user/trading data are private,
server-owned, observable, and deployable through a reproducible release gate.

Definition of done:

- Action 650 containment is reviewed, merged, applied only with explicit
  production approval, and role behavior is verified in production.
- Action 652 replaces current direct-browser Supabase reads/writes with an
  authenticated API/server boundary or a reviewed ownership-scoped policy
  model; no private table retains anonymous access for compatibility.
- Production deployment commit, Netlify assertion, GitHub main, and release
  preflight agree.
- Migration allowlist, generated types, security catalog checks, and CI gates
  reject forbidden drafts and privilege regressions.
- Clean worktree ownership/preservation procedures are documented and followed.

Current blockers:

- Production deployment assertion is stale relative to the published commit.
- Private trading data remains exposed until Action 650 is applied.
- Current Trade App and Settings flows are direct public Supabase consumers.
- The production catalog role matrix required before Action 650 application has
  not been captured in this governance action.

### B. Server-Owned Trade Management

**Outcome:** live trade state is controlled by one server-owned model rather
than client-side table mutation.

Definition of done:

- Canonical exit engine and server-side live monitor have deterministic,
  idempotent decision and observation contracts.
- A durable exit queue records the exact position, reason, authority, and
  terminal result, with no client bypass.
- Recommendation-to-position handoff is transactional, auditable, and safe on
  retry; client state is a projection, not the source of truth.
- Position history, statistics, and settings are served through the authenticated
  boundary established in Milestone A.

### C. Semi-Automatic Execution

**Outcome:** an operator can prepare and manually confirm one bounded broker
operation with durable evidence, without automatic submission.

Definition of done:

- Canonical execution identity is used end-to-end by the execution lifecycle,
  handoff, broker adapter, record, and audit paths.
- Durable execution records and append-only audit evidence are production
  verified under the secure data boundary.
- Avanza transport is prepare-only until broker session, account, instrument,
  payload, and idempotency checks are proven.
- One explicitly approved BUY trial and one SELL trial each have exact durable
  evidence, reconciliation, and a post-run review. No trial implies automatic
  authority.

### D. Closed-Loop Learning

**Outcome:** learning uses a canonical, quality-controlled outcome dataset and
only affects decisions after offline and shadow evidence supports it.

Definition of done:

- Recommendation-level outcome dataset has canonical identity, horizon
  deduplication, outcome semantics, and completed-data quality gates.
- Calibration is assessed offline with a frozen evaluation plan and an adequate
  sample, then compared in shadow ranking.
- Any feedback is guarded, reversible, attributable, and cannot mutate live
  ranking without separate approval.

### E. Controlled Automatic Execution

**Outcome:** deferred. Detailed implementation planning starts only after
sufficient semi-automatic production history demonstrates safe identities,
broker behavior, durable evidence, exit handling, and operator review.

Definition of done:

- A separately approved automatic-execution design defines authority,
  account/risk limits, kill switches, monitoring, reconciliation, rollback,
  incident response, and an evidence threshold based on Milestone C history.
- No legacy preview/no-op helper is promoted as a shortcut to this milestone.

## Prioritized Near-Term Actions

1. **Action 650 delivery and production approval gate:** review/merge PR #44;
   capture the production catalog/role matrix; do not apply its migration until
   the Action 652 compatibility boundary is ready.
2. **Action 652 — Authenticated API Boundary and Browser Supabase Removal:**
   define and implement the minimal server-owned read/write boundary for
   recommendations, positions, settings, history, scanner/calendar data, and
   diagnostics. This is the next planned authentication action; numbering
   continues sequentially from here.
3. **Action 653 — Production Deployment Identity Reconciliation:** correct the
   stale deployment assertion through an authorized configuration/release flow,
   then prove Action 645 preflight identities agree.
4. **Action 654 — Security CI and Migration Allowlist Gate:** automate catalog
   grant/RLS/policy assertions, forbidden-migration exclusion, generated type
   provenance, and release-worktree checks.
5. **Action 655 — Server-Owned Trade Management Design:** freeze the canonical
   exit engine, monitor, queue, and recommendation-to-position transaction
   contracts before runtime implementation.

## Longer-Term Capability Roadmap

- Implement and production-verify the Milestone B trade-management core.
- Integrate the deterministic execution identity work from draft PR #43 only
  after its review and secure persistence dependencies are satisfied.
- Build a prepare-only broker transport and then conduct bounded BUY/SELL
  semi-automatic trials.
- Consolidate the canonical outcome dataset and run offline/shadow learning
  evaluation before changing any live ranking or confidence behavior.
- Reassess automatic execution only after the defined semi-automatic evidence
  threshold is met.

## Explicit Non-Goals And Deferred Work

- Automatic execution implementation.
- Promotion of legacy Avanza preview/no-op helpers.
- Additional mock broker variants.
- More readiness frameworks without a runtime outcome.
- Advanced optimization before durable broker execution.
- Multi-account execution.
- Learning-policy changes before offline/shadow evaluation.
- Removal of dirty worktrees before their preservation owner approves it.

## Architecture And Delivery Dependencies

| Dependency | Required before |
| --- | --- |
| Action 650 containment plus Action 652 authenticated/server boundary | any server-owned trade-management write path |
| Deployment identity reconciliation and reusable Action 645 preflight | production canary or release assertion |
| Generated types and migration allowlist | any new durable Supabase contract |
| Canonical execution identity and service-owned audit/record boundary | broker prepare-only integration |
| Semi-automatic production history and reconciliation | automatic-execution planning |
| Canonical outcomes plus offline/shadow evaluation | learning-policy change |

No migration is applied merely because its PR merges. A release must carry the
correct branch/deploy identity, allowlisted migration evidence, security tests,
and explicit production authorization.

## Rules For Future Actions

- Start from this roadmap and ledger; do not create a duplicate planning action
  when an existing milestone/dependency already governs the work.
- Allocate the next unused sequential Action number. Completed or historical
  action numbers are never reused.
- State the milestone, exact capability boundary, data ownership, production
  effect, rollback/containment, and required evidence before implementation.
- Separate local implementation, production verification, production mutation,
  and rollout approval into distinct Actions when their authority differs.
- A mock, preview, fixture, local database replay, or documentation artifact
  must be labelled as such and cannot be cited as production verification.

## Rules For Revising This Roadmap

Revise only when a read-only current-state ledger update supplies corroborated
Git, production, database, test, and delivery evidence. A revision must explain
what changed, preserve the prior claim as historical reference, update affected
dependencies, and retain the milestone structure unless the product vision has
been explicitly re-approved.

## Evidence Required For Milestone Completion

Every completion claim requires:

- merged source and reproducible commit identity;
- a deployed production identity when production behavior is claimed;
- behavior-level tests appropriate to the risk, including effective role tests
  for access control and idempotency/terminal-path tests for stateful flows;
- read-only post-deploy evidence with no secrets or row contents;
- explicit confirmation of migration, provider, broker, schedule, and data
  effects; and
- a ledger update that names residual risks and contradictions.
