# Ture Master Roadmap

**ACTION 660H — accepted manual MA-13 merge control.**

**Document status:** bounded eight-path governance-only successor that records
the operator's decision to keep this private repository on GitHub Free and use
a mandatory manual merge control. It resolves MA-13 from unknown to a known,
accepted gap without awarding gate credit. On its delivery branch this
revision is not current-main authority.

`roadmap_completion_authority:false`

## Evidence boundary

This roadmap reconciles Ture against GitHub `main` commit
`7662d3f863f8f921b816670363431df8e1ebcdea`, tree
`86a59f234b69e63b07a60833224015018be41568`, observed on 2026-08-12.
GitHub current-main evidence, exact provider readbacks, authorized database
readbacks and executable source outrank this document.

The reconciliation base is the ordinary merge of PR #99, whose exact-main push
run `31543202986` completed successfully. PR #99 made the verified MA-15
reclosure canonical. Fresh authenticated GitHub readback shows zero branch
protection rules and plan-gated HTTP 403 responses for both branch protection
and repository rulesets. PR #45 remains open, Draft, dirty/conflicting and
`stale_historical_non_authority`; it overlaps the canonical governance paths
and must remain unmodified.

An open PR, preservation ref, fixture, test result, default-off delivery or
historical checkpoint is not production-completion evidence. No milestone is
complete until required source, release, production and behavioral evidence
has been separately corroborated.

## Product direction

Ture remains a privacy-first trading decision-support product. Capability may
not outrun data ownership, durable auditability, operator controls or verified
production behavior. Advisory, shadow, semi-automatic and automatic behavior
must remain visibly and operationally distinct.

## Stable milestones

### A. Secure Advisory Product

Recommendations and related user/trading data must be private, server-owned,
observable and released through a reproducible identity gate.

At this delivery branch's evidence boundary, formal status remains **14 of 15
required gates verified (93.3%)**, with no partial credit. Milestone A remains
incomplete because MA-13 is a `known_gap`; the accepted manual control reduces
operational risk but creates no gate, provider or runtime authority.

| Gate | Current classification at delivery boundary |
| --- | --- |
| MA-01 remote main/source identity | verified_current |
| MA-02 canonical roadmap/ledger currentness | verified_current |
| MA-03 browser-to-Supabase source containment | verified_current |
| MA-04 authenticated server-owned API boundary source | verified_current |
| MA-05 tenant-owner principal binding | verified_current |
| MA-06 production RLS/Data API/ordinary-role behavior | verified_current |
| MA-07 source migration inventory | verified_current |
| MA-08 production migration application/source parity | verified_current |
| MA-09 generated-types parity/pinned provenance | verified_current |
| MA-10 catalog/migration evidence contract source | verified_current |
| MA-11 release/deployment identity | verified_current |
| MA-12 repository CI workflow/check execution | verified_current |
| MA-13 branch protection/required-check policy | known_gap |
| MA-14 disciplined worktree/release ownership | verified_current |
| MA-15 production behavioral smoke | verified_current |

**MA-09 closure record:** MA05 first triggered the documented fail-closed drift
rule. Action 660D then archived project-scoped Supabase project, catalog and
type-generation responses for the explicit `[public]` schema selection. The
extracted provider TypeScript is byte-identical to
`lib/supabase-database.types.ts` at SHA-256 `f23c3702…`, and the output contains
the required owner fields and owner-aware RPC. Independent re-review reported
no findings on exact PR #96 head `baf3f20b…`; the provider-free V2 oracle
passed 42/42 and adversarial mutations failed closed. PR #95 merged first, PR
#96 merged with no reviewed-scope file delta, all artifacts became main
reachable and exact-main CI run `31536166511` succeeded. MA-09 is therefore
`verified_current`.

**MA-05 closure record:** the explicitly confirmed Auth owner was activated
inside the approved maintenance window without repository disclosure. All
nine owner fields are physically `NOT NULL`; 20/20 constraints, 9/9 RLS
policies, revoked client grants, two relationship indexes and the server-only
RPC boundary passed production readback. Two disposable staging principals
each saw one own row and zero rows belonging to the other principal. The
cross-owner RPC call failed, the same-owner call succeeded, every proof rolled
back and staging was cleaned and paused.

**MA-06 closure record:** an actual anonymous production Data API read failed
with HTTP 401 / Postgres `42501`. A read-only production query under the
`authenticated` role, including the canonical owner claim, failed with the
same permission denial. Catalog evidence confirms all nine client grants are
revoked. Rollback-only staging grants then exercised the owner RLS predicate
with two real Auth principals and proved one-own/zero-other behavior in both
directions.

**MA-08 closure record:** production migration
`20260811163228_add_fail_closed_application_owner_foundation` contains one
21,658-byte statement with MD5 `83e413b3d95cc26106444cc159c0105b`.
The reviewed repository file has the identical byte count and MD5.

