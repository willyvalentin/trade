# Action 666GT — V2 private command-digest builder

## Bounded objective

Implement the one pure successor selected by Action 666GS: a deterministic
canonical digest builder for the already frozen V2 private command-port
projection. The builder validates exactly four scalar fields, serializes the
lexically sorted JSON object as UTF-8, and returns its lowercase hexadecimal
SHA-256 digest.

## Frozen input and output contract

The builder admits precisely these own, enumerable data properties:

1. `contract_version`, exactly the existing V2 source-contract version;
2. `routine_signature`, exactly
   `private.write_owner_bound_recommendation_position_v2(uuid,uuid,text)`;
3. `authenticated_server_owner`, one canonical lowercase UUID; and
4. `opaque_recommendation_reference`, one canonical lowercase UUID.

It rejects missing, extra, inherited, accessor, non-enumerable, non-string,
wrong-contract, wrong-routine or non-canonical UUID input. The canonical bytes
have this lexical key order:

```json
{"authenticated_server_owner":"…","contract_version":"…","opaque_recommendation_reference":"…","routine_signature":"…"}
```

The sole successful value is a 64-character lowercase hexadecimal SHA-256
digest. No caller-supplied digest, price, quantity, position identity, policy,
timestamp or other command material is accepted.

## Scope and containment

The module is server-only, deterministic and source-only. It reads no data,
resolves no credential, opens no connection, calls no private routine, writes
no position, decodes no committed result and binds to no route or UI. It adds
no provider, broker, database, deployment, Netlify or production authority.

The historical 666FC source contract remains frozen with its historical
`canonicalDigestBuilderPresent: false` statement. This add-only successor is
the independently reviewed builder; it does not reinterpret the predecessor or
admit runtime binding. Malformed input fails closed by throwing the dedicated
input error before a digest is created.

## Required delivery gate

Action 666GT remains a Draft PR until focused provider-free verification and
TypeScript checking pass locally. It then requires the unchanged six-shard
Ready Full CI suite, the saved merge-candidate provenance artifact, merge into
protected main, exact-main Full CI and matched post-merge provenance. No CI
deduplication or branch-protection change is authorized.
