# CAT-00.9 SEC EDGAR external-read evidence-bundle contract

## Product outcome and bounded decision

Status: `complete_on_exact_main_provider_free_contract`.

CAT-00.9 is the independently selected, non-market-hours successor to the
CAT-00.8 operator-record template. It implements only a local, fail-closed
shape for the four CI and containment claims that a later, independently
verified gate would need before it could even consider CAT-00.7's one public
SEC EDGAR request.

The contract is intentionally not an evidence reader. Each of its four claims
is retained as `claimed_complete_not_independently_verified`. It never
independently verifies a GitHub run, branch-protection state, ruleset, scheduled
sweep or manual sweep, and a locally valid result remains
`sec_edgar_external_read_evidence_bundle_locally_shaped_not_authorized_not_executed`.

## Protected delivery evidence

PR #399 merged as `ca1b27e2e40eae9c0b4707df7412239cc5f4762b` after
Ready Full CI run `34123577717` passed the unchanged six provider-free shards,
the protected aggregate and merge-candidate provenance. Exact-main run
`34127254656` then passed the provider-free aggregate and the post-merge
provenance attestation for that same commit.

This proves only delivery of CAT-00.9's local source contract. It does not
turn any fixed claim into independent CI, branch-protection or sweep evidence,
does not prove a least-privileged GitHub identity, and does not authorize an
external request.

## Accepted local shape

The input contains an already CAT-00.8-valid operator-record input and one
dense, plain-data bundle. The bundle binds its identifier to the exact
operator-record and execution-scope identifiers, repeats the mandatory
cancel-before-network containment and requires `not_performed` network activity.
It has exactly four claims:

- Ready merge candidate: unchanged six-shard suite, strict aggregate and
  merge-candidate provenance;
- exact-main: unchanged six-shard suite, strict aggregate and post-merge
  provenance;
- protected `main` readback: GET-only evidence of the required check and
  protection/ruleset binding; and
- independent regression sweep: scheduled or manual evidence that remains
  enabled and is not a substitute for candidate or exact-main evidence.

No run ID, actor identity, credential, token, response body, branch-protection
payload, deployment metadata, environment data or external URL is accepted.
Those facts must be inspected later through a separately authorized,
least-privileged evidence path; callers cannot turn a string claim into proof.

## Default-deny and authority boundary

Malformed, widened, inherited or accessor-backed inputs fail closed before their
values are read. An invalid CAT-00.8 operator record, a record/scope mismatch,
any claim other than the fixed locally-unverified value, changed containment or
network activity also fails closed.

The module reads no environment, credential, workflow, GitHub policy, deploy,
provider or SEC resource. It makes no request, persists no data, changes no CI
policy, binds no runtime or advisory behavior, deploys nothing, and cannot call
a broker or access production.

## Residual gates

CAT-00.9 is not an external-read authorization. A later independently verified
evidence binder must still collect fresh least-privileged policy readback and
specific Ready/exact-main/sweep evidence, bind those facts to one CAT-00.7 scope
and one CAT-00.8 operator record, and stop before network activity on any gap.
A separate policy-bound operator decision remains required before any public
request. That eventual request remains limited to one GET/no-redirect/
credential-omit, validate-only/no-persistence response with independent
readback and no retry.

## Action brief

```text
action_or_decision_id: CAT-00.9
bounded_objective: Define a fail-closed local shape for four future CI/readback claims
milestone_or_product_outcome: WhyMove primary evidence remains attributable, one-request and non-collecting
threat_or_delivery_risk_reduced: Prevents an incomplete or authority-escalating evidence bundle from reaching a future external-read gate
blocked_by: Fresh independently verified CI, protection and sweep evidence plus a separate policy-bound operator decision
unblocks: A future least-privileged evidence binder; never a request by itself
authority_boundary: Local-only validator; no network, provider, credential, workflow, deployment, runtime, broker or production authority
required_evidence: Focused adversarial tests and protected CI
focused_verification: CAT-00.9 Playwright contract suite and static no-I/O inspection
residual_risks: A local claim shape cannot prove a CI, GitHub or operator fact
autonomous_governance_controller: Codex autonomous governance controller
delivery_automation: Codex delivery automation
independent_machine_verification: Focused contract tests plus protected CI
decision_policy_version: cat-00.9-external-read-evidence-bundle-v1
stop_go_or_closeout_trigger: Stop with no request until independently verified evidence and a separate operator decision exist
rollback_or_containment: Cancel before any network activity on absent, failed, mismatched or unverifiable evidence
```
