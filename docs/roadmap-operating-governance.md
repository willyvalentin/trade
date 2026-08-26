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
source, exact-main CI, authorized production readbacks and independent review
outrank this document.

## Operating rules

1. Every active Action must name the milestone or product outcome it protects
   or enables. A detailed artifact without that link is not sufficient reason
   to extend the workstream.
2. Every decision gate must name a product owner, delivery owner and
   independent reviewer before its decision is recorded. A role is not an
   authority by itself; external or runtime actions still need their separately
   required authorization.
3. The current-state ledger must keep the `Now / Next / Blocked` control view
   current whenever an Action changes scope, authority, a dependency, a
   residual risk or the next decision.
4. A new static Action may begin only when it closes a named risk, dependency
   or closeout criterion and names the capability or decision it enables.
5. No metric, dashboard value or Action count authorizes a merge, release,
   provider operation or runtime capability.

## Accountable roles and decisions

| Role | Required responsibility | Cannot do alone |
| --- | --- | --- |
| Product owner | Prioritizes the product outcome, accepts or rejects residual product risk and selects a closeout decision | Activate a runtime capability without its separate technical and operational evidence |
| Delivery owner | Maintains Action scope, dependency state, evidence links and the current ledger update | Accept their own independent review or extend a workstream without the required decision |
| Independent reviewer | Challenges scope, evidence completeness, residual-risk disposition and authority claims | Grant external or runtime authority by review alone |
| Operator | Performs one explicitly authorized external, provider, production or operational action and records its bounded evidence | Convert an operational action into broader continuing authority |

## Decision register

Every stop/go, release, runtime-admission, risk-acceptance or closeout decision
must be discoverable from the ledger using this minimum record:

| Field | Required content |
| --- | --- |
| Decision ID and workstream | Stable identifier and bounded scope |
| Decision owner and independent reviewer | Named people or explicit `unassigned` blocker |
| Evidence revision | Exact reviewed commit, focused tests, exact-main CI and required readbacks |
| Alternatives considered | At least stop/defer and the proposed path |
| Residual-risk disposition | Accepted, deferred, mitigated or redesign required, with review trigger |
| Decision | Exact allowed decision and its authority boundary |
| Next product outcome | Capability, user value or explicit decision enabled |
| Rollback/containment | Required recovery condition or why none applies |

## Initial risk register

This register records current governance and delivery risks. Severity is a
priority signal, not evidence of a vulnerability; it must be reconsidered when
the stated trigger occurs.

| ID | Risk | Severity | Current disposition | Review trigger | Accountable role |
| --- | --- | --- | --- | --- | --- |
| RG-01 | Static security work can extend without reaching a product or activation decision | high delivery risk | Mitigate through the security closeout rule and its Action budget | Action 666FU closeout review or any proposed extension | Product owner |
| RG-02 | Protected runtime prerequisites are not admitted, so an unsafe shortcut could bypass the intended boundary | high safety risk | Keep secret management, identity, transport, writer and route/UI fail-closed | Any proposal to implement or activate a runtime path | Independent reviewer |
| RG-03 | Full CI duration and repeated runs can reduce delivery throughput or hide a late-failure pattern | medium delivery risk | Observe and classify every non-successful run before changing a required gate | Weekly flow review or any CI gate-change proposal | Delivery owner |
| RG-04 | Production and current-main identity can drift after a deployment or database change | high release risk | Reconcile exact identities and reopen the affected Milestone A evidence | Every production deploy/assertion or migration application | Operator and independent reviewer |

## Dependency map

| Blocked outcome | Depends on | Evidence required before it moves | Next allowed move |
| --- | --- | --- | --- |
| Static metadata-receipt/witness workstream closeout | Action 666FU admission review and complete closeout record | Claim-to-evidence map, residual-risk disposition, named owners and exact-main CI | One closeout decision |
| One bounded V2 writer implementation | Protected secret management, least-privileged identity, private transport, writer invocation and route/UI classifications | Separately reviewed authority, containment/rollback and required operational evidence | Exactly one authorized implementation Action |
| Milestone B runtime capability | Canonical server-owned writer, durable identity, auditability and approved activation boundary | Behavior-level, idempotency and owner-bound evidence appropriate to the scope | Separately authorized runtime trial or remain blocked |
| Production publication | Exact deploy/main identity, required CI, applicable smoke/readback and explicit operator approval | Release-specific evidence; source merge alone is insufficient | One authorized release decision |

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
| Decision age | Time from a completed evidence gate to its required decision | Escalate when work continues without a recorded stop/go decision |

The delivery owner reviews these measures at least weekly and before any change
to a required CI gate. Any proposed gate optimization must state the safety
property preserved, expected time saved, rollback path and required evidence.

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
decision_owner:
delivery_owner:
independent_reviewer:
stop_go_or_closeout_trigger:
rollback_or_containment:
```

An Action that cannot fill in `milestone_or_product_outcome`, `unblocks` and
`stop_go_or_closeout_trigger` must be paused for product-owner review rather
than extended by default.

## Review cadence

- Update the ledger control board when an Action changes the current scope,
  authority, dependency, residual risk or next decision.
- Review the initial risk register at every closeout, release or runtime-
  admission decision.
- Review delivery-flow measures weekly while the full CI matrix remains the
  required merge gate.
- Reassess this governance document after the first recorded closeout decision
  or any CI-gate change; retain only rules that improve decision quality,
  safety evidence or delivery flow.
