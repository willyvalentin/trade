# B-01 — Canonical position-lineage projection

## Purpose

This source-only B-01 increment defines one strict projection from an already
selected current `positions` DTO and its matching append-only
`position_version_history` DTO. It makes the owner, position version, durable
recommendation lineage, and state-digest relationship explicit before any
future server read model is allowed to expose it.

## Accepted input

`projectCanonicalPositionLineage` accepts exactly three own data properties:

- `authenticated_server_owner` — already-resolved canonical owner UUID;
- `position` — a fully populated current lineage DTO; and
- `history` — the append-only history DTO for the same position version.

Both DTOs must agree on owner, position ID/version, recommendation ID/version,
recommendation identity, and normative digest. The history state digest must be
a lowercase SHA-256 digest. UUIDs and digests use their canonical textual
forms; versions are positive safe integers; recommendation identity is nonblank
NFC text. The operation rejects missing, widened, accessor-backed, proxy-backed
or mismatched inputs.

## Output

The result is a fresh frozen scalar projection with a deterministic
`history_identity`:

```text
<position_id>:<owner_user_id>:<position_version>
```

It intentionally preserves only scalar lineage and the history state digest.
It neither exposes a mutable database row nor makes a client projection into a
source of truth.

## Explicit exclusions

The module is `server-only`, but it does not resolve an application session,
read Supabase, construct a database client, invoke a transport or writer,
create a route, bind a UI surface, load an environment value, schedule work,
contact a provider/broker, deploy, or change production data. A later fixed
purpose server read model needs its own scope, authorization and verification.

## Verification

The focused local test covers a valid detached projection,
owner/version/lineage substitution, malformed object shapes and static
capability containment. It does not change the provider-free CI registration,
six-shard topology, branch protection, required checks or deployment policy.
