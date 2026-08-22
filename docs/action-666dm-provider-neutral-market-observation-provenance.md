# Action 666DM — Provider-neutral market-observation provenance

Status: source-only candidate. This Action adds a pure constructor and
validator for a canonical, opaque market-observation commitment that can later
feed the already default-off Action 655G market-data fields. It creates no
adapter, route, worker, queue, database read or write, provider configuration,
deployment, broker operation, or runtime wiring.

## Canonical boundary

The constructor accepts only one primitive, canonical JSON string. Its input
contains a canonical instrument identity, an opaque source identity, a UTC
observation instant, and a SHA-256 payload commitment. An instrument identity
has the ASCII grammar `instrument:<venue>:<symbol>`, where venue is 2–16
uppercase letters or digits and symbol is 1–64 uppercase letters, digits,
periods, underscores or hyphens. It deliberately accepts no raw provider
payload, endpoint, request, response, account, connection or credential
material.

The frozen output provides the four existing 655G-compatible market-data
commitment fields plus an independently domain-separated provenance digest. A
future adapter must be separately designed and authorized to derive its
sanitized input; this source-only contract cannot make a provider call or
assert that any market value is current, complete, authorized, or suitable for
an execution decision.

## Validation and failure behavior

Both public operations reject anything other than a primitive canonical JSON
string before property inspection. Construction rejects unknown keys, aliases,
noncanonical ordering, invalid opaque identities, invalid digest spelling,
noncanonical instants and any unsupported contract version. Validation
reconstructs the expected output from its opaque commitments and fails closed
on any divergence.

The result is deeply frozen and always records `side_effects_performed: false`.
It grants no authority to turn on Action 655G, add a market-data integration,
or perform any production action.

## Evidence and next gate

The accompanying evidence records only SHA-256 hashes of the source-contract
artifacts and predecessor tree. It
contains no raw provider payload, ownership, connection, account, database or
credential data. A later bounded review must define an adapter boundary,
freshness/readback behavior and integration tests before this contract can be
used by any monitor path.
