# Action 576 - Verified US Market Calendar Integration

## Outcome

Action 576 adds a deterministic, repository-pinned U.S. equity calendar for
NYSE/Nasdaq regular sessions. It supplies canary range planning, canary
preflight, and activation-readiness facts without runtime calendar requests.

The canary remains disabled, its kill switch remains unchanged, and no schedule
is declared or activated.

## Authority And Provenance

- Source category: `repository_pinned_official_exchange_calendar`
- Primary organization: New York Stock Exchange
- Primary dataset: [NYSE Holidays and Trading Hours](https://www.nyse.com/trade/hours-calendars)
- Primary yearly reference: NYSE yearly trading calendars for 2026-2028
- Cross-check organization: Nasdaq Stock Market
- Cross-check dataset: [Nasdaq U.S. Equity and Options Markets Holiday Schedule](https://www.nasdaqtrader.com/trader.aspx?id=Calendar)
- Retrieved and reviewed: 2026-07-22
- Coverage: 2026-01-01 through 2028-12-31
- Recommended refresh: 2028-07-01
- Dataset fingerprint: `fnv1a32:6aa61e36`
- Review status: `reviewed`

The compact dataset stores the official holiday and early-close exceptions.
Ordinary weekdays are regular sessions only inside the reviewed coverage
window. Weekends are closed explicitly by contract. Federal-holiday status is
never used to infer a market closure.

## Dataset Contract

The pinned JSON contains:

- fixed contract and calendar versions
- `America/New_York` timezone
- bounded coverage and refresh dates
- standard 09:30-16:00 ET session
- sorted, unique holiday, early-close, and optional special-closure exceptions
- source organizations, document names, retrieval date, generation method, and
  review status
- deterministic fingerprint

Validation is all-or-nothing. A bad contract, timezone, date, ordering,
duplicate, provenance field, session range, weekend opening, or fingerprint
marks the dataset invalid. Invalid data is never partially accepted.

## Session Model

Supported session types are:

- `regular_session`
- `early_close_session`
- `closed_weekend`
- `closed_holiday`
- `closed_special`
- `unknown`

Regular sessions run 09:30-16:00 ET. Reviewed early closes run 09:30-13:00 ET.
Open and close instants are converted from New York wall time to UTC with the
IANA timezone, preserving spring and autumn DST behavior.

## Range Selection

The canary requests one AAPL `5min` range of exactly 30 completed minutes.

- During an open session, it chooses the latest fully completed 30-minute block.
- At or before the first completed block, it uses the final block of the latest
  prior verified open session.
- At and after close, it uses the final completed block ending at session close.
- Weekends and holidays use the latest prior verified open session.
- Early-close ranges never exceed 13:00 ET.
- Stale, invalid, or out-of-coverage calendars fail closed.

Planning performs no provider call.

## Freshness Policy

- `current`: more than 180 days before the recommended refresh date
- `expiring_soon`: within 180 days before the refresh date
- `stale`: on or after the recommended refresh date while still covered
- `expired`: before or after the pinned coverage range
- `unverified`: invalid or unavailable source material

`current` and `expiring_soon` data may derive a range. `stale`, `expired`,
`unavailable`, and `invalid` states block canary range authorization.

## Integration

The canary and preflight routes call the pure calendar service with one injected
server timestamp. Preflight returns only sanitized calendar facts and a bounded
range. The activation-readiness route requires verified provenance, current
coverage, acceptable freshness, holiday awareness, early-close awareness,
regular-session determination, and a completed 30-minute range.

Schedule-state requirements are unchanged. A verified calendar can clear the
calendar blocker, but it cannot enable the canary, disable the kill switch, or
prove remote schedule absence.

TradeApp receives only passive summary fields. The exception dataset is not
returned to the browser or included in diagnostic JSON. Passive diagnostics
separate expected artifact contract/coverage from observed truth: without an
injected dataset validation and current-date evaluation, validation,
verification, freshness, current coverage, awareness, and range status remain
`not_observed`. Invalid validation overrides any supplied evaluation and is
reported only as sanitized `invalid`.

## No-Effect Guarantees

The calendar path performs no:

- runtime HTTP or webpage fetch
- Twelve Data request
- Supabase read or write
- durable claim, audit, or ledger mutation
- flag mutation
- schedule or cron declaration
- recommendation, scanner, ranking, confidence, execution, or broker action

## Refresh Procedure

1. Obtain the next official NYSE holiday/trading-hours table and a Nasdaq equity
   calendar cross-check.
2. Extend or replace only reviewed dates within an explicit bounded range.
3. Update provenance, retrieval date, coverage, and recommended refresh date.
4. Recompute the deterministic fingerprint.
5. Run dataset, DST, holiday, early-close, canary, readiness, and build tests.
6. Review and deploy through a separately approved scoped release.

## Rollback

Revert the calendar integration release. The prior behavior is fail-closed and
leaves the canary unavailable; no data rollback or migration is required.

## Next Action

Action 577 - Production Calendar and Readiness Verification. Verify the deployed
calendar and readiness route without executing the canary.
