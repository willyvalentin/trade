# Roadmap Operating Governance

Status: canonical operating governance for roadmap execution.

This document makes the roadmap easier to steer without weakening its existing
security and evidence gates. It defines concise control views, role
accountability, risk and dependency records, CI-flow measures and a minimum
Action brief. It does not grant provider, secret, database, transport, writer,
route, UI, broker, deployment or production authority.

It complements the [master roadmap](./ture-master-roadmap.md), the
[current-state ledger](./ture-current-state-ledger.md) and
[security closeout governance](./security-closeout-governance.md). Executable
source, exact-main CI, authorized production readbacks and independent machine-
verifiable evidence outrank this document.

## Operating rules

1. Every active Action must name the milestone or product outcome it protects
   or enables. A detailed artifact without that link is not sufficient reason
   to extend the workstream.
2. Every decision gate must record the Codex autonomous governance controller,
   its deterministic policy evaluation and independent machine-verifiable
   evidence before its decision is recorded. No human role, approval or review
   is a gating condition. An external or runtime action still needs a
   pre-authorized, machine-verifiable authority policy for that exact scope.
3. The current-state ledger must keep the `Now / Next / Blocked` control view
   current whenever an Action changes scope, authority, a dependency, a
   residual risk or the next decision.
4. A new static Action may begin only when it closes a named risk, dependency
   or closeout criterion and names the capability or decision it enables.
5. No metric, dashboard value or Action count authorizes a merge, release,
   provider operation or runtime capability.

## Autonomous control roles and decisions

| Role | Required responsibility | Cannot do alone |
| --- | --- | --- |
| Codex autonomous governance controller | Evaluates the declared decision policy, records residual-risk disposition and selects the required closeout decision | Activate a runtime capability without its separately admitted technical evidence and pre-authorized policy |
| Codex delivery automation | Maintains Action scope, dependency state, evidence links and the current ledger update | Extend a workstream outside its named policy basis |
| Independent automated verifier | Corroborates exact revision, CI, focused checks and declared readbacks through controls separate from the action being evaluated | Grant external or runtime authority by verification alone |
| Policy-bound automation operator | Performs one pre-authorized external, provider, production or operational action and records its bounded evidence | Convert one operation into broader continuing authority |

## Decision register

Every stop/go, release, runtime-admission, risk-acceptance or closeout decision
must be discoverable from the ledger using this minimum record:

| Field | Required content |
| --- | --- |
| Decision ID and workstream | Stable identifier and bounded scope |
| Autonomous controller and independent verifier | Controller identity, policy version/evaluation and machine-verifiable corroboration; no `unassigned` human blocker |
| Evidence revision | Exact reviewed commit, focused tests, exact-main CI and required readbacks |
| Alternatives considered | At least stop/defer and the proposed path |
| Residual-risk disposition | Accepted, deferred, mitigated or redesign required, with deterministic re-evaluation trigger |
| Decision | Exact allowed decision and its authority boundary |
| Next product outcome | Capability, user value or explicit decision enabled |
| Rollback/containment | Required recovery condition or why none applies |

## Initial risk register

This register records current governance and delivery risks. Severity is a
priority signal, not evidence of a vulnerability; it must be reconsidered when
the stated trigger occurs.

| ID | Risk | Severity | Current disposition | Review trigger | Accountable role |
| --- | --- | --- | --- | --- | --- |
| RG-01 | Static security work can extend without reaching a product or activation decision | high delivery risk | Mitigated: Action 666FW closed the bounded static workstream and Action 666FX records its post-closeout review; reopening needs the autonomous security-closeout policy | Any proposed reopen after Action 666FW or extension of an active workstream | Codex autonomous governance controller |
| RG-02 | Protected runtime prerequisites are not admitted, so an unsafe shortcut could bypass the intended boundary | high safety risk | Keep secret management, identity, transport, writer and route/UI fail-closed | Any proposal to implement or activate a runtime path | Independent automated verifier |
| RG-03 | Full CI duration and repeated runs can reduce delivery throughput or hide a late-failure pattern | medium delivery risk | Action 666FX classifies PR #205's Draft aggregate failure as expected skipped-matrix semantics; retain all gates until a required-check-impact review proves a safe change | A CI gate-change proposal or the declared cadence job | Codex delivery automation |
| RG-04 | Production and current-main identity can drift after a deployment or database change | high release risk | Reconcile exact identities and reopen the affected Milestone A evidence | Every production deploy/assertion or migration application | Policy-bound automation operator and independent automated verifier |

