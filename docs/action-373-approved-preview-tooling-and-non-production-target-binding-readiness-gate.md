# Action 373: Approved Preview Tooling and Non-Production Target Binding Readiness Gate

## Readiness Status

- readiness_vocabulary: ready | ready_with_conditions | blocked
- readiness_decision: blocked
- action_372_result: preview_aborted
- action_362_approval_preserved: true
- preview_attempt_consumed: false
- deployment_attempt_count: 0
- tooling_installed: false
- authentication_performed: false
- site_linkage_created: false
- Netlify_call_performed: false
- deployment_performed: false
- production_blocked: true
- main_push_blocked: true

## Purpose

Define the exact safe mechanism and evidence required before a later Action may establish approved preview tooling, authentication provenance, exact Netlify site binding, deterministic non-production classification, and immutable candidate-source binding.

## Scope

This is a static, local, read-only readiness gate. It evaluates strategies and defines a future preparation boundary. It does not install or invoke tooling, authenticate, read credential values, contact Netlify, link a site, allocate a URL, mutate configuration, deploy, or consume the preserved attempt.

## Recovery Context

Production remains protected by rollback deploy `6a501645908e4100088b7396` and clean recovery base `512a0c5`. The Action 307/308 HTTP 400 empty-body failure requires exact source and target isolation before another runtime attempt.

## Upstream Dependencies

Action 309, Actions 318-320, Action 338, Action 344, Action 350, and Actions 358-372 remain authoritative.

## Action 372 Aborted Result

Action 372 returned `preview_aborted` before external initiation. Candidate preflight passed, but no approved non-production deployment target could be independently established.

## Exact Abort Reason

`non_production_target_could_not_be_independently_proven_or_safely_initiated_without_prohibited_tool_installation_or_auth_site_configuration`

No external deployment began, no request was made, no deployment identifier or preview URL was allocated, and no route validation was claimed.

## Exact Candidate Binding

- candidate SHA: `b0bb5c4686d9cab3b682b3b06fadee4cf73cab07`
- baseline SHA: `51aced66782ec9a37cd358238f02b6f5c0ae97bd`
- route SHA-256: `98c7de74c94364eed9a447469ef367f1f454b42ae17d3911b3ebfad6ed5213bb`
- manifest SHA-256: `b7ac9ddaf40cc516bcdbdc7208dc6669f6b34a18a1810c0bde72209b25710892`
- candidate state: clean, unamended, local, immutable

## Action 362 Approval Status

Action 362's single non-production preview attempt remains approved and preserved. Action 373 neither broadens nor consumes it.

## Preview-Attempt Status

- preview_attempt_consumed: false
- deployment_attempt_count: 0
- external_deployment_operation_started: false

Static capability checks, presence-only metadata, and blocked preparation preflights do not consume the attempt. It is consumed only when an approved external preview deployment operation actually starts.

## Explicit Non-Goals

Action 373 does not install packages, invoke package runners, authenticate, expose secrets, link sites, create `.netlify` state, modify `netlify.toml`, change environment or deployment configuration, contact Netlify/npm/providers/Supabase, allocate a URL, deploy, validate endpoints, modify the candidate, push, merge, update main, or alter production aliases or traffic.

## Tooling Strategy Evaluation

| Strategy | Current evidence | Decision |
| --- | --- | --- |
| A. Preinstalled version-pinned Netlify CLI | Action 372 found no executable | unavailable now; acceptable only if later independently provisioned and verified |
| B. Repository-pinned CLI in trusted dependencies | Action 372 found no trusted local dependency executable | unavailable now; acceptable only if already materialized through a separately approved dependency process |
| C. Independently installed CLI in controlled tooling context | no installation approval or tooling context exists | selected future mechanism only after a separate installation/materialization approval |
| D. Existing approved API integration or deployment connector | no approved connector identity or target binding exists | preferred alternative if later provided and independently verified |
| E. On-demand `npx` fetch | requires unpinned registry execution | rejected |
| F. Unverified manual browser upload | cannot currently prove exact source and isolated target | rejected unless a separate browser protocol proves cryptographic source binding and non-production targeting |

No strategy is claimed as currently available.

## Selected Future Tooling Strategy

The bounded concrete path is Strategy C: a separately approved, version-pinned CLI materialized in an isolated tooling context outside candidate source, with no registry fallback or self-update. Strategy D may supersede it only if an existing approved connector can prove equivalent identity, source, target, and no-production semantics. Neither is authorized or established by Action 373.

## Tooling Requirements

A future capability Action must prove tool name, exact version, executable path or connector identity, installation provenance, preinstalled/trusted-dependency status, binary or package hash where practical, preview-deploy semantics, exact-site targeting, exact local-directory deployment without push, production-promotion avoidance, and deterministic deployment-ID/preview-URL output.

