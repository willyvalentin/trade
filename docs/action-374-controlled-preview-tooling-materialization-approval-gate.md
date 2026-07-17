# Action 374: Controlled Preview Tooling Materialization Approval Gate

## Approval Status

- approval_vocabulary: approved | approved_with_conditions | blocked
- approval_decision: approved_with_conditions
- action_372_result: preview_aborted
- action_373_readiness: blocked
- action_362_approval_preserved: true
- preview_attempt_consumed: false
- deployment_attempt_count: 0
- tooling_installed: false
- registry_access_performed: false
- lifecycle_scripts_executed: false
- authentication_performed: false
- site_linkage_created: false
- Netlify_call_performed: false
- deployment_performed: false
- production_blocked: true
- main_push_blocked: true

## Purpose

Approve one controlled future method for materializing a version-pinned Netlify CLI into an isolated, disposable, non-candidate tooling context, subject to exact version and publication evidence resolved by a separate bounded pre-install verification.

## Scope

Action 374 is static and approval-gate-only. It defines materialization and later offline capability boundaries. It performs no package resolution, installation, download, registry access, lifecycle execution, authentication, site linkage, Netlify call, deployment, URL allocation, or candidate mutation.

## Recovery Context

Production remains protected by rollback deploy `6a501645908e4100088b7396` and clean recovery base `512a0c5`. Runtime work remains governed by exact-source, non-production, and one-attempt controls introduced after the Action 307/308 HTTP 400 empty-body failure.

## Upstream Dependencies

Action 309, Actions 318-320, Action 338, Action 344, Action 350, and Actions 358-373 remain authoritative.

## Action 372 Aborted Result

Action 372 remains `preview_aborted`: source preflight passed, but no approved tooling, authenticated site binding, or independently verified non-production target existed. No external operation began.

## Action 373 Blocked Result

Action 373 remains `blocked` because no preinstalled CLI, trusted repository CLI, approved connector, authentication provenance, exact site binding, or verified preview target exists. It selected controlled version-pinned isolated tooling or an equivalent approved connector as the only safe future path.

## Exact Candidate Binding

- candidate SHA: `b0bb5c4686d9cab3b682b3b06fadee4cf73cab07`
- baseline SHA: `51aced66782ec9a37cd358238f02b6f5c0ae97bd`
- route SHA-256: `98c7de74c94364eed9a447469ef367f1f454b42ae17d3911b3ebfad6ed5213bb`
- manifest SHA-256: `b7ac9ddaf40cc516bcdbdc7208dc6669f6b34a18a1810c0bde72209b25710892`
- candidate state: clean, unamended, and excluded from tooling materialization

## Action 362 Approval Status

Action 362's single non-production preview attempt remains approved and preserved. Tooling verification, materialization, and offline capability inspection do not consume it.

## Preview-Attempt Status

- preview_attempt_consumed: false
- external_deployment_operation_started: false
- deployment_attempt_count: 0

## Explicit Non-Goals

Action 374 does not install tooling, resolve package metadata, contact a registry or artifact host, authenticate, read credential values, contact Netlify, link a site, create `.netlify` state, modify `netlify.toml`, change project packages/locks/environment/configuration, deploy, allocate a URL, validate endpoints, modify the candidate, push, merge, or affect production/main.

## Tooling Materialization Strategy Evaluation

| Strategy | Assessment | Decision |
| --- | --- | --- |
| A. Exact version-pinned package in a disposable isolated tooling directory | supports a frozen lock, provenance, integrity, deletion, and candidate isolation | selected, subject to bounded version/publication verification |
| B. Official standalone CLI artifact | potentially suitable but current artifact availability and platform support are unresolved | conditional fallback only after official provenance verification |
| C. Trusted package cache already present locally | no approved cached CLI is currently evidenced | unavailable now; acceptable only with exact cached provenance and integrity |
| D. Add CLI to Ture repository dependencies | pollutes the application dependency graph solely for deployment tooling | rejected |
| E. On-demand `npx` | permits implicit resolution/fetch and floating provenance | rejected |
| F. Globally installed unversioned CLI | version, provenance, integrity, and self-update state are uncontrolled | rejected |

## Selected Materialization Strategy

Strategy A is approved with conditions: materialize one exact version of the official CLI package into a disposable sibling tooling directory outside both `/Users/willysimonsson/Dev/trade` and `/private/tmp/ture-action-370-corrected-preview-candidate`. The exact version, registry source, publication evidence, lifecycle behavior, and integrity must be frozen by a separate pre-install verification before any network window opens.

## Tooling Requirements

The materialized CLI must support exact version reporting, explicit site targeting, local-directory preview deployment without push, draft/deploy-preview semantics without production promotion, machine-readable deployment ID and preview URL evidence, bounded authentication/site inspection, and offline help inspection.

