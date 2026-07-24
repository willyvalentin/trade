# Action 317 Post-Recovery Static Replay Release Manifest

release_manifest_status: static_release_manifest_ready

## Recovery Baseline

- rollback deploy protected: 6a501645908e4100088b7396
- clean base commit: 512a0c5
- branch: dev/safe-post-recovery-work
- production remains protected by rollback
- main must not be pushed directly
- new runtime routes are not allowed yet

## Included Actions

- Action 309 safety protocol
- Action 310 result model
- Action 311 static simulation engine
- Action 312 static fixtures
- Action 313 static summary evaluator
- Action 314 static inspection report
- Action 315 static preview script
- Action 316 golden snapshots

## Included File Inventory

Docs:

- `docs/action-309-post-recovery-safe-development-protocol.md`
- `docs/replay-with-signal-package-result-model.md`
- `docs/replay-with-signal-package-static-simulation.md`
- `docs/replay-with-signal-package-static-fixtures.md`
- `docs/replay-with-signal-package-static-summary.md`
- `docs/replay-with-signal-package-static-inspection-report.md`
- `docs/replay-with-signal-package-static-preview.md`
- `docs/replay-with-signal-package-static-preview-golden-snapshots.md`
- `docs/action-317-post-recovery-static-replay-release-manifest.md`

Lib:

- `lib/replay-with-signal-package-result-model.ts`
- `lib/replay-with-signal-package-static-simulation.ts`
- `lib/replay-with-signal-package-static-fixtures.ts`
- `lib/replay-with-signal-package-static-summary.ts`
- `lib/replay-with-signal-package-static-inspection-report.ts`
- `lib/replay-with-signal-package-static-preview.ts`

Scripts:

- `scripts/action-309-post-recovery-safety-guard.mjs`
- `scripts/replay-with-signal-package-static-preview.mjs`
- `scripts/replay-with-signal-package-static-preview-verify-golden.mjs`
- `scripts/action-317-static-release-manifest-verify.mjs`

Tests:

- `tests/e2e/action-309-post-recovery-safe-development-protocol.spec.ts`
- `tests/e2e/replay-with-signal-package-result-model.spec.ts`
- `tests/e2e/replay-with-signal-package-static-simulation.spec.ts`
- `tests/e2e/replay-with-signal-package-static-fixtures.spec.ts`
- `tests/e2e/replay-with-signal-package-static-summary.spec.ts`
- `tests/e2e/replay-with-signal-package-static-inspection-report.spec.ts`
- `tests/e2e/replay-with-signal-package-static-preview.spec.ts`
- `tests/e2e/replay-with-signal-package-static-preview-golden.spec.ts`
- `tests/e2e/action-317-post-recovery-static-replay-release-manifest.spec.ts`

Test fixtures:

- `tests/fixtures/replay-with-signal-package-static-preview.markdown.golden.md`
- `tests/fixtures/replay-with-signal-package-static-preview.json.golden.json`

## Untouched Runtime Surfaces

- `app/api`
- app page routes
- `proxy.ts`
- middleware
- `netlify.toml`
- Supabase persistence paths
- provider paths
- scanner/ranking paths
- broker/execution paths

## No-Effect Guarantee

- provider_call_executed false
- provider_call_attempted false
- supabase_write_executed false
- candles_persisted false
- raw_response_persisted false
- fetch_run_persisted false
- synthetic_outcomes_persisted false
- replay_executed false
- scanner_behavior_changed false
- live_ranking_changed false
- recommendation_rows_mutated false

The static replay release batch does not call Twelve Data, fetch candles, read or write Supabase, persist candles, persist raw responses, persist fetch-run rows, persist synthetic outcomes, execute live replay, mutate recommendations, change scanner universe, change ranking, change thresholds, change visible recommendations, change outcome evaluation persistence, affect Learning Acceleration, affect Add Trade, or affect broker/execution/risk.

## Validation Checklist

- `node scripts/action-309-post-recovery-safety-guard.mjs`
- `node scripts/replay-with-signal-package-static-preview-verify-golden.mjs`
- `node scripts/action-317-static-release-manifest-verify.mjs`
- `git diff --check`
- `npx tsc --noEmit`
- `npm run build`
- `npm run lint`
- `npx next typegen`
- `PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/action-317-post-recovery-static-replay-release-manifest.spec.ts`
- `PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/replay-with-signal-package-static-preview-golden.spec.ts`
- `PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/replay-with-signal-package-static-preview.spec.ts`
- `PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/replay-with-signal-package-static-inspection-report.spec.ts`
- `PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/replay-with-signal-package-static-summary.spec.ts`
- `PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/replay-with-signal-package-static-fixtures.spec.ts`
- `PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/replay-with-signal-package-static-simulation.spec.ts`
- `PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/replay-with-signal-package-result-model.spec.ts`
- `PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/action-309-post-recovery-safe-development-protocol.spec.ts`

## Release Recommendation

- safe to commit as static-only batch
- not automatically safe to deploy until explicit production release checklist is run
- do not push main directly
- do not merge from contaminated origin/main
- keep production protected by rollback deploy until a separate production release plan is approved
