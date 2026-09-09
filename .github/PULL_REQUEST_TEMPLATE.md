## Product outcome

<!-- Name MVP-01…06 (or the selected later release criterion). Describe the
user-visible failure before this change and the working behavior afterward.
For necessary infrastructure/security work, name the exact criterion it unblocks.
Source-only dependencies are not completed user features. -->

## Scope and budget

<!-- Smallest change, existing components reused, active-hour budget (normally
4–16), actual hours only if tracked, and remaining gap. A discovery slice is
capped at four hours. Do not create a parallel or static-only successor queue. -->

## Validation

<!-- Behavior check, exact tested revision and environment, relevant checks and
CI evidence. Distinguish local/preview/production verification. -->

## Effects and recovery

<!-- State any data, provider, broker, deployment or production effect, its
applicable authority, and rollback. Local development authorization is not a
blanket release permit. If this is docs-only, state that plainly. -->

## Delivery checklist

- [ ] This change serves the selected outcome in the active roadmap and ledger.
- [ ] Work uses an isolated branch from verified main and preserves unrelated work.
- [ ] The exact head/base and required checks satisfy the executable workflow and applicable protected merge policy.
- [ ] Required review findings are resolved; no check, provenance or protection bypass is used.
- [ ] Completion claims match the tested environment and remaining gaps are explicit.
- [ ] Any external or release effects have their applicable authorization and recovery evidence.

Use the active `docs/roadmap-operating-governance.md` and the current workflow.
The old GitHub Free/manual MA13 checklist is historical evidence, not a statement
of current repository protection. This template changes no CI or merge policy.
After delivery, record actual merge/CI evidence in the active ledger; deployment
claims additionally require the applicable deploy identity and smoke evidence.
