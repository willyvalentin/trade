# Action 666CW — current-main integrity/provenance-separated observation authority

## Authority and current-main base

Action 666CW starts from protected main commit
`981bb474ebe5466f92d671ef489a1f3a82d3bcba`, tree
`d43918f9e47782002d8b28b11804935112e99c59`, after Action 660I closed
Milestone A, Action 666CV reached main and exact-main CI run `32080009340`
completed successfully.

Historical PR #72 remains open Draft stacked non-authority. Its historical
Action 666CD text is design evidence only. No historical implementation,
review authority, threat matrix, freeze artifact or successor chain is
imported. This Action is a fresh current-main successor built only on the
delivered 666CV boundary.

## Bounded objective

Action 666CV provides private atomic runtime authority and integrity-only
canonical evidence readback. Action 666CW makes the separation itself an
explicit closed contract:

- runtime provenance is created only after the exact 666CV result shell is
  rebuilt and verified by its originating 666CV harness;
- runtime evidence records `provenance_verified:true`, scope
  `current_process_only`, and `trusted:true` without exposing either capsule;
- the public canonical envelope always records `provenance_verified:false`,
  `authority_status:integrity_only`, `trusted:false` and `admitted:false`;
- each 666CW result shell is privately registered to its exact frozen harness
  session and must rebuild byte-for-byte before verifier authority is granted;
  and
- a copied result, clone, replay, cross-harness result or public digest cannot
  recreate private runtime provenance.

A public envelope may be made self-consistent by any caller. That proves only
the integrity of those public bytes. It never proves who produced them and
never grants trusted, admitted or provenance-verified status.

## Closed readback taxonomy

Readback accepts only a string or genuine `Uint8Array`, bounded to 65,536
UTF-8 bytes. Unknown objects, other typed arrays, proxies and over-budget input
are rejected before caller hooks. Accepted bytes use fatal UTF-8 decoding,
captured JSON parsing, one exact closed schema, exact canonical ordering and a
recomputed envelope digest.

The terminal taxonomy is closed and deterministic:

```text
integrity_only
malformed
non_canonical
digest_mismatch
input_rejected
```

`integrity_only` still returns `provenance_verified:false`, `trusted:false`
and `admitted:false`. Malformed JSON or UTF-8, alternate ordering or
whitespace, duplicate or extra keys, digest mismatch and rejected input remain
distinct. Failure output is frozen, bounded and contains no caller-controlled
exception text.

## Durable trust boundary

Persisted bytes cannot preserve the module-private `WeakMap`, result identity
or harness session. Durable readback could regain provenance only through a
separately owned external authority with an independently pinned anchor and
verified attestation. Action 666CW introduces no such authority, callback,
reader, key, trust store or upgrade path.

Reflection, collection, freezing, JSON, hashing, text, typed-array and private
map operations used by this layer are captured at module initialization.
Downstream mutation either preserves the exact result or fails closed without
granting provenance.

## Containment and safety

The gate is literal: only `enabled === true` together with
`kill_switch_engaged === false` may inspect dependencies or construct 666CV.
Implementation and fixtures begin with `server-only`. The Action is
synthetic-only, fixture-only, provider-free, database-free, read-only,
default-off and runtime-unwired. It adds no route, UI consumer, persistence,
migration, provider access, publisher, real authority reader, private key,
ranking effect, model mutation, training, promotion, broker action or
production deployment.

Five normative artifacts — implementation, synthetic fixture, focused test,
this contract and the synthetic golden report — are hash-pinned by a separate
fail-closed freeze manifest. CI runs focused and freeze tests provider-free and
requires a clean tracked tree.

## Delivery condition

Action 666CW remains a candidate until all of the following hold:

1. the exact candidate scope is frozen over current protected main;
2. exact-head CI succeeds;
3. an independent current-head read-only review reports no findings;
4. explicit operator approval names the PR and exact head;
5. an ordinary protected pull-request merge makes the exact reviewed artifacts
   reachable from `main`; and
6. exact-main push CI succeeds.

Production deployment, provider action and database action are not authorized.
An automatic Netlify deploy-preview is non-production evidence only and grants
no runtime, delivery or roadmap authority.

The next bounded Track 2 objective after delivery is a fresh current-main
callback-free atomic observation successor. Action 666CW does not complete
Track 2 and awards no milestone credit by itself.
