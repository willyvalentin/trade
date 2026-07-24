# Post-Trade Opaque Credential-Provider Boundary Static/Security Review

Status: `post_trade_opaque_credential_provider_boundary_first_live_read_only_staging_preflight_static_security_review_completed_no_credential_access_no_run`

Decision: `post_trade_opaque_credential_provider_boundary_first_live_read_only_staging_preflight_static_security_review_ready_for_live_provider_implementation_design`

## Files Reviewed

- `lib/post-trade-first-live-read-only-preflight-credential-provider-core.ts`
- `lib/post-trade-first-live-read-only-preflight-credential-provider.ts`
- `tests/e2e/post-trade-first-live-read-only-preflight-credential-provider.spec.ts`
- `docs/post-trade-opaque-credential-provider-boundary-first-live-read-only-staging-preflight-no-credential-access-no-run.md`
- `lib/post-trade-first-live-read-only-preflight-execution-boundary-contract.ts`
- `lib/post-trade-first-live-read-only-preflight-authorization-artifact-core.ts`
- `lib/post-trade-read-only-live-staging-migration-preflight-runner-core.ts`

## Architecture Findings

The boundary is source-controlled, deterministic, pure in the core module, and server-only at the exported boundary. The core constructs and validates only non-secret metadata: exact provider registry, opaque credential handle, opaque secret slot, exact credential-required operation subset, transient environment-injection plan, cleanup plan, credential-boundary evidence, compatibility checks, deterministic fingerprints, and inert no-run planning.

The server boundary uses `import "server-only"`, exports no default live provider, and does not invoke injected provider methods on import or construction.

## Structural Versus Live Findings

The review confirms structural readiness is separated from live credential availability. A valid provider contract or boundary decision can only mean the metadata is structurally consistent. It does not claim credential existence, credential validity, authentication success, project membership, staging reachability, command success, actual cleanup completion, or runner readiness.

Default state remains fail-closed: provider not resolved, credential handle not created, credential not accessed, secret not injected, authentication not attempted, runner disabled, deployment disabled, remote mutation false, SQL false, migrations applied zero, and rows created zero.

## Provider Registry Findings

The accepted provider is exact and versioned:

`reviewed_ephemeral_staging_supabase_cli_credential_provider_v1`

The registry rejects caller/manual/pasted-token/raw-environment/dotenv/source-control/browser-login/device-code/interactive-login/command-argument/URL-embedded/shared-global/production/generic/unknown classes. Review hardening added tests for prefix, suffix, and case variants so alias or fuzzy matching cannot pass.

The registry requires staging-only, non-interactive, ephemeral, one-boundary-session, one-runner-invocation behavior, exact operation subset, non-exportable and non-loggable secret handling, cleanup after every operation, and cleanup after timeout or failure.

## Provider Interface Findings

Review found and closed one gap: the injectable provider interface was previously typed but did not have a dedicated exact validator. The core now exports `validateOpaqueCredentialProviderInterface`, which validates only the reviewed provider identity and optional opaque function slots without invoking them.

The validator rejects unknown fields, generic `ready`/`verified`/`authenticated`/`credentialValid`/cleanup self-assertions, runner enablement claims, arbitrary metadata, secret-shaped fields, production references, non-function method slots, unsupported metadata, and cyclic metadata. It does not call provider methods.

## Handle Findings

The opaque handle binds provider identity, provider contract version, credential-boundary contract version, authorization id and fingerprint, run id, operation id, boundary session, staging project, rejected production project, credential purpose, exact operations, secret-slot identity, issue/expiry timestamps, revocation state, single-session marker, single-runner marker, non-exportable marker, non-loggable marker, interactive/browser/command-argument denial markers, environment policy, cleanup policy, reuse denial, result state, and deterministic fingerprint.

Review hardening added explicit detection for credential-like opaque handle ids, including JWT-shaped and base64-like identifiers that are not canonical metadata fingerprints.

## Secret-Slot Findings

The secret slot remains purely opaque. It contains no actual environment-variable name, real secret name, token name, credential location, filesystem path, keychain item, file descriptor, process argument, value hint, or hash of the actual secret.

Tests now cover secret-slot attempts to add environment variable names, secret names, keychain-like paths, credential file paths, file descriptors, serialization/logging/fingerprinting changes, Git use, missing cleanup, and multiple-operation scope.

## Operation-Subset Findings

The exact credential-required operation subset remains:

- `preflight_supabase_linked_project`
- `preflight_supabase_migration_history`

No Git, local file, migration-content, inventory, catalog, wildcard, command-family, or unreviewed Supabase operation is included. Tests now cover altered identities, correct-count mismatches, duplicate identities, missing identities, and extra unrelated operations.

## Environment-Injection Findings

The injection plan starts from an empty environment, includes fixed non-secret entry ids only, references one opaque secret slot, applies to one exact operation, and forbids command-line credential arguments, URL credentials, inherited environments, Git injection, arbitrary environment names/keys, serialization, logging, fingerprint inclusion, and reuse after ambiguity.

