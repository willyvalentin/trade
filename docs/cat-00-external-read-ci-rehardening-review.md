# CAT-00 — external-read CI re-hardening review

## Status and bounded decision

Status: `source_only_rehardening_review_complete_not_activated`.

This is the separately selected review required before a future CAT-00 public
SEC EDGAR read could be considered. It decides the evidence shape that a later
operator decision must require. It does not change a workflow, required check,
branch protection, Netlify setting, runtime, provider, deployment, broker or
production system, and it does not authorize or perform an external request.

The review is deliberately narrower than a release approval. Its only product
scope is one future CAT-00.7-valid, public, one-request,
validate-only/no-persistence SEC read. A broader source, a retry, collection,
runtime binding or advisory use needs a new review.

## Current evidence and gap

The [REL-00 development CI profile](./rel-00-development-ci-profile-closeout.md)
is intentional while Ture has no admitted external, provider, broker,
deployment or production authority. Its protected Ready merge candidate runs
the unchanged six provider-free shards, strict
`provider-free-verification` aggregate and merge-candidate provenance proof.
For ordinary merged changes, the current workflow instead uses a cheap
exact-main aggregate and post-merge provenance attestation; the second main
matrix is intentionally skipped. Weekday scheduled and manual full sweeps
remain independent regression evidence.

That topology is not sufficient evidence for the future CAT-00 request by
itself. CAT-00.7 requires CI re-hardening before external authority, and
repository-source workflow inspection cannot prove present GitHub branch
protection or required-check state. The historical CI-B4/CI-B7 material is
useful design evidence, but it is not a fresh policy readback.

## Decision for a future one-request operator record

Before an operator record can authorize the future request, it must name and
bind all of the following evidence to the exact external-scope change:

1. a protected Ready merge candidate that passes the unchanged six
   provider-free shards, strict aggregate, and merge-candidate provenance;
2. a separately verified exact-main run of that same unchanged six-shard
   matrix, strict aggregate, and post-merge candidate-provenance attestation;
3. a fresh least-privileged, GET-only readback that proves the protected
   `main` branch, required `provider-free-verification` check and relevant
   ruleset/branch-protection binding did not drift;
4. independent-regression evidence showing that the scheduled/manual sweep is
   still enabled and does not substitute for either exact candidate or
   exact-main evidence; and
5. a fail-closed rollback record: any missing, failed, mismatched or
   unverifiable item cancels the request before network activity. Any future
   CI-policy change is reverted only through its own protected PR and cannot
   be repaired by retrying the external request.

The exact-main matrix requirement is a future release-scope decision only. It
does not alter the selected development profile now, authorize CI
deduplication, or permit a workflow implementation change without a separate,
locally verified protected PR.

## Residual gates

This review does not complete the future external-read gate. A later bounded
operator decision must still bind one CAT-00.6 pre-read authorization to one
CAT-00.7 execution scope, select a viable executor, preserve the one-request
budget and no-retry containment, and independently read back the result. The
eventual response remains subject to CAT-00.2 through CAT-00.5 validation.

No test, CI result, GitHub policy readback, documentation update or Notion
status can substitute for that separate operator decision or make a request.

## Action brief

```text
action_or_decision_id: CAT-00-external-read-ci-rehardening-review
bounded_objective: Define exact CI evidence required before a future one-request CAT-00 SEC read
decision: source_only_rehardening_review_complete_not_activated
current_authority: no external request, CI mutation, deployment, provider, runtime, broker or production authority
future_required_evidence: Ready six-shard candidate, exact-main six-shard run, fresh GET-only protection readback, independent sweep, fail-closed rollback record
containment: missing or ambiguous evidence cancels before network activity; no request retry
next_gate: separately authorized CAT-00 operator record and independently verified re-hardening implementation/evidence
```
