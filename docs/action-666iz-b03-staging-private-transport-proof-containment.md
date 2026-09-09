# Action 666IZ — B-03 staging private-transport proof containment closeout

## Decision and bounded objective

Action 666IZ attempted one narrowly contained way to turn the current B-03
catalog evidence into an actual staging rollback proof. Its target was an
existing dedicated staging writer principal, an authenticated private
PostgreSQL connection, one server-owned writer invocation inside a mandatory
rollback transaction, and an independent zero-row readback. It was never a
runtime, production, provider or broker operation.

The operation was deliberately fail-closed. A caller could proceed only if a
new, disposable secret could be supplied to the temporary branch-deploy
function without appearing in a command, log, source tree or response. That
secure caller transport was unavailable. The database writer was therefore
not invoked.

```text
action_or_decision_id: ACTION_666IZ / B03_STAGING_PRIVATE_TRANSPORT_PROOF_CONTAINMENT
milestone_or_product_outcome: Evidence-backed containment closeout for one unexecuted staging rollback-proof attempt.
scope: Existing staging identity metadata, unauthenticated direct-port preflight, one temporary preview artifact and cleanup verification.
containment: No authenticated database session or preview HTTP request after the secret-transport boundary failed closed.
independent_verification: Two post-cleanup staging readbacks, local static checks and ordinary protected delivery verification.
```

## What was verified

The current staging catalog metadata establishes that a dedicated writer
principal exists, may log in, has private-schema usage and only the writer
routine execute grant. It has no direct idempotency-relation access and no
broad role membership. This corrects the narrow interpretation of the earlier
catalog audit: `service_role` is executable, but it is not the only known
writer principal.

The database hostname resolved and accepted a TCP connection on port 5432. No
credential was sent during that preflight. This reachability check does not
establish that an application transport is private. A public CA candidate was
fetched and its self-signed root fingerprint checked locally; it was not used
to establish a database session.

A disposable Draft PR and branch-deploy-only function were prepared. The
function accepted only a POST protected by a dedicated proof token, fixed
synthetic fixture references internally, used a parameterized writer call in
a transaction that must roll back, and returned only a redacted outcome. The
matching preview deployed successfully. No request was issued to it.

## Fail-closed result and cleanup

The proof token could not be conveyed to the preview request through an
approved secret-safe caller path. The operation stopped before an
authenticated connection, writer invocation or rollback assertion. In
particular, it does **not** establish an application transport path or remote
writer behavior.

All temporary material was then removed: the three preview-only secrets were
deleted, the temporary Draft PR was closed without merge and its remote branch
was deleted, synthetic staging fixtures were removed, and the disposable
writer credential was expired. A second isolated preparation attempt reached
the same secret-transport boundary and was also stopped before invocation;
its staging state was removed as well.

Each of two independent staging readbacks confirmed that the synthetic owner,
recommendation, position, history and writer-receipt rows were absent and
that the disposable writer credential was expired. No production target,
provider, broker, product runtime, durable route or Netlify production deploy
was involved.

## Disposition and next admissible outcome

The disposition is `not_executed_secure_caller_transport_unavailable`. B-03
remains `not_admitted`; Milestone B's qualified local-sandbox closeout is
unchanged.

## Private-transport feasibility review

The direct host that accepted the unauthenticated TCP preflight is public. It
does not become a private path merely by using TLS, a project CA or a database
IP allowlist. Supabase's [Network Restrictions](https://supabase.com/docs/guides/platform/network-restrictions)
control which public IP ranges may connect; they do not change the routing
class.

Supabase's documented literal private database path is
[PrivateLink](https://supabase.com/docs/guides/platform/privatelink). Under the
stated current Pro subscription it is unavailable: it requires a Team or
Enterprise subscription, an AWS VPC in the same region as the project and a
PrivateLink/VPC-Lattice endpoint. No upgrade, purchase, AWS resource or
network setting was attempted by this action.

Consequently, a future B-03 remote proof must not be scheduled merely by
adding a secret-safe caller token. A separate product/infrastructure decision
must first provide the eligible PrivateLink/AWS-VPC path, or explicitly revise
the private-transport requirement. The latter must be a conscious runtime
decision, not an inference from this public-port preflight.

The next B-03 operation, if a runtime milestone is later selected, needs one
separately reviewed secret-safe outbound caller mechanism. It must perform
exactly one authenticated call as the existing dedicated principal over
private transport, require an unconditional transaction rollback, and finish
with an independent zero-row readback. It must not infer authority from this
containment record and must not automatically retry this closed proof.
