# Action 654Q — Lossless UTF-16 Observation Successor

## Scope

Action 654Q is an additive, local, synthetic-only successor to the frozen
Action 654O/654P canonical readiness boundary. It closes `654P-M1` without
modifying its predecessors or published PR #78 bytes. It neither commits nor
publishes ordinary Git state.

The only public operation accepts a primitive canonical gate string and the
unchanged Action 654H plain readiness request. Objects, boxed strings,
functions, proxies, callbacks, accessors, and caller handles are rejected by a
`typeof` check before property, descriptor, prototype, enumeration, reflection,
or coercion work.

## Lossless observation frame

Before JSON parsing, every in-budget primitive string is represented by the
closed frame:

```text
frame_version:action_654q_utf16_observation_frame_v1
input_domain:action_654q_canonical_readiness_gate_input
policy_version:action_654q_lossless_utf16_policy_v1
code_unit_encoding:uint16_big_endian_hex
code_unit_endianness:big
code_unit_count:<exact JavaScript String.length>
code_unit_byte_count:<code_unit_count × 2>
code_units_big_endian_hex:<four lowercase hex digits per code unit>
```

The observation digest is domain-separated with
`action_654q_observed_gate_utf16_`. No `TextEncoder`, UTF-8 replacement,
Unicode normalization, case folding, locale transform, or scalar-value
conversion participates in observed-input identity. Therefore lone high and
low surrogates retain their exact 16-bit values. A valid surrogate-pair code
unit sequence differs from either isolated member or any separated sequence.
Identical code-unit sequences remain identical regardless of how JavaScript
source text constructed them.

For rejected in-budget strings, the failure identity binds the policy version,
terminal reason, and lossless observation digest. The terminal digest binds the
same observation and failure identity. Caller text and raw code-unit hex never
appear in a public failure result.

## Bounded processing

The captured primitive is measured before code-unit iteration, digest, or
parse work:

- maximum code units: `128`;
- maximum code-unit bytes: `224`.

An over-budget value is rejected before content observation and JSON parsing.
Its bounded rejection identity binds policy, reason, observed count, and
derived byte count; it does not claim a full content digest. Within budget,
each code unit is read exactly once from the captured primitive value.

## Canonical gate semantics

After lossless observation, Action 654Q preserves the Action 654O schema and
exact field order:

```json
{"version":"action_654o_canonical_gate_v1","enabled":true,"kill_switch_active":false}
```

`enabled` and `kill_switch_active` must be genuine booleans. Missing, extra,
duplicate, reordered, malformed, or otherwise noncanonical code units are
rejected. `JSON.parse` creates a new engine-owned object; the validated
three-field snapshot is frozen and is the only gate data used downstream.
Parser exceptions are sanitized.

## Readiness authority and consumption

Action 654Q does not import or invoke Action 653 V5 directly. It supplies only
the frozen engine-owned gate booleans to the unchanged private Action 654H
atomic composition boundary. Plain V5 results cannot establish authority.

- Invalid attempts consume no confirmation or execution authority.
- A valid composition establishes exactly one V5 instruction and one readiness
  envelope.
- Exact duplicates remain idempotent.
- Conflicting and cross-session reuse fails closed.
- The strict predecessor expiry boundary remains unchanged.

`654N-M1` remains closed because no caller-owned gate object enters Action
654H. `654P-M1` is closed because `U+D800` and `U+D801` produce distinct
observation, failure, and terminal digests.

## Safety

The result is diagnostic and synthetic only. These values are immutable:

```text
transport_attached:false
dispatch_permitted:false
broker_submission_allowed:false
real_broker_submission:false
avanza_live_access:false
credential_access:false
automatic_execution:false
trade_mutation:false
production_write:false
```

No transport, endpoint, broker, provider, credential, account, session cookie,
BankID, browser/CDP, fetch, socket, database, persistence, process-spawn, order,
trade, position, fill, or performance-claim capability is introduced.
