# Action 375: Netlify CLI Version, Package Provenance, and Integrity Resolution

## Purpose

Resolve the exact official Netlify CLI package, version, provenance, artifact integrity, compatibility, lifecycle behavior, and deployment command semantics required by Action 374 without installing or executing the CLI.

## Scope

Read-only retrieval of official public metadata, documentation, and one exact package artifact; static inspection only. No package installation, lifecycle execution, CLI execution, credential access, authentication, linkage, Netlify application API access, deployment, or candidate mutation is in scope.

## Recovery Context

Production remains protected by the post-recovery controls established in Action 309 and the static branch guards in Actions 318–320. Action 375 adds no production runtime code and changes no route, proxy, middleware, Netlify configuration, application package, or immutable candidate file.

## Upstream Dependencies

This resolution builds on Actions 309, 318–320, 338, 344, 350, and 358–374. Action 374 returned `approved_with_conditions` for a future disposable, exact-version tooling context; it did not approve materialization.

## Action 362 Approval Status

The single narrowly scoped non-production preview attempt remains approved and bound to the exact Action 370 candidate. This evidence work does not consume it.

## Explicit Non-Goals

No install, `npx`, global tool, application dependency, lockfile, CLI execution, lifecycle execution, authentication, credential access, site linkage, `.netlify` state, `netlify.toml` change, deploy, preview URL, push, merge, or main update is created or performed.

## Resolution

`resolution_status: resolved_with_conditions`

The official package and exact version are resolved and the downloaded public artifact is integrity-verified. Materialization and even offline CLI execution remain closed until an isolated exact dependency lock and a network-denied `version`/`help` containment check receive separate approval.

## Frozen Candidate

- Candidate: `/private/tmp/ture-action-370-corrected-preview-candidate`
- Candidate SHA: `b0bb5c4686d9cab3b682b3b06fadee4cf73cab07`
- Baseline SHA: `51aced66782ec9a37cd358238f02b6f5c0ae97bd`
- Candidate clean: yes
- Route SHA-256: `98c7de74c94364eed9a447469ef367f1f454b42ae17d3911b3ebfad6ed5213bb`
- Manifest SHA-256: `b7ac9ddaf40cc516bcdbdc7208dc6669f6b34a18a1810c0bde72209b25710892`

Action 362 approval remains preserved. The preview attempt remains unconsumed and the deployment attempt count remains `0`.

## Bounded Retrieval

The bounded read-only evidence window contacted only:

- `registry.npmjs.org` for public package metadata and the exact tarball.
- `www.npmjs.com` for the public package catalog entry.
- `github.com` for the package's official source-repository relationship.
- `docs.netlify.com` for official CLI and draft-deploy semantics.

No credential was read or sent. No Netlify account, site, deploy, application, Supabase, provider, audit, or funding endpoint was contacted.

## Package Identity and Provenance

- Official package name: `netlify-cli`
- Official registry: `https://registry.npmjs.org`
- Repository: `https://github.com/netlify/cli`
- Current `latest` dist-tag at retrieval: `26.2.0`
- Package deprecated: no
- Selected exact version: `26.2.0`
- Published: `2026-07-07T05:28:58.040Z`
- Selection basis: current non-deprecated stable release with matching official registry, npm catalog, and Netlify-owned repository provenance.

The immediately preceding stable release, `26.1.0`, was also evaluated. It is non-deprecated, requires the same Node floor, and remains a rollback comparison only. Floating tags, semver ranges, and `npx netlify` are not approved inputs.

## Evaluated Versions

| Version | Published | Status | Deprecated | Node engine | Tarball | Preview deploy | Explicit site |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `26.2.0` | `2026-07-07T05:28:58.040Z` | stable | no | `>=20.12.2` | available | supported | supported |
| `26.1.0` | `2026-05-31T08:12:18.606Z` | stable | no | `>=20.12.2` | available | supported | supported |

## Version-Selection Policy

