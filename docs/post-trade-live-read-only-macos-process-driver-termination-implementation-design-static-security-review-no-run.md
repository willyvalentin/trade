# Action 522 - Live Read-Only macOS Process Driver Design Static/Security Review, No Run

## Files Reviewed

- `lib/post-trade-live-read-only-macos-process-driver-design.ts`
- `tests/e2e/post-trade-live-read-only-macos-process-driver-design.spec.ts`
- `docs/post-trade-live-read-only-macos-process-driver-termination-implementation-design-no-run.md`
- Action 519-520 process-executor and termination boundary
- Action 517-518 CLI-version collector
- Action 513-516 credential boundary and provider design
- Action 509-512 authorization and execution-boundary contracts
- Action 507-508 read-only preflight runner contracts

## Review Scope

This review covered driver identity, platform policy, executable-resolution contracts, executable capability evidence, TOCTOU controls, cwd capability, spawn policy, minimal environment construction, opaque credential handoff, output capture and decoding, process-instance metadata, process observation, containment, timeout, graceful and forced termination, lifecycle transitions, sanitized results, mutation classification, compatibility validators, fingerprints, side-effect boundaries, and documentation.

No live process, Git command, Supabase command, version command, PATH inspection, executable resolution, filesystem inspection, process-tree observation, signal delivery, environment-value read, credential access, remote connection, catalog query, SQL, deployment, evidence persistence, or authorization consumption occurred.

## Structural Versus Live Findings

The design is deterministic, source controlled, macOS-specific, staging-only, read-only, no-retry, fail-closed, exact-object validated, and unable to perform live actions.

The review confirmed that structural validity remains explicitly separate from implemented live safety. The design does not claim:

- executable verified live
- PATH inspected
- filesystem identity confirmed
- process started
- process contained
- descendants observed
- signals sent
- termination verified
- credentials cleaned
- command behavior proven read-only

Review hardening added explicit false live-claim fields for executable verification, filesystem identity, process start, process observation, containment, termination, cleanup, and read-only command behavior proof.

## Driver Identity Findings

The driver identity remains exact:

`reviewed_macos_read_only_preflight_process_driver_v1`

The design rejects generic drivers, cross-platform aliases, Linux/Windows fallback, prefix/suffix/case variants, environment-selected drivers, caller-selected drivers, and automatic platform fallback.

## Platform And Architecture Findings

Review hardening added `ArchitectureCompatibilityPolicy`, which requires:

- macOS platform
- explicit host architecture evidence
- explicit executable architecture evidence
- explicit translation classification
- reviewed Rosetta-translated execution
- no unknown architecture
- no unknown translation
- no generic architecture
- no architecture fallback

Unknown architecture or translation remains blocked or ambiguous. No live architecture inspection occurred.

## Executable Resolution Findings

The resolver policy remains exact and rejects:

- inherited PATH only
- caller paths
- shell lookup
- aliases
- shell functions
- wrappers
- script proxies
- unreviewed symlinks
- package-manager shims without review
- arbitrary `which` or `command -v` lookup
- multiple-candidate fallback
- world-writable executables or directories
- production-specific wrappers

Public evidence exposes no absolute path. Code-signing remains reviewed-or-not-applicable, not overclaimed as universally available for third-party CLIs.

## Executable Capability Findings

Review hardening added explicit evidence fields for host architecture, executable architecture, translation classification, size changes, modification-time changes, symlink target changes, containing-directory changes, and capability reuse/cloning.

The capability binds one component and rejects caller path substitution, multiple choices, cross-session reuse, cross-operation reuse, cloned capabilities, changed executable identity, changed symlink identity, changed size/mtime, replacement after verification, stale evidence, and future evidence.

## TOCTOU Findings

Review hardening added `TocTouRevalidationPolicy`, which requires immediate revalidation of stable file identity, size, modification state, ownership, file type, architecture, optional digest where available, boundary session, driver instance, cwd identity, operation registry, and process policy.

The policy explicitly states complete TOCTOU elimination is not claimed and race risk remains possible.

## Cwd Capability Findings

The cwd capability remains private and repository-bound. It rejects caller-selected cwd, public absolute path, personal path, symlink root, nested unrelated repository, production checkout, stale or cross-session capability, and changed repository identity.

## Spawn Policy Findings

The spawn policy remains direct-spawn-only and rejects command strings, shell commands, `sh -c`, `bash -c`, interpolation, pipes, redirects, command substitution, inherited stdio, interactive stdin, TTY, pseudo-terminal behavior, detached execution, background execution, GUI launch, arbitrary cwd, arbitrary environment, generic spawn options objects, multiple operations, multiple executable capabilities, and caller-supplied PIDs.

