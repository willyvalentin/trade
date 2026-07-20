# Post-Trade Live Ephemeral Staging Supabase Credential Provider Implementation Design - No Credential Access, No Run

## Purpose

Action 515 defines the future live implementation contract for `reviewed_ephemeral_staging_supabase_cli_credential_provider_v1` without accessing credentials, invoking a provider, authenticating, spawning a process, running Supabase, connecting to staging or production, executing SQL, deploying, persisting leases, consuming authorization, or activating API/UI/runtime behavior.

The design is implemented in `lib/post-trade-live-ephemeral-staging-supabase-credential-provider-design.ts` with static coverage in `tests/e2e/post-trade-live-ephemeral-staging-supabase-credential-provider-design.spec.ts`.

## Source-Option Evaluation

The reviewed source options are:

- Existing non-interactive Supabase CLI authenticated context: insufficient by default because it must separately prove exact staging binding, non-interactive behavior, scope, no production access, expiration/revocation posture, no secret disclosure, cleanup, and session isolation.
- macOS Keychain-backed ephemeral provider: preferred first-local-run model only after a separately reviewed adapter exists.
- Explicit OS credential-provider adapter: acceptable as an alternate reviewed source if it provides the same non-interactive staging-only single-operation lease and cleanup guarantees.
- CI secret-provider adapter: acceptable only in a reviewed CI-only path with staging-only scope and no public exposure.
- Process-environment credential: rejected as a live source because inherited/raw environment values are too easy to leak or reuse.
- `.env.local`: rejected as a live source.
- Pasted token or command argument: rejected.

## Preferred Source Model

The preferred model is `reviewed_macos_keychain_ephemeral_staging_supabase_source_v1`: a separately reviewed macOS Keychain or OS credential-provider adapter that resolves an exact staging-only credential only after a final live credential-access gate. The future source may hand back only an in-process non-serializable lease, never a public token, environment map, credential path, or serialized credential.

## Rejected Sources

The source registry rejects raw environment, dotenv, source control, pasted token, command argument, URL-embedded credential, browser auth, device-code auth, interactive login, shared global auth, production credential, generic source, and unknown source identities.

## Source Registry

`buildCredentialSourceRegistry()` defines exact accepted source identities, marks the macOS Keychain-backed source as preferred, requires a reviewed source adapter, requires staging-only/non-interactive/single-operation/cleanup capability, and rejects already-authenticated CLI context unless separately proven.

## Resolution Request

`buildCredentialResolutionRequest()` creates a non-secret request bound to the reviewed provider identity, opaque boundary version, authorization artifact id and fingerprint, preflight run and operation ids, boundary session id, staging project `pdvzyuhykomwfqyyztru`, explicitly rejected production project `ekdyopdrrkphlrsilyoo`, exact credential purpose, one allowed operation identity, secret-slot identity, short validity window, single-operation and single-session markers, non-interactive/no-browser/no-device/no-argument/no-serialization/no-logging markers, cleanup requirement, and no-retry marker.

Multiple operations, Git operations, unreviewed Supabase operations, production scope, expired/future/excessive validity, interactive auth, argument injection, and retry are rejected.

## Resolution Result

`buildCredentialResolutionResult()` models only opaque metadata: request id, lease id, handle id, source identity, staging target, timestamps, revocation classification, lease state, single-use confirmation, source binding classification, result classification, and fingerprint. It does not claim authentication success and contains no secret value.

## Private Lease

`buildPrivateLeasePolicy()` defines the future private lease rules: non-serializable, non-cloneable where practical, no JSON representation, no string coercion, no inspection output, no logging, no fingerprinting the credential, no persistence, no global/module/browser/filesystem/database storage, one operation, one boundary session, staging-only binding, short-lived, invalid after first use, timeout, parser failure, prompt detection, cleanup ambiguity, or process ambiguity.

## Memory-Handling Limitations

The design does not claim reliable cryptographic zeroization of JavaScript strings. Future implementation should minimize secret lifetime, avoid unnecessary copies, avoid errors/logs/fingerprints/public types, use a private buffer-like container only where supported, overwrite mutable buffers where practical, drop references immediately, keep provider and process executor in one tightly reviewed server-only boundary, and terminate the live-run session after ambiguity. Garbage collection and immutable string copies remain limitations.

## Injection Model

`buildCredentialInjectionPolicy()` allows one exact approved Supabase read-only operation, one process invocation, one boundary session, exact staging target, and direct process-environment injection only through the future reviewed executor and secret-slot contract. It rejects shell use, command-line argument use, URL credentials, stdin, config files, inherited environment, Git, catalog adapters unless separately reviewed, production, second operation, and retry.

The actual credential environment name is intentionally absent from public evidence.

## Authentication Behavior

The future provider must prohibit interactive login, browser launch, device-code flow, MFA prompt, password prompt, token prompt, confirmation prompt, project linking, credential helper, GUI app, and URL opener. Missing or invalid authentication blocks, with no fallback provider, no browser auth, no prompt, no retry, and cleanup still required.

## Authentication Evidence

`buildAuthenticationEvidence()` models non-secret evidence: operation id, lease id, provider identity, source identity, target project, future process result identity, interaction classification, non-interactive/no-prompt/no-browser confirmations, result classification, timestamp, and fingerprint. It does not claim token validity directly.

## Lease Lifecycle

`buildLeaseLifecyclePolicy()` defines exact states and allowed transitions from `not_requested` through resolution, lease, use, cleanup required, cleanup requested, and cleanup confirmed. Failure transitions can enter invalid, expired, revoked, cleanup failed, or cleanup ambiguous states. Cleanup, failure, timeout, or ambiguity cannot return to resolved, leased, or in-use states. Second use is rejected.

