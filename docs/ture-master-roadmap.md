# Ture Master Roadmap

**ACTION 656 — MA-11 and MA-15 verified closure governance reconciliation.**

**Document status:** bounded two-path successor to record the verified MA-11
release identity and MA-15 production behavioral smoke against the same
immutable revision. On its delivery branch this revision is not current-main
authority. It becomes canonical only after independent review, an exact
two-path merge, main reachability and exact-main CI.

`roadmap_completion_authority:false_until_main_verified`

## Evidence boundary

This roadmap reconciles Ture against GitHub `main` commit
`4607990afe35b0d089f960dded9538182c23c201`, tree
`fc5e4e3d2d7e576195abc45c08b13d9ebadb837e`, observed on 2026-08-11.
GitHub current-main evidence, exact provider readbacks, authorized database
readbacks and executable source outrank this document.

The reconciliation base is the ordinary merge of PR #92. Its two delivered
paths are byte-identical to reviewed head `054520c4…`; exact-main push run
`31494512027` completed successfully with every required step passing. PR #45
remains open, Draft, dirty/conflicting and `stale_historical_non_authority`; it
overlaps both governance paths and must remain unmodified.

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

At this delivery branch's evidence boundary, formal status is **11 of 15
required gates verified (73.3%)**, with no partial credit. Milestone A remains
incomplete. This revision records already completed release and bounded
production-smoke evidence; it creates no new provider or runtime authority.

| Gate | Current classification at delivery boundary |
| --- | --- |
| MA-01 remote main/source identity | verified_current |
| MA-02 canonical roadmap/ledger currentness | verified_current |
| MA-03 browser-to-Supabase source containment | verified_current |
| MA-04 authenticated server-owned API boundary source | verified_current |
| MA-05 tenant-owner principal binding | known_gap |
| MA-06 production RLS/Data API/ordinary-role behavior | unknown_current |
| MA-07 source migration inventory | verified_current |
| MA-08 production migration application/source parity | unknown_current |
| MA-09 generated-types parity/pinned provenance | verified_current |
| MA-10 catalog/migration evidence contract source | verified_current |
| MA-11 release/deployment identity | verified_current |
| MA-12 repository CI workflow/check execution | verified_current |
| MA-13 branch protection/required-check policy | unknown_current |
| MA-14 disciplined worktree/release ownership | verified_current |
| MA-15 production behavioral smoke | verified_current |

**MA-09 closure record:** adversarial review of initial head `723712c4…` found
one fail-closed defect: ten provenance metadata mutations were accepted.
Remediation head `875c82e1…` rejected all ten, passed the repository oracle
21/21 and rejected an exhaustive 69 leaf mutations, 14 unexpected object keys
and 4 array extensions. PR run `31492155553`, ordinary merge `2409b458…`,
byte-identical main reachability and exact-main run `31492511225` all
succeeded. A later generated-type, command, project, schema, receipt or
source-binding change makes MA-09 subject to reconciliation again.

**MA-11 closure record:** Netlify production deploy
`6a7b2c1e46dc4c4ae089c400`, the deployment assertion and GitHub `main` all
identify full commit `4607990afe35b0d089f960dded9538182c23c201`. Exactly one
production build completed before manual publication. The new and rollback
permalinks remained reachable, and builds were stopped after publication.

**MA-15 closure record:** a real headless browser against
`https://trade.valentinlabs.com` verified anonymous redirect to `/login`,
canonical JSON 401 on anonymous dashboard access, HTTP 200 application
rendering under a canonical HMAC trusted-operator session, and HTTP 200 JSON
from dashboard, settings, execution-record and market-calendar read routes.
Runtime ping remained healthy with all mutation flags false. The login route
and every application mutation route remained uncalled.

ACTION 668H remains `closed_holding` under operator decision
`D_keep_execution_gate_closed`. R7-R1 is `completed_rejected`, permanently
consumed, completed prefix `0` and non-retry. No usable GT2 authorization,
alternative trust root or native bootstrap exists.