The final input must be one exact stable version. Floating `latest`, other dist-tags, ranges, wildcards, prereleases, unofficial wrappers, mirrors, aliases, and automatic substitutions are rejected. `26.2.0` is selected because it was the current official non-deprecated stable release at retrieval, its provenance and exact artifact integrity were verifiable, and it passed the direct Node/platform and static command-capability checks.

## Artifact Integrity

Exact tarball:

`https://registry.npmjs.org/netlify-cli/-/netlify-cli-26.2.0.tgz`

- Registry integrity: `sha512-3jQg9WQoa1H74478fHZisj3T8dLM67x4F4Sgi7kROBHzJD9NNCYYw99dKRYWJOtEa1dUNyZu2W4VTdPzA1kjiw==`
- Registry SHA-1: `cfb3141d80b50fbd602f76b1c8466c399664ef97`
- Computed SHA-1: exact match
- Computed SHA-256: `741d46f0f18df96a8d3ee27614f51bfa529d2f9937a1122976358e54e40f6747`
- Computed SHA-512 integrity: exact match
- Compressed bytes: `574060`
- Registry file count: `1113`
- Registry unpacked bytes: `2390726`
- Package manifest SHA-256: `a145ebb0632b2fee19d5f1cce90812041541bfdaf59d5de6f39cb89be75b4887`
- Extracted inventory SHA-256: `1654fff9d1c845e0b62070461e2b4575d78d5b9e0ac2eb5ae05b16cd21b1541a`

Archive path safety passed: all entries were under `package/`, with no absolute paths, parent traversal, or symbolic links. The sole executable is `bin/run.js` (`755`, SHA-256 `e39432e46703049b6769e17c0a7a8f1748c345100a1f934d8a6c7076001d426c`), mapped by both `netlify` and `ntl`. No unexpected executable was found.

## Package Contents Inventory

The archive contains `1113` regular files, no symlinks, and creates `84` directories when extracted. The deterministic inventory digest covers sorted entry type, relative path, mode, size, and file SHA-256 with a terminal newline. The package has no bundled dependencies. No downloaded artifact, extracted tree, package manifest, lock, or binary was added to the Ture repository.

## Compatibility

The package declares Node `>=20.12.2`, package type `module`, and no direct OS or CPU restriction. The local environment is Node `v26.3.1`, npm `11.16.0`, Darwin arm64, macOS `15.6`; the Node and direct package-manifest platform checks pass.

Compatibility remains conditional for npm and transitive native/optional dependencies until a deterministic lock is produced in a disposable tooling context. The application `package.json` and lockfile must not be changed.

## Dependency and Lock Policy

The package declares 96 direct dependencies, no direct optional dependencies, no bundled dependencies, and no peer dependencies. No exact transitive lock was created in this action.

The next approved materialization must:

1. Use a disposable directory outside the candidate and shared worktree.
2. Pin `netlify-cli@26.2.0` exactly.
3. Resolve from the official registry only within a new bounded window.
4. Disable all lifecycle scripts.
5. preserve a complete exact lock and integrity inventory.
6. Leave application package files, candidate files, real home state, and Git status untouched.

It must reject version substitution, fallback dist-tags, non-approved registries, lock mutation after freeze, audit-fix, package-manager upgrades, global installation, and any resolved dependency lacking an exact version/source/integrity entry.

## Lifecycle Review

The published package has no `preinstall`, `install`, `prepare`, or `prepublish` hook. It does declare:

`postinstall: node ./scripts/postinstall.js`

That postinstall loads the command tree, generates autocompletion data, and may write user configuration. It is classified `requires_separate_approval_and_must_remain_disabled`. No lifecycle script was run. No direct native or browser download hook was observed in the package manifest, but transitive behavior remains subject to the exact-lock review.

Per-hook classifications are: `preinstall: absent`, `install: absent`, `postinstall: requires_separate_approval`, `prepare: absent`, and `prepublish: absent`. Direct optional dependencies, direct native build steps, direct platform binary downloads, and direct browser downloads are absent. Transitive optional/native behavior requires exact-lock review.

## Update, Telemetry, and Writes

Static source inspection found:

