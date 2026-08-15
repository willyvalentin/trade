# Ture Current-State Ledger

**ACTION 666CR — current-main roadmap and ledger reconciliation.**

**Evidence timestamp:** 2026-08-15. This governance-only successor reconciles
the accepted manual MA-13 control and the bounded Track 2 current-main delivery
through PR #108. It authorizes no runtime, production, provider, database,
migration, broker, training, promotion or release activity.

`roadmap_completion_authority:false_until_exact_main_delivery_verified`

## Direct current readbacks

| Item | Value | Classification |
| --- | --- | --- |
| GitHub default branch | `main` | canonical_current |
| GitHub reconciliation base | `7b79691e473fa630d748763cddf97e1209974e40` | canonical_current |
| Current main event | ordinary merge of PR #108 | corroborated_current |
| Current main tree | `5c6eb05b11f83a2c50302c06cd41fd70295702fc` | canonical_current |
| Current main parents | `9a18c2ee394f34e470e3a2804bf9e9b1e444a38c`, `7b2999c519d304a4a8b32596f37b5edf75693789` | canonical_current |
| PR #95 | MERGED; head `e0b71ddb…`; merge `a1806410…`; merged first | corroborated_current |
| PR #96 | MERGED; reviewed head `baf3f20b…`; merge `58c29514…`; no head-to-main file delta | corroborated_current |
| Independent PR #96 re-review | exact head `baf3f20b…`; no findings; read-only | verified_current |
| PR #97 | MERGED; head `5bed9de6…`; merge `9e2f64a1…` | corroborated_current |
| PR #98 | MERGED; reviewed head `790151d0…`; merge `f463644d…`; no head-to-main file delta | corroborated_current |
| PR #99 | MERGED; head `3dcded2a…`; merge `7662d3f8…` | corroborated_current |
| PR #100 | MERGED; head `a38fa88e…`; merge `a8a4990a…`; manual MA-13 control | corroborated_current |
| PR #101 | MERGED; head `4cd1b42d…`; merge `3daa3663…`; Action 666CJ | corroborated_current |
| PR #102 | MERGED; head `6642e5fd…`; merge `0318046d…`; Action 666CK | corroborated_current |
| PR #103 | MERGED; head `d54d7a2c…`; merge `7bdb119f…`; Action 666CL | corroborated_current |
| PR #104 | MERGED; head `158af911…`; merge `a5aa598d…`; Action 666CM | corroborated_current |
| PR #105 | MERGED; head `18771e88…`; merge `0a40ed49…`; Action 666CN | corroborated_current |
| PR #106 | MERGED; head `cb40b254…`; merge `315eae10…`; Action 666CO | corroborated_current |
| PR #107 | MERGED; reviewed head `2a870862…`; merge `9a18c2ee…`; Action 666CP | corroborated_current |
| PR #108 | MERGED; reviewed head `7b2999c5…`; merge `7b79691e…`; Action 666CQ | corroborated_current |
| Exact-main CI | run `31835953106`, push, head `7b79691e…`, completed/success | verified_current |
| PR #45 | OPEN, Draft, dirty/conflicting; head `6712d698…`; overlaps both governance paths | stale_historical_non_authority |
| GitHub branch protection | API HTTP 403 under current private-repository plan; GraphQL rule count 0 | known_gap |
| GitHub repository rulesets | API HTTP 403 under current private-repository plan | known_gap |
| Operator plan decision | remain private on GitHub Free; use mandatory manual merge control; no gate credit | accepted_compensating_control |

## Last verified authenticated provider evidence

