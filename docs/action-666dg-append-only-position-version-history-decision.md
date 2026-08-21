# Action 666DG — Append-Only Position-Version History Decision

## Decision

Action 666DG closes only the bounded
`append_only_position_version_history_decision` objective. It fixes the
durable-reference boundary that follows Action 666DF: the mutable current
`public.positions` row may retain a compare-and-swap version predicate, but it
is never a durable target for a version-bound reference. A later reviewed
migration must create a separate, append-only history relation before any
runtime component can create a durable position-version reference.

This Action is source-only. It does not create a table, function, trigger,
policy, index, migration, generated type, route, worker, queue or runtime
writer. It does not contact Supabase, issue SQL, write data, change provider
configuration, publish a deployment or grant broker/automatic-execution
authority.

The exact predecessor is protected `main` merge
`a8b94861e53d2aff6fb7ceb5afa3f415a6363b7b`, tree
`cdc2e3b013c8c023b1a3b42a0ac31367a781e583`, with parents
`151b7881819d8ffc8f6a0bfaf11cad165b7c0954` and
`48fa88f592816b579777ed02b5cfeb3a8d29a889`. Its push-triggered exact-main CI
run `32492244739` completed successfully. Action 666DF remains the immutable
identity-reconciliation predecessor; no Action 666DG claim revises its bytes
or authorizes the Action 666DE backfill contract.

## Frozen future history contract

The future relation is named `public.position_version_history`. It does not
exist today and may be created only by a separately reviewed source migration.
Each row represents exactly one immutable, owner-scoped position version. Its
durable identity is the composite key:

```text
(position_id, owner_user_id, position_version)
```

The future migration must require all of the following before it can treat the
relation as a durable reference target:

1. `position_id` and `owner_user_id` identify the current position through an
   owner-bound foreign key to `public.positions(id, owner_user_id)`;
2. `position_version` is a `bigint` in the exact safe-integer range
   `1..9007199254740991`;
3. the composite identity is both primary/unique and the only permitted target
   for a version-bound foreign key; no reference may target mutable
   `public.positions.position_version`;
4. every history row copies the locked recommendation tuple:
   `recommendation_id`, `owner_user_id`, `durable_recommendation_version`,
   `recommendation_identity` and `recommendation_normative_digest`;
5. the row captures a later separately frozen position-state frame and its
   SHA-256 digest. Action 666DG deliberately does not invent that frame,
   digest, legacy data or a timestamp default;
6. parent or recommendation deletion may not cascade through history; a later
   migration must use restrictive referential behavior or reject the mutation;
   and
7. the relation accepts inserts only through its exact server-owned migration
   or command boundary, then rejects every `UPDATE` and `DELETE` through one
   fixed append-only trigger.

The history relation must enable RLS, receive no new `anon` or
`authenticated` Data API grant and expose no client write policy. Any later
server-only writer must use an explicitly fixed `search_path`, exact function
privileges and independently verified owner binding. A history table, view or
function is not client-visible merely because its name is present in this
design.

## Atomic transition rule

The one-time legacy backfill may insert only a version-1 history row for a
position that has passed the separately authorized clean inventory and
deterministic lineage contract. Every later successful position mutation must,
in one transaction:

1. lock the current owner-scoped position;
2. require the caller's expected current version;
3. reject overflow at the safe-integer maximum;
4. update the current row to exactly the successor version; and
5. insert exactly the matching immutable history row before commit.

A conflict, stale expected version, changed owner, changed locked
recommendation tuple, failed history insert or failed constraint rolls back the
entire transition. Retrying a previously committed request must not create a
second history identity. No global ordering across unrelated positions is
claimed or required.

## Required later proof

A later source migration package must freeze the actual SQL and separately
prove at least: duplicate history-key rejection; no gap or skipped successor;
owner mismatch rejection; immutable update/delete rejection; no cascade loss;
RLS and client-grant denial; atomic rollback; exact retry; stale-version
rejection; maximum-version refusal; and a durable foreign key that targets the
history composite identity rather than the mutable current row. An isolated
staging apply, a separately authorized production apply and post-apply
generated-types/MA-09 provenance refresh remain separate gates.

Supabase requires RLS and deliberate grants for relations in an exposed schema;
the future relation therefore starts deny-by-default. PostgreSQL constraint and
transaction behavior guide the future foreign-key and atomic-transition
verification, but this Action neither applies nor validates any database
object.

## Remaining gates

The next bounded objective is
`position_version_history_source_migration_design`. It must bind real source
migration bytes to this decision before any staging or production authority is
considered. Market-observation provenance, durable exit-queue schema,
transactional recommendation-position runtime handoff, client projection and
all broker or automatic execution remain separate blockers. Production
deployment is not authorized.
