# Action 666AQ — Governed Improvement End-to-End Replay

## Scope

`canonical_governed_improvement_end_to_end_replay_v1` is a server-only,
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

Either gate returns before dependency access, request reads, cloning, trust
lookups, capture, adapter replay, proposal build, stage projection, or digest
work. Counters prove all of those operations remain zero.

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
