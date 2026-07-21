# Action 574: Scheduled Shadow Collector Canary Foundation

The canary is a future scheduled shadow-only collector, not a scanner or an
execution path. It has one fixed ticker (`AAPL`), `5min` candles, one completed
30-minute regular-session range, one provider request, one estimated credit, a
five-second timeout, no retries, and no reserve charge.

`TURE_CONTINUOUS_INTELLIGENCE_SHADOW_CANARY_ENABLED` must be exactly `true` or
`1`; `TURE_CONTINUOUS_INTELLIGENCE_SHADOW_CANARY_KILL_SWITCH` must be exactly
`false` or `0`. Missing or malformed values block the canary. Action 568, 572,
and 573 flags cannot enable it.

The canary needs durable usage metadata before preflight and, critically, a
successful atomic claim before execution. The dedicated daily-claim table and
database RPC serialize claims by UTC day under a transaction-scoped advisory
lock. At most two one-credit claims can exist per UTC day across serverless
instances. A deterministic execution identifier makes a duplicate invocation
idempotent; it cannot consume a second claim or make a second provider call.
Claims are never optimistically authorized from a read and are retained after a
provider failure, so attempted capacity cannot be silently reused.

Capacity reservation alone is not provider authorization. After claiming, the
route must win a second atomic database transition from `claimed` to `attempted`.
Only `attempt_started` may enter the provider boundary. Concurrent duplicates
observe `attempt_in_progress`; terminal duplicates observe `already_completed`
or `already_failed`. Identity, fingerprint, contract, missing-row, and RPC
failures all collapse safely to `daily_usage_unavailable`. A failed terminal
attempt is never reset or retried.

Terminal state is also database-owned. The dedicated finalization RPC receives
the same frozen claim ID, execution ID, request fingerprint, and contract version
used by claim and begin-attempt. It permits only `attempted -> completed` or
`attempted -> failed`; direct table updates are not an authorization path.
Concurrent finalizers have one winner, while terminal duplicates report
`already_completed` or `already_failed` without mutation. Missing or mismatched
identity fails closed. If finalization cannot be proven, the receipt conservatively
retains `attempted` rather than fabricating a terminal result.

The route currently fails closed because no server-side verified holiday calendar
source is wired; it never guesses through a holiday. Once all static gates pass,
ordering is: atomic claim, immediate non-provider Action 568 runtime/configuration
recheck, atomic begin-attempt, at most one provider request, atomic finalization,
then sanitized audit and ledger writes. An unavoidable validation failure after
begin-attempt is a retained failed attempt. It is finalized with
`provider_attempted = false` when the injected provider function was never
entered, consumes daily capacity, and cannot retry.
An unprovable claim is `daily_usage_unavailable`; a reached cap blocks before the
provider.

Routes are POST-only and authenticated:

- `/api/automation/continuous-intelligence/shadow-collector/canary/preflight`
- `/api/automation/continuous-intelligence/shadow-collector/canary`

`netlify/functions/scheduled-shadow-collector-canary.ts` is an unscheduled
foundation only. It intentionally contains no Netlify cron configuration. When
eligible in a later action, receipt creation precedes optional Action 572 audit
and Action 573 `scheduled_shadow_collector_canary` ledger persistence. No audit,
ledger, or provider retry is introduced.

The receipt is built from the defensively cloned Action 568 preflight and exact
Action 565 planner authorization captured for that execution. It records the
actual normalized provider metadata and daily claim identity/status. Receipt
construction never rebuilds a plan and never substitutes `within_budget` or a
configured-provider assumption for historical truth.

Rollout stages: deploy flags off; apply/verify migrations; enable and verify
audit/ledger; observe preflight; execute one separately authorized manual canary;
consider schedule activation only in Action 575. Rollback disables the canary or
sets its kill switch true. There are no recommendation, scanner, ranking,
confidence, position, execution, broker, cache, or schedule effects in this
foundation.
