# Action 377: Authentication and Non-Production Site-Binding Approval Gate

## Purpose

Define one tightly bounded future capability action that may validate user-authorized Netlify authentication and classify one exact owned site without exposing credentials, creating linkage state, mutating configuration, or deploying.

## Scope

Action 377 is static and approval-gate-only. It evaluates strategies, freezes a future read-only boundary, defines evidence and stop conditions, and selects a no-linkage site-targeting policy. It performs no credential read, authentication, Netlify call, account/site inspection, linkage, or deployment.

## Recovery Context

Ture remains under the Action 309 post-recovery protocol. Production and main remain blocked. The one Action 362 preview attempt remains bound to the immutable Action 370 candidate and has not been consumed.

## Upstream Dependencies

This gate builds directly on Actions 309, 318–320, 338, 344, 350, and 358–376.

## Action 376 Capability Result

Action 376 returned `capable_with_conditions`. It proved exact isolated `netlify-cli@26.2.0` identity, deterministic tooling lock integrity, lifecycle/postinstall suppression, offline version/help behavior under enforced network denial, draft-by-default semantics, explicit site targeting, JSON output, and zero credential, authentication, linkage, deployment, candidate, or shared-worktree effects.

## Exact Candidate Binding

- Candidate: `/private/tmp/ture-action-370-corrected-preview-candidate`
- Candidate SHA: `b0bb5c4686d9cab3b682b3b06fadee4cf73cab07`
- Baseline SHA: `51aced66782ec9a37cd358238f02b6f5c0ae97bd`
- Route SHA-256: `98c7de74c94364eed9a447469ef367f1f454b42ae17d3911b3ebfad6ed5213bb`
- Manifest SHA-256: `b7ac9ddaf40cc516bcdbdc7208dc6669f6b34a18a1810c0bde72209b25710892`
- Candidate state: clean, immutable, unpushed, undeployed

## Exact CLI Identity

- Package/version: `netlify-cli@26.2.0`
- Tooling lock SHA-256: `c4debb7fd8121b93021194a5b6f76e62a7278f804e97ebdd8057f97981d78ef2`
- Installed package manifest SHA-256: `a145ebb0632b2fee19d5f1cce90812041541bfdaf59d5de6f39cb89be75b4887`
- Executable SHA-256: `e39432e46703049b6769e17c0a7a8f1748c345100a1f934d8a6c7076001d426c`
- Tooling context: `/private/tmp/ture-action-376-netlify-cli-tooling`

Action 378 must use this exact executable and frozen tooling context. Version substitution, global CLI use, repository binaries, and `npx` are prohibited.

## Approval and Attempt State

- Action 362 approval preserved: yes
- Preview attempt consumed: no
- Deployment attempt count: `0`
- Production blocked: yes
- Main blocked: yes

## Explicit Non-Goals

Action 377 does not discover or read credentials, authenticate, invoke login/logout/status, contact Netlify, inspect account/team/site data, link/unlink, create `.netlify`, modify `netlify.toml`, modify environment variables, mutate source or configuration, allocate a URL, deploy, target production, access application/provider/Supabase endpoints, push, merge, or update main.

## Authentication Strategy Options

### A. User-Provided Process-Scoped Personal Access Token

The user explicitly supplies or authorizes an existing Netlify personal access token through a temporary process-scoped secret channel for Action 378. The token is injected only into the bounded child process, never written to disk, never echoed, never passed on a command line, never included in a process listing, and removed when the process exits. Read-only identity and exact-site metadata calls validate it.

Assessment: selected with conditions. Provenance, authorization, validity, permissions, and exact site metadata must be established during Action 378.

### B. Existing User-Home CLI State

Copying or referencing real-user Netlify CLI state risks unknown provenance, scope, refresh behavior, persistence, and accidental global mutation.

Assessment: rejected by default. It may not be used unless a separate gate proves provenance, permission scope, disposable copying, redaction, and zero real-home access. Action 378 is not authorized to use it.

### C. Interactive Browser Login

Interactive login adds browser state, callback handling, persistence, and difficult-to-audit credential creation.

Assessment: rejected for Action 378.

### D. OAuth or Device Flow

An official independently bounded OAuth/device flow could theoretically avoid a long-lived user token, but support, scopes, callback state, storage, and revocation are not resolved here.

Assessment: unavailable for this gate and requires a separate design approval.

### E. Existing Approved Deployment Connector

No approved connector with exact credential provenance, read-only identity/site metadata capability, and non-production target binding is established.

Assessment: unavailable.

### F. Repository or Application Environment Discovery

Searching `.env`, candidate environment files, application configuration, CI variables, shell history, or repository secrets for credentials violates provenance and isolation requirements.

Assessment: rejected and prohibited.

## Selected Future Authentication Strategy

