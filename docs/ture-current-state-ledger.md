# Ture Current-State Ledger

**ACTION 660E — MA-09 verified closure governance reconciliation after the
post-MA05 provider-bound generated-types refresh.**

**Evidence timestamp:** 2026-08-11. This bounded four-path successor records
that every Action 660D MA-09 closure condition is satisfied on current main
and that MA-15 remains verified after the new production deploy. On its
delivery branch it does not authorize repository merging, runtime, production,
provider, database, migration, broker or release activity.

`roadmap_completion_authority:false_until_main_verified`

## Direct current readbacks

| Item | Value | Classification |
| --- | --- | --- |
| GitHub default branch | `main` | canonical_current |
| GitHub reconciliation base | `58c29514e5a065920c0994eb3c8fb4baf9415ba5` | canonical_current |
| Current main event | ordinary merge of PR #96 after PR #95 | corroborated_current |
| Current main tree | `f1353d8332845774753ccd0260e5fcc948b2b141` | canonical_current |
| Current main parents | `a1806410843a6a7cb3e8150852d9c45c55a1211d`, `baf3f20b2d97e507b9737d41c51768840d4d8883` | canonical_current |
| PR #95 | MERGED; head `e0b71ddb…`; merge `a1806410…`; merged first | corroborated_current |
| PR #96 | MERGED; reviewed head `baf3f20b…`; merge `58c29514…`; no head-to-main file delta | corroborated_current |
| Independent PR #96 re-review | exact head `baf3f20b…`; no findings; read-only | verified_current |
| Exact-main CI | run `31536166511`, push, head `58c29514…`, completed/success | verified_current |
| PR #45 | OPEN, Draft, dirty/conflicting; head `6712d698…`; overlaps both governance paths | stale_historical_non_authority |
| GitHub branch protection | API HTTP 403 under current private-repository plan | unknown_current |
| GitHub repository rulesets | API HTTP 403 under current private-repository plan | unknown_current |

## Latest authenticated provider evidence

| Item | Value | Classification |
| --- | --- | --- |
| Netlify build state | builds stopped | latest_authenticated_provider_evidence |
| Published production release | `trade-vl`, re-enabled after green deployment and smoke | latest_authenticated_provider_evidence |
| Published production deploy | Netlify `6a7b8e7aeac8960008de4410` | latest_authenticated_provider_evidence |
| Published production commit | `58c29514e5a065920c0994eb3c8fb4baf9415ba5` | latest_authenticated_provider_evidence |
| Production assertion | identifies full commit `58c29514e5a065920c0994eb3c8fb4baf9415ba5` | exact_identity_match |
| Production-to-main Git relation | production and main are the same commit | verified_current; contradiction_closed |
| Post-PR #96 production smoke | protected render and required reads green; no form or application mutation route submitted by agent | verified_current |
| Supabase project | `ekdyopdrrkphlrsilyoo` | checksum_bound_read_only_evidence |
| MA05 production structure | 9/9 physical NOT NULL and RLS; 20/20 constraints; 2/2 relationship indexes; revoked client grants; service-role-only RPC | verified_current |
| MA06 anonymous Data API | HTTP 401 / Postgres `42501` on recommendations read | verified_current |
| MA06 authenticated SQL role | read-only owner-claim query denied with Postgres `42501` | verified_current |
| MA08 migration parity | 21,658 production/source bytes; MD5 `83e413b3d95cc26106444cc159c0105b` on both | verified_current |
| Supabase V2 receipt | selected `[public]`: 1 schema, 30 tables, 653 columns, 30 PK, 28 FK, 22 functions | verified_current |
| Generated type output | provider response and repository output byte-identical at SHA-256 `f23c3702…`; required owner fields and RPC present | verified_current |

The Action 660E verification was read-only. PR #95, PR #96, exact-main CI and
the resulting production release had already completed under their separately
approved delivery actions. This reconciliation performs no new application,
database, provider or release mutation.

## Milestone A gate ledger

At this delivery branch's boundary, formal closure is **14/15 = 93.3%**,
with no partial credit. Milestone A is not complete.

| Classification | Gates |
| --- | --- |
| verified_current | MA-01, MA-02, MA-03, MA-04, MA-05, MA-06, MA-07, MA-08, MA-09, MA-10, MA-11, MA-12, MA-14, MA-15 |
| known_gap | none |
| unknown_current | MA-13 |

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
deployment-assertion and GitHub identity at `4607990a…`; the MA05 release
reconciled them at `490e3607…`. The later PR #96 release reconciled all three
again at current commit `58c29514e5a065920c0994eb3c8fb4baf9415ba5`.
Exact-main CI run `31536166511` and Netlify deploy
`6a7b8e7aeac8960008de4410` identify that commit.

