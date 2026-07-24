# Legacy Execution Wording Normalization Checkpoint

Date: 2026-07-07

## 1. Purpose

Normalize legacy execution, handoff, broker, Avanza, and submit wording so the repo consistently describes the Sharp Semi Auto path as order-prep/modeling only.

The intended language is:

- Ture may prepare BUY/SELL order details for manual review in future gated phases.
- The user always clicks final KOP/SALJ manually.
- The agent must never click final KOP/SALJ.
- The agent must never submit orders.
- BankID automation, cookie/session export, credential logging/storage, Supabase execution writes, and production readiness remain blocked.

## 2. Scope

This was a wording/docs cleanup only. It focused on docs/checkpoints and legacy wording that can imply active execution, order submission, final broker click, broker confirmation authority, or production-ready handoff.

No runtime code, API behavior, scripts, routes, gates, or Trade UI behavior were changed.

## 3. Searches Run

Static searches used for the normalization pass:

- `rg -n "Prepare in Avanza|automatic final submit authority|execute trade|submit order|submitted order|broker confirmed|broker confirmation|production ready|agent will buy|agent will sell|Avanza automation|handoff ready" docs/legacy-execution-surface-audit.md docs/legacy-execution-cleanup-plan.md docs/stale-edit-conflict-artifact-cleanup-checkpoint.md docs/recommendation-snapshots-500-production-triage.md`
- `rg -n "production ready|submit order|automatic final submit|Prepare in Avanza|Avanza automation|execute trade|broker confirmed|handoff ready" docs/avanza-sharp-semi-auto-execution-agent-scope.md docs/ture-engine-execution-agent-contract.md docs/avanza-execution-readiness-map.md docs/semi-auto-avanza-fill-only-poc-ui-integration-plan.md`
- `rg -n "Prepare in Avanza|automatic final submit authority|execute trade|submit order|submitted order|broker confirmed|broker confirmation|production ready|agent will buy|agent will sell|Avanza automation|handoff ready" docs/legacy-execution-surface-audit.md docs/legacy-execution-cleanup-plan.md docs/legacy-execution-wording-normalization-checkpoint.md docs/stale-edit-conflict-artifact-cleanup-checkpoint.md`
- `rg -n "submit|submitted|execute|execution|handoff|broker confirmed|KÖP|SÄLJ|KOP|SALJ|BankID|cookie|session|credential|production ready" docs/legacy-execution-surface-audit.md docs/legacy-execution-cleanup-plan.md docs/legacy-execution-wording-normalization-checkpoint.md`
- Validation scans listed in the final validation section.

## 4. Wording Principles

- Prefer "prepare order details", "manual review", and "human-final" over active execution wording.
- Use "final KOP/SALJ remains human-only" when discussing Avanza BUY/SELL flows.
- Use "production readiness blocked" instead of "production ready" unless describing a forbidden/negative state.
- Treat broker confirmation wording as future/manual/read-only evidence, never as submit authority.
- Keep historical technical identifiers when renaming would introduce code/runtime risk, and document them as historical/internal/model-only.
- Keep the product recommendation card visually simple; do not add new execution UI from wording cleanup.

## 5. Files Changed

- `docs/legacy-execution-surface-audit.md`
- `docs/legacy-execution-cleanup-plan.md`
- `docs/legacy-execution-wording-normalization-checkpoint.md`

## 6. Risky Expressions Normalized

- "product-ready execution infrastructure" was clarified as "production-readiness-blocked legacy/model evidence".
- Historical "Prepare in Avanza" wording was rephrased as Avanza preparation wording that must remain dev-only, hard-disabled, and human-final.
- Historical "Automatic final submit authority" wording was rephrased as final-submit-authority wording that must explicitly state final KOP/SALJ is human-only and forbidden for the agent.
- Old submit-like metadata was clarified as historical broker status labels used for parsing/modeling evidence only.
- Broker confirmation wording was clarified as manual/read-only and not order submission authority.

## 7. Expressions Left In Place And Why

Some terms intentionally remain:

- `execution`, `handoff`, `submit`, `submitted`, `broker`, `confirmation`, `order`, `KOP`, `SALJ`, `BankID`, `cookie`, `session`, and `credential` still appear in docs and code because they are technical domains, negative safety assertions, existing identifiers, or historical audit terms.
- Identifiers such as `broker_confirmed_at`, `submitted_not_filled`, `execution_metadata`, and `ExecutionHandoffPreviewModal` were left untouched because renaming them would be code/runtime work, not safe wording cleanup.
- Larger architecture docs still include phrases like "not production ready", "cannot submit orders", and "click final KOP/SALJ" as explicit negative safety guarantees.
- Existing active Trade UI copy was not modified because this task intentionally avoided behavior or visible product changes.

Post-normalization scan result:

- Remaining high-risk phrase hits in this checkpoint are intentional because they appear inside the documented search commands or the list of expressions normalized.
- Remaining `submit`, `execution`, `handoff`, `KOP/SALJ`, `BankID`, `cookie`, `session`, and `credential` hits in the changed legacy docs are negative safety statements, technical identifiers, or scope descriptions.
- No remaining changed-doc copy grants the agent final KOP/SALJ authority, order submission authority, BankID automation authority, cookie/session export authority, credential logging/storage authority, Supabase write authority, API route activation, Trade UI execution, or production readiness.

## 8. Runtime Gate Confirmation

No runtime gates were opened:

- Invocation boundary remains locked.
- Local-dev bridge gate remains locked.
- Smoke runner invocation remains locked.
- Terminal script invocation remains locked.
- Browser automation remains locked.
- Credential access remains locked.
- Cookies/session export remains forbidden.
- BankID automation remains forbidden.
- Order submission remains forbidden.
- Final KOP/SALJ by agent remains forbidden.
- Supabase writes remain locked.
- Trade UI execution remains locked.
- API route activation remains locked.
- Production readiness remains blocked.

## 9. Trade UI Behavior Confirmation

No Trade UI behavior changes were made. `app/trade-app.tsx` was not edited by this task. No new visible Trade UI surface, execution panel, handoff button, prepare button, buy/sell CTA, fetch, polling, or route activation was added.

## 10. Final Decision

`legacy_execution_wording_normalization_complete_with_warnings`

The normalization is complete for safe docs-only wording. Warnings remain because many legacy execution-domain terms are intentional technical identifiers, negative safety statements, or historical docs references. These should be handled by later scoped tasks only where renaming is behavior-safe.
