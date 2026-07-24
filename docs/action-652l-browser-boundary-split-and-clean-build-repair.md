# Action 652L - Browser Boundary Split And Clean Build Repair

**Status: locally remediated; not committed, deployed, or production verified.**

## Purpose

Action 652K found that four recommendation modules mixed browser-safe
calculation/read-model code with Supabase writers. It also found two stale
server-client references, a readonly environment mutation in tests, an
undeclared `server-only` dependency, and three regressions that still described
the retired direct-browser database model.

This action makes those boundaries explicit without changing persistence
ownership or product behavior.

## Mixed-Module Inventory

`app/trade-app.tsx` runtime-imported the four modules below. Type exports are
browser-safe and pure. Builders, JSON serializers, and row parsers are pure.
Local-storage exports are browser UI-state helpers and cannot write a database.
Supabase contracts and writers were impure, persistence-capable, server-only,
and moved to the listed destination.

| Source module | Export inventory after split | Browser use | Classification | Destination |
| --- | --- | --- | --- | --- |
| `recommendation-snapshot.ts` | `RecommendationSnapshotStatus`, `RecommendationSnapshotSource`, `RecommendationSnapshotWindow`, `RecommendationSnapshotQuality`, `RecommendationSnapshotInput`, `RecommendationSnapshot`, `RecommendationSnapshotPersistenceResult`, `RecommendationSnapshotDeduplicationResult`, `RecommendationSnapshotShadowEntryTrialSummary`; `recommendationSnapshotHasShadowEntryTrialMetadata`, `summarizeRecommendationSnapshotShadowEntryTrialMetadata`, `buildRecommendationSnapshotFingerprint`, `buildRecommendationSnapshot`, `recommendationSnapshotJson`, `recommendationSnapshotsJson`, `recommendationSnapshotFromPersistenceRow`, `checkRecommendationSnapshotDeduplication`; local-only `recommendationSnapshotLocalStorageKey`, `readRecommendationSnapshotsFromLocalStorage`, `persistRecommendationSnapshotToLocalStorage`, `markRecommendationSnapshotTaken` | builder, parser, JSON, types, shadow summary, demo-only taken marker | pure/read model, types, or browser-local UI state; no database operation | `RecommendationSnapshotSupabaseClient` and `persistRecommendationSnapshot` moved to `lib/server/recommendation-snapshot-persistence.ts` |
| `recommendation-scan-run.ts` | `RecommendationScanRunStatus`, `RecommendationScanRunSource`, `RecommendationScanRunWindow`, `RecommendationScanRunCounts`, `RecommendationScanRunProviderStatus`, `RecommendationScanRunWarning`, `RecommendationScanRunInput`, `RecommendationScanRun`, `RecommendationScanRunPersistenceResult`, `RecommendationScanRunDeduplicationResult`; `buildRecommendationScanRunFingerprint`, `buildRecommendationScanRun`, `recommendationScanRunJson`, `recommendationScanRunsJson`, `recommendationScanRunFromPersistenceRow`, `checkRecommendationScanRunDeduplication`; local-only `recommendationScanRunLocalStorageKey`, `readRecommendationScanRunsFromLocalStorage`, `persistRecommendationScanRunToLocalStorage` | builder, parser, JSON, types | pure/read model, types, or browser-local UI state; no database operation | `RecommendationScanRunSupabaseClient` and `persistRecommendationScanRun` moved to `lib/server/recommendation-scan-run-persistence.ts` |
| `recommendation-batch-memory.ts` | `RecommendationBatchStatus`, `RecommendationBatchType`, `RecommendationBatchWindow`, `RecommendationBatchTargetStatus`, `RecommendationBatchWarning`, `RecommendationBatchInput`, `RecommendationBatch`, `RecommendationBatchPersistenceResult`, `RecommendationBatchDeduplicationResult`, `RecommendationBatchSummary`; `buildRecommendationBatchFingerprint`, `buildRecommendationBatch`, `recommendationBatchJson`, `recommendationBatchesJson`, `checkRecommendationBatchDeduplication`, `recommendationBatchFromPersistenceRow`, `buildRecommendationBatchSummary`; local-only `recommendationBatchLocalStorageKey`, `readRecommendationBatchesFromLocalStorage`, `persistRecommendationBatchToLocalStorage` | builder, parser, JSON, summary, types | pure/read model, types, or browser-local UI state; no database operation | `RecommendationBatchSupabaseClient` and `persistRecommendationBatch` moved to `lib/server/recommendation-batch-persistence.ts` |
| `recommendation-outcome-tracker.ts` | `RecommendationOutcomeStatus`, `RecommendationOutcomeEvent`, `RecommendationOutcomeHorizon`, `RecommendationOutcomeSource`, `RecommendationOutcomeCandle`, `RecommendationOutcomeInput`, `RecommendationOutcomeSideReadSource`, `RecommendationOutcomeSideResolution`, `RecommendationOutcome`, `RecommendationOutcomeComputationResult`, `RecommendationOutcomePersistenceResult`; `resolveRecommendationOutcomeSide`, `computeRecommendationOutcome`, `recommendationOutcomeJson`, `recommendationOutcomesJson`, `recommendationOutcomeFromPersistenceRow`; local-only `recommendationOutcomeLocalStorageKey`, `readRecommendationOutcomesFromLocalStorage`, `persistRecommendationOutcomeToLocalStorage` | computation, parser, JSON, types | pure/read model, types, or browser-local UI state; no database operation | `RecommendationOutcomeSupabaseClient` and `persistRecommendationOutcome` moved to `lib/server/recommendation-outcome-persistence.ts` |