MA-15 is `verified_current`: the original anonymous and trusted-session proof
covered `/login`, canonical dashboard denial, authenticated application render
and four server-owned read routes. The post-MA05 release repeated that bounded
smoke. The PR #96 deploy triggered another check; the authenticated application,
dashboard/settings reads, market-calendar load and execution-record JSON route
all rendered. No payload value is recorded, and the agent submitted no form or
application mutation route.

## Delivery state

| Track | Current classification | Evidence boundary |
| --- | --- | --- |
| 1 | paused | No new release authority. |
| 2 | open dependent stack | PRs #54, #55, #57, #58, #60, #63, #67 and #72 remain open and are not current-main authority. |
| 3 | `closed_holding`, Milestone A incomplete | `D_keep_execution_gate_closed` remains current. R7-R1 is `completed_rejected`, permanently consumed, prefix `0`, non-retry. No usable GT2 authority or alternative trust root exists. |
| Action 652 | source boundary delivered; V1 provenance historical | Source containment, authenticated server-owned boundary, evidence contract and canonical governance remain present on main. Action 660D V2 supersedes V1 for the post-MA05 schema. |
| 4 | delivered default-off foundation | PR #84 is merged; no runtime wiring, database, broker, production or milestone authority. |
| 5 | reconciliation delivery candidate | PR #96 is the current main event after ordered PR #95. This four-path successor records verified MA-09 closure. PR #45 remains stale non-authority and unmodified. |
| 6 | source delivery complete, default-off holding | PR #85 is merged; five additive Session V2 paths remain runtime-unwired and provide no tenancy, database, broker or production authority. |

## Historical authority and supersession ledger

- Main `eb79279d…` / tree `bc97dd2…`, main `129b03d…` / tree
  `92d9cd4…`, main `59f00b44…` / tree `64df5ff0…`, main
  `7749a726…` / tree `d6e00d31…`, and main `2409b458…` / tree
  `5c54eb02…` were canonical at their respective evidence timestamps. They are
  superseded first by `4607990a…` / `fc5e4e3d…`, then by `490e3607…` /
  `57909c14…`, and now by reconciliation base `58c29514…` / `f1353d83…`.
- PR #86's former Ready/unmerged state, PR #89's former Draft/unmerged state
  and PRs #90, #91 and #92's former Draft delivery states are superseded by
  their merges. PR #92's former current-main state is superseded by the
  ordinary merges of PR #94, PR #95 and PR #96.
- Earlier 126-, 135-, 137-, 139- and 142-commit production-to-main distances
  and deploy `6a65fd2f…` are superseded by exact production/main identity at
  `4607990a…` and deploy `6a7b2c1e…`; those identities and the later
  `490e3607…` release are historical and superseded by current exact
  production/main identity at `58c29514…` and deploy `6a7b8e7a…`.
- Previous `unknown_current` source-containment, authenticated API-boundary
  and repository-CI claims are superseded by closed MA-03, MA-04 and MA-12
  evidence. MA-15 closes bounded production application/session read behavior;
  Action 660C separately closes migration parity and role-bound enforcement.
- MA-02's earlier 7/15 delivery state and MA-09's 8/15 delivery-candidate state
  were superseded by verified MA-09 closure at 9/15 and later MA-11/MA-15
  closures at 11/15. MA05 then changed the schema, producing the historical
  13/15 reopening state. The V2 reconciliation closes MA-09 again and yields
  the current 14/15 delivery candidate. This documentation creates no new
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
4. Reopen MA-11 if production deploy, production assertion or GitHub `main`
   stops identifying the same immutable commit.
5. Do not create a new durable Supabase contract without separate migration
   allowlist evidence and a fresh generated-types provenance reconciliation.
6. Do not treat default-off Action 655 or Session V2 source as runtime or
   milestone authority.
7. Do not treat synthetic outcome, session or execution contracts as live
   execution, training, promotion or milestone proof.
8. Do not reopen GT2 execution or introduce a trust root/native bootstrap
   without new explicit operator authority.
9. Do not infer branch protection or required-check policy from the current
   GitHub API limitation.
10. Preserve PR #45 unmodified as stale historical non-authority.
11. Reopen MA-15 after a new production deploy or if anonymous denial,
    authenticated page rendering or a required server-owned read route fails.
