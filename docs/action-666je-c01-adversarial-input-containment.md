# ACTION 666JE — C-01 adversarial input containment

## Bounded objective

Make the source-only C-01 canonical-audit boundary fail closed when an
untrusted in-memory JavaScript value cannot be safely inspected. This prevents
a malformed object from turning audit preparation into an exception path or
from invoking a caller-supplied accessor.

```text
action_or_decision_id: ACTION_666JE / C01_ADVERSARIAL_INPUT_CONTAINMENT
bounded_objective: reject uninspectable execution-intent object graphs before canonicalization
milestone_or_product_outcome: C-01 canonical execution identity and durable audit foundation
threat_or_delivery_risk_reduced: hostile accessor, cyclic graph, custom-prototype value or inspection-faulting proxy can otherwise interrupt the fail-closed preparation boundary
blocked_by: none for the local source boundary
unblocks: regression-safe future review of a separately admitted server-owned audit writer
authority_boundary: source-only; no migration application, database, route, runtime, secret, provider, deploy, broker or production action
required_evidence: focused adversarial contract tests plus the existing six-shard Ready and exact-main gates if merged
focused_verification: canonical-execution-intent-audit contract test and provider-free registration-plan contract
residual_risks: this does not prove a database writer, private transport, authenticated owner context, staging application, rollback or independent readback
autonomous_governance_controller: Codex autonomous governance controller
delivery_automation: Codex delivery automation
independent_machine_verification: focused Playwright contract checks and protected CI after review
decision_policy_version: roadmap-operating-governance-v1
stop_go_or_closeout_trigger: stop on any input that cannot be inspected as dense ordinary data; accept only the existing rejected-result disposition
rollback_or_containment: revert the source-only change; no remote state, credential, fixture or migration exists to clean up
```

## Delivered containment

`prepareCanonicalExecutionIntentAudit` now verifies the complete caller-owned
object graph before canonicalization. It accepts only dense ordinary data:
own enumerable data properties, dense arrays, primitives and ordinary object
prototype chains. Accessor properties, symbol properties, sparse or decorated
arrays, circular/shared references, null/custom-prototype records and
inspection faults are rejected. Any inspection exception, including a proxy
fault reached by a later shape read, resolves to the existing
`canonical_execution_intent_audit_input_invalid` rejected result without
disclosing the thrown value.

The focused test proves that a throwing accessor is not invoked and that
accessor, cyclic, custom-prototype and throwing-proxy inputs all return the
same non-persisted rejected disposition. The existing C-01 contract test is
registered in the existing provider-free foundation command so the six-shard
CI layout, required-check identity, aggregation behaviour and no-deduplication
policy remain unchanged.

## Authority and next decision

This Action creates no migration application, no database client or row, no
generated type, no route, no runtime binding, no secret, no provider access,
no deployment and no broker capability. It does not establish a writer or
private transport. C-01 remains incomplete: a later, separately admitted
server-owned writer still needs generated types, authenticated owner binding,
approved private transport, rollback and minimized independent readback.