## CLI Version-Selection Policy

Do not assume a version from memory. A separate read-only pre-install verification must resolve available official releases from one approved source, assess release status and timestamp, Node/macOS compatibility, preview semantics, self-update, telemetry, lifecycle behavior, and known integrity metadata, then select exactly one version before installation approval is exercised.

## Version-Pinning Requirements

The package and every transitive dependency must be frozen to exact versions in a tooling-only lock. `latest`, `next`, wildcards, ranges, tags, unpinned major versions, and unpinned minor versions are forbidden. No fallback version may be selected after materialization starts.

## Package Provenance Requirements

Record package name, exact version, official registry or artifact host classification, publication timestamp, release status, dist URL classification without credentials, publisher/provenance metadata where available, and proof that the requested package is the official intended CLI.

## Registry-Source Requirements

A future network gate may allow one explicitly approved registry or official artifact host only. Mirrors, fallback registries, alternate hosts, arbitrary metadata endpoints, application endpoints, and Netlify APIs are excluded from the materialization window.

## Package Integrity Requirements

Capture the published integrity value, package tarball SHA-256 when available or computed, signature/provenance metadata where supported, package manifest SHA-256, tooling lock SHA-256, installed inventory digest, installed file inventory, executable path classification, and executable SHA-256.

## Tooling-Lock Requirements

The disposable tooling context must use an exact package manifest and exact transitive lock created only for tooling. Their identities and hashes must be recorded. Neither file may enter the Ture repository, immutable candidate, application dependency graph, or deployment input.

## Transitive Dependency Requirements

Every resolved package, version, source, integrity, optional status, platform condition, and lifecycle declaration must be captured. Arbitrary unlocked transitive resolution, fallback versions, post-start lock changes, and silent optional downloads block materialization.

## Package-Manager Requirements

The future Action must pin and record the existing package-manager executable path, version, configuration classification, cache policy, registry policy, script policy, audit/funding policy, and destination. No package-manager install or self-update is permitted outside the isolated context.

## Node and npm Compatibility Requirements

Before materialization, verify the selected CLI's declared engine compatibility against the exact local Node and npm versions. Unsupported, ambiguous, or warning-only compatibility requires a new gate; do not change project Node or package-manager configuration.

## Platform and Architecture Requirements

The selected package/artifact and every native or optional dependency must support the current macOS arm64 environment. Cross-platform fallback, emulation, native binary download, or architecture substitution requires separate approval.

## Lifecycle-Script Policy

Lifecycle scripts are disabled by default. The pre-install verifier must inspect `preinstall`, `install`, `postinstall`, `prepare`, optional dependencies, native downloads, browser downloads, binary fetches, telemetry setup, and update hooks before materialization. No unknown script may run.

## Postinstall Policy

No postinstall may run unless its exact source, purpose, inputs, outputs, network behavior, candidate isolation, and cleanup are enumerated and separately approved. Unknown or dynamically fetched postinstall behavior blocks materialization.

## Self-Update Policy

Self-update and update checks must be disabled or proven inert during materialization and offline inspection. The CLI must not rewrite itself, package state, shell profiles, global directories, or project files.

## Telemetry Policy

Telemetry must be disabled or proven not to emit during materialization and offline capability inspection. No analytics identifier, host metadata, project metadata, credential metadata, or command usage may leave the tooling context.

## Network Policy

Action 374 opens no network window. A later materialization Action may use only a separately approved, time-bounded package-download window for the exact package/version and locked transitives. It may not contact application endpoints, Netlify APIs, providers, Supabase, audit/funding endpoints, or arbitrary hosts.

## Registry-Access Policy

Registry access must be explicit, single-source, version-exact, credential-free, logged without sensitive headers, and closed after required artifacts are obtained. No audit fix, funding call, package fallback, broad metadata crawl, global install, sudo, or shell-profile change is allowed.

## Isolated Tooling-Context Requirements

Use a disposable sibling directory outside the immutable candidate and shared mutable worktree. It must be local-only, non-production, untracked, project-secret-free, application-env-free, independently deletable, write-contained, and unable to mutate candidate or production configuration.

## Candidate-Isolation Requirements

Candidate source is read-only evidence. Materialization may read candidate hashes but may not write, link, copy tooling into, execute package management within, or use the candidate as a cache/config destination. Candidate cleanliness and hashes must be rechecked afterward.

## Git-Exclusion Requirements

The tooling directory must remain outside both Git worktrees. No tooling package, lock, executable, cache, log, or generated state may appear in Git status or tracked files.

## Deploy-Input Exclusion Requirements

