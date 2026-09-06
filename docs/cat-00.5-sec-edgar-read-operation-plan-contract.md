# CAT-00.5 SEC EDGAR Read-Operation Plan Contract

## Product outcome and bounded decision

CAT-00.5 closes the local policy-shape gap before a future, separately
admitted public SEC EDGAR filing read. It verifies that one caller-supplied
plan is bound to exactly one already valid CAT-00.2 receipt and declares the
smallest safe response and post-read boundaries.

Deferring would leave a later operator to reconstruct its scope ad hoc. A
live SEC client is expressly out of scope: external authority, independent
evidence, containment, and the separate CI re-hardening review do not yet
exist. The selected pure validator is a reversible prerequisite, not an
execution path.

## Accepted plan

The input contains one valid receipt bundle with exactly one CAT-00.2 receipt
and one dense, plain-data plan. The plan must use the exact receipt evidence
ID and archive URL, plus only:

- a bounded lowercase operation ID;
- `GET`, `redirect_mode: "error"`, and `credentials_mode: "omit"`;
- expected HTTP `200`, `text/html`, and a response cap from 1 through
  1,048,576 bytes;
- `validate_only_no_persistence`, no runtime binding, no advisory influence,
  no broker action, and `not_executed`; and
- the explicit `required_before_external_authority` CI re-hardening marker.

The returned record is a detached, immutable normalization of those fixed
values and the validated receipt scalar values. It does not carry a response
body, credential, user identity, environment name, provider token, or runtime
handle.

## Default-deny and authority boundary

Malformed, accessor-backed, multi-receipt, non-SEC-receipt, URL or evidence-ID
mismatch, unsafe method/redirect/credential settings, unbounded response size,
post-read persistence/runtime/advisory/broker setting, or missing
re-hardening marker fail closed.

Even a valid result is only
`sec_edgar_read_operation_plan_validated_not_executed`; it does not execute a request or pre-authorize one. There is no network or provider call,
credential or environment read, persistence, route, worker, scheduler,
runtime binding, recommendation/risk mutation, deployment, broker action or
production behavior.

## Later gate

Any actual public SEC read remains a distinct policy-bound operation. It must
have a separately selected product decision, exact machine-verifiable
authority policy, independent readback evidence, containment/rollback plan,
and the CI re-hardening review required before external or provider authority.
CAT-00.5 cannot turn one operation into collection, persistence, advisory, or
ongoing runtime authority.
