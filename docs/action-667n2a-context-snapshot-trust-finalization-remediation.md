# Action 667N.2A — Context snapshot trust and finalization remediation

## Versioned successor

`market_context_diagnostic_decision_time_context_feature_snapshot_v2` is an
additive successor to the frozen N.1 contract. It uses:

- result version
  `market_context_diagnostic_decision_time_context_feature_result_v2`;
- trusted-source registry
  `market_context_diagnostic_trusted_source_registry_v1`;
- authority dependency
  `market_context_diagnostic_trusted_source_authority_v1`;
- finalization policy
  `market_context_diagnostic_context_finalized_bucket_policy_v2`.

The N.1 and N.2 files remain historical predecessor evidence. An N.1 snapshot
does not become an N.2A snapshot merely because its source bytes are unchanged.
Only the v2 factory, an externally injected and verified registry anchor, and a
new v2 result digest establish the successor guarantees.

## Closed caller boundary

The public request has closed schemas at the root and for decision identity,
decision source, normalized dataset, replay, calendar, and policy bundle.
Unknown and missing fields fail closed. A recursive pre-schema scan rejects the
following caller authority claims at any depth, including inside arrays:

`canonical`, `verified`, `trusted`, `point_in_time_safe`, `complete`,
`sufficient`, `official_ohlcv`, `performance_eligible`,
`outcome_explanatory`, `causal`, `model_input_allowed`, and
`live_ranking_effect`.

The v2 public request carries source references and a source-decision digest.
It does not carry the source decision payload or an expected authority root.
Those are resolved through the externally injected authority.

## External authority

The factory is default-off. When disabled it returns
`snapshot_factory_default_off` before calling either registry or decision
readers. When enabled, it:

1. loads the registry through the injected authority;
2. validates the registry's closed schema and self-digest;
3. compares the loaded registry with the dependency-injected expected anchor;
4. compares every caller source reference and the explicit watermark value
   against the registry;
5. resolves the decision payload independently;
6. verifies the decision bytes against both the registry and request digest.

Lookup exceptions become the sanitized reason codes
`trusted_source_registry_lookup_failed` or
`trusted_source_decision_lookup_failed`. Provider, account, path, and exception
details are not copied into output.

## Finalized-bucket boundary

The latest finalized bucket is exactly:

```text
decision_unix_ns - provisional_watermark_ns
```

Each observation/candle-bucket end must be at or before that boundary. Its
derived finalization timestamp (`bucket_end + watermark`) must be at or before
the decision instant. Provider source and receive timestamps are validated
separately against the decision instant. The session identity and explicit
decision instant must match the trusted decision schedule. Pending buckets are
never counted as missing.

## Diagnostic and rollback boundary

All v2 results retain:

```text
diagnostic_only: true
official_ohlcv: false
canonical_performance_eligible: false
causal_claimed: false
outcome_explanation_claimed: false
live_ranking_effect: false
automatic_model_input_allowed: false
```

The successor remains default-off and shadow-only. Rollback means ceasing v2
factory invocation; it does not change N.1 bytes or authorize N.1 output as a
substitute. There is no outcome join, provider activity, persistence, database,
canonical binding, or live consumer.
