# Action 666CG — Callback-Free Successor Independent Review

## Frozen scope

The review used `refs/codex-preservation/action-666cf` at
`f3979a8ac43197f4a76531f50081d0b8f8b37654`, whose parent is
`f4453f5fc9b224a7a3c807785e06002d66f03043`. All five normative artifacts
matched that object byte-for-byte. Their canonical digest was
`7cb74c1e85e290f903c4d44b942949a19935780d025cdfde50bbbd740d315e00`
before regression, after regression, and after this review.

No CF or predecessor artifact was changed. This report, the freeze manifest,
and the threat matrix are self-excluded review evidence.

## Verified boundaries

- The historical 666CE-M1 callback executes once against CD and leaks its
  caller-controlled exception message. CF has no `read_request`, callback,
  function-valued field, trust callback, mint, factory, or upgrade export.
  Runtime, source, and emitted declaration inventories agree.
- CF's public declaration accepts only `string | Uint8Array` plus two optional
  primitive booleans. Direct functions and arbitrary nested containers are
  rejected without execution or enumeration. A function at any nested
  position is unreachable because the entire container fails at the captured
  typed-array intrinsic boundary.
- Proxy, getter, descriptor, prototype, iterator, `toJSON`, `valueOf`, symbol,
  and accessor probes execute zero hooks. Exact `Uint8Array` instances ignore
  caller-owned coercion properties; subclasses and detached inputs fail with
  closed, sanitized reasons.
- Captured canonical strings and ordinary `ArrayBuffer`-backed byte arrays are
  read once before parsing. Mutation after a completed call does not change
  its deep-frozen result. Finding 666CG-M2 records the separate shared-memory
  concurrency exception to the claimed after-entry guarantee.
- Malformed JSON, noncanonical ordering, schema mismatch, digest mismatch,
  detached input, and invalid UTF-8 do not expose parser, backend, stack, or
  caller exception messages.
- Canonical serialized evidence remains integrity-only. It always fixes
  `provenance_verified`, `trusted`, and `admitted` to false. Fully recomputed
  public SHA-256 values after semantic replacement do not create authority.
- Default-off and kill-switch paths perform zero snapshots, byte reads,
  parsing, or digest work. UTC and Europe/Stockholm processes reproduce the
  same golden digest. BV/BX/BZ/CD predecessor interoperability passes.
- No database, provider, writer, persistence, migration, dependency, lockfile,
  live import, training, model change, or promotion surface was introduced.

## Finding 666CG-M1 — invalid-byte failure identity collision

Severity: **major**

Two distinct genuine byte inputs, `Uint8Array([0xff])` and
`Uint8Array([0xfe])`, are both fully read through captured typed-array
intrinsics before UTF-8 decoding fails. The implementation then discards the
observed bytes and calls `rejectedInputResult` with only
`readback_bytes_invalid`.

Both results therefore have `captured_input_digest: null` and byte-identical
terminal identity, failure identity, and readback digest. The independent
probe reproduced this deterministically. This violates the explicit review
requirement that distinct safely observed failure inputs retain distinct
identities and weakens the predecessor's forensic input binding.

## Finding 666CG-M2 — shared backing memory is not an immutable snapshot

Severity: **major**

An exact `Uint8Array` backed by `SharedArrayBuffer` passes the genuine-array
and prototype checks. The captured iterator then reads directly from shared,
concurrently mutable memory. A worker-thread probe continuously changed the
first canonical byte while the public operation ran 500 times and produced
multiple captured-input/terminal results from the same admitted input object.

The operation performs one sequential caller-byte read, but that read is not
an atomic immutable snapshot when the backing store is shared. This violates
the required guarantee that caller mutation after entry cannot affect the
result and prevents unconditional single-snapshot determinism. Ordinary
`ArrayBuffer` inputs and mutation after return remain safe.

## Build applicability

`next build --webpack` was run in a disposable checkout at the exact parent
`f4453f5fc9b224a7a3c807785e06002d66f03043`. Compilation passed and the build
then failed because `app/api/hb307c/ping/route.ts` exports
`hb307cCanaryRouteBuildMarker`, which Next does not permit for a route.

The identical failure occurred with CF present. It is classified as
`scope_external_pre_existing_failure`, not success. The disposable checkout
was removed after reproduction.

## Decision

```text
blocker: 0
major: 2
minor: 0
nit: 0
approved: false
local_checkpoint_ready: false
```

Recommended bounded successor: retain a digest-bound bounded observation for
safely captured rejected bytes, and reject shared backing stores before any
byte read (or introduce an equivalently strong immutable owner boundary).
Then refreeze and independently re-review both findings.
