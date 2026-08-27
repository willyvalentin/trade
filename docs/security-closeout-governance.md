# Security Closeout Governance

Status: canonical governance rule for bounded static security workstreams.

This document defines how Ture ends a bounded security-evidence workstream
with a decision. It is documentation-only and grants no provider, secret,
database, transport, writer, route, UI, broker, deployment or production
authority.

It complements the [master roadmap](./ture-master-roadmap.md) and the
[current-state ledger](./ture-current-state-ledger.md). Executable source,
exact-main CI, authorized production readbacks and independent machine-
verifiable evidence outrank this document.

Cross-workstream ownership, residual-risk, dependency and CI-flow requirements
are defined in [roadmap operating governance](./roadmap-operating-governance.md).

## Purpose

A closeout prevents a useful static safety chain from expanding indefinitely.
It does not certify that the entire product is secure. It records whether a
specific workstream has enough evidence to stop, to authorize one bounded next
implementation, or to redesign the approach.

## Current application

The rule currently applies to the protected deployment metadata-receipt and V2
writer witness workstream:

| Item | Status |
| --- | --- |
| Latest delivered boundary | Action 666FW recorded the closeout decision after Action 666FU's proof-admission refusal and Action 666FV's source contract |
| Immediate next boundary | Return to separately prioritized roadmap work; any reopening is evaluated by the autonomous decision policy without a human gate |
| Runtime authority | not admitted |
| Closeout decision | `close_static_workstream`; see [Action 666FW](./action-666fw-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-security-closeout.md) and its evidence record |
| Milestone A classification | unchanged; its bounded 15/15 gate does not imply runtime activation |

Action 666FW's named roles and review language record the historical closeout
evidence. They do not create a continuing manual approval requirement: this
canonical policy governs every later reopen, extension or implementation.

## Closeout evidence checklist

Before a closeout decision, the record must identify:

1. The exact workstream, threat model version and protected claims in scope.
2. The exact reviewed source revision, focused tests, exact-main CI result and
   any required authorized readback.
3. A claim-to-evidence map, including every limitation and residual risk.
4. The disposition of protected-secret management, least-privileged identity,
   private transport, writer invocation and route/UI binding as `admitted`,
   `blocked` or `deferred`.
5. The autonomous governance controller, its deterministic decision-policy
   evaluation and the independent machine-verifiable evidence it relied on.
6. One decision from the allowed set below.

Passing tests, a documentation review, a fixture or a static proof is never on
its own authorization to activate a runtime capability.

## Allowed decisions

| Decision | Meaning | Authority effect |
| --- | --- | --- |
| `close_static_workstream` | Stop static work, retain residual risks and return to a separately prioritized product outcome. | No activation authority. |
| `authorize_one_bounded_implementation` | Approve exactly one separately scoped implementation with rollback and production-evidence requirements. | Only the explicitly named action may proceed. |
| `redesign_or_stop` | Reject the proposed path and revise the threat model or architecture. | No activation authority. |

## Autonomous decision policy

The Codex autonomous governance controller advances the workstream from the
recorded evidence and records the closeout decision as soon as the checklist is
complete. A human product owner, operator or reviewer is never a gating
condition for this workstream.

| Evidence state | Required automatic decision |
| --- | --- |
| A required claim, test, exact-main CI result or prerequisite classification is missing, contradictory or failed | Start one named criterion-closing static Action while the Action budget remains; otherwise `redesign_or_stop` |
| All evidence is coherent but one or more runtime prerequisites are `blocked` or `deferred`, or no pre-authorized implementation policy exists | `close_static_workstream` |
| All runtime prerequisites are `admitted`, exact-main CI and scope-specific evidence pass, and a pre-authorized policy names one bounded implementation and containment plan | `authorize_one_bounded_implementation` |

The policy may create only the stated decision record or exactly the one
pre-authorized bounded implementation. It does not infer provider, secret,
database, transport, writer, route, UI, broker, deployment or production
authority from documentation or a passing test. If a required credential,
environment or technical evidence source is unavailable, the controller records
that technical block and takes the policy-selected non-activating decision; it
does not wait for manual review.

## Closed-workstream rule

Action 666FW selected `close_static_workstream` for the current application.
No static Action may start in this closed workstream. A future reopen is valid
only when the Codex autonomous governance controller records a new policy
evaluation and independent machine-verification; it never waits for a named
human owner or reviewer. The automatic missing-evidence path above applies
only after that governed reopen has been recorded.

## Anti-drift rule

For any governed reopen of this workstream, no static security Action may begin
unless it closes a named criterion below and the controller records its policy
basis. A closeout decision is mandatory after at most two additional static
Actions.

Each extension must name:

- the unresolved threat it reduces;
- the closeout criterion it closes; and
- the concrete product capability or decision it enables.

An extension that only adds narrative detail does not meet this rule.

## Decision-record template

```text
closeout_id:
workstream:
threat_model_version:
reviewed_revision:
evidence:
  source:
  focused_tests:
  exact_main_ci:
  authorized_readbacks:
claim_to_evidence_map:
residual_risks:
runtime_prerequisites:
  secret_manager: admitted | blocked | deferred
  least_privileged_identity: admitted | blocked | deferred
  private_transport: admitted | blocked | deferred
  writer_invocation: admitted | blocked | deferred
  route_ui_binding: admitted | blocked | deferred
autonomous_governance_controller: codex
independent_machine_verification:
decision_policy_evaluation:
decision: close_static_workstream | authorize_one_bounded_implementation | redesign_or_stop
decision_rationale:
next_product_outcome:
rollback_or_containment:
```

## Required ledger update

The current-state ledger must state the latest static boundary, closeout state,
runtime-prerequisite classifications, residual-risk disposition and remaining
static-action budget. A decision record becomes current only after the exact
revision and its required evidence are corroborated by the declared independent
machine-verification controls.
