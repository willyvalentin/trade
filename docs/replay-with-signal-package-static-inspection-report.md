# Replay With Signal Package Static Inspection Report

## Purpose

Action 314 adds a pure static inspection report builder for replay-with-signal-package review. It accepts already-built `ReplayWithSignalPackageResult` objects, builds the Action 313 static summary, and returns a deterministic in-memory report object with human-review sections.

This is preparation for future learning/backfill review. It is not a runtime integration.

## Relationship To Prior Static Actions

- Action 310 defines the static `ReplayWithSignalPackageResult` model.
- Action 311 defines the pure in-memory static simulation engine.
- Action 312 defines deterministic static fixtures.
- Action 313 defines the static summary evaluator.
- Action 314 wraps Action 313 summaries into a stable inspection report and Markdown rendering surface.

## Report Statuses

- `empty`: no results were supplied.
- `safe_report_available`: static inputs were safe and at least one interpreted result is available.
- `blocked`: inputs were static and safe, but all results were blocked or failed.
- `unsafe_input_detected`: at least one no-effect flag indicates provider, persistence, scanner, ranking, or recommendation mutation activity.

## Sections

Reports always include deterministic sections:

- Safety
- Outcome Breakdown
- R Multiple Summary
- Interpretation
- Recommended Next Step

The report keeps warnings and blockers visible without changing behavior.

## Markdown Renderer

`renderReplayWithSignalPackageInspectionReportMarkdown` produces deterministic Markdown from the report object. It does not include timestamps, random IDs, environment values, host details, or runtime-derived fields.

## No-Effect Guarantee

This inspection report builder is pure/in-memory and does not execute replay in production, call providers, read/write Supabase, persist synthetic outcomes, mutate recommendations, or affect scanner/ranking.

It adds no `app/api` routes, no page routes, no proxy changes, no middleware changes, and no Netlify configuration changes.
