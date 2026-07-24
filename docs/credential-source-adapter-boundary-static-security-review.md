# Credential Source Adapter Boundary Static Security Review

## Executive Summary

Action 532 reviewed the Action 531 credential source adapter boundary under hostile static assumptions. The reviewed boundary is deterministic, fixture-only, server-only at the runtime wrapper, source controlled, secret-free after correction, capability scoped, purpose bound, operation bound, audience bound, scope bound, session bound, expiry bound, clone resistant, runtime immutable, one shot, nonrenewable, delivery isolated, cleanup honest, revocation honest, fail closed, and non-enabling for credential access, process start, runner behavior, API wiring, UI wiring, browser automation, Avanza automation, or live credential authority.

The review found and corrected two implementation defects before approval:

- high: fingerprint validation and exported builder/fingerprint helpers could canonicalize or hash hostile caller input before the new secret-rejection checks ran;
- medium: prohibited-key matching was too exact and did not normalize case, separators, or Keychain service variants.

After correction, regression coverage confirms secret-bearing input is rejected before fingerprinting, errors remain sanitized, and current version operations remain no-credential only.

## Reviewed Worktree State

Reviewed Action 531 implementation files plus Action 532 review additions in a dirty worktree with unrelated existing changes. No `.env.local` values were read or printed.

## Files Reviewed

- `lib/post-trade-credential-source-adapter-boundary-core.ts`
- `lib/post-trade-credential-source-adapter-boundary.ts`
- `tests/e2e/post-trade-credential-source-adapter-boundary.spec.ts`
- `docs/credential-source-adapter-boundary.md`
- `docs/credential-source-adapter-boundary-checkpoint.md`
- `docs/ture-agent-dev-chat-3-continuation-summary.md`

## Architecture Summary

The boundary has a pure core and a server-only wrapper. The pure core exports exact identity, policies, purpose/source/secret classifications, runtime-provenance fixture capabilities, request builders, validators, sanitized evidence, compatibility summaries, deterministic SHA-256 fingerprints, and an inert future live plan. The server wrapper uses `import "server-only"` and exposes no live credential reader or default ambient singleton.

## Trust-Boundary Map

- Caller input enters only through fixture builders, validators, classifiers, or adapter evaluation methods.
- Builders now reject secret-bearing raw input before fingerprinting.
- Validators check fingerprint shape first, reject unsafe values/unknown secret keys, then verify fingerprint match.
- Capability provenance uses module-private `WeakSet` stores.
- Evidence is internally emitted with literal false live-access flags.
- Compatibility is informational and cannot enable credential access, process start, runner, API, or UI behavior.

## Export Inventory

Review covered 68 exported surfaces:

- 5 constants;
- 35 type exports;
- 28 runtime functions.

Caller-input runtime exports were reviewed for secret exposure and authority impact. The exports that can hash, construct capability metadata, classify secret presence, validate requests, or emit evidence are covered by Action 532 regression tests.

## Dependency Review

Production imports are limited to:

- `node:crypto` for deterministic SHA-256;
- direct-spawn operation type only;
- the static macOS process-driver boundary session constant.

No production implementation imports or calls Keychain libraries, `security`, AppleScript, filesystem APIs, environment APIs, credential helpers, browser/session storage, network clients, Supabase clients, process spawning APIs, observer APIs, API routes, UI code, telemetry, or persistence adapters.

## Identity Review

Exact identity confirmed:

`ture.execution.credential-source-adapter-boundary.fixture.v1`

Fields confirmed:

- `adapterKind: credential_source_adapter_boundary`
- `platform: macos`
- `implementationMode: fixture_only`
- `secretMaterialMode: forbidden`
- `sourceModel: injected_fixture_metadata`
- `policyVersion: 1`

The identity is deeply frozen and fingerprinted. A future live adapter requires a distinct identity.

## Policy Review

Policies confirmed:

- `first_live_read_only_no_credentials_required_v1`
- `future_scoped_keychain_credential_reference_fixture_v1`

The no-credential policy permits only `none` source and prohibits references, leases, delivery, Keychain, environment, files, helpers, brokers, persistence, logging, retries, credential access, process start, and runner enablement.

The future fixture-reference policy is metadata-only, exact-purpose/exact-audience/exact-scope, nonrenewable, one-shot, session-bound, cleanup-plan-required, revocation-plan-required, and still prohibits live credential access, live lease, delivery, cleanup proof, revocation proof, process start, and runner enablement.

## Purpose And Operation Review

Purposes confirmed:

- `no_credential_required`
- `future_supabase_cli_authentication`
- `future_git_remote_authentication`

Current operations remain strictly bound:

- `collect_git_version` -> `no_credential_required` -> source `none`;
- `collect_supabase_cli_version` -> `no_credential_required` -> source `none`.

Future credential references cannot attach to current version operations.

## Source Classification Review

