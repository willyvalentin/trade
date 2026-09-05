# AI-02 staging-only legacy outcome evidence operation

## Purpose

The verified production assessment found historical outcome rows but no rows
that can truthfully enter `canonical_evaluation_decisions`: the legacy source
does not carry canonical decision identity, lineage, version, confidence
semantics, reproducibility or immutable-envelope evidence. This operation
preserves a bounded redacted record for future **data-quality** work without
turning it into a canonical cohort.

## Exact boundary

- Target: `ture-staging` only (`pdvzyuhykomwfqyyztru`), private schema only.
- Source: one bounded GET-only query against Trade production
  (`ekdyopdrrkphlrsilyoo`), using
  [`production-read.sql`](../supabase/operations/ai-02-legacy-evidence/production-read.sql).
- Maximum import: 500 rows, deterministically ordered by evaluation time,
  opaque source fingerprint and horizon.
- Retained fields: an opaque SHA-256 dedupe key, evaluation day, horizon and
  outcome scalars needed to assess legacy completeness.
- Never read, return or retain: owner IDs, ticker, source-record identifiers,
  recommendation/snapshot IDs, JSON payloads, warnings, secrets or broker data.

## Controls

- The target relation is private, RLS-protected, has no client grants and has
  an append-only update/delete trigger.
- Each row is permanently fixed to `legacy_incomplete` and `not_admitted`.
  It is not a canonical decision, AI-02.3-issued projection, offline
  evaluation dataset, model/policy-promotion input, runtime input or writer
  activation signal.
- The source operation is not placed in `supabase/migrations`; it must not be
  applied to production or become a deploy-time dependency.
- Import must fail closed on duplicate opaque keys or a row count above 500;
  no upsert, update, delete or retry rewrite is permitted.

## Required evidence

1. Source-controlled SQL passes the focused static boundary test and Ready
   Full CI before the remote operation.
2. Apply the exact DDL to `ture-staging` only.
3. Execute exactly one approved production read, then one staging-only insert.
4. Verify staging row count, distinct opaque-key count, zero public/client
   privileges and rejection of a direct update/delete.
5. Record only aggregate evidence in roadmap/Notion. Do not commit or expose
   imported rows.
