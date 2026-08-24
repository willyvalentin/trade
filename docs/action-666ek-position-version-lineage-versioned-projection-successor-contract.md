# Action 666EK — Position-version lineage versioned projection-successor contract

## Decision

Action 666EK closes the bounded
`position_version_lineage_versioned_projection_successor_contract` objective.
It defines the only admissible digest successor for the legacy narrative
whitespace classified by Action 666EJ. It is source-only: it neither creates
storage, changes a legacy row, computes a durable digest, runs a migration nor
activates a writer.

Action 666DE v1 remains immutable and permanently rejects every control
character. Its frame, digest and any future v1 result must never be
reinterpreted as v2. The successor is instead a distinct frame:

```text
contract_version = legacy_recommendation_normative_projection_v2
domain           = trade.legacy_recommendation_normative_digest.v2
algorithm        = lowercase SHA-256 over canonical UTF-8 JSON without BOM
```

The v2 frame preserves the same lexicographically ordered outer keys
`contract_version`, `domain` and `projection`, and the same 21
lexicographically ordered projection members as v1. `recommendation_id`,
identity mapping, canonical UTC instant, explicit JSON nulls and lossless
decimal grammar/normalization remain exactly as Action 666DE defines them.
Only the policy for the three narrative members changes:
`invalidation`, `reason_to_avoid` and `thesis` may contain TAB, LF and CR.

## Exact text and serialization rule

Every accepted text value must already be NFC and must preserve its exact code
point sequence. No trim, whitespace collapse, line-ending conversion,
replacement, filtering, substitution or case-folding is allowed.

All categorical and presentation text members remain control-character-free:
`company_name`, `confidence`, `direction`, `session_type`, `setup_type`,
`status`, `ticker` and `timeframe`. The three narrative members accept only
the control-code-point set `{U+0009, U+000A, U+000D}`. Every other C0/C1
control character, including escape, form feed, vertical tab and delete, fails
closed as `blocked_non_whitespace_narrative_control_character`.

The canonical JSON serializer must encode the accepted controls only with the
lowercase short JSON escapes `\\t`, `\\n` and `\\r`. It may not emit a
literal control byte or a `\\u0009`, `\\u000a` or `\\u000d` alternative.
Consequently these synthetic vectors are normative:

| Source code points | Canonical JSON string fragment |
| --- | --- |
| `alpha + TAB + beta` | `"alpha\\tbeta"` |
| `alpha + LF + beta` | `"alpha\\nbeta"` |
| `alpha + CR + LF + beta` | `"alpha\\r\\nbeta"` |

The raw UTF-8 bytes must equal the canonical serialization before hashing.
The implementation must construct that frame from its locked database row and
not trust a caller-supplied frame, digest, version, owner, checkpoint or list.

## Durable version binding and retry boundary

V2 lineage is not interchangeable with v1 merely because both produce a
64-character SHA-256 value. Before any later backfill is designed, an additive
storage package must introduce a server-written explicit projection-contract
marker on both recommendation and copied-position lineage tuples. Its only
initial permitted value for newly seeded legacy tuples is
`legacy_recommendation_normative_projection_v2`.

That future package must widen the complete-tuple checks atomically, copy the
same marker only from an owner-matching recommendation, and make an absent,
v1, mixed or unexpected marker a stop condition. A retry may only accept an
already-complete tuple when its marker, identity, digest and durable version
all equal the v2 result built from the locked source row. It must never upgrade
or overwrite an existing v1 tuple in place.

The next bounded objective is
`position_version_lineage_projection_contract_storage_design`. It must define
that additive marker storage and the exact future constraint transition. It
does not authorize a migration, staging apply, production write, backfill,
constraint validation, type refresh, runtime wiring or deployment.

## Closed authority

This contract does not select source data, add a column, alter a check, write
lineage, copy a position, validate a constraint, change RLS or grants, call a
provider or broker, or activate any route, queue or writer. The existing
all-null production lineage tuples remain untouched.
