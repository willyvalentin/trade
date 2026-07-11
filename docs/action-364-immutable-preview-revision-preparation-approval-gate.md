# Action 364: Immutable Preview Revision Preparation Approval Gate

## Gate Status

- approval_vocabulary: approved | approved_with_conditions | blocked
- approval_decision: approved_with_conditions
- selected_strategy: B_clean_isolated_reviewed_revision
- repository_operation_performed: false
- immutable_revision_created: false
- deployment_performed: false
- external_endpoint_contacted: false
- action_362_approval_preserved: true
- preview_attempt_consumed: false
- production_deployment_approved: false
- main_push_allowed: false

`approved_with_conditions` permits only a later, separately reviewed repository-isolation and immutable-revision preparation Action. Exact repository-operation details and its complete file manifest require final review before that Action may begin. It does not approve a preview deployment or any production operation.

## Purpose

This static gate selects the safest conceptual method for producing one immutable, reviewed revision containing the approved runtime-ping package without silently including concurrent unrelated work.

## Scope

Action 364 compares isolation strategies, selects a future preparation boundary, defines ownership and manifest contracts, and records deterministic approval conditions. It adds documentation, a read-only verifier, a focused static test, and minimal package-guard entries only.

## Recovery Context

Production remains protected by rollback deploy `6a501645908e4100088b7396`; the recovery clean base is `512a0c5`. The current shared worktree is not a preview deployment input.

## Authoritative Dependencies

- Action 309: Post-Recovery Safe Development Protocol
- Action 318: Static Replay Batch Commit Readiness Checklist
- Action 319: Static Replay Batch Post-Commit Verification
- Action 320: Static Replay Branch Package Manifest
- Action 338: Runtime Ping-Only Rollout Checklist
- Action 344: Runtime Ping-Only Route Implementation Plan
- Action 350: Runtime Ping-Only Route Approval Gate
- Actions 358-364: runtime-ping readiness, approval, implementation, verification, preview gate, preflight, and preparation gate
- golden/static replay safety verification chain

## Action 362 Approval Status

Action 362 remains `approved` for at most one later non-production preview attempt validating only `GET /api/runtime-health/ping`. Action 364 neither revokes nor consumes that approval.

## Action 363 Blocked Status

Action 363 returned `blocked`, with `current_deploy_eligibility: false`. Route integrity and current local validation were green, but no clean reviewed immutable revision or frozen deployment-input manifest existed.

## Preview-Attempt Consumption Status

`preview_attempt_consumed: false`. Repository planning, isolation, validation, and freeze do not consume the attempt. It remains unconsumed until a later separately authorized preview deployment actually starts.

## Exact Route Path

The only approved runtime path is `GET /api/runtime-health/ping`.

## Exact Route File Path

The only approved runtime file is `app/api/runtime-health/ping/route.ts`.

## Exact Route SHA-256

The frozen route SHA-256 is:

```text
98c7de74c94364eed9a447469ef367f1f454b42ae17d3911b3ebfad6ed5213bb
```

Any mismatch blocks preparation and requires a separately approved route-change review.

## Current Validation Status

Current local evidence is green for `npx next typegen`, `npx tsc --noEmit`, `npm run build`, `npm run lint`, focused runtime-ping tests, and the applicable safety/package verifiers. This evidence predates a future freeze and cannot serve as final deployment evidence.

## Current Mutable-Worktree Risk

The worktree contains the approved ping chain plus concurrent untracked and modified intelligence and post-trade artifacts. Its contents changed during Actions 362-363. A technically passing build does not make this mutable worktree deployable.

## Unrelated Concurrent-Work Classification

Concurrent post-trade artifacts are unrelated to the ping chain but potentially TypeScript-visible and deploy-includable. They must be classified `unrelated_excluded` or `unresolved_blocker`; they must not be silently included, ignored, or treated as harmless.

## Explicit Non-Goals

No application/route/post-trade edit, repository operation, cleanup, branch or revision creation, commit, integration, push, deployment, Netlify access, endpoint access, configuration/environment change, provider/news/Supabase access, persistence, replay, or product behavior change occurs.

## Repository-Isolation Options Considered

### Option A: Wait For Current Worktree Stabilization

Wait for the independent post-trade workstream to finish, then review the combined tree. This preserves work but delays isolation and risks a broad, difficult-to-review deployment package.

### Option B: Clean Isolated Reviewed Revision

Prepare one isolated revision from an explicitly approved baseline containing only the reviewed runtime-ping chain and required static safety dependencies. Every file receives an ownership classification and the complete tree is validated after freeze.

### Option C: Later Integration Revision

Wait until all concurrent packages are complete, then create a separately reviewed integration revision. This can be valid later but is unnecessarily broad for a one-route preview and couples unrelated timelines.

### Option D: Current Mutable-Worktree Deployment

