# Action 667M.5C.1 — Nanosecond-safe entitlement parser remediation

The local timestamp incompatibility that stopped M.5C has been remediated
offline. No credential was read, no provider endpoint was contacted, and no
submission or download was attempted.

## Decision

- `action_667m5c1_nanosecond_parser_implemented: true`
- `action_667m5c1_entitlement_timestamp_supported: true`
- `action_667m5c1_freshness_boundaries_verified: true`
- `action_667m5c1_cross_timezone_determinism_passed: true`
- `action_667m5c1_independent_review_approved: true`
- `action_667m5c2_submission_resume_ready: true`
- `batch_submission_authorized: false`
- `download_authorized: false`
- `normalization_authorized: false`
- `replay_authorized: false`
- `canonical_binding_ready: false`
- `live_ranking_effect: false`

M.5C.2 readiness means only that a separate, explicitly authorized resume can
repeat the complete fresh pre-submission gate. This Action grants no provider
or submission authority.

## Contract

`databento_explicit_nanosecond_instant_parser_v1` accepts strict explicit
instants with uppercase `Z` or an explicit offset no greater than `±14:00`.
The fractional component may contain zero through nine digits. The canonical
value is a signed Unix-nanosecond decimal string calculated only with integer
arithmetic.

The parser rejects naive timestamps, lowercase `z`, invalid calendar and clock
values, invalid offsets, leap seconds, fractions longer than nine digits,
whitespace, trailing data, non-string values, and years outside `1970–9999`.
Every runtime rejection is structured and fail-closed.

The TypeScript and Python contracts are semantically identical. Exact
comparison helpers cover entitlement bounds, provider and quote timestamps,
inclusive-start/exclusive-end intervals, ordering, equality, and the
900-second freshness boundary.

## M.5C integration

The inactive future M.5C submission harness now routes every instant used in
admission through the Python v1 parser:

- entitlement start and end;
- authorized scope and provider job scope;
- quote completion and submission instants;
- exact freshness arithmetic.

The path uses integer nanoseconds and contains no `datetime.fromisoformat`,
timestamp `total_seconds`, or floating-point timestamp conversion. The harness
was not executed in this Action.

The prior fail-closed M.5C evidence remains byte-identical:

- file SHA-256:
  `8cb7f4e0a91f085f63a005e3d5abd4d551015546253bed92201e447d6346b2fd`
- evidence digest:
  `22b3735acd6073f772e2e88bb056d3ba6a8473a52d59be3b7d3cd85f21335992`

## Verification

- 11 TypeScript contract tests passed.
- 4 Python contract tests passed.
- 187 K–M.5C.1 tests passed.
- 49 A–E contract/freeze tests passed.
- TypeScript, scoped ESLint, Python compilation, JSON parity, and
  `git diff --check` passed.
- UTC, Europe/Stockholm, and America/New_York produced the same digest:
  `a97887a9aecf69683928ce713d1d68c9e956f32549b2104aa0bfdce98d67fac1`.
- No dependency or `deno.lock` change occurred.

The independent review found zero blockers, majors, minors, or nits.

Machine-readable evidence:
`docs/evidence/action-667m5c1-nanosecond-parser-remediation.json`

Evidence digest:
`db2142ea0e78c7580fb7319063d32402ff9e5a9ae37b0dd6f7982342ddcd6a32`