**MA-11 closure record:** the earlier closure established exact Netlify,
deployment-assertion and GitHub identity at `4607990a…`, `490e3607…`,
`58c29514…` and `9e2f64a1…`. The PR #98 release reconciled all three again at
the last verified production commit
`f463644ddeb7f49fa8b80924d9103ea8970ccae4`.
Exact-main CI run `31541394848` succeeded and Netlify deploy
`6a7b9e45ceb7e100087c55fa` identifies that commit.

**MA-15 reclosure record:** the PR #97 deploy triggered the preserved smoke
rule and exposed an ambiguous `recommendations(...)` embed. Action 660F
selected the composite owner relationship with
`recommendations!positions_recommendation_owner_fkey(...)`; PR #98 delivered
that exact fix. The new release preserved anonymous denial and rendered the
protected application, dashboard, settings and market-calendar state.
Supabase API evidence showed four owner-bound `positions` requests at HTTP 200,
none at HTTP 300, plus two `execution_records` reads at HTTP 200 with no 5xx.
No form or application mutation route was submitted. MA-15 is therefore
`verified_current` and remains fail-closed on any later production deploy or
required-read failure.

**MA-13 accepted-gap record:** the private repository remains on GitHub Free by
explicit operator decision. Authenticated branch-protection and ruleset reads
both return the plan boundary HTTP 403, while GraphQL reports zero branch
protection rules. Every future main mover must therefore use the Action 660H
manual sequence: frozen exact head, exact-head CI, independent read-only
review, explicit operator approval of PR plus SHA, ordinary PR merge,
exact-main CI and release-bound smoke when deployed. This control is not
GitHub enforcement, awards no MA-13 credit and leaves Milestone A incomplete.

ACTION 668H remains `closed_holding` under operator decision
`D_keep_execution_gate_closed`. R7-R1 is `completed_rejected`, permanently
consumed, completed prefix `0` and non-retry. No usable GT2 authorization,
alternative trust root or native bootstrap exists.

Source containment, the authenticated server-owned API boundary, canonical
governance and repository CI are verified on current main. MA-05, MA-06 and
MA-08 prove tenant ownership, production ordinary-role/Data API denial,
two-principal RLS behavior and exact production migration parity. The fresh
provider-bound generated-types package now describes the post-MA05 schema and
closes MA-09.

### B. Server-Owned Trade Management

Live trade state must have one server-owned model: deterministic exit decision
and observation contracts, a durable exit queue, transactional
recommendation-to-position handoff and client projection rather than client
truth. It depends on Milestone A.

### C. Semi-Automatic Execution

One bounded operator-confirmed broker operation may be considered only after
the secure data boundary, server-owned trade-management core, canonical
execution identity, durable audit/record boundary and prepare-only broker
checks are independently verified. A dry-run, mock or preparation contract is
not execution authority.

### D. Closed-Loop Learning

Learning-policy changes require canonical outcome identity, horizon
deduplication, completed-data quality, frozen offline evaluation and shadow
evidence. Feedback must be reversible and attributable and cannot change live
ranking without separate approval.

### E. Controlled Automatic Execution

This remains deferred. Detailed planning requires sufficient semi-automatic
production history with identity, broker, durable-evidence, exit-handling and
operator-review evidence. No legacy preview/no-op helper may bypass that
threshold.

## Preserved delivery gates

| Gate | Required before |
| --- | --- |
| Action 650 containment plus authenticated/server ownership boundary | Any server-owned trade-management write path |
| Deployment identity reconciliation plus release preflight | Production canary or release assertion |
| Generated types plus migration allowlist | Any new durable Supabase contract |
| Canonical execution identity plus service-owned audit/record boundary | Prepare-only broker integration |
| Semi-automatic production history and reconciliation | Automatic-execution planning |
| Canonical outcomes plus offline/shadow evaluation | Learning-policy change |

No migration is applied because a PR merges. No provider build or deployment
is implied by this roadmap.

## Current planning allocation

