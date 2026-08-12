# Action 666AQ — Governed Improvement End-to-End Replay

## Scope

`canonical_governed_improvement_end_to_end_replay_v2` is a server-only,
fixture-only, default-off orchestration contract. It composes:

```text
completed upstream evidence
→ canonical_completed_improvement_evidence_capture_v2
→ canonical_completed_improvement_evidence_adapter_v2
→ canonical_model_improvement_proposal_v1
```

It adds no producer, route, persistence, provider, database, model-training,
parameter-change, threshold-change, promotion, or live-ranking call-site.

## Terminal taxonomy

The terminal status is exactly one of:

- `completed`: every stage was rebuilt and verified. The contained proposal
  status is exactly `proposal_ready`, `no_change`, `research_only`, or
  `insufficient_evidence`.
- `conflicting`: a canonical stage verified a semantic contradiction,
  collision, or trust/lineage drift.
- `incomplete`: required completed producer evidence or joinable lineage is
  unavailable.
- `rejected`: an untrusted intermediate projection, stage result, or final
  result failed deterministic full rebuild.

`completed` is evidence assembly only. It is never approval to execute an
experiment, train a model, change a parameter or threshold, promote a model,
publish performance, or alter live ranking.

## Authority and rebuild boundary

The harness accepts only an explicit completed capture request and
dependency-injected, read-only authorities/lookups. It does not accept
caller-supplied capture, adapter, proposal, or approval results.

Each stage is executed canonically and then verified independently:

1. Capture is rebuilt through
   `verifyCanonicalCompletedImprovementCaptureResult`.
2. Adapter replay is rebuilt through
   `verifyCanonicalImprovementReplayResult`.
3. The governed proposal is rebuilt through
   `verifyCanonicalModelImprovementResult`.
4. The independently rebuilt proposal must be byte-equivalent to the
   proposal result embedded by the canonical adapter.

The optional untrusted stage projection boundary exists only to prove that a
dependency-injected result cannot become authority. Its output is always
compared with a fresh canonical rebuild. Even a self-consistent alternative
payload with recomputed internal digests becomes `rejected`.

The v2 harness snapshots the complete outer request and every dependency
method at construction. Active options and dependency shells are exact
data-property objects; accessors, hidden keys, symbols and unexpected keys are
unavailable. Request and result Proxies or otherwise uncloneable runtime
surfaces have no replay or verification authority. Verification requires a
module-private recognized harness, not caller-supplied dependencies, and a
copied harness cannot verify a result.

Final result equality is recursive and exact, including every own key and
explicit `undefined` value; digest equality alone does not grant verification
authority.

Capture, adapter, and proposal previous-binding sources are separate,
strictly read-only dependencies. Their observed semantics are bound by their
respective stage results; they cannot write a binding or repair evidence.
Adapter- and proposal-stage lookup observations additionally bind the stage,
lookup contract/version, capture request identity, queried proposal or
experiment identity, expected and observed binding digests, sanitized
`absent | matching | conflicting | lookup_failed` status, and an observation
digest. Consequently, `absent` and `matching` evidence produce different
lineage and end-to-end digests even when the proposal result is otherwise
identical.

## Canonical lineage

Every terminal result binds a sorted, versioned stage inventory and its
digest. A completed lineage additionally binds:

- capture identity, capture digest, terminal digest, and all observed
  previous/capture-binding observations;
- adapter bundle identity, observed and expected bundle digests, mapping
  status/reasons, replay digest, and mapping digest;
- proposal identity, canonical proposal digest, status, and optional
  experiment preregistration identity;
- metric and multiple-testing policy/evidence;
- cohort, period, and complete opportunity membership;
- baseline/candidate version tuples;
- outcome/evaluator and explanation lineage;
- proposal, feature/context, and training-input trust roots;
- every stage contract/version;
- stage-inventory, lineage, and final end-to-end digests.

Diagnostic failure paths preserve the verified partial lineage without
inventing absent downstream identities.

## Default-off contract

The defaults are:

```text
enabled: false
kill_switch_engaged: true
```

Activation requires literal `enabled: true` and literal
`kill_switch_engaged: false`. Every omitted, null, string, numeric, object or
opposite boolean gate value returns before dependency access, request reads, cloning, trust
lookups, capture, adapter replay, proposal build, stage projection, or digest
work. Execution counters are module-private and exposed only as frozen
snapshots; an optional caller counter object is validated and never mutated.

## Current-main fail-closed reconciliation

The v2 rebuild uses the private verifier authorities introduced by the
current-main capture, adapter and proposal foundations. A capture request that
cannot be independently snapshotted and rebuilt is `rejected`, even if the
historical v1 contract classified its missing producer data as merely
`incomplete`. Canonical adapter/proposal insufficiency remains `incomplete`.

Lookup methods and untrusted projection functions are captured once at harness
construction. Previous-binding lookup returns must be exactly either `null` or
one plain `{ semantic_digest }` record; accessors, extras, symbols, malformed
digests and exceptions are sanitized as lookup failure. The outer request has
an exact, mandatory namespace/version/capture shell: both outer literals and
the canonical capture-request literals, own data keys and shallow value types
must match before verifier eligibility. The five explicitly forbidden
caller-authority names remain readable solely to produce the canonical conflict
classification.

## Interpretation boundary

All outputs declare:

```text
shadow_only: true
live_ranking_effect: false
persistence_performed: false
automatic_training_allowed: false
automatic_parameter_change_allowed: false
automatic_threshold_change_allowed: false
automatic_model_change_allowed: false
automatic_promotion_allowed: false
external_ai_canonical_truth_authority: false
causal_improvement_claimed: false
synthetic_evidence: true
not_publishable: true
```

External AI cannot create, replace, approve, or alter canonical truth at any
stage. This literal terminal safety field is part of every replay projection
and therefore part of its canonical end-to-end digest.

The golden report is synthetic contract evidence. It is not Ture
performance, causal evidence, operational approval, or a live model-change
decision.
