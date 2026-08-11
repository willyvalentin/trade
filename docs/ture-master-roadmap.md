# Ture Master Roadmap

**ACTION 652 — MA-02 canonical governance currentness delivery candidate.**

**Document status:** bounded two-path replacement based on current source,
provider and policy evidence. On its delivery branch it is not yet current-main
authority. It becomes the canonical roadmap only when this exact revision has
been independently reviewed, merged and verified as reachable from `main`.

`roadmap_completion_authority:false_until_main_verified`

## Evidence boundary

This roadmap reconciles Ture against GitHub `main` commit
`59f00b449e8e709ef859dc938eddeea70b8ba086`, tree
`64df5ff011042f96ca87eaf98e7c910f3836e2e2`, observed on 2026-08-11.
GitHub current-main evidence, exact provider readbacks, authorized database
readbacks and executable source outrank this document.

The reconciliation base is the ordinary merge of PR #89. Its workflow is
present on `main`, and the exact-main push run `31487699470` completed
successfully with all 317 tests passing. PR #45 remains open, Draft,
dirty/conflicting and `stale_historical_non_authority`; it overlaps both
governance paths and must remain unmodified.

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

At this delivery branch's evidence boundary, formal status remains **7 of 15
required gates verified (46.7%)**, with no partial credit. Milestone A is
incomplete. This revision targets 8/15 only after the MA-02 closure rule below
has been satisfied; branch-local or open-PR bytes do not raise the numerator.

| Gate | Current classification at delivery boundary |
| --- | --- |
| MA-01 remote main/source identity | verified_current |
| MA-02 canonical roadmap/ledger currentness | known_gap; this exact two-path revision is the closure candidate |
| MA-03 browser-to-Supabase source containment | verified_current |
| MA-04 authenticated server-owned API boundary source | verified_current |
| MA-05 tenant-owner principal binding | known_gap |
| MA-06 production RLS/Data API/ordinary-role behavior | unknown_current |
| MA-07 source migration inventory | verified_current |
| MA-08 production migration application/source parity | unknown_current |
| MA-09 generated-types parity/pinned provenance | known_gap |
| MA-10 catalog/migration evidence contract source | verified_current |
| MA-11 release/deployment identity | known_gap |
| MA-12 repository CI workflow/check execution | verified_current |
| MA-13 branch protection/required-check policy | unknown_current |
| MA-14 disciplined worktree/release ownership | verified_current |
| MA-15 production behavioral smoke | unknown_current |

**MA-02 closure rule:** an independent reviewer must approve this exact
two-file revision, merge it without widening scope, verify the merge on
`main`, and corroborate the exact-main CI result. Only then does MA-02 become
`verified_current` and the formal numerator become **8/15 (53.3%)**. A later
material state change makes currentness subject to reconciliation again.

ACTION 668H remains `closed_holding` under operator decision
`D_keep_execution_gate_closed`. R7-R1 is `completed_rejected`, permanently
consumed, completed prefix `0` and non-retry. No usable GT2 authorization,
alternative trust root or native bootstrap exists.

Source containment, the authenticated server-owned API boundary and repository
CI are verified on current main. This does not prove production RLS, migration
application, ordinary-role behavior, tenant ownership, generated-types
provenance, deployment identity or runtime behavior.

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
- Action 652 has delivered the source containment, authenticated server-owned
  boundary and catalog/migration evidence contract now present on main.
  Production and provider behavior remain separately gated.
- Track 4's Action 655 foundation is merged via PR #84, default-off and
  runtime-unwired. It provides no database, broker, production or milestone
  authority.
- Track 5 delivered the prior governance paths via merged PR #86. This bounded
  delivery candidate owns only `docs/ture-master-roadmap.md` and
  `docs/ture-current-state-ledger.md`. PR #45 remains an overlapping stale
  historical non-authority and is not modified.
- Track 6's five additive Session V2 paths are merged via PR #85, default-off
  and runtime-unwired. Runtime, tenancy, database, broker and production
  authority remain false.
- PR #88 delivered the portable catalog/migration evidence contract. PR #89
  delivered the repository CI workflow and is merged on current main.

Future main-moving work must remain serialized behind this bounded MA-02
delivery until its review decision is known. Any later main mover requires
fresh source, provider and policy identity reconciliation.

## Current provider and release boundary

The latest authenticated Netlify readback identifies published production
deploy `6a65fd2faae50b00088893fa` at commit
`f578dd5bedeccb0f95b58c4f15ba2cb3dc1eea33`, with builds stopped. A fresh
GitHub comparison places current main 137 commits ahead of that production
commit. This is an unresolved release-identity contradiction, not completion.
No deployment is authorized by this reconciliation.

The current checksum-bound Supabase V5 receipt binds project
`ekdyopdrrkphlrsilyoo` to a complete read-only catalog snapshot: 1 schema,
30 tables, 645 columns, 30 primary keys, 17 foreign keys and 21 functions. It
also binds generated type output to SHA-256
`5a74e8de…`. The receipt was obtained as
`supabase_read_only_user` with transaction and default read-only enabled.
It does not prove tenant-owner principal binding, ordinary application-role
RLS/Data API behavior, migration history/source parity or production smoke;
therefore MA-05, MA-06, MA-08 and MA-09 remain gated as classified above.

GitHub branch-protection and ruleset endpoints both return HTTP 403 under the
current private-repository plan. MA-13 is therefore `unknown_current`, not
absent and not verified.

## Superseded assertions preserved for audit

- `eb79279d…` / `bc97dd2…` and later
  `129b03d…` / `92d9cd4…` were valid earlier main/tree identities. They
  are now historical and superseded by `59f00b44…` / `64df5ff0…`.
- PR #86's former Ready/unmerged state and PR #89's former Draft/unmerged state
  are superseded by their respective merges. PR #89 is the current-main event.
- Earlier 126- and 135-commit production distances are superseded by the fresh
  137-commit comparison. The published production identity itself is unchanged
  in the latest authenticated readback.
- Containment, authenticated API-boundary and CI were previously
  `unknown_current`. Current main evidence closes MA-03, MA-04 and MA-12
  only; production behavior remains unproven.
- Action 652's former read-only preparation restriction and the later
  PR-serialization restriction are historical. This revision still grants no
  provider, database, migration, broker, release or production authority.
