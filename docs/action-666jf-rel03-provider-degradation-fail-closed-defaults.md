# ACTION 666JF — REL-03 provider-degradation fail-closed defaults

## Bounded objective

Close a source-level bypass in the existing continuous-intelligence budget
planner. A direct caller must not be able to label a plan `normal` while the
provider is unavailable or while capacity metadata is absent, unknown or
negative.

```text
action_or_decision_id: ACTION_666JF / REL03_PROVIDER_DEGRADATION_FAIL_CLOSED_DEFAULTS
bounded_objective: require exact available provider state and affirmative capacity metadata before allocation planning
milestone_or_product_outcome: REL-03 provider degradation / freshness operating behavior
threat_or_delivery_risk_reduced: an optimistic direct planner input could otherwise allocate work during unavailable or unverified provider capacity
blocked_by: none for the source-only planner boundary
unblocks: regression-safe future review of separately admitted provider-health and freshness evidence
authority_boundary: source-only planning; no provider request, database, route, runtime, secret, deploy, broker or production action
required_evidence: focused planner tests plus the existing six-shard Ready and exact-main gates if merged
focused_verification: Action 565 orchestrator contract and provider-free registration-plan contract
residual_risks: this does not observe a provider, prove a freshness timestamp, configure a runtime, or validate a live allocation
autonomous_governance_controller: Codex autonomous governance controller
delivery_automation: Codex delivery automation
independent_machine_verification: focused Playwright contract checks and protected CI after review
decision_policy_version: roadmap-operating-governance-v1
stop_go_or_closeout_trigger: stop allocation when provider state is unavailable, session is unknown, or capacity is not affirmatively attested
rollback_or_containment: revert the source-only change; no remote state, credential, fixture or migration exists to clean up
```

## Delivered containment

`buildContinuousIntelligenceBudgetPlan` now evaluates the safety gate before
any caller-supplied degradation level. `provider_unavailable` produces
`provider_blocked`; an unknown session or non-affirmed capacity produces
`unknown`; only an exact `available` state with
`capacity_metadata_available: true` may continue to supplied or computed
degradation handling.

The planner also defaults an omitted provider state to `unknown`, and treats
an omitted capacity flag as non-affirmed. The focused contract proves that
unavailable capacity, omitted capacity and explicitly unavailable metadata all
produce zero allocation even when the direct caller supplies `normal`.

The existing Action 565 suite is registered once in the existing
provider-free foundation command. The six-shard CI layout, required-check
identity, aggregation behaviour and no-deduplication policy remain unchanged.

## Authority and next decision

This Action creates no provider observation, no freshness measurement, no
database row, route, runtime binding, secret, deployment or broker capability.
REL-03 remains in progress: a later operational step needs separately admitted
provider-health and freshness evidence before any live operating claim can be
made.
