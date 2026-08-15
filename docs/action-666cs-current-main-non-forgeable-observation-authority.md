# Action 666CS — Current-main non-forgeable observation authority

## Authority boundary

This bounded successor starts from exact current `main` commit
`b84e0a4fb8c7455cddf8797f112cd2dc059bd697`, tree
`54a8d747e4116251ac38428a6d322dc447dee61c`, after the ordinary merge and
successful exact-main CI delivery of Action 666CR.

Historical PR #72 remains an open Draft stacked non-authority at head
`40155d6b5bf03cb8e3ed2207f4f771d62b6f6937`. Historical code commit
`0ef7bdbbd2fef3300e7e561a037e5432638dd650` and review commit
`730baa4f345cd1453ce49d1fc554f4d5a4d9cb48` describe a larger `BV -> CI`
observation-authority chain. They are design evidence only. No historical
review, freeze manifest, threat matrix or approval is imported as current-main
authority.

Action 666CS rebuilds only the first non-forgeable successor above the current
Action 666CQ issuance engine. Later historical scalar-observation,
provenance-separation, callback-free and immutable-byte successors remain
outside this Action and require fresh current-main work.

## Non-forgeable owner proof

The successor admits one canonical raw-JSON authority envelope. The envelope
contains only source-pinned authority facts:

- external owner session and boundary identities;
- exact CQ authority identity, digest, root and issuer-anchor digest;
- exact request identity and version;
- exact recursive request-schema digest and semantic-scope digest; and
- minimum publication epoch.

The payload digest is signed with Ed25519. Only the public key, detached
signature and signed public facts are committed. The transient synthetic
private key used to produce the fixture signature was neither printed nor
written to the repository. There is no exported trust-granting authority
factory and no runtime rotation surface.

Changing a root, anchor, request, scope, schema, session, payload digest or
signature cannot create valid provenance. The current CQ authority remains
separately pinned and is independently rebuilt through the private originating
CQ harness. A caller-created CQ authority can therefore match its own public
digest yet still cannot match the signed and source-controlled authority pin.

## Ordered fail-closed processing

The active path is deliberately ordered:

1. literal `enabled === true` and `kill_switch_engaged === false` gates;
2. bounded hook-free request validation;
3. exact recursive CQ request-shell and semantic-scope validation;
4. immutable request snapshot plus request/schema digests;
5. exactly one external raw-envelope read;
6. 32 KiB bounded UTF-8 validation before JSON parsing;
7. captured JSON parsing, exact canonical-byte equality and duplicate-key
   rejection;
8. exact envelope and payload shapes, source pins, payload digest and Ed25519
   verification; and only then
9. current-main `CS -> CQ -> BD -> AX -> AJ -> AC -> V -> AQ` execution plus
   private independent rebuild verification.

Malformed requests, proxies, accessors, cycles, unsupported values and budget
failures terminate before external authority access. Invalid envelopes,
cross-session envelopes, self-consistent root substitutions, malformed base64,
oversized input, duplicate keys and callback failures terminate before CQ
execution. Unexpected errors are converted to frozen structured evidence.

Dependencies and callbacks are captured at harness construction. Counters and
rebuild authority are private. A copied harness or a result with a correctly
recomputed public digest cannot pass the private verifier. Runtime primitives
used by this layer are captured at module initialization; post-import mutation
is contained without throwing or leaking attacker-controlled error text.

Malformed-request outputs are diagnostics only and deliberately receive no
private verifier authority in this slice. This prevents two invalid inputs from
cross-verifying through a bounded-observation collision. The next lossless
invalid-scalar successor may grant that authority only after every admitted
invalid primitive observation is injectively bound.

## Safety boundary

This Action is server-only, synthetic-only, fixture-only, provider-free,
database-free, read-only, default-off and runtime-unwired. It adds no live
consumer, publisher, writer, persistence, migration, broker or execution path.
It cannot change ranking, models, parameters, thresholds, training, promotion
or production behavior. Synthetic output is not production evidence and is
not publishable as performance.

The next bounded Track 2 objective after delivery is the current-main lossless
invalid-scalar observation successor. That successor must start from the exact
delivered 666CS main commit and receive its own exact-head review and CI.

## Delivery boundary

Delivery requires all of the following without substitution:

1. exact normative bytes and the fail-closed freeze manifest reach one frozen
   PR head;
2. exact-head CI succeeds;
3. a fresh independent current-head read-only review reports no blocking
   findings;
4. explicit operator approval names the PR and exact head;
5. an ordinary PR merge preserves the reviewed scope on `main`; and
6. exact-main CI succeeds.

Production deployment, provider action and database action are not authorized.