- An update notifier that can check periodically and write configuration. No automatic self-replacement was observed.
- CLI telemetry support targeting `cli.netlify.com`; CI suppresses telemetry paths, while global configuration can also disable it.
- Global config, autocompletion, and project `.netlify` write surfaces.
- Error-reporting and configuration paths that make an ordinary local execution unsuitable for this gate.

Therefore the next capability check must use a network-denied sandbox, disposable `HOME` and `XDG_CONFIG_HOME`, CI-like telemetry suppression, a filesystem-write inventory, and read-only candidate/shared-worktree mounts. It may run only exact `version`, general `help`, and approved command-specific `help` checks. It may not run postinstall, update, completion installation, authentication, linkage, status, build, or deploy commands.

## Deploy Semantics

Static package-source and official-documentation review confirms:

- `netlify deploy` creates a draft deploy by default.
- Production requires an explicit production option.
- `--context deploy-preview`, `--site`, and `--json` are supported.
- The result can report a unique draft deploy URL and deploy ID.
- `--prod` and `--prod-if-unlocked` are permanently denied for this rollout.
- `--allow-anonymous` is denied because it may create a site.

These are capability findings only. No deploy command, authentication, site linkage, Netlify API call, preview allocation, or production operation occurred.

General help and version output do not require authentication in principle, but this remains to be proved under the network-denied capability gate. Target inspection and deployment require authenticated context. Static command inspection indicates an explicit site ID can be supplied without persistent linkage; persistent linkage is not required by the explicit `--site` option. Configuration-write surfaces still require containment.

## Production-Promotion Risk

Production promotion controls exist, so risk is bounded only by a permanent option denylist and the future isolated execution gate. `--prod`, `--prod-if-unlocked`, production aliases, anonymous site creation, and any production context remain prohibited. `production_blocked: true` and `main_blocked: true`.

## Future Network Contract

A later materialization window may contact only `registry.npmjs.org` for exact metadata, the selected tarball, and exact transitive dependencies. It must be credential-free, registry-only, Netlify-API-free, logged, time-bounded, limited to the disposable tooling context, and closed before any CLI capability execution.

## Conditions Remaining

1. Generate and verify an exact transitive lock in a disposable isolated tooling context with scripts disabled.
2. Run only `version` and `help` capability checks in a network-denied disposable home.
3. Prove zero candidate, shared-worktree, and real-home writes.
4. Preserve the postinstall prohibition and verify update/telemetry suppression.

Until all four conditions pass, the CLI is not approved for authentication, linkage, deployment, or any networked command.

## Resolution Vocabulary

The only valid outcomes are `resolved`, `resolved_with_conditions`, and `blocked`.

## Deterministic Resolution Conditions

`resolved` requires proven official identity, one exact stable version, official provenance, exact artifact integrity, understood lifecycle behavior, compatible Node/platform metadata, a deterministic isolated lock strategy, bounded preview/site-targeting semantics, bounded production risk, no installation or execution, and an unconsumed preview attempt. `resolved_with_conditions` is used when all package/version/integrity evidence is resolved but one bounded offline runtime behavior still requires verification. Any provenance, integrity, stable-version, compatibility, required-script, locking, or preview-boundary failure returns `blocked`.

## Final Resolution Decision

`resolved_with_conditions`: package identity, version, provenance, and artifact integrity are frozen; the exact-lock materialization and network-denied help/version containment checks remain separate conditions.

## No-Effect Record

- `package_installed: false`
- `CLI_executed: false`
- `lifecycle_scripts_executed: false`
- `authentication_performed: false`
- `site_linkage_created: false`
- `Netlify_account_API_called: false`
- `Netlify_site_API_called: false`
- `Netlify_deploy_API_called: false`
- `deployment_performed: false`
- `preview_attempt_consumed: false`
- `deployment_attempt_count: 0`
- `candidate_mutated: false`
- `repository_package_files_mutated: false`
- `production_changed: false`
- `main_pushed: false`

## Next Permitted Action

`isolated_exact_lock_materialization_and_network_denied_version_help_capability_verification`

That action must remain local, disposable, non-authenticated, non-linked, and non-deploying. Action 375 itself authorizes no installation or CLI execution.
