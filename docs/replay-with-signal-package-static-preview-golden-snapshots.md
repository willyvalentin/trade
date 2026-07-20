# Replay With Signal Package Static Preview Golden Snapshots

## Purpose

Action 316 adds deterministic golden snapshots for the local replay-with-signal-package static preview output. The snapshots lock the current Markdown and JSON output so future changes to the static fixture, simulation, summary, inspection report, or preview pipeline are reviewed intentionally.

## Snapshot Files

- `tests/fixtures/replay-with-signal-package-static-preview.markdown.golden.md`
- `tests/fixtures/replay-with-signal-package-static-preview.json.golden.json`

They are generated from:

```bash
node scripts/replay-with-signal-package-static-preview.mjs --format=markdown
node scripts/replay-with-signal-package-static-preview.mjs --format=json
```

## Local Verification

Run:

```bash
node scripts/replay-with-signal-package-static-preview-verify-golden.mjs
```

The verifier compares current preview output against both golden files and prints deterministic JSON:

- `verification_status`
- `markdown_matches`
- `json_matches`
- `golden_files_checked`
- `no_effect_flags`

It exits non-zero when either snapshot does not match.

## When To Update

Update these snapshots only when an intentional static preview, fixture, simulation, summary, or inspection report change alters expected output. Snapshot updates should be reviewed as behavior changes, not incidental churn.

## No-Effect Guarantee

These golden snapshots are static test artifacts only. They do not call providers, read/write Supabase, execute replay in production, persist synthetic outcomes, mutate recommendations, or affect scanner/ranking.

They add no `app/api` routes, no page routes, no proxy changes, no middleware changes, and no Netlify configuration changes.
