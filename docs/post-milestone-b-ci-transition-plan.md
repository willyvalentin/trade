# Post-Milestone B CI Cost & Throughput Transition Plan

Status: **planned / inactive until Milestone B closeout**.

This document defines the CI transition that Ture should execute immediately
after Milestone B — Server-Owned Trade Management — is formally closed. It is a
planning and governance artifact only. It changes no workflow, required check,
branch protection, release authority, runtime authority or production behavior
before the explicit post-B transition gate is reached.

## Why this transition exists

Ture currently uses a deliberately strict verification model:

- Draft PRs receive a small, non-authoritative targeted verification path.
- Ready PRs run the complete six-shard Full CI matrix.
- Every push to protected `main` runs the complete six-shard Full CI matrix
  again on the exact main SHA.

That model is appropriate while Ture is establishing the security-sensitive
Milestone B foundations: canonical identity, owner-bound position state,
private writers, durable history, idempotency, secret/identity boundaries,
private transport, runtime admission and recovery behavior.

It is not intended to become an unquestioned permanent cost model for every
future UI, documentation, research, shadow-agent or isolated product change.
After Milestone B has closed, Ture should preserve the same safety properties
while routing verification according to the risk and authority of the changed
surface.

The operating objective is:

> **Full verification where money, canonical state, risk or execution authority
> can change; targeted verification where they cannot.**

## Activation trigger

The transition may begin only when all of the following are true:

1. Milestone B is formally classified complete in the canonical master roadmap.
2. The server-owned trade-management runtime slice has passed its bounded
   behavior-level trial.
3. Recommendation-to-position handoff, canonical position state, exit handling,
   durable retry/recovery and client projection are proven at the required B
   boundary.
4. Protected secret management, least-privileged runtime identity, private
   transport and writer invocation are no longer unresolved B blockers.
5. The final B candidate has passed the then-current required Ready and
   exact-main Full CI model.
6. A post-B CI baseline record captures the current workflow duration, runner
   minutes, failure/cancellation mix and re-run rate before any gate changes.

Until all six conditions hold, the current Ready/main Full CI model remains
unchanged and mandatory.

## Target operating model

The post-B CI system should classify a proposed change into three risk tiers.
The exact path classifier, workflow identities and branch-protection mechanics
must be independently designed and verified before activation.

### Tier 1 — Normal / isolated product work

Examples:

- documentation-only changes;
- visual/UI changes that cannot alter canonical trade state;
- isolated statistics or presentation work;
- research-only analytics;
- Agent SDK shadow/eval work with no canonical influence;
- non-authoritative diagnostics and developer tooling.

Target verification:

- lint and TypeScript where applicable;
- deterministic changed-path/affected-test selection;
- critical security smoke;
- relevant focused unit/integration/browser tests;
- clean-tree/exact-revision checks;
- fail-closed fallback to a broader tier when classification is ambiguous.

A routine Tier 1 change should not automatically pay the complete six-shard
Full CI cost twice merely because it moved through Ready and then `main`.

### Tier 2 — Core trading/state/intelligence work

Examples:

- recommendation lifecycle or canonical identity;
- position state and exit management;
- Supabase schema/RLS relevant to trading state;
- risk calculations or authority-adjacent state;
- canonical outcome/learning paths;
- promoted intelligence that can influence live ranking.

Target verification:

- all Tier 1 checks;
- expanded domain-specific regression groups;
- schema/RLS/identity checks when relevant;
- integration and stale/retry/conflict behavior tests;
- Full CI when the affected safety property cannot be proven by the bounded
  domain suite or when the classifier is uncertain.

Tier 2 is risk-based, not automatically lightweight.

### Tier 3 — Critical execution / release authority

Examples:

- broker integration;
- KÖP/SÄLJ submission or confirmation handling;
- position/risk authority changes;
- secrets, privileged identity or private transport;
- kill switch or circuit-breaker behavior;
- production migration with trading-state impact;
- runtime authority or release-gate changes;
- CI/branch-protection changes themselves.

Target verification:

- complete Full CI on the exact merge candidate;
- capability-specific broker/risk/security verification;
- required release/readback evidence;
- exact revision and clean-tree proof;
- post-merge integrity/smoke or Full CI according to the proven release model;
- explicit rollback/containment.

Milestone C execution work will therefore still contain Full CI gates. The
transition is intended to remove unnecessary Full CI from unrelated work, not
to make broker/execution development permissive.

## Ready vs exact-main deduplication objective

A central post-B investigation is whether Ture can safely move from:

```text
Ready merge candidate
→ Full CI
→ merge
→ exact-main Full CI again
```

toward a proven model such as:

```text
Ready merge candidate
→ risk-appropriate required verification
→ merge
→ exact-main integrity/smoke verification
→ Full CI only when critical/release/cadence policy requires it
```

This is a target architecture, not an already-authorized workflow change.
Before any deduplication is activated, the implementation must prove that the
merge-candidate evidence cannot be incorrectly reused after a tree/base change,
that required-check identity remains unambiguous, and that any mismatch fails
closed to Full CI.

## Safety properties that must survive the transition

No CI optimization may weaken these properties:

1. Protected `main` still requires a PR-based admitted check path.
2. Verification is bound to the exact candidate/revision it claims to cover.
3. Ambiguous path/risk classification escalates rather than skips.
4. Security-, state-, risk-, database- and execution-critical changes cannot
   self-classify into a cheaper tier without deterministic evidence.
5. Stale/cancelled/partial matrices cannot satisfy a required gate.
6. Clean-tree and dependency/lockfile integrity remain verifiable.
7. Production/release authority remains separate from source merge authority.
8. CI configuration and classifier changes are themselves treated as critical.
9. A one-step rollback to the current conservative Full CI model is retained.
10. Delivery metrics never become authority by themselves.

## Success targets

The transition should be evaluated against a frozen pre-change baseline.
Initial planning targets are:

- **50–75% reduction in heavy Full-CI runner minutes during normal development**;
- **40–70% reduction in CI-induced developer/agent wait for Tier 1 work**;
- materially lower duplicated Ready + exact-main Full-CI cost;
- no increase in escaped critical regressions attributable to the new selector;
- no weakening of required execution/risk/release gates;
- deterministic explainability for why each change received Tier 1, 2 or 3.

These are optimization targets, not authority conditions. If evidence shows a
lower safe saving, safety wins.

## Required post-B implementation sequence

The transition should be executed as a bounded program rather than a single
workflow edit:

1. **CI-B0 — Freeze post-B baseline.** Record runner minutes, wall-clock,
   failure/cancellation classes, Ready/main duplication and re-run rate.
2. **CI-B1 — Freeze risk taxonomy.** Map repository paths/capabilities to Tier
   1/2/3 and define fail-closed ambiguity rules.
3. **CI-B2 — Build selector and affected-test oracle.** Provider-free,
   deterministic and locally testable.
4. **CI-B3 — Shadow classification.** Run the future selector without changing
   required gates and compare its selected suites against actual Full CI.
5. **CI-B4 — Design required-check/branch-protection transition.** Prove exact
   GitHub semantics, including Ready/main identity and stale-run behavior.
6. **CI-B5 — Implement workflow candidate.** Keep rollback to the existing
   six-shard model immediate and explicit.
7. **CI-B6 — Adversarial verification.** Test changed base, mixed critical and
   non-critical paths, lockfile changes, workflow changes, cancellation,
   failure, unknown paths and classifier tampering.
8. **CI-B7 — Activate bounded post-B model.** Only after independent evidence
   proves the preserved safety properties.
9. **CI-B8 — Reconcile cost/throughput and defects.** Compare the new model to
   the frozen baseline and retain, tune or roll back based on evidence.

## Milestone C interaction

This CI transition is intended to happen immediately after B and before Ture
moves deeply into Milestone C, but it must not become a blocker to a bounded C
capability if the CI change itself needs redesign.

During Milestone C:

- ordinary UI/research/shadow work should use risk-appropriate targeted CI;
- broker/risk/execution-authority work remains Tier 3 and may still require
  complete Ready and/or exact-main verification;
- a live execution pilot always uses the strongest applicable release gate;
- the optimizer may never downgrade a change because Full CI is expensive.

## Cost governance

CI spend is an engineering resource and should be measured like provider or
model spend. Ture should track at least:

- billable runner minutes per merged PR;
- Full-CI runs per merged PR;
- duplicated Ready/main verification minutes;
- cancelled/stale minutes;
- re-run minutes caused by code defects vs infrastructure/workflow behavior;
- median and p90 wall-clock to a mergeable candidate;
- cost by risk tier;
- percentage of Tier 1/2 changes escalated to Full CI.

The purpose is not to minimize CI cost at any price. The purpose is to maximize
**verified product progress per runner minute** while preserving the safety
properties that matter.

## Rollback rule

If the post-B selector, workflow or branch-protection model produces an
ambiguous required-check state, a safety regression, unexplained coverage gap,
or material increase in escaped defects, Ture must be able to restore the
pre-transition Ready/main six-shard Full CI model without changing product
runtime behavior.

## Permanent governance rule

> **CI depth follows authority and risk, not the mere existence of a commit.**

Ture keeps comprehensive verification for money-, risk-, state- and
execution-critical work, while normal product development should use the
smallest independently proven verification set that preserves the applicable
safety properties.
