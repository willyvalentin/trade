# Action 376: Controlled Netlify CLI Materialization and Offline Capability Verification

## Purpose

Materialize exactly `netlify-cli@26.2.0` in one disposable tooling-only context, then verify its identity and bounded help capabilities under enforced outbound-network denial without authentication, linkage, site inspection, or deployment.

## Scope

The scope is package-lock generation, isolated materialization with lifecycle scripts disabled, static integrity capture, and three frozen offline commands: version, general help, and deploy-specific help. It excludes every authenticated, linked, networked, mutating, build, site, and deployment operation.

## Recovery Context

Production remains protected by Action 309 and the static guards in Actions 318–320. The Action 370 candidate remains immutable, unpushed, and undeployed.

## Upstream Dependencies

This action builds on Actions 309, 318–320, 338, 344, 350, and 358–375. Action 375 returned `resolved_with_conditions` and froze the exact package, artifact, lifecycle, compatibility, and offline containment requirements.

## Action 375 Resolution

- Package: `netlify-cli`
- Exact version: `26.2.0`
- Registry integrity: `sha512-3jQg9WQoa1H74478fHZisj3T8dLM67x4F4Sgi7kROBHzJD9NNCYYw99dKRYWJOtEa1dUNyZu2W4VTdPzA1kjiw==`
- Tarball SHA-256: `741d46f0f18df96a8d3ee27614f51bfa529d2f9937a1122976358e54e40f6747`
- Package manifest SHA-256: `a145ebb0632b2fee19d5f1cce90812041541bfdaf59d5de6f39cb89be75b4887`
- Action 375 inventory SHA-256: `1654fff9d1c845e0b62070461e2b4575d78d5b9e0ac2eb5ae05b16cd21b1541a`
- Executable SHA-256: `e39432e46703049b6769e17c0a7a8f1748c345100a1f934d8a6c7076001d426c`

## Candidate Binding

- Candidate: `/private/tmp/ture-action-370-corrected-preview-candidate`
- Candidate SHA: `b0bb5c4686d9cab3b682b3b06fadee4cf73cab07`
- Baseline SHA: `51aced66782ec9a37cd358238f02b6f5c0ae97bd`
- Route SHA-256: `98c7de74c94364eed9a447469ef367f1f454b42ae17d3911b3ebfad6ed5213bb`
- Manifest SHA-256: `b7ac9ddaf40cc516bcdbdc7208dc6669f6b34a18a1810c0bde72209b25710892`
- Before/after candidate status digest: empty-tree SHA-256, exact match

## Approval and Attempt State

Action 362 approval remains preserved. `preview_attempt_consumed: false` and `deployment_attempt_count: 0`.

## Explicit Non-Goals

No application dependency, repository lock, global installation, `npx`, floating version, candidate change, environment copy, credential read, authentication, login/logout, linkage, status/site/account lookup, deploy, init, site creation, preview URL, production option, endpoint access, push, merge, or main change is permitted or performed.

## Tooling Context Definition

The sole context is `/private/tmp/ture-action-376-netlify-cli-tooling`. It is a disposable, isolated, non-production, untracked sibling outside the shared worktree, immutable candidate, and every Git-controlled project directory. It is excluded from deployment input and contains no application environment file or credential.

## Package Manager and Environment

- Package manager: npm at `/opt/homebrew/bin/npm`
- Node: `v26.3.1`
- npm: `11.16.0`
- Platform: Darwin arm64, macOS `15.6`

## Tooling-Only Manifest

The private tooling manifest has one dependency only: exact `netlify-cli: 26.2.0`. It has no scripts, workspace relationship, application dependency, candidate relationship, or floating range.

- Tooling `package.json` SHA-256: `0f29e999e8930f4718361c55f855cac4be053839f0ed317e49e01a561fb9be27`
- Tooling `package-lock.json` SHA-256: `c4debb7fd8121b93021194a5b6f76e62a7278f804e97ebdd8057f97981d78ef2`
- Lockfile version: `3`
- Lock package entries: `1178`
- Resolved URLs: `1176`
- Resolved host set: exactly `registry.npmjs.org`

