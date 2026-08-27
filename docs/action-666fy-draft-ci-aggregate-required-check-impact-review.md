# Action 666FY — Draft CI aggregate required-check impact review

## Bounded objective

Review whether the known Draft-only failure of the `provider-free-verification`
aggregate can safely be changed without weakening the Ready Full CI or
exact-main Full CI gate. This action is a decision record and delivery-policy
clarification only. It does not alter the workflow, GitHub branch protection,
Netlify, the merge-candidate POC or any runtime boundary.

## Action brief

| Field | Record |
| --- | --- |
| `action_or_decision_id` | `ACTION_666FY` / `DRAFT_AGGREGATE_REQUIRED_CHECK_IMPACT_REVIEW_666FY` |
| `bounded_objective` | Determine whether a Draft-specific aggregate outcome can coexist safely with the existing strict `provider-free-verification` required check. |
| `milestone_or_product_outcome` | Reliable low-cost Draft feedback that agents can interpret correctly, while a successful Full CI remains mandatory for every merge candidate and exact `main`. |
| `threat_or_delivery_risk_reduced` | RG-03: avoid treating a known skipped-matrix aggregate failure as a test failure and avoid costly, unnecessary reruns. |
| `blocked_by` | GitHub branch protection requires the event-agnostic `provider-free-verification` context with `strict: true`; the current workflow publishes that same context for both Draft and Ready events. |
| `unblocks` | Return to separately prioritized roadmap work with an explicit agent rule: classify this exact Draft result before any rerun. It does not unblock a CI-gate change. |
| `authority_boundary` | Read-only GitHub/repository evidence, documentation, ledger and focused contract coverage only. No workflow, required-check, branch-protection, Netlify, provider, secret, database, transport, writer, route/UI, deployment or production action. |
| `required_evidence` | Protected main `67dde40e`, workflow source, GitHub main-protection response, PR #205 and #207 Draft/Ready runs, and PR #207 exact-main provenance. |
| `focused_verification` | Action 666FY contract, CI-plan parity, and the Draft-selection contract. |
| `residual_risks` | The Draft aggregate remains red by design. A future redesign must prove a distinct Full-CI-only required context and its real GitHub behavior before any change. |
| `autonomous_governance_controller` | Codex autonomous governance controller, evaluated under the current protected-main closeout policy. |
| `delivery_automation` | Codex delivery automation. |
| `independent_machine_verification` | GitHub branch-protection API response, exact run/job status, workflow source and the saved post-merge provenance artifact. |
| `decision_policy_version` | Current protected-main autonomous closeout policy. |
| `stop_go_or_closeout_trigger` | Stop and retain the current model unless a proposal proves that no successful Draft status can satisfy the Full-CI required context. |
| `rollback_or_containment` | No CI configuration changed. Retain the unchanged workflow and branch protection if future evidence is incomplete or ambiguous. |

## Required-check impact evidence

The review inspected protected main `67dde40e21f668a22e87c41d215213077f960ff1`
(tree `3984d4e39dcd4aea87b26956772e3d261a8abe41`). GitHub's main branch
protection reports `strict: true` and exactly one required check:
`provider-free-verification` from GitHub Actions app `15368`. Administrators
are enforced, forced updates and deletions are disabled, and conversation
resolution remains required.

The workflow source confirms the required context is produced by a job named
`provider-free-verification` with `if: ${{ always() }}` and a dependency on the
six-shard Full CI matrix. The matrix is deliberately skipped for a Draft PR;
therefore the aggregate correctly fails when its sole prerequisite is skipped.
On a Ready PR, the same named aggregate follows the six shards and succeeds.
GitHub branch protection evaluates the required context name, not an
event-specific identity such as "Draft" or "Ready".

| Evidence | What it proves |
| --- | --- |
| PR #205 Draft run `33056752966` | Fast Draft verification succeeded; Full matrix was skipped; the ordinary required-context aggregate failed without a test, infrastructure or Netlify failure. |
| PR #205 Ready run `33057037823` | The unchanged six Full CI shards, the same aggregate and candidate-provenance POC all succeeded. |
| PR #207 Draft run `33064576387` | The same Draft semantics reproduced after the autonomous-governance rebase: fast check succeeded and the aggregate failed because the matrix was skipped. |
| PR #207 Ready run `33065072028` | The six Full CI shards, the same aggregate and candidate POC succeeded on the merge candidate. |
| PR #207 exact-main run `33067498119` | The six Full CI shards, aggregate and post-merge POC succeeded on `67dde40e`; the candidate and main trees both equal `3984d4e39dcd4aea87b26956772e3d261a8abe41`. |

## Decision

`DRAFT_AGGREGATE_REQUIRED_CHECK_IMPACT_REVIEW_666FY` decides
`retain_current_required_check_binding_and_draft_failure_semantics`.

Marking the aggregate successful for Draft events would publish a successful
status with the *same required context name* without running the six-shard
Full CI. The required context would then no longer by itself prove that its
success represents a Full CI result. The current review has no separately
verified GitHub configuration that can require a Ready-only context while
excluding a Draft success with the same name. That is an unacceptable
ambiguity, so no workflow, required-check or branch-protection change is
authorized.

The low-cost delivery improvement is procedural and fail-closed: when an
active Draft PR has a successful `draft-provider-free-verification`, a skipped
Full matrix and a failed `provider-free-verification` aggregate, delivery
automation must record `expected_workflow_semantic_mismatch` and must not
rerun Full CI. A real Draft-fast-check failure, a non-skipped matrix, an
unknown status shape, or any provenance uncertainty remains a failure to
investigate. Moving to Ready always starts the unchanged six-shard Full CI;
merging still requires its successful aggregate and exact-main Full CI remains
mandatory after merge.

No Full CI is deduplicated, no required check is removed or renamed, and no
production or runtime authority is admitted. The metadata-receipt/witness
workstream remains `closed_static_workstream`; protected secret management,
least-privileged identity, private transport, writer invocation and route/UI
binding remain blocked.

## Next separate outcome

The CI semantic issue is closed as a non-change decision. The next action must
select a separately prioritized product outcome under the autonomous policy;
it must not reopen the closed static workstream or make a CI change merely to
silence the Draft aggregate.