No `child_process` import or live spawn path exists.

## Environment Findings

The environment policy starts empty and permits only fixed non-secret entries for locale, color, pager/editor suppression, Git non-interactivity, and Supabase non-interactivity.

It rejects inherited env, caller variables, HOME, USER, PATH dumps, shell config, raw tokens, service-role keys, connection strings, credential paths, and public credential slot details.

The review notes a future implementation must separately verify whether Git or Supabase need helper processes or internal PATH-like behavior; for first live execution, unreviewed children remain blocked.

## Credential Handoff Findings

The credential policy remains opaque and single-use. Review hardening added explicit rejection of export, serialization, logging, command-argument injection, stdin injection, config-file injection, and cleanup gaps after observer or termination ambiguity.

No driver public type receives or returns a general-purpose secret value.

## Output Capture And Memory Findings

The output policy remains bounded, transient, and parser-gated. Review hardening added:

- byte-level secret scan before decode
- minimal copies required
- mutable buffer overwrite where practical
- references dropped after classification
- snapshotting forbidden
- raw output in exceptions forbidden

The design does not claim guaranteed zeroization. JavaScript runtime copies, decoder strings, garbage-collection timing, exception capture, and test-framework reporting remain limitations that must be managed in future implementation.

## Decoder Findings

The decoder policy remains UTF-8 only and rejects invalid encoding, NUL, control characters, Unicode separators, ANSI, prompts, banners, excessive dirty output, and unsafe parser handoff. Review hardening added byte-level pre-decode screening and explicit rejection of perfect-detection claims.

## Process Instance And Concurrency Findings

Review hardening added `ProcessInstanceMetadataPolicy`. Private PID and process-group identifiers may exist only inside a future implementation; public PID, public process group id, process handles, global registries, module-global caches, reusable instances, second operations, cross-session use, overlapping leases, overlapping observers, second processes before output disposal, and second processes before credential cleanup are rejected.

Concurrency remains exactly one process at a time.

## Observer And Containment Findings

The observer contract remains scoped to the known process instance and known process group. Review hardening added explicit rejection of generic termination booleans, arbitrary PID query, signal capability, raw command-line output, environment output, personal path output, and expected children for the first run.

Containment must distinguish parent state, direct children, descendants, process group, detached descendants, process-group escape, browser child, GUI child, URL opener, credential helper, daemon child, unknown child, observer authority, completeness, freshness, and session identity.

Generic `contained: true`, generic `terminated: true`, parent-only evidence, child-only evidence, group-only evidence with unknown escape state, incomplete evidence, stale evidence, and mixed-session evidence remain rejected.

## Timeout And Termination Findings

Timeout remains monotonic and bounded with no caller override, no retry, and session invalidation. Wall-clock timestamps may be used only for audit.

Termination remains exact-target only: no arbitrary PID signaling, no unrestricted signal API, no signal-delivery-is-termination claim, no parent-only-exit claim, no process-group-exit-alone claim when escape state is unknown, and no detached certainty claim from force kill.

Unknown descendants or observer failure remain ambiguous.

## Lifecycle Findings

The lifecycle accepts exact success and timeout paths and rejects terminal-to-usable transitions, disposed reuse, failed retry, ambiguous retry, timeout second start, completion before containment verification, completion before output disposal, prompt/secret/overflow to completion, and cleanup ambiguity to completion.

Failure and ambiguity require disposal and cleanup before final classification.

## Sanitized Result Findings

The sanitized result excludes raw output, executable path, cwd path, environment, credential, PID, process-group id, Keychain metadata, username/account metadata, and personal paths.

Completed read-only requires exact session, verified containment, no timeout, no termination request, no prompt, no secret, no overflow, no truncation, no unexpected child, output disposal, credential cleanup if used, zero mutation, and expected exit classification. Zero exit alone is insufficient.

## Prompt, Browser, Secret, And Mutation Findings

Preventive layers remain no shell, closed stdin, no TTY, no pseudo-terminal, prompting disabled by policy, no browser/GUI launch, and no unreviewed credential helper.

Detective layers remain output scanning, observer classifications, session invalidation, termination, cleanup, and sanitized failure classifications.

Secret detection covers token-like material, service-role and anon keys, API keys, passwords, connection strings, PostgreSQL URLs, authorization headers, bearer tokens, cookies, session material, private keys, client secrets, credential paths, Keychain metadata, raw environment, PATH dumps, home paths, username paths, BankID, JWT-like material, and credential-like base64, while allowing ordinary hashes and fingerprints.