## Tooling Provenance Requirements

Evidence must distinguish operating-system installation, repository dependency, isolated approved tool installation, and approved connector. Unknown, mutable, interactive-download, or self-updating provenance blocks preparation.

## Tooling Version Requirements

The exact version must be pinned and recorded before authentication or target inspection. Floating `latest`, unverified wrappers, implicit upgrades, and version resolution through registry access are forbidden.

## Package-Installation Policy

No package installation is approved by Action 373. Strategy C requires a separate installation/materialization gate that freezes package identity, version, integrity hash, source, destination, registry policy, lifecycle-script policy, and rollback. Candidate `package.json`, lockfile, dependencies, and source must remain untouched.

## npx Fallback Policy

On-demand `npx` execution is rejected. A package runner must not fetch, repair, resolve, or update Netlify CLI from a registry. Offline execution is insufficient unless the exact package is already approved, version-pinned, integrity-verified, and physically present.

## Authentication Requirements

A future preparation Action may verify only the minimum non-secret authentication metadata needed for preview capability: mechanism classification, non-interactive/interactive status, validity state, expiration state, bounded permission sufficiency, and absence of a production-promotion requirement.

## Authentication Provenance Requirements

The credential source must be classified without revealing it: approved secret manager, existing operator-managed process environment, approved connector identity, or another separately reviewed source. Ad hoc local files, copied tokens, browser cookies, and unknown provenance block preparation.

## Secret-Handling Policy

Do not read beyond presence/category metadata unless a later gate explicitly permits a safe identity operation. Never store or print token values, cookies, passwords, authorization headers, credential files, private environment values, or recoverable secret fragments.

## Token-Redaction Policy

Only stable non-reversible redacted account/team identifiers and boolean/category metadata may be recorded. Logs, process arguments, artifacts, tests, and route output must be checked for secret absence.

## Site-Binding Requirements

A future preparation Action must identify an exact site ID or stable redacted equivalent, non-sensitive site name, owning account/team, production-domain association, production branch, deploy-preview capability, arbitrary-preview isolation, production-alias risk, existing linkage state, and any local-state mutation required for linkage.

## Site-Identity Requirements

Name similarity is insufficient. Site identity must come from approved authenticated metadata tied to the exact account/team and independently cross-checked against the intended project and production-domain relationship.

## Account and Team Identity Requirements

Record only stable redacted account and team identities. Their ownership relationship to the site and permission to create isolated previews must be proven. Ambiguous tenancy or cross-account access blocks preparation.

## Project and Site Ownership Evidence

Evidence must show that the authenticated principal, owning team, exact site, repository project, and intended preview capability refer to the same approved Ture deployment boundary without exposing private identifiers.

## Production-Site Identity

The exact production site and domain relationship must be identified only to exclude them as deployment targets and alias destinations. Production settings, traffic, endpoints, logs, or data must not be mutated or inspected beyond approved non-secret target metadata.

## Preview-Target Identity

The future target must be a uniquely identifiable draft/deploy-preview operation whose URL and deployment ID are distinct from production, independently disposable, and incapable of promotion or alias mutation under the selected command/connector semantics.

## Target-Classification Vocabulary

Use exactly:

- `verified_non_production_preview`
- `verified_production`
- `ambiguous_target`
- `unavailable_target`

Deployment may proceed only with `verified_non_production_preview`.

## Non-Production Classification Requirements

Classification must prove the operation does not replace production, modify the production branch, attach/update production aliases, alter production traffic, or promote automatically; produces a unique preview URL; can be abandoned independently; and requires no site configuration change.

## Production-Alias Exclusion

The tool invocation and authenticated site metadata must independently prove that production aliases and the production custom domain are excluded. An omitted production flag alone is not sufficient if tool semantics or site configuration remain ambiguous.

## Traffic-Isolation Requirements

Production traffic must remain routed to the known production deployment throughout preparation and preview execution. No branch alias, custom domain, redirect, split test, edge rule, or promotion workflow may be changed.

## Source-Binding Requirements

The tool or connector must deploy the exact isolated candidate directory without rebuilding source from the shared mutable worktree, requiring push/merge, adding files, or silently substituting a branch tip or remote revision.

## Candidate-SHA Binding

Immediately before a later deployment, candidate HEAD and parent must equal the frozen SHA pair, the candidate must be clean, and the deployed source inventory must be cryptographically bound to `b0bb5c4686d9cab3b682b3b06fadee4cf73cab07`.

## Manifest-Hash Binding

The deployment input manifest must remain SHA-256 `b7ac9ddaf40cc516bcdbdc7208dc6669f6b34a18a1810c0bde72209b25710892`.

## Route-Hash Binding

