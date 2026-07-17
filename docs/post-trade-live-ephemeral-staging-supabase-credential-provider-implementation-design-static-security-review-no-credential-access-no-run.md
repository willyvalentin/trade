# Post-Trade Live Ephemeral Staging Supabase Credential Provider Design Static/Security Review - No Credential Access, No Run

## Purpose

Action 516 performed a static/security review of the Action 515 live ephemeral staging Supabase credential-provider implementation design. The review remained design-only and did not access credentials, inspect `.env.local`, read environment values, access Keychain, inspect credential files or CI secrets, inspect Supabase authentication state, implement a live adapter, authenticate, spawn processes, run Git, run Supabase, run version commands, run catalog queries, execute SQL, connect remotely, deploy, persist leases, consume authorization, or wire API/UI/runtime behavior.

## Files Reviewed

- `lib/post-trade-live-ephemeral-staging-supabase-credential-provider-design.ts`
- `tests/e2e/post-trade-live-ephemeral-staging-supabase-credential-provider-design.spec.ts`
- `docs/post-trade-live-ephemeral-staging-supabase-credential-provider-implementation-design-no-credential-access-no-run.md`
- Action 513-514 opaque credential-provider boundary modules and tests
- Action 511-512 execution-boundary contract
- Action 509-510 authorization artifact
- Action 507-508 runner operation plan

## Design Architecture Findings

The design is deterministic, pure, source-controlled, side-effect free, staging-only, non-interactive, one-operation-per-lease, one-session, no-retry, fail-closed, strict about exact object shape, strict about project binding, strict about operation scope, and unable to access or expose a credential.

The design cannot authenticate, spawn a process, run commands, persist leases, enable runner execution, authorize deployment, claim memory zeroization, treat source availability as credential validity, or treat command acceptance as token validity.

## Structural Versus Live Findings

The review confirmed the design separates structural contract validity from live properties:

- structural source availability is not credential existence
- credential resolution metadata is not credential validity
- authentication evidence is not project membership proof
- command acceptance is not token validity
- cleanup procedure design is not actual cleanup completion
- reference dropping is not memory zeroization
- compatibility is not live-provider readiness

No structurally valid object implies that a credential exists, works, is scoped correctly, or has been cleaned from memory.

## Source-Option Findings

Unsafe options remain rejected: raw environment, process environment, dotenv, source control, pasted token, command argument, URL-embedded credential, browser auth, device-code auth, interactive login, shared/global credential, production credential, generic source, unknown source, unreviewed CI secret, unproven existing CLI context, credential helper, GUI auth, URL opener, MFA prompt, credential prompt, token prompt, project-link prompt, and confirmation prompt.

The existing authenticated Supabase CLI context remains insufficient unless a future implementation separately proves exact staging binding, non-interactive behavior, credential scope, no production access, expiration/revocation posture, no secret disclosure, cleanup, and session isolation.

## Preferred-Source Findings

The preferred first-local-run source remains `reviewed_macos_keychain_ephemeral_staging_supabase_source_v1`, representing a separately reviewed macOS Keychain or OS credential-provider adapter. The review confirmed it is not a generic Keychain lookup, not caller-selected, not account-name exposed, not item-name exposed, not production-capable, and not a fallback chain.

Any Keychain prompt, UI, permission dialog, GUI launch, URL opener, or interactive unlock requirement must be classified as blocked or ambiguous in the future adapter.

## Source-Registry Findings

The source registry is exact and versioned. It has one preferred source identity and separates macOS Keychain, OS adapter, and CI adapter identities instead of treating them as aliases. Prefix/suffix/case variants, generic sources, caller-defined sources, arbitrary metadata, production sources, and environment override behavior are rejected.

Review hardening expanded rejected source identities for process environment, generic/caller-selected Keychain, caller-selected OS credential, unreviewed CI secret, unproven CLI authenticated context, credential helper, GUI auth, URL opener, MFA prompt, credential prompt, token prompt, project-link prompt, confirmation prompt, and globally shared credential.

## Resolution-Request Findings

The request binds exact provider, exact source, provider-design version, opaque-boundary version, authorization artifact and fingerprint, run id, operation id, boundary session, target staging project, rejected production project, exact purpose, one allowed operation, exact secret slot, issue/expiry timestamps, one operation, one session, non-interactive operation, no browser, no device code, no command argument, no serialization, no logging, cleanup required, and no retry.

The tests reject multiple operations, wildcard operation, broad family scope, Git operation, local operation, catalog operation, unreviewed Supabase operation, production project, alternate project, caller-selected slot, stale request, future request, excessive validity, interactive auth, and retry.

## Resolution-Result Findings

The public result remains opaque and contains request id, lease id, handle id, source identity, project, timestamps, revocation classification, lease state, single-use classification, source binding, result classification, and non-secret fingerprint. It cannot contain a token, key, password, token hash, token metadata, Keychain item, account name, environment name, secret path, process environment, raw source output, or authentication success claim.

