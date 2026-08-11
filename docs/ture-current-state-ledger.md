# Ture Current-State Ledger

**ACTION 660F — dashboard owner-relation disambiguation recovery candidate and
fail-closed MA-15 reopening.**

**Evidence timestamp:** 2026-08-11. This bounded six-path successor records the
post-PR #97 dashboard regression, applies the owner-bound relationship hint and
keeps MA-15 open pending a separately approved production recovery. On its
delivery branch it does not authorize repository merging, runtime, production,
provider, database, migration, broker or release activity.

`roadmap_completion_authority:false_until_main_verified`

## Direct current readbacks

| Item | Value | Classification |
| --- | --- | --- |
| GitHub default branch | `main` | canonical_current |
| GitHub reconciliation base | `9e2f64a17c3851529beade0685ababb582eac320` | canonical_current |
| Current main event | ordinary merge of PR #97 | corroborated_current |
| Current main tree | `0a5440b75b562da512427a50e05d65ad1fb0aa2f` | canonical_current |
| Current main parents | `58c29514e5a065920c0994eb3c8fb4baf9415ba5`, `5bed9de6be85f0c33c984c3a68bc645504e84325` | canonical_current |
| PR #95 | MERGED; head `e0b71ddb…`; merge `a1806410…`; merged first | corroborated_current |
| PR #96 | MERGED; reviewed head `baf3f20b…`; merge `58c29514…`; no head-to-main file delta | corroborated_current |
| Independent PR #96 re-review | exact head `baf3f20b…`; no findings; read-only | verified_current |
| PR #97 | MERGED; head `5bed9de6…`; merge `9e2f64a1…` | corroborated_current |
| Exact-main CI | run `31539134121`, push, head `9e2f64a1…`, completed/success | verified_current |
| PR #45 | OPEN, Draft, dirty/conflicting; head `6712d698…`; overlaps both governance paths | stale_historical_non_authority |
| GitHub branch protection | API HTTP 403 under current private-repository plan | unknown_current |
| GitHub repository rulesets | API HTTP 403 under current private-repository plan | unknown_current |

## Latest authenticated provider evidence

| Item | Value | Classification |
| --- | --- | --- |
| Published production release | `trade-vl` | latest_authenticated_provider_evidence |
| Published production deploy | Netlify `6a7b9745ed0bbf0009b90a35` | latest_authenticated_provider_evidence |
| Published production commit | `9e2f64a17c3851529beade0685ababb582eac320` | latest_authenticated_provider_evidence |
| Production assertion | identifies full commit `9e2f64a17c3851529beade0685ababb582eac320` | exact_identity_match |
| Production-to-main Git relation | production and main are the same commit | verified_current; contradiction_closed |
| Post-PR #97 production smoke | dashboard failed closed; both positions embeds HTTP 300; other bounded reads green; no form or application mutation route submitted by agent | known_gap |
| Supabase project | `ekdyopdrrkphlrsilyoo` | checksum_bound_read_only_evidence |
| MA05 production structure | 9/9 physical NOT NULL and RLS; 20/20 constraints; 2/2 relationship indexes; revoked client grants; service-role-only RPC | verified_current |
| MA06 anonymous Data API | HTTP 401 / Postgres `42501` on recommendations read | verified_current |
| MA06 authenticated SQL role | read-only owner-claim query denied with Postgres `42501` | verified_current |
| MA08 migration parity | 21,658 production/source bytes; MD5 `83e413b3d95cc26106444cc159c0105b` on both | verified_current |
| Supabase V2 receipt | selected `[public]`: 1 schema, 30 tables, 653 columns, 30 PK, 28 FK, 22 functions | verified_current |
| Generated type output | provider response and repository output byte-identical at SHA-256 `f23c3702…`; required owner fields and RPC present | verified_current |

The Action 660F diagnosis was read-only. PR #97, exact-main CI and the
resulting production release had already completed under their separately
approved delivery action. This recovery candidate performs no application,
database, provider or release mutation.

## Milestone A gate ledger

At this delivery branch's boundary, formal closure is **13/15 = 86.7%**,
with no partial credit. Milestone A is not complete.

