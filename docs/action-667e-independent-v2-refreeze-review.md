# Action 667E — Independent V2 Re-freeze and Canonical-Receiver Delta Review

## Binary decisions

- `action_667e_v2_frozen: true`
- `action_667e_independent_review_approved: true`
- `action_667e_receiver_delta_complete: true`
- `action_667e_local_checkpoint_ready: true`
- `canonical_binding_ready: false`

Local checkpoint readiness means that the isolated v2 lab is stable enough for
a reviewed local commit. It does not approve capture, persistence, historical
evaluation, a Spår 2 extension, or canonical binding.

## Freeze inventory

The machine-readable inventory is
`docs/evidence/action-667e-v2-freeze-manifest.json`.

- v1 baseline artifacts frozen by 667C: 9
- additional v1 review-lineage artifacts: 3
- v2 artifacts frozen by 667E: 7
- v1 baseline digest:
  `eb0ef9eff3318b540ffc060d52d7ba118dfe98bf7303068ab01474fb92168250`
- v2 freeze digest before regression:
  `79057d446d4acb7e4e6d0bdf4a97b73dda3dbb4e050b4d67920ffa4c3a78138d`
- required v2 freeze digest after regression:
  `79057d446d4acb7e4e6d0bdf4a97b73dda3dbb4e050b4d67920ffa4c3a78138d`
- Action 667D evidence digest:
  `c31bea77723d82f2d94e02e1dbd295def50c92334594d154bf85e8f72811dcb6`

All artifacts are intentionally untracked because no commit has been
authorized.

## Independent clean-room findings

### Explicit-instant parser

The parser accepts a fixed ISO instant grammar with seconds and uppercase `Z`
or an explicit offset. Calendar components, leap seconds, offset minutes, and
the ISO maximum `±14:00` offset are checked before `Date.parse`. Naive,
date-only, whitespace-padded, lowercase-zone, impossible-date, and malformed
offset inputs fail closed.

Minor finding `E-001`: JavaScript's `Date.UTC` handling of years `00`–`99`
means the practical accepted year range is `0100`–`9999`, although the regex
admits four digits. This has no market-data effect for the supported decision
domain, but the effective historical range should be stated if the parser is
ever generalized.

### Cross-environment determinism

The full v2 output has one fixed digest under independent child processes with
`TZ=UTC`, `TZ=Europe/Stockholm`, and `TZ=America/New_York`. DST-start,
DST-end, North American fallback, and offset-equivalent instants are
byte-identical. Candidate timestamp validation order is sorted independently
of input array order.

### Point-in-time leakage

The strict wrapper validates every non-null decision, benchmark, breadth,
sector, provider-source, and provider-received timestamp before the frozen v1
engine runs. The v1 engine excludes and counts future datapoints and future
provider source timestamps. Classification never reads future values.

Minor finding `E-002`: a future optional `received_timestamp` is preserved as
metadata and does not affect classification, evidence, freshness, or ranking,
but it is not separately marked as future metadata. Because capture and
binding are disabled, this is not a v2 local-checkpoint blocker. A future
receiver extension must define whether received time is observation metadata
or decision-time evidence.

### V1/v2 classification parity

All fourteen golden regimes match v1. V2 delegates classification to the
byte-frozen v1 engine only after strict validation, then changes only the
context and threshold version fields. No threshold value or classification
branch changed.

### Threshold versioning

Threshold v2 contains all 21 values. Nineteen remain active. Exactly
`freshness_minutes.intraday` and
`freshness_minutes.sector_short` are `reserved_inactive` with
`classification_effect: false`. Their numeric values remain present for
schema continuity and are not described or evaluated as live boundaries.

### Lossless regime and sector representation

The bridge preserves the terminal regime, all typed dimensions, and every
ordered sector/industry object, including relative returns, horizon states,
trend agreement, acceleration, rankability, ranks, freshness, coverage,
missingness, and scoped reason codes. The tested bridge round-trip reproduces
the exact v2 JSON.

### Provider quality representation

