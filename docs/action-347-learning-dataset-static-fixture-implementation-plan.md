# Action 347: Learning Dataset Static Fixture Implementation Plan

## Implementation Plan Status

- implementation_plan_status: fixture_implementation_plan_ready
- branch: dev/safe-post-recovery-work
- rollback deploy protected: 6a501645908e4100088b7396
- clean base commit: 512a0c5

This is planning only, not fixture implementation, runtime implementation, provider integration, news integration, Supabase persistence, schema implementation, migration, replay execution, scanner mutation, ranking mutation, confidence threshold mutation, deploy readiness, or main-push authorization.

## Relationship To Action 341

Action 341 defines the Learning Dataset Static Fixture Spec. A future implementation must implement those scenarios exactly, with deterministic local fixture rows and expected labels.

Required fixture scenarios from Action 341:

- visible_winner_target_hit
- visible_stop_hit
- research_only_outperformer
- research_only_weak_followthrough
- stale_plan_adverse_move
- no_entry_triggered
- missing_context_safe_unknown
- duplicate_snapshot_deduped
- confidence_overfit_warning
- anti_leakage_future_context_blocked

## Relationship To Action 346

Action 346 defines the Existing Schema Compatibility Matrix. A future fixture implementation must align to its adapter-first classifications and must not create parallel architecture.

Future fixture fields should map through existing snapshot, outcome, replay, history/statistics, provider audit, and candle surfaces where possible. Any missing field must remain an explicit gap until a separate migration proposal is approved.

## Allowed Future Fixture File Shape

Future implementation, if approved later, may include only:

- `lib/learning-dataset-static-fixtures.ts`
- focused docs
- focused Playwright spec

No other surfaces may change.

## Allowed Future Pure TypeScript Helper Shape

A future helper must remain:

- local-only
- deterministic
- no Date.now
- no random IDs
- no provider imports
- no Supabase imports
- no app/api imports
- no runtime imports
- no scanner/ranking imports
- no writes
- no replay execution

The helper may export static fixture arrays, expected summaries, and pure validation metadata. It must not import runtime modules or read environment variables.

## Anti-Leakage Requirements

- snapshot-time features must remain separated from outcome fields
- future context must be labeled unavailable at snapshot time
- post-outcome context must be labeled post_outcome
- catalyst/news availability must be snapshot-time safe
- generated labels must not use future candles or future outcomes as pre-trade context
- duplicate snapshot rows must be deduped without changing outcome semantics

## Adapter-First Rules

- prefer mapping existing snapshot fields into fixture rows
- prefer mapping existing outcome fields into fixture rows
- prefer context envelope adapters over parallel tables
- prefer provider audit adapters over new audit concepts
- preserve existing static replay result model compatibility
- preserve History/Statistics compatibility
- keep missing fields explicit instead of inventing schema

## Do-Not-Duplicate Rules

- do not duplicate recommendation rows
- do not duplicate snapshot ids
- do not duplicate outcome records
- do not duplicate confidence fields
- do not duplicate setup taxonomy fields
- do not duplicate provider audit rows
- do not duplicate candle persistence tables
- do not create learning dataset rows disconnected from snapshots
- do not create pattern insight persistence without dataset linkage

## Validation Plan

Future implementation validation should include:

- Action 309 guard
- Action 341 fixture spec verifier
- Action 346 compatibility matrix verifier
- Action 347 implementation plan verifier
- golden static replay verifier
- TypeScript
- lint
- build
- typegen
- focused Playwright spec

The focused spec should prove deterministic fixtures, anti-leakage labels, adapter-first mapping, duplicate safety, and no runtime/provider/Supabase imports.

## Blocked Work

- no fixture implementation yet
- no fixture data yet
- no runtime routes yet
- no provider calls yet
- no news API calls yet
- no Supabase reads yet
- no Supabase writes yet
- no schema changes yet
- no migrations yet
- no replay execution yet
- no scanner/ranking mutation yet
- no confidence threshold changes yet
- no deploy
- no main push

This implementation plan does not authorize fixture implementation, fixture data, runtime route changes, provider calls, news API calls, Supabase remote reads, Supabase reads, Supabase writes, schema changes, migrations, replay execution, scanner mutations, ranking mutations, confidence threshold changes, deploys, main pushes, recommendation mutation, visible recommendation changes, outcome persistence changes, Learning Acceleration changes, Add Trade changes, broker changes, execution changes, or risk changes.

## Recommended Next Actions

- Action 348: Intelligence Context Static Fixture Implementation Plan
- Action 349: Pattern Insight Static Fixture Spec
- Action 350: Runtime Ping-Only Route Approval Gate
- Action 351: First Tiny Provider Capacity Experiment Approval Gate
- Action 352: Snapshot-to-Learning Dataset Mapper Plan