## Cleanup Model

`buildCleanupPolicy()` requires cleanup after success, process failure, timeout, output overflow, parser failure, prompt detection, authentication rejection, secret detection, unexpected child process, and termination ambiguity. Cleanup invalidates the lease, removes the secret from the environment builder, drops internal references, overwrites mutable buffers where practical, clears the secret slot, prevents provider reuse, and invalidates the boundary session after ambiguity. Cleanup evidence cannot prove memory zeroization.

## Source Availability Evidence

`buildSourceAvailabilityEvidence()` models structural availability only. It does not reveal item names, keychain labels, environment names, paths, account names, usernames, token metadata, or secret lengths, and it does not claim credential validity.

## Provider Implementation Interface

The future interface may inspect structural source availability, request one opaque lease, confirm cleanup, and invalidate a lease. It must not expose `resolveSecret(): string`, `getToken(): string`, `getEnvironment(): object`, `getCredentialPath(): string`, `exportCredential()`, `serializeLease()`, `reuseLease()`, or generic callback execution.

## Capability Handoff

`buildCapabilityHandoffMetadata()` models one opaque provider-to-executor handoff with handoff id, lease id, operation id, process policy, environment policy, boundary session, staging target, one-use marker, cleanup-required marker, no-secret-export marker, no generic callback, result classification, and fingerprint.

## Failure Handling

The design fails closed for missing/locked/permission-denied/malformed sources, multiple credentials, production credential, unknown project binding, expired/revoked credential, unknown scope, unproven cleanup, unexpected provider metadata, auth prompt, ambiguous process launch, timeout or uncertain termination, provider version mismatch, operation mismatch, and boundary-session mismatch. It allows no automatic fallback, no automatic retry, and no combining credentials from multiple sources.

## Version Binding

The design binds provider-design version, opaque boundary version, authorization artifact identity, source adapter version, cleanup-policy version, lifecycle-policy version, injection-policy version, environment policy, and secret-slot version. Unknown or newer unreviewed versions block.

## Fingerprints

Deterministic SHA-256 builders cover the source registry, resolution request, resolution result, private lease policy, lifecycle policy, injection policy, cleanup policy, source availability evidence, authentication evidence, handoff metadata, and provider design. Fingerprints never include actual credential values, actual environment values, secret paths, keychain items, raw provider output, sensitive command output, or personal filesystem paths.

## Compatibility

Pure validators check compatibility against the Action 513-514 opaque provider boundary, Action 511-512 execution-boundary contract, Action 509-510 authorization artifact, and Action 507-508 runner operation plan. They preserve the preferred provider, exact source registry, staging target, one credential-required operation, one session, one runner invocation, one operation per lease, no retry, no secret export, cleanup policy, injection policy, zero deployment, zero SQL, and zero mutation.

## Inert Implementation Plan

`buildInertLiveProviderImplementationPlan()` records the future sequence: validate design, validate opaque/execution/authorization compatibility, verify source adapter version, verify structural source availability, create one resolution request, require final live credential-access gate, resolve one private lease, hand off one operation capability, run one read-only Supabase operation in a future action, collect non-secret evidence, clean up, verify cleanup evidence, invalidate lease, and stop without deployment.

The plan contains no credential, no command, no SQL, no deployment, no source access, no provider invocation, no authentication, no process spawn, and no automatic reattempt.

## Implementation Risks

Remaining implementation risks are macOS Keychain adapter design and review, real source availability proof, live authentication-success evidence, source-to-staging binding proof, real private lease lifecycle, cleanup evidence, process-executor dependency, process termination ambiguity, output redaction, TOCTOU immediately before live run, and durable authorization consumption.

## macOS Keychain Adapter Gap

The preferred source is only a reviewed identity in this action. No Keychain API was called, no item was inspected, no label was read, and no adapter was implemented.

## Credential Cleanup Gap

Cleanup is specified but not implemented. Future cleanup must be proven by the provider implementation and executor, not by caller assertion.

## Process-Executor Dependency

Credential injection requires a separately reviewed process executor capable of direct environment construction, timeout handling, prompt detection, process-tree containment, output redaction, and cleanup evidence. No executor was implemented or run in this action.

## Zeroization Limitations

The design explicitly does not claim guaranteed zeroization for JavaScript strings or runtime-managed memory. It permits best-effort mutable buffer cleanup only where practical.

## TOCTOU Risk

Structural availability and static compatibility can become stale before a live run. Future live execution must re-check target binding, source availability, authorization validity, version binding, and cleanup readiness immediately before credential access.

## Durable Consumption Gap

Authorization and readiness artifacts are not consumed in this design action. Durable consumption remains a separate future gate before live credential access.

## Why No Credential Was Accessed

This action added only deterministic TypeScript design builders, validators, fingerprints, static tests, and documentation. It did not inspect `.env.local`, environment values, Keychain, credential files, CI secrets, Supabase auth, provider output, URLs, or auth state. It did not spawn a process, run Git, run Supabase, run version commands, run catalog queries, execute shell for live evidence, execute SQL, connect remotely, deploy, persist leases, consume authorization, consume readiness artifacts, wire API/UI/runtime behavior, or touch Avanza/browser automation.

Decision:

`post_trade_live_ephemeral_staging_supabase_credential_provider_implementation_design_ready_for_static_security_review`

Result status:

`post_trade_live_ephemeral_staging_supabase_credential_provider_implementation_design_added_no_credential_access_no_run`
