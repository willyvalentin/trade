# Action 666CF — Callback-Free Atomic Observation Contract

## Public boundary

`canonical_callback_free_atomic_observation_v1` accepts only a canonical JSON
string or an exact, genuine `Uint8Array`. Its only additional public values
are the primitive boolean enable and kill-switch gates.

The operation accepts no request reader, function, callback, factory, trust
hook, option object, authority object, or caller-owned evidence container.
Functions and all arbitrary objects fail closed without execution or
enumeration.

## Single snapshot

After the default-off gate, the implementation validates the input with
captured intrinsics and makes exactly one internal byte snapshot. Parsing,
schema validation, canonical ordering, digest rebuilding, terminal identity,
and failure identity use only that snapshot. Mutation or detachment of the
caller's original buffer cannot alter a completed result.

Exact `Uint8Array` instances are read with captured typed-array intrinsics.
Subclasses, Proxies, accessors, iterators, `toJSON`, `valueOf`, and symbol
substitutions are rejected or ignored without invoking caller hooks.

## Integrity is not provenance

Valid canonical bytes may produce only:

```text
status: integrity_only
integrity_verified: true
provenance_verified: false
authority_status: integrity_only
trusted: false
admitted: false
```

Recomputing every public SHA-256 digest after semantic replacement does not
change that authority level. The private in-process CB/CD provenance boundary
remains a predecessor capability and is not exported or reconstructed by CF.

## Failure and exception boundary

Malformed JSON, noncanonical ordering, digest mismatch, unsupported objects,
function-valued inputs, subclasses, invalid UTF-8, oversized bytes, and
detached buffers have closed reason codes. Caller exception messages, stack
traces, coercion output, and backend details are never exposed. Safely
captured bytes bind deterministic terminal and failure identities.

## Default-off and safety

Disabled and kill-switch modes return before input snapshot, byte reads,
parsing, or digest work. The foundation is server-only, synthetic,
not-publishable, and disconnected from live consumers, persistence, writes,
providers, databases, training, model changes, or promotion.
