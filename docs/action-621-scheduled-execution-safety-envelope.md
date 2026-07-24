# Action 621: Scheduled Execution Safety Envelope

## Decision

`scheduled_execution_safety_envelope_ready`

Action 621 adds local safety contracts and read-only dry evidence only. It does
not deploy, declare a schedule, enable scheduled execution, change a flag,
admit a production claim, contact a provider, or write an audit or ledger row.

## Policy Contract

`continuous_intelligence_shadow_canary_scheduled_execution_policy_v1` is a
strict server-owned canonical object. It fixes the `377` total daily ceiling,
`57` hard reserve, `320` scheduled normal maximum, two scheduled attempts and
two scheduled credits per UTC day, one provider call per invocation, one active
scheduled claim, and one claim per completed regular-session 30-minute window.

The policy permits only `AAPL` at `5min`. Publication and trade execution are
false. Reserve consumption and provider-failure retry are false. The parser
accepts only the exact canonical object, rejects malformed or client-modified
variants, and has deterministic JSON serialization for the future admitted
metadata snapshot.

## Budget Model

The pure evaluator takes historical scheduled ledger usage, bounded-manual
ledger usage, total ledger usage, claim-capacity usage, and the fixed one-call,
one-credit invocation estimate. It returns one of:

- `scheduled_budget_ready`
- `scheduled_attempt_limit_reached`
- `scheduled_credit_limit_reached`
- `scheduled_window_limit_reached`
- `scheduled_concurrency_limit_reached`
- `reserve_protected`
- `usage_disagreement`
- `historical_usage_unavailable`
- `unknown`

Manual and scheduled ledger scopes remain separately visible. Their sum must
equal total ledger usage, and total ledger usage must equal claim-capacity
usage. Any disagreement or unreadable value blocks. Scheduled work cannot
borrow from a future window or the 57-credit hard reserve.

## Enablement Boundary

Scheduled execution receives only an internal capability dependency. The only
capability supplied by the read-only route is
`scheduled_execution_enabled: false`, with `source: server_internal`. It is not
derived from a client request or an environment update. Even a future enabled
capability must still satisfy the Action 619 admission gates, valid policy,
ready budget, clean persistence state, and a claim-admitted handoff before it
can report `scheduled_execution_handoff_ready`.

The current dry route reports `scheduled_execution_disabled_locally` when all
readiness evidence is otherwise clean. It has no import or path to claims,
attempt transitions, finalization, provider execution, audit persistence, or
ledger persistence.

## Persistence and Retry Safety

Read-only scheduled state maps distinct stops to:

- `unresolved_finalization_failure`
- `unresolved_audit_failure`
- `unresolved_ledger_failure`
- `unresolved_usage_mismatch`
- `persistence_state_unavailable`

The retry matrix is fixed: unadmitted and distinct occurrences require fresh
admission; claimed or attempted occurrences block; completed occurrences return
the terminal result; provider failures are terminal because automatic retry is
disabled; internal or persistence failures block future work. A deployment
change produces a distinct occurrence and requires fresh admission. Neither the
route nor Netlify wrapper contains a retry loop.

## Correlation Model

The canonical scheduled correlation contains only source, policy version,
deployment commit, occurrence, claim, execution, market request fingerprint,
audit receipt, ledger receipt, and market window. Scheduled IDs use the
`scheduled_canary_execution_` namespace and remain distinct from manual IDs.
The source receipt and ledger ID are derived from the same admitted occurrence,
so future audit and ledger writes can be linked without storing scheduler
secrets, credentials, provider payloads, or client nonces.

## Dry Evidence

The scheduled-admission route returns sanitized authentication and admission
evidence plus budget status, active-claim status, persistence-stop status,
internal execution-enabled state, and final dry decision. It does not return a
scheduler secret, header, service key, raw database result, provider payload,
or unapproved credential material.

## Schema Assessment

No migration is required. Existing claim columns and atomic RPCs already hold
the required bounded scheduled IDs, market fingerprint, date-scoped capacity,
and eventual source-receipt linkage. Action 621 introduces policy and
correlation contracts in application code only.

## Test Evidence

Focused coverage verifies canonical policy parsing, client-override rejection,
reserve preservation, every budget category, manual/scheduled separation,
disabled execution, enabled-but-blocked behavior, persistence guards, retry
rules, deterministic correlation, namespace isolation, and the absence of
provider or durable-write reachability in the dry route and safety context.

## Recommended Action 622

**Action 622 - Server-Controlled Scheduled Execution Chain** should create one
separate, explicitly feature-gated server workflow that consumes this safety
envelope and invokes the existing shared core in order: recheck, atomic claim,
begin-attempt, one provider request, finalization, linked audit, and linked
ledger. It must not add a Netlify cron or enable scheduled execution until that
chain has isolated and production-readiness validation.
