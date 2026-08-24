# Action 666EJ — Position-version lineage control-character projection provenance reconciliation

## Decision

Action 666EJ closes the bounded
`position_version_lineage_control_character_projection_provenance_reconciliation`
objective. It resolves the Action 666EI control-character stop condition as a
**legacy narrative-preservation candidate**, not as an authorization to alter
legacy data or silently weaken the Action 666DE v1 digest contract.

After Action 666EI's merge commit `a0b5bf64e8e3da005ee2f433341b1b60c9b5e02f`
passed exact-main CI run `32710226247`, the source-controlled query ran once
through the project-scoped Supabase boundary in a repeatable-read, read-only
transaction. It returned one boolean-only JSON document and rolled back.

The query proves the following shape without returning a row, owner,
identifier, source field value, connection identifier or credential.

- a control character occurs in one or more narrative projection members;
- no control character occurs in the categorical projection members; and
- no narrative control character falls outside the preserved whitespace set
  TAB, LF and CR.

That is enough to classify the blocker as structurally compatible with legacy
narrative formatting. It is deliberately not a claim about a particular
author's intent: aggregate-only evidence cannot prove the semantic purpose of
individual source text. It does establish that an implicit trim, replacement,
omission or generic data-cleanup path would destroy possible preserved content
and is therefore not an admissible response.

## Immutable v1 boundary and successor route

Action 666DE's `legacy_recommendation_normative_projection_v1` remains
immutable. It continues to reject every control character, including TAB, LF
and CR. Existing v1 normative digests must never be recomputed under altered
rules, and no current all-null lineage tuple may be populated under a relaxed
interpretation.

The successor route is a separately reviewed,
`position_version_lineage_versioned_projection_successor_contract` objective.
It must define a new contract version and domain, preserve each eligible
narrative code point exactly through canonical JSON encoding, reject any
non-whitespace control character, bind the new version to durable lineage
semantics, and make mixed v1/v2 retry behaviour fail closed. It must also
decide whether legacy rows remain permanently unbackfilled until an explicit
versioned migration exists. This action defines none of those bytes and does
not select, normalize or transform any source value.

## Closed authority

No DDL, DML, migration, backfill, constraint validation, generated-type
refresh, runtime wiring, grant or policy change, deployment, provider call or
broker interaction occurred. The production durable lineage tuples remain
all-null, Action 666EI's owner-bound admission remains blocked for v1, and the
v2 writer remains inactive.
