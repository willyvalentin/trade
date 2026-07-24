# Post-Trade Opaque Credential-Provider Boundary For First Live Read-Only Staging Preflight

Status: `post_trade_opaque_credential_provider_boundary_first_live_read_only_staging_preflight_added_no_credential_access_no_run`

Decision: `post_trade_opaque_credential_provider_boundary_first_live_read_only_staging_preflight_ready_for_static_security_review`

## Purpose

Action 513 adds the source-controlled opaque credential-provider boundary needed before any future first live read-only staging migration preflight can resolve credentials. This is a structural boundary only. It does not access credentials, authenticate, invoke a live provider, spawn a process, run a preflight, connect to Supabase, or persist handles.

The boundary binds to:

- Authorization artifact id: `post_trade_first_live_read_only_staging_preflight_authorization_001`
- Authorization artifact fingerprint: `447b059a40e04db875e2e29a845a21d04204f5b634df18e26a0ef1aa059144dd`
- Approved staging project ref: `pdvzyuhykomwfqyyztru`
- Explicitly rejected production project ref: `ekdyopdrrkphlrsilyoo`

## Architecture

The implementation is split into two source-controlled modules:

- `lib/post-trade-first-live-read-only-preflight-credential-provider-core.ts`
- `lib/post-trade-first-live-read-only-preflight-credential-provider.ts`

The core module is pure and contains provider registry construction, opaque handle and secret-slot metadata, exact operation-scope derivation, transient injection planning, cleanup planning, non-secret evidence, deterministic fingerprints, and compatibility checks against the reviewed authorization and execution-boundary contracts.

The server-only boundary module uses `import "server-only"` and provides an injectable provider interface boundary. It exposes no default live provider and does not call provider methods during import or construction.

## Preferred Provider Contract

The preferred provider identity is the reviewed Action 511-512 identity:

`reviewed_ephemeral_staging_supabase_cli_credential_provider_v1`

The provider contract requires non-interactive, staging-only, ephemeral, one-boundary-session, one-runner-invocation handling. It requires non-exportable and non-loggable secret handling, disallows source-controlled values, caller-pasted values, browser login, device-code login, and command-line credential arguments, and requires cleanup after operation completion, timeout, or failure.

No actual secret resolution is implemented.

## Rejected Provider Types

The registry explicitly rejects broad or unsafe provider identities/classes including:

- `caller`
- `manual`
- `pasted_token`
- `raw_environment`
- `dotenv`
- `source_control`
- `browser_login`
- `device_code`
- `interactive_login`
- `command_argument`
- `url_embedded_credential`
- `shared_global_credential`
- `production_credential`
- `generic`
- `unknown`

## Opaque Provider Interface

The injectable provider interface models opaque operations only:

- create or validate an opaque handle
- prepare an opaque secret-slot lease
- confirm lease cleanup
- classify provider availability

The public boundary does not automatically invoke these operations. Tests use fixture shapes only, and secret-shaped fixture output is rejected by validation.

## Opaque Credential Handle

The handle is non-secret metadata only. It includes provider identity, provider contract version, execution-boundary contract version, authorization artifact identity and fingerprint, run and operation ids, boundary session id, exact staging target, rejected production target, credential purpose, exact allowed operation identities, opaque secret-slot identity, issue/expiry timestamps, one-session and one-runner markers, non-exportable and non-loggable markers, interactive/browser/argument-injection denial markers, cleanup policy, reuse denial, structural result classification, and deterministic SHA-256 fingerprint.

The handle does not contain a token, key, password, connection string, authorization header, cookie, session token, private key, client secret, credential file, raw environment map, or personal path.

## Secret-Slot Identity

The secret slot is an opaque metadata reference only. It contains the slot id, contract version, provider identity, purpose, exact operation subset, staging target, opaque transient injection classification, export/serialization/logging/fingerprinting prohibitions, command-argument and Git-operation use prohibitions, cleanup requirement, single-operation lease requirement, secret-value-absent marker, and deterministic fingerprint.

It does not contain a real environment variable name, real secret name, credential location, credential value, filesystem path, or external secret identifier.

## Credential-Required Operation Subset

Credential access is restricted to the exact reviewed Supabase read-only operation identities:

- `preflight_supabase_linked_project`
- `preflight_supabase_migration_history`

Credential access is not granted to Git observations, local file readers, local migration inventory, migration-content observation, deployment logic, pure parsers, evidence builders, runtime paths, API paths, or UI paths.

## Environment-Injection Plan

