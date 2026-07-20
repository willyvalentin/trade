# Action 606 Architecture - Dormant Git Runner Authority Expiry

## Architecture Baseline

```text
approved resolver evidence
  -> approved executable revalidation evidence
  -> final-approved Git compatibility result
  -> approved worktree evidence
  -> future sequence-scoped authority package
       binds fixed 30-second expiry and immediate freshness policy
  -> future atomic one-shot stage consumption
  -> future fixed six-stage dormant runner
  -> pure stage evidence
  -> pure aggregate observation
  -> non-authoritative result exposure

runtime/API/UI/deployment
  X transition absent
```

Action 606 changes only the planned authority-package timing policy. It does not implement the package, consumer, storage, runner, process execution, repository inspection, or runtime entry point.

## Selected Timing Model

The selected lifetime is exactly 30 seconds:

```text
issuedAt = trusted server UTC timestamp
expiresAt = issuedAt + 30000 ms
```

The future package must reject any other delta. There is no caller-selected duration, environment override, feature flag override, renewal, refresh, grace period, or cache extension.

## Trust Boundary

```text
Untrusted caller
  X cannot provide time, expiry, duration, freshness, stage clock, revalidation shortcut

Source-controlled policy
  -> fixed 30000 ms duration
  -> exact timestamp grammar
  -> exact stage expiry checks
  -> exact terminal-state vocabulary

Future server-only issuer
  -> observes trusted time after separate review
  -> binds issue and expiry timestamps
  X does not grant runtime caller activation

Future atomic consumer
  -> checks expiry before each stage and aggregate
  -> consumes one stage at a time
  X not implemented by Action 606
```

## Why 30 Seconds

The six-stage sequence is intentionally narrow and local. A 15-second package could be too brittle once process startup, output neutralization, pure interpretation, and aggregate construction are included. A 60-second package widens stale authority without current timing evidence. Thirty seconds is the smallest balanced v1 decision: short-lived, source-controlled, and still plausible for the fixed six-stage read-only local sequence.

If future controlled timing evidence shows 30 seconds is unsafe or too broad, the value must change through a new reviewed policy or contract version.

## Freshness Rule

Authority issuance requires fresh prerequisite evidence in the same session:

```text
resolver evidence
  -> immediate executable revalidation
  -> compatibility result linked to executable identity/version
  -> approved worktree evidence
  -> sequence-scoped authority package
```

Compatibility cannot become authority. Revalidation cannot be skipped because a compatibility result exists. The package must carry `toctouEliminated:false`.

## Per-Stage Rule

Each stage must independently pass:

```text
package state check
  -> expiry check
  -> revocation check
  -> replay/concurrency check
  -> session/sequence/stage check
  -> executable/worktree revalidation check
  -> one-shot stage consumption
  -> exact process attempt by future runner
```

The package must still be unexpired before the next stage starts and before aggregate construction. A stage that started before expiry can produce bounded completion evidence, but expiry before the next stage prevents the next stage and prevents aggregate completion.

## State Machine

```text
issued
  -> partially_consumed
  -> consumed

issued
  -> partially_consumed
  -> failed_consumed

issued -> expired
issued -> revoked
issued -> replay_rejected
malformed input -> input_rejected
```

Terminal states do not recover. There is no reset, refresh, replay, reissue, or fallback.

## Fingerprint Graph

The future package fingerprint must bind:

```text
package identity
  + expiry policy identity
  + fixed 30000 ms duration identity
  + timestamp grammar identity
  + freshness policy identity
  + trusted-time boundary identity
  + session
  + sequence
  + stage catalog
  + resolver fingerprint
  + executable revalidation fingerprint
  + compatibility result fingerprint
  + worktree fingerprint
  + issuedAt
  + expiresAt
  + current package state
  + consumed stage ordinals
  + revocation and replay posture
  + authority/security false fields
  + result status and reason
```

Every downstream result must reject copied stale fingerprints, missing timing fields, wrong deltas, changed prerequisite fingerprints, changed stage order, and changed authority posture.

## Clock and Replay Limits

Trusted time is a future server-only implementation boundary. Action 606 does not choose a runtime time API and does not introduce a clock provider.

Replay and concurrency require a future atomic consumption record. A fingerprinted package alone is not enough. Expiry limits the replay window but does not enforce single-use behavior by itself.

## Prohibited Transitions

The expiry policy must not enable:

- Git execution;
- process creation;
- process observation;
- process termination;
- repository inspection;
- compatibility authority;
- repository-read authority issuance by itself;
- process authority issuance by itself;
- credential access;
- inherited environment;
- network access;
- runtime/API/UI/runner activation;
- Avanza or trading behavior;
- persistence or migration behavior;
- deployment behavior.

## Next Architecture Step

The next safe step is Action 607: implement the pure repository-read and process authority package contract using this fixed timing policy. That contract must remain pure, dormant, source-controlled, non-authoritative at runtime, and independently reviewed before any storage, consumer, runner, or activation work.
