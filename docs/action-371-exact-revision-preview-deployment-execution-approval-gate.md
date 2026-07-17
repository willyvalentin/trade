# Action 371: Exact-Revision Preview Deployment Execution Approval Gate

## Gate Status

- approval_vocabulary: approved | approved_with_conditions | blocked
- approval_decision: approved
- exact_candidate_sha: b0bb5c4686d9cab3b682b3b06fadee4cf73cab07
- exact_baseline_sha: 51aced66782ec9a37cd358238f02b6f5c0ae97bd
- exact_route_sha256: 98c7de74c94364eed9a447469ef367f1f454b42ae17d3911b3ebfad6ed5213bb
- exact_manifest_sha256: b7ac9ddaf40cc516bcdbdc7208dc6669f6b34a18a1810c0bde72209b25710892
- unresolved_blocker_count: 0
- preview_deployment_performed: false
- preview_attempt_consumed: false
- external_endpoint_contacted: false
- production_deployment_approved: false
- main_push_allowed: false

`approved` authorizes only a later, separately executed, single non-production preview attempt after every immediate pre-deploy condition in this document passes. It does not authorize a deploy in Action 371, a source substitution, remediation, retry, production operation, push, or merge.

## Purpose

Bind the one Action 362 preview attempt to the exact immutable Action 370 revision and freeze the execution, validation, evidence, consumption, and stop boundaries for a future Action.

## Scope

This is a static, local-only approval package. It adds documentation, a deterministic verifier, focused tests, and minimal Actions 318-320 package-guard recognition. It does not modify the candidate, route, manifest, deployment configuration, environment, or runtime behavior.

## Recovery Context

Production remains protected by rollback deploy `6a501645908e4100088b7396`. The post-recovery process prohibits mutable-source deployments and in-place runtime remediation. The failed Action 365 candidate remains evidence only and permanently non-deployable.

## Upstream Dependencies

This gate builds directly on Action 309, Actions 318-320, Action 338, Action 344, Action 350, and Actions 358-370.

## Action 362 Approval

Action 362 remains `approved` for one narrowly scoped non-production preview attempt. Action 371 binds that unused attempt to one exact immutable revision. It does not broaden the route, target, validation, or retry scope.

## Action 370 Prepared Result

Action 370 is `prepared`. Its external binding proves a clean immutable revision, exact parent, passing pre-freeze and post-freeze validation, exact dependency and package integrity, one introduced runtime route, zero unresolved blockers, and no push or deployment.

## Exact Candidate SHA

The only approved deployment source is `b0bb5c4686d9cab3b682b3b06fadee4cf73cab07`.

## Exact Baseline SHA

The candidate parent must remain exactly `51aced66782ec9a37cd358238f02b6f5c0ae97bd`.

## Exact Route SHA

`app/api/runtime-health/ping/route.ts` must remain SHA-256 `98c7de74c94364eed9a447469ef367f1f454b42ae17d3911b3ebfad6ed5213bb`.

## Exact Manifest SHA

`docs/action-370-preview-deployment-input-manifest.json` must remain SHA-256 `b7ac9ddaf40cc516bcdbdc7208dc6669f6b34a18a1810c0bde72209b25710892`.

## Exact Binding-Evidence Contract

The external binding must identify the candidate, parent/baseline, failed candidate, route hash, manifest hash, package hashes, dependency digest, clean frozen tree, completed post-freeze validation, preserved Action 362 approval, unconsumed preview attempt, and false push/deployment/external-contact flags. The repository copy and external binding copy must be byte-identical. Any mismatch blocks execution.

## Failed Action 365 Candidate Preservation

`8cfe239dc122d85770bfc86586f00716695915d1` must remain clean, unamended, separate, and permanently non-deployable. It is never a source or fallback for this attempt.

## Candidate Clean-State Requirement

