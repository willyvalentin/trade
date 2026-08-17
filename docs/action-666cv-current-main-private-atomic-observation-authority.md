# Action 666CV — current-main private atomic observation authority

## Authority and current-main base

Action 666CV starts from delivered main commit
`8eb9c57c83d449042515e5184bae136bb6d827d0`, tree
`7b04bdc7152f113258e9011f0c0629dc9fdb1b33`, after Action 666CU and its
successful exact-main CI run `31976441550`.

Historical PR #72 remains an open Draft stacked non-authority. Its head
`40155d6b5bf03cb8e3ed2207f4f771d62b6f6937`, code commit
`0ef7bdbbd2fef3300e7e561a037e5432638dd650` and review commit
`730baa4f345cd1453ce49d1fc554f4d5a4d9cb48` are design evidence only.
No historical implementation, review authority, threat matrix, freeze artifact
or successor chain is imported.

## Bounded objective

Action 666CU privately binds one losslessly represented primitive to an exact
originating harness, but its canonical result still exposes the CU capsule.
Action 666CV adds one narrow atomic authority boundary:

- a new private capsule may be minted only after the exact CU result is rebuilt
  and verified by its originating CU harness;
- mint, registration, provenance lookup, digest rebuild and evidence projection
  occur inside one synchronous operation;
- the private capsule is registered against a new frozen harness session in a
  module-private `WeakMap`, and every verifier-side capsule inspection requires
  a successful private lookup first;
- the capsule object and the CU capsule object never cross the module boundary;
- only a recursively frozen, bounded evidence projection and canonical evidence
  string are returned; and
- each returned result shell is itself registered against the exact originating
  666CV harness before publication.

A copied result, shallow copy, deep clone, replayed evidence object, result from
another harness or recomputed public digest cannot grant authority. Symbols,
functions, over-budget strings and non-primitive requests receive no atomic
authority.

## Persisted readback is integrity-only

Readback accepts only a canonical evidence string or genuine `Uint8Array`
bytes. Arbitrary objects, arrays, accessors and proxies are rejected before
enumeration or property access. Input is capped at 65,536 UTF-8 bytes, decoded
with a fatal decoder, parsed with the captured JSON parser, checked against one
exact closed schema and required to reserialize byte-for-byte to the canonical
form. Duplicate keys, alternate ordering, whitespace, extra keys and digest
tampering fail closed.

Persisted bytes cannot preserve module-private `WeakMap` or harness-session
identity. A successful readback therefore reports only
`status: integrity_verified`, `provenance_verified: false` and
`verifier_authority_granted: false`. Only the exact private in-memory result
shell can pass the authority verifier. Integrity and provenance are never
collapsed into one claim.

## Containment and safety

The gate is literal: only `enabled === true` together with
`kill_switch_engaged === false` may inspect dependencies or build the CU
predecessor. Reflection, collection, freezing, JSON, text encoding, typed-array
and private `WeakMap` operations used by this layer are captured at module
initialization. Failures are structured, frozen, bounded and contain no
caller-controlled error text.

The implementation and fixtures begin with `server-only`. The Action is
synthetic-only, fixture-only, provider-free, database-free, read-only,
default-off and runtime-unwired. It adds no route, UI consumer, persistence,
migration, real authority reader, publisher, private key, ranking effect, model
mutation, training, promotion, broker action or production deployment.

Five normative artifacts — implementation, synthetic fixture, focused test,
this contract and the synthetic golden report — are hash-pinned by a separate
fail-closed freeze manifest. CI runs the focused and freeze tests provider-free
and requires a clean tracked tree.

## Delivery condition

Action 666CV remains a candidate until all of the following hold:

1. the exact candidate scope is frozen over the current base;
2. exact-head CI succeeds;
3. an independent current-head read-only review reports no findings;
4. explicit operator approval names the PR and exact head;
5. an ordinary pull-request merge makes the exact reviewed artifacts reachable
   from `main`; and
6. exact-main push CI succeeds.

Production deployment, provider action and database action are not authorized.
An automatic Netlify deploy-preview is non-production evidence only and grants
no runtime, delivery or roadmap authority.

The next bounded Track 2 objective after delivery is a fresh current-main
integrity/provenance-separated observation-authority successor. Action 666CV
does not complete Track 2 and awards no milestone credit by itself.
