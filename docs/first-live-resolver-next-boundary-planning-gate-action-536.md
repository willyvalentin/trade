# Action 536 - First Live Resolver Next-Boundary Planning Gate

## Current Architecture

The approved first-live resolver is a dormant, server-only, `lstat`-only metadata boundary. It accepts reviewed resolver requests, closes over a frozen source-controlled policy, inspects only fixed absolute candidates for `git` and `supabase_cli`, and returns non-authoritative evidence. It is not wired into API, UI, runner, observer, spawn, credential, authorization, browser, Avanza, trading, order, position, or settlement paths.

## Dormant Module Graph

- Server-only adapter imports the pure resolver core and `node:fs/promises` for `lstat` only.
- Pure resolver core imports no filesystem or server-runtime primitive.
- No production application route or client/UI component imports the first-live resolver adapter.
- Existing observer, direct-spawn, credential, authorization, CLI-version, and preflight contracts remain separate and dormant.

## Trust Guarantees

- Resolver identity is distinct from fixture identity.
- Policy is source-controlled, frozen, deterministic, and macOS-only.
- Caller input cannot add, remove, reorder, or replace candidate paths.
- Synthetic metadata cannot impersonate live filesystem provenance.
- Live provenance is private to the server-only adapter and remains evidence-only.
- Resolver success does not issue spawn authority, runner authority, credential authority, observer authority, authorization-consumption authority, or trading authority.

## Remaining Absent Capabilities

- No live process observer.
- No live direct-spawn driver.
- No live credential-source adapter.
- No read-only CLI version evidence collection.
- No staging-preflight composition layer that can run.
- No authorization consumption.
- No process timeout or termination behavior.

## Candidate Boundary Comparison

| Option | Risk | Dependencies | Value | Dormant Possible | Assessment |
| --- | --- | --- | --- | --- | --- |
| A. Live scoped macOS process observer | Medium | Future process/PID model | Useful for future containment but observes only after spawn exists | Yes | Premature before spawn authority and process lifecycle are designed. |
| B. Live direct-spawn driver | High | Resolver evidence, authorization, observer, timeout, termination | Required for CLI version collection | Partly | Too much authority for the immediate next step; needs a design gate first. |
| C. Live credential-source adapter | High | Authorization, secret handling, cleanup | Not needed for current `git --version` or `supabase --version` operations | Yes | Defer; introduces unnecessary credential risk. |
| D. Read-only CLI version evidence collector | High if live, low if metadata-only | Requires direct spawn for real collection | Directly valuable | Metadata-only only | Do not implement live collector until spawn boundary exists and is reviewed. |
| E. Dormant staging-preflight composition layer | Low to medium | Resolver evidence and future boundary outputs | Useful for sequencing and invariants | Yes | Safest next planning/design target because it adds no new live authority. |

## Recommended Next Action

Action 537 - Design Dormant First-Live Read-Only Staging Preflight Composition Contract.

This next action should be design-only or metadata-only. It should define how resolver, future observer, future direct-spawn, future credential, authorization, timeout, termination, and CLI-version evidence will compose without implementing any new live behavior.

## Required Preconditions

- Preserve Action 535X approval scope.
- Keep resolver dormant and unwired.
- Do not add process spawn, CLI execution, credential access, observer activation, runner activation, API/UI wiring, network access, Avanza behavior, order behavior, position behavior, settlement behavior, or deployment.
- Preserve one-shot and no-retry semantics.
- Preserve explicit TOCTOU revalidation requirement before any future spawn.

## Required Future Security Reviews

- Static/security review of the dormant composition contract.
- Separate design gate for live direct-spawn before any CLI version collection.
- Separate implementation gate for live direct-spawn.
- Separate static/security review for live direct-spawn.
- Separate controlled validation gate before any process execution.

## Explicit Non-Authorizations

This planning gate does not authorize process spawn, CLI execution, CLI version collection, credentials, environment reads, network access, observer activation, runner activation, API/UI activation, browser automation, Avanza interaction, order behavior, position behavior, settlement retrieval, staging execution, production execution, or deployment.

## Commit And Deploy Recommendation

No deploy is recommended for Action 536. A source-control checkpoint commit may be considered only after the complete Action 534-536 diff has been manually inspected.
