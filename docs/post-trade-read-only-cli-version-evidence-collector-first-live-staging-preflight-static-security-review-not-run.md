# Post-Trade Read-Only CLI Version Evidence Collector Static/Security Review - First Live Staging Preflight Not Run

## Scope

Action 518 reviewed and hardened the Action 517 read-only CLI-version evidence collector for the future first live staging preflight. The review stayed static and structural. No version command, process execution, PATH inspection, executable resolution, environment read, credential access, preflight run, catalog query, SQL, remote connection, deployment, Git mutation, database mutation, evidence persistence, authorization consumption, API/UI/runtime wiring, Avanza/browser automation, order behavior, settlement retrieval, live trade mutation, or live position mutation occurred.

## Files Reviewed

- `lib/post-trade-first-live-read-only-preflight-cli-version-collector-core.ts`
- `lib/post-trade-first-live-read-only-preflight-cli-version-collector.ts`
- `tests/e2e/post-trade-first-live-read-only-preflight-cli-version-collector.spec.ts`
- `docs/post-trade-read-only-cli-version-evidence-collector-first-live-staging-preflight-not-run.md`
- authorization artifact, execution-boundary contract, runner plan, and credential-provider design dependencies imported by the collector

## Changes Made During Review

- Hardened semver parsing with length limits, leading-zero rejection, Unicode separator rejection, and stricter whitespace handling.
- Hardened parser rejection for path-like output and overlong output.
- Hardened policy validation for prerelease/build flags, automatic newer acceptance, missing bounds, malformed bounds, and invalid narrow-range ordering.
- Added request allowlisted-field validation.
- Added duplicate component evidence detection.
- Made structural evidence-set blockers take precedence over unresolved external readiness.
- Added stale, malformed, and ambiguous evidence-set blockers.
- Expanded tests for policy bypasses, request bypasses, parser bypasses, duplicate/stale/malformed/ambiguous evidence, and short semver secret false positives.

## Architecture Findings

The collector core remains deterministic, source-controlled, pure, and fixture-bound. The exported boundary uses `import "server-only"`. The core imports only `node:crypto` plus reviewed source-controlled constants/builders; it does not import child-process APIs, filesystem executable-resolution APIs, Supabase clients, catalog clients, SQL/deployment modules, API/UI code, Avanza/browser modules, or credential providers.

The collector has no default live adapter. The injected fixture adapter is invoked only by an explicit caller call to `collectCliVersionEvidenceFromInjectedFixtureAdapter`.

## Structural Versus Live Findings

The collector keeps structural evidence separate from live observation:

- fixture evidence remains `observedLive: false`
- external fixture evidence remains non-authoritative
- internal evidence is authoritative only for exact source-controlled identity
- fixture parser success cannot prove executable existence
- fixture parser success cannot prove executable path identity
- fixture parser success cannot prove live CLI compatibility
- unresolved Supabase policy prevents readiness

## Component Registry Findings

The registry is exact and deterministic. It includes mandatory entries for Git CLI, Supabase CLI, preflight collector, runner contract, runner implementation, parser registry, command registry, catalog-adapter contract, normalization policy, evidence-source registry, and process-executor contract.

Aliases, prefixes, suffixes, case variants, caller-added components, generic executable categories, duplicates, unknown components, and omissions are rejected by exact-object validation and targeted duplicate/missing checks.

## Policy Registry Findings

Policy support remains limited to reviewed exact, reviewed narrow range, blocked, and unresolved. The review hardened rejection for latest, wildcard, x ranges, open ranges, caller ranges, environment override, fallback policy, prerelease acceptance, build-metadata ambiguity, lexical comparison, automatic newer acceptance, malformed bounds, and invalid bound ordering.

Supabase CLI remains unresolved. This is intentional and blocks future readiness.

Future Supabase version selection remains:

1. implement and review the read-only process executor and termination boundary
2. safely resolve executable identity
3. separately authorize a read-only version command
4. observe the actual version
5. review the output format
6. select an exact source-controlled policy
7. complete a policy static/security review before any preflight

## Git Policy Findings

Git currently uses a reviewed narrow semver range. The parser accepts only `git version X.Y.Z`. It does not broadly accept Apple Git suffixes or arbitrary platform suffixes. Any Apple suffix support must be added later as an exact reviewed parser identity and exact policy rule.

## Executable Identity Findings

Executable identity evidence is sanitized fixture metadata only. It rejects aliases, shell functions, wrappers, script proxies, caller-selected paths, unknown symlinks, production wrappers, malformed identities, ambiguous identities, public path material, and PATH material. A fingerprint alone does not prove executable identity; live proof requires the later reviewed resolver and process boundary.

