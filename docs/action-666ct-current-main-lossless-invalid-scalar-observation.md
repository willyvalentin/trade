# Action 666CT — current-main lossless invalid-scalar observation

## Authority and current-main base

Action 666CT starts from delivered main commit
`7b671f740222b0220c88cdccaaf6378519a2c7be`, tree
`3cdbf3a19ab6307b3e3100c74791de7ea6a8cbe1`, after Action 666CS.
The historical PR #72 remains an open Draft stacked non-authority. Its head
`40155d6b5bf03cb8e3ed2207f4f771d62b6f6937`, code commit
`0ef7bdbbd2fef3300e7e561a037e5432638dd650` and review commit
`730baa4f345cd1453ce49d1fc554f4d5a4d9cb48` are design evidence only.
No historical review authority, freeze artifact or successor chain is imported.

## Bounded objective

The predecessor deliberately refuses verifier authority for malformed request
diagnostics. That is correct for general objects, but it also means JavaScript
scalars that JSON cannot represent losslessly have no exact observation identity.
This successor adds one narrow, server-only observation layer:

- `bigint` is signed hexadecimal magnitude;
- `number` is the deterministic IEEE-754 binary64 big-endian byte sequence,
  preserving `0`, `-0`, infinities and the canonical runtime NaN representation;
- `string` is the exact ordered UTF-16 code-unit sequence, including unpaired
  surrogates;
- `boolean`, `null` and `undefined` use type-bound ASCII literals;
- `symbol` and `function` are classified but never represented;
- output is capped at 65,536 ASCII bytes before materialization.

The type tag, representation, canonical value and digest version are all part of
the value identity. Equal-looking values from different primitive types cannot
share an identity. A bounded classification digest exists for every primitive,
but it is not promoted into a full value or failure identity when representation
is impossible or over budget.

## Private verifier authority

The successor grants verifier authority in exactly two cases:

1. a fully represented primitive is bound to the predecessor's structured
   invalid-request diagnostic, its exact issuance digest and a terminal failure
   identity; or
2. a non-primitive request is accepted by the predecessor's own private
   originating-harness verifier.

The successor owns a new private `WeakMap` authority keyed by its originating
harness. A caller cannot supply rebuild dependencies, clone a harness, recompute
a public digest into authority, or turn a non-representable/budget-exceeded
classification into a verified result. The public digest helper accepts only the
existing bounded JSON-safe result surface.

## Trust boundary and containment

Construction is literal default-off and requires `enabled === true` plus
`kill_switch_engaged === false`. Disabled and killed paths do not inspect
dependencies. The active option shell must contain exactly three enumerable data
properties and rejects proxy/accessor/extra-key shells. The 666CS predecessor
captures and validates its own dependency callbacks at construction; subsequent
mutation of the caller's dependency object cannot replace those callbacks.

Primitive observation invokes no coercion, `toJSON`, iterator or caller hook.
Critical prototype methods, reflection operations, `DataView`, hashing and
private `WeakMap` operations are captured at module initialization. Objects and
proxies are never introspected by the scalar observer; they remain entirely under
the predecessor's bounded request validator. All issue and verification failures
are structured, frozen, bounded and contain no attacker-controlled error text.

## Safety and scope

The implementation and fixtures begin with `server-only`. The action is
synthetic-only, fixture-only, read-only, default-off and runtime-unwired. It adds
no route, UI consumer, provider client, database access, persistence, migration,
real authority reader, private key, ranking effect, model mutation, training,
promotion, broker action or production deployment.

The five normative artifacts are implementation, synthetic fixture, focused
test, this contract and the synthetic golden report. Their exact hashes and a
sorted aggregate are pinned by the Action 666CT freeze manifest. The CI workflow
runs the focused and freeze tests provider-free and then requires a clean tracked
tree.

## Delivery condition

Action 666CT remains a candidate until all of the following hold:

1. the exact candidate scope is frozen over the current base;
2. exact-head CI succeeds;
3. an independent current-head review reports no findings;
4. explicit operator approval names the PR and exact head;
5. an ordinary pull-request merge makes the exact reviewed artifacts reachable
   from `main`; and
6. exact-main push CI succeeds.

Production deployment, provider action and database action are not authorized.
An automatic Netlify deploy-preview is non-production evidence only and grants no
runtime, delivery or roadmap authority.

The next bounded Track 2 objective after delivery is current-main
provenance-bound observation verification. Action 666CT does not complete Track
2 and awards no milestone credit by itself.