The only introduced route must remain SHA-256 `98c7de74c94364eed9a447469ef367f1f454b42ae17d3911b3ebfad6ed5213bb`.

## Local-Linkage Policy

Action 373 creates no linkage. A later gate may permit temporary linkage only inside the isolated candidate, only after exact site verification, and only when it creates ignored tooling state without tracked-file, `netlify.toml`, environment, package, lockfile, or source changes. Linkage must be recorded, revalidated before deployment, removable without production effect, and must not consume the attempt.

## .netlify Directory Policy

No `.netlify` directory or state file may be created by this Action. Later temporary state must be ignored, candidate-local, exact-site-bound, non-secret, excluded from deployment input, and removable. Hidden mutation or shared-worktree linkage blocks preparation.

## Netlify Config Integrity

`netlify.toml`, build commands, framework adapter settings, redirects, headers, aliases, production branch settings, and site configuration must remain unchanged. Tooling that requires config remediation is unsuitable for this attempt.

## Environment Integrity

No environment file or variable may be created, modified, copied into the candidate, enumerated, or recorded. A later process may consume an already approved secret source only under a separate safe-authentication gate.

## Target-Observation Strategy

A future preparation Action may perform bounded, read-only authenticated metadata checks only after tooling/connector and secret-handling approval. It must capture redacted account/team/site identity, production relationship, preview capability, alias risk, and resulting target classification, then stop before deployment.

## Target-Mutation Prohibition

Target observation may not create a deploy, allocate a URL, link without separate approval, update site settings, aliases, branches, domains, environment, integrations, access control, or traffic.

## Preview-Attempt Consumption Semantics

Tool verification, authentication-state verification, site metadata observation, and separately approved temporary linkage do not consume the attempt. It remains unconsumed until an approved external preview deployment operation starts, then remains consumed regardless of outcome.

## Exact Future Preparation Boundary

A later preparation Action may verify approved tooling/version/provenance, safe authentication state, exact site/account/team ownership, production relationships, preview capability, source binding, and target classification. It may establish temporary candidate-local linkage only if separately approved. It must record deterministic evidence and stop before deployment or URL allocation.

## Stop Conditions

Stop if tooling needs an unapproved install, package fetch, registry access, floating version, unknown provenance, self-update, or hidden mutation; authentication exposes secrets or cannot establish safe identity; account/team/site ownership is ambiguous; production/preview cannot be distinguished; linkage changes tracked/config/environment files; deployment needs push/merge; production alias or traffic isolation is uncertain; or exact candidate/source binding cannot be enforced.

## Tooling-and-Binding Evidence Requirements

The future artifact must include schema version; candidate, baseline, route, and manifest hashes; tooling strategy, identity, version, executable/connector provenance and integrity; registry status; authentication classification; redacted account/team identities; exact site identity and ownership; production domain/branch relationships; preview capability; target classification; linkage state; tracked/config/environment drift; source-binding capability; production-alias risk; preview-attempt state; deployment-attempt count; and final readiness result. No secret may be stored.

## Readiness Vocabulary

- `ready`: one currently evidenced approved method satisfies every tooling, auth, site, target, source, and no-production condition.
- `ready_with_conditions`: the method is sound and only one bounded presence or account/site metadata capability remains for the future preparation Action.
- `blocked`: installation lacks separate approval, provenance/auth/site/target isolation is unclear, configuration mutation or secret exposure is required, or candidate binding cannot be enforced.

## Deterministic Readiness Conditions

Readiness requires approved pinned tooling physically present or an approved connector; safe authentication provenance; exact account/team/site ownership; `verified_non_production_preview`; zero production-alias risk; no source/config/environment mutation; exact candidate/manifest/route binding; and preserved attempt state.

## Passed Conditions

The candidate remains clean and exact; Action 372 remains `preview_aborted`; Action 362 approval and the unconsumed attempt are preserved; deployment count remains zero; safe requirements, strategy rejection rules, evidence fields, and stop conditions are deterministic.

## Failed Conditions

No approved tool or connector is currently present. No safe authentication provenance, exact site/account/team identity, preview capability, or independently verified non-production target is currently established. Strategy C lacks a separate installation approval.

## Unresolved Conditions

Tool materialization/provenance, exact version and integrity, safe authentication metadata, redacted account/team ownership, exact site identity, production relationships, preview capability, alias risk, and deterministic target classification remain unresolved.

## Readiness Decision

`blocked`. A tooling-and-target-binding preparation Action may not proceed until a separate gate approves and materializes Strategy C, or proves an existing Strategy D connector, without candidate or project mutation.

## Next Permitted Action

A separate static approval gate may define controlled, version-pinned Netlify tooling materialization outside candidate source, or approve an existing connector capability. It must stop before authentication, site linkage, Netlify contact, deployment, or preview-attempt consumption.
