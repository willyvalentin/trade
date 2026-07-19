# Action 568 - Dormant Neutralization-to-Git-Interpretation Orchestration Planning Gate

## Scope

Action 568 is a documentation, architecture, and approval-gate action only. It does not implement orchestration, does not modify the neutralization adapter, raw-completion contract, Git-version parser, direct-spawn adapter, revalidation adapter, resolver, composition layer, runtime, API, UI, runner, credentials, Avanza, trading, persistence, or deployment behavior.

No product-chain executable was run. No Git version or preflight command was executed by production code. No process was created, observed, controlled, or terminated by production code. No raw completion was neutralized by a new orchestrator. No Git version was returned by an orchestrator.

## Current Approved Chain

The approved sequence through Action 567 is:

```text
server-only live resolver
  -> dormant live composition
  -> immediate revalidation
  -> fixed dormant direct spawn
  -> original production-valid spawn result
  -> dormant server-only neutralization
  -> approved pure raw-completion evidence
  -> approved pure Git-version interpretation contract
```

Current separation remains explicit:

- neutralization and interpretation are not orchestrated;
- the Git parser has no live caller;
- no live Git version has been returned by an orchestrator;
- no compatibility decision exists;
- no runtime caller exists;
- no deployment authority exists;
- `observedLiveProcess:false` remains required in pure evidence;
- `toctouEliminated:false` remains required.

## Orchestration Trust Problem

The future boundary must solve a narrow sequencing and provenance problem. It must accept only the exact original production-valid direct-spawn result, pass that original object to the approved one-shot neutralization adapter, and invoke the pure Git-version interpretation contract only after successful neutralization produces parser-eligible raw completion evidence.

The orchestrator must never clone, serialize, persist, spread, reconstruct, unwrap, or inspect the source before neutralization. It must not pass direct-spawn results, live provenance markers, process handles, caller stdout, caller version strings, parser options, caller grammar, or normalization settings to the parser.

The future boundary must distinguish four closed outcomes:

- neutralization rejected;
- neutralization accepted but interpretation not attempted;
- neutralization accepted and interpretation rejected;
- neutralization accepted and interpretation accepted.

All outcomes grant no authority.

## Ordering

Only this order is permitted:

```text
original source
  -> one-shot neutralization
  -> validated pure raw completion
  -> pure Git interpretation
```

Rejected architectures include interpretation before neutralization, direct stdout inspection inside the orchestrator, parser calls with reconstructed evidence, concurrent neutralization and parsing, retry after any failure, best-effort interpretation, and fallback to caller-provided versions.

Sequencing is security-relevant because the neutralizer owns original-object provenance and one-shot source consumption. The parser is intentionally pure and must see only approved raw-completion evidence, never live direct-spawn authority or caller-controlled output.

## Source Eligibility

Options reviewed:

| Option | Assessment | Decision |
| --- | --- | --- |
| A. Accept every source state supported by neutralization and attempt parser for all accepted raw results. | Maximizes coverage but lets the parser become the main eligibility filter for states the orchestrator can reject earlier. | Rejected as wider than needed. |
| B. Accept only source states capable of becoming parser-eligible zero-exit evidence. | Narrowest parser path, but it duplicates neutralizer state logic before the provenance-owning consume step. | Rejected as too coupled to neutralizer internals. |
| C. Accept the original production-valid direct-spawn result, let neutralization decide source support, and invoke interpretation only for neutralized `process_created_normal_zero_exit`. | Preserves original-object provenance, keeps neutralizer first, and narrows parser reachability. | Approved planning baseline. |

Baseline: the future production API accepts only the exact original direct-spawn result. Neutralization decides whether the source state is supported. Interpretation is attempted only when the neutralized raw completion category is exactly `process_created_normal_zero_exit`. Other successfully neutralized categories return `interpretation_not_attempted`; non-zero, failure, signal, overflow, stream-error, encoding-error, malformed, and unsupported states must not reach the parser.

## Future Production API

Plan one server-only entry point accepting only:

- the original production-valid `FixedReadOnlyDirectSpawnResult`.

It must accept no raw completion object, neutralized evidence object, stdout, stderr, byte counts, version string, executable, argv, lifecycle category, session, purpose, platform, policy, timestamps, parser options, normalization options, compatibility rules, dependency injection, test mode, clock, or process handle.

