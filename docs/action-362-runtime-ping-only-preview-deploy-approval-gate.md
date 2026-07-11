# Action 362: Runtime Ping-Only Preview-Deploy Approval Gate

## Gate Status

- approval_gate_status: complete
- approval_vocabulary: approved | approved_with_conditions | blocked
- approval_decision: approved
- preview_deployment_performed: false
- preview_deployment_approved_for_later_action: true
- Netlify_runtime_trusted: false
- production_deployment_approved: false
- production_traffic_approved: false
- main_push_allowed: false
- route_expansion_approved: false
- additional_runtime_files_approved: false
- external_endpoint_contacted: false
- rollback deploy protected: 6a501645908e4100088b7396
- clean base commit: 512a0c5

`approved` means only that a later Action may perform one non-production preview deployment attempt and validate the single ping route under the frozen protocol below. It does not approve production deployment, main push, Netlify runtime trust, route expansion, another endpoint, provider/Supabase connectivity, monitoring, or diagnostic infrastructure.

## Purpose

Action 362 creates the deterministic gate for one narrowly scoped future preview deployment whose sole runtime purpose is validating `GET /api/runtime-health/ping` on a proven non-production Netlify target.

## Scope

This Action adds one static gate document, one deterministic local verifier, one static Playwright specification, and minimal Action 318-320 package-guard entries. It performs no deploy, Netlify call, external request, route change, configuration change, or environment change.

## Recovery Context

Actions 307/308 exposed a Next Runtime/API boundary failure that returned HTTP 400 with an empty response body. Production remains protected by rollback deploy `6a501645908e4100088b7396`, and the clean post-recovery base is `512a0c5`.

## Upstream Dependencies

- Action 309: Post-Recovery Safe Development Protocol
- Action 338: Runtime Ping-Only Rollout Checklist
- Action 344: Runtime Ping-Only Route Implementation Plan
- Action 350: Runtime Ping-Only Route Approval Gate
- Action 358: Runtime Ping-Only Route Implementation Readiness Review
- Action 359: Runtime Ping-Only Route Implementation Approval Gate
- Action 360: Runtime Ping-Only Route Implementation
- Action 361: Runtime Ping-Only Local Implementation Verification and Rollout Readiness Review

## Action 361 Readiness Decision

- readiness decision: `ready`
- failed conditions: none
- Netlify runtime trust: false
- preview deployment: blocked pending this separate gate
- production deployment: blocked
- main push: blocked

Action 361 authorizes only creation of this approval gate. It does not deploy anything.

## Explicit Non-Goals

Action 362 does not deploy, invoke Netlify CLI or hooks, contact Netlify APIs or hosts, create or modify a preview, access preview or production endpoints, modify the route, add runtime files, alter proxy/middleware/Netlify configuration, change deployment configuration or environment variables, add secrets, change redirects/headers, access providers/news/Supabase, persist data, execute replay, mutate scanner/recommendation/ranking/confidence/learning/Pattern Discovery behavior, create migrations/schemas, or push main.

## Approval Vocabulary

- `approved`: every deterministic gate condition passes; one later preview-only attempt may use the frozen protocol.
- `approved_with_conditions`: the attempt is isolated and safe, but a non-critical evidence or unsupported-method detail remains unresolved.
- `blocked`: the attempt needs code/config/environment changes, production targeting, main push, runtime expansion, external service access, unclear isolation, missing stop conditions, or non-trivial rollback.

## Deterministic Gate Conditions

Every required condition passes:

- Action 361 is `ready`
- the Action 360 route source remains exact and is the only new `app` runtime file
- local typegen, TypeScript, build, lint, route behavior, and upstream gates are green
- one non-production attempt can be isolated without code, config, or environment changes
- the deployed repository revision and input package can be frozen
- target classification must prove non-production before deployment begins
- validation is limited to one route and bounded methods
- exact status/body/header/repeat expectations are frozen
- authentication/proxy outcomes are observed, not remediated
- stop conditions and evidence requirements are explicit
- abandonment requires no production rollback or data cleanup
- providers, Supabase, production data, production deployment, and main push remain outside scope

## Exact Approved Deployment Type

At most one non-production Netlify preview deployment attempt is approved for a later Action. No production deploy, production alias, production promotion, branch merge, or main push is approved.

## Preview-Only Boundary

The future target must be positively classified as a Deploy Preview or other isolated non-production preview target before deployment. Ambiguous target classification is a stop condition. The attempt must not alter production traffic, aliases, domains, redirects, or functions outside the unchanged build artifact.

## Production Prohibition

Production deployment, production promotion, production alias assignment, production endpoint validation, custom-domain validation, and production traffic are forbidden.

## Main-Push Prohibition

No main push, merge to main, or requirement to place the package on main is approved. If main push becomes necessary, the attempt stops as `preview_aborted`.

## Route Scope

Runtime validation is limited to `/api/runtime-health/ping`. No provider, Supabase, environment, auth-content, scanner, recommendation, learning, Pattern Discovery, execution, user-data, or production-data endpoint may be validated.

## Code-Free Deployment Action Requirement

