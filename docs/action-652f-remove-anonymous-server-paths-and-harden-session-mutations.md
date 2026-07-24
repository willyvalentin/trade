# Action 652F - Remove Anonymous Server Paths And Harden Session Mutations

**Status: local remediation; no production change.**

## Purpose

Action 652E found that Action 650 containment would deny several server and
scheduled paths because they still used the public Supabase client. This action
replaces those paths with a fail-closed service-role boundary and tightens the
shared application session mutation boundary.

## Server Client Contract

`lib/supabase-server.ts` is server-only. It requires a service-role key and
returns an explicit unavailable result when configuration is missing. The former
read-client fallback now returns the same service-role result; it never creates
an anonymous client. Contained-table callers include recommendation generation,
position monitoring, scanner/cache operations, market-calendar cache,
symbol-metadata cache, discard review, scheduled scan persistence, and outcome
snapshot reads.

Public clients remain unsuitable for all 19 Action 650 tables. No compatibility
policy or anonymous fallback is retained.

## Browser Boundary

`scan-log-core` contains only types, parsing, and formatting. Its server-only
persistence counterpart owns the `scheduled_scan_runs` write. The dependency
test recursively follows runtime imports from the TradeApp and rejects browser
Supabase, server-only, and persistence modules.

## Session Mutation Policy

Unsafe session-authenticated requests require an exact Origin match. In
production the expected origin comes only from `TURE_APPLICATION_ORIGIN`; absent
configuration fails closed. GET and HEAD are unaffected. Automation and
scheduled routes keep their own secret/scheduler authorization and are not
authorized by an application session.

## Login Protection

Failed logins are limited to five attempts per trusted platform connection IP
per fifteen minutes, with a bounded coarse global cap and deterministic `429`
responses. Successful login clears its local failure record. Passwords are
compared through fixed-length SHA-256 digests rather than direct string equality.

The limiter is process-local, deliberately bounded, and has no durable state.
It is defense in depth rather than a cross-instance guarantee. A production WAF
or platform rate-limit rule is still required before the login boundary is
considered globally abuse-resistant.

## Open-Position Uniqueness

No additional index is introduced. The existing model permits historical closed
records and does not establish whether a recommendation can be reopened. A
partial unique index could silently block legitimate history. Until semantics
are explicit, the transaction RPC is the only supported open-position writer and
detects conflicting existing linkage fail-closed.

## Rollout Order

1. Complete combined local replay and review.
2. Merge Action 652 only after the server/scheduled regressions pass.
3. Apply `20260724001500_create_transactional_open_position_command.sql`.
4. Deploy and smoke-test authenticated routes, server persistence, and
   automation authorization.
5. Require upstream login rate limiting.
6. Only then merge and apply Action 650 containment.
7. Verify direct role denial and server/scheduled persistence before further
   canary work.

This action does not apply migrations, invoke providers or brokers, deploy, or
alter production data or configuration.