Every provider entry retains source identity, provider, source/received
timestamp, age, freshness state, coverage, missing points, and data domain.
Aggregate freshness and the native market-context coverage/missingness object
are separate, so no provider or domain information is collapsed.

### Evidence semantics

Evidence remains ordinal and explicitly
`calibrated_probability: false`. It is not copied into or inferred as Spår
2's probability confidence.

### Provenance

The bridge requires caller-supplied engine, scoring, ranking, setup taxonomy,
confidence contract, evaluator, provider contract, full Git commit, and build
identity. Every field has an individual negative test. Missing or malformed
required metadata produces `not_bindable` and `payload: null`.

Semantic authenticity of caller-supplied version strings cannot be proven by
an offline schema; that responsibility belongs to a future authenticated
producer boundary. The bridge neither guesses nor reads versions from the
repository or process.

### Shadow boundary

The contract and bridge are fixed to `shadow_only: true` and
`live_ranking_effect: false`. The bridge additionally fixes capture and
persistence off, database relation null, actual canonical binding null, and
canonical compatibility false. No live source imports the v2 module.

## Read-only canonical receiver delta

Reviewed against the frozen Spår 2 foundation in
`/private/tmp/trade-action-664a`, specifically its canonical recommendation
evaluation and projection contracts. No code, import, or shared artifact was
created between worktrees.

| V2 bridge semantic | Existing Spår 2 receiver | Classification | Required action |
| --- | --- | --- | --- |
| `decision_instant` | projection `decision_timestamp`; identity `decided_at` | directly compatible | retain explicit instant validation |
| nine `versions.producer` fields | `CanonicalEvaluationVersions` | directly compatible | copy field-for-field after producer validation |
| `regime_classification` | `CanonicalProjectionContext.regime` | directly compatible | retain the versioned regime string |
| aggregate freshness state | `CanonicalProjectionContext.freshness` string | can be stored lossless in existing envelope | preserve detailed provider freshness separately |
| context contract version | no context-version field | requires additive Spår 2 extension | add versioned market-context namespace |
| threshold version | no threshold-version field | requires additive Spår 2 extension | add beside context contract version |
| repeated provider timestamps and domain freshness | one scalar provider and freshness field | requires additive Spår 2 extension | add repeated provider-domain collection |
| typed regime dimensions | only scalar regime | requires additive Spår 2 extension | add typed dimensions object |
| repeated sector/industry contexts | one scalar sector | requires additive Spår 2 extension | add lossless repeated collection |
| context reason codes | coverage codes and projection diagnostics have different scopes | requires additive Spår 2 extension | add scoped context reason-code collection |
| leakage-control counters | no receiver field | requires additive Spår 2 extension | add point-in-time audit metadata |
| ordinal context evidence | canonical confidence is probability-only | semantically incompatible | add a separate non-probabilistic evidence namespace; never map to confidence |
| native context coverage/missingness | `CanonicalCoverage` is candle/outcome-oriented | semantically incompatible | add native market-context coverage object; never coerce to candle counts |
| shadow/no-live-effect assertions | canonical `sample_type=shadow` describes a recommendation sample, not context behavior | semantically incompatible | add context-boundary assertions; do not infer sample type |

The delta is complete for every v2 bridge field. Existing directly compatible
fields are insufficient for a lossless binding because the additive and
semantically incompatible rows remain unresolved.

## Findings disposition

- Major findings: 0
- Blocking v2 findings: 0
- Minor findings: 2 (`E-001`, `E-002`)
- Receiver additions required before binding: yes
- Historical shadow comparison approved: no
- Canonical binding readiness: false

## Recommended local commit action

Recommended next checkpoint:
**Action 667F — Reviewed Local Checkpoint Commit**.

It should recheck the 667E manifest and both freeze digests, stage only the
Action 667A–E paths listed in the manifest plus the 667E review artifacts,
create one local commit with an explicit shadow-only message, and stop. It
must not push, open a PR, change Spår 2, run historical data, or activate
canonical binding.