The injection plan is pure metadata. It starts from an empty environment, includes only reviewed fixed non-secret entries, references the opaque secret slot, applies to one exact operation, forbids command-line credential arguments and URL credentials, forbids inherited full environments, forbids Git credential injection, forbids arbitrary environment names/keys, prohibits serialization/logging/fingerprint inclusion, and requires cleanup after completion, timeout, parser failure, prompt detection, or secret detection.

The plan does not contain environment values.

## Cleanup Plan

The cleanup plan requires an exact lease id, exact handle id, exact operation id, cleanup request, cleanup confirmation, provider confirmation identity, secret-slot clearing, environment-reference clearing, no exported/logged/serialized copy, no reusable lease, result classification, and deterministic fingerprint.

Only `cleanup_confirmed` is acceptable after a secret lease has been prepared. Cleanup failure or ambiguity invalidates the boundary session, blocks further credential use, blocks runner readiness, prohibits retry, requires manual review, and prevents authorization reuse.

## Structural Evidence

Credential-boundary evidence binds the authorization identity, run and operation ids, boundary session, handle identity, provider identity, secret-slot identity, staging target, rejected production target, exact operation subset, issue/expiry timestamps, non-exportable and non-loggable markers, no interactive/browser/command-argument auth, single-session and one-runner markers, cleanup requirement, secret-value-absent marker, no credential access, no authentication success claim, no remote reachability claim, structural result classification, and deterministic fingerprint.

Structural readiness means the metadata boundary is internally consistent. It does not mean a credential exists, authentication has succeeded, staging is reachable, Supabase membership is valid, or the runner can execute.

## Compatibility Checks

Authorization compatibility is pure and checks the Action 509-510 authorization artifact identity, fingerprint, run id, operation id, staging project, operation plan shape, exact credential-required subset, one-shot/no-retry posture, and zero deployment/SQL/mutation scope.

Execution-boundary compatibility is pure and checks the reviewed provider identity, secret-slot contract, exact operation subset, and absence of live credential availability claims.

Neither compatibility path accesses the provider, reads a credential, creates a live handle, injects a secret, authenticates, runs the runner, consumes authorization/readiness, or persists anything.

## Secret Rejection And Fingerprinting

Validators reject unknown/missing malformed canonical fields, unsupported nested values, cyclic values, production references outside explicit rejection metadata, broad scopes, rejected providers, secret-shaped keys/values, personal paths, JWT-shaped values, command-line credential patterns, and fingerprint mismatches.

Deterministic SHA-256 builders exist for provider contract identity, opaque credential handle, secret-slot identity, environment-injection plan, cleanup plan, and credential-boundary evidence. Fingerprints bind non-secret metadata only and require exact lowercase 64-character equality.

## Inert Plan

The inert provider-boundary plan records the future sequence:

1. validate provider contract
2. validate authorization compatibility
3. validate execution-boundary compatibility
4. derive exact credential-required operation subset
5. prepare opaque handle request
6. prepare opaque single-operation secret-slot lease request
7. require separate live credential resolution
8. require transient injection for the exact operation
9. require cleanup verification
10. emit non-secret evidence
11. stop without running the preflight

The plan contains no credential, environment value, command, SQL, deployment, mutation, automatic reattempt, provider invocation, or runner enablement.

## Remaining Gaps

- Live credential provider implementation remains unresolved.
- Authentication success remains unverified and must not be inferred from structural readiness.
- Cleanup verification is modeled but not implemented against a live provider.
- TOCTOU remains unresolved until a separate final live-run gate validates immediately before execution.
- Durable authorization/readiness consumption remains blocked.
- Process execution, CLI-version collection, and process-tree termination boundaries remain separate gates.

## Non-Events

No credential was accessed. No secret environment variable, keychain value, OS credential store, CI secret, Supabase token, auth state, URL value, or provider output was read or printed. No live provider was invoked. No process was spawned. No preflight runner was run. No Git command, Supabase command, version command, catalog query, shell command, SQL command, migration deployment, staging connection, production connection, DB/Supabase write, API/UI/runtime wiring, Avanza/browser automation, credential/session/BankID handling, order behavior, settlement retrieval, live trade mutation, or live position mutation occurred.

## Validation

Focused validation completed for the new credential-provider boundary:

- `tests/e2e/post-trade-first-live-read-only-preflight-credential-provider.spec.ts`: 12 passed
- `./node_modules/.bin/tsc --noEmit`: passed

Broader post-trade/static validation remains part of the Action 513 closeout run.

Recommended next action: Action 514 - Perform Static and Security Review of Opaque Credential-Provider Boundary.