Source classifications are closed. Only `none` is active for current operations. Unsupported environment, file, helper, browser session, network broker, and unknown sources fail closed. `macos_keychain_reference_fixture` remains future metadata only and cannot access Keychain.

## Capability Provenance Review

Credential-session capability, no-credential capability, fixture credential-reference capability, and fixture authorization link use separate module-private provenance stores. Tests cover plain-object forgery, spread clone, JSON clone, structured clone, cross-type substitution, mutation, cross-session substitution, and expiry rejection.

## Credential-Reference Metadata Review

Fixture references contain only opaque fingerprints for reference identity, audience, and scope. They do not include account, service, credential path, environment key, password, token, API key, private key, cookie, session, BankID artifact, browser data, broker data, or raw audience/scope values. Action 532 added explicit rejection for `keychainService` and related normalized key variants.

## Recursive-Key Review

Recursive prohibited-key scanning is case-normalized, NFKC-normalized, zero-width-stripped, and separator-insensitive for spaces, underscores, and hyphens. It scans nested objects and arrays, handles cycles, bounds depth at 24, bounds nodes at 512, and bounds arrays at 256. Rejected values are not echoed.

## Sensitive-Value Review

Sensitive-value scanning covers bearer forms, JWT-like values, PEM private-key headers and multiline blocks, password/API-key/access-token/refresh-token assignments, URL-embedded credentials, base64/hex secret indicators, long high-entropy-like strings, zero-width bypass attempts, Unicode normalization, and percent-decoded variants. String length is bounded at 512.

## Secret-Before-Hashing Review

Finding A532-HIGH-001 corrected secret-before-hashing risk. Builders now reject secret-bearing input before `freezeWithFingerprint`; exported identity fingerprinting rejects unsafe input before hashing; validators verify only fingerprint shape before secret checks and run fingerprint match after unsafe-value and unknown-field checks. Regression tests assert rejected secret material is not returned, persisted, or fingerprinted into result output.

## Error-Sanitization Review

Validation errors are stable codes and do not serialize rejected input. Builder throws use sanitized error codes such as `credential_source_fixture_input_rejected`. Regression tests cover thrown and structured failures without secret echo.

## Audience Review

Audiences are closed:

- `none`
- `future_supabase_cli_process`
- `future_git_remote_process`

Wildcard, admin, generic, multi-audience, and cross-purpose substitution fail closed.

## Scope Review

Scopes are closed:

- `none`
- `future_supabase_read_only_auth_scope`
- `future_git_remote_read_only_scope`

Wildcard, admin, write, deploy, SQL, browser, trading, and arbitrary scope inputs fail closed through validation or builder rejection.

## Lease Review

No current operation has a credential lease. Future fixture lease metadata is never live, never renewable, never replayable, never transferable, and remains session/purpose/audience/scope/expiry bound. The review does not claim durable replay prevention without persistence.

## Delivery-Channel Review

No credential delivery exists through environment, argv, stdin, filesystem, temporary files, persistent files, clipboard, URL, HTTP header, browser storage, database, log, telemetry, callback, or live in-memory handle.

## Keychain Review

Static searches found only inert schema/review strings such as `accessesKeychain: false`, `canAccessKeychain: false`, and `selectedKeychainApi: "not_selected"`. No Keychain library, `security` CLI, AppleScript, item lookup, item mutation, account/service enumeration, access-control inspection, or entitlement inspection exists.

## Helper Review

No Git credential helper, OAuth helper, password manager, browser credential provider, helper executable, helper command, or helper process observation exists. Unsupported helper source classifications block.

## Authorization Review

Authorization linkage is fixture-only, session bound, purpose bound, operation bound, audience/scope fingerprint bound, policy fingerprint bound, unable to consume authorization, and unable to authorize live credential access.

## Cleanup Review

Cleanup evidence is fixture planning only. `cleanupRequiredLive`, `cleanupAttemptedLive`, `cleanupCompletedLive`, `provesCredentialCleanupLive`, `keychainItemModified`, `keychainItemDeleted`, `credentialFileDeleted`, `environmentCleared`, and `processMemoryVerifiedCleared` remain false.

## Revocation Review

Revocation evidence is fixture planning only. `credentialRevokedLive`, `revocationAttemptedLive`, `provesRevocationLive`, `keychainModified`, and `providerContacted` remain false.

## Authority Review

Reachable authority is fixed to `fixture_structural_only`. Caller authority, valid reference metadata, authorization link, complete evidence, fingerprint match, and compatibility cannot elevate authority.

## Completeness Review

Completeness is derived from validation state, blocking reasons, ambiguity reasons, and purpose. Caller-provided completeness is rejected. Secret material produces `secret_material_detected`; complete fixture evidence remains nonauthoritative.

## Freshness And Session Review

All timestamps are source-controlled/injected constants. No `Date.now`, `new Date`, timers, uptime, performance clock, or randomness exists. Session and expiry are checked across capabilities, requests, and evidence. Expired artifacts fail closed.

