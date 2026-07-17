# Post-Trade First Live Read-Only Staging Preflight Execution Boundary Contract Static/Security Review

Action 512 performed a static/security review and hardening pass on the Action 511 execution-boundary contract. Nothing was run. No credentials or env secret values were read. No process was spawned. No Git, Supabase, version, catalog, shell, or SQL command was executed. No staging or production connection, remote-state inspection, migration deployment, evidence persistence, readiness consumption, authorization consumption, API/UI/runtime activation, Avanza/browser automation, or live mutation occurred.

## Reviewed Files

- `lib/post-trade-first-live-read-only-preflight-execution-boundary-contract.ts`
- `tests/e2e/post-trade-first-live-read-only-preflight-execution-boundary-contract.spec.ts`
- `docs/post-trade-first-live-read-only-staging-preflight-execution-boundary-contract-no-run-no-deployment.md`
- `docs/ture-agent-dev-chat-3-continuation-summary.md`

## Review Conclusion

The contract remains deterministic, pure, side-effect free, source controlled, staging-only, read-only, fail-closed, exact-object validated, strict about credential scope, strict about version compatibility, strict about executable identity, strict about process policy, strict about termination evidence, and incapable of reading credentials, reading env secrets, spawning processes, running commands, enabling the runner, enabling deployment, mutating state, persisting evidence, or consuming authorization.

The canonical readiness classification remains:

`ready_for_first_live_read_only_preflight_gate`

That classification means only that the structural contract is ready for the next gate. It does not mean credentials work, authentication succeeded, project access is verified, CLI versions were observed live, process containment is implemented, authorization was consumed, the runner may execute immediately, or deployment is approved.

## Hardening Added During Review

- Replaced the concrete secret env-name example in canonical credential evidence with the opaque slot id `reviewed_staging_supabase_cli_secret_slot`.
- Added explicit version-policy markers for no wildcard major versions, no build-metadata ambiguity, no lexical comparison, no caller-selected range, no environment override, no prerelease acceptance, and initial exact Supabase CLI version requirement.
- Added explicit allowed lifecycle transitions and rejected lifecycle transitions to the process policy.
- Added richer process-tree termination evidence fields: parent exit, direct-child exit, process-group exit, detached-descendant absence, containment authority, verification source, and verification timestamp.
- Hardened process-result classification so parent-only exit, missing child/process-group evidence, unknown detached descendants, or untrusted verification source blocks readiness.
- Expanded adversarial tests for concrete env-name drift, structural-ready/authentication confusion, version-policy drift, lifecycle-transition drift, parent-only termination, process-group uncertainty, wrong containment authority, wrong verification source, invalid timestamps, and personal paths.

## Credential Boundary Findings

The credential handle remains opaque and contains only reviewed non-secret metadata: handle id, provider identity, purpose, exact permitted operation identities, staging project binding, rejected production project, timestamps, revocation state, single-session marker, non-exportable marker, non-loggable marker, injection-policy identity, cleanup requirement, and deterministic fingerprint.

The preferred first local staging model is a narrowly scoped, non-interactive, opaque provider adapter that exposes only a credential handle to this boundary and injects the secret transiently into the exact Supabase read-only operations that require it. The contract does not implement the provider and does not claim an already authenticated CLI context is safe.

Credential access remains limited to the exact Supabase read-only operation identities derived from the reviewed runner plan:

- `preflight_supabase_linked_project`
- `preflight_supabase_migration_history`

Credential access is not modeled for Git commands, local file operations, migration parsing, local inventory, catalog adapters, unrelated Supabase operations, production, arbitrary processes, broad command families, wildcard operations, multiple sessions, multiple runner invocations, or ambiguous termination reuse.

The review confirmed the contract rejects secret-like values and keys, caller/manual/pasted/raw/dotenv/command-argument/source-control/browser/interactive/unknown providers, production or alternate targets, broad scope, Git credential access, unrelated operation scope, exportable/loggable handles, missing cleanup, broad environment passthrough, concrete caller-selected secret env names, generic `ready` assertions, authentication-success claims, and remote-reachability claims.

## Environment Injection Findings

The future environment policy starts from an empty environment and allows only reviewed fixed non-secret entries plus one opaque secret injection slot for exact Supabase read-only operations. It blocks inherited full environments, arbitrary variables, Git credential injection, credential serialization, credential fingerprinting, credential logging, credential material in error messages, and cleanup omission after success, failure, timeout, or ambiguous termination.

No env value was read or printed.

## CLI And Version Findings

The version policy is conservative and exact. It binds Git, Supabase CLI, runner collector, parser registry, catalog adapter, normalization policy, and command registry evidence to a single policy identity. Supabase CLI is initially exact-version required; Git may only move to a narrow reviewed range after separate static review. The contract rejects latest, wildcard, unbounded, prerelease, build-metadata ambiguous, lexical-comparison, malformed, caller-selected, environment-overridden, newer-unreviewed, older-unsupported, wrapper, alias, script-proxy, caller-selected path, parser mismatch, collector mismatch, catalog-adapter mismatch, command-registry mismatch, warning-banner, truncated, and non-authoritative evidence.

Caller-supplied version strings alone are never authoritative.

No version command was run.

## Executable Identity Findings

Executable evidence requires expected basename, reviewed resolved identity, no alias, no shell function, no script proxy, no wrapper, no caller-selected path, no production-specific wrapper, trusted parser identity, and read-only version observation.

The contract does not include personal absolute paths in canonical evidence. Future implementations may resolve absolute paths internally only if they are sanitized out of public evidence and logs.

## Process Policy Findings