## Request Findings

Observation requests bind request id, component identity, policy identity, collector version, boundary session, authorization id, run id, operation identity, expected executable identity, parser identity, timestamps, read-only/no-stdin/no-TTY/no-shell markers, exact timeout/output-limit policy identities, output format, and output line count.

The review added explicit allowlisted-field validation. Arbitrary commands, arguments, executable paths, flags, environment overrides, unknown request fields, caller-raised timeout/output limits, and multi-operation request shapes fail closed.

## Adapter Boundary Findings

The injected fixture adapter boundary has no default live implementation and no import/construction invocation. It rejects unknown result fields, self-asserted authority or compatibility, observed-live claims, raw stdout/stderr, executable paths, malformed fingerprints, mismatched request/component identity, production references, secret-like material, and unsafe executable identity metadata.

Fixture output remains transient and is converted to sanitized evidence with output fingerprints only.

## Parser Findings

The Git and Supabase parsers are strict single-line parsers. The review hardened rejection for empty output, multiple lines, leading/trailing whitespace, Unicode line separators, NUL/control/ANSI characters, URLs, path-like output, warning/update/login/prompt text, token/JWT/base64-like material, prerelease, build metadata, wildcard/open-range text, leading zeros, overlong output, and overlong version segments.

Git accepted format: `git version X.Y.Z`.

Supabase accepted format: `X.Y.Z`.

Supabase exact live compatibility is not selected here.

## Semver Findings

Semver parsing is deterministic, numeric, and coercion-free. It requires exactly three numeric core segments, rejects signs, negative/oversized/non-numeric segments, wildcard segments, whitespace, prerelease, build metadata, leading zeros, and segment values above 9999. Range comparison is numeric, not lexical.

## Evidence And Evidence-Set Findings

Evidence includes only sanitized metadata: evidence identity/version, component identity, policy identity, executable classification, observed/normalized version, compatibility, parser identity, collector identity, boundary session, authorization, run id, timestamps, output fingerprint, byte counts, complete marker, authoritative marker, read-only marker, observed-live marker, result classification, and evidence fingerprint.

Evidence excludes raw stdout, raw stderr, executable path, PATH data, environment data, URLs, prompt text, warning text, and secrets.

The evidence set blocks missing mandatory components, duplicate component evidence, mixed boundary sessions, mixed collector identities, incompatible evidence, unresolved external policy, stale evidence, malformed evidence, and ambiguous evidence. There is no majority vote and no partial readiness.

## Fingerprint Findings

Fingerprints use deterministic SHA-256 over stable canonical serialization with sorted object keys and array order preserved. Exact lowercase 64-character fingerprints are required. Partial, prefix, malformed, unsupported nested value, cyclic value, and caller-selected algorithm variants fail.

## Secret-Material Findings

Recursive secret checks reject token-like fields, access/refresh token strings, service-role keys, anon/API keys, passwords, connection strings, PostgreSQL URLs, authorization bearer strings, cookies, session token/cookie/secret/value material, private keys, client secrets, credential paths, Keychain metadata, environment/PATH dumps, personal home paths, BankID, JWT-like strings, and long base64-like credential material. Short semver strings such as `1.2.3` are not falsely classified as credentials.

## Compatibility Findings

Compatibility validators remain pure and side-effect free. They validate exact compatibility with the authorization artifact, execution-boundary contract, read-only live preflight runner, and credential-provider design. They do not execute adapters, run commands, inspect PATH, resolve executables, read environment, access providers or credentials, spawn processes, enable the runner, persist evidence, or consume authorization.

## Remaining Risks

- exact reviewed Supabase CLI version is unresolved
- no live executable resolver exists
- no live version command execution exists
- no read-only process executor exists
- no authoritative process termination boundary exists
- wrapper and symlink verification remain future work
- CLI output-format drift remains possible
- TOCTOU risk remains for any future live run
- credential adapter remains deferred
- durable authorization consumption remains a later gate

## Readiness

The collector is ready for the next no-run implementation step: a read-only process executor and termination boundary. It is not ready to run a live version command, not ready to claim live CLI compatibility, and not ready to run the first live staging preflight.

## Decision

`post_trade_read_only_cli_version_evidence_collector_first_live_staging_preflight_static_security_review_ready_for_read_only_process_executor_implementation`

## Result

`post_trade_read_only_cli_version_evidence_collector_first_live_staging_preflight_static_security_review_completed_not_run`

## Recommended Next

Action 519 should implement an allowlisted read-only process executor and termination boundary without running commands.
