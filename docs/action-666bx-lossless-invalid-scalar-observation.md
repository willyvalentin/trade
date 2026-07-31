# Action 666BX — Lossless Invalid-Scalar Observation Successor

## Contract

`canonical_lossless_invalid_scalar_observation_issuance_v3` is an additive,
server-only and default-off successor to the frozen Action 666BV contract. It
does not modify BV/BW or PR #72.

Before BX creates its failure identity it classifies an applicable primitive
with a closed type tag and canonical representation:

- BigInt uses a signed hexadecimal magnitude.
- Number uses the exact IEEE-754 binary64 bytes in big-endian order, preserving
  `0`, `-0`, finite values, `NaN`, and both infinities.
- String uses UTF-16 code units in big-endian hexadecimal form so unpaired
  surrogates remain distinct.
- Boolean, `null`, and `undefined` use closed ASCII literals.
- Symbol and function identities are explicitly non-representable. Their
  content identity is not claimed.

Represented values bind the type tag, representation, complete canonical
value and byte length into a value digest. The observation digest binds that
value digest and the terminal failure identity binds the observation digest
plus the independently rebuilt BV predecessor result.

Canonical value output is limited to 65,536 bytes. An oversized primitive is
classified with `primitive_observation_max_bytes_exceeded`, `value_digest:
null`, and `full_value_identity_claimed: false`; it is never mislabeled as a
complete content identity.

`bounded_observation_digest` binds the closed type, observation status,
representation, observed byte count, fixed byte budget, value digest and
reason inventory. For budget-exceeded or non-representable values it remains a
bounded forensic classification and never substitutes for a full content
identity.

The implementation uses captured language intrinsics and direct primitive
operations. It does not invoke `toJSON`, getters, coercion callbacks, or caller
hooks.

## Authority and interoperability

BX delegates the underlying issuance decision to the unchanged BV contract and
independently rebuilds that result. A valid object request continues through
BV → BQ → BD → AX → AJ → AC → V → AQ. Primitive failures retain the BV
classification while receiving collision-resistant BX observation, failure,
and terminal digests.

## Safety

The factory remains disabled by default and kill-switch controlled. Disabled
execution performs no request reads, primitive observation, predecessor work,
or digest work.

No database, PostgreSQL, provider, persistence, writer, migration, dependency,
lockfile, live import, training, parameter change, model change, promotion, or
external-AI canonical authority is introduced. All evidence is synthetic and
not publishable as real performance.
