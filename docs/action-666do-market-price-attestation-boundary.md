# Action 666DO — Market-price attestation boundary

Status: source-only candidate. This Action takes one sanitized exact integer
price and binds it to the already opaque Action 666DM provenance and the fresh
Action 666DN assessment. It does not call, configure or select a provider; it
does not accept a raw provider payload, endpoint, response, account,
connection or credential.
The retained value contains no raw provider payload.

## Boundary

The only accepted input is one canonical JSON string containing:

- an opaque canonical Action 666DM provenance string;
- the monitor and decision instants needed to rebuild the Action 666DN
  assessment; and
- a positive base-10 integer `current_price_units`, at most `2^127 - 1`.

The nested 666DM provenance and the 666DN freshness assessment are rebuilt,
not accepted by reference. A stale or future assessment refuses construction.
The returned attestation carries only the opaque identities/digest, observation
instant and sanitized integer units. It deliberately does not assert that the
price was read from any provider or that it matches the source digest: proving
that linkage needs a separately reviewed adapter.

The representation has no price-scale, tick-alignment, position, session or
execution meaning. Those fields require a server-owned position snapshot and
separate runtime ownership; no client value becomes authoritative here.

## Authority limit

Every output is deeply frozen and carries
`runtime_authority_granted:false` and `side_effects_performed:false`.
This module has no route, provider client, network, environment, database,
queue, broker, filesystem, timer, worker or deployment behavior. It cannot
activate Action 655G or construct its monitor-observation input.

## Next gate

A future source-specific provider adapter must separately establish a
privacy-reviewed raw-to-sanitized-price linkage, provider ownership, provider
freshness semantics, server-only operation, position/tick compatibility and
runtime integration. That work requires independent review and a fresh
operational authorization; this Action provides none of them.
