# Action 666CU — current-main provenance-bound observation verification

## Authority and current-main base

Action 666CU starts from delivered main commit
`2348322478b397505111e8f7da4d2edf176aab13`, tree
`4d182c834f0b890d5a9e3da91798e190bc43f900`, after Action 666CT and its
successful exact-main CI.

Historical PR #72 remains an open Draft stacked non-authority. Its head
`40155d6b5bf03cb8e3ed2207f4f771d62b6f6937`, code commit
`0ef7bdbbd2fef3300e7e561a037e5432638dd650` and review commit
`730baa4f345cd1453ce49d1fc554f4d5a4d9cb48` are design evidence only.
No historical implementation, review authority, threat matrix, freeze artifact
or successor chain is imported.

## Bounded objective

Action 666CT gives a fully represented primitive a lossless observation and a
private originating-harness verification path. Action 666CU adds one narrow
provenance boundary above that result:

- only a privately rebuilt, authoritative 666CT represented primitive may be
  wrapped;
- the capsule binds the exact 666CT issuance and failure-identity digests,
  primitive type, value digest, observation digest and bounded-classification
  digest;
- minting is private to the originating 666CU harness and is not exported;
- each harness owns a distinct frozen private session;
- the capsule and its exact frozen observation reference are registered in a
  module-private `WeakMap`; and
- capsule provenance is checked before any candidate property, key,
  descriptor, prototype, iterator or serialization access.

Unknown objects, proxies, clones, copied results and caller-created
self-consistent capsules are rejected without content-identity claims.
Cross-harness reuse is rejected even when public bytes and digests are equal.
Symbols, functions, budget-exceeded primitives, malformed objects and valid
object requests receive no capsule authority in this slice.

## Private result verification

The public result verifier accepts only an originating harness, the original
request and a bounded result shell. Before rebuilding, it requires the result's
capsule to be present in the private provenance registry and bound to that exact
harness session. It then privately rebuilds from the request and requires exact
deep equality. A cloned harness, cloned capsule, recomputed public digest or
result from another harness cannot grant authority.

The implementation captures its reflection, collection, freezing and private
`WeakMap` operations at module initialization. Default-off and kill-switch
paths are literal and perform zero predecessor, capsule, provenance or digest
work. Failures are frozen, bounded and contain no caller-controlled error text.

## Safety and scope

The implementation and fixtures begin with `server-only`. The Action is
synthetic-only, fixture-only, read-only, default-off and runtime-unwired. It
adds no route, UI consumer, provider client, database access, persistence,
migration, real authority reader, private key, ranking effect, model mutation,
training, promotion, broker action or production deployment.

Five normative artifacts — implementation, synthetic fixture, focused test,
this contract and the synthetic golden report — are hash-pinned by a separate
fail-closed freeze manifest. CI runs the focused and freeze tests provider-free
and requires a clean tracked tree.

## Delivery condition

Action 666CU remains a candidate until all of the following hold:

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
private atomic observation-authority successor. Action 666CU does not complete
Track 2 and awards no milestone credit by itself.
