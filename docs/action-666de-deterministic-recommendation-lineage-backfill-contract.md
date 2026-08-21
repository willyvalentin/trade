# Action 666DE — Deterministic Recommendation Lineage Backfill Contract

## Decision

Action 666DE closes only the bounded
`deterministic_recommendation_lineage_backfill_contract` design objective. It
freezes how an eligible legacy `public.recommendations` row will later produce
the existing Action 664A canonical recommendation identity, its initial
durable version and its normative digest. It is source-only: it neither reads
Supabase nor adds a migration, writes a row, refreshes generated types, wires
runtime code or publishes production.

The exact predecessor is protected `main` merge
`ddce80b57c9ab21b5210d2aa484271c2da0f60e6`, tree
`b9b02c7b55daa2719fe28241c170f056537e0b18`, with parents
`cb501d3ad3626be1bb13429a9791574a2040b64e` and
`981fcb3acc59030ce6531042ff5e0e0b27542501`. Its push-triggered exact-main CI
run `32428905068` completed successfully. Action 666DD's one authorized,
aggregate-only production inventory remains the sole database read authority:
it found 1,049 identity-seed-eligible recommendations and eight
owner-bound, lineage-copy-eligible positions, with every blocker class zero.
Production remains the separately verified Action 660M release at
`dbeed25f2074bff4dba8cee7f6d511cb17992efc`.

## Closed legacy-row mapping

Only an exact current-schema `public.recommendations` row is eligible. The
mapping is deliberately mechanical and has no heuristic, prompt, model,
clock, client or provider input:

| Canonical input | Exact legacy source | Rule |
| --- | --- | --- |
| `source_namespace` | fixed literal | `legacy_recommendations` |
| `decision_id` | `recommendations.id` | lowercase canonical UUID text |
| `decided_at` | `recommendations.created_at` | Action 664A explicit instant, canonicalized to UTC |
| `recommendation_version` | fixed literal | initial positive version `1` |

The identity is produced only by
`buildCanonicalRecommendationIdentity({ source_namespace, decision_id, decided_at })`
from `lib/canonical-recommendation-evaluation.ts`. It must therefore equal:

```text
rec_decision:v1:legacy_recommendations:<encoded lowercase UUID>:<decision epoch milliseconds>
```

No replacement decision ID, inferred source namespace, `now()` timestamp,
ticker, scan row, position row or hash suffix is permitted. A null,
noncanonical or unparseable `id`/`created_at`, a builder rejection, or an
identity mismatch is `blocked_unclassifiable_legacy_recommendation`; it is not
backfilled.

## Normative digest projection

The durable digest is the lowercase SHA-256 of the UTF-8-without-BOM canonical
JSON frame below. The frame has exactly the lexicographically ordered keys
`contract_version`, `domain` and `projection`; no alias, omitted member,
additional member or whitespace is accepted.

```json
{
  "contract_version": "legacy_recommendation_normative_projection_v1",
  "domain": "trade.legacy_recommendation_normative_digest.v1",
  "projection": {
    "archived": "boolean",
    "company_name": "canonical text or null",
    "confidence": "canonical text or null",
    "created_at": "canonical UTC instant",
    "direction": "canonical text",
    "entry_high": "canonical decimal text or null",
    "entry_low": "canonical decimal text or null",
    "invalidation": "canonical text or null",
    "owner_user_id": "lowercase canonical UUID",
    "reason_to_avoid": "canonical text or null",
    "recommendation_id": "lowercase canonical UUID",
    "risk_reward": "canonical decimal text or null",
    "session_type": "canonical text",
    "setup_type": "canonical text or null",
    "status": "canonical text",
    "stop_loss": "canonical decimal text or null",
    "target_1": "canonical decimal text or null",
    "target_2": "canonical decimal text or null",
    "thesis": "canonical text or null",
    "ticker": "canonical text",
    "timeframe": "canonical text or null"
  }
}
```

`recommendation_id` is exactly the same UUID used as `decision_id`. Every
nullable source value stays an explicit JSON `null`; absent, empty, trimmed,
case-folded or substituted values are never equivalent. Text must be NFC,
control-character-free UTF-8 and preserve its exact code points. A numeric
source value is handled as lossless decimal text, never a JavaScript number.
Its accepted input grammar is exactly
`^-?(?:0|[1-9][0-9]*)(?:\\.[0-9]+)?$`. Normalization first removes every
trailing fractional zero, then removes the decimal point if no fractional
digits remain, and finally maps either signed or unsigned zero magnitude to
`0`. Its canonical output grammar is exactly
`^(?:0|-?[1-9][0-9]*(?:\\.[0-9]*[1-9])?)$`.

The following vectors are normative: `1.0 -> 1`, `0.0 -> 0`, `-0.0 -> 0`,
`-0 -> 0`, `-1.2300 -> -1.23`, and `100.0100 -> 100.01`. Thus no canonical
value ends in a decimal point or a fractional zero. `1.`, `.1`, `00`, `01`,
`-01`, `+1`, exponent notation, `NaN`, infinity, locale formatting, rounding
and precision loss fail closed.

The later server implementation must construct this frame from the locked row,
first reject any noncanonical member, then compare its raw bytes with its
canonical serialization before hashing. It may not trust a caller-provided
identity, digest, version, owner, checkpoint or row list.

## Owner-scoped, bounded later backfill

This contract authorizes no execution. A separately reviewed migration may
implement only this fixed plan:

1. Re-run the approved aggregate inventory. It must still prove the exact
   clean classes required by Action 666DD; otherwise stop before a write.
2. Take an exclusive server migration lock. Select the next owner with pending
   rows in canonical UUID order, then lock at most 100 rows for that one owner
   in `id` order. `SKIP LOCKED`, arbitrary offsets, parallel owner batches and
   client-supplied cursors are forbidden.
3. For every locked row, build the Action 664A identity and the exact digest
   projection above, set `recommendation_version = 1`, and write all three
   durable fields together. Any blocked row aborts the whole owner batch.
4. Copy lineage to positions only from the already locked, owner-matching
   recommendation. The eight linked positions must receive exactly the same
   identity, digest and durable recommendation version `1`, plus initial
   `position_version = 1`.
5. Persist only a server-generated checkpoint after the full transaction
   commits. Its reconciliation record must bind the owner-batch source count,
   written recommendation count, copied-position count and aggregate digest;
   it may not disclose row or owner identifiers outside the database boundary.

Before constraints are promoted, aggregate reconciliation must prove:

- `1049 = recommendation_identity_seeded + recommendation_already_equal`;
- `8 = position_lineage_copied + position_lineage_already_equal`;
- every blocked, duplicate, null-link, owner-mismatch, identity-mismatch and
  digest-mismatch count is zero;
- every durable recommendation and copied position version is exactly `1`;
- every copied position equals its owner-matching recommendation identity and
  digest byte-for-byte.

Any changed inventory count, nonzero blocker, source-row drift, retry mismatch
or stale checkpoint is a stop condition. It requires a fresh reviewed
inventory/contract decision rather than an automatic retry.

## Deliberately closed authority

This Action does not reconcile Action 655G's evaluator, add append-only
position-version history, create a migration, run a staging apply, write to
production, refresh generated types, expose a client projection or wire a
route, worker, queue, broker or automatic execution path. The next bounded
objective is `action_655g_canonical_recommendation_identity_reconciliation`.

Delivery of this source-only contract still requires exact scope, exact-head
CI, independent review, explicit approval of a named PR/head, ordinary
protected merge and successful exact-main CI. A Netlify deploy preview is
non-production evidence only; production deployment remains unauthorized.
