# First Tiny Historical Replay Signal Package Discovery Readback

This readback checks whether an existing AAPL signal package can be discovered
for the verified first tiny replay candle set. It is read-only and does not
create a signal package.

## Purpose

Action 301 verified that first tiny replay can read 73 persisted AAPL
`historical_candles` rows for `2026-07-08`, but replay stopped at
`replay_dry_run_completed_no_signal_package`.

Action 302 defined the package requirements. This action adds an explicit
readback path that can inspect existing recommendation sources and decide
whether a compatible signal package exists.

## Fixed Scope

- Ticker: `AAPL`
- Interval: `5min`
- Trading day: `2026-07-08`
- Candle source table: `historical_candles`
- Candle rows verified: `73`
- Candle window UTC: `2026-07-08T13:45:00.000Z -> 2026-07-08T19:45:00.000Z`
- Candle window NY: `09:45 -> 15:45`

The route rejects request-supplied scope overrides.

## Discovery Sources

The readback may inspect these existing sources:

- `recommendations` rows for AAPL on `2026-07-08`
- `recommendation_snapshots` rows for AAPL on `2026-07-08`

It does not add migrations, create rows, or mutate existing rows.

## Compatibility Criteria

A compatible future replay signal package must include:

- ticker `AAPL`
- trading day `2026-07-08`
- generated-at or analysis-cutoff timestamp
- direction
- entry
- stop
- target
- valid entry/stop/target geometry
- no future candle leakage relative to the verified candle window
- no broker or execution fields required

Missing fields are not fabricated. Candle data is not used to infer a signal.

## Route

Production verification command:

```bash
cd /Users/willysimonsson/Dev/trade
set -a
source .env.local
set +a

curl -s -X POST "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-signal-package-discovery-readback" \
  -H "Content-Type: application/json" \
  -H "x-automation-secret: ${AUTOMATION_SECRET}" \
  --data '{"run_signal_package_discovery_readback":true}' | jq '.'
```

Auth-only check:

```bash
curl -s -X POST "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-signal-package-discovery-readback" \
  -H "Content-Type: application/json" \
  -H "x-automation-secret: ${AUTOMATION_SECRET}" \
  --data '{"auth_check_only":true}' | jq '.'
```

Ping:

```bash
curl -s "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-signal-package-discovery-readback/ping" | jq '.'
```

Do not include real secrets in docs or screenshots.

## Expected Statuses

- `not_run`: diagnostics summary only; route has not been explicitly invoked.
- `readback_unavailable`: server Supabase service-role readback is unavailable.
- `blocked_schema_unknown`: both candidate source reads failed.
- `no_candidates_found`: reads succeeded but no candidate rows were found.
- `candidates_found_none_compatible`: candidates exist but required fields or
  geometry are incomplete.
- `compatible_signal_package_found`: at least one candidate has the required
  fields and passes conservative validation.

## No-Write / No-Replay Guarantees

These remain false:

- `provider_call_executed`
- `provider_call_attempted`
- `candles_persisted`
- `raw_response_persisted`
- `fetch_run_persisted`
- `synthetic_outcomes_persisted`
- `replay_executed`
- `scanner_behavior_changed`
- `live_ranking_changed`
- `recommendation_rows_mutated`
- `supabase_write_executed`

## Next Path

If a compatible package is found:

1. Review the signal package before replay.
2. Keep synthetic outcome persistence, scanner use, and ranking changes disabled.
3. Use a separate approval before any replay path consumes the package.

If none is found:

1. Create a static/manual signal package plan.
2. Keep synthetic outcome persistence, scanner use, and ranking changes disabled.
3. Do not infer entry, stop, target, direction, or analysis cutoff from candles.
