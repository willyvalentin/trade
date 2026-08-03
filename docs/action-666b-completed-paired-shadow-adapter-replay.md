# Action 666B — Completed paired shadow adapter and default-off replay

This package is server-only, in-memory, fixture-only and inactive. It does not
read a provider, filesystem or database, and it has no live call-site.
Synthetic fixture results are contract evidence, not Ture performance.

## Completed bundle contract

The adapter accepts only explicitly produced completed baseline/candidate
shadow observations. It returns exactly `mapped`, `conflicting` or
`unmappable`. A mapped bundle binds:

- stable paired-observation, arm-observation and producer-decision identities;
- the same complete Action 665 opportunity-set and authoritative
  pre-truncation membership evidence for both arms;
- full rankings with continuous ranks and globally unique tie-break keys;
- decision timestamp, point-in-time cutoff, cohort and sample type;
- engine, scoring, ranking, threshold, confidence, provider and evaluator
  versions;
- one explicit, reproducible outcome per selected, rejected, overflow and
  under-threshold candidate;
- explicit producer no-trade evidence when the disposition is no-trade;
- positive provider coverage and outcome-inventory reproducibility evidence.

The bundle input digest is recalculated before projection. Conflicting
identities, digests, candidates, outcomes or contract versions are never
deduplicated or repaired. Missing evidence remains structured diagnostics.
Scores, tiers, evidence labels and categorical confidence are never promoted
to probability semantics.

`mapped.comparison_input` is the exact in-memory input to Action 666A. The
adapter has no persistence or network boundary.

## Default-off replay

`createDefaultOffPairedShadowReplayHarness()` defaults to `enabled=false`.
Disabled execution returns before trust verification, adapter, evaluator or
replay-digest construction. An enabled harness accepts only fixture bytes
whose identity and digest exist in the separately supplied, versioned trusted
fixture registry and whose registry root matches the separately supplied trust
anchor. The observation payload cannot self-declare trust. The harness then
recomputes the canonical input digest, runs the adapter and Action 666A, and
independently rebuilds the canonical evaluation result before accepting the
dependency-injected result. Results are deep-frozen and carry:

- `synthetic_fixture_only: true`;
- `offline_shadow_only: true`;
- the adapter and evaluation execution state;
- the verified input digest;
- explicit evaluation-result verification state;
- a canonical replay-result digest.

The harness discovers no files and has no provider, database, persistence or
live-consumer dependency. Activation in tests is explicit dependency
injection, not a product feature flag.

## Real producer gaps

Current production scanner/build payloads do not yet guarantee this completed
bundle. A future producer integration would have to emit, without inference:

- stable paired observation identity and producer decision identity;
- authoritative pre-truncation evidence with the full candidate identity list;
- complete baseline and candidate rankings, including rejected, overflow and
  under-threshold membership plus unique tie-break keys;
- full version tuple for both arms;
- explicit point-in-time provider coverage/freshness evidence;
- explicit no-trade producer evidence when applicable;
- joinable expected-outcome and actual-outcome lineage for every candidate;
- outcome inventory and reproducibility evidence after evaluation completes.

No production payload was inspected or executed in Action 666B, and no
producer was changed.

## Fixture coverage

The machine-readable report is
`docs/action-666b-fixture-coverage-report.json`. It covers 16 scenarios:
6 mapped, 7 conflicting and 3 unmappable. It contains no performance values or
claims.