| Item | Value | Classification |
| --- | --- | --- |
| Published production release | `trade-vl` | latest_authenticated_provider_evidence |
| Published production deploy | Netlify `6a7b9e45ceb7e100087c55fa` | latest_authenticated_provider_evidence |
| Published production commit | `f463644ddeb7f49fa8b80924d9103ea8970ccae4` | latest_authenticated_provider_evidence |
| Production assertion | identifies full commit `f463644ddeb7f49fa8b80924d9103ea8970ccae4` | exact_identity_match |
| Production-to-main Git relation | production `f463644ddeb7f49fa8b80924d9103ea8970ccae4` is the first-parent ancestor of current main `7b79691e473fa630d748763cddf97e1209974e40`; the commits are not equal because PRs #99 and #100 advanced governance and PRs #101 through #108 delivered provider-free, runtime-unwired source without a production publish | verified_current; production_behind_non_production_main |
| PR #109 automatic Netlify status | `netlify/trade-vl/deploy-preview` at `https://deploy-preview-109--trade-vl.netlify.app` | non_production_preview_non_authority |
| Post-PR #98 production smoke | owner-bound positions embeds 4/4 HTTP 200 and 0 HTTP 300; dashboard, settings, market calendar and execution-record reads green; no form or application mutation route submitted by agent | verified_current |
| Supabase project | `ekdyopdrrkphlrsilyoo` | checksum_bound_read_only_evidence |
| MA05 production structure | 9/9 physical NOT NULL and RLS; 20/20 constraints; 2/2 relationship indexes; revoked client grants; service-role-only RPC | verified_current |
| MA06 anonymous Data API | HTTP 401 / Postgres `42501` on recommendations read | verified_current |
| MA06 authenticated SQL role | read-only owner-claim query denied with Postgres `42501` | verified_current |
| MA08 migration parity | 21,658 production/source bytes; MD5 `83e413b3d95cc26106444cc159c0105b` on both | verified_current |
| Supabase V2 receipt | selected `[public]`: 1 schema, 30 tables, 653 columns, 30 PK, 28 FK, 22 functions | verified_current |
| Generated type output | provider response and repository output byte-identical at SHA-256 `f23c3702…`; required owner fields and RPC present | verified_current |

Action 666CR is repository-governance-only. It preserves the Action 660H manual
control, does not modify or supersede the last verified production readback and
performs no application, database or runtime mutation, no operator-initiated
provider configuration/data mutation and no production-release mutation. The
automatic non-production preview grants no authority.

## Milestone A gate ledger

Conditional on these exact reconciliation bytes reaching `main` and successful
exact-main CI, formal closure is **14/15 = 93.3%**, with no partial credit. The
candidate itself awards no advance MA-02 credit. Milestone A is not complete.

| Classification | Gates |
| --- | --- |
| verified_current | MA-01, MA-02, MA-03, MA-04, MA-05, MA-06, MA-07, MA-08, MA-09, MA-10, MA-11, MA-12, MA-14, MA-15 |
| known_gap | MA-13 |

MA-09 is `verified_current`: the V2 package binds project-scoped Supabase
project, read-only catalog and type-generation responses to the selected
`[public]` schema. Provider-extracted and repository TypeScript are
byte-identical at SHA-256 `f23c3702…`; the required owner fields and owner-aware
RPC are present. Independent re-review found no issue at exact PR #96 head
`baf3f20b…`, the V2 oracle passed 42/42, PR #95 merged first, exact reviewed
scope reached main and exact-main CI run `31536166511` succeeded.

MA-05 is `verified_current`: production readback passed 9/9 owner columns and
RLS tables, 20/20 constraints, 2/2 relationship indexes, revoked client grants
and the service-role-only RPC boundary. Two disposable staging principals
proved one-own/zero-other reads in both directions; the cross-owner RPC failed,
the same-owner RPC succeeded, all test data rolled back and staging was cleaned
and paused.

MA-06 is `verified_current`: the anonymous production Data API and a direct
read-only `authenticated` role check both failed closed with Postgres `42501`.
The staging rollback proof separately exercised the installed RLS predicate
with two Auth principals.

MA-08 is `verified_current`: the applied production MA05 migration and the
reviewed repository source are exactly 21,658 bytes and share MD5
`83e413b3d95cc26106444cc159c0105b`.