The server scan, diagnostic scan, and outcome workflows import only the new
server persistence modules. Those modules begin with `import "server-only"` and
fail closed when the canonical service-role client is unavailable. No browser
module re-exports them.

The browser diagnostics graph also stopped importing the server environment
audit. Its replacement reports that server evidence was not observed in the
browser and directs operators to the authenticated server route. It never reads
server secret metadata.

## Dependency Graph Contract

The Action 652B graph test now follows runtime imports, runtime re-exports, and
literal dynamic imports. It covers the TradeApp and settings client surfaces,
which transitively include dashboard, history/statistics, and execution client
code. A reachable module fails the test if it:

- is under `lib/server` or is a Supabase client module;
- imports `server-only`;
- reads a service-role environment key; or
- performs an operation against one of the four contained recommendation
  tables.

No mixed-purpose module is allowlisted.

## Clean Build Repairs

- `recordScheduledScanAttempt` now obtains the canonical fail-closed service
  client through `serverSupabase()`.
- Both outcome persistence branches use the already-resolved server client and
  its redacted unavailable reason. The undefined `supabase` fallback is gone.
- Origin evaluation accepts an explicit environment record, so tests cover
  production/preview/local classification without mutating readonly
  `process.env.NODE_ENV`.
- The official `server-only@0.0.1` marker is an explicit dependency. Route tests
  no longer execute server-only modules in Playwright's client-like transform;
  session/proxy behavior remains executable coverage, while route ownership is
  asserted at source boundaries.
- Login runtime-proof parsing moved into a non-persistent, dependency-injected
  core. The server-only limiter retains all durable admission ownership.
- Close-position coverage now asserts the authenticated positions command and
  excludes direct Supabase writes.
- Recent recommendation coverage now asserts bounded reads in the authenticated
  server read model and excludes browser Supabase selection.

## Validation

Local validation includes clean dependency installation, Next route type
generation, TypeScript, focused Action 652 tests, dependency-graph tests,
scheduled scan/outcome regressions, calendar/cache-related regressions, the
production build, scoped ESLint, and whitespace checks.

Disposable PostgreSQL validation covers:

1. transactional open-position commit, idempotency, rollback, conflict, and role
   denial;
2. shared login-abuse limits and role denial; and
3. ordered `01500 -> 01600 -> 02000` compatibility with all 19 contained tables.

The Action 650 branch and migration remain untouched. No migration is added or
changed by Action 652L.

## No-Effect Boundary

Action 652L does not call production, providers, brokers, scanners, or
deployment systems. It does not apply migrations, alter environment variables,
or restore anonymous access. `deno.lock` is untouched.
