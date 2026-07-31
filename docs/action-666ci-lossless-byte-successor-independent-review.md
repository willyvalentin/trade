# Action 666CI — Lossless Immutable Byte Successor Independent Review

## Frozen authority

The independent review used `refs/codex-preservation/action-666ch` at
`ab86dff75c6a1b0e31e535dac3b4888af03fc376`. All five normative Action 666CH
artifacts matched the preservation object byte-for-byte. Their canonical
digest was
`81bb1730ba3e96c61057a9314fe84cb9b9e434b55d63abffae395e577852141e`
before regression, after regression, and after this review.

No CH or predecessor artifact was changed. This report, the freeze manifest,
and the threat matrix are self-excluded review evidence.

## Historical attacks

- **666CG-M1 reproduced against CF and closed in CH.** Genuine
  `Uint8Array([0xff])` and `Uint8Array([0xfe])` inputs collapse in CF after
  fatal UTF-8 decoding. CH observes the immutable raw bytes first and binds
  input domain, exact byte length, raw-byte SHA-256, and observation digest.
  The two inputs remain distinct through observation, failure, terminal, and
  readback digests. The focused suite independently rebuilt those identities.
- **666CG-M2 reproduced against CF and closed in CH.** A worker mutating a
  SharedArrayBuffer while CF reads it produces multiple observed results.
  CH rejects the exact SharedArrayBuffer-backed view before byte access, copy,
  decoding, raw-byte hashing, or terminal digest work. The rejection path
  records one boundary check and zero downstream operations.

## Immutable snapshot boundary

- Accepted byte input must be an exact `Uint8Array` backed by an exact,
  ordinary, fixed `ArrayBuffer`. Captured intrinsics reject proxies,
  subclasses, cross-realm substitutions, detached buffers, and supported
  resizable/growable stores without caller hooks or exception detail.
- The accepted visible view is copied exactly once with captured intrinsics
  into a newly allocated module-owned ordinary `ArrayBuffer`. All downstream
  hashing, fatal UTF-8 decoding, parsing, identity construction, and result
  rebuilding use only that private snapshot. Immediate caller mutation after
  entry cannot change the completed result.
- Offset views bind only their exact visible byte range. Exact length and raw
  SHA-256 rebuild from the private snapshot. Invalid UTF-8 and JSON/parser
  failures expose only closed reason codes.
- Getter, accessor, proxy, iterator, `toJSON`, `valueOf`, coercion, and callback
  probes execute zero caller hooks. No raw decoder, parser, backend, stack, or
  caller-controlled exception message appears in canonical output.

## Trust, determinism, and effects

- Canonical readback preserves the integrity/provenance separation:
  `provenance_verified`, `trusted`, and `admitted` are always false for
  serialized evidence. Public digest equality cannot create authority.
- Default-off and kill-switch paths perform zero boundary, snapshot, copy,
  byte-read, hash, decode, parse, or digest work.
- Separate UTC and Europe/Stockholm processes produced the same golden bytes.
  The focused CH suite passed 16/16, relevant Action 665/666 passed 435/435,
  and Action 664 DB-free passed 161/161. PostgreSQL remained explicitly not
  applicable because this Action forbids database activity.
- Static and runtime checks found no live importer, writer, persistence,
  provider/database access, migration, dependency, lockfile, automatic model
  change, or promotion surface.

## Build applicability

`next build --webpack` was run in a disposable checkout at the exact base
`f4453f5fc9b224a7a3c807785e06002d66f03043`. Compilation passed and type
checking then failed because `app/api/hb307c/ping/route.ts` exports
`hb307cCanaryRouteBuildMarker`, which Next.js does not permit for a route.
The failure predates CH and is classified as
`scope_external_pre_existing_failure`, not success.

## Decision

```text
blocker: 0
major: 0
minor: 0
nit: 0
approved: true
local_checkpoint_ready: true
```