MA-11 is `verified_current`: the earlier closure established exact Netlify,
deployment-assertion and GitHub identity at `4607990a…`, `490e3607…`,
`58c29514…` and `9e2f64a1…`. The PR #98 release reconciled all three again at
the last verified production commit
`f463644ddeb7f49fa8b80924d9103ea8970ccae4`. Exact-main CI run
`31541394848` and Netlify deploy `6a7b9e45ceb7e100087c55fa` identify that
commit. Current main `7b79691e473fa630d748763cddf97e1209974e40`
is a governance and provider-free Track 2 successor and has no recorded
production publish.

MA-15 is `verified_current`: PR #98 delivered the exact Action 660F owner-bound
relationship correction. Anonymous login redirect and protected dashboard
denial remained green. Authenticated application, dashboard, settings and
market-calendar reads rendered. Supabase API logs showed four owner-bound
`positions` embeds at HTTP 200, none at HTTP 300, plus two `execution_records`
reads at HTTP 200 with no 5xx response. No form or application mutation route
was submitted. A later production deploy still reopens this gate until the
same smoke passes again.

MA-13 is a `known_gap`: the repository remains private on GitHub Free by
explicit operator decision. Branch protection and rulesets are plan-gated,
and zero branch protection rules are registered. Action 660H requires a frozen
exact PR head, exact-head CI, independent read-only review, explicit operator
approval of PR plus SHA, ordinary PR merge, exact-main CI and release-bound
smoke when deployed. This is accepted manual compensation, not GitHub
enforcement; it awards no credit and Milestone A remains 14/15.

Track 2 current-main foundation is delivered through PR #108. The verified
provider-free sequence is `CJ -> CK -> CL -> CM -> CN -> CO -> CP -> CQ`.
Every layer remains server-only, synthetic-only, default-off and runtime-unwired.
The next bounded objective is a fresh current-main non-forgeable
observation-authority successor based on the first applicable historical PR #72
layer. The historical PR and its review evidence remain non-authority.

## Delivery state

| Track | Current classification | Evidence boundary |
| --- | --- | --- |
| 1 | paused | No new release authority. |
| 2 | current-main foundation delivered; observation authority open | PRs #101 through #108 deliver `CJ -> CK -> CL -> CM -> CN -> CO -> CP -> CQ`, all default-off and runtime-unwired. Historical PR #54 remains open, non-Draft and non-authority; PRs #55, #57, #58, #60, #63, #67 and #72 remain open Draft non-authority. |
| 3 | `closed_holding`, Milestone A incomplete | `D_keep_execution_gate_closed` remains current. R7-R1 is `completed_rejected`, permanently consumed, prefix `0`, non-retry. No usable GT2 authority or alternative trust root exists. |
| Action 652 | source boundary delivered; V1 provenance historical | Source containment, authenticated server-owned boundary, evidence contract and canonical governance remain present on main. Action 660D V2 supersedes V1 for the post-MA05 schema. |
| 4 | delivered default-off foundation | PR #84 is merged; no runtime wiring, database, broker, production or milestone authority. |
| 5 | verified recovery; manual governance canonical | PR #99 makes Action 660G canonical and PR #100 makes the accepted Action 660H manual MA-13 control canonical without closing the gate. PR #45 remains stale non-authority and unmodified. |
| 6 | source delivery complete, default-off holding | PR #85 is merged; five additive Session V2 paths remain runtime-unwired and provide no tenancy, database, broker or production authority. |

## Historical authority and supersession ledger

- Main `eb79279d…` / tree `bc97dd2…`, main `129b03d…` / tree
  `92d9cd4…`, main `59f00b44…` / tree `64df5ff0…`, main
  `7749a726…` / tree `d6e00d31…`, and main `2409b458…` / tree
  `5c54eb02…` were canonical at their respective evidence timestamps. They are
  superseded first by `4607990a…` / `fc5e4e3d…`, then by `490e3607…` /
  `57909c14…`, then by `58c29514…` / `f1353d83…`, then by
  `9e2f64a…` / `0a5440b7…`, then by `f463644d…` / `b0c8eae0…`, then by
  `7662d3f…` / `86a59f23…` and now by reconciliation base `7b79691e…` /
  `5c6eb05b…`.