Tooling is operational infrastructure, not deployment source. The Action 370 manifest and candidate tree must remain unchanged, and the tooling root must not be traversed, archived, uploaded, or included in build/deploy input.

## Credential-Isolation Requirements

Materialization and offline inspection use no Netlify credential, cookie, token, password, authorization header, site ID, account ID, team ID, project secret, or application environment file.

## Tooling Configuration Policy

All temporary package-manager and CLI configuration must be tooling-context-local, non-secret, explicitly inventoried, and disposable. No home-directory, shell-profile, global package, project, candidate, `.netlify`, `netlify.toml`, or environment mutation is approved.

## Future Offline Command Allowlist

After materialization, a separate capability Action may execute only the exact frozen equivalents of:

- version output
- general help
- command-specific help
- offline configuration inspection proven network-free and mutation-free

The exact executable and arguments must be frozen after version selection. Sandbox evidence must prove no network and no unexpected writes.

## CLI Command Denylist

The capability phase forbids login, logout, networked status, link, unlink, init, deploy, site creation/listing, environment commands, service-invoking function commands, open, watch, broad dev runtime, completion installation, update/self-update, and any command requiring credentials, network, site state, URL allocation, or deployment.

## Authentication Prohibition

Materialization and offline inspection must not authenticate, test credentials, read credential values, contact account endpoints, or establish account/team identity.

## Site-Linkage Prohibition

No site may be linked or unlinked. No `.netlify` state, site ID, preview URL, alias, domain, branch, or target configuration may be created or changed.

## Deployment Prohibition

No preview or production deploy, dry deployment that allocates remote state, URL allocation, build upload, function upload, alias operation, promotion, or endpoint validation is approved.

## Cleanup and Abandonment Strategy

On any failure, stop without fallback. Preserve bounded evidence, then a separately authorized cleanup may delete the disposable tooling directory. No repository rollback, candidate cleanup, deployment rollback, production action, credential revocation, or data cleanup should be necessary.

## Materialization Evidence Requirements

The future artifact must record schema version; candidate, route, and manifest hashes; tooling-context classification; selected strategy; package/artifact identity and exact version; source/provenance; integrity hashes; lock identity; installed package/file inventories; executable path classification/hash; Node/npm/platform/architecture; lifecycle results; network and registry results; candidate/shared-worktree drift; Git/deploy exclusion; credential access; Netlify API, authentication, linkage, and deployment results; preview-attempt state; and final materialization decision. No secret or token may be recorded.

## Capability Evidence Requirements

A later offline capability artifact must bind to the materialization evidence and record executable/version/hash, exact allowlisted commands, status/output classifications, network denial, filesystem-write inventory, self-update/telemetry observations, supported preview/site-targeting semantics from help, denied command non-execution, absent auth/linkage/deployment, and final capability decision.

## Approval Vocabulary

- `approved`: one fully resolved deterministic path already has exact version, source, integrity, lifecycle, isolation, and network controls.
- `approved_with_conditions`: the strategy is safe, but exact CLI version or package-host capability must be resolved in a bounded pre-install verification.
- `blocked`: only floating/on-demand/global/repository-polluting paths are practical, credentials or deployment are required, lifecycle/provenance cannot be audited, or candidate isolation cannot be guaranteed.

## Deterministic Gate Conditions

Approval requires exact pinning, official provenance, captured integrity and transitive lock, isolated disposable materialization, no application/candidate changes, no credentials/auth/link/deploy, bounded single-source network policy, lifecycle control, cleanup capability, and preserved preview attempt.

## Passed Conditions

Strategy A defines deterministic isolation, lock/integrity evidence, lifecycle and network boundaries, Git/deploy exclusion, credential isolation, offline command controls, cleanup, exact candidate preservation, and zero preview-attempt consumption.

## Failed Conditions

None in the strategy design. Strategy D is rejected because tooling must not enter application dependencies; Strategies E and F are also rejected. Strategies B and C are not currently evidenced as available.

## Unresolved Conditions

The exact official CLI version, official package/artifact host, release status/timestamp, package integrity, transitive lock, lifecycle declarations, Node/macOS arm64 compatibility, self-update behavior, telemetry behavior, and suitable preview/site-targeting help semantics remain unresolved and must be frozen before installation.

## Approval Decision

`approved_with_conditions`. Strategy A may proceed only to a separate bounded pre-install version/provenance/integrity verification. Action 374 does not approve or execute materialization itself.

## Next Permitted Action

A separate read-only pre-install verification may resolve one exact official CLI version and source, inspect package metadata and lifecycle declarations under an explicitly approved bounded registry/artifact metadata window, and produce a proposed lock/integrity plan. It must stop before download/materialization, authentication, linkage, Netlify API access, deployment, or attempt consumption.