Because the approved neutralization and interpretation stages are synchronous after the original direct-spawn result exists, the preferred future orchestrator API is synchronous.

## Result Model

The future result should be a closed deeply frozen union:

1. `neutralization_rejected`
2. `neutralization_succeeded_interpretation_not_attempted`
3. `neutralization_succeeded_interpretation_rejected`
4. `neutralization_succeeded_interpretation_accepted`

Each result must include:

- contract kind, version, and boundary identity;
- orchestration status;
- deterministic primary reason and reason list;
- source direct-spawn adapter identity and result/evidence/observation fingerprint linkage;
- neutralization status and reasons;
- raw-completion result/evidence fingerprints or null;
- interpretation attempted boolean;
- interpretation status and reasons or null;
- interpretation evidence fingerprint or null;
- parsed version or null;
- timestamp evidence model;
- `observedLiveProcess:false` for neutral structural evidence;
- `authority:"none"`;
- `toctouEliminated:false`;
- `runtimeActivated:false`;
- `compatibilityAuthorityGranted:false`;
- `deploymentAuthorityGranted:false`.

The preferred evidence model returns immutable fingerprint-linked references plus the immutable accepted interpretation evidence only when needed for auditability. It must not return original direct-spawn object references or process handles.

## Reason Model And Precedence

Closed future reasons:

- `input_rejected`;
- `production_provenance_rejected`;
- `already_consumed`;
- `neutralization_rejected`;
- `neutralization_internal_failure`;
- `raw_completion_ineligible_for_interpretation`;
- `interpretation_not_attempted`;
- `interpretation_rejected`;
- `interpretation_internal_failure`;
- `interpretation_accepted`;
- `source_linkage_rejected`;
- `raw_completion_linkage_rejected`;
- `interpretation_linkage_rejected`;
- `authority_rejected`;
- `runtime_claim_rejected`;
- `unexpected_internal_failure`.

Precedence:

1. input/API shape rejection;
2. production provenance rejection from the neutralizer;
3. already consumed;
4. neutralizer contract/source/linkage rejection;
5. neutralizer internal failure;
6. accepted neutralization with ineligible raw completion category;
7. parser linkage or authority rejection;
8. parser rejection;
9. parser internal failure;
10. parser acceptance.

No raw Node errors, stacks, paths, process details, stdout, stderr, or source output may appear in reasons.

## One-Shot Semantics

The orchestrator inherits the neutralizer's source consumption:

- first successful attempt consumes the original source;
- unsupported-state attempts consume the original source;
- mapping failure consumes the original source;
- raw-builder rejection consumes the original source;
- interpretation rejection does not allow re-neutralization;
- parser internal failure does not allow retry with altered settings;
- second orchestration with the same source returns a closed consumed result;
- near-simultaneous calls must yield at most one neutralization;
- no reset, replay, fallback, repair, cache, reusable capability, or reentrant retry is allowed.

Independent original source objects may be processed independently only if each carries its own private production provenance.

## Linkage And Fingerprints

The future orchestration result must bind:

- direct-spawn result fingerprint;
- direct-spawn evidence fingerprint;
- direct-spawn observation fingerprint;
- accepted revalidation lineage, as transitively represented through the direct-spawn result/evidence fingerprints;
- neutralization result fingerprint;
- pure raw-completion result and evidence fingerprints;
- raw stdout fingerprint from the parser evidence when interpretation is attempted;
- Git interpretation evidence/result fingerprints;
- parsed-version fingerprint when accepted;
- orchestration result fingerprint.

Every stage must bind session, purpose, tool, platform, policy, executable, argv, source timestamps, contract identities, and contract versions. A changed stage fingerprint must invalidate downstream orchestration evidence or force rejection. Fingerprints remain evidence only and grant no provenance or authority by themselves.

Action 572 clarification: the Action 569-571 orchestrator does not expose or independently verify a standalone revalidation fingerprint. Revalidation lineage is bound transitively through the verified direct-spawn result/evidence fingerprints and neutralizer/raw source-spawn linkage.

## Time Model

The preferred future time model is one internally captured server-only orchestration timestamp plus exact preservation of neutralization and parser timestamps. Callers must not supply time. Orchestration time must not refresh, extend, or repair source validity and must not create live or compatibility authority.

## Authority And Semantic Limits

The future orchestrator must grant no process creation, process observation, process control, termination, CLI execution, Git-version compatibility, credential, network, API, UI, runner, trading, Avanza, authorization-consumption, persistence, or deployment authority.

