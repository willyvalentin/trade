# SPÅR 2 — Action 666C: Shadow Foundation Independent Review

Review status: not approved against the frozen Action 666A–B byte set.

No Action 666A–B artifact was changed after the review started. Findings were
recorded but not remediated in Action 666C.

## Freeze evidence

- Branch: `codex/action-666a-ranking-confidence-shadow-evaluation`
- Base/HEAD: `29e6e25de8580fe252c9f49dc10deae6e4508b58`
- Frozen artifacts: 11
- Manifest:
  `docs/action-666c-shadow-foundation-freeze-manifest.json`
- Aggregate algorithm:
  `sha256(path + NUL + sha256 + LF)`, paths sorted bytewise
- Before review:
  `c74c8255f329e2fb07295b0914f9235bf49c08e4ac8b04cab5063f2b7bdb3424`
- After review:
  `c74c8255f329e2fb07295b0914f9235bf49c08e4ac8b04cab5063f2b7bdb3424`
- Action 666A's five previously reported SHA-256 values: byte-identical

The manifest and this review are review evidence and are not included in the
11-artifact A–B digest, avoiding circular self-reference.

## Fresh regression

| Check | Before review | After review |
| --- | --- | --- |
| Action 665A–E.1 plus Action 666A–B | 88/88 pass | 88/88 pass |
| Action 664 intelligence foundation | 163/163 pass | 163/163 pass |
| Disposable local PostgreSQL matrices | pass through Action 664 | pass through Action 664 |
| TypeScript (`npx tsc --noEmit`) | pass | pass |
| Scoped ESLint | pass | pass |
| Fixture JSON parity | pass | pass |
| `git diff --check` plus untracked whitespace scan | pass | pass |
| Live-import and external-I/O search | none | none |
| Frozen aggregate digest | `c74c8255…` | `c74c8255…` |

## Clean-room review

The following controls pass within the inactive fixture scope:

- baseline and candidate are pair-gated on the same verified Action 665
  opportunity-set identity, authoritative digest, membership digest,
  decision timestamp, cutoff, evaluator/provider contracts, cohort, sample
  type, coverage denominator and outcome-lineage digest;
- Action 665 verification protects authoritative pre-truncation membership,
  decision semantics, point-in-time evidence and positive provider coverage;
- incomplete membership, candidate-set substitution between arms, cutoff
  drift, provider/evaluator drift, duplicate outcome, missing outcome, rank
  gaps and duplicate tie-breaks fail closed;
- selected, rejected, overflow and under-threshold candidates all require
  joinable reproducible outcomes before a completed bundle maps;
- explicit no-trade requires matching producer evidence and complete
  counterfactual coverage;
- score, tier, evidence strength and confidence label are never converted to
  probability by the evaluator;
- precision@1/@3/@5, threshold coverage and opportunity cost reuse
  `canonical_quality_metrics_v1` and retain the complete candidate
  denominator;
- Action 664 retains one canonical primary horizon and excludes diagnostic
  horizons from the denominator;
- the disabled harness returns before cloning, adapter invocation or
  evaluation;
- default evaluator replay is deterministic, deep-frozen and input-immutable;
- the implementation is server-only and has no provider, database,
  persistence, migration, filesystem-discovery or live-consumer call-site;
- both JSON reports state that evidence is synthetic and not production
  performance.

## Findings

### Major 1 — Algorithm version provenance is not result-digest-bound

The pair input validates engine, scoring, ranking, threshold and confidence
versions, but `CanonicalShadowPairingEvidence` stores only the two
opportunity-set binding digests and caller-declared difference names.
`pairEvidence()` likewise omits the actual baseline/candidate version tuples.
The final evaluation payload contains metrics but no algorithm version tuple.

Consequently, a caller can change a baseline or candidate algorithm version
while preserving the permitted difference shape and obtain the same pair and
evaluation semantic digests when metric values do not change. A superfluous
caller-declared version difference is also accepted when the versions are
equal. This prevents the result digest from proving which ranking, scoring,
threshold or confidence contract produced the comparison and leaves
confidence-contract spoofing insufficiently contained.

Evidence:

- `lib/server/canonical-shadow-ranking-confidence-evaluation.ts:190`
- `lib/server/canonical-shadow-ranking-confidence-evaluation.ts:613`
- `lib/server/canonical-shadow-ranking-confidence-evaluation.ts:1091`
- `lib/server/canonical-shadow-ranking-confidence-evaluation.ts:1230`

