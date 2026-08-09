# Ture Master Roadmap

**Action 669-R5-R5 external closed-holding governance remediation candidate.**

**Document status:** proposed current-main planning reference.

`roadmap_completion_authority:false`

## Evidence boundary

This roadmap preserves the product direction from the verified planning
lineage and reconciles it against current main
`eb79279d3abdb438d1997e2b06eefb2b6d775d77`. It is not self-proving
current-state authority. GitHub current-main evidence, exact provider
readbacks, authorized database readbacks, and executable source outrank this
document.

An open PR, a local preservation ref, a fixture, a test result, a default-off
source delivery, or a historical checkpoint is not a production-completion
claim. No milestone is complete unless its required source, release,
production, and behavior evidence has been separately corroborated.

Draft PR #45 overlaps both governance paths from historical head `6712d698…`.
It is `OPEN`, `CONFLICTING`, and classified as
`stale_historical_non_authority`. It cannot override current main or compete
as canonical roadmap/ledger authority, and any future delivery preflight must
preserve it unmodified while revalidating that classification.

## Product direction

Ture remains a privacy-first trading decision-support product. Capability may
not outrun data ownership, durable auditability, operator controls, or verified
production behavior. Advisory, shadow, semi-automatic, and automatic behavior
must remain visibly and operationally distinct.

## Stable milestones

### A. Secure Advisory Product

Recommendations and related user/trading data must be private, server-owned,
observable, and released through a reproducible identity gate.

Completion requires all of the following, not merely source delivery:

- containment with explicit production authorization and production role
  evidence;
- authenticated/server ownership with verified compatibility for affected
  flows;
- agreement among GitHub main, production commit, deployment assertion, and
  release preflight;
- generated types, migration allowlist, catalog/security checks, and CI gates;
- disciplined worktree and release ownership.

Milestone A remains the first incomplete milestone. ACTION 668H is now
`closed_holding` under operator decision `D_keep_execution_gate_closed`; this
is neither active blockage nor milestone completion. Containment,
authenticated API-boundary, release-identity and CI-gate states remain
`unknown_current` in this evidence chain. Action 652 is the next permitted
read-only preparation lane for the authenticated API boundary and browser
Supabase removal, but it may not become a main-mover until PR #86's governance
lifecycle is complete.

### B. Server-Owned Trade Management

Live trade state must have one server-owned model: deterministic exit decision
and observation contracts, a durable exit queue, transactional
recommendation-to-position handoff, and client projection rather than client
truth. It depends on Milestone A.

### C. Semi-Automatic Execution

One bounded operator-confirmed broker operation may be considered only after
the secure data boundary, server-owned trade-management core, canonical
execution identity, durable audit/record boundary, and prepare-only broker
checks are independently verified. A dry-run, mock, or preparation contract
is not execution authority.

### D. Closed-Loop Learning

Learning-policy changes require canonical outcome identity, horizon
deduplication, completed-data quality, frozen offline evaluation, and shadow
evidence. Any feedback must be reversible and attributable; it cannot change
live ranking without separate approval.

### E. Controlled Automatic Execution

This remains deferred. Detailed planning requires sufficient semi-automatic
production history with identity, broker, durable-evidence, exit-handling, and
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
- Track 2 is an open dependent stack (#54 -> #55 -> #57 -> #58 -> #60 -> #63
  -> #67 -> #72). Its next main-moving work must wait for a fresh reconciliation
  after the current governance candidate is independently reviewed and merged.
- Track 3 / ACTION 668H is `closed_holding` under current operator decision
  `D_keep_execution_gate_closed`. R7-R1 is `completed_rejected`, permanently
  consumed, completed prefix `0`, and non-retry. There are zero usable GT2
  execution authorizations and no alternative trust root or native bootstrap.
  The execution gate is closed; reopening requires new explicit operator
  authority. No Milestone A completion or main-move authority exists.
- Action 652 is the next permitted Milestone A roadmap lane, limited presently
  to its separately checksum-bound read-only preparation. It must not become a
  main-mover while PR #86 remains in its governance lifecycle and must not be
  coupled to GT2 execution, provider authority, Action 650 production apply,
  or another concurrent main-moving delivery.
- Track 4 has delivered a default-off Action 655 foundation via merged PR #84;
  it has no runtime wiring, database, broker, production, server-owned-core, or
  milestone-completion authority.
- Track 5 owns only this bounded two-document Action 669 reconciliation. Draft
  PR #45 is an overlapping stale historical non-authority and must remain
  unmodified. PR #86 must remain Draft until independent review and explicit
  transition authority are complete.
- Track 6 has completed source delivery via merged PR #85 at
  `eb79279d3abdb438d1997e2b06eefb2b6d775d77`. Its five additive Session V2 paths
  are default-off and runtime-unwired; Track 6 is closed/holding with runtime,
  tenancy, database, broker, production and milestone authority all false.

Future main-moving work must be serialized with a fresh current-main and
provider identity readback. A governance delivery must additionally reverify
PR #45 as stale/non-authority and preserve it unmodified. Provider windows and
migrations are separately authorized operations. Production remains at
`f578dd5…`, 126 commits behind current main; this is a release-gate
contradiction, not completion.
