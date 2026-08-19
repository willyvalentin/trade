# Action 666CY — current-main lossless immutable byte snapshot plan

## Planning authority

Action 666CY starts from protected GitHub main commit
`377b87d344ddb48d73c725b348d1dcb4c0943fd1`, tree
`7b8c529ecabfe367ccba3ec27629f02b8c5d4c44`. This is the ordinary merge of
PR #117 / Action 666CX. Exact-main push CI run `32261552249` completed
successfully with all six provider-free shards and the protected aggregate
green. GitHub deployments for the commit were empty.

Historical PR #72 / Actions 666CH and 666CI are design context only. Their
source, fixtures, tests, digests, review conclusions and preservation objects
are not imported and grant no current-main authority. This is a fresh
current-main implementation built against delivered 666CX.

## Bounded objective

Create one additive, server-only, callback-free byte boundary which:

1. accepts only a string or an exact direct `Uint8Array` after literal enable
   and kill-switch gates;
2. rejects proxy, subclass, cross-realm, detached, shared and resizable backing
   before caller-controlled byte traversal;
3. makes one private fixed ordinary-`ArrayBuffer` snapshot of accepted bytes;
4. binds exact byte length and raw-byte SHA-256 before fatal UTF-8 decoding or
   JSON parsing;
5. preserves distinct evidence, terminal and failure identities for distinct
   invalid byte sequences such as `0xff` and `0xfe`; and
6. validates the delivered 666CX public envelope while keeping provenance,
   trust and admission permanently false.

The Action adds no callback, reader, authority shell, persistence, provider,
database, route, ranking effect, training, promotion, broker action or
production deployment.

## Required verification

- literal default-off and kill-switch paths perform zero boundary, snapshot,
  copy, read, hash, decode, parse or digest work;
- oversized string and typed-array inputs fail before unbounded encoding or
  byte copying;
- exact offset views copy only visible bytes into one private fixed snapshot;
- caller mutation after entry cannot change the recursively frozen result;
- SharedArrayBuffer, resizable ArrayBuffer, detached buffers, proxies,
  subclasses, cross-realm views and function/object inputs fail closed without
  caller hook execution;
- post-import primordial mutation cannot change output or make the public entry
  throw;
- malformed UTF-8 retains raw-byte evidence and exposes only a closed reason;
- canonical, non-canonical, digest-mismatch and input-rejection terminals remain
  distinct and deterministic;
- five normative artifacts are byte-pinned in a separate fail-closed manifest;
- both focused tests are registered exactly once in Action 660J without a
  workflow or protected-check identity change.

## Delivery sequence

Freeze the candidate scope, run focused and predecessor regression, TypeScript,
lint, manifest mutation and security scans, then obtain an independent exact-
head read-only review. Publication of a Draft PR requires explicit operator
approval. Merge requires a later approval naming the exact PR and head, followed
by successful exact-main CI.

No production deploy, provider action, Supabase/database action, broker action,
training, promotion or runtime activation is authorized.
