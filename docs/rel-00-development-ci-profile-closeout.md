# REL-00 — development CI profile closeout decision

## Decision

On 2026-09-04, the product owner selected development throughput and CI-cost
control over completing REL-00 CI-B8's observation of the former
Ready-plus-exact-main model. CI-B8 is therefore
`superseded_by_development_ci_profile_decision`.

This is a deliberate stop decision, not a successful keep/adjust/rollback
result. The 14-calendar-day and 10-eligible-plain-documentation-PR thresholds
were not completed and must not be reported as completed later. CI-B0 through
CI-B7, and every partial CI-B8 observation already recorded, remain preserved
as historical evidence for the model they actually observed.

## Scope and rationale

The selected development profile is appropriate only while the product remains
under active development with no external users and no admitted runtime,
provider, broker, deployment or production authority. It seeks to retain a
protected Full Ready verification gate while avoiding unnecessary duplicate
merge-path work and retaining independent regression coverage.

This decision does not alter a workflow, branch protection, Netlify, runtime,
provider, broker, deployment, secret or production setting. The executable
workflow on protected `main` remains the sole authority for present CI behavior.
Any CI implementation change must be proposed, locally verified and accepted
through its own protected PR; this decision neither approves nor merges one.

## Release re-hardening trigger

Before any external release, external user access, provider or broker use,
deployment authority or production operation, a separately authorized CI
re-hardening review is required. That review must decide the exact merge and
post-merge verification topology, required-check binding, independent-regression
cadence, failure/rollback handling and release evidence appropriate to the
chosen scope.

No elapsed time, scheduled CI result, attestation, documentation update or
Notion status can satisfy that trigger or create external authority.

## Outcome

REL-00 no longer blocks the next product decision in the master roadmap. Its
historical evidence remains available for future CI design work, while the
current roadmap may proceed without waiting for the former observation window.
