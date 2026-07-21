# Action 572: Durable Sanitized Proof Audit

## Purpose

Action 571 kept its latest receipt only in process memory. Netlify can route the
next readback request to another instance, so `not_observed` does not disprove a
previous bounded proof. Action 572 adds a separate, flag-gated durable audit row
for a strictly sanitized receipt.

## Stored Data and Exclusions

The migration creates `bounded_shadow_collector_proof_audits` with only bounded
receipt facts: request identity, aggregate candle count and timestamps, provider
status aggregates, planner allocation provenance, authorization facts, safe result
category, and no-effect booleans. It never stores candle arrays or OHLCV values,
raw provider payloads, URLs, API keys, automation secrets, tokens, token hashes,
stack traces, or arbitrary error text.

The server-only adapter maps each column explicitly. It does not spread a receipt
or use an upsert. `receipt_id` is unique: an identical duplicate is reported as
`already_persisted`; a conflicting duplicate fails closed without overwriting the
existing audit row.

Every row has an explicit constrained `entry_kind`: `bounded_manual_proof` or
`scheduled_shadow_collector_canary`. Source is never inferred from a build
marker. Canary rows use canary-specific safe operator messages and carry only a
bounded daily claim identifier/status. Duplicate comparison includes this source
kind. The database no-effect constraint also requires the source receipt fact
`supabase_writes_executed = false`; the separate audit insert does not rewrite
that execution fact.

## Flag and Timing

`TURE_BOUNDED_PROOF_DURABLE_AUDIT_ENABLED` is disabled unless exactly `true` or
`1`. It is independent of the Action 568 execution flag. After Action 571 creates
and records its canonical receipt, an enabled audit flag permits one audit-write
attempt. A failed audit write never retries the provider request and does not
invalidate the proof receipt.

## Readback and Import

Authenticated GET readback is available at:

`/api/automation/continuous-intelligence/shadow-collector/bounded-execution-proof/audits`

It fetches either the latest row or an exact bounded `receipt_id`, never arbitrary
filters or pagination. The separate authenticated POST import route ends in
`/audits/import`; it requires the durable-audit flag and accepts exactly one
canonical sanitized receipt. It recursively rejects prohibited keys before the
same idempotent adapter is used.

To import the first live proof, an operator must separately enable the audit flag,
submit the canonical sanitized receipt with `x-automation-secret`, then verify the
readback. This Action does not execute that procedure.

## Safety and Rollback

There is no browser invocation, provider call, token action, runtime reservation,
cache mutation, schedule, recommendation, scanner, ranking, confidence,
execution, broker, or learning effect. The table is RLS-enabled with no client
write policy. Rollback disables the Action 572 flag; no historical audit data is
modified. Recommended Action 573 is a separately authorized production migration
and one-time sanitized first-proof import verification.
