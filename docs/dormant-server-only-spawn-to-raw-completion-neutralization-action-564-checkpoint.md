# Action 564 Checkpoint - Dormant Server-Only Spawn-to-Raw-Completion Neutralization Adapter

## Action

Action 564 - Implement Dormant Server-Only Spawn-to-Raw-Completion Neutralization Adapter.

## Environment

Active workspace: `/Users/willysimonsson/Dev/trade-action-534`

Branch: `codex/action-534-live-resolver`

Baseline verified before edits:

- `pwd`: `/Users/willysimonsson/Dev/trade-action-534`;
- branch: `codex/action-534-live-resolver`;
- HEAD contained the committed Action 563 checkpoint commit;
- `git status --short`: clean.

## Files Created

- `lib/post-trade-dormant-server-only-spawn-to-raw-completion-neutralization-adapter.ts`;
- `lib/post-trade-dormant-server-only-spawn-to-raw-completion-neutralization-adapter-core.ts`;
- `tests/e2e/post-trade-dormant-server-only-spawn-to-raw-completion-neutralization-adapter.spec.ts`;
- `docs/dormant-server-only-spawn-to-raw-completion-neutralization-adapter-action-564.md`;
- `docs/dormant-server-only-spawn-to-raw-completion-neutralization-action-564-checkpoint.md`.

## Files Modified

- `lib/post-trade-dormant-server-only-fixed-read-only-direct-spawn-adapter.ts`;
- `docs/ture-agent-dev-chat-3-continuation-summary.md`.

## Architecture

The direct-spawn server-only module now records private original-object provenance for production direct-spawn results and exposes one boundary-specific consume operation for raw-completion neutralization. The new server-only neutralizer consumes the original result, passes the closed source record to a pure mapping core, invokes the approved pure raw-completion builder, and returns deeply frozen non-authoritative neutral evidence.

## Production API

The only production entry point is:

`neutralizeOriginalFixedReadOnlyDirectSpawnToRawCompletion({ directSpawnResult })`

It accepts no caller-supplied lifecycle facts, output, timestamps, policy, paths, parser options, dependencies, clock, test mode, or process handle.

## Provenance Bridge

The bridge uses private module-local weak provenance and one-shot consumption. It rejects missing provenance, clones, copied values, already consumed originals, and source authority/live claims. It exports no generic trust verifier, token, symbol, brand, reset, minting helper, replay state, or child handle.

## Supported Source States

Supported:

- spawn failure before process creation;
- normal zero exit;
- normal non-zero exit;
- signal termination;
- asynchronous child-process error;
- stdout overflow;
- stderr overflow;
- combined overflow.

Rejected for Action 564:

- stdout stream error;
- stderr stream error;
- invalid output encoding;
- unexpected stream chunk;
- close without exit;
- internal terminal state with process death unconfirmed.

Unsupported states fail closed and are not accepted as malformed raw evidence.

## Output And Timestamp Model

Retained UTF-8 output is transferred only with exact byte-count agreement. Overflow categories retain no output text. The bridge captures one internal `consumedAt` timestamp; source terminal timestamps are copied from the source evidence. Timestamps are evidence only and do not refresh stale authority.

## Pure Builder And Parser Separation

The neutralizer invokes the approved raw-completion builder. It does not construct accepted raw evidence manually and does not invoke the pure Git parser. Neutralization success does not imply Git parse success, compatibility authority, runtime activation, staging readiness, deployment readiness, or execution authority.

## Explicit Non-Authorizations

No executable was run. No process was created or observed. No child handle was transferred. No process was terminated. No Git version was collected or parsed. No credentials, environment values, network, Avanza, trading, order, position, settlement, persistence, API, UI, runner, cron, deployment, commit, push, merge, or production behavior occurred.

## Validation

Validation run after implementation:

- `./node_modules/.bin/tsc --noEmit`: passed;
- new Action 564 focused suite: 7 passed;
- Git-version parser suite: 62 passed;
- raw completion suite: 49 passed;
- direct-spawn suite: 19 passed;
- revalidation suite: 30 passed;
- composition suite: 13 passed;
- resolver/pure-composition suites: 29 passed;
- trusted resolver/security plus Action 533 suites: 672 passed;
- broad dormant/process/credential/CLI/authorization suites: 1211 passed;
- scoped ESLint on changed TS/JS files: passed with no warnings after cleanup;
- `git diff --check`: passed;
- static server-only/import/export review: passed;
- static production-API closure review: passed;
- static provenance-bridge review: passed;
- static one-shot/concurrency review: passed;
- static state-mapping review: passed;
- static raw-output/UTF-8 review: passed;
- static timestamp/freshness review: passed;
- static pure-builder compatibility review: passed;
- static neutral-classification review: passed;
- static Git-parser separation review: passed;
- static authority review: passed;
- static export-surface review: passed;
- static runtime-reachability review: passed;
- static prohibited-operation review: passed;
- quiet `.env.local` diff guard: passed;
- `find docs -type f -size 0`: passed.

## Decision

Decision: `post_trade_dormant_server_only_spawn_to_raw_completion_neutralization_adapter_ready_for_static_security_review`

Result status: `post_trade_dormant_server_only_spawn_to_raw_completion_neutralization_adapter_implemented_not_activated`
