# SV-A.2 Observation-Cycle Readback Consumer Transition

## Product capability

The authenticated dashboard's compatibility readback now consumes the generic,
owner-bound `observation_cycle_receipts` contract for two distinct facts:

- the latest attributable observation attempt; and
- the latest completed discovery/evaluation result.

Those facts are intentionally not collapsed. A newer `no_request`, rejected
data receipt or active attempt can be the latest attempt while an earlier
completed `no_trade` remains the latest completed evaluation. `no_trade` is a
valuable terminal engine outcome with zero publications; it is not renamed to
a recommendation, counted as alpha or treated as strategy-quality evidence.
A published cycle retains its publication count and maps to the historical
`recommendation_created` compatibility label.

Only valid receipts for the requested New York trading date are considered.
Manual/diagnostic triggers are excluded. The attributable quarter-hour slot,
or trigger time when there is no slot, controls date attribution and ordering.
Receipt generation/finalization times remain visible as separate facts, so a
late write cannot make an older cycle appear newer than a later attempt.

## Compatibility and rollback

The historical scan-log, `scheduled_scan_*` and recommendation-run projections
remain intact as a named fallback. The dashboard compares the generic
projection with that fallback by attributable event time. This preserves
closed-market and historical behavior where no eligible generic receipt exists,
without allowing the legacy surface to hide a newer generic `no_trade` or
`no_request` result.

No legacy table, row, index, function, API field or diagnostic is deleted. The
new projection is a pure browser-side compatibility adapter and can be rolled
back by removing its selection from `TradeApp`; the durable receipt remains
unchanged.

## Decision traceability

Market Diagnostics continues to expose trigger, admission, provider request,
provider response, freshness, discovery/evaluation and publication. It now also
shows the v2 retry/cadence facts needed to explain when another observation may
be admitted:

- cadence anchor timestamp;
- cadence anchor source (`recommendation_scan_run`, generic cycle receipt or
  none); and
- whether the active retry chain includes a pre-run failure.

The projection and diagnostics are read-only. Their authority objects remain
inert: they cannot arm a scheduler, reserve or spend provider credits, change a
ranking or publication policy, create paper activity or reach a broker.

## Acceptance evidence

Local CLOSED evidence on `codex/observation-cycle-readback-consumer`, based on
exact main `89c8764c15307badfd374a298ea447815dca1721`:

- six projection tests cover `no_trade` versus later `no_request`, published
  compatibility, New York date boundaries, delayed finalization ordering,
  delayed delivery across midnight and unavailable/invalid input;
- 57 focused projection, receipt, v2 admission, diagnostics, dashboard and
  decision/outcome tests pass;
- the broader 180-test Basic Free, scheduler, discovery, dashboard and
  decision/outcome regression passes;
- strict TypeScript, changed-file ESLint and `git diff --check` pass;
- scheduled-runtime packaging and a complete Next 16.3.4 webpack production
  build pass.

Protected PR/CI, merge, exact-main production deploy and environment behavior
are not established by this local checkpoint. A later
bounded OPEN cycle must demonstrate that production readback selects the exact
generic receipt and retains the correct legacy fallback. That observation can
prove delivery and readback behavior, not market-wide coverage, recommendation
quality or alpha.
