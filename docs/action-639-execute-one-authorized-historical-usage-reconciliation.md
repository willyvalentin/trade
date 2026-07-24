# Action 639 — Execute One Authorized Historical Usage Reconciliation

## Result

The one-time historical usage reconciliation for Action 609 was authorized, applied, and durably verified in production.

Final decision:

`historical_action_609_usage_reconciliation_applied_and_verified`

## Production target

- Claim ID: `canary_claim_canary_execution_20260723_8feacb91`
- Execution ID: `canary_execution_20260723_8feacb91`
- Source audit ID: `canary_receipt_AAPL_5min_2026-07-22T19-30-00.000Z_2026-07-22T20-00-00.000Z`
- Deployment commit: `c3ae4ea93fae3f5cd820ff6dbb49a27ce1b29b9a`
- Contract version: `continuous_intelligence_shadow_canary_historical_usage_reconciliation_v1`

## Approval

Explicit production-repair approval was provided before authorization issuance.

The approved operation was limited to:

- one Action 609 target;
- one authorization;
- one reconciliation;
- zero provider requests;
- no scheduled execution;
- no ordinary ledger mutation;
- no claim or source-audit mutation.

## Verified before-state

The final read-only preflight confirmed:

- claim status: `completed`
- provider attempted: `true`
- source audit linked to the same claim and execution
- provider result: `provider_success_with_candles`
- provider request count: `1`
- claim capacity units: `2`
- ordinary ledger units: `1`
- reconciliation units: `0`
- missing usage units: `1`
- authorization count: `0`
- reconciliation audit count: `0`

Before-state:

`2 / 1 / 0 / 1`

## Evidence binding

A deterministic sanitized evidence payload bound:

- contract version;
- exact claim;
- exact execution;
- exact source audit;
- exact `2 / 1 / 0 / 1` accounting state;
- verified provider result;
- source provider request count;
- deployed production commit.

Evidence digest:

`baebe6a7d9c8a7061a37c928cb4b9bb2ea5b76e100371ccfc7ab729d04e161d3`

No raw credential or secret was included.

## Authorization

Authorization ID:

`historical_usage_reconciliation_authorization_action_639_8feacb91`

Reconciliation identity:

`historical_manual_usage_reconciliation:continuous_intelligence_shadow_canary_historical_usage_reconciliation_v1:canary_claim_canary_execution_20260723_8feacb91`

`ci_hur_issue` returned exactly:

`issued`

The durable authorization recorded:

- status after reconciliation: `consumed`
- expected claim capacity: `2`
- expected ordinary ledger units: `1`
- expected reconciliation units: `0`
- expected missing usage units: `1`
- requested by: `willyvalentin_action_639`
- deployment commit: `c3ae4ea93fae3f5cd820ff6dbb49a27ce1b29b9a`
- issued at: `2026-07-23 21:06:39.776078+00`
- expires at: `2026-07-23 21:11:39.776078+00`
- consumed at: `2026-07-23 21:07:33.312992+00`

The authorization TTL was exactly 300 seconds.

## Reconciliation execution

`ci_hur_reconcile` returned exactly:

`reconciliation_applied`

Returned accounting state:

- ordinary ledger units: `1`
- reconciliation units: `1`
- total accounted usage units: `2`

The reconciliation record contains:

- usage units: `1`
- provider request count for reconciliation: `0`
- reason code: `verified_post_provider_receipt_identity_collision`
- reconciled at: `2026-07-23 21:07:33.312992+00`

## Durable audit

Exactly one matching reconciliation audit was persisted.

Audit result:

- final result: `reconciliation_applied`
- before claim capacity units: `2`
- before ordinary ledger units: `1`
- before reconciliation units: `0`
- expected missing usage units: `1`
- after total accounted usage units: `2`

## Verified after-state

Read-only production verification confirmed:

- claim capacity units: `2`
- ordinary usage units: `1`
- reconciliation usage units: `1`
- missing usage units: `0`
- matching authorization count: `1`
- matching reconciliation audit count: `1`

After-state:

`2 / 1 / 1 / 0`

The historical usage disagreement is resolved.

## Safety invariants

The repair performed:

- zero provider calls;
- zero scheduled executions;
- zero scheduled dry-runs;
- zero ordinary ledger mutations;
- zero historical claim mutations;
- zero source-audit mutations;
- exactly one authorization;
- exactly one reconciliation record;
- exactly one reconciliation audit.

The compensating reconciliation remains separate from the ordinary credit ledger.

## Deployment and schema state

- Production deployment commit:
  `c3ae4ea93fae3f5cd820ff6dbb49a27ce1b29b9a`
- Deployment assertion matched the same SHA.
- Netlify production deploy completed successfully.
- Migration `20260723003000` is applied in production.
- Exact Action 609 claim/execution/audit eligibility is deployed.
- RPC execution remains service-role-only.
- Reconciliation records remain append-only.

## Credential incident

During read-only CLI verification, `supabase db dump --dry-run` printed the production database password in terminal output.

The exposed database password was immediately rotated before continuing.

The command must not be used again with this CLI version for production verification.

Subsequent connectivity and migration-state checks succeeded after rotation.

## Recommended next action

Action 640 — Re-run Controlled Scheduled Shadow Rollout Readiness After Historical Usage Reconciliation

The next action should:

1. verify the reconciled `2 / 1 / 1 / 0` accounting state;
2. re-run the production readiness contract;
3. verify deployment identity and safe defaults;
4. confirm that the historical usage disagreement no longer blocks readiness;
5. perform no scheduled execution or provider call;
6. stop before any rollout activation.

## Final decision

`historical_action_609_usage_reconciliation_applied_and_verified`
