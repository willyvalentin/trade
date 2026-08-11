# Ture Master Roadmap

**ACTION 660C — MA-05, MA-06 and MA-08 verified closure governance
reconciliation, with fail-closed MA-09 drift reopening.**

**Document status:** bounded four-path successor to record the verified MA-05
owner boundary, MA-06 production role/Data API behavior, MA-08 exact migration
parity and the mandatory MA-09 generated-types drift reopening. On its
delivery branch this revision is not current-main authority. It becomes
canonical only after independent review, an exact four-path merge, main
reachability and exact-main CI.

`roadmap_completion_authority:false_until_main_verified`

## Evidence boundary

This roadmap reconciles Ture against GitHub `main` commit
`490e3607d1dfb85046be5ce70c787f897b5d939e`, tree
`57909c14bd7fc2867bd67b94ae0c9a4ad94ffb2c`, observed on 2026-08-11.
GitHub current-main evidence, exact provider readbacks, authorized database
readbacks and executable source outrank this document.

The reconciliation base is the ordinary merge of PR #94. Exact-main push run
`31513617560` completed successfully for `490e3607…`. PR #45 remains open,
Draft, dirty/conflicting and `stale_historical_non_authority`; it overlaps the
canonical governance paths and must remain unmodified.

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

At this delivery branch's evidence boundary, formal status is **13 of 15
required gates verified (86.7%)**, with no partial credit. Milestone A remains
incomplete. This revision records already completed owner, ordinary-role and
migration-parity evidence; it creates no new provider or runtime authority.

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
| MA-09 generated-types parity/pinned provenance | known_gap |
| MA-10 catalog/migration evidence contract source | verified_current |
| MA-11 release/deployment identity | verified_current |
| MA-12 repository CI workflow/check execution | verified_current |
| MA-13 branch protection/required-check policy | unknown_current |
| MA-14 disciplined worktree/release ownership | verified_current |
| MA-15 production behavioral smoke | verified_current |

**MA-09 historical closure and current reopening record:** adversarial review
of initial head `723712c4…` found
one fail-closed defect: ten provenance metadata mutations were accepted.
Remediation head `875c82e1…` rejected all ten, passed the repository oracle
21/21 and rejected an exhaustive 69 leaf mutations, 14 unexpected object keys
and 4 array extensions. PR run `31492155553`, ordinary merge `2409b458…`,
byte-identical main reachability and exact-main run `31492511225` all
succeeded. MA05 subsequently changed the production public schema without
regenerating `lib/supabase-database.types.ts` or replacing its V5 catalog and
provenance receipt. The stated drift rule is therefore active and MA-09 is
reopened as `known_gap`.

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
deployment-assertion and GitHub identity at `4607990a…`. The later MA05 release
reconciled all three identities again at current full commit
`490e3607d1dfb85046be5ce70c787f897b5d939e`; exact-main CI run
`31513617560` succeeded and `trade-vl` was not re-enabled before the ready
release and smoke checks passed.

**MA-15 closure record:** the original headless-browser proof against
`https://trade.valentinlabs.com` verified anonymous redirect to `/login`,
canonical JSON 401 on anonymous dashboard access, authenticated application
rendering and four server-owned read routes. The post-MA05 release repeated
the bounded denial, protected-render and read-route smoke before reactivation.
Runtime mutation flags remained false; the login route and application
mutation routes remained uncalled by the smoke.

ACTION 668H remains `closed_holding` under operator decision
`D_keep_execution_gate_closed`. R7-R1 is `completed_rejected`, permanently
consumed, completed prefix `0` and non-retry. No usable GT2 authorization,
alternative trust root or native bootstrap exists.

Source containment, the authenticated server-owned API boundary, canonical
governance and repository CI are verified on current main. MA-05, MA-06 and
MA-08 now additionally prove tenant ownership, production ordinary-role/Data
API denial, two-principal RLS behavior and exact production migration parity.
The earlier generated-types provenance no longer describes the changed
production schema, so MA-09 is explicitly reopened.

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
  Its earlier MA-09 generated-types closure is now historical because MA05
  changed the production schema without a refreshed receipt or type output.
- Track 4's Action 655 foundation is merged via PR #84, default-off and
  runtime-unwired. It provides no database, broker, production or milestone
  authority.