Required remediation: derive the complete baseline/candidate version tuples
and exact difference set, include both in pair evidence and bind them into the
pair and evaluation canonical digests. Reject missing, mixed, caller-added or
caller-omitted differences.

### Major 2 — Frozen fixture provenance is self-asserted

The replay harness treats a bundle as frozen when its caller-supplied
`fixture_provenance.scope` equals `local_frozen_fixture` and its
caller-supplied input digest recomputes. There is no dependency-injected
trusted fixture registry, expected digest, manifest digest or immutable
fixture identity binding.

A coordinated mutation can therefore change identities, candidate
membership, outcomes or versions, recompute all self-contained evidence and
the bundle digest, retain the provenance string and pass the harness as a
"frozen" fixture. SHA-256 detects accidental mutation relative to a known
digest; it does not authenticate a caller that supplies both bytes and
expected digest.

Evidence:

- `lib/server/default-off-paired-shadow-replay-harness.ts:184`
- `lib/server/default-off-paired-shadow-replay-harness.ts:204`
- `lib/server/completed-paired-shadow-observation-adapter.ts:213`

Required remediation: require an immutable expected fixture binding supplied
from outside the bundle, covering fixture identity, input digest, artifact
manifest digest and allowed evidence scope. Fail before adapter execution
when the external binding does not match.

### Major 3 — Dependency-injected evaluation output is not verified

After the adapter maps, the harness accepts any runtime value returned by the
injected evaluator. It does not recompute the Action 666A evaluation semantic
digest, validate pair evidence, re-check safety flags or bind the result back
to the exact mapped comparison input. It then calculates a new replay digest
over that unverified value.

A tampered or substituted evaluator result can therefore acquire a valid
replay digest. Deep-freezing after acceptance prevents later mutation but
does not prove result integrity.

Evidence:

- `lib/server/default-off-paired-shadow-replay-harness.ts:71`
- `lib/server/default-off-paired-shadow-replay-harness.ts:243`
- `lib/server/default-off-paired-shadow-replay-harness.ts:244`

Required remediation: add a canonical Action 666A result verifier and require
it before replay success. The verifier must recompute result and pair digests,
bind them to the mapped input and its version tuples, validate safety markers
and reject malformed or dependency-substituted results.

## Threat review

| Threat | Result |
| --- | --- |
| Consistently omitted candidate against unchanged Action 665 evidence | contained |
| Coordinated omission with fully recomputed self-asserted fixture evidence | not contained; Major 2 |
| Renamed identity without recomputing canonical evidence | contained |
| Candidate-set substitution between baseline and candidate | contained |
| Coordinated candidate-set substitution plus recomputed fixture digest | not authenticated; Major 2 |
| Baseline/candidate outcome swapping in only one arm | contained |
| Coordinated outcome substitution in both arms with recomputed evidence | not authenticated; Major 2 |
| Cutoff drift | contained |
| Provider/evaluator mismatch | contained |
| Confidence contract spoofing or version relabeling | not result-digest-bound; Major 1 |
| Score/tier/label/evidence used as probability | contained |
| Incomplete explicit no-trade set | contained |
| Duplicate tie-break or rank gap | contained |
| Manipulated fixture bytes with unchanged digest | contained |
| Manipulated fixture bytes with attacker-recomputed digest | not authenticated; Major 2 |
| Manipulated dependency-injected evaluation/result digest | not contained; Major 3 |
| Live activation attempt | no current live import; enabled execution remains an explicit future authorization boundary |

## Finding counts

```text
blocker: 0
major: 3
minor: 0
nit: 0
```

## Remaining inactive dependencies

These do not change finding severity:

1. no real producer emits the completed paired bundle;
2. rejected, overflow and under-threshold outcome capture is not integrated;
3. no trusted frozen-fixture registry or evaluation result verifier exists;
4. no persistence, provider access, live capture or production evaluation is
   authorized.

## Binary decisions

```text
action_666c_shadow_foundation_frozen: true
action_666c_independent_review_approved: false
```

The freeze is complete and byte-stable. Independent approval is false because
three major findings remain.

## Recommended next bounded action

Action 666D — Shadow Provenance, Frozen-Fixture Trust Boundary and Result
Verification Remediation.

Limit it to the three major findings above. Add positive and negative tests
for exact version-tuple binding, derived difference sets, recomputed
self-asserted fixture digests, trusted manifest mismatch, tampered evaluator
output, pair/result digest mismatch and deterministic valid replay. Then
re-freeze and conduct a new clean-room review. Do not add live integration,
persistence, provider access or production evaluation.