The later deployment Action introduces no code changes. It must use the exact Action 360 route and Action 361-verified package. A required source change creates a new blocked result and a separately approved remediation Action.

## Repository-State Requirement

Before the attempt, the later record must capture the repository revision identifier, full worktree summary, exact route source hash, and Action 360/361 verifier results. The revision and source hash must remain unchanged through evidence capture.

## Branch-State Requirement

The deployed branch/revision must be the explicitly recorded non-production source. No branch merge, branch rewrite, main update, or unrelated runtime addition is permitted during the deployment Action.

## Isolated-Diff Requirement

The deploy input may contain only the already reviewed package and separately classified unrelated files must not enter the deployment artifact unintentionally. If the exact deploy diff cannot be isolated and explained, the attempt is blocked before deployment.

## Build-Artifact Requirement

The future build must pass and contain `/api/runtime-health/ping` with no additional unreviewed route. The build artifact must correspond to the recorded revision and source evidence. Rebuilding is allowed; changing source or configuration is not.

## Deployment-Input Integrity

One repository revision, one source hash, one unchanged route, one build input, and one non-production target define the attempt. Any mismatch between recorded source, build artifact, and deployed identifier stops validation.

## Netlify Trust Status

`Netlify_runtime_trusted` remains false before and after Action 362. The later preview becomes trusted only for this route if its separate final decision is `preview_validated`; that does not establish production trust.

## Preview URL Handling

The future preview URL may be recorded only in the later validation artifact. It must not be added to route output, source code, environment variables, application configuration, logs containing secrets, or production configuration. Action 362 records no preview URL.

## Validation Request Boundary

The later Action may issue only GET, repeated GET, POST, and PUT requests to `/api/runtime-health/ping` on the single recorded non-production preview origin. It may not follow links to another origin or request any other application endpoint.

## Exact GET Validation Contract

Expected GET behavior:

- HTTP 200
- `Content-Type: application/json; charset=utf-8`
- `Cache-Control: no-store, max-age=0`
- exact frozen JSON body with no additional keys
- second GET body byte-identical, or structurally identical only when HTTP transport representation makes byte comparison unavailable

## Exact Response-Body Contract

```json
{
  "ok": true,
  "route_ping": true,
  "route_build_marker": "action_344_future_runtime_ping_only_route",
  "provider_call_executed": false,
  "provider_call_attempted": false,
  "supabase_read_executed": false,
  "supabase_write_executed": false,
  "replay_executed": false,
  "synthetic_outcomes_persisted": false,
  "scanner_behavior_changed": false,
  "live_ranking_changed": false,
  "recommendation_rows_mutated": false,
  "runtime_route_scope": "ping_only",
  "deploy_readiness_required": true
}
```

No timestamp, deployment ID, commit SHA, branch, environment, hostname, region, runtime-discovered version, uptime, provider/database status, auth content, user/session data, request metadata, or secret may appear.

## Exact Response-Header Contract

Material application headers must equal:

- `Content-Type: application/json; charset=utf-8`
- `Cache-Control: no-store, max-age=0`

Platform transport headers may be recorded but must not contain unexpected application metadata or motivate an in-place code/config change.

## Repeated-Response Validation

Two successful direct route responses must be compared. Status, material headers, key set, field values, and body must match. Any unexplained difference is `preview_failed` and stops the attempt.

## Unsupported-Method Validation

POST and PUT may be sent only to the same ping path. Expected behavior is framework-managed HTTP 405 without the frozen GET body or a custom application response. Different behavior is recorded and stops validation unless it is an already understood proxy/auth observation made before direct route access.

## Authentication and Proxy Observation Strategy

The later Action first records the unauthenticated GET result without following redirects automatically. It distinguishes direct JSON, HTTP 401, authentication redirect, proxy redirect, framework error, Netlify function error, route absence, HTTP 400 empty-body regression, HTML response, and unexpected caching.

If the unchanged application proxy requires the existing approved authentication convention and an operator-authorized preview credential is already available, validation may repeat the same path without inspecting, changing, or recording the credential. If direct route access cannot be obtained without auth/config/environment changes, validation stops as `preview_aborted`. The same Action must not modify proxy, middleware, auth, redirects, headers, secrets, environment, or Netlify configuration.

## Redirect Detection

Automatic redirect following must be disabled for the observation request. Every status and `Location` value in a redirect chain must be recorded without credentials or query secrets. An unexplained redirect, cross-origin redirect, production redirect, or redirect requiring remediation is a stop condition.

## Empty-Body Detection

The later validator records body byte length before parsing. A zero-length or unexpectedly blank GET body is an immediate `preview_failed` result and recovery-regression signal.

## HTTP 400 Regression Detection

Any HTTP 400 from the ping path, with or without a body, immediately stops validation and is labeled as the Action 307/308 recovery regression class. No retry with code/config/proxy changes is permitted.

## HTML Error-Response Detection

The response must be checked for HTML content type and HTML document markers before JSON parsing. Unexpected HTML, including platform error pages, is `preview_failed` and stops validation.

## Function and Runtime Initialization Failure Detection

