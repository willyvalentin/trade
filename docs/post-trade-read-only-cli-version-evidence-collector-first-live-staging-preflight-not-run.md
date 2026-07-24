# Post-Trade Read-Only CLI Version Evidence Collector Contract - First Live Staging Preflight Not Run

## Scope

Action 517 implemented a source-controlled, read-only CLI-version evidence collector contract and fixture boundary for a future first live staging preflight. The collector is structural only: it does not run Git, does not run Supabase, does not inspect executable paths, does not inspect `.env.local`, does not inspect process environment, does not spawn processes, and does not persist evidence.

## Added Files

- `lib/post-trade-first-live-read-only-preflight-cli-version-collector-core.ts`
- `lib/post-trade-first-live-read-only-preflight-cli-version-collector.ts`
- `tests/e2e/post-trade-first-live-read-only-preflight-cli-version-collector.spec.ts`

## Contract Shape

The collector defines an exact component registry for:

- `git_cli`
- `supabase_cli`
- `preflight_collector`
- `runner_contract`
- `runner_implementation`
- `parser_registry`
- `command_registry`
- `catalog_adapter_contract`
- `normalization_policy`
- `evidence_source_registry`
- `process_executor_contract`

The version policy registry is exact and fail-closed. Internal source-controlled components use exact source-controlled versions. Git uses a reviewed narrow semver range. Supabase CLI remains unresolved by design, so future readiness remains blocked until live version evidence and a reviewed policy are supplied under a later gate.

## Evidence Model

The collector can build deterministic fixture-only evidence. Evidence includes:

- component identity
- parser identity
- compatibility classification
- executable identity classification
- output fingerprints and byte counts
- read-only flags
- `observedLive: false`
- `versionCommandsExecuted: 0`
- SHA-256 fingerprints over canonical source-controlled objects

No raw stdout, raw stderr, executable path, shell command, PATH dump, environment dump, URL value, credential, token, service-role key, cookie, session value, database URL, or secret material is accepted.

## Injected Adapter Boundary

`collectCliVersionEvidenceFromInjectedFixtureAdapter` accepts only a caller-provided fixture observation adapter. There is no default live adapter, no adapter invocation on import, and no adapter invocation during simple construction of default state or requests.

The fixture observation validator rejects unknown adapter result fields, self-asserted authority or compatibility fields, live-observation claims, raw stdout/stderr fields, executable path fields, malformed fingerprints, mismatched request/component identity, production references, secret-like material, and incompatible executable identity metadata.

## Parser Contracts

The Git parser accepts only one exact single-line fixture format:

- `git version X.Y.Z`

The Supabase parser accepts only one exact single-line fixture format:

- `X.Y.Z`

Both reject prompts, warnings, update banners, URLs, ANSI/control characters, prerelease/build metadata, wildcard/range formats, and lexical bypasses.

## Executable Identity Boundary

Executable identity evidence is source-controlled fixture metadata only. It rejects aliases, shell functions, wrappers, script proxies, caller-selected paths, unknown symlinks, production wrappers, malformed identity, ambiguous identity, and public path material.

The collector intentionally does not resolve live executables. A future reviewed process executor and termination boundary must supply any live observation.

## Compatibility Bindings

The collector validates compatibility with the existing:

- first-live authorization artifact
- execution boundary contract
- read-only live preflight runner plan
- live ephemeral staging credential-provider design

These checks are structural only. They do not consume authorization, access credentials, invoke providers, run commands, connect to Supabase, or inspect live state.

## Inert Plan

The inert plan explicitly records that the collector contains no command string, executable path, process callback, shell, credential, secret, SQL, deployment, retry, PATH inspection, environment read, process spawn, Git run, Supabase run, authorization consumption, or evidence persistence.

## Known Gaps

- Supabase CLI exact compatibility remains unresolved.
- Live executable identity is not verified.
- No live version command has been run.
- No process executor/termination boundary exists yet.
- No live source adapter exists yet.
- No authentication-success evidence exists.
- No final live preflight gate has been opened.

## Safety Confirmation

No Git/Supabase/version command was run. No `.env.local`, process environment, PATH, alias, wrapper, executable path, credential, URL, or secret value was inspected. No process was spawned as production collector behavior. No staging or production connection occurred. No SQL, migration, deployment, database write, Supabase write, evidence persistence, authorization consumption, API/UI/runtime activation, Avanza/browser automation, credential/session/BankID handling, order behavior, settlement retrieval, live trade mutation, or live position mutation occurred.

## Decision

`post_trade_read_only_cli_version_evidence_collector_first_live_staging_preflight_ready_for_static_security_review`

## Result

`post_trade_read_only_cli_version_evidence_collector_first_live_staging_preflight_added_not_run`

## Recommended Next

Action 518 should perform a static/security review of the CLI-version evidence collector contract before any process executor or live version collection implementation.
