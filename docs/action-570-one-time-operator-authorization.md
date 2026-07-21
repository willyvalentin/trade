# Action 570: One-Time Operator Authorization

## Purpose

Action 570 adds a separate operator-authorization boundary before Action 568 can
attempt its one bounded provider request. Authentication and the execution flag are
necessary but not sufficient.

## Routes and Headers

Authorization issuance is POST-only at:

`/api/automation/continuous-intelligence/shadow-collector/bounded-execution-proof/authorization`

It uses `AUTOMATION_SECRET` through `x-automation-secret`, reuses the Action 568
request parser, builds the same Action 565 plan, and requires the canonical Action
569 preflight to be eligible. It performs no provider call and reserves no runtime
capacity.

The execution route requires the opaque token only in:

`x-ture-bounded-proof-authorization`

Tokens are never accepted in a query string or request body.

## Token and Storage Contract

Tokens use 256 bits of Web Crypto random data and are returned only in a successful
authenticated issuance response. The process-local store keeps only a SHA-256 token
hash, the exact normalized request fingerprint, timestamps, and state. It does not
persist to Supabase, files, browser storage, diagnostics, or logs.

The fixed TTL is 60 seconds. The store is capped at eight active records, including
process-local pending issuance reservations while token hashing is asynchronous.
Expired records are removed opportunistically and valid records are never silently
evicted. Token generation, hashing, and duplicate hash failures release their
reservation and fail closed without exposing token or hash details.

An authorization is tied to normalized ticker, interval, ISO start, and ISO end.
Changed request fields fail closed. Authorization is process-local and does not
survive cold starts, deploys, or cross-instance routing.

## Consumption Semantics

The execution route rechecks canonical safety gates, atomically changes a matching
issued record to `consuming`, then asks Action 568 to acquire runtime capacity and
recheck gates immediately before the provider attempt. The record is permanently
marked `consumed` after execution submission regardless of success, failure,
timeout, or last-moment safety block. A concurrent use sees `in_use` and cannot
start a second attempt.

## Preflight and No-Effect Boundary

Action 569 remains non-authorizing. It reports that operator authorization is still
required and that the issuance route exists, but it does not issue or reserve a
token.

Issuance and diagnostics execute no provider calls, consume no provider credits,
reserve no Action 568 runtime capacity, mutate no cache, write no data, create no
schedules, and do not change recommendation, scanner, ranking, confidence,
execution, broker, or position behavior.

## Rollout and Rollback

This work is uncommitted and undeployed. The Action 568 execution flag remains
disabled. Rollback removes the issuance route and process-local store; no migration
or persisted cleanup is needed.

## Recommended Action 571

Perform a separately authorized, read-only production preflight to verify the new
authorization boundary is present before any operator considers a single provider
proof attempt.
