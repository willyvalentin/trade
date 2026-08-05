# Action 667T.7C — Immutable verified-snapshot use

## Decision

`repository_owned_recommendation_outcome_evidence_issuance_v4` is an
additive, diagnostic-only successor to V3. It closes `T7B-001` without
changing V1–V3, either published T commit, or PR #71.

V3 correctly created an immutable authority snapshot for local
pre-admission, but its issued handoff subsequently rebuilt the predecessor
authority and request from caller-owned originals. A material callback could
mutate those originals after the local snapshot, causing local `issued`
followed by S.2A rejection.

V4 establishes one caller-to-snapshot transition. No caller-owned request,
authority anchor, or material object is used after that transition.

## Snapshot order

When enabled and not killed, V4:

1. Performs one bounded descriptor-based request snapshot pass.
2. Performs one descriptor-based authority snapshot pass without evaluating
   accessors.
3. Canonicalizes the authority anchor into bounded plain data and freezes it.
4. Invokes the captured material callback exactly once.
5. Canonicalizes the returned material with the existing bounded,
   non-recursive validator and freezes it.
6. Builds a versioned verified-snapshot bundle and audit solely from those
   plain bytes.
7. Uses fresh internal objects derived only from the verified snapshot for
   V3 pre-admission, status, request construction, digests, S.2A invocation,
   failure provenance, and audit.

The original caller request and authority are never reread after the
snapshot boundary. The callback may mutate them, but those mutations cannot
change downstream bytes.

## Fail-closed behavior

Request or authority accessors, throwing proxies, cycles, unsupported runtime
values, non-plain prototypes, and depth/node/key/array/string budget breaches
produce sanitized non-issued results. Failure identity binds:

- the V4 terminal taxonomy;
- sorted reason codes;
- request, authority, and material snapshot digests;
- the verified snapshot-bundle digest;
- the V3 pre-admission digest when available.

Different rejected plain-data observations therefore retain distinct failure
and terminal digests.

For every non-issued result:

```text
s2a_request_constructed:false
s2a_called:false
downstream_digest_work:false
```

No S.2A completion-result field is exposed.

## Preserved boundaries

The exact T7-001 self-consistent extra-field attack remains rejected before
downstream work. The exact `T7B-001` callback mutation still reproduces V3's
sanitized divergence but passes V4 because V4 hands only immutable snapshot
bytes to V3/S.2A.

The fully synthetic issued fixture preserves:

```text
issued → completed → bindable → ready → captured → joined
```

Disabled and kill-switch modes return before request inspection, authority
inspection, callback invocation, canonicalization, cloning, digest work, or
downstream instrumentation.

## Safety

```text
diagnostic_only:true
shadow_only:true
real_outcome_source_accessed:false
canonical_binding_ready:false
automatic_model_input_allowed:false
live_ranking_effect:false
```

All evidence is synthetic. V4 adds no provider, database, writer,
persistence, migration, dependency, deployment, canonical, training, or live
path.