- Track 5's last canonical governance revision is present on main, while this
  bounded four-path successor reconciles PR #94, closes MA-05/06/08 and
  reopens MA-09. PR #45 remains an overlapping stale historical non-authority
  and is not modified.
- Track 6's five additive Session V2 paths are merged via PR #85, default-off
  and runtime-unwired. Runtime, tenancy, database, broker and production
  authority remain false.
- PR #88 delivered the portable catalog/migration evidence contract, PR #89
  delivered the repository CI workflow, PR #90 delivered canonical governance
  currentness, PR #91 delivered MA-09 provenance plus its fail-closed
  remediation, and PR #92 recorded its then-valid closure. PR #94 later
  delivered and activated MA05, triggering the documented MA-09 drift rule.

Future main-moving work must remain serialized behind this bounded governance
reconciliation until its review decision is known. Any later main mover
requires fresh source, provider and policy identity reconciliation.

## Current provider and release boundary

The latest authenticated Netlify readback identifies the published production
release, its production assertion and GitHub `main` at full commit
`490e3607d1dfb85046be5ce70c787f897b5d939e`. `trade-vl` was re-enabled only
after the ready deployment and final smoke checks were green. This
documentation reconciliation authorizes no additional deployment.

The bounded production smoke at `2026-08-11T14:17:33.614Z` established
anonymous denial, authenticated protected-page rendering and HTTP 200 JSON
from four fixed-purpose server-owned read routes. Its canonical session was
created locally so no production login or rate-limit write was performed. It
does not establish any mutation, broker, scan, ranking or learning behavior.

The historical checksum-bound Supabase V5 receipt binds project
`ekdyopdrrkphlrsilyoo` to a complete read-only catalog snapshot: 1 schema,
30 tables, 645 columns, 30 primary keys, 17 foreign keys and 21 functions. It
also binds generated type output to SHA-256
`5a74e8de…`. The receipt was obtained as
`supabase_read_only_user` with transaction and default read-only enabled.
It remains valid historical evidence for its observed schema, but MA05 added
owner fields and an owner-aware RPC afterward. The unchanged generated output
therefore cannot establish current parity. MA-09 is reopened pending a fresh
read-only receipt, type generation and provenance review.

Production now denies an anonymous recommendation Data API read with HTTP 401
and Postgres `42501`; an `authenticated` read-only SQL role check with the
canonical owner claim is also denied with `42501`. Production catalog readback
and staging two-principal rollback proof establish MA-06. The applied MA05
migration's one statement is byte-identical to repository source, establishing
MA-08.

GitHub branch-protection and ruleset endpoints both return HTTP 403 under the
current private-repository plan. MA-13 is therefore `unknown_current`, not
absent and not verified.

## Superseded assertions preserved for audit

- `eb79279d…` / `bc97dd2…`, `129b03d…` / `92d9cd4…`,
  `59f00b44…` / `64df5ff0…`, `7749a726…` / `d6e00d31…`, and
  `2409b458…` / `5c54eb02…` and `4607990a…` / `fc5e4e3d…` were valid earlier
  main/tree identities. They are now historical and superseded by
  `490e3607…` / `57909c14…`.
- PR #86's former Ready/unmerged state, PR #89's former Draft/unmerged state
  and PRs #90, #91 and #92's former Draft delivery states are superseded by
  their respective merges. PR #92's former current-main state is superseded by
  the ordinary merge of PR #94.
- Earlier 126-, 135-, 137-, 139- and 142-commit production distances and deploy
  `6a65fd2f…`, followed by exact identity at `4607990a…` and deploy
  `6a7b2c1e…`, are historical and superseded by current exact production/main
  identity at `490e3607…`.
- Containment, authenticated API-boundary and CI were previously
  `unknown_current`. Current main evidence closes MA-03, MA-04 and MA-12;
  later bounded production evidence closes MA-15. Action 660C separately
  proves the production ordinary-role boundary and closes MA-06.
- MA-02's pre-merge 7/15 state, MA-09's pre-closure 8/15 candidate state, the
  verified 9/15 MA-09 closure and MA-11/MA-15 closure at 11/15 are historical.
  Closing MA-05/06/08 while reopening drifted MA-09 yields 13/15. This
  reconciliation grants no new provider, database, migration, broker, release
  or production authority.