## Private-Lease Findings

The lease policy remains non-serializable, non-loggable, non-persistent, non-cacheable, one-operation, one-session, one-project, short-lived, invalid after first use, invalid after timeout, invalid after parser failure, invalid after prompt detection, invalid after secret detection, invalid after authentication rejection, invalid after cleanup ambiguity, and invalid after process ambiguity.

Review hardening added explicit `invalidAfterSecretDetection`, `invalidAfterAuthenticationRejection`, `noSecondLeaseFromResolutionResult`, and `retryAllowed: false` markers.

These are design requirements only. TypeScript cannot enforce actual private memory handling, actual non-cloneability, process API copy behavior, or cleanup completion.

## JavaScript Memory Findings

The design correctly states that JavaScript strings may create immutable copies, garbage collection timing is nondeterministic, runtime or process APIs may create hidden copies, and zeroization cannot be guaranteed. Future mitigation must minimize lifetime and copies, keep secrets private, avoid string conversion where practical, use mutable private buffers only where supported, overwrite buffers where practical, drop references immediately, isolate provider and executor, and terminate the session after ambiguity.

Markers such as `zeroized: true`, `memoryCleared: true`, or `allCopiesRemoved: true` are not accepted as proof.

## Injection Findings

Injection remains limited to one exact approved Supabase read-only operation, one process invocation, one boundary session, staging only, exact secret-slot policy, reviewed process executor, and direct process-environment handoff. Shell, argument, URL, stdin, config-file, inherited environment, Git, catalog, production, second use, and retry paths are rejected.

Direct environment injection remains a future implementation decision that must be reviewed with the process executor. No actual secret environment variable name was added.

## Authentication Findings

The design blocks missing authentication, invalid authentication, browser login, device-code flow, credential prompt, token prompt, MFA, project-link prompt, confirmation prompt, credential helper, GUI launch, and URL opener. There is no fallback provider, no interactive recovery, and no same-authorization retry.

Cleanup remains required after any attempted lease use, including failed authentication.

## Authentication-Evidence Findings

Authentication evidence reports only non-secret observed process behavior. It does not claim token validity, account ownership, production denial, correct project membership, uncompromised credential state, or cryptographic scope proof.

Only reviewed non-interactive acceptance can contribute to later evidence, and exact project verification must remain independently required.

## Lifecycle Findings

The lifecycle model keeps the smallest safe state set and rejects rollback, second-use, direct cleanup shortcut, retry after failure, reuse after ambiguity, expired-to-resolved, revoked-to-resolved, invalid-to-usable, in-use-to-in-use, and cleanup-confirmed-to-usable transitions.

Review hardening expanded explicit rejected transitions and allowed terminal failure transitions from `in_use` into expired, revoked, and invalid.

## Cleanup Findings

Cleanup is mandatory after success, authentication rejection, missing auth, timeout, output overflow, parser error, prompt detection, secret detection, unexpected child process, uncertain process termination, and provider failure after lease allocation. Cleanup evidence can prove only reviewed procedure completion, not memory zeroization.

Cleanup failure or ambiguity blocks further operations, invalidates the session, prevents reuse, prevents retry, requires manual review, and must preserve no secret material in diagnostics.

## Source-Availability Findings

Availability evidence exposes no Keychain item, account name, service name, username, environment name, secret length, token metadata, path, machine identifier, or raw source output. Structural availability does not imply credential validity, authentication acceptance, project access, source unlocked state, or continued availability at use time.

## Provider-Interface Findings

The future public provider interface is limited to structural availability inspection, one opaque lease request, cleanup confirmation, and lease invalidation. Secret getters, environment getters, credential paths, serializers, reuse methods, generic callbacks receiving secrets or environment maps, arbitrary operation execution, and generic credential source selection remain rejected.

## Capability-Handoff Findings

The handoff binds one handoff id, one lease, one operation, one process policy, one environment policy, one boundary session, one staging project, one-use, cleanup-required, no export, and non-secret classification. It does not expose arbitrary callbacks, arbitrary executors, arbitrary commands, multiple operations, secrets, environment maps, retry, or production targets.

## Failure-Handling Findings

The design fails closed for absent source, locked source, permission denial, malformed source response, multiple credentials, production credential, unknown project binding, expired/revoked credential, unknown scope, cleanup uncertainty, prompt required, process-start ambiguity, timeout, uncertain termination, version mismatch, operation mismatch, and session mismatch.

There is no automatic source fallback, credential combination, retry, or continuation after ambiguity.

## Version-Binding Findings

The design binds provider-design version, opaque-boundary version, authorization artifact, source-adapter version, cleanup-policy version, lifecycle-policy version, injection-policy version, environment policy, and secret-slot version. Unknown or newer unreviewed versions block.

The process-executor contract remains a dependency for a future action.

