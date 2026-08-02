# Action 661J.5R.1 Transport-Inert Bounded Invocation Authorization

## Status

This additive contract defines the private authorization boundary immediately
after the certified Q planning authority. It does not invoke, transport, queue,
persist, or otherwise execute runtime work.

The authority chain is closed and one-way:

```text
O certification admission
  -> P certified runtime selection
  -> Q bounded invocation plan
  -> R private bounded invocation authorization
```

Only R may request Q internally. Public callers provide nine bounded primitive
arguments and cannot provide an admission, selection, plan, runner receipt,
capsule, or authority object. Any additional argument fails closed.

## Public Contract

The module exports one version, one frozen policy, its canonical SHA-256 digest,
one request operation, and one provenance verifier. It exports no mint,
registration, callback, execution, transport, provider, persistence, or runner
loading surface.

Default-off returns `not_authorized` before argument inspection. Its counters
prove zero planning requests, plan verifications, authorization digests, and
authorization issuances.

Enabled input is captured once as primitives:

- repository root string;
- closed request identity string;
- canonical UTF-8 request string, at most 512 bytes;
- integer creation, evaluation, and expiry boundaries;
- invocation budget from 1 through 8 bounded operations;
- attempt ordinal from 1 through 4.

Objects, accessors, callbacks, proxies, symbols, bigint values, and coercion are
not consumed. The implementation never serializes caller objects and does not
expose raw request text or request identity in success or failure evidence.

## Private Provenance

R calls the private Q request operation exactly once and verifies the returned Q
plan exactly once. A successful plan must retain the certified O admission, P
selection, Q policy and plan identity, 28/28 inventory, runtime family, policy,
protocol, profile, and runner identity.

The issued receipt is registered in module-private `WeakMap` provenance. The
public verifier recognizes only the exact in-process receipt object. A clone,
serialized reconstruction, substituted object, or recomputed public digest has
no provenance and is rejected. The receipt is evidence of a bounded decision;
it is not runtime authority.

## Bound Identity

The authorization identity canonically binds:

- O admission identity and frozen certification authorities;
- P selection identity;
- Q plan identity and policy;
- canonical request and request-identity digests;
- certified runtime family, profile, protocol, policy, runner version, and
  runner identity;
- invocation budget and unit;
- creation, evaluation, expiry, and freshness boundaries;
- attempt ordinal and deterministic attempt identity;
- R policy/version and authorized terminal state.

The attempt identity binds the R version, request-identity digest, and attempt
ordinal. Repeating the exact canonical authorization is idempotent and returns
the same frozen result. Reusing that attempt identity with changed canonical
authorization bytes is a conflict and fails closed. Expiry changes, runner or
runtime substitution, and budget expansion cannot preserve private provenance.

## Receipt Schema

The receipt is a deep-frozen plain-data object. Its closed top-level fields are:

```text
authorization_identity_digest
authorization_kind
authorization_version
binding
executable_capabilities
privileged_capabilities
runtime_authority
runtime_execution_allowed
status
transport_access_allowed
```

`runtime_authority`, `runtime_execution_allowed`, and
`transport_access_allowed` are all `false`. Both capability arrays are empty.
No callable, handle, credential, provider client, mutable object, or internal
provenance token is exposed.

## Failure Identity

Rejected enabled requests receive a deterministic SHA-256 failure identity over
the R policy/version, closed reason and stage, bounded type/count metadata, and
sanitized downstream reason identifiers. Caller text, raw exception messages,
paths, credentials, and request bytes are excluded.

## Capability Boundary

R imports only `node:crypto` and Q. It has no dynamic runner import, child
process, Docker, transport, network, broker, database, credential, environment,
writer, persistence, production, automatic model-input, or live-ranking
capability. Validation is static and read-only; no runtime execution is
performed.

## Frozen Golden

```text
policy_digest:
3e385ab82fdccafb7e75ba5d77a2b55be71b51d056a30c68c27f6f35a1fc37f2

plan_identity_digest:
250529f2619eb4e16f764170e96b1dbaa8339bc13c40c8e041f40c7a9a2c67b6

attempt_identity_digest:
70bc330ff302ce60cbacea6cea2b2538f2df5eb9a0afd8d32d6ecea2b4da8e84

authorization_identity_digest:
4801eefde4ba1675004723f086cee3e937ac3d1b78201c2708edbc0c29f5f21d
```

These values certify this synthetic bounded request only. They do not authorize
runtime execution, deployment, production access, or any external operation.