Source containment, the authenticated server-owned API boundary, canonical
governance, repository CI and repository-pinned generated-types provenance are
verified on current main. MA-11 and MA-15 now additionally prove exact release
identity and bounded deployed application/session read behavior. They do not
prove production RLS, migration application, ordinary-role behavior or tenant
ownership.

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
- Action 652 has delivered source containment, the authenticated server-owned
  boundary, the catalog/migration evidence contract, canonical governance and
  MA-09 generated-types provenance now present on main. The later MA-11 and
  MA-15 closures establish exact release identity and bounded production
  application/session read behavior; database role and migration behavior
  remain separately gated.
- Track 4's Action 655 foundation is merged via PR #84, default-off and
  runtime-unwired. It provides no database, broker, production or milestone
  authority.
- Track 5's canonical governance history is current through merged PR #92.
  This bounded two-path successor makes the MA-11 and MA-15 closures explicit. PR #45
  remains an overlapping stale historical non-authority and is not modified.
- Track 6's five additive Session V2 paths are merged via PR #85, default-off
  and runtime-unwired. Runtime, tenancy, database, broker and production
  authority remain false.
- PR #88 delivered the portable catalog/migration evidence contract, PR #89
  delivered the repository CI workflow, PR #90 delivered canonical governance
  currentness, PR #91 delivered MA-09 provenance plus its fail-closed
  remediation, and PR #92 recorded its verified closure.

Future main-moving work must remain serialized behind this bounded governance
reconciliation until its review decision is known. Any later main mover
requires fresh source, provider and policy identity reconciliation.

## Current provider and release boundary

The latest authenticated Netlify readback identifies published production
deploy `6a7b2c1e46dc4c4ae089c400` at commit
`4607990afe35b0d089f960dded9538182c23c201`, with the production assertion and
GitHub `main` identifying the same full commit. Builds are stopped. The new
production permalink and previous rollback permalink were both reachable
after publication. This closes the prior release-identity contradiction; this
documentation reconciliation authorizes no additional deployment.

The bounded production smoke at `2026-08-11T14:17:33.614Z` established
anonymous denial, authenticated protected-page rendering and HTTP 200 JSON
from four fixed-purpose server-owned read routes. Its canonical session was
created locally so no production login or rate-limit write was performed. It
does not establish any mutation, broker, scan, ranking or learning behavior.

The current checksum-bound Supabase V5 receipt binds project
`ekdyopdrrkphlrsilyoo` to a complete read-only catalog snapshot: 1 schema,
30 tables, 645 columns, 30 primary keys, 17 foreign keys and 21 functions. It
also binds generated type output to SHA-256
`5a74e8de…`. The receipt was obtained as
`supabase_read_only_user` with transaction and default read-only enabled.
MA-09 pins the exact receipt, command, project, schema, CLI, source and
generated-output identities into repository source and verifies them
provider-free. MA-15 proves only the released server-owned read path; neither
gate proves tenant-owner principal binding, ordinary application-role RLS/Data
API behavior or migration history/source parity. MA-05, MA-06 and MA-08
therefore remain gated.

GitHub branch-protection and ruleset endpoints both return HTTP 403 under the
current private-repository plan. MA-13 is therefore `unknown_current`, not
absent and not verified.

## Superseded assertions preserved for audit

- `eb79279d…` / `bc97dd2…`, `129b03d…` / `92d9cd4…`,
  `59f00b44…` / `64df5ff0…`, `7749a726…` / `d6e00d31…`, and
  `2409b458…` / `5c54eb02…` were valid earlier main/tree identities. They are
  now historical and superseded by `4607990a…` / `fc5e4e3d…`.
- PR #86's former Ready/unmerged state, PR #89's former Draft/unmerged state
  and PRs #90, #91 and #92's former Draft delivery states are superseded by
  their respective merges. PR #92 is the current-main event.
- Earlier 126-, 135-, 137-, 139- and 142-commit production distances and deploy
  `6a65fd2f…` are superseded by exact production/main identity at `4607990a…`
  and deploy `6a7b2c1e…`.
- Containment, authenticated API-boundary and CI were previously
  `unknown_current`. Current main evidence closes MA-03, MA-04 and MA-12;
  later bounded production evidence closes MA-15 without proving database-role
  behavior.
- MA-02's pre-merge 7/15 state, MA-09's pre-closure 8/15 candidate state and
  the verified 9/15 MA-09 closure are superseded by MA-11/MA-15 closure at
  11/15. This reconciliation grants no new provider, database, migration,
  broker, release or production authority.