- PR #86's former Ready/unmerged state, PR #89's former Draft/unmerged state
  and PRs #90, #91 and #92's former Draft delivery states are superseded by
  their merges. PR #92's former current-main state is superseded by the
  ordinary merges of PR #94, PR #95, PR #96, PR #97 and PR #98.
- Earlier 126-, 135-, 137-, 139- and 142-commit production-to-main distances
  and deploy `6a65fd2f…` were superseded by exact production/main identity at
  `4607990a…` and deploy `6a7b2c1e…`; those identities and the later
  `490e3607…`, `58c29514…` and `9e2f64a…` releases are historical and
  superseded by the last verified production commit `f463644d…` and deploy
  `6a7b9e45…`. PRs #99 and #100 then advanced governance, and provider-free PRs
  #101 through #108 advanced current main to `7b79691e…`; production remains at
  its first-parent ancestor `f463644d…`.
- Previous `unknown_current` source-containment, authenticated API-boundary
  and repository-CI claims are superseded by closed MA-03, MA-04 and MA-12
  evidence. Earlier evidence closed bounded MA-15 behavior, the post-PR #97
  dashboard failure reopened it, and the exact PR #98 recovery plus green
  production readbacks now re-close it. Action 660C separately closes migration
  parity and role-bound enforcement.
- MA-13's former `unknown_current` classification is superseded by the
  operator's accepted `known_gap` decision. The manual control reduces risk but
  does not change the verified-gate count.
- MA-02's earlier 7/15 delivery state and MA-09's 8/15 delivery-candidate state
  were superseded by verified MA-09 closure at 9/15 and later MA-11/MA-15
  closures at 11/15. MA05 then changed the schema, producing the historical
  13/15 reopening state and later 14/15 MA-09 closure. The post-PR #97 dashboard
  failure returned formal status to 13/15; PR #98 recovery verification now
  restores 14/15 by re-closing MA-15. This documentation creates no new
  provider, database, migration, broker, release or production authority.
- Historical main `3b7ecfa…`, historical Track 3 closure claims and historical
  Track 6 external-only claims remain superseded as recorded in the prior
  ledger.
- Historic planned Action 653 deployment reconciliation versus delivered
  broker-neutral instruction scope remains a contradiction.
- Historic planned Action 654 security/migration gate versus delivered #78
  transport-inert scope remains a contradiction.

## Preserved blockers

1. Reopen MA-09 after any selected-schema, provider-response, generator,
   receipt, source-binding or generated-output drift. Do not carry this closure
   across an unverified change.
2. Do not claim Action 650 containment applied or production-verified without
   authorized role-bound behavior and migration evidence.
3. Tenant/owner completion is bound to the Action 660 production and
   two-principal evidence; V2 generated output corroborates shape but does not
   replace role-bound behavior proof.
4. Reopen MA-11 if a production deploy/assertion changes without exact GitHub
   identity reconciliation, or if the recorded production-to-main ancestry is
   no longer verified. Provider-free main movement alone is not a production
   publish.
5. Do not create a new durable Supabase contract without separate migration
   allowlist evidence and a fresh generated-types provenance reconciliation.
6. Do not treat default-off Action 655 or Session V2 source as runtime or
   milestone authority.
7. Do not treat synthetic outcome, session or execution contracts as live
   execution, training, promotion or milestone proof.
8. Do not reopen GT2 execution or introduce a trust root/native bootstrap
   without new explicit operator authority.
9. Do not treat the Action 660H manual checklist as branch protection or
   required-check enforcement. A missing or stale checklist step stops the
   merge or reopens the affected gate.
10. Preserve PR #45 unmodified as stale historical non-authority.
11. Reopen MA-15 after a new production deploy or if anonymous denial,
    authenticated page rendering or a required server-owned read route fails.
