# CAT-00.10 — GitHub evidence read-plan contract

## Decision

CAT-00.10 is a provider-free source contract. It shapes the exact, future
GitHub evidence readback needed before a separately authorized SEC EDGAR
request could be considered. It does not authenticate, execute a request,
read a response, change GitHub policy, or confer any operational authority.

## Bounded plan

The sole accepted repository is `willyvalentin/trade`; the only branch is
`main`; and the only required check is `provider-free-verification`. A later
dedicated fine-grained identity must have precisely `Actions: read`,
`Administration: read`, and `Metadata: read`. Its value must be injected for a
one-shot operation and never returned or persisted by the contract.

The planned requests are GET-only shapes for three named workflow runs, main
branch protection, and repository rulesets. Responses, if a future separately
authorized operation occurs, may be redacted and bound as observed metadata
only. They are not read by CAT-00.10.

## Fail-closed boundary

The CAT-00.9 bundle has to validate locally first. Any mismatch in the
repository, branch, required check, evidence binding, run identifier, commit
SHA, identity permissions, containment, or network state rejects the plan.
No environment read, credential use, GitHub request, CI change, persistence,
runtime binding, deployment, advisory action, broker action, or production
access is authorized.

## Future decision point

A real GET-only read remains a new, separately authorized operation. It needs
a dedicated least-privileged identity, an exact candidate/evidence binding,
an independent policy decision, and an audit-safe receipt design before any
network activity. CAT-00.10 neither supplies nor proves those prerequisites.

## Delivery evidence

PR #401 delivered this provider-free source contract as merge commit
`b359c6917fa74d87b64deb7e5cfc25f1bd6ea121`. Ready Full CI run `34132001317`
passed the unchanged six-shard suite and protected aggregate. Exact-main run
`34134611027` passed the provider-free aggregate and post-merge candidate
provenance attestation. Its matrix shards are intentionally skipped on this
post-merge development profile; that result is not a second six-shard run.
