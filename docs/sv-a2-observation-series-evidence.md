# SV-A.2 Observation-Series Evidence Readback

## Product behavior

This CLOSED delivery adds the missing post-series evidence reader for the
default-off observation-series controller. It does not arm or run a series.
After cleanup removes the environment flags, the authenticated dashboard can
still reconstruct the latest frozen series from durable scheduler claims and
owner-bound generic observation-cycle receipts.

The reader first finds the latest scheduler claim carrying the versioned
series contract. It then reloads the complete half-open series window with
count-checked server queries and joins every cycle receipt to its exact claim,
slot and immutable Netlify production build identity through the same runtime
lineage policy that protects provider admission.

The browser report separates:

- operational delivery and containment;
- claim/receipt integrity and missing, orphaned or duplicate evidence;
- provider attempts, reserved credits, responses, errors and stale inputs;
- discovery, ranking, selection, build, publication and `no_trade` counts;
- recommendation quality, which remains `not_evaluated` or
  `insufficient_forward_evidence` for a single observation series.

A series can therefore pass its operational contract while honestly producing
zero recommendations. It cannot pass recommendation quality merely because it
ran, used credits, found candidates, published once or returned `no_trade`.

## Fail-closed boundaries

The server reader is read-only and owner-bound. It uses existing service-role
relations and adds no schema, grant or migration. The public/authenticated Data
API surface does not expand. It rejects or marks unavailable:

- malformed or missing series controls;
- incomplete count-checked window reads;
- partial or invalid generic-cycle history;
- changed deploy identity, duplicate claim or slot, orphan/duplicate receipt,
  owner mismatch or missing prior receipt;
- a current claim that has no receipt after the bounded 90-second delivery
  grace;
- an active receipt that remains unresolved after the same grace.

The readback authority is fixed false for scheduler arming, provider calls,
credit reservations, ranking changes, publication, paper trading and broker
orders. It reports persisted evidence; it cannot create any of those effects.
The browser imports only a client-safe structural decoder. Exact claim-lineage
evaluation remains in the server builder, so server-only cryptographic policy
dependencies cannot enter the client bundle.

## CLOSED acceptance and remaining OPEN evidence

CLOSED acceptance covers a complete attributed zero-publication series, a
publication stop, bounded in-progress delivery, missing-receipt escape,
cross-build attribution failure, parser tampering, authenticated dashboard
wiring, strict TypeScript, lint, provider-free CI registration, integrated
series regressions and the production build.

The first real OPEN series remains separately frozen and authorized. Its
acceptance requires exact production claims and receipts for every delivered
slot, the declared credit cap, truthful stop/expiry behavior and post-cleanup
browser readback on the same deployed revision. That observation can verify the
delivery mechanism; it cannot by itself prove alpha or improve a policy.