Deploy directly from the current mutable worktree. Rejected: the tree is not immutable, concurrent artifacts are not reviewed preview inputs, and validation identity can drift.

### Option E: Ignore Or Exclude Visible Errors/Files

Ignore, suppress, or exclude TypeScript-visible unrelated files without resolving ownership. Rejected: exclusion shortcuts weaken repository integrity and can make validation differ from deployment input.

## Option Risk Comparison

| Option | Integrity | Reviewability | Reversibility | Unrelated inclusion risk | Decision |
| --- | --- | --- | --- | --- | --- |
| A | medium after stabilization | low-medium | medium | medium-high | deferred/rejected for immediate preparation |
| B | high | high | high | low when manifest is exact | selected |
| C | potentially high later | medium-low | medium | medium | deferred/rejected for this one-route attempt |
| D | low | low | low | high | rejected |
| E | low | misleading | low | unresolved | rejected |

## Selected Future Preparation Method

Select Option B: prepare a clean isolated reviewed revision containing only explicitly approved runtime-ping and required safety packages. The future Action may establish one isolated repository context from an approved baseline, materialize only its reviewed allowlisted files, validate the complete frozen tree, record one immutable revision, and stop.

This conceptual boundary is approved with conditions. The exact repository operations, baseline identity, file-by-file manifest, recoverability evidence, and operator authorization require final review in the later Action. No operation is performed here.

## Rejected Preparation Methods

Options D and E are categorically rejected. Options A and C are rejected for the immediate one-route preparation because they unnecessarily couple unrelated work; either would require a new review if later reconsidered. Broad or unclear repository operations are not approved.

## Approved Future File Scope

The future revision may include only explicitly reviewed artifacts:

- Runtime ping chain: Actions 344, 350, 358, 359, 360, 361, 362, 363, and 364 documents, verifiers, and focused tests.
- Runtime implementation: `app/api/runtime-health/ping/route.ts` only.
- Required safety infrastructure: Action 309 safety guard, Actions 318-320 package guards, Action 338 rollout artifacts, and golden/static safety artifacts required by the verification chain.
- Baseline dependencies: previously reviewed static intelligence packages only when already part of the selected baseline and classified file by file.

Concurrent post-trade artifacts are not approved preview inputs and cannot be silently included.

## Ownership Classification Requirements

Every included, changed, or excluded candidate file must use exactly one classification:

- `approved_preview_input`
- `approved_baseline_dependency`
- `unrelated_excluded`
- `unresolved_blocker`

No deploy-input file may remain `unresolved_blocker`. Classification describes ownership; it is not a waiver of validation or review.

## Required Deployment-Input Manifest

The later preparation Action must produce a deterministic manifest containing:

- immutable revision identifier and parent/base revision
- branch or isolated-context identifier, if applicable
- route source SHA-256
- every changed tracked file
- every included untracked file before freeze
- ownership classification for every considered file
- expected runtime route inventory
- expected migration inventory
- expected proxy, middleware, Netlify, and other configuration inventory
- expected environment-file inventory without environment values
- expected provider/Supabase touch inventory
- validation command results
- validation timestamps as external evidence only
- final freeze timestamp as repository-process evidence
- manifest SHA-256 or equivalent integrity evidence

Action 364 creates no deployment-input manifest; this is its required future schema.

## Required Revision Identifier

The frozen revision must have one unique recorded identifier. A worktree state, branch name, build ID, or timestamp alone is not an immutable revision identifier.

## Required Source Hashes

The manifest must include the route SHA-256 and deterministic hashes for all included Action 309, 318-320, 338, 344, 350, 358-364, golden/static safety, build configuration, lockfile, and deployment-relevant source artifacts.

## Required Worktree-State Evidence

Record branch/context identity, revision identifier, clean status, staged/modified/untracked counts, and proof that the validated tree equals the frozen tree. Do not record secrets or environment values.

## Required Tracked/Untracked File Inventory

Record every changed tracked file and every untracked file considered before freeze. Each must map to one ownership classification and an inclusion/exclusion decision.

## Required Diff Inventory

Record a complete path-level and content-hash diff from the selected parent/base revision. Unexpected additions, deletions, renames, mode changes, generated runtime files, or configuration changes block freeze.

## Required Artifact Ownership Classification

The manifest must demonstrate that all deploy inputs are `approved_preview_input` or `approved_baseline_dependency`; excluded files are `unrelated_excluded`; and no `unresolved_blocker` enters the tree.

## Required Validation Evidence

After freeze, record command status and bounded output for typegen, typecheck, build, lint, guards, golden verification, focused tests, route hash, route inventory, migration inventory, and configuration integrity. Pre-freeze results are contextual only.

## Immutable-Revision Definition

