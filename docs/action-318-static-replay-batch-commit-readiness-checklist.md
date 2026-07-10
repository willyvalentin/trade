# Action 318 Static Replay Batch Commit Readiness Checklist

checklist_status: static_replay_batch_commit_ready

## Baseline

- branch: dev/safe-post-recovery-work
- rollback deploy protected: 6a501645908e4100088b7396
- clean base commit: 512a0c5
- static batch range: Actions 309-317

This is commit readiness, not deploy readiness. It does not authorize deployment, production route publication, provider calls, Supabase access, replay execution, synthetic outcome persistence, scanner/ranking integration, main push, or runtime changes.

## Included Files

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
- `docs/action-318-static-replay-batch-commit-readiness-checklist.md`

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
- `scripts/action-318-static-replay-batch-commit-readiness-verify.mjs`

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
- `tests/e2e/action-318-static-replay-batch-commit-readiness-checklist.spec.ts`

Fixtures:

- `tests/fixtures/replay-with-signal-package-static-preview.markdown.golden.md`
- `tests/fixtures/replay-with-signal-package-static-preview.json.golden.json`

## Allowed Changed Surfaces

- `docs/`
- `lib/replay-with-signal-package-*.ts`
- `scripts/action-309-post-recovery-safety-guard.mjs`
- `scripts/replay-with-signal-package-static-preview.mjs`
- `scripts/replay-with-signal-package-static-preview-verify-golden.mjs`
- `scripts/action-317-static-release-manifest-verify.mjs`
- `scripts/action-318-static-replay-batch-commit-readiness-verify.mjs`
- `tests/e2e/replay-with-signal-package-*.spec.ts`
- `tests/e2e/action-309-post-recovery-safe-development-protocol.spec.ts`
- `tests/e2e/action-317-post-recovery-static-replay-release-manifest.spec.ts`
- `tests/e2e/action-318-static-replay-batch-commit-readiness-checklist.spec.ts`
- `tests/fixtures/replay-with-signal-package-static-preview.*`

## Blocked Changed Surfaces

- `app/`
- `app/api/`
- `proxy.ts`
- `middleware.ts`
- `netlify.toml`
- `supabase/`
- provider integrations
- scanner/ranking files
- broker/execution files

## Validation Commands Passed

- `node scripts/action-309-post-recovery-safety-guard.mjs`
- `node scripts/replay-with-signal-package-static-preview-verify-golden.mjs`
- `node scripts/action-317-static-release-manifest-verify.mjs`
- `node scripts/action-318-static-replay-batch-commit-readiness-verify.mjs`
- `git diff --check`
- `npx tsc --noEmit`
- `npm run build`
- `npm run lint`
- `npx next typegen`
- Playwright specs for Actions 309-317

## Recommended Commit Command

Use explicit file paths only:

```bash
git add \
  docs/action-309-post-recovery-safe-development-protocol.md \
  docs/replay-with-signal-package-result-model.md \
  docs/replay-with-signal-package-static-simulation.md \
  docs/replay-with-signal-package-static-fixtures.md \
  docs/replay-with-signal-package-static-summary.md \
  docs/replay-with-signal-package-static-inspection-report.md \
  docs/replay-with-signal-package-static-preview.md \
  docs/replay-with-signal-package-static-preview-golden-snapshots.md \
  docs/action-317-post-recovery-static-replay-release-manifest.md \
  docs/action-318-static-replay-batch-commit-readiness-checklist.md \
  lib/replay-with-signal-package-result-model.ts \
  lib/replay-with-signal-package-static-simulation.ts \
  lib/replay-with-signal-package-static-fixtures.ts \
  lib/replay-with-signal-package-static-summary.ts \
  lib/replay-with-signal-package-static-inspection-report.ts \
  lib/replay-with-signal-package-static-preview.ts \
  scripts/action-309-post-recovery-safety-guard.mjs \
  scripts/replay-with-signal-package-static-preview.mjs \
  scripts/replay-with-signal-package-static-preview-verify-golden.mjs \
  scripts/action-317-static-release-manifest-verify.mjs \
  scripts/action-318-static-replay-batch-commit-readiness-verify.mjs \
  tests/e2e/action-309-post-recovery-safe-development-protocol.spec.ts \
  tests/e2e/replay-with-signal-package-result-model.spec.ts \
  tests/e2e/replay-with-signal-package-static-simulation.spec.ts \
  tests/e2e/replay-with-signal-package-static-fixtures.spec.ts \
  tests/e2e/replay-with-signal-package-static-summary.spec.ts \
  tests/e2e/replay-with-signal-package-static-inspection-report.spec.ts \
  tests/e2e/replay-with-signal-package-static-preview.spec.ts \
  tests/e2e/replay-with-signal-package-static-preview-golden.spec.ts \
  tests/e2e/action-317-post-recovery-static-replay-release-manifest.spec.ts \
  tests/e2e/action-318-static-replay-batch-commit-readiness-checklist.spec.ts \
  tests/fixtures/replay-with-signal-package-static-preview.markdown.golden.md \
  tests/fixtures/replay-with-signal-package-static-preview.json.golden.json
```

Warnings:

- Do not use `git add .`.
- Do not push main.
- Do not deploy from this action.
