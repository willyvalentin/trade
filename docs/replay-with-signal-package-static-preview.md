# Replay With Signal Package Static Preview

## Purpose

Action 315 adds a local-only static preview script for replay-with-signal-package review. The preview runs deterministic fixture scenarios through the static simulation engine, builds the static inspection report, and prints either Markdown or JSON to stdout.

This is for local human inspection only. It is not a production route and it does not change runtime behavior.

## How To Run Locally

Markdown is the default:

```bash
node scripts/replay-with-signal-package-static-preview.mjs
```

Explicit Markdown:

```bash
node scripts/replay-with-signal-package-static-preview.mjs --format=markdown
```

Deterministic JSON:

```bash
node scripts/replay-with-signal-package-static-preview.mjs --format=json
```

The script exits non-zero if the inspection report safety assertion fails.

## Output Modes

- `--format=markdown` prints a human-readable static preview and the Action 314 inspection report.
- `--format=json` prints the preview object, scenario list, simulated results, inspection report, and safety assertion result.

Neither mode writes files.

## Relationship To Prior Static Actions

- Action 310 defines the static replay result model.
- Action 311 defines the pure in-memory simulation engine.
- Action 312 defines deterministic long and short fixture scenarios.
- Action 313 defines the static summary evaluator.
- Action 314 defines the static inspection report and Markdown renderer.
- Action 315 adds a local stdout-only preview path for those static pieces.

## No-Effect Guarantee

This preview is local-only and does not call providers, read/write Supabase, execute replay in production, persist synthetic outcomes, mutate recommendations, or affect scanner/ranking.

It adds no `app/api` routes, no page routes, no proxy changes, no middleware changes, and no Netlify configuration changes.
