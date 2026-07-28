# Action 666AL — Independent Re-review of Capture Lookup-Observation Binding

## Decision

```text
action_666al_lookup_observation_binding_remediated: true
action_666al_collision_evidence_rebuild_verified: true
action_666al_terminal_capture_digest_binding_ready: true
action_666al_refreeze_complete: true
action_666al_independent_rereview_approved: true
action_666al_local_checkpoint_ready: true
```

The five-artifact remediated normative foundation is byte-frozen at:

```text
bb80f737a4910807cd01d16a3f5e0af84300482622c1f98eaf6f0a420a72b4f0
```

The Action 666AK predecessor freeze and rejected review remain
byte-preserved.

Finding counts:

```text
blocker: 0
major: 0
minor: 0
nit: 0
```

No normative artifact was changed after this re-review began.

## Regression evidence

- Action 666AJ/AL focused capture and interoperability tests: 19/19 passed.
- Relevant Action 665/666 suite: 240/240 passed.
- Action 664 foundation standard command: 163/163 passed, including both
  disposable local PostgreSQL matrices.
- TypeScript: passed.
- Scoped ESLint: passed with zero warnings.
- Golden, predecessor, and refreeze JSON parity: passed.
- `git diff --check` and explicit untracked-file whitespace scan: passed.
- Input-order determinism, byte-identical retry, deep-frozen input
  immutability, collision-evidence reconstruction, and independent terminal
  result rebuild: passed.
- Migration, dependency, lockfile, environment, secret, provider/DB-call,
  persistence, write, and live-import containment: passed.
- Refreeze digest before regression, after regression, and after review:
  byte-identical.

## Original finding closure

### 666AK-M1 — closed

The capture contract was lifted to
`canonical_completed_improvement_evidence_capture_v2`. Every previous-binding
and capture-identity lookup now produces a separately versioned
`canonical_completed_improvement_lookup_observation_v1` that binds:

- the exact lookup contract and lookup namespace;
- the canonical capture request identity;
- the queried proposal, experiment, or capture binding identity;
- observed status `absent`, `matching`, `conflicting`, or `lookup_failed`;
- observed and expected semantic digests;
- independently reconstructible collision identity and digest;
- a closed sanitized failure classification; and
- the lookup observation's own canonical digest.

The previous-proposal, previous-experiment, and capture-identity lookup
namespaces remain structurally distinct. Observation inventory validation
sorts canonically, rejects duplicate namespace/identity keys, and does not
accept caller-supplied observations or observation digests.

All terminal `captured`, `conflicting`, and `incomplete` results use
`canonical_completed_improvement_terminal_result_v1`. The terminal digest
binds the complete sorted observation inventory before the terminal result is
returned. Therefore:

- an identical producer bundle observed as `absent` and `matching` has
  different observation-inventory and terminal result digests;
- different observed collision digests have different collision evidence,
  observation digests, and terminal result digests;
- expected/observed binding drift, request-identity drift, namespace
  substitution, adapter/capture contract drift, status drift, and reason-code
  drift all change the canonical terminal evidence;
- independently rebuilding from the trusted request and read-only lookup
  dependencies rejects self-consistent caller recomputation of tampered
  terminal evidence.

Lookup exceptions and invalid lookup return shapes are converted to
deterministic `lookup_failed` observations. Exception messages, stack traces,
and backend values are not included in canonical output. Different backend
messages therefore produce byte-identical sanitized evidence for the same
request and failure class.

## Adjacent trust-boundary review

- Lookup observations are constructed only from dependency-returned values;
  the capture caller cannot submit an observation or finished digest.
- Capture-identity lookup and previous-binding lookup retain separate
  read-only interfaces and contract identifiers.
- Observed collision digests can be recomputed from the version, namespace,
  request identity, queried identity, observed binding, and expected binding.
- Invalid non-SHA lookup results fail closed without reflecting returned
  values into canonical evidence.
- Every golden terminal result passes the independent full-rebuild verifier.
- Direct `captured` output remains accepted by Action 666AC as deterministic
  `mapped` input without adapter special-casing or caller authority flags.
- Default-off and kill-switch paths perform zero request reads, clones,
  authority lookups, previous-binding reads, capture-binding reads, lookup
  observation construction, upstream verification, or bundle construction.
- Lookup dependencies expose read operations only; no persistence or write
  boundary was introduced.
- No route, UI, scanner, generator, writer, provider, database, or live
  consumer imports or invokes the foundation.
- Golden evidence remains explicitly synthetic, shadow-only, and
  non-publishable as Ture performance.

## Residual integration boundary

The package remains fixture-only, server-only, default-off, and disconnected
from production. Future use still requires separately authorized completed
Action 664–666 producer outputs, operationally owned external registry roots,
and operational read-only previous/capture binding sources. No such producer,
persistence, database, provider, or live integration is part of Action 666AL.
