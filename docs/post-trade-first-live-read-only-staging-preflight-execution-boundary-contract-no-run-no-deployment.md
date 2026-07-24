# Post-Trade First Live Read-Only Staging Preflight Execution Boundary Contract

Action 511 added the pure, source-controlled execution-boundary contract required before any future first live read-only staging preflight run. The contract is design-only and evidence-shape-only: it did not run the preflight runner, execute Git, execute Supabase, execute version commands, spawn processes, read credentials, inspect env secret values, connect to staging or production, inspect remote state, execute SQL, deploy migrations, persist evidence, consume authorization, or activate API/UI/runtime paths.

## Files Added

- `lib/post-trade-first-live-read-only-preflight-execution-boundary-contract.ts`
- `tests/e2e/post-trade-first-live-read-only-preflight-execution-boundary-contract.spec.ts`
- `docs/post-trade-first-live-read-only-staging-preflight-execution-boundary-contract-no-run-no-deployment.md`

## Purpose

The contract closes the design gap identified after Action 510 by modeling three live-run boundaries without implementing execution:

- credential boundary
- CLI and parser-version compatibility boundary
- process execution, timeout, and termination boundary

It composes those boundaries with the reviewed first-live authorization artifact and returns a combined readiness decision that remains no-run and no-deployment.

## Credential Boundary

The contract recommends a versioned opaque provider model:

`reviewed_ephemeral_staging_supabase_cli_credential_provider_v1`

The evidence model uses an opaque credential handle rather than credential values. It allows only non-secret metadata:

- credential handle id
- provider identity
- credential purpose
- exact allowed Supabase operation identities
- staging project binding
- rejected production project binding
- issued/expiry timestamps
- revoked marker
- single-session marker
- non-exportable and non-loggable markers
- environment-injection policy identity
- cleanup requirement identity

The model rejects caller/manual/pasted/raw/dotenv/command-argument/source-control/browser/interactive/unknown provider identities. It rejects token, key, password, connection string, authorization header, cookie, session token, private key, client secret, raw environment, personal path, production target, broad operation scope, broad environment passthrough, missing cleanup, exportable credentials, loggable credentials, interactive auth, browser login, device-code auth, prompts, expired evidence, revoked evidence, and multiple sessions.

No credential value is represented, fingerprinted, stored, logged, returned, or read.

## Environment Injection Policy

The future environment model starts from an empty environment and allows only reviewed fixed non-secret entries plus opaque secret injection for the exact Supabase read-only operations that require it. It explicitly blocks arbitrary environment inheritance, Git credential injection, secret serialization, secret fingerprinting, and caller-controlled credential propagation.

The canonical evidence classifies:

- `NO_COLOR` as fixed non-secret
- `PAGER` as absent
- `reviewed_staging_supabase_cli_secret_slot` as opaque secret injection
- `GIT_ASKPASS` as absent

This is a contract only. It does not inspect `.env.local` and does not read or print env values.

## CLI-Version Boundary

The contract defines an exact conservative version policy for:

- Git
- Supabase CLI
- runner collector
- parser registry
- catalog adapter
- normalization policy
- command registry

Version evidence must be authoritative, complete, read-only, untruncated, non-interactive, single-line where applicable, non-prerelease, and bound to exact parser identities and direct executable identities. The contract rejects unknown, stale, malformed, ambiguous, newer-unreviewed, older-unsupported, prerelease, warning-banner, truncated, wrapper, alias, caller-selected path, parser mismatch, collector mismatch, command-registry mismatch, and catalog-adapter mismatch evidence.

No version commands were run.

## Process-Execution Boundary

The process policy is direct, bounded, no-shell, no-stdin, no-TTY, non-detached, single-run, single-session, and no-retry. It requires process-tree containment and bounded cleanup. It models per-operation timeout, stdout byte limit, and stderr byte limit maps from the reviewed runner plan.

The policy rejects:

- shell execution
- stdin
- TTY
- detached execution
- missing process-tree containment
- caller-raised timeout or output limits
- automatic retry
- multiple runner invocations
- multiple collection sessions
- deployment, SQL, or mutation scope
- browser launch
- external auth subprocesses
- credential-helper subprocesses

The process-result evidence model records only fingerprints and metadata. It rejects timeouts, unconfirmed termination, unconfirmed process-tree termination, unexpected/detached/surviving child processes, browser children, credential-helper children, daemonization, background children, prompts, GUI launch, URL openers, output overflow, truncation, secret detection, and raw stdout/stderr presence.