Immediately before deployment, `git status --porcelain=v1 --untracked-files=all` in the candidate must be empty. This proves no tracked drift and no untracked deploy input. A dirty state blocks execution.

## Candidate Immutable-State Requirement

The candidate HEAD, parent, tree, route hash, manifest hash, binding, included/excluded classifications, and inventories must equal the frozen evidence. The candidate must not be modified before or during execution.

## No-Amendment Requirement

The candidate commit must not be amended, rebased, rewritten, reset, reverted, cherry-picked, or recreated. Even content-equivalent history is not the approved object.

## No-Substitution Requirement

The current shared-worktree HEAD, a later commit, a branch tip without exact SHA verification, a dirty checkout, a rebuilt candidate, a cherry-picked equivalent, and an archive not cryptographically bound to the candidate are forbidden substitutes.

## Exact Deployment-Source Requirement

The future Action must verify the full candidate SHA immediately before external execution and must deploy that exact source. Branch names are informational only. If infrastructure cannot accept the exact revision without source or configuration changes, execution stops before initiation.

## Source Binding Inventory

The immediate preflight must verify:

- candidate and parent SHAs
- clean tracked and untracked state
- route and manifest SHA-256 values
- byte-identical revision-binding evidence
- one introduced runtime route: `app/api/runtime-health/ping/route.ts`
- zero additional introduced runtime routes
- zero migration and schema changes
- zero proxy, middleware, and Netlify configuration changes
- zero environment files
- zero provider or Supabase changes
- 53 approved preview-input files
- 2,343 approved baseline-dependency files
- 13 excluded concurrent files
- zero unresolved blockers

Any mismatch blocks execution.

## Non-Production Target Requirement

Before deployment initiation, the target must be independently and positively classified as an isolated non-production preview. An ambiguous target, production target, production alias, custom production domain, or target capable of changing production traffic blocks execution. Target classification is pre-deploy evidence, not route metadata.

## One-Attempt Boundary

Only one preview deployment operation may be initiated. No automatic retry, second target, second revision, promotion, alias attachment, or fallback source is approved.

## Code-Free Execution Requirement

The future execution Action may not edit, generate, stage, commit, amend, or substitute source. A required code change blocks the attempt and requires a new gate.

## Configuration-Free Execution Requirement

No proxy, middleware, Netlify, redirect, header, build, package, lockfile, or deployment configuration may change. Infrastructure requesting a change is a stop condition.

## Environment-Free Execution Requirement

No environment variable, secret, context value, provider credential, database credential, or environment file may be added, changed, printed, or enumerated. Existing environment behavior is observed only through the approved route contract.

## Frozen JSON Body

The exact GET response body is:

```json
{"ok":true,"route_ping":true,"route_build_marker":"action_344_future_runtime_ping_only_route","provider_call_executed":false,"provider_call_attempted":false,"supabase_read_executed":false,"supabase_write_executed":false,"replay_executed":false,"synthetic_outcomes_persisted":false,"scanner_behavior_changed":false,"live_ranking_changed":false,"recommendation_rows_mutated":false,"runtime_route_scope":"ping_only","deploy_readiness_required":true}
```

No additional key, deployment identifier, preview URL, revision, hostname, environment value, timestamp, runtime metadata, or secret may appear.

## Route-Only Validation Requirement

Validation is limited to `GET /api/runtime-health/ping`, one repeated GET, POST, and PUT on that same path and one recorded preview origin. No other application, production, provider, Supabase, data, auth-content, recommendation, execution, or diagnostic endpoint may be requested.

## Exact Preview Validation Contract

The future Action may perform only direct GET, repeated GET, POST, and PUT requests to the approved path with automatic redirect following disabled.

GET must return:

- HTTP 200
- `Content-Type: application/json; charset=utf-8`
- `Cache-Control: no-store, max-age=0`
- the exact frozen JSON bytes and key set
- an identical repeated response
- no redirect
- a non-empty, non-HTML body
- no HTTP 400 recovery regression

