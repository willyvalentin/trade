# SV-A.2 Observation-Series Activation Preflight

## Product behavior

This CLOSED delivery supplies the last pre-arm safety proof for the default-off
observation-series controller. It does not arm or run a series. An authenticated
operator supplies one exact New York trading date, quarter-hour start, exclusive
expiry, attempt cap and provider-credit cap. Ture then reads one atomic database
snapshot for the complete requested window rather than composing several
single-slot snapshots that could describe different moments.

The snapshot proves or rejects:

- the complete owner-bound Basic Free daily reservation total;
- prior reservations inside the requested series window;
- active reservations and the whole-series remaining 800-credit capacity;
- all service-owned scheduled claims on that date and inside the window;
- duplicate window slots, unresolved claims and claims without a canonical
  scheduled-slot identity;
- the fixed `800` daily and `8` per-minute budget declaration on every retained
  reservation.

The server combines that database decision with the exact parsed series control,
the build-packaged production deploy/commit/site identity, mutually exclusive
function flags, the effective Basic Free provider profile and exact `800` daily /
`8` per-minute budget configuration. Netlify exposes only a subset of build
metadata to Functions at runtime, so the route consumes the immutable identity
artifact generated before the same Next build rather than trusting unavailable
runtime variables. Global scheduled execution must remain disabled; series mode,
normal one-shot, catalog observation/probe, outcome one-shot and internal-paper
work must all still be off. The returned activation manifest expires after five
minutes and must expire before the proposed first slot.

## Security and authority

The additive SQL function is `STABLE`, aggregate-only, fixed-search-path and
callable only by `service_role`; `public`, `anon` and `authenticated` execution
are revoked. Reservation rows remain inaccessible to the browser. The
authenticated route returns no owner identifier and sets `Cache-Control:
no-store`.

A `ready` manifest cannot mutate environment values, create a deploy, arm a
scheduler, reserve credits, invoke a provider, change ranking, publish, create
paper activity or contact a broker. The existing atomic Basic Free reservation
at provider entry remains the only spend authority. Any config/deploy change,
elapsed validity window or intervening database activity invalidates the
preflight and requires a fresh read.

## Acceptance and remaining OPEN work

CLOSED acceptance requires adversarial parser and decision tests, exact build
and environment binding, local SQL execution for empty/overlap/duplicate/
unresolved/unattributed/owner-isolated states, strict TypeScript, lint,
integrated provider-free regressions, scheduled-runtime packaging and a full
production build.

After merge, the additive migration and deploy must be independently verified
while every observation-series flag remains off. A later OPEN contract must
freeze one exact deployed revision, session, date/window/caps and provider
budget, obtain a fresh ready manifest, arm only the named series, observe its
bounded scheduler receipts, clean up immediately and verify the post-series
evidence report. Operational success still does not establish alpha or strategy
quality.
