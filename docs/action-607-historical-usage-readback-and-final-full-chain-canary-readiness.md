# Action 607 - Historical Usage Readback and Final Full-Chain Canary Readiness

## Historical Usage Contract

The new authenticated, read-only usage-accounting route accepts an optional
`utc_date` in canonical `YYYY-MM-DD` form. It defaults to the current UTC day,
rejects malformed and future dates, and accepts at most 31 completed UTC days
of history. It performs only ledger and claim reads; it cannot issue a
credential, call a provider, create a claim, write audit or ledger data, or
change flags or schedules.

The response names the queried UTC date and separates:

- scheduled shadow canary attempts and estimated credits;
- bounded manual proof attempts and estimated credits;
- total ledger attempts and estimated credits; and
- claim-capacity attempts and estimated credits.

Scheduled-cap enforcement remains based only on
`scheduled_shadow_collector_canary` entries.

## Production Readiness Evidence

Read-only production checks confirmed:

- issuance readiness: `diagnostic_ready`;
- activation readiness: `ready_for_one_manual_canary_attempt`;
- provider, calendar, planner, and exact `377 / 57 / 320` policy: ready;
- audit contract facts: ready;
- canary disabled, kill switch active, and all schedule signals absent;
- active authorizations and leases: `0`;
- nonterminal claims: `0`;
- historical durable state: one completed claim, one manual ledger entry, one
  estimated credit, one provider call, and zero audit rows.

The prior direct read-only production aggregate confirmed the Action 604
record is on UTC `2026-07-22` with scheduled usage `0 / 0`, bounded manual
attempts `1`, bounded manual estimated credits `1`, total ledger credits `1`,
and claim-capacity estimated credits `1`.

## Deployment Boundary

This worktree now contains the historical route and its tests, but the user
requested no deployment in Action 607. Consequently, the new endpoint cannot
yet be invoked against production. No production credential, execution,
provider call, claim, audit, ledger write, flag, or schedule action occurred.

## Decision

`blocked_historical_usage_and_final_readiness`
