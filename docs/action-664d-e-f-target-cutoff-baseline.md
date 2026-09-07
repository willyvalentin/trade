# Action 664D/E/F — Target-cutoff local PostgreSQL baseline

Status: source-delivery candidate on 2026-09-07.

## Problem and decision

The disposable-local PostgreSQL checks for Actions 664D, 664E and 664F were
written when `origin/main` was commit
`f578dd5bedeccb0f95b58c4f15ba2cb3dc1eea33`. They asserted that the moving
`origin/main` ref must still equal that historical commit before they could
apply the then-new `20260726001000` migration. Once main advanced, the checks
failed before exercising their database assertions even though their intended
pre-migration baseline had not changed.

The repaired rule is explicit and reproducible: resolve the full-history
historical commit `f578dd5bedeccb0f95b58c4f15ba2cb3dc1eea33`, require that it
does not contain
`supabase/migrations/20260726001000_create_canonical_evaluation_decisions.sql`,
then apply its SQL migration tree and the target migration exactly once from
the worktree. The protected CI checkout uses `fetch-depth: 0`, so that exact
baseline is available without a network action during the test.

The historical commit remains the named immutable database-test baseline and
synthetic fixture provenance; it is no longer incorrectly claimed as the
moving `main` branch tip.

## Authority and safety boundary

This action starts a disposable local Docker PostgreSQL container only. It
does not read a Supabase project, use credentials, connect to a provider,
write staging or production data, deploy, bind a runtime, alter CI policy,
invoke a broker, or enable a writer outside the disposable test container.

## Action brief

```text
action_or_decision_id: Action 664D/E/F target-cutoff local PostgreSQL baseline
bounded_objective: Preserve isolated, runnable verification of migration 20260726001000 as main advances
milestone_or_product_outcome: Trustworthy default-off canonical-evaluation foundation verification
threat_or_delivery_risk_reduced: A stale moving-main commit assertion masks real database-contract regressions
blocked_by: Protected CI and exact-main verification of this source-only repair
unblocks: Reliable local Action 664D/E/F verification; never a shared-database or writer action
authority_boundary: Disposable local PostgreSQL only; no remote database, credential, runtime, deploy, provider, broker or production access
required_evidence: Targeted 664D matrix, 664E/664F integration tests, standard foundation suite and protected CI
focused_verification: Target migration appears once after the selected pre-target migration chain
residual_risks: The fixed historical chain is a local integration baseline, not a shared-environment schema assertion
autonomous_governance_controller: Codex autonomous governance controller
delivery_automation: Codex delivery automation
independent_machine_verification: Disposable PostgreSQL tests plus protected CI
decision_policy_version: action-664d-e-f-target-cutoff-baseline-v1
stop_go_or_closeout_trigger: Stop if the target migration is absent, enters the selected baseline, or any local contract assertion fails
rollback_or_containment: Dispose the temporary container; no shared state exists
```
