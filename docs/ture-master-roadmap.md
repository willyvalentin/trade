# Ture Master Roadmap

**Action 658B delivery candidate, frozen from Action 658A.**

**Document status:** proposed current-main planning reference.

`roadmap_completion_authority:false`

## Evidence boundary

This roadmap preserves the product direction from the verified historical
planning reference at commit `6712d698447677766d2d550ffcc0785a0c722d11`.
It is not self-proving current-state authority.  GitHub current-main evidence,
exact provider readbacks, authorized database readbacks, and executable source
outrank this document.

An open PR, a local preservation ref, a fixture, a test result, or a historical
checkpoint is not a production-completion claim.  No milestone is complete
unless its required source, release, production, and behavior evidence has
been separately corroborated.

## Product direction

Ture remains a privacy-first trading decision-support product.  Capability may
not outrun data ownership, durable auditability, operator controls, or verified
production behavior.  Advisory, shadow, semi-automatic, and automatic behavior
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

### B. Server-Owned Trade Management

Live trade state must have one server-owned model: deterministic exit decision
and observation contracts, a durable exit queue, transactional
recommendation-to-position handoff, and client projection rather than client
truth.  It depends on Milestone A.

### C. Semi-Automatic Execution

One bounded operator-confirmed broker operation may be considered only after
the secure data boundary, server-owned trade-management core, canonical
execution identity, durable audit/record boundary, and prepare-only broker
checks are independently verified.  A dry-run, mock, or preparation contract
is not execution authority.

### D. Closed-Loop Learning

Learning-policy changes require canonical outcome identity, horizon
deduplication, completed-data quality, frozen offline evaluation, and shadow
evidence.  Any feedback must be reversible and attributable; it cannot change
live ranking without separate approval.

### E. Controlled Automatic Execution

This remains deferred.  Detailed planning requires sufficient semi-automatic
production history with identity, broker, durable-evidence, exit-handling, and
operator-review evidence.  No legacy preview/no-op helper may bypass that
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

No migration is applied because a PR merges.  No provider build or deployment
is implied by this roadmap.

## Current planning allocation

- Track 1 is paused.
- Track 2 is an open dependent stack and must be reconciled before any future
  release action.
- Track 3 is closed after the verified PR #76 merge.
- Track 4 is a local Action 655 delivery candidate, not a delivered capability.
- Track 5 owns governance reconciliation only.
- Track 6 owns the reserved Action 657 external design/source foundation; it
  is not delivered by this roadmap.

Future main-moving work must be serialized with a fresh current-main and
provider identity readback.  Provider windows and migrations are separately
authorized operations.