The design does not assume allowlisted command identity proves no mutation. Suspected mutation remains blocking.

## Version Integration Findings

Git and Supabase version observations remain exact-operation-only, executable-capability-bound, driver-bound, one-line bounded, no-warning, no-prompt, no-retry, and no-credential unless separately required.

The exact observed Supabase CLI version remains unresolved and was not selected in this action.

## Fingerprint Findings

Fingerprints remain deterministic SHA-256 with lowercase 64-character equality. Partial, prefix, malformed, unsupported nested values, cyclic input, nested production references, public paths, raw output, PID/group identifiers, and secret-like material are rejected.

## Compatibility Findings

Compatibility remains pure and exact against:

- Action 519-520 process executor
- Action 517-518 CLI-version collector
- Action 513-516 credential layers
- Action 509-512 authorization/execution contracts
- Action 507-508 runner

No compatibility function performs OS actions, reads env, inspects PATH, starts processes, observes processes, sends signals, accesses credentials, persists evidence, or consumes authorization.

## Dependency Boundary Findings

The design module imports only `node:crypto` and reviewed pure source-controlled contracts. It does not import `child_process`, filesystem APIs for live inspection, PATH resolvers, environment readers, signal libraries, process-tree libraries, Git execution, Supabase clients, credential adapters, SQL clients, API/UI code, Avanza code, or browser automation code.

## Tests Added Or Strengthened

The Action 522 review strengthened `tests/e2e/post-trade-live-read-only-macos-process-driver-design.spec.ts` to cover:

- no-live-safety-claim fields
- exact driver id variants
- architecture and Rosetta/translation ambiguity
- TOCTOU revalidation and no-elimination claim
- shell/which/command-v resolver bypasses
- package-manager shim without review
- executable capability reuse/cloning and change evidence
- cwd cross-session and repository-identity changes
- generic spawn options, multiple operations, multiple executable capabilities, caller PIDs
- credential export/serialization/logging/argument/stdin/config-file bypasses
- observer and termination ambiguity cleanup
- byte-level secret scanning and pre-decode screening
- raw-output exception/snapshotting prevention
- private process-instance metadata and concurrency guards
- observer arbitrary PID/query/signal/raw command/environment/personal path bypasses
- no expected children for the first run

## Changes Made During Review

Review hardening updated the design module with:

- `ArchitectureCompatibilityPolicy`
- `TocTouRevalidationPolicy`
- `ProcessInstanceMetadataPolicy`
- stronger driver no-live-claim fields
- stronger resolver and executable capability fields
- stronger cwd, spawn, credential, output, decoder, and observer fields
- new validators and fingerprint exports for those policies

No live implementation capability was added.

## Remaining Risks

The following remain intentionally unresolved:

- real executable resolver implementation
- real cwd resolver implementation
- real process driver implementation
- scoped macOS process observer implementation
- process-group binding correctness
- macOS helper-process behavior
- signal delivery implementation
- descendant enumeration implementation
- live credential handoff implementation
- exact observed Supabase CLI version
- durable authorization consumption
- TOCTOU limitations
- JavaScript memory-zeroization limitations

## Readiness For Separated Implementations

The design is ready for separate no-run implementations of:

1. trusted executable and repository cwd resolver boundary
2. scoped macOS process observer boundary
3. direct-spawn and termination driver behind injected adapters

These should be implemented and reviewed separately.

Recommended next order:

1. implement trusted executable/cwd resolver boundary with fixtures only
2. review resolver boundary
3. implement scoped macOS process-observer boundary with fixtures only
4. review observer boundary
5. implement direct-spawn/termination driver behind injected adapters
6. review live driver implementation
7. implement credential source adapter
8. final live-run gate

## Safety Confirmation

No process or command was run. No PATH, executable, filesystem, process tree, environment value, credential, Keychain, Git, Supabase, version command, catalog query, SQL, deployment, DB/Supabase write, evidence persistence, authorization consumption, API/UI/runtime activation, Avanza/browser automation, credential/session/BankID handling, order behavior, settlement retrieval, live trade mutation, or live position mutation occurred.

## Decision

`post_trade_live_read_only_macos_process_driver_termination_implementation_design_static_security_review_ready_for_separated_resolver_observer_and_driver_implementations`

## Result

`post_trade_live_read_only_macos_process_driver_termination_implementation_design_static_security_review_completed_no_run`

## Recommended Next Action

Action 523 - Implement Trusted Executable and Repository CWD Resolver Boundary, Without Live Resolution.