- Track 1 is paused.
- Track 2 remains an open dependent stack (#54 -> #55 -> #57 -> #58 -> #60
  -> #63 -> #67 -> #72). It is not current-main authority.
- Track 3 / ACTION 668H remains `closed_holding`. Provider-free roadmap work
  may continue, but no GT2, SQL, database or provider execution is authorized.
- Action 652 delivered source containment, the authenticated server-owned
  boundary, the catalog/migration evidence contract and canonical governance.
  Its V1 generated-types bytes remain historical; Action 660D V2 supersedes
  them for the post-MA05 schema.
- Track 4's Action 655 foundation is merged via PR #84, default-off and
  runtime-unwired. It provides no database, broker, production or milestone
  authority.
- Track 5's Action 660F recovery is present on main via PR #98 and Action 660G
  is canonical via PR #99. This bounded Action 660H successor records the
  accepted manual MA-13 control without changing application or provider
  state. PR #45 remains an overlapping stale historical non-authority and is
  not modified.
- Track 6's five additive Session V2 paths are merged via PR #85, default-off
  and runtime-unwired. Runtime, tenancy, database, broker and production
  authority remain false.
- PR #88 delivered the portable catalog/migration evidence contract, PR #89
  delivered the repository CI workflow, PR #90 delivered canonical governance
  currentness, PR #91 delivered MA-09 provenance plus its fail-closed
  remediation, and PR #92 recorded its then-valid closure. PR #94 later
  delivered and activated MA05, triggering the documented MA-09 drift rule.
  PR #96 then delivered the reviewed V2 provider-bound refresh and satisfied
  the gate's technical closure conditions on main.

Future main-moving work must remain serialized behind this bounded
reconciliation candidate until its review decision is known. Any later main
mover requires fresh source, provider and policy identity reconciliation.

## Current provider and release boundary

The latest authenticated Netlify readback identifies published deploy
`6a7b9e45ceb7e100087c55fa` and its production assertion at full commit
`f463644ddeb7f49fa8b80924d9103ea8970ccae4`. Current GitHub `main` is
`7662d3f863f8f921b816670363431df8e1ebcdea`; the production commit is its
first-parent ancestor and is not equal to it because governance-only PR #99
advanced `main` without a production publish. The production commit's CI and
required post-deploy reads are green. This reconciliation candidate authorizes
no deployment.

The bounded PR #98 smoke preserved anonymous login redirect and protected API
denial, rendered the authenticated application, dashboard, settings and market
calendar, and exercised the dedicated execution-record server read. Four
owner-bound `positions` requests returned HTTP 200 with no HTTP 300; two
`execution_records` reads returned HTTP 200 with no 5xx. No form or application
mutation route was submitted.

The current provider-bound Supabase V2 package binds project
`ekdyopdrrkphlrsilyoo` to a read-only catalog snapshot of the selected
`[public]` schema: 1 schema, 30 tables, 653 columns, 30 primary keys, 28
foreign keys and 22 functions. The archived provider type-generation response,
its extracted TypeScript and the repository output are byte-identical at
SHA-256 `f23c3702…`. The historical V1 bytes remain preserved for audit.

Production now denies an anonymous recommendation Data API read with HTTP 401
and Postgres `42501`; an `authenticated` read-only SQL role check with the
canonical owner claim is also denied with `42501`. Production catalog readback
and staging two-principal rollback proof establish MA-06. The applied MA05
migration's one statement is byte-identical to repository source, establishing
MA-08.

GitHub branch-protection and ruleset endpoints both return HTTP 403 under the
current private-repository plan, and GraphQL reports zero branch protection
rules. The operator elected to remain private on GitHub Free. MA-13 is
therefore a `known_gap` with accepted manual compensation, not absent, not
verified and not entitled to gate credit.

## Superseded assertions preserved for audit

- `eb79279d…` / `bc97dd2…`, `129b03d…` / `92d9cd4…`,
  `59f00b44…` / `64df5ff0…`, `7749a726…` / `d6e00d31…`, and
  `2409b458…` / `5c54eb02…` and `4607990a…` / `fc5e4e3d…` were valid earlier
  main/tree identities. They are now historical and superseded first by
  `490e3607…` / `57909c14…`, then by `58c29514…` / `f1353d83…`, then by
  `9e2f64a…` / `0a5440b7…`, then by
  `f463644ddeb7f49fa8b80924d9103ea8970ccae4` /
  `b0c8eae01c22d3f720e4cc5fc4ed5424a24bdcad` and now by current main
  `7662d3f863f8f921b816670363431df8e1ebcdea` / tree
  `86a59f234b69e63b07a60833224015018be41568`.
- PR #86's former Ready/unmerged state, PR #89's former Draft/unmerged state
  and PRs #90, #91 and #92's former Draft delivery states are superseded by
  their respective merges. PR #92's former current-main state is superseded by
  the ordinary merge of PR #94.
- Earlier 126-, 135-, 137-, 139- and 142-commit production distances and deploy
  `6a65fd2f…`, followed by exact identity at `4607990a…` and deploy
  `6a7b2c1e…`, are historical. The later `490e3607…`, `58c29514…` and
  `9e2f64a…` identities are also superseded by the last verified production
  commit `f463644d…` and deploy `6a7b9e45…`. Governance-only PR #99 advanced
  current main to `7662d3f…` without changing that production release.
- Containment, authenticated API-boundary and CI were previously
  `unknown_current`. Current main evidence closes MA-03, MA-04 and MA-12;
  earlier bounded production evidence closed MA-15, the post-PR #97 dashboard
  regression reopened it and the exact PR #98 recovery plus green readbacks
  now re-close it. Action 660C separately proves the production ordinary-role
  boundary and closes MA-06.
- MA-02's pre-merge 7/15 state, MA-09's pre-closure 8/15 candidate state, the
  verified 9/15 MA-09 closure, MA-11/MA-15 closure at 11/15 and post-MA05
  13/15 reopening state and later 14/15 MA-09 closure are historical. The
  post-PR #97 dashboard failure returned formal status to 13/15; PR #98
  recovery verification now restores 14/15 by re-closing MA-15. This
  documentation grants no new provider, database, migration, broker, release
  or production authority.
- PR #99 made the Action 660G MA-15 reclosure canonical at main `7662d3f…` and
  exact-main CI run `31543202986`. Action 660H resolves MA-13's earlier
  `unknown_current` classification to an accepted `known_gap` without changing
  the 14/15 arithmetic.