## Evidence-Sanitization Review

Evidence contains no secret material, raw credential reference, Keychain lookup identity, account, service, token, password, private key, raw audience/scope, authorization payload, environment key, file path, browser data, or broker/session artifact. False live-access flags are internally emitted literals.

## Fingerprint Review

All 16 fingerprint domains use deterministic SHA-256 with domain separation and lowercase 64-character hex strings. Fingerprints cover identity, policies, purposes, capabilities, requests, authorization links, fixture lease metadata, source evidence, cleanup evidence, revocation evidence, compatibility, and result. Regression tests cover mutation sensitivity for identity, policy, session, purpose, audience, scope, blocking reasons, and false access fields.

## Canonicalization Review

Canonicalization sorts object keys and preserves array order. Cyclic input throws internally and is converted into safe validation failure where applicable. Unsupported functions, symbols, bigints, excessive depth, excessive nodes, excessive arrays, and excessive strings fail closed before hashing for caller-controlled fixture input.

## Compatibility Review

Compatibility with direct-spawn, trusted resolver, process observer, process executor, CLI-version collector, authorization, runner, and credential-cleanup design is structural and non-enabling. It does not infer authenticated operations, credential readiness, process start, runner readiness, cleanup proof, or revocation proof.

## Server-Only Review

The runtime wrapper starts with `import "server-only"`. API route and Trade UI source checks confirm no import/wiring. No default singleton or import-time capability is created.

## Side-Effect Review

No production module performs Keychain access, environment reads, filesystem reads, helper invocation, browser/session access, network access, secret decryption/logging/persistence/hashing, credential delivery, live lease issuance, live cleanup, live revocation, authorization consumption, process spawning, observer invocation, runner invocation, API invocation, UI mutation, telemetry, commit, or deploy.

## Immutability Review

Identity, policies, registries, capabilities, authorization links, requests, evidence, compatibility, results, blocking arrays, and ambiguity arrays are deeply frozen. Regression tests cover mutation and clone resistance.

## Test Review

Reviewed 340 Action 531 tests and added 74 Action 532 security-review regression tests. Coverage includes exact identity, policy registry, current no-credential operations, future reference metadata, dependency absence, server-only wrapper, API/UI non-wiring, provenance, clone resistance, source classification, secret keys, sensitive values, normalized key bypasses, cyclic/oversized input, secret-before-hashing, error redaction, evidence flags, compatibility non-enablement, and docs accuracy.

## Documentation Review

Documentation accurately states fixture-only, metadata-only, no live credential access, no Keychain lookup, no lease issuance, no delivery, no cleanup proof, no revocation proof, no authorization consumption, no process start, and no runner enablement.

## Findings Table

| ID | Severity | Area | Finding | Evidence | Correction | Status |
| --- | --- | --- | --- | --- | --- | --- |
| A532-HIGH-001 | High | Secret-before-hashing | Validators/builders could canonicalize or hash hostile caller input before explicit secret rejection. | `validateFingerprintShape` recomputed expected fingerprints before unsafe-value checks; exported fingerprint/builder helpers accepted runtime-bypassed values. | Split fingerprint shape from fingerprint match, added pre-hash builder/fingerprint rejection, and added regression tests. | Closed |
| A532-MED-001 | Medium | Prohibited-key normalization | Exact key matching missed separator/case variants and `keychainService`. | Review cases for `api-key`, `access_token`, `refresh token`, `keychain_service`. | Added normalized key matching and expanded prohibited keys. | Closed |
| A532-MED-002 | Medium | Sensitive-value bypass | Value scanner did not normalize Unicode or decode percent-encoded secret indicators. | Review cases for zero-width, fullwidth, and percent-encoded forms. | Added NFKC/zero-width normalization and safe percent-decoding before value scanning. | Closed |

No critical findings remain. No high findings remain. No medium findings remain unresolved.

## Corrections Made

- Hardened exported builders and identity fingerprint helper to reject secret-bearing input before hashing.
- Split fingerprint shape validation from fingerprint recomputation so recomputation happens after secret checks.
- Added normalized prohibited-key matching for case, separators, zero-width, and Unicode compatibility forms.
- Added `keychainService` and related secret-bearing lookup metadata to prohibited-key coverage.
- Added normalized and percent-decoded sensitive-value scanning.
- Added 74 Action 532 regression tests.

## Residual Risks

- The scanner is intentionally conservative and not a complete DLP system.
- Future live Keychain or credential-delivery implementation still requires a separate design, implementation, static/security review, and live gate.
- Fixture contracts do not provide durable replay prevention because no persistence is used.

## Mandatory Security Assertions

All 71 mandatory assertions passed after correction. No false or uncertain assertion remains.

## Final Decision

`post_trade_credential_source_adapter_boundary_first_live_staging_preflight_static_security_review_approved`
