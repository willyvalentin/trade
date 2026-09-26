# SV-A.2 Bounded Observation-Series Control

## Product behavior

This CLOSED delivery turns the roadmap's multi-observation prerequisite into a
default-off, fail-closed runtime contract. It does not activate an observation
series. When separately armed, one immutable series is bound to:

- one New York trading date;
- one inclusive, quarter-hour-aligned start and one exclusive expiry;
- no more than 390 minutes and 26 scheduler opportunities;
- an explicit maximum number of admitted current-data cycles;
- an independent provider-credit ceiling in eight-credit Basic Free units;
- automatic stop after a publication, an unresolved prior cycle, three
  consecutive failures (including pre-provider failures), the attempt cap, the
  credit cap or expiry.

A completed `no_trade` does not stop the series. The existing observation-cycle
freshness/cadence/backoff policy still decides whether a particular eligible
scheduler opportunity needs current data. The series controller is a second,
independent safety envelope; both must admit before provider reservation.

## Configuration contract

The controller is disabled unless all of these function-scoped production
values form one valid contract:

- `TURE_OBSERVATION_SERIES_ENABLED=true`
- `TURE_OBSERVATION_SERIES_DATE`
- `TURE_OBSERVATION_SERIES_START_SLOT_UTC`
- `TURE_OBSERVATION_SERIES_EXPIRES_AT_UTC`
- `TURE_OBSERVATION_SERIES_MAX_ATTEMPTS`
- `TURE_OBSERVATION_SERIES_MAX_PROVIDER_CREDITS`

The start/expiry must be canonical quarter-hours on the configured New York
date. The credit cap must be a positive multiple of eight and cannot exceed the
attempt cap multiplied by eight. A deterministic series identity binds all
fields and the fixed failure-stop policy. Missing, malformed, cross-date or
over-wide configuration rejects before a durable claim or provider request.

Series mode and normal one-shot mode are mutually exclusive. Global
`TURE_DISABLE_SCHEDULED_FUNCTIONS` must remain `true`; catalog observation,
catalog probe, outcome evaluation and internal-paper workers must remain off.
This keeps other scheduled capabilities inert while only the bounded scan
series can use an eligible scheduled event.

## Durable evidence and authority

The Netlify scheduler stores the parsed series contract and exact slot
admission in its pre-route durable attempt claim. The private route requires the
same series identity, exact scheduled slot and immutable production build
identity, then derives cumulative state from strictly parsed, owner-bound
observation-cycle receipts selected server-side from the complete half-open
series window. Partial/unavailable history, owner mismatch,
unexpected per-attempt credit ceilings or malformed receipts reject.

Each route update persists the runtime series admission and its counts in the
scheduled-attempt payload. The existing atomic Basic Free reservation remains
the only provider-spend authority. Series control cannot arm itself, call a
provider, reserve credits, change ranking/publication, create paper work or
reach a broker.

## Acceptance and remaining OPEN evidence

CLOSED acceptance requires adversarial tests for malformed configuration,
before-start/expiry behavior, scheduler identity mismatch, unavailable history,
owner isolation, unresolved overlap, truthful `no_trade`, publication stop,
failure stop, attempt cap and credit cap. It also requires strict TypeScript,
lint, scheduled-runtime packaging, the relevant integrated regression and a
production build.

Merge/deploy still leaves the controller disabled. Before any OPEN use, freeze
one exact date/window/cap contract, verify the production deploy identity,
provider/session rights and remaining daily budget, and obtain attributable
receipts for every eligible slot. OPEN delivery success is not evidence of
strategy improvement or alpha.
