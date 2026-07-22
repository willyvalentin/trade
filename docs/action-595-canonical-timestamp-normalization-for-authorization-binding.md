# Action 595 - Canonical Timestamp Normalization for Authorization Binding

## Decision

`timestamp_normalization_production_verified_ready_for_new_explicit_attempt`

## Root-Cause Repair

Action 594 established that PostgreSQL/PostgREST can serialize `timestamptz`
values differently from JavaScript `Date#toISOString()`. The manual execution
route compared those raw strings as part of its strict authorization binding,
which rejected semantically equal instants before atomic admission.

This action adds `normalizeContinuousIntelligenceShadowCanaryTimestamp()`.
It accepts only a fully specified ISO-8601 timestamp with an explicit UTC
offset, validates calendar and offset bounds, and returns a canonical UTC
millisecond ISO string. It never supplies a fallback time.

PostgreSQL-style zero-padded microseconds are accepted when they retain an
exact millisecond instant. Non-zero sub-millisecond input fails closed rather
than rounding a bound authorization instant. Inputs without a timezone,
locale-dependent strings, invalid dates, offset overflow, and fractional
precision greater than PostgreSQL microseconds are rejected.

## Applied Boundaries

- authorization RPC/table parsing canonicalizes `issued_at`, `expires_at`,
  `consumed_at`, `requested_start`, and `requested_end` before TTL, range, or
  binding use;
- request-derived authorization bindings canonicalize request range values;
- authorization binding equality compares normalized instants rather than raw
  strings;
- lease record construction canonicalizes request-range, issuance, expiry, and
  consumption timestamps before range/TTL validation or serialization;
- manual execution gate expiry evaluation canonicalizes its persisted expiry
  value before comparison.

The atomic admission RPC continues to receive only the canonical binding
identity values. It does not receive raw timestamp text, so no SQL or schema
change is required.

## Preserved Invariants

- TTL remains no more than 60 seconds;
- invalid or expired timestamps fail closed;
- AAPL / `5min` / 30-minute request bounds remain exact;
- policy remains `377 / 57 / 320`;
- deployment, calendar, lifecycle, lease, and replay bindings remain strict;
- no raw credentials are persisted or added to diagnostics;
- provider work remains after successful atomic admission only;
- no migration, production request, flag, schedule, audit, ledger, or claim
  mutation is part of this action.

## Regression Coverage

The focused Action 595 test covers:

- `+00:00`, zero-padded PostgREST microseconds, and canonical `Z` values;
- semantic equality across different offset representations;
- unequal instants;
- expired timestamps;
- missing timezone, malformed values, invalid calendar values, excessive
  precision, non-representable sub-millisecond precision, and invalid offsets;
- normalized authorization and lease record construction;
- one injected atomic admission after normalized binding verification, with no
  provider adapter;
- malformed normalization stopping before the route's admission and provider
  operations.

## Validation

- `npx next typegen`: passed.
- `npx tsc --noEmit`: passed.
- Scoped ESLint for the Action 595 runtime and test files: passed.
- Focused Actions 580, 583, 585, 589, 590, and 595 tests: 30 passed.
- Relevant continuous-intelligence suite (Actions 565-576, 580, 583, 585,
  589, 590, and 595): 140 passed.
- `npm run build`: passed with Next.js 16.2.6/Turbopack. The sandboxed first
  attempt could not spawn a CSS worker; the same local build passed outside the
  sandbox without deployment.
- `git diff --check`: passed.

No SQL migration was required.

## Production Verification After Deployment

Read-only verification ran after deployed commit `d25f7cd` was confirmed as an
ancestor of production `origin/main` `c583eba`. The normalization source files
are unchanged between those revisions.

- The canonical issuance-readiness GET returned HTTP `200` and
  `diagnostic_ready`.
- Production readiness, schedule inactivity, and global safe defaults were
  all true. The non-mutating preflight returned HTTP `403` only for
  `canary_disabled` and `canary_kill_switch_active`; it made no provider call.
- Production readback has one expired, unconsumed authorization and one
  expired, unconsumed lease. Their stored range timestamps are valid,
  noncanonical PostgREST forms, which is the exact form repaired by this
  action.
- The six focused normalization tests passed against the deployed-source-
  equivalent code: `+00:00`, zero-padded microseconds, canonical `Z`, semantic
  equality, and malformed/timezone-less rejection are all covered.
- Claims, audit rows, and ledger rows remain `0`; daily usage remains `0 / 0`.
  No authorization or lease was issued or consumed, no provider was called,
  and no flags or schedules changed.

The deployed execution binding canonicalizes persisted authorization and lease
timestamps before comparison. A future live attempt still requires separate,
explicit operator authorization.