Even accepted Git-version interpretation means only that a privately verified original direct-spawn result was neutralized once and the resulting neutral pure output matched the strict parser grammar. It does not mean Git is currently available, the binary remains unchanged, the version is supported, the environment is safe, deployment is allowed, or TOCTOU was eliminated.

## Architecture Comparison

| Option | Assessment | Decision |
| --- | --- | --- |
| A. New dormant server-only orchestrator imports the neutralization adapter and pure Git parser. | Preserves provenance ownership, one-shot semantics, separation of concerns, and testability. Keeps runtime reachability closed. | Preferred. |
| B. Neutralization adapter internally invokes the Git parser. | Couples neutralization and parsing and weakens parser separation. | Reject. |
| C. Direct-spawn adapter directly invokes neutralization and parser. | Couples process creation, neutralization, and parsing; increases activation risk. | Reject. |
| D. Pure helper accepts a direct-spawn result. | Would move original-object provenance concerns into a pure contract. | Reject. |
| E. Generic pipeline accepting caller-provided stages. | Adds dependency injection and caller-selected authority. | Reject. |
| F. Runtime runner orchestration. | Premature runtime activation. | Reject. |

## Test Strategy

Future tests must not execute a real process. They should use existing approved source-isolated direct-spawn and neutralization harnesses without adding production mint/reset/injection hooks.

Required coverage:

- original source accepted;
- clone rejected;
- successful zero-exit neutralization then accepted interpretation;
- zero-exit neutralization then parser rejection;
- non-zero, spawn failure, signal, and overflow categories yield interpretation not attempted;
- unsupported source neutralization rejection;
- raw-builder rejection;
- interpretation rejection;
- interpretation internal failure where safely testable;
- second call rejected;
- concurrent calls allow at most one neutralization;
- parser invoked exactly once only when eligible;
- parser never invoked for ineligible categories;
- parser never receives live source;
- exact linkage and fingerprints;
- output deeply frozen;
- no original source reference;
- `authority:"none"`;
- no runtime reachability.

## Future Implementation Constraints

Any future implementation must use `import "server-only";` as the first effective import, expose one production entry point, accept the original direct-spawn object only, accept no raw evidence or parser input from callers, neutralize first, parse only exact zero-exit raw completion, perform no retry or fallback, inspect no stdout directly, create or observe no process, execute no Git command, evaluate no compatibility policy, use closed result and reason unions, preserve exact linkage, deep-freeze output, keep `authority:"none"`, preserve `observedLiveProcess:false` and `toctouEliminated:false`, add no runtime caller, add no production test hooks, and require independent static review, remediation if needed, final re-review, separate compatibility-policy planning, separate runtime activation approval, and separate deployment approval.

## Review Gates

1. Focused orchestration tests.
2. Server-only import review.
3. Production API closure review.
4. Original-object provenance review.
5. One-shot inheritance review.
6. Neutralization-first ordering review.
7. Parser-eligibility gating review.
8. Stage-linkage review.
9. Result-union consistency review.
10. Failure precedence review.
11. Timestamp review.
12. Authority review.
13. No-compatibility review.
14. Export-surface review.
15. Runtime-reachability review.
16. Prohibited-operation review.
17. Independent static security review.
18. Remediation and final re-review.
19. Separate compatibility-policy planning.
20. Separate runtime activation approval.
21. Separate deployment approval.

## Explicit Non-Authorizations

Action 568 does not authorize orchestration implementation, process creation, process observation, process control, termination, Git execution, live Git-version collection, direct stdout parsing in a server adapter, parser runtime activation, compatibility evaluation, credentials, environment reads, network access, Supabase access, Avanza, trading, order, position, settlement, persistence, API/UI/runner wiring, deployment, commit, push, merge, staging readiness, execution readiness, or production readiness.

## Recommended Next Action

Action 569 - Implement Dormant Server-Only Neutralization-to-Git-Interpretation Orchestrator.

The implementation must remain dormant and test-only reachable.

## Commit And Deploy

No deploy is recommended for Action 568. No commit, push, merge, or deployment was performed.

## Decision

Decision: `post_trade_dormant_neutralization_to_git_interpretation_orchestration_boundary_plan_ready`

Result status: `post_trade_dormant_neutralization_to_git_interpretation_orchestration_action_568_planning_gate_completed`