Strategy A is selected for Action 378: an explicitly user-authorized, process-scoped personal access token supplied through a secret-safe channel. The token must not be assumed to exist. Action 378 remains blocked until the user separately authorizes a credential with known provenance.

No login flow is approved. No credential is persisted into the tooling context, disposable home, repository, candidate, shell profile, log, evidence file, or command history.

## Credential Source Requirements

The credential must be supplied directly by the authorized operator for the one bounded Action 378 process. Repository files, application environment files, candidate files, user-home CLI state, browser state, clipboard scraping, shell history, CI discovery, and inherited ambient secrets are not valid sources.

## Credential Provenance Requirements

Evidence must classify provenance as `operator_supplied_existing_personal_access_token`, include an explicit operator-authorization boolean and bounded-purpose statement, and confirm that the token belongs to the account expected to own the target site. Unknown, inherited, discovered, copied, shared, or third-party provenance stops the action.

## Credential Validity Requirements

Validity may be proven only by the frozen read-only current-user operation. A successful identity response must map to one unambiguous account identity. Expired, revoked, malformed, rate-limited, or authentication-failing credentials stop the action. Action 378 must not refresh, rotate, replace, or create credentials.

## Permission-Scope Requirements

The credential must be sufficient only to read current-user identity, owned account/team identity, and exact site metadata. Action 378 must not test mutation permissions. A broad token is not interpreted as permission to mutate. If read-only sufficiency cannot be separated from mutation, the gate stops.

## Credential Redaction Requirements

The token, authorization header, password, cookie, refresh token, OAuth code, and secret-bearing environment are never logged. All subprocess output and errors must pass irreversible secret redaction before evidence capture. The verifier must inject a synthetic canary secret and prove that neither the canary nor any recognizable fragment reaches stdout, stderr, logs, temp files, config, or evidence.

Token fingerprints are prohibited by default. If a fingerprint becomes necessary, it requires separate review and must use a one-way, domain-separated construction that cannot expose or enable practical recovery of the token. Account/team/site identity may instead be represented by approved stable non-secret identifiers or a SHA-256-based redacted identity.

## Secret Non-Persistence Requirements

The secret exists only in memory for the bounded child process. It must not appear in command arguments, package-manager config, CLI config, `.netlify`, shell history, crash reports, telemetry, temporary output, process snapshots captured as evidence, or source-controlled artifacts. The secret channel must be cleared at process end and the disposable runtime state inspected for secret canary leakage.

## Disposable HOME and Configuration Policy

Action 378 must reuse the Action 376 isolation model with new empty disposable `HOME`, config, cache, and temp directories under the tooling context. Real-user home and Netlify state remain inaccessible. CLI-created non-secret state is recorded by path, size, hash, and key names only; unknown or auth-bearing state stops the action.

## Account Identity Requirements

The frozen current-user read must return one authenticated principal. Evidence may retain only an approved non-sensitive account identifier or redacted stable fingerprint, identity type, and match result. Email, personal profile fields, tokens, and unrelated user data are excluded.

## Team Identity Requirements

The frozen owned-account/team read must identify exactly one expected owning team/account for the target site. Evidence records only an approved slug/ID or redacted stable fingerprint and ownership-match boolean. Ambiguous membership, multiple unresolved matches, or missing ownership stops the action.

## Site Identity Requirements

A site-name match is insufficient. The future action must begin with an operator-approved exact site ID and use only exact-site lookup. It must establish:

- Exact site ID and optional non-sensitive site name.
- Owning account/team slug or stable identity.
- Ownership match against the authenticated principal/team.
- Production domain and Netlify deploy subdomain relationship.
- Production branch from build settings.
- Branch-deploy and deploy-preview configuration.
- Draft deploy support.
- Explicit production-flag requirement.
- Whether explicit site targeting works without persistent linkage.
- Whether target identity is provable before deployment.

No broad site listing or fuzzy site-name selection is approved.

## Site Ownership Requirements

The exact site's owner/account identity must equal one authenticated owned account/team identity. The comparison must be deterministic and recorded as `ownership_match: true`. Missing, indirect, guessed, name-only, or cross-account ownership returns `ambiguous_target` or `unavailable_target` and stops.

## Production Domain Requirements

Read-only metadata must identify the production custom domain, default Netlify production hostname, and deploy subdomain relationship without contacting those application endpoints. Evidence stores only approved host classifications or redacted host fingerprints when a domain is sensitive. No DNS, HTTP, or browser request to production is permitted.

## Production Branch Requirements

Read-only site build settings must identify the production branch and source-repository binding. Action 378 must not change branch configuration or inspect repository contents. The production branch must be classified as protected from the future draft deployment path.

## Preview Capability Requirements

Site metadata and Action 376 CLI semantics together must prove draft deploy support, deploy-preview context support, unique draft URL allocation, abandonment independence, and no requirement to mutate production domain, production branch, alias, site configuration, or candidate source. No deployment may be used to discover these properties.