POST and PUT must return framework-managed HTTP 405 and must not return the frozen GET body or a custom application response. Material headers, body length, content classification, and redirect chain must be recorded.

## Stop Conditions

Execution stops before initiation or validation stops immediately if:

- candidate, parent, route, manifest, binding, clean state, classification counts, or inventories differ
- source substitution or an untracked deploy input is possible
- the target cannot be proven non-production
- production alias or traffic risk exists
- code, config, environment, push, merge, or another revision is required
- build output differs from the frozen source or another runtime route appears
- Netlify requests source, configuration, or environment remediation
- function publication or initialization fails
- GET is non-200, HTTP 400, empty, HTML, unexpectedly redirected, mis-cached, or body/header incompatible
- repeated GET differs or POST/PUT is not framework-managed 405
- provider or Supabase initialization occurs
- any external side effect is observed

No remediation or retry is allowed in the same execution Action.

## Deployment Evidence Requirements

The future Action must record, without adding metadata to the route response:

- exact candidate, baseline, route, and manifest hashes
- pre-deploy clean-tree and exact-source results
- non-production target classification
- one deployment ID and one preview URL
- external deployment start and end timestamps
- build and function initialization status
- GET status, response headers, exact body, and repeated GET comparison
- POST and PUT results
- redirect chain, empty-body, HTML-response, and HTTP 400 regression results
- bounded unexpected logs and provider/Supabase initialization evidence
- every stop-condition result
- attempt-consumed status
- final preview validation decision

Secrets, environment dumps, production data, user data, and arbitrary logs are forbidden evidence.

## Preview-Attempt Consumption Semantics

The Action 362 attempt is consumed only when a preview deployment operation is actually initiated against Netlify or equivalent separately approved preview infrastructure.

It is not consumed by Action 371, static verification, local inspection, command preparation, target classification, or a blocked preflight before external initiation. At initiation it becomes consumed regardless of deployment or validation success. No automatic second attempt is approved; failure requires a new gate.

## Production Prohibition

Production deployment, promotion, aliasing, custom-domain validation, endpoint access, logs, data, traffic, rollback, and configuration are outside this approval and remain blocked.

## Main-Push Prohibition

Push, merge, main update, branch rewrite, or any requirement to place the candidate on main remains blocked.

## Approval Vocabulary

- `approved`: every deterministic static condition passes and one later execution may proceed only after the exact immediate preflight and non-production classification pass.
- `approved_with_conditions`: the candidate is exact but one non-critical external evidence field must be captured during execution.
- `blocked`: drift, substitution, unclear isolation, production risk, required mutation, missing safety contract, or another unresolved blocker exists.

## Deterministic Gate Conditions

Approval requires Action 370 `prepared`; exact candidate and parent; clean immutable tree; exact route, manifest, and binding; zero blockers; exact runtime/config/environment/migration inventories; preserved Action 362 approval; unconsumed attempt; exact endpoint contract; explicit stop and evidence contracts; and blocked production and main operations.

## Passed Conditions

All deterministic local conditions pass. Candidate, parent, route, manifest, binding, inventories, ownership counts, Action 362 state, and zero-blocker state are exact. No deployment, push, endpoint request, or attempt consumption occurred.

## Failed Conditions

None.

## Unresolved Conditions

None in the static gate. The future Action must still capture its inherently external deployment identifier, preview URL, timestamps, target classification, build/function status, and bounded route-validation evidence after it independently re-passes the immediate preflight.

## Approval Decision

`approved` for one future non-production preview deployment execution using only `b0bb5c4686d9cab3b682b3b06fadee4cf73cab07`, subject to every frozen pre-initiation, execution, validation, evidence, and stop condition above.

## Next Permitted Action

A separate Action may execute one exact-revision, non-production preview attempt, capture the required evidence, validate only `/api/runtime-health/ping`, and stop. It may not remediate, retry, push, merge, promote, or touch production.
