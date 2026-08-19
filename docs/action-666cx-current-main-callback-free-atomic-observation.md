# Action 666CX — current-main callback-free atomic observation

## Authority and current-main base

Action 666CX starts from protected main commit
`b9f894e92cc41d9d00ef625fe3bd987e495d6445`, tree
`d83819ea9fa49ba8784dce820db21ff39c5d5873`. This is the ordinary merge of
Action 660J / PR #116 with parents
`960b88f85f3ad7be10c4b848c40127d63a21390b` and
`499bc21ade91d2d0dcf03927183415b383d716ef`. Exact-main push CI run
`32252186236` completed successfully on that commit; GitHub deployments were
empty at the recorded readback. Action 660J changes only the provider-free CI
scheduling and registration infrastructure and does not alter the delivered
666CW runtime foundation from PR #115.

Historical PR #72 remains open Draft stacked non-authority. Its callback-free
material is design context only. This Action does not import historical source,
fixtures, tests, reports, freeze artifacts, review conclusions or successor
authority. It is a fresh current-main successor to delivered Action 666CW.

## Bounded objective

Action 666CW separates private in-process provenance from public envelope
integrity. Action 666CX creates one narrower public readback boundary for only
the canonical 666CW envelope bytes:

- the direct entry accepts an unknown input and literal primitive enable and
  kill-switch values only;
- it accepts a canonical string or an exact direct `Uint8Array`, makes one
  bounded internal byte snapshot, and performs all later work from that
  snapshot;
- it accepts no request reader, dependency shell, harness, factory, trust hook,
  caller-owned evidence container or authority path; and
- accepted public bytes remain `integrity_only`; they never become provenance
  verified, trusted or admitted.

The implementation does not construct a 666CW harness, call `observe`, access
runtime evidence or expose a private capsule. A caller can make public bytes
self-consistent, but that can prove at most the integrity of those bytes.

## Closed terminal contract

After the literal `enabled === true` and `kill_switch_engaged === false` gate,
input is limited to 65,536 UTF-8 bytes. Genuine direct typed-array bytes are
copied with captured intrinsics before JSON parsing. The closed terminal
taxonomy is:

```text
integrity_only
malformed
non_canonical
digest_mismatch
input_rejected
```

`integrity_only` requires the exact 666CW public-envelope schema, exact
serialization order and a recomputed envelope digest. It has
`provenance_verified:false`, `trusted:false` and `admitted:false`. A copied
result shell, runtime-evidence object, function, proxy, accessor, typed-array
subclass, detached buffer, malformed UTF-8, over-budget input or reentrant
caller hook cannot raise that authority level.

Every terminal projection is bounded, canonically digested and recursively
frozen. Failure output contains no caller exception message, stack, coercion
result or backend detail. Disabled and killed calls do not inspect input,
capture bytes, parse JSON or compute a digest.

## Containment and safety

The implementation and its fixtures begin with `server-only`. This Action is
synthetic-only, fixture-only, provider-free, database-free, read-only,
default-off and runtime-unwired. It adds no route, UI consumer, persistence,
migration, provider access, publisher, key, ranking effect, model mutation,
training, promotion, broker action or production deployment.

Five normative artifacts — implementation, synthetic fixture, focused test,
this contract and the synthetic golden report — are hash-pinned in a separate
fail-closed manifest. Action 660J owns the provider-free CI sharding
integration; the focused and freeze tests are registered in its replay-lineage
shard while the workflow and clean tracked-tree requirement remain unchanged.

## Delivery condition

Action 666CX remains a candidate until its exact scope is frozen over this
current-main base, exact-head CI succeeds, an independent current-head
read-only review reports no findings, and the operator explicitly approves a
named PR and exact head. Only an ordinary protected pull-request merge followed
by exact-main CI can deliver it.

No production deployment, provider action, database action or Supabase action
is authorized. An automatic preview, if one appears later, is non-production
evidence only and grants no runtime, delivery or roadmap authority.