## Fingerprint Findings

Deterministic SHA-256 builders cover source registry, resolution request, opaque result, lease policy, lifecycle policy, injection policy, cleanup policy, availability evidence, authentication evidence, handoff metadata, and provider design.

Fingerprints do not include actual credentials, environment values, secret paths, Keychain items, raw provider output, sensitive command output, or personal filesystem paths. Critical non-secret changes invalidate the relevant fingerprint, and malformed/partial fingerprints are rejected.

## Compatibility Findings

Compatibility validators preserve Action 513-514 opaque boundary identity, Action 511-512 execution boundary, Action 509-510 authorization, and Action 507-508 runner constraints. Provider identity, source registry, staging target, rejected production target, operation subset, one session, one runner invocation, one operation per lease, no retry, no export, cleanup, injection, zero deployment, zero SQL, and zero mutation remain exact.

No compatibility function accesses a source adapter, credential, process API, environment, command, or remote system.

## Secret-Material Findings

Recursive validation rejects secret-shaped fields and unknown metadata including access token, refresh token, service-role key, anon key, API key, password, connection string, PostgreSQL URL, authorization header, bearer token, cookie, session, private key, client secret, credential file, Keychain metadata, raw environment, BankID, JWT-like values, personal paths, and username-specific paths.

Rejected material is represented only as boolean invalidation in tests and never printed as a secret value.

## Tests Added Or Strengthened

The provider-design suite was strengthened for:

- expanded rejected source classes
- generic/caller-selected Keychain and OS credential source rejection
- unproven CLI authenticated context rejection
- prompt/helper/GUI/URL-opener rejection
- wildcard, broad family, local, catalog, alternate project, and caller-selected slot request rejection
- token metadata, token hash, Keychain item, account, path, and raw source output rejection
- auth account-ownership and production-denial claim rejection
- secret-detection/auth-rejection lease invalidation
- second lease and retry rejection
- zeroized/all-copies-removed marker rejection
- shell, config-file, catalog, and production injection rejection
- expanded lifecycle rollback/reuse rejection
- source registry, handoff export, and compatibility mutation rejection

## Changes Made During Review

- Expanded rejected source identities in the source registry.
- Added explicit private lease invalidation markers for secret detection and authentication rejection.
- Added explicit no-second-lease and no-retry markers to the private lease policy.
- Expanded lifecycle terminal/failure transitions and rejected rollback/reuse transitions.
- Expanded injection validator checks for shell, config file, catalog, and production paths.
- Renamed the canonical rejected password-prompt label to `credential_prompt` to avoid storing a secret-shaped string in canonical design metadata.
- Added the Action 516 static/security review checkpoint.

## Remaining Risks

Remaining risks are actual Keychain/OS/CI adapter implementation, process-executor contract and implementation, CLI-version evidence collector, live source availability proof, authentication-success evidence, exact project membership proof, real lease lifecycle, cleanup evidence, process-tree containment, output redaction, TOCTOU before live access, durable authorization consumption, and final live-run approval.

## Gaps

- Actual Keychain adapter gap: no Keychain API or adapter exists.
- Process-executor dependency: credential injection cannot be reviewed in isolation from the executor.
- Environment-slot implementation gap: no secret environment variable name or child-process injection has been implemented.
- Authentication evidence gap: no live auth evidence exists.
- Cleanup implementation gap: cleanup remains procedural design only.
- Zeroization limitation: JavaScript memory zeroization cannot be guaranteed.
- TOCTOU risk: all structural evidence can become stale before a live run.
- Durable-consumption gap: authorization/readiness consumption remains separate.

## Recommended Next Implementation Order

Prefer this order before any credential access:

1. Action 517 - implement read-only CLI-version evidence collector contract and fixture boundary without running version commands.
2. Design and review the read-only process executor and process-termination boundary.
3. Implement and review the live source adapter.
4. Add a final credential-access gate only after version and process boundaries are reviewed.

## Readiness

The design is ready for a separate live source-adapter implementation design only after process/version boundaries are advanced as recommended. It is not approval to access credentials.

## Explicit No-Access Confirmation

No credential or source was accessed. No `.env.local` value, environment secret, Keychain item, credential file, CI secret, Supabase auth state, provider output, URL value, token, cookie, session, or auth state was read or printed. No provider was invoked. No process was spawned. No Git, Supabase, version, catalog, shell, SQL, remote, deployment, database, readiness-consumption, authorization-consumption, API/UI/runtime, Avanza, browser, order, settlement, live trade, or live position operation occurred.

Decision:

`post_trade_live_ephemeral_staging_supabase_credential_provider_implementation_design_static_security_review_ready_for_deferred_live_source_adapter_after_process_and_version_boundaries`

Result status:

`post_trade_live_ephemeral_staging_supabase_credential_provider_implementation_design_static_security_review_completed_no_credential_access_no_run`