A revision is immutable and preview-eligible only when it has a unique identifier, exact recorded tree, exact route hash, one runtime route, fully classified files, no unresolved inputs, no mutable untracked deploy inputs, no post-validation changes, full post-freeze validation, and identity with the later deployment input.

## Revision-Freeze Point

Freeze occurs only after the allowlisted tree and ownership manifest are complete and before final validation begins. The revision identifier, file tree, route hash, and manifest hash are recorded together at that point.

## Post-Freeze Mutation Prohibition

No source, generated deploy input, configuration, dependency lock, manifest classification, or revision identity may change after freeze. Any change invalidates evidence, preserves the unconsumed preview attempt, and requires a new freeze and full validation.

## Validation-After-Freeze Requirement

Final evidence must be generated after freeze against the exact frozen revision:

- `git diff --check` or equivalent clean-tree integrity evidence
- `npx next typegen`
- `npx tsc --noEmit`
- `npm run build`
- `npm run lint`
- Action 309 guard
- golden/static safety verifier
- Actions 338, 344, 350, and 358-364 verifiers
- Actions 318-320 package guards
- focused runtime-ping tests
- exact route source-hash verification
- runtime route inventory
- migration inventory
- proxy/middleware/Netlify configuration integrity
- confirmation of no external endpoint access and no deployment

Validation performed before freeze is not final deployment evidence.

## Route-Integrity Requirement

The route file must remain byte-identical with SHA-256 `98c7de74c94364eed9a447469ef367f1f454b42ae17d3911b3ebfad6ed5213bb` throughout preparation, freeze, validation, and the later attempt.

## One-Runtime-Route Requirement

The prepared diff may contain exactly one runtime route file: `app/api/runtime-health/ping/route.ts`. No second API/page/runtime route or generated replacement is permitted.

## Action 362 One-Attempt Preservation

The one attempt remains unconsumed through planning, preparation, freeze, and local validation. Failed preparation or abandoned revision does not consume it. Only the later authorized preview deployment start may consume it.

## Production Prohibition

Production deployment, production alias/promotion, production traffic, and production endpoint validation remain blocked.

## Main-Push Prohibition

Main push, merge to main, or using main as an implicit approval mechanism remains blocked.

## Deployment Prohibition

Action 364 approves no deployment. The future preparation Action also stops after freeze and validation; it cannot deploy or contact Netlify/external endpoints.

## Rollback/Abandonment Boundary

Because no deployment occurs, abandonment means preserving unrelated work, invalidating the candidate manifest, and ending the preparation without promotion. Recoverability and non-loss of unrelated work must be reviewed before any future repository operation. Production rollback is unnecessary.

## Approval Vocabulary

Use exactly:

- `approved`
- `approved_with_conditions`
- `blocked`

`approved_with_conditions` means only that Option B is safe enough for a later separately reviewed preparation Action while exact operation details and manifest require final approval. It does not authorize repository operations now.

## Deterministic Gate Conditions

`approved` requires a completely specified recoverable operation sequence, approved baseline, exact file allowlist, and no unresolved operation detail. `approved_with_conditions` requires a safe selected method but reserves exact repository operations and final manifest for separate review. `blocked` applies if no method avoids unresolved inclusion, loss, unrelated mutation, weakened validation, unclear baseline, or unrecoverable broad operations.

Option B meets the conditional safety threshold. Exact operation details and the final file manifest are unresolved by design, so `approved` is not available.

## Approval Decision

Decision: `approved_with_conditions`.

This approves only a later immutable-preview-revision preparation Action constrained to Option B and a separately reviewed exact operation/file manifest. No immutable revision is created here.

## Passed Conditions

- Action 362 approval and its unconsumed attempt are preserved.
- Action 363 correctly blocks current deploy eligibility.
- Route path, file, and SHA-256 remain exact.
- Option B offers the strongest integrity, reviewability, reversibility, and unrelated-work isolation.
- Ownership, manifest, freeze, post-freeze validation, and abandonment requirements are explicit.
- Current validation is green but is not misrepresented as post-freeze evidence.
- No repository operation, deployment, route change, or external request occurred.

## Failed Conditions

Failed conditions: none for selecting Option B conceptually.

Conditions preventing an unconditional `approved` decision:

- exact future repository-operation sequence not yet reviewed
- final baseline and complete file allowlist not yet frozen
- recoverability evidence for the future operation not yet recorded

## Unresolved Conditions

- immutable revision and deployment-input manifest do not yet exist
- exact future repository-operation details await separate review
- concurrent post-trade files remain outside the approved package
- Netlify runtime remains untrusted
- preview, production, and main operations remain blocked

## Next Permitted Action

Create a separately reviewed Immutable Preview Revision Preparation Action for Option B. It may define and, only after explicit approval, perform the narrow recoverable repository-isolation operations, produce the complete ownership manifest, freeze one revision, run post-freeze validation, and stop without deployment.