The lock and manifest hashes remained unchanged through materialization and offline execution. Version substitution, package fallback, repository package mutation, global installation, and package-manager upgrades did not occur.

## Bounded Registry Window

The materialization window used only `registry.npmjs.org` for official npm metadata and exact lock-resolved tarballs. No credential was sent. No Netlify application, authenticated API, account, team, site, deploy, preview, production, Ture application, mirror, audit, or funding endpoint was contacted. The registry window closed before any CLI command executed.

The initial managed-sandbox attempt failed DNS before host contact. The approved bounded retry generated the exact lock, and the frozen lock was then materialized. There were two successful package-manager commands and three total invocations including that pre-contact failure.

## Lifecycle, Audit, and Update Policy

All package lifecycle scripts were disabled. Lifecycle execution count: `0`. The declared `postinstall` is `node ./scripts/postinstall.js`; it did not execute. Audit and funding calls were disabled, npm update notices were disabled, no sudo or global installation was used, and no shell profile changed.

## Installed Integrity

- Installed CLI manifest SHA-256: `a145ebb0632b2fee19d5f1cce90812041541bfdaf59d5de6f39cb89be75b4887`
- CLI executable: `/private/tmp/ture-action-376-netlify-cli-tooling/node_modules/.bin/netlify`
- Executable target: `../netlify-cli/bin/run.js`
- Executable SHA-256: `e39432e46703049b6769e17c0a7a8f1748c345100a1f934d8a6c7076001d426c`
- CLI package files: `1113`
- Installed CLI normalized inventory digest: `7dc1e74e6e0bdc0d53f9442d452178c2dbe33065c2420010eb96d5b066578f2c`
- Action 375 extracted artifact under the same normalized algorithm: exact match
- Installed dependency count: `1106`
- Installed dependency inventory digest: `f2bd19d72c57071330fde99f9b7fa7198a374af596f761f9e5521508050167b3`
- Symlinks: `64`; digest `53307e2e6b311aa2ff60f3a43d3ef357d3ae25cc3fc2d33a0b8d959968379764`
- Executable files: `137`; digest `7b0400b85baca03dd1e640f456bfbc8279425086e6965d322d510708570dbdd4`

The installed manifest and executable hashes exactly match Action 375. The normalized 1,113-file content inventory also matches the previously extracted official artifact.

## Credential and Configuration Isolation

Offline commands ran with an empty environment allowlist and disposable `HOME`, `XDG_CONFIG_HOME`, `XDG_CACHE_HOME`, and `TMPDIR`. Repository and candidate environment files, user Netlify credentials, existing config, cookies, and credential stores were not read.

The isolated runtime directories were empty before command execution. The CLI created one 81-byte file inside the disposable home at `runtime-home/Library/Preferences/netlify/config.json`. Its SHA-256 is `0bef236dad621b91f44c6e0b7fc2e22cdd8038d79a1223baba1ae553ffa7677d`; its only keys are `cliId` and `telemetryDisabled`. The identifier value is not recorded. No auth-like key exists. The separate runtime config, cache, and temp directories remained empty.

Real-user Netlify config/cache presence metadata remained `absent` before and after. No real-user home write, global config write, credential file, repository `.netlify`, or candidate `.netlify` state appeared.

## Telemetry and Self-Update

CLI commands ran with CI behavior and update-notifier suppression enabled, plus enforced network denial. The isolated config records `telemetryDisabled: false`, but telemetry and update egress were impossible under the sandbox. No self-update ran. The only config creation remained fully contained and non-secret inside the disposable home.

## Offline Command Allowlist

The frozen allowlist contained exactly:

1. CLI version output.
2. General CLI help.
3. Deploy-command help only.

All used the isolated executable directly. No global binary, repository binary, or `npx` fetch was used.

