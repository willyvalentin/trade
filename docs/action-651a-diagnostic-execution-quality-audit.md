# Action 651A — diagnostic execution quality and audit foundation

## Boundary

This successor is additive to
`ff34b3884ee84777af44e380c0fb7e66bc99e9e1` and is local, in-memory and
default-off. It evaluates synthetic execution replay quality only. It neither
creates real-broker evidence nor makes a performance claim.

The enabled path accepts a runtime-proven Action 650S preparation and an
Action 650U manual-confirmation capability. It invokes the confirmed synthetic
650U replay once, verifies the consumption receipt and replay evidence digests,
and binds:

- execution, lifecycle and runtime identity;
- handoff and canonical payload identity;
- confirmation request, capability, session and consumption receipt;
- idempotency and correlation identity;
- confirmed replay evidence, terminal evidence and failure provenance.

Structural capability clones, cross-execution substitutions and one-shot reuse
are classified `conflicting`. Missing confirmation is `incomplete`. A
capability that expires before replay consumption is `incomplete`. A valid
confirmation whose waiting latency exceeds the explicit diagnostic ceiling is
classified late and `incomplete`.

## Temporal and price projections

All four durations are decimal integer nanoseconds:

```text
planned → waiting_for_manual_confirmation
waiting_for_manual_confirmation → confirmed
confirmed → simulated_submission
simulated_submission → simulated_terminal
```

The closed audit taxonomy is:

```text
audited
incomplete
conflicting
not_point_in_time_safe
unmappable
```

Planned order prices come only from the verified preparation. The confirmed
price is explicitly labelled `synthetic_manual_confirmation_fixture`. The fill
is explicitly labelled `synthetic_replay_fixture`; its slippage arithmetic is
kept in that separate projection. None of those projections may be interpreted
as a provider observation, real fill, execution-quality performance result or
production audit record.

The golden matrix represents the same instants as UTC with full fractions, UTC
with alternate spelling, Stockholm `+02:00`, New York `-04:00`, and reversed
input order. Enabled replay canonicalizes instants and orders synthetic events
before evaluation, yielding byte-identical diagnostic evidence.

## Zero-work gate

`enabled !== true` returns a prebuilt disabled result after reading only the
enable flag. An active kill switch returns a prebuilt killed result after only
the two gate reads. Both paths return before request traversal, provenance
checks, object cloning, replay authority, capability consumption and hashing.

## Structural exclusion

The implementation imports only the closed Action 650S/650U successor graph.
It has no route, UI, provider, transport, persistence or process integration.
No dependency, migration or lockfile is introduced.

Invariant evidence:

```text
diagnostic_only:true
real_broker_evidence:false
performance_eligible:false
automatic_execution_allowed:false

real_broker_submission:false
avanza_live_access:false
credential_access:false
automatic_execution:false
trade_mutation:false
production_write:false
```

The output additionally fixes all provider calls, persistence operations,
order/trade/position mutations and process spawns at zero.

## Delivery boundary

Action 651A creates exactly five normative artifacts: implementation, fixture,
focused test, this contract, and a machine-readable golden report. It performs
no staging, commit, push, pull-request mutation, deployment or live execution.

The inherited broad and restricted baseline failures remain explicitly outside
this successor and must continue to be reported as failures rather than
relabelled green.
