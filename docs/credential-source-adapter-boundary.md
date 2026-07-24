# Credential Source Adapter Boundary

## Purpose

Action 531 adds a deterministic, fixture-only, server-only credential source adapter boundary for the future first live read-only staging preflight. It models credential-source decisions without reading credentials, reading environment values, accessing Keychain, reading files, invoking credential helpers, issuing leases, delivering secrets, consuming authorization, spawning processes, or enabling runner behavior.

## Identity

Exact fixture identity:

`ture.execution.credential-source-adapter-boundary.fixture.v1`

- adapter kind: `credential_source_adapter_boundary`
- platform: `macos`
- implementation mode: `fixture_only`
- secret material mode: `forbidden`
- source model: `injected_fixture_metadata`
- policy version: `1`

A future live credential source must use a separate exact identity and a separate review gate.

## Policies

Exact current no-credential policy:

`first_live_read_only_no_credentials_required_v1`

Exact future reference policy:

`future_scoped_keychain_credential_reference_fixture_v1`

The current policy confirms that the first live read-only version collection operations require no credentials. The future policy models opaque Keychain reference metadata only. It does not authorize lookup, lease issuance, secret delivery, helper invocation, persistence, logging, cleanup proof, revocation proof, process start, or preflight runner activation.

## Current Operations

| Operation | Credential purpose | Credential required |
| --- | --- | --- |
| `collect_git_version` | `no_credential_required` | false |
| `collect_supabase_cli_version` | `no_credential_required` | false |

Any credential source other than `none` is incompatible with the current operations.

## Capability Boundary

The boundary defines distinct runtime-provenance-checked fixture artifacts:

- credential session capability;
- fixture no-credential requirement capability;
- fixture future credential reference capability;
- fixture authorization link.

They are deeply frozen, fingerprinted, clone resistant, session bound, expiry bound, purpose bound, operation bound where applicable, noninterchangeable, and fixture-only.

## Credential Reference Model

Future credential reference artifacts are metadata-only. They use opaque fingerprints for reference shape and never include enough Keychain identifiers to perform lookup. They do not include service names, account names, labels, access groups, paths, tokens, passwords, API keys, private keys, cookies, sessions, BankID artifacts, authorization headers, or broker documents.

The modeled reference can only state that a future separate review would be required before live credential lookup. It cannot issue a live lease or deliver credential material.

## Delivery Security

All live delivery channels are disabled:

- environment delivery: false
- argv delivery: false
- stdin delivery: false
- filesystem delivery: false
- credential helper delivery: false
- Keychain lookup: false
- network broker delivery: false
- browser session delivery: false
- logging: false
- persistence: false

The boundary exposes no credential reader, secret reader, token reader, password reader, Keychain lookup, environment lookup, file lookup, process start, or preflight runner surface.

## Cleanup And Revocation

For the current no-credential operations, cleanup and revocation are not required because no credential exists. For the future fixture reference policy, cleanup and revocation are modeled as plans only. The fixture cannot prove live cleanup or live revocation.

## Authority And Completeness

Authority is always:

`fixture_structural_only`

Completeness is derived from adapter identity, policy, session capability, source classification, purpose, operation, audience, scope, authorization link, lifetime, cleanup plan, revocation plan, freshness, and session consistency. Complete fixture structure remains nonlive and insufficient for credential access.

## Evidence Guarantees

Fixture result evidence records:

- `fixtureOnly: true`
- `authoritativeLive: false`
- `credentialRequired: false` for current operations
- `credentialProvided: false`
- `secretMaterialPresent: false`
- `tokenMaterialPresent: false`
- `passwordMaterialPresent: false`
- `apiKeyMaterialPresent: false`
- `privateKeyMaterialPresent: false`
- `encodedSecretBlobPresent: false`
- `encryptedSecretBlobPresent: false`
- `keychainAccessed: false`
- `environmentRead: false`
- `credentialFileRead: false`
- `credentialHelperInvoked: false`
- `browserSessionAccessed: false`
- `networkBrokerAccessed: false`
- `credentialLeaseIssued: false`
- `credentialDelivered: false`
- `authorizationConsumed: false`
- `cleanupPerformedLive: false`
- `revocationPerformedLive: false`
- `processStartEnabled: false`
- `preflightRunnerEnabled: false`

## Fingerprints

Deterministic SHA-256 fingerprints use these domains:

- `ture:credential-source-adapter-boundary:identity:v1`
- `ture:credential-source-adapter-boundary:no-credential-policy:v1`
- `ture:credential-source-adapter-boundary:reference-policy:v1`
- `ture:credential-source-adapter-boundary:purpose:v1`
- `ture:credential-source-adapter-boundary:credential-session-capability:v1`
- `ture:credential-source-adapter-boundary:fixture-reference-capability:v1`
- `ture:credential-source-adapter-boundary:no-credential-capability:v1`
- `ture:credential-source-adapter-boundary:no-credential-request:v1`
- `ture:credential-source-adapter-boundary:reference-request:v1`
- `ture:credential-source-adapter-boundary:authorization-link:v1`
- `ture:credential-source-adapter-boundary:fixture-lease:v1`
- `ture:credential-source-adapter-boundary:source-evidence:v1`
- `ture:credential-source-adapter-boundary:cleanup-evidence:v1`
- `ture:credential-source-adapter-boundary:revocation-evidence:v1`
- `ture:credential-source-adapter-boundary:compatibility:v1`
- `ture:credential-source-adapter-boundary:result:v1`

## Compatibility

Compatibility is structural only:

- live read-only macOS process-driver session: bound structurally;
- direct-spawn operations: current version operations require no credentials;
- future Keychain credential reference: modeled as metadata-only and disabled for live lookup;
- process start and preflight runner: not enabled.

## Prohibitions

| Property | Action 531 fixture adapter |
| --- | --- |
| Builds no-credential fixture decision | Yes |
| Models future opaque reference metadata | Yes |
| Reads environment values | No |
| Reads credential files | No |
| Accesses Keychain | No |
| Invokes credential helpers | No |
| Reads tokens/passwords/secrets | No |
| Issues credential lease | No |
| Delivers credential | No |
| Consumes authorization | No |
| Enables process start | No |
| Enables runner | No |

## Future Live Plan

A future live credential source requires separate review for source selection, Keychain query design, opaque reference binding, credential lease lifetime, in-memory delivery, redaction, cleanup, revocation, audit evidence, macOS permissions, process isolation, staging-only execution, and a final live gate.