The process policy also binds explicit allowed and rejected lifecycle transitions. Exited, terminated, timed-out, ambiguous, failed, prompted, or overflowed evidence cannot transition back to a ready/completed state inside the same authorization.

## macOS And Termination Considerations

The process policy includes a platform note:

`macos_process_tree_containment_requires_future_implementation_validation`

This preserves the remaining risk that macOS process-tree containment must be proven by a future implementation and review before any live run.

## Boundary Session

The boundary session binds one authorization artifact, one credential handle, one version evidence set, one process policy, one process-result evidence envelope, the reviewed runner identity/version, the collector version, the exact staging project `pdvzyuhykomwfqyyztru`, and the rejected production project `ekdyopdrrkphlrsilyoo`.

The session is short-lived and fingerprinted. Mixed sessions, stale sessions, future sessions, production targets, alternate staging targets, run mismatches, operation mismatches, one-shot mismatches, retry mismatches, and nonzero deployment/SQL/mutation counts fail closed.

## Combined Readiness Decision

The canonical readiness input maps to:

`ready_for_first_live_read_only_preflight_gate`

Even on the ready path, the returned decision keeps:

- `runnerExecutionEnabled: false`
- `preflightRunStatus: not_run`
- `deploymentEnabled: false`
- `deploymentStatus: not_deployed`
- `remoteMutation: false`
- `gitMutation: false`
- `sqlExecuted: false`
- `migrationsApplied: 0`
- `rowsCreated: 0`
- `recommendsSeparateFinalLiveRunGate: true`

Readiness means only that the source-controlled boundary contract can be statically reviewed next. It is not authorization to run.

## Authorization Compatibility

The contract validates compatibility with the Action 509-510 first-live authorization artifact:

- artifact id
- run id
- operation id
- exact staging project
- rejected production project
- one-shot requirement
- no automatic retry
- one runner invocation
- one collection session
- zero deployment operations
- zero SQL operations
- zero mutation operations

The Action 510 canonical artifact fingerprint remains:

`447b059a40e04db875e2e29a845a21d04204f5b634df18e26a0ef1aa059144dd`

## Fingerprinting

The contract uses deterministic SHA-256 fingerprints over stable sorted serialization for credential evidence, version evidence sets, process policy, boundary session, and combined readiness input. It rejects malformed, partial, prefix, mismatched, or unknown-algorithm fingerprints, cyclic values, unsupported nested values, empty critical strings, malformed counts, credential material, and unexpected production references.

Fingerprints intentionally do not include credential values, env secret values, raw command output, database URLs, connection strings, or personal paths.

## Inert Future Plan

`buildInertFutureExecutionBoundaryPlan()` returns only named future validation steps. It contains no command strings, credentials, SQL, deployment action, retry path, runner execution enablement, executable callback, or mutation capability.

## Static Test Coverage

The new focused suite covers:

- canonical readiness while execution remains disabled
- opaque credential requirements and exact Supabase-only operation scope
- credential evidence without secret material
- rejection of secret material, unsafe providers, broad scope, production target, and unsafe lifecycle flags
- strict CLI/version evidence policy
- strict process policy and process-result evidence
- boundary session and authorization compatibility
- production-reference, unsupported-value, cyclic-input, and fingerprint rejection
- deterministic fingerprints
- side-effect-free validation/planning
- source scans for no env reads, no process spawning, no commands, no Supabase writes, no API/UI wiring

## Remaining Risks

- The credential provider is recommended, not implemented.
- Live CLI version collection is not implemented or run.
- Process spawning, timeout enforcement, cancellation, and process-tree containment are not implemented.
- macOS process-tree behavior still requires implementation validation.
- TOCTOU remains unresolved between future boundary checks and any live runner execution.
- Durable authorization consumption remains unresolved.
- A separate final live-run gate is still required before any runner execution.

## Non-Execution Confirmation

No preflight runner was run. No Git command, Supabase command, version command, shell command, catalog query, SQL command, staging connection, production connection, remote-state inspection, migration deployment, Git mutation, schema mutation, data mutation, child-process creation, credential access, env secret read, evidence persistence, authorization consumption, readiness artifact consumption, API/UI/runtime activation, Avanza/browser automation, credential/session/BankID handling, order behavior, settlement retrieval, live trade mutation, or live position mutation occurred.

## Decision

`post_trade_first_live_read_only_staging_preflight_execution_boundary_contract_ready_for_static_security_review`

Result:

`post_trade_first_live_read_only_staging_preflight_execution_boundary_contract_added_no_run_no_deployment`
