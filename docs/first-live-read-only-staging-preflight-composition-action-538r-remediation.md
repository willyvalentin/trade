# Action 538R - Composition Authority and Live-Observation Evidence Remediation

## Summary

Action 538R remediates the Action 538 blockers in the first-live read-only staging preflight composition contract without activating the contract or adding live behavior.

No live resolver was called, no filesystem operation occurred, no executable was run, no CLI version was collected, no process was spawned, no shell was used, no credential or environment value was read, no network request occurred, no API/UI/runner/observer/spawn boundary was activated, no Avanza interaction occurred, no order or position behavior changed, and no deployment occurred.

## A538-H1 Remediation

The composition validator now rejects authority-bearing evidence before it can participate in composition. Evidence-level authority rejection covers:

- `enablesFilesystemAuthority`
- `enablesObserverAuthority`
- `enablesNetworkAccess`
- `enablesSpawnAuthority`
- `enablesRunnerAuthority`
- `enablesCredentialAuthority`
- `enablesExecutionAuthority`
- `enablesCliExecution`
- `enablesAuthorizationConsumption`
- `enablesApiAccess`
- `enablesUiAccess`
- `enablesTradingAuthority`
- `enablesAvanzaAuthority`
- `enablesOrderMutation`
- `enablesPositionMutation`
- `enablesSettlementAuthority`
- `enablesPersistence`
- `enablesDeployment`
- string-valued authority fields such as `filesystemAuthority`, `spawnAuthority`, `runnerAuthority`, and related authority fields when they are not `none`

The validator returns the deterministic reason code `authority_claim_rejected`. True authority flags are rejected; they are not silently stripped or normalized to false.

Action 538W later closed the remaining nested resolver metadata authority bypass with exact resolver metadata schema validation and `resolver_metadata_schema_rejected`.

## A538-H2 Remediation

The pure fixture-only composition contract now rejects resolver evidence that claims live filesystem observation. Resolver evidence is accepted only when `observedLiveFilesystem` is false.

The validator also rejects `server_only_lstat` live-source claims on resolver evidence. It returns the deterministic reason code `live_observation_claim_rejected`.

This preserves the Action 535W/535X provenance boundary: actual live resolver evidence remains uncomposable by this pure contract until a future separately reviewed server-only composition boundary can verify original live resolver provenance in-process. No forgeable boolean, string, hash, signature, token, brand, or serialized marker was introduced.

## A538-M1 Test Coverage

The focused suite was expanded from 8 to 11 tests. Added coverage includes:

- evidence-level filesystem, observer, and network authority rejection using provenance-valid builder outputs
- spawn, runner, credential, execution, CLI execution, authorization-consumption, API/UI, trading, Avanza, order, position, settlement, persistence, and deployment authority rejection
- proof that true authority flags are not silently normalized
- `observedLiveFilesystem: true` rejection
- `server_only_lstat` source-claim rejection
- plain/spread/JSON-cloned live-looking resolver evidence rejection
- canonical path and metadata not being sufficient for live provenance
- synthetic non-live resolver evidence remaining valid
- duplicate evidence rejection
- ambiguous/extra evidence rejection
- wrong evidence order rejection
- wrong identity, version, purpose, tool, platform, and fixture/live-authority confusion rejection

## Contract API Change

Before Action 538R, the contract exported the same fixture builders, composer, validator, lifecycle helper, constants, and types, but validation did not reject every authority-like flag and allowed a pure resolver evidence object to carry `observedLiveFilesystem: true`.

After Action 538R, the export surface remains the same, with two additional blocking reason literals:

- `authority_claim_rejected`
- `live_observation_claim_rejected`

No live adapter import, server-only import, filesystem primitive, process primitive, credential primitive, network primitive, persistence helper, API/UI/runner wiring, or runtime activation was added.

## Fixture Versus Future Live Composition

Current fixture composition:

- pure
- synthetic/non-live resolver evidence only
- `observedLiveFilesystem: false`
- structural testing only
- grants no authority

Future live composition:

- not implemented in Action 538R
- must reside behind a separately reviewed server-only boundary
- must verify original live resolver provenance in-process
- must not rely on serialized or cloned evidence
- must perform immediate pre-spawn revalidation before any future spawn

## Decision

Decision: `post_trade_first_live_read_only_staging_preflight_composition_blockers_remediated_ready_for_re_review`

Result status: `post_trade_first_live_read_only_staging_preflight_composition_action_538r_remediation_completed`

Recommended next action: Action 538V - Independent Re-Review of First-Live Read-Only Staging Preflight Composition Remediation.
