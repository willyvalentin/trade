# Ture Current-State Ledger

**Action 651 — Canonical Ture Master Roadmap and Current-State Ledger.**

**Status: canonical/current as of 2026-07-24T14:26:50Z.**

This ledger is the current-state companion to the
[Ture Master Roadmap](./ture-master-roadmap.md). It supersedes fragmented
status claims in older checkpoint documents while preserving them as
**historical reference**. A historical document is not current truth unless its
claim is corroborated below by executable source, tests, GitHub, Netlify, or
Supabase readback.

**Evidence hierarchy:** executable code and exact production readbacks outrank
documentation. An open PR is not `main`; local uncommitted work is not
delivered; and passing tests alone do not establish production readiness. The
roadmap's Actions are adaptive to corroborated evidence, while its stable
product milestones remain fixed until explicitly revised.

## Verified Identities

| Item | Verified value | Status |
| --- | --- | --- |
| GitHub default branch | `main` | canonical/current |
| GitHub `main` SHA | `f3d97de8ed55d68219d8084f76c47cbe80f2126c` | canonical/current |
| Published Netlify production SHA | `f3d97de8ed55d68219d8084f76c47cbe80f2126c` | canonical/current |
| Published deploy ID | `6a635e86f9e2240008ceb500` | production_verified |
| Production deploy state | `ready`, `production`, branch `main`, plugin `success`, no error | production_verified |
| Published timestamp | `2026-07-24T12:47:52.619Z` | production_verified |
| Deployment assertion | `c7fc1f06019f1afff58c9f146a1f0576ef6447dc` | **contradiction:** stale; does not match published SHA |
| Local governance worktree | `codex/action-651-canonical-roadmap-ledger` at `f3d97de8ed55d68219d8084f76c47cbe80f2126c` before its documentation-only commit | local delivery branch from current `main` |

The current production assertion mismatch makes Action 645 report
`preflight_unavailable`; it must be corrected through an explicitly authorized
release/configuration Action, never bypassed.

## Supabase And Migration State

- Project readback: linked lint is clean; required migration
  `20260724001000` is applied remotely.
- Forbidden migrations `20260708000000`, `20260708001000`, and `20260710000000`
  are absent remotely.
- Current usage readback for UTC `2026-07-24`: scheduled, manual,
  reconciliation, total ledger, and claim capacity are all `0 / 0`; the
  read-only preflight itself recorded zero provider calls, durable writes,
  claim creation, and schedule changes.
- **Production data-access status: unsafe/uncontained.** Read-only evidence
  established anonymous visibility of core trading data. Action 650 has not
  merged or been applied, so this remains the highest-priority product blocker.

## Open Pull Requests