The denylist includes login, logout, status, link, unlink, init, actual deploy, sites, env, functions, open, watch, dev, completion installation, update, self-update, and every command requiring credentials, site identity, or network. No denylisted command executed.

## Network Enforcement

Every CLI command ran under a macOS sandbox profile that allowed local filesystem/process behavior and denied all network operations. A DNS-based control to `registry.npmjs.org` was blocked with exit `6`; a direct-IP socket control to `1.1.1.1:80` was blocked with exit `7`. The three CLI commands then completed successfully under the same network denial.

`network_enforcement_result: outbound_access_prevented`

No Netlify API access was possible during command execution.

## Offline Command Results

- Version: exit `0`, exact output `netlify-cli/26.2.0 darwin-arm64 node-v26.3.1`.
- General help: exit `0`, exact CLI version present, no authentication required.
- Deploy help: exit `0`, help only, no deployment or lookup.

## Draft and Site-Targeting Semantics

Offline deploy help confirms:

- Draft deployment is the default.
- `deploy-preview` is an available context.
- Explicit `--site <name-or-id>` targeting exists.
- `--json` machine-readable output exists.
- `--prod` and `--prod-if-unlocked` are explicit and denylisted.
- Anonymous and named site creation options exist and are denylisted.

No deployment command, site/account lookup, authentication, linkage, alias change, or URL allocation occurred. Exact authenticated non-production site binding remains a separate Action 377–378 gate.

## Filesystem Before and After

The tooling manifest and lock hashes remained exact. The only offline-command filesystem delta was the recorded isolated config file. The shared-worktree status digest remained `1979f7b7d879492828a7e2987891293717747619c763da5691db234176b188e3` before and after materialization/offline commands. Its application `package.json` and lock hashes also remained exact. This comparison was captured before adding this source-controlled report, evidence, verifier, and test.

The candidate status remained clean, candidate SHA remained exact, and route/manifest hashes remained exact. No candidate or shared-worktree drift was caused by tooling materialization or CLI execution.

## Cleanup Policy

The tooling context remains only in `/private/tmp` for deterministic local evidence review. It must never be copied into Git or deployment input. It may be deleted after review without repository or candidate cleanup because neither contains tooling artifacts.

## Capability Vocabulary

The only valid decisions are `capable`, `capable_with_conditions`, and `blocked`.

## Deterministic Capability Conditions

`capable` requires exact isolated materialization, an exact lock, matching provenance/integrity, zero lifecycle execution, exact isolated version identity, successful frozen help commands under enforced outbound denial, no credentials/authentication/linkage/deployment/config escape, bounded draft/site/production semantics, unchanged worktrees, and an unconsumed preview attempt. `capable_with_conditions` applies when those tooling and containment checks pass but authenticated non-production target binding remains separately gated. Any package, integrity, script, network-enforcement, startup, credential, state-escape, or worktree-drift failure returns `blocked`.

## Capability Decision

`capable_with_conditions`

The exact CLI is materially and operationally capable under offline containment. Authentication and exact non-production site binding remain unresolved and must be handled only by separately gated Actions 377 and 378. This action grants no deployment permission.

## Passed Conditions

- Exact package and lock materialized in the disposable context.
- Action 375 provenance, manifest, executable, and normalized content evidence match.
- Lifecycle and postinstall execution count is zero.
- Frozen offline commands succeed under enforced network denial.
- Credential, authentication, linkage, API, and deployment results are negative.
- Candidate and shared application package state remain unchanged.
- Draft, explicit-site, JSON, site-creation, and production-option semantics are bounded.

## Failed Conditions

None.

## Unresolved Conditions

Authenticated non-production site targeting and credential handling remain intentionally untested. They are not authorized by Action 376.

## Next Permitted Action

`separate_authentication_and_nonproduction_site_binding_readiness_gate_without_deployment`

That next gate must preserve deployment-attempt count `0`, perform no deployment, and keep production/main blocked.
