# Action 666AC — Completed Improvement-Evidence Adapter and Replay Harness

## Scope

`canonical_completed_improvement_evidence_adapter_v2` is a server-only,
fixture-only projection boundary for completed Action 664–666 evidence. It
connects the already frozen canonical verifiers to the governed improvement
proposal engine without adding a live producer, persistence path, database
client, provider call, or recommendation call-site.

The adapter returns exactly:

```text
mapped
conflicting
unmappable
```

`mapped` means the completed producer bundle was joined to the separately
authorized proposal-registry post, every upstream result replayed successfully,
producer bindings matched canonical evidence, and the read-only previous-binding
lookup found no semantic collision. It does not mean that a proposal is approved:
the mapped proposal result may still be `research_only`,
`insufficient_evidence`, or `no_change`.

`conflicting` means present evidence is semantically contradictory, tampered,
not point-in-time safe, version-inconsistent, or collides with an existing
proposal/experiment binding.

`unmappable` means producer data or joinable lineage is absent. The adapter does
not synthesize candidate membership, outcomes, identities, versions, cohorts,
periods, metric inventories, or experiment metadata.

## Canonical verifier chain

The adapter reuses the existing canonical boundaries:

1. Action 664 pair-bound scorecard comparison, protected metrics, uncertainty,
   cohort, period, and denominator;
2. Action 665 complete pre-truncation opportunity membership and outcome
   lineage;
3. Action 666 baseline/candidate shadow replay and version provenance;
4. Action 666 frozen offline-learning rebuild and row-level split evidence;
5. Action 666 canonical predictive explanations;
6. the externally frozen proposal-registry authority;
7. a dependency-injected, read-only previous proposal/experiment binding
   lookup.

Caller fields such as `comparable`, `complete`, `reproducible`,
`out_of_sample`, `point_in_time_safe`, `trusted`, `approved`, or
`proposal_ready` have no authority and are rejected.

The completed producer binding must match the verified cohort and period,
metric-inventory digest, full baseline/candidate version tuples, row-stability
inventory, evidence root, and the exact experiment identity inventory. A
duplicate experiment identity or changed semantic binding is a conflict.

## Default-off replay

`canonical_improvement_proposal_replay_v2` is disabled by default and its kill
switch is engaged by default. Those gates run before request reads, cloning,
registry lookup, previous-binding lookup, upstream verification, proposal build,
or replay work. Runtime activation requires literal `enabled: true` and literal
`kill_switch_engaged: false`; omitted, malformed, truthy, accessor-backed, or
proxy-backed values remain closed with zero work.

When explicitly enabled in tests, the harness:

```text
frozen completed bundle
→ input digest check
→ canonical adapter
→ upstream verifier replay
→ read-only previous-binding lookup
→ governed offline proposal result
→ deterministic replay digest
```

Every replay result now contains a
`canonical_improvement_replay_input_projection_v1` projection. Successes and
failures bind the replay and adapter versions, bundle identity, observed input
digest, expected input binding, registry root and authority manifest,
applicable previous-binding request identity, mapping status, sorted reason
inventory, and either the verified mapping digest or an explicit fail-closed
failure projection. The projection has its own canonical digest and is included
in the outer replay digest.

Different inputs therefore cannot share replay evidence merely because they
produce the same status and reason codes. An independently rebuilt replay is
compared byte-for-byte by `verifyCanonicalImprovementReplayResult`. Rebuild
authority belongs to a module-private, frozen replay harness recorded outside
its public surface; a caller cannot forge a lookalike harness, replace its
public replay function, or change identity, input digests, adapter version,
status, reasons, or projection and then legitimize that result by recomputing
internal digests.

The request's `expected_bundle_digest` remains an explicit integrity binding,
not a caller-created registry authority. The separately recognized proposal
registry authority and canonical upstream verifiers remain the trust boundary.

Previous proposal and experiment lookups remain dependency-injected and expose
read methods only. Lookup exceptions are caught at that boundary, sanitized,
and returned deterministically as:

```text
status: unmappable
reason: previous_binding_lookup_failed
```

Backend exception messages and stack traces never enter canonical output.
Bundle-shape failures retain their separate structured reasons.

The active boundary accepts exact, enumerable data-property shapes only.
Lookup methods are captured once at construction, lookup return values are
validated recursively, and later replacement of caller-owned method properties
cannot change replay behavior. Replay requests reject missing, extra, hidden,
symbolic, accessor, cyclic, non-finite, sparse-array, or extra-array-key input
without throwing. Bundle snapshots clone all serializable caller data while
preserving only the already frozen, module-recognized registry-authority object
whose identity is required by the proposal engine.

Optional caller counter snapshots are input values, never mutable
instrumentation targets. The harness maintains private counters and publishes a
new deeply frozen snapshot on every read. Frozen caller counters therefore
remain unchanged and malformed counter shapes fail closed.

The previous-binding interface exposes lookup methods only. Neither the adapter
nor harness can write a binding. They also cannot execute an experiment, train
a model, change a feature, parameter, threshold, score, rank, or model, promote
a proposal, persist data, or affect live recommendations.

Every adapter and replay output permanently states:

```text
shadow_only: true
live_ranking_effect: false
automatic_training_allowed: false
automatic_parameter_change_allowed: false
automatic_threshold_change_allowed: false
automatic_model_change_allowed: false
automatic_promotion_allowed: false
causal_improvement_claimed: false
```

## Evidence interpretation

The golden report is synthetic fixture evidence only. It is not Ture
performance and is not publishable. A complete but diversity-insufficient input
is intentionally `mapped` to an `insufficient_evidence` proposal result: the
adapter can preserve valid producer evidence without weakening the proposal
policy.
