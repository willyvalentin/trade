# Action 666CY — current-main lossless immutable byte snapshot

## Authority and base

This current-main successor is bound to protected main commit
`377b87d344ddb48d73c725b348d1dcb4c0943fd1`, tree
`7b8c529ecabfe367ccba3ec27629f02b8c5d4c44`, after ordinary delivery of
PR #117 / Action 666CX and successful exact-main CI run `32261552249`.
Historical PR #72 is non-authority design context only.

## Snapshot boundary

`canonical_lossless_immutable_byte_snapshot_v2` accepts a string or a genuine
direct `Uint8Array` backed by a fixed ordinary `ArrayBuffer`. Primitive literal
booleans are the only enable and kill-switch controls. There is no callback,
reader, dependency shell, harness, factory, evidence object or trust hook.

Captured intrinsics validate proxy/brand/prototype, backing-store kind,
resizability, detachment and visible byte length before copying. Shared memory,
resizable or detached buffers, subclasses, cross-realm views and proxies fail
closed before byte copying. Accepted typed-array input is copied once into a
module-owned fixed buffer; only visible view bytes are copied. Accepted string
input is encoded with captured `encodeInto` into one fixed 65,536-byte private
buffer. Incomplete multibyte encoding fails before any over-budget allocation,
hash, decode or parse.

## Lossless raw-byte evidence

Before decoding or parsing, every accepted snapshot binds:

- `canonical_raw_byte_observation_v2`;
- the input domain;
- exact byte length;
- SHA-256 over the exact raw bytes; and
- a canonical observation digest.

Fatal UTF-8 failure retains this raw observation. The decoder preserves a
leading UTF-8 BOM rather than normalizing it away, so BOM-prefixed bytes cannot
alias canonical bytes. Consequently distinct invalid sequences such as `0xff`
and `0xfe` have distinct raw hashes, observations, terminal identities, failure
identities and readback digests, while exposing only
`raw_bytes_invalid_utf8`.

## Integrity without authority

Canonical 666CX envelope bytes may establish public byte integrity only. Every
result fixes `provenance_verified:false`, `trusted:false` and `admitted:false`.
A self-consistent public replacement cannot recreate private runtime provenance
or upgrade authority.

Every result is digested with a descriptor-based canonical serializer which
does not consult inherited `toJSON`. The hash factory and hash methods are
captured as construction-time values, while scratch arrays are null-prototyped.
Every result is recursively frozen. Default-off and kill-switch paths do not
inspect input or perform boundary, snapshot, copy, read, hash, decode, parse or
digest work. Errors are structured and never expose caller exception text,
stacks or backend details.

## Containment and delivery

The implementation is server-only, synthetic-only, default-off,
provider-free, database-free, runtime-unwired and consumer-free. It adds no
route, persistence, migration, ranking effect, training, promotion, broker or
production capability.

Five normative artifacts are hash-pinned in a fail-closed manifest. Action
660J owns provider-free CI registration. Delivery requires exact-head CI,
independent review, explicit operator approval, ordinary protected PR merge and
successful exact-main CI. An automatic Netlify preview is non-production only.
No production deployment is authorized.
