# CAT-00.8 SEC EDGAR external-read operator-record contract

## Product outcome and bounded decision

CAT-00.8 implements the local, provider-free shape of the record that must be
complete before a later policy-bound operator could consider one CAT-00.7
public SEC EDGAR read. It binds one already valid execution-scope policy to a
single record that makes every CI and containment prerequisite explicit.

The contract is deliberately a template, not an evidence verifier. Each CI
item is fixed to `required_not_verified`; this module cannot inspect a workflow
run, branch protection, ruleset or sweep. A valid result remains
`sec_edgar_external_read_operator_record_validated_not_authorized_not_executed`.

## Accepted record

The input contains one CAT-00.7-valid scope and one dense, plain-data operator
record. It must repeat the exact execution-scope identifier and declare all
four future evidence items as required but not verified:

- Ready merge candidate six-shard verification;
- exact-main six-shard verification;
- fresh protected-main readback; and
- independent scheduled or manual sweep evidence.

It also fixes `cancel_before_network_on_missing_or_mismatched_evidence`,
`not_authorized_not_executed`, and `not_performed`. It accepts no request
timestamp, response body, credential, user or operator identity, environment,
branch-protection output, CI run identifier, deployment metadata or runtime
handle.

## Default-deny and authority boundary

Malformed, accessor-backed or widened input; a scope that CAT-00.7 does not
admit; a mismatched scope identifier; a claimed verified item; weakened
containment; authorization drift; or any network activity fails closed.

The module makes no HTTP request and reads no credential, environment,
workflow, ruleset, deployment or provider state. It does not change CI,
persist data, bind runtime or advisory behavior, deploy, access production or
call a broker. A later independent evidence binder and a separate
policy-bound operator decision remain required before any external request.

## Action brief

```text
action_or_decision_id: CAT-00.8
bounded_objective: Validate one fail-closed, no-authority operator-record template bound to CAT-00.7
milestone_or_product_outcome: WhyMove primary-evidence investigation remains one-request, attributable and non-collecting
threat_or_delivery_risk_reduced: A future external-read request cannot omit CI, protection-readback, sweep or rollback prerequisites
blocked_by: CI re-hardening implementation/evidence and a separate policy-bound operator decision
unblocks: An independently verified future evidence binder; never a request by itself
authority_boundary: Local-only validator; no network, provider, credential, workflow, deployment, runtime, broker or production authority
required_evidence: Focused adversarial tests and protected CI
focused_verification: CAT-00.8 Playwright contract suite and static no-executor inspection
residual_risks: The template cannot prove any external CI, GitHub or operator fact
autonomous_governance_controller: Codex autonomous governance controller
delivery_automation: Codex delivery automation
independent_machine_verification: Focused contract tests plus protected CI
decision_policy_version: cat-00.8-external-read-operator-record-v1
stop_go_or_closeout_trigger: Stop with no request until independently verified evidence and a separately bounded operator decision exist
rollback_or_containment: Cancel before any network activity on absent, failed, mismatched or unverifiable evidence
```