| PR | Delivery state | Ledger classification |
| --- | --- | --- |
| [#44](https://github.com/willyvalentin/trade/pull/44) Action 650 | Open draft; head `055002ebf6af420a1e8fdd6246bb7df96aceff32`; five-file containment package; no production migration applied | open_pr |
| [#43](https://github.com/willyvalentin/trade/pull/43) Actions 647-649 | Open draft; head `9120fde1367413ce100db17a384e3e06b7ddf3d5`; deterministic execution/Avanza identity hardening; no transport or production path added | open_pr |
| [#36](https://github.com/willyvalentin/trade/pull/36) | Open, non-draft historical durable-audit/ledger/canary delivery; its base is stale | historical reference; requires fresh scope review |
| [#3](https://github.com/willyvalentin/trade/pull/3) | Open, non-draft plan-reference diagnostics; its base is stale | historical reference; requires fresh scope review |
| #42 | Closed and merged; Action 645/646 delivery | merged_not_production_verified as a complete release gate because assertion identity is stale |

## Worktree Preservation

- `/Users/willysimonsson/Dev/trade` is the Action 651 delivery worktree and has
  one preserved untracked `deno.lock`. Do not add, remove, stage, ignore,
  clean, or rewrite it.
- `/private/tmp/trade-action-650` is the dedicated Action 650 worktree/branch.
  Its committed PR #44 must remain isolated until review.
- `/private/tmp/trade-action-647-649` is the dedicated PR #43 worktree/branch.
- Several historical release/conflict worktrees are listed by Git, including
  stale/prunable entries. Do not prune, reset, clean, rebase, or delete any
  worktree as part of roadmap work. Inventory ownership and cleanup are a
  separately authorized operation.

## Major Capabilities By Status

| Capability | Status | Evidence / boundary |
| --- | --- | --- |
| Recommendation scanning, publication, snapshots, outcomes | partial | production history exists, but direct browser access and client-owned flows prevent Secure Advisory Product completion |
| Same-day official outcome revisit | production_verified | prior scheduled evaluator work is deployed; no claim that it solves data access or learning readiness |
| Recommendation-level calibration review | partial | helper and diagnostics exist; current sample/learning promotion remains insufficient for live policy change |
| Continuous-intelligence canary safety envelope | production_verified | bounded/manual evidence and read-only accounting exist; scheduled live execution remains disabled |
| Scheduled shadow dry-run path | merged_not_production_verified | source exists; current assertion mismatch and no current successful readback prohibit readiness claims |
| Action 645/646 release preflight and deterministic builder | merged_not_production_verified | merged source, but current preflight blocks on stale deployment assertion and local-main mismatch |
| Production data-access containment | open_pr | Action 650 PR #44 locally role-tested; not merged/applied |
| Authenticated ownership/API boundary | missing | Action 652 is required before Action 650 production application can preserve user flows safely |
| Server-owned trade management/exit engine | missing | no canonical exit queue/monitor/transactional handoff exists |
| Execution identity hardening | open_pr | Actions 647-649 are in draft PR #43; no real transport added |
| Durable execution record/audit | partial | schema/contracts and server writer exist; ownership, containment, and production operational proof remain incomplete |
| Avanza prepare-only transport | mock_or_stub | legacy preview/no-op and mock helpers exist; no approved broker transport or session/account/instrument proof |
| Semi-automatic BUY/SELL trials | missing | no new trial is authorized by this ledger |
| Closed-loop learning feedback | partial | outcomes/calibration diagnostics exist; offline/shadow evidence gates are not complete |
| Controlled automatic execution | missing | explicitly deferred |

## Current Blockers And Contradictions

1. **Critical:** anonymous/public direct data access remains possible until
   Action 650 is production-applied, but applying it now would intentionally
   break direct browser Supabase flows.
2. **Required dependency:** Action 652 must establish the authenticated/server
   API boundary before the Action 650 production migration is applied.
3. **Release identity:** Netlify production deploy is `f3d97de…`, while the
   assertion is stale at `c7fc1f…`. Do not treat Action 645 preflight as ready.
4. **Production catalog detail:** the production role/policy matrix is not
   recorded in this ledger; Action 650’s catalog-only query must be run in the
   approved pre-apply window without retrieving row content.
5. **Historical-document conflict:** older documents may claim near-complete
   Avanza or automatic readiness. Those claims are superseded by the present
   milestone definitions: no semi-automatic production trial or automatic
   execution readiness is established.
6. **Local versus production:** a merged commit, fixture, preview, local Docker
   replay, or mock helper is not production verification.

## Last Verified Tests And Limitations

- Action 650 local package: focused Action 650, scheduled outcome, and
  execution-audit regressions passed; its disposable PostgreSQL effective-role
  replay passed for all 19 scoped tables.
- Current production preflight readback: Netlify production ready and secret
  scans zero; linked Supabase lint/migration state healthy; usage clean; no
  mutation was performed.
- Limitation: Action 650 production catalog behavior and migration application
  are deliberately pending. Build/release readiness is blocked by the stale
  deployment assertion rather than treated as a passing canary gate.

## Next Approved Action

**Action 652 — Authenticated API Boundary and Browser Supabase Removal.**

It must inventory and replace every current direct browser read/write of private
trading data with a server-owned, authenticated boundary, define ownership and
authorization, and provide compatibility evidence before Action 650’s migration
is authorized for production application.

## Ledger Update Rules

Only a read-only evidence pass or an explicitly authorized delivery/mutation
result may update this ledger. Every update must include a timestamp, source
commit/deploy identity where applicable, test/effect evidence, and any remaining
contradiction. It must classify claims as `canonical/current`, `historical
reference`, `superseded`, or `unknown`; it must not silently delete prior
evidence or convert local/mock results into production verification.