## Production Alias Risk Requirements

`--prod`, `--prod-if-unlocked`, aliases, branch-deploy promotion, site creation, anonymous deployment, and production contexts remain denylisted. Any automatic production alias update, branch mutation, production-domain impact, or unclear promotion behavior prevents `verified_non_production_preview`.

## Target-Classification Vocabulary

Use exactly:

- `verified_non_production_preview`
- `verified_production`
- `ambiguous_target`
- `unavailable_target`

Only `verified_non_production_preview` may permit a later deployment execution gate.

## Verified Non-Production Preview Requirements

`verified_non_production_preview` requires all of:

1. One exact owned site and unambiguous account/team ownership.
2. Draft/deploy-preview capability without site creation.
3. Production deployment requires explicit flags that remain denied.
4. No automatic production promotion, alias update, production branch mutation, or production traffic effect.
5. A unique preview URL can be created and abandoned independently.
6. The exact candidate can be targeted without push or merge.
7. Explicit site ID targeting requires no persistent linkage or configuration mutation.
8. Source binding to candidate/route/manifest hashes remains enforceable.
9. No deployment is required to establish the classification.

Failure of any condition yields `ambiguous_target`, `unavailable_target`, or `verified_production`; none permit deployment.

## Exact Read-Only Network Boundary

Action 378 may contact only the official Netlify API host required by the exact approved CLI client for these three frozen operations:

1. `getCurrentUser` for credential validity and authenticated principal identity.
2. `listAccountsForUser` for owned account/team identity only.
3. `getSite` with the operator-approved exact site ID for exact site, ownership, production-domain, production-branch, deploy-preview, and source-binding metadata.

The concrete HTTP methods, official host, and endpoint paths must be resolved from the exact installed `netlify-cli@26.2.0` API client and frozen in Action 378 before network opens. All must be GET/read-only. If these operations are insufficient, Action 378 stops; it may not broaden the boundary dynamically.

No account mutation, team mutation, site listing/search, site creation/deletion, environment access, deploy/deploy listing, logs, domains, aliases, forms, functions, blobs, builds, DNS, application endpoint, preview endpoint, or production endpoint is allowed.

## Future Command Allowlist

The allowlist is limited to one purpose-built local evidence helper that imports the exact installed Netlify API client and invokes only the three frozen read-only operations above. The helper must have a static SHA-256, use the process-scoped secret without printing it, validate an operator-approved exact site ID, redact output before persistence, and exit before any mutation-capable path.

Broad CLI commands such as `status`, `sites:list`, `sites:search`, and generic `api` dispatch are not approved because their output and operation surfaces are wider than required. Offline version/help commands already verified by Action 376 need not rerun unless identity drift is detected.

## Command Denylist

Denied operations include deploy, link, unlink, init, login, logout, status, generic API dispatch, site list/search/create/delete, environment get/list/set/import/unset, domain mutation, function invocation, build/deploy logs, production or branch deployment, alias mutation, open, dev, watch, update, self-update, completion installation, and every operation not explicitly allowlisted.

## Local Linkage Options

### A. No Persistent Linkage

Pass the exact verified site ID explicitly in a later deployment gate. Create no `.netlify` state.

Assessment: selected.

### B. Temporary Disposable Linkage State

Create `.netlify/state.json` only in a separate disposable candidate-external deployment context, containing only the exact site ID and approved metadata, with full before/after evidence and cleanup.

Assessment: fallback only; not approved by Action 377 or 378. Requires separate approval if explicit site ID targeting proves insufficient.

### C. Link the Immutable Candidate

Assessment: rejected.

### D. Link the Shared Worktree

Assessment: rejected.

## Selected Linkage Policy

Policy A: no persistent linkage. Action 378 performs metadata inspection only and creates no linkage. A later deployment gate may use the exact verified site ID directly only after target classification succeeds.

## `.netlify` State Policy

`.netlify` must remain absent from the shared repository and immutable candidate. Action 378 must not create `.netlify` anywhere. Appearance of repository, candidate, real-home, or unapproved disposable linkage state is an immediate stop.

## Candidate-Local Isolation

The candidate remains read-only evidence. Authentication/site metadata work occurs in a separate disposable runtime context. No command may use the candidate as its working directory, traverse candidate environment files, or write candidate-local configuration.

## Drift Prohibitions

Tracked files, untracked files, `netlify.toml`, application package files, lockfiles, environment files, proxy, middleware, runtime routes, candidate files, and real-user configuration must remain unchanged. Before/after hashes and Git status inventories are mandatory.

## Source-Binding Requirements