The later record must capture deployment/build function status and bounded logs for route publication, invocation, initialization errors, crashes, timeouts, and empty responses. Any function/runtime initialization failure stops validation. Logs must not be used to inspect or publish secrets or arbitrary environment values.

## Deployment-Log Review Boundary

Log review is read-only and limited to build success, route publication, function initialization, the approved ping invocations, unexpected provider/Supabase initialization, and stop-condition evidence. No broad monitoring, production-log access, user-data inspection, or diagnostic infrastructure is approved.

## Provider and Supabase Prohibition

No provider/news/Supabase/database client, endpoint, health check, credential, query, or write may be invoked or inspected. Any observed initialization is a stop condition.

## Environment-Metadata Prohibition

The future validation must not enumerate, print, record, or return environment variables, secrets, deployment environment contents, host internals, region internals, or runtime process metadata. Target classification and deployment identifiers are external evidence only.

## No-Production-Data Guarantee

The ping route uses literals and accesses no data. The future validation must not request production data, user data, recommendations, positions, outcomes, learning data, or provider/database state.

## Stop Conditions

The later Action stops immediately if:

- deployment requires code, config, environment, proxy, middleware, redirect, header, secret, or Netlify changes
- the target is production, ambiguous, promoted, aliased to production, or could affect production traffic
- main push, branch merge, another route, or another runtime file becomes required
- build fails, the route is absent, another unreviewed route appears, or source/build/deploy evidence differs
- GET is non-200, HTTP 400, empty, unexpectedly HTML, redirected unexpectedly, materially mis-cached, or contract-incompatible
- repeated response differs or POST/PUT behavior is not bounded
- Netlify function initialization fails, crashes, times out, or returns an empty platform response
- provider/Supabase/shared application code initializes or any external side effect is observed
- rollback/abandonment is no longer trivial

No remediation occurs in the same Action.

## Rollback and Abandonment Strategy

Because the target is non-production and receives no production alias or traffic, failure is handled by stopping validation and abandoning or deleting the isolated preview through a separately authorized operational step. Production rollback is not required. No database, migration, environment, provider, or persisted-data cleanup is required.

The known-good production rollback deploy remains `6a501645908e4100088b7396`, but the future preview Action must not touch production.

## Evidence Capture Requirements

The later preview-validation artifact must capture:

- repository revision identifier and full worktree-state summary
- exact deployed route source hash or equivalent deterministic source evidence
- preview deployment identifier, preview URL, and non-production target classification
- deployment timestamp as external deployment evidence only
- deployment/build and function/runtime status
- GET status and response headers, including content type and cache control
- exact response body and body byte length
- repeat-response result
- POST and PUT results
- redirect chain, if any
- function/runtime errors and bounded unexpected log findings
- stop-condition result and final preview validation decision

Secrets, credentials, arbitrary environment values, user data, and production data must not be captured.

## Preview Validation Decision Vocabulary

The later Action must use exactly:

- `preview_validated`
- `preview_validated_with_conditions`
- `preview_failed`
- `preview_aborted`

Action 362 issues none of these results because no preview is deployed here.

## Acceptance Criteria

Approval requires Action 361 ready, exact route integrity, one-runtime-file scope, green local validation, enforceable one-attempt/non-production boundaries, unchanged code/config/environment, exact route validation, explicit stop conditions, trivial abandonment, no provider/Supabase/production data, sufficient evidence, and independently blocked production/main push.

## Rejection Criteria

The gate is `blocked` if preview requires code/config/environment changes, production targeting, main push, route expansion, provider/Supabase access, shared runtime initialization, unclear deployment isolation, missing stop conditions, or non-trivial rollback.

The gate is `approved_with_conditions` only if isolation is safe but a non-critical evidence or unsupported-method detail remains unresolved. No such detail is unresolved.

## Approval Decision

Decision: `approved`.

This approves only one later non-production preview deployment attempt and the frozen validation protocol. Action 362 performs no deployment.

## Passed Conditions

Passed: Action 361 readiness, exact route source, one-runtime-file boundary, green local validation, code/config/environment-free future attempt, enforceable non-production and one-attempt boundaries, exact route/status/body/header/repeat/method protocol, proxy/auth observation strategy, regression and initialization detection, stop conditions, evidence requirements, trivial abandonment, no provider/Supabase/production-data requirement, and separate production/main-push prohibitions.

## Failed Conditions

Failed conditions: none.

## Unresolved Conditions

- Netlify runtime remains untrusted
- no preview deployment or validation result exists yet
- preview identifier, URL, timestamp, logs, and host behavior are unknown until the later Action
- production deployment, production validation, and main-push approvals remain absent

These are expected future evidence items, not permission to broaden the attempt.

## Work Remaining Blocked

Production deployment/traffic/validation, main push, route expansion, additional endpoints/files, provider/news/Supabase access, environment inspection, diagnostics, monitoring, persistence, replay, and scanner/recommendation/ranking/confidence/learning/Pattern Discovery changes remain blocked.

## Next Permitted Action

The next Action may be one Runtime Ping-Only Preview Deployment and Validation Attempt. It must use the unchanged verified package, perform at most one proven non-production preview attempt, follow the frozen stop/evidence protocol, and leave production and main push blocked.