The policy requires direct executable invocation, exact argument policy identity, exact working-directory identity, minimal environment policy, stdin closed, TTY disabled, shell disabled, detached false, fixed per-operation timeout, fixed stdout/stderr limits, bounded pipes, no retry, one runner invocation, one collection session, no deployment, no SQL, no mutation, process group containment, process tree termination, no daemonization, no browser launch, and no external credential-helper subprocess.

No policy field is caller-adjustable. Caller-raised timeout/output limits, shell, stdin, TTY, detached, retry, extra invocations/sessions, and nonzero mutation scope all fail closed.

## Lifecycle And Termination Findings

The reviewed lifecycle model explicitly allows only:

- `not_started->starting`
- `starting->running`
- `running->exited`
- `running->termination_requested`
- `termination_requested->terminated`
- `termination_requested->termination_failed`
- `running->timed_out`
- `timed_out->termination_requested`
- `timed_out->ambiguous`

It explicitly rejects transitions such as not-started to terminated, exited to running, terminated to running, termination-failed to restart, timed-out to restart, ambiguous to completed, failed to completed, prompt-detected to completed, and overflow to completed.

Timeout invalidates the collection session. A future implementation must stop further readiness-producing operations, request graceful termination, use a short fixed grace period, force terminate if needed, terminate contained descendants, verify process-tree termination, discard raw output, avoid retry, and prevent authorization reuse.

The contract does not claim full macOS process-tree containment. It requires future evidence. Detached false and parent exit are not enough.

## Child Process And Prompt Findings

Unexpected child processes block or make results ambiguous. For the first live run, the contract prefers blocking all unexpected children, including credential helpers, browser openers, device-code helpers, GUI processes, daemons, detached children, background children, and unknown descendants.

The contract rejects browser login, device code, MFA/password/token/confirmation/link prompts, GUI authentication, credential-helper prompts, terminal selection menus, URL opening, and prompt-to-continued-parsing behavior.

## Process Result Findings

Completed read-only evidence requires no timeout, no termination request, confirmed termination, confirmed process-tree termination, parent/direct-child/process-group exit evidence, known absence of detached descendants, trusted containment authority, trusted verification source, no overflow, no truncation, no prompt, no secret, no unexpected child, bounded output counts, output fingerprints only, valid timestamps, and acceptable exit status.

Timeout, prompt, secret, overflow, truncation, unexpected child, raw stdout/stderr, personal path, wrong containment authority, wrong verification source, and incomplete process-tree evidence all fail closed.

## Boundary Session And Authorization Compatibility

The session binds authorization id and fingerprint, run id, operation id, boundary contract version, credential handle id, version evidence set, process policy id, runner identity/version, collector version, timestamps, exact staging project `pdvzyuhykomwfqyyztru`, and rejected production project `ekdyopdrrkphlrsilyoo`.

The compatibility mapper preserves authorization identity, fingerprint, run id, operation id, staging project, one-shot/no-retry state, one runner invocation, one collection session, and zero deployment/SQL/mutation scope. It does not read credentials, build credential handles from secrets, run version commands, spawn processes, create live evidence, enable the runner, consume authorization, or persist anything.

## TOCTOU Findings

The boundary session is deliberately short-lived. Future live-run gating must reevaluate immediately before execution and invalidate readiness if the credential handle changes/expires/revokes, CLI binary changes, executable identity changes, parser/collector changes, process policy changes, worktree changes, project link changes, runner build changes, authorization changes, delay exceeds the maximum, or a previous execution was ambiguous.

## Fingerprint Findings

Fingerprints remain lowercase SHA-256 with exact equality over stable sorted serialization. Array order is bound and object keys are canonicalized. The validator rejects partial/prefix/malformed fingerprints, unknown algorithms, unsupported values, cycles, empty critical strings, malformed counts, secret material, raw output, personal paths, and unexpected production references.

No secret values, raw command output, credential values, or personal paths enter canonical fingerprints.

## Tests Expanded

The focused suite remains 13 top-level tests with expanded adversarial case matrices. It now covers the credential, version, process-policy, process-result, lifecycle, termination, fingerprint, source-scan, API/UI-unwired, and inert-plan concerns required for this review.

## Remaining Risks

- No credential provider implementation exists.
- No process executor implementation exists.
- No live CLI-version evidence runner exists.
- No live authentication verification exists.
- macOS process containment remains uncertain until implementation review.
- Credential-helper subprocess risk remains blocked, not solved.
- TOCTOU remains unresolved until a final live-run gate.
- Durable authorization consumption remains unresolved.

## Separated Implementation Readiness

The contract is ready for separate implementation gates for:

1. an opaque credential-provider boundary that does not access credentials during implementation review,
2. a read-only process executor and termination boundary,
3. a CLI-version evidence collector.

These should remain separate actions. The review did not prove a need to couple them, and coupling would make credential, process, and version trust boundaries harder to audit.

## Non-Execution Confirmation

No preflight runner was run. No Git command, Supabase command, version command, catalog command, shell command, SQL command, staging connection, production connection, remote-state inspection, migration deployment, Git mutation, schema mutation, data mutation, process spawn, credential access, env secret read, evidence persistence, authorization consumption, readiness artifact consumption, API/UI/runtime activation, Avanza/browser automation, credential/session/BankID handling, order behavior, settlement retrieval, live trade mutation, or live position mutation occurred.

## Decision

`post_trade_first_live_read_only_staging_preflight_execution_boundary_contract_static_security_review_ready_for_separated_boundary_implementations`

Result:

`post_trade_first_live_read_only_staging_preflight_execution_boundary_contract_static_security_review_completed_no_run_no_deployment`