Every Action 378 result must remain bound to candidate SHA `b0bb5c4686d9cab3b682b3b06fadee4cf73cab07`, baseline SHA `51aced66782ec9a37cd358238f02b6f5c0ae97bd`, route SHA-256 `98c7de74c94364eed9a447469ef367f1f454b42ae17d3911b3ebfad6ed5213bb`, and manifest SHA-256 `b7ac9ddaf40cc516bcdbdc7208dc6669f6b34a18a1810c0bde72209b25710892`. A mismatch stops before authentication or network access.

## Stop Conditions

Action 378 stops immediately if:

- No separately approved credential is available or provenance is unknown.
- The secret would need to be logged, persisted, passed as an argument, or exposed.
- Authentication fails or account/team identity is ambiguous.
- Exact site ID is absent, ambiguous, not owned, or only name-matched.
- Production and preview semantics cannot be separated.
- Read-only inspection requires mutation, generic API expansion, site creation, or deployment.
- The CLI/API helper attempts update, telemetry, or an unapproved host/endpoint.
- State escapes disposable config locations or `.netlify` appears.
- Source, repository, candidate, config, or environment drift occurs.
- Target classification is not `verified_non_production_preview`.
- Production alias/branch/domain risk remains.
- The preview attempt would be consumed.

## Action 378 Evidence Contract

The future evidence artifact must contain:

- Evidence schema version.
- Candidate, baseline, route, manifest, CLI executable, and helper hashes.
- CLI version and tooling-lock identity.
- Authentication strategy and credential provenance classification.
- Credential-present, credential-valid, permission-sufficiency, and secret-redaction booleans.
- Optional safe non-secret identity fingerprints; never the credential.
- Redacted account and team identity plus deterministic match result.
- Exact site ID or approved stable representation, optional non-sensitive site name, and ownership result.
- Production-domain, deploy-subdomain, production-branch, branch-deploy, and deploy-preview relationships.
- Draft capability, explicit production-flag requirement, production-alias risk, and explicit-site-targeting result.
- Linkage strategy and linkage-state result.
- Target classification using the exact vocabulary.
- Frozen endpoint/helper inventory with method, host, path classification, status, and redaction result.
- Mutation, repository drift, candidate drift, `.netlify`, deployment, preview-attempt, production, and main results.
- Final capability decision and next permitted action.

It must not contain tokens, passwords, cookies, authorization headers, refresh tokens, OAuth codes, credential file contents, full secret-bearing environments, personal profile data, or unredacted sensitive domains.

## Approval Vocabulary

Use exactly:

- `approved`
- `approved_with_conditions`
- `blocked`

## Deterministic Gate Conditions

`approved` requires an already established safe credential provenance and one fully frozen read-only identity/site-binding method with irreversible redaction, exact ownership and target classification, no production alias risk, no deployment/mutation, exact source binding, and preserved attempt state. `approved_with_conditions` applies when this static boundary is safe but actual operator-authorized credential and site metadata capability remain to be established in Action 378. Any secret-source, isolation, ownership, read-only separation, production-risk, deployment-required, or source-binding failure returns `blocked`.

## Approval Decision

`approval_decision: approved_with_conditions`

Strategy A and linkage Policy A define a safe future boundary. The credential is not assumed or accessed, and exact account/team/site metadata is unresolved. Action 378 may proceed only after separate operator authorization and must remain read-only, no-linkage, and no-deployment.

## Passed Conditions

- Action 376 is `capable_with_conditions` and exact tooling identity is preserved.
- Candidate and Action 362 attempt binding remain exact.
- A process-scoped, non-persistent credential strategy is defined.
- Repository/application credential discovery and real-home CLI state are rejected.
- Redaction, canary, disposable-home, and non-persistence requirements are explicit.
- Three narrow read-only identity/site operations are frozen conceptually.
- Exact account/team/site/ownership and preview-isolation requirements are deterministic.
- No-persistent-linkage Policy A is selected.
- Target classification and stop conditions default closed.

## Failed Conditions

None in the static gate design.

## Unresolved Conditions

- No operator-authorized credential has been supplied or validated.
- Account, team, exact site, ownership, domain, branch, and preview metadata remain unread.
- Concrete official API host/method/path mappings and the local redacting helper hash must be frozen before Action 378 network access.
- `verified_non_production_preview` has not yet been established.

## No-Effect Record

- `credential_access_performed: false`
- `authentication_performed: false`
- `Netlify_call_performed: false`
- `account_site_inspection_performed: false`
- `site_linkage_created: false`
- `.netlify_state_created: false`
- `deployment_performed: false`
- `preview_attempt_consumed: false`
- `deployment_attempt_count: 0`
- `production_blocked: true`
- `main_blocked: true`

## Next Permitted Action

`action_378_user_authorized_read_only_authentication_and_exact_site_metadata_capability_verification`

Action 378 must stop before deployment, linkage, or configuration mutation. It does not inherit permission to deploy from Action 362.
