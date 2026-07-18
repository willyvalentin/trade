# Action 538V - Independent Re-Review of First-Live Read-Only Staging Preflight Composition Remediation

## Executive Summary

Action 538V independently reviewed the complete uncommitted Action 537, 538, and 538R package. The review did not implement new live behavior, did not activate the composition contract, did not call the live resolver, and did not commit, push, merge, or deploy.

The Action 538R remediation substantially improved the contract: top-level authority flags now fail closed, live resolver observation claims now fail closed, focused tests expanded from 8 to 11, and the production composition module remains pure and dormant. However, the review is blocked because nested authority-bearing fields inside resolver metadata can still bypass `authority_claim_rejected` when supplied through the exported fixture builder.

## Findings

| ID | Severity | File / Symbol | Finding | Scenario | Required Remediation | Blocks Approval |
| --- | --- | --- | --- | --- | --- | --- |
| A538V-H1 | High | `lib/post-trade-first-live-read-only-staging-preflight-composition-contract-core.ts:332`, `:539`, `:569-601`; tests at `tests/e2e/post-trade-first-live-read-only-staging-preflight-composition-contract.spec.ts:161-187` | Action 538R rejects top-level authority flags but does not reject nested authority-bearing fields inside resolver metadata. `buildResolverEvidenceLink` accepts caller-supplied `metadata`, `validateKindSpecific` only verifies that metadata is a record, and `hasAuthorityClaim` checks only the top-level evidence object. | A caller can create provenance-valid resolver evidence with metadata such as `{ ...metadata, enablesFilesystemAuthority: true }`, build matching revalidation evidence from it, and preserve valid fingerprints/provenance while the nested authority claim remains embedded. This violates the Action 538V requirement that nested or alternate evidence shapes cannot bypass authority rejection. | Add strict resolver metadata schema validation or recursive authority-claim rejection for all evidence payloads. Add focused tests proving nested metadata authority claims and alternate nested authority shapes fail with `authority_claim_rejected`. | Yes |
| A538V-M1 | Medium | `tests/e2e/post-trade-first-live-read-only-staging-preflight-composition-contract.spec.ts:161-187`, `:190-225` | A538-M1 was materially improved but remains incomplete for nested authority claims and strict metadata-shape validation. | The 11 focused tests cover top-level authority and live-observation claims, but the remaining nested authority bypass is not covered. | Add targeted nested-authority and strict-metadata negative cases alongside the remediation for A538V-H1. | Yes, because it guards the high-severity bypass |

## A538-H1 Verdict

Blocked. Top-level evidence authority claims are now rejected with `authority_claim_rejected`, and true flags are not normalized. The closure is incomplete because nested authority-bearing fields inside resolver metadata can still be accepted through provenance-valid builder output.

## A538-H2 Verdict

Closed for the reviewed pure contract surface. `observedLiveFilesystem: true` and `server_only_lstat` source claims are rejected by resolver evidence validation. The pure contract imports no live adapter and does not recreate private live provenance. Actual live resolver evidence remains intentionally uncomposable by this pure contract.

## A538-M1 Verdict

Partially closed, blocked pending one targeted addition. Focused coverage increased from 8 to 11 tests and now covers top-level authority, live-observation, live-looking clones, duplicate/ambiguous/order, identity/version/purpose/tool/platform, fixture/live, credential, command, retry, second-attempt, state, and static-security cases. It does not yet cover nested authority claims or strict resolver metadata schema enforcement.

## Pure And Dormant Review

Pass. The composition core imports no filesystem primitive, no `server-only` runtime module, no child process API, no environment access, no network client, no credential reader, no persistence helper, no Supabase client, and no API/UI/runner entrypoint. Importing the module has no live side effect. No app, route, UI, runner, cron, live resolver, observer, spawn, credential, browser automation, Avanza, order, position, settlement, or deployment path imports or invokes it.

## Authority And State Review

Blocked only by A538V-H1. The final composition result keeps every authority field at `none`; `composition_complete` remains structural only; invalid transitions fail closed; retry and second-attempt evidence fails closed; and no transition performs a side effect. Evidence-level authority validation still needs nested-shape closure.

## TOCTOU Review

Pass for A538-H2 scope. Resolver evidence remains point-in-time, live evidence is not accepted by the pure contract, immediate revalidation remains conceptually mandatory, metadata mismatch fails closed, `toctouEliminated` remains false, and future server-only composition plus spawn-side revalidation remain separate requirements.

## Export Surface Review

The export surface remains constants, types, fixture evidence builders, canonical evidence-set builder, pure composer, validator, and lifecycle helper. No live adapter, live provenance registration, runtime invocation, or activation export was found.

## Reachability Review

Static reachability review found references only in the production composition module, focused tests, and Action 537/538/538R/538V documentation and summary. No application route, UI component, runner, live resolver adapter, observer, spawn boundary, credential boundary, browser automation, Avanza, order, position, settlement, or deployment path invokes the contract.

## Prohibited Operation Review

The production composition module had no matches for filesystem APIs, `lstat`, `stat`, process APIs, `process.env`, network APIs, credential/Keychain/browser storage access, Supabase clients/writes, Avanza, BankID, persistence, API/UI/runtime wiring, observer invocation, spawn invocation, authorization consumption, trading mutation, or deployment behavior.

## Validation Summary

Validation passed, but approval remains blocked by A538V-H1 and A538V-M1.

## Non-Activation Confirmation

Action 538V did not implement live behavior, did not activate the composition contract, did not call the live resolver, did not perform filesystem access, did not execute git or Supabase, did not collect CLI versions, did not spawn a process, did not use a shell, did not read credentials, did not read environment values, did not access the network, did not invoke observer/spawn/credential/authorization/runner/API/UI paths, did not interact with Avanza, did not change order/position/settlement behavior, did not persist data, and did not deploy.

## Decision

Decision: `post_trade_first_live_read_only_staging_preflight_composition_remediation_re_review_blocked_nested_authority_claim`

Result status: `post_trade_first_live_read_only_staging_preflight_composition_action_538v_re_review_completed_blocked`

Recommended next action: Action 538W - Close nested authority and resolver metadata schema validation in first-live read-only staging preflight composition without activation.