Review tests now reject raw environment values, real environment names, multi-operation plans, inherited environments, Git injection, URL injection, command-line injection, and missing cleanup requirements.

## Cleanup Findings

Only `cleanup_confirmed` is structurally valid after a prepared lease. Cleanup failure, ambiguity, not-attempted, or not-required states block readiness, invalidate the session, block further credential use, block runner readiness, prohibit retry, require manual review, and prevent authorization reuse.

Review tests now reject wrong lease, wrong handle, wrong operation, wrong provider confirmation, stale cleanup timestamp, future cleanup timestamp, uncleared slot, uncleared environment reference, exported copy, logged copy, serialized copy, and reusable lease.

## Evidence Findings

Credential evidence contains only non-secret metadata and binds authorization, run and operation, boundary session, handle, provider, slot, staging project, rejected production project, exact operation subset, timestamps, non-exportable/non-loggable markers, no interactive/browser/command-argument auth, single session, one runner invocation, cleanup requirement, secret absent, credential access false, authentication success false, remote reachability false, result classification, and fingerprint.

Tests reject generic readiness/authentication/verification booleans, credential-valid self-assertions, secret fields, operation-subset mismatches, cleanup-policy mismatches, authentication claims, and reachability claims.

## Fingerprint Findings

SHA-256 fingerprint builders use stable serialization with canonical key order and array order preserved. Exact lowercase 64-character equality is required. Prefix, partial, malformed, unsupported, cyclic, and production-reference inputs are rejected.

Review confirms fingerprints bind critical non-secret fields and do not include secret values, real environment names, raw provider output, or personal paths.

## Compatibility Findings

Authorization compatibility preserves the exact Action 509-510 authorization id, fingerprint, run id, operation id, staging target, exact credential-required subset, one-shot/no-retry posture, read-only posture, and zero deployment/SQL/mutation scope. It does not invoke a provider, create a live handle, create a live lease, access credentials, authenticate, run the runner, consume authorization, or persist state.

Execution-boundary compatibility preserves the reviewed provider identity, secret-slot policy, operation subset, and live-verification false state. Any mismatch fails closed.

## Secret-Scanning Findings

Recursive scanning rejects access/refresh tokens, service-role and anon keys, API keys, passwords, connection strings, PostgreSQL URLs, authorization bearer headers, cookies, session-token shaped fields, private keys, client secrets, credential files, keychain-like paths, raw environments, BankID markers, JWT-like values, personal home paths, unsupported nested values, and cycles.

Review hardening keeps canonical non-secret labels and fingerprints from false-positive blocking while still rejecting actual secret-shaped keys and values.

## Fixture And Dependency Boundary Findings

Fixtures are opaque only and are never used as live defaults. Construction of the server boundary records provider injection metadata only and never calls the provider. Fixture outputs with secret fields or unknown fields fail validation.

The reviewed core and boundary do not import or invoke environment readers, credential readers, keychain APIs, Supabase clients, authentication libraries, child-process APIs, shell libraries, Git commands, catalog adapters, SQL clients, deployment modules, API routes, UI/client code, Avanza code, or browser automation.

## Tests Added Or Strengthened

The focused credential-provider suite was expanded from 12 to 13 tests with additional adversarial coverage for:

- exact provider identity and rejected aliases
- provider-interface exact validation
- provider self-assertion rejection
- generic ready/authenticated/verified rejection
- handle secret-like id rejection
- slot leak attempts
- environment leak attempts
- cleanup mismatch and stale/future evidence
- evidence self-assertion and secret-field rejection
- operation-scope broadening
- source dependency boundaries

## Changes Made During Review

- Added `validateOpaqueCredentialProviderInterface`.
- Exported the interface validator through the server-only boundary.
- Added explicit credential-like opaque handle id detection.
- Expanded adversarial tests around registry, interface, handle, slot, environment, cleanup, evidence, fingerprint, and dependency boundaries.

## Remaining Risks

- No live credential-provider implementation exists.
- No authentication-success evidence exists.
- No real secret-slot lease exists.
- No real cleanup verification exists.
- No process executor or process-tree termination implementation exists.
- No live CLI-version evidence collector exists.
- TOCTOU remains unresolved until a final live-run gate checks state immediately before execution.
- Durable authorization/readiness consumption remains blocked.
- Service credential scope must be proven live in a separate gate.

## Conclusion

The opaque credential-provider boundary is ready for a separate live provider implementation design. It is not ready for live credential access or preflight execution.

No credential was accessed. No secret environment value, keychain value, credential file, CI secret, Supabase token, provider output, or URL value was read or printed. No provider was called live. No process was spawned. No Git, Supabase, version, catalog, shell, SQL, deployment, migration, staging, or production operation occurred. No API/UI/runtime/Avanza/browser path was wired or activated.

Recommended next action: Action 515 - Design Live Ephemeral Staging Supabase Credential Provider Implementation, Without Accessing Credentials.