| Classification | Gates |
| --- | --- |
| verified_current | MA-01, MA-02, MA-03, MA-04, MA-05, MA-06, MA-07, MA-08, MA-09, MA-10, MA-11, MA-12, MA-14 |
| known_gap | MA-15 |
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
deployment-assertion and GitHub identity at `4607990a…`, `490e3607…` and
`58c29514…`. The PR #97 release reconciled all three again at current commit
`9e2f64a17c3851529beade0685ababb582eac320`. Exact-main CI run
`31539134121` and Netlify deploy `6a7b9745ed0bbf0009b90a35` identify that
commit.

MA-15 is `known_gap`: the PR #97 deploy triggered the required recheck.
Anonymous denial, protected rendering, settings, market calendar and the
execution-record JSON route remained green, but dashboard refresh failed
closed. Both `positions` embeds returned HTTP 300 because two FKs connect
`positions` to `recommendations` and the source did not disambiguate them.
Action 660F selects the composite owner FK and adds a provider-free regression
test. MA-15 cannot close until that exact fix is deployed and every required
production read is green.

## Delivery state

| Track | Current classification | Evidence boundary |
| --- | --- | --- |
| 1 | paused | No new release authority. |
| 2 | open dependent stack | PRs #54, #55, #57, #58, #60, #63, #67 and #72 remain open and are not current-main authority. |
| 3 | `closed_holding`, Milestone A incomplete | `D_keep_execution_gate_closed` remains current. R7-R1 is `completed_rejected`, permanently consumed, prefix `0`, non-retry. No usable GT2 authority or alternative trust root exists. |
| Action 652 | source boundary delivered; V1 provenance historical | Source containment, authenticated server-owned boundary, evidence contract and canonical governance remain present on main. Action 660D V2 supersedes V1 for the post-MA05 schema. |
| 4 | delivered default-off foundation | PR #84 is merged; no runtime wiring, database, broker, production or milestone authority. |
| 5 | recovery delivery candidate | PR #97 is the current main event. This six-path successor records the dashboard regression, reopens MA-15 and carries a source-only fix. PR #45 remains stale non-authority and unmodified. |
| 6 | source delivery complete, default-off holding | PR #85 is merged; five additive Session V2 paths remain runtime-unwired and provide no tenancy, database, broker or production authority. |

## Historical authority and supersession ledger

- Main `eb79279d…` / tree `bc97dd2…`, main `129b03d…` / tree
  `92d9cd4…`, main `59f00b44…` / tree `64df5ff0…`, main
  `7749a726…` / tree `d6e00d31…`, and main `2409b458…` / tree
  `5c54eb02…` were canonical at their respective evidence timestamps. They are
  superseded first by `4607990a…` / `fc5e4e3d…`, then by `490e3607…` /
  `57909c14…`, then by `58c29514…` / `f1353d83…` and now by
  reconciliation base `9e2f64a…` / `0a5440b7…`.
- PR #86's former Ready/unmerged state, PR #89's former Draft/unmerged state
  and PRs #90, #91 and #92's former Draft delivery states are superseded by
  their merges. PR #92's former current-main state is superseded by the
  ordinary merges of PR #94, PR #95, PR #96 and PR #97.
- Earlier 126-, 135-, 137-, 139- and 142-commit production-to-main distances
  and deploy `6a65fd2f…` are superseded by exact production/main identity at
  `4607990a…` and deploy `6a7b2c1e…`; those identities and the later
  `490e3607…` and `58c29514…` releases are historical and superseded by
  current exact production/main identity at `9e2f64a…` and deploy
  `6a7b9745…`.
- Previous `unknown_current` source-containment, authenticated API-boundary
  and repository-CI claims are superseded by closed MA-03, MA-04 and MA-12
  evidence. Earlier evidence closed bounded MA-15 behavior, but the post-PR #97
  dashboard failure reopens it. Action 660C separately closes migration parity
  and role-bound enforcement.
- MA-02's earlier 7/15 delivery state and MA-09's 8/15 delivery-candidate state
  were superseded by verified MA-09 closure at 9/15 and later MA-11/MA-15
  closures at 11/15. MA05 then changed the schema, producing the historical
  13/15 reopening state and later 14/15 MA-09 closure. The current dashboard
  failure reopens MA-15 and returns formal status to 13/15. This documentation
  creates no new provider, database, migration, broker, release or production
  authority.
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