## Dependency map

| Blocked outcome | Depends on | Evidence required before it moves | Next allowed move |
| --- | --- | --- | --- |
| Closed static metadata-receipt/witness workstream | Action 666FW closeout record | Preserved closeout record, exact-main CI and fail-closed runtime prerequisites | Return to separately prioritized work; any reopen needs one autonomous policy evaluation and independent automated verification |
| One bounded V2 writer implementation | Protected secret management, least-privileged identity, private transport, writer invocation and route/UI classifications | Policy-admitted authority, containment/rollback and required operational evidence | Exactly one pre-authorized implementation Action |
| Milestone B runtime capability | Canonical server-owned writer, durable identity, auditability and policy-admitted activation boundary | Behavior-level, idempotency and owner-bound evidence appropriate to the scope | One pre-authorized runtime trial or remain blocked by technical evidence |
| Production publication | Exact deploy/main identity, required CI, applicable smoke/readback and a policy-admitted execution record | Release-specific evidence; source merge alone is insufficient | One pre-authorized release decision |

## Quality and delivery-flow measures

The measures below improve visibility; they are not performance targets and do
not weaken the required Ready/main six-shard CI matrix.

| Measure | Initial observed baseline | Required interpretation |
| --- | --- | --- |
| Successful full-CI duration | 29.7-minute median; 30.4-minute 90th percentile across 74 successful runs in the latest 98-run sample | Separate verification cost from runner queue time before optimization |
| Non-successful CI outcome | 21 failures and 3 cancellations in the same 98-run sample | Classify each as expected test failure, implementation defect, infrastructure issue or stale/cancelled work |
| Late failure | Failure duration and failing shard | Investigate failures that consume most of a full run before detection |
| Re-run rate | Count repeated runs for the same proposed change | Record whether the rerun followed a code fix, infrastructure issue or workflow behavior |
| Product-outcome mix | Latest 11 merged PRs included 7 governance/CI-titled changes and no runtime-titled change | Review whether the current workstream still opens a named product outcome |
| Decision age | Time from a completed evidence gate to its policy-selected decision | Automatically record the required non-activating decision when evidence is incomplete or an authority policy is absent |

Codex delivery automation evaluates these measures on the declared cadence and
before any change to a required CI gate. Any proposed gate optimization must
state the safety property preserved, expected time saved, rollback path and
required evidence.

## Minimum Action brief

Before starting an Action, record the following in its governing document or
decision record:

```text
action_or_decision_id:
bounded_objective:
milestone_or_product_outcome:
threat_or_delivery_risk_reduced:
blocked_by:
unblocks:
authority_boundary:
required_evidence:
focused_verification:
residual_risks:
autonomous_governance_controller:
delivery_automation:
independent_machine_verification:
decision_policy_version:
stop_go_or_closeout_trigger:
rollback_or_containment:
```

An Action that cannot fill in `milestone_or_product_outcome`, `unblocks` and
`stop_go_or_closeout_trigger` must be recorded as `redesign_or_stop` rather
than extended by default. It must not wait for human review.

## Review cadence

- Update the ledger control board when an Action changes the current scope,
  authority, dependency, residual risk or next decision.
- Re-evaluate the initial risk register automatically at every closeout,
  release or runtime-admission decision. Action 666FX records the first
  post-closeout review; a later Draft aggregate change still requires its own
  required-check-impact review.
- Evaluate delivery-flow measures on their declared cadence while the full CI
  matrix remains the required merge gate.
- Reassess this governance document after the first recorded closeout decision
  or any CI-gate change; retain only rules that improve decision quality,
  safety evidence or delivery flow.
