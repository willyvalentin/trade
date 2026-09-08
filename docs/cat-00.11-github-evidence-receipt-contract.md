# CAT-00.11 — GitHub evidence-receipt contract

## Decision

CAT-00.11 is a provider-free, local validator for a future, caller-supplied
GitHub evidence receipt. It consumes only redacted observed metadata that a
separately authorized operator could provide after CAT-00.10's five fixed
GET-only readbacks. It makes no GitHub request, reads no credential or
environment value, and retains no raw response body.

## Bounded receipt

The input must first satisfy CAT-00.10's exact plan and binds one receipt to
that plan's five paths: Ready candidate run, exact-main run, independent
sweep run, `main` branch protection, and repository rulesets. The three run
records must report the plan's expected run identifiers and immutable commit
bindings where the plan fixes one, or a well-formed observed commit identifier
for the independent sweep, plus a completed/success outcome and their fixed
event class. The
protection record can carry only four facts: that `main` is protected, the
named required check is present, and strict status checks are enabled. The
rulesets record can carry only an observed flag and a non-negative count.

Every readback must declare `GET`, HTTP 200 and `not_retained` response
bodies. The result contains only the already-planned paths and fixed receipt
metadata. A locally valid result remains
`github_evidence_receipt_locally_validated_not_independently_verified`; it is
not proof that GitHub was contacted or that a policy claim is independently
true.

Malformed, accessor-backed or faulting proxy input is converted into a
fail-closed invalid result. It cannot make an inspection failure escape into a
caller or turn into a partial receipt.

## Authority boundary

CAT-00.11 has no network, token, environment, persistence, CI-policy,
branch-protection, runtime, deployment, advisory, broker or production
authority. It cannot authorize the SEC EDGAR read or any GitHub operation.
The eventual GET-only operation still needs its own dedicated identity,
independent readback, containment/rollback evidence and CI re-hardening
review.

## Delivery condition

This source contract becomes a roadmap delivery only after a protected PR,
the unchanged Ready Full CI gate and exact-main verification. Until then it is
an unmerged local candidate and creates no operational authority.
