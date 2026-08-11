# Ture Master Roadmap

**ACTION 652 — MA-09 verified closure governance reconciliation.**

**Document status:** bounded two-path successor to record the verified MA-09
closure now present on `main`. On its delivery branch this revision is not
current-main authority. It becomes canonical only after independent review,
an exact two-path merge, main reachability and exact-main CI.

`roadmap_completion_authority:false_until_main_verified`

## Evidence boundary

This roadmap reconciles Ture against GitHub `main` commit
`2409b4587f1fc88838a680fbf253963c28163b33`, tree
`5c54eb026fd5da9b10d76699586a7298408cb1d8`, observed on 2026-08-11.
GitHub current-main evidence, exact provider readbacks, authorized database
readbacks and executable source outrank this document.

The reconciliation base is the ordinary merge of PR #91. Its six delivered
paths are byte-identical to reviewed head `875c82e1…`; exact-main push run
`31492511225` completed successfully with every required step passing. PR #45
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

At this delivery branch's evidence boundary, formal status is **9 of 15
required gates verified (60.0%)**, with no partial credit. Milestone A remains
incomplete. This revision records the already corroborated MA-09 closure; it
does not raise the numerator or establish any new provider behavior.

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
| MA-11 release/deployment identity | known_gap |
| MA-12 repository CI workflow/check execution | verified_current |
| MA-13 branch protection/required-check policy | unknown_current |
| MA-14 disciplined worktree/release ownership | verified_current |
| MA-15 production behavioral smoke | unknown_current |

**MA-09 closure record:** adversarial review of initial head `723712c4…` found
one fail-closed defect: ten provenance metadata mutations were accepted.
Remediation head `875c82e1…` rejected all ten, passed the repository oracle
21/21 and rejected an exhaustive 69 leaf mutations, 14 unexpected object keys
and 4 array extensions. PR run `31492155553`, ordinary merge `2409b458…`,
byte-identical main reachability and exact-main run `31492511225` all
succeeded. A later generated-type, command, project, schema, receipt or
source-binding change makes MA-09 subject to reconciliation again.

ACTION 668H remains `closed_holding` under operator decision
`D_keep_execution_gate_closed`. R7-R1 is `completed_rejected`, permanently
consumed, completed prefix `0` and non-retry. No usable GT2 authorization,
alternative trust root or native bootstrap exists.

Source containment, the authenticated server-owned API boundary, canonical
governance, repository CI and repository-pinned generated-types provenance are
verified on current main. MA-09 does not prove production RLS, migration
application, ordinary-role behavior, tenant ownership, deployment identity or
runtime behavior.

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
  MA-09 generated-types provenance now present on main. Production and
  provider behavior remain separately gated.
- Track 4's Action 655 foundation is merged via PR #84, default-off and
  runtime-unwired. It provides no database, broker, production or milestone
  authority.
- Track 5's canonical governance history is current through merged PR #91.
  This bounded two-path successor makes its verified closure explicit. PR #45
  remains an overlapping stale historical non-authority and is not modified.
- Track 6's five additive Session V2 paths are merged via PR #85, default-off
  and runtime-unwired. Runtime, tenancy, database, broker and production
  authority remain false.
- PR #88 delivered the portable catalog/migration evidence contract, PR #89
  delivered the repository CI workflow, PR #90 delivered canonical governance
  currentness and PR #91 delivered MA-09 provenance plus its fail-closed
  remediation.

Future main-moving work must remain serialized behind this bounded governance
reconciliation until its review decision is known. Any later main mover
requires fresh source, provider and policy identity reconciliation.

## Current provider and release boundary

The latest authenticated Netlify readback identifies published production
deploy `6a65fd2faae50b00088893fa` at commit
`f578dd5bedeccb0f95b58c4f15ba2cb3dc1eea33`, with builds stopped. A fresh
GitHub comparison places current main 142 commits ahead of that production
commit. This is an unresolved release-identity contradiction, not completion.
No deployment is authorized by this reconciliation.

The current checksum-bound Supabase V5 receipt binds project
`ekdyopdrrkphlrsilyoo` to a complete read-only catalog snapshot: 1 schema,
30 tables, 645 columns, 30 primary keys, 17 foreign keys and 21 functions. It
also binds generated type output to SHA-256
`5a74e8de…`. The receipt was obtained as
`supabase_read_only_user` with transaction and default read-only enabled.
MA-09 pins the exact receipt, command, project, schema, CLI, source and
generated-output identities into repository source and verifies them
provider-free. It does not prove tenant-owner principal binding, ordinary
application-role RLS/Data API behavior, migration history/source parity or
production smoke; therefore MA-05, MA-06 and MA-08 remain gated while MA-09 is
`verified_current`.

GitHub branch-protection and ruleset endpoints both return HTTP 403 under the
current private-repository plan. MA-13 is therefore `unknown_current`, not
absent and not verified.

## Superseded assertions preserved for audit

- `eb79279d…` / `bc97dd2…`, `129b03d…` / `92d9cd4…`,
  `59f00b44…` / `64df5ff0…`, and `7749a726…` / `d6e00d31…` were valid
  earlier main/tree identities. They are now historical and superseded by
  `2409b458…` / `5c54eb02…`.
- PR #86's former Ready/unmerged state, PR #89's former Draft/unmerged state
  and PRs #90 and #91's former Draft delivery states are superseded by their
  respective merges. PR #91 is the current-main event.
- Earlier 126-, 135-, 137- and 139-commit production distances are superseded
  by the fresh 142-commit comparison. The published production identity itself
  is unchanged in the latest authenticated readback.
- Containment, authenticated API-boundary and CI were previously
  `unknown_current`. Current main evidence closes MA-03, MA-04 and MA-12
  only; production behavior remains unproven.
- MA-02's pre-merge 7/15 state and MA-09's pre-closure 8/15 candidate state are
  superseded by verified closure at 9/15. This reconciliation grants no
  provider, database, migration, broker, release or production authority.
