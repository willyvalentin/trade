# CAT-00.7 SEC EDGAR Execution-Scope Policy Contract

## Product outcome and bounded decision

CAT-00.7 prepares the exact machine-verifiable policy shape required before a
separate, policy-bound operator could consider one public SEC EDGAR filing
read. It takes an already valid CAT-00.6 pre-read authorization and binds it
to one matching request scope. This is a local, provider-free policy validator;
it does not authorize an external request.

The policy reduces the risk that a future public-source experiment quietly
becomes a reusable data collection path. It names the exact one-request budget,
the required independent readback and the containment response before any
network activity is considered.

## Accepted execution scope

The input contains one CAT-00.6-valid pre-read authorization plus a dense,
plain-data execution scope. The scope must repeat every authorization-bound
identity and request constraint exactly, and may permit only:

- one request;
- `GET`, `redirect_mode: "error"`, `credentials_mode: "omit"`, HTTP `200`,
  `text/html`, and the authorization's exact response cap;
- `validate_only_no_persistence`, with no runtime binding, advisory influence
  or broker action;
- `required_before_external_authority` CI re-hardening;
- `required_after_single_request` independent readback;
- `stop_after_first_request_no_retry` containment; and
- `not_authorized_not_executed` execution status.

The result is detached and immutable. It contains only the policy's bounded
identity and request scalars. It contains no response body, credential, user
or environment identity, request timestamp, retrieval receipt, runtime handle
or provider output.

## Default-deny and authority boundary

Malformed or accessor-backed data, an unvalidated pre-read authorization,
identity or request drift, any budget other than one, missing independent
readback or containment, unsafe disposition, or non-default execution status
fails closed.

Even a valid result is only
`sec_edgar_execution_scope_policy_validated_not_authorized_not_executed`. It
does not authorize an external request and does not make an HTTP request. It
has no credential or environment read, route, worker, scheduler, persistence,
runtime binding, recommendation/risk mutation, deployment, broker action or
production effect.

## Action brief

```text
action_or_decision_id: CAT-00.7
bounded_objective: Validate one immutable, one-request public SEC execution scope
milestone_or_product_outcome: WhyMove primary-evidence investigation remains bounded and attributable
threat_or_delivery_risk_reduced: A future public read cannot silently widen into a collector or runtime source
blocked_by: No policy-bound operator authorization, independent readback, containment evidence or CI re-hardening review exists
unblocks: A later separately selected, policy-bound one-request operator decision
authority_boundary: Local-only validator; no network, provider, persistence, runtime, deployment, broker or production authority
required_evidence: Focused adversarial tests, exact-main CI and a separate operator record before any external request
focused_verification: CAT-00.7 Playwright contract suite, TypeScript and static no-executor inspection
residual_risks: The policy cannot prove an external operator or CI state; it must not be treated as such
autonomous_governance_controller: Codex autonomous governance controller
delivery_automation: Codex delivery automation
independent_machine_verification: Focused contract tests plus protected CI
decision_policy_version: cat-00.7-execution-scope-policy-v1
stop_go_or_closeout_trigger: Stop after this source-only policy until a distinct exact operator policy and re-hardening evidence are available
rollback_or_containment: No external side effect exists; future scope prescribes stop-after-first-request with no retry
```

## Later gate

An actual public SEC request remains a separate, policy-bound operation. It
requires the exact policy-bound operator authority, the completed CI
re-hardening review, one independent readback after one request and the stated
containment record. A successful response must still pass the CAT-00.2,
CAT-00.3, CAT-00.4 and CAT-00.5 receipt/content/retrieval/post-read boundaries.
CAT-00.7 cannot authorize collection, persistence, advisory influence or
ongoing runtime behavior.
