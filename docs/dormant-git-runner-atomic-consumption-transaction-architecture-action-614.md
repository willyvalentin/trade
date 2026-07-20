# Action 614 - Atomic Consumption Transaction Architecture

## Purpose

This document defines the transaction architecture for the future dormant Git runner authority-consumption storage boundary. It complements the Action 614 schema plan and remains planning-only.

No SQL, RPC, migration, persistence adapter, runner, Git execution, process creation, process observation, repository inspection, runtime caller, or deployment is implemented.

## Current Approved Chain

The approved chain remains:

1. live resolver evidence;
2. dormant composition evidence;
3. immediate revalidation evidence;
4. dormant direct-spawn contract;
5. raw-completion neutralization and interpretation contracts;
6. read-only Git observation contracts;
7. compatibility policy;
8. pure dormant Git runner authority package;
9. Action 613 atomic-consumption plan.

Action 614 adds only a planned storage and transaction shape between the authority package and any future runner. No current caller can consume authority.

## Selected Transaction Boundary

Future storage uses a narrow SECURITY DEFINER transaction/RPC family over three tables:

- current package state;
- normalized stage state;
- append-only audit events.

The transaction boundary, not the caller, owns:

- registration uniqueness;
- active consumer ownership;
- stage order;
- transition version checks;
- expiry and revocation precedence;
- consumed-before-process-attempt recording;
- completion recording;
- aggregate finalization;
- audit append.

## Closed Operation Set

The only planned operations are:

| Operation | Purpose | Mutates |
| --- | --- | --- |
| `register_git_runner_authority_package` | Register one final-approved package and six stages. | package, stages, audit |
| `claim_git_runner_authority_consumer` | Claim exactly one active consumer. | package, audit |
| `consume_git_runner_authority_stage` | Consume one stage before process attempt. | package, stage, audit |
| `record_git_runner_authority_stage_completion` | Record accepted, failed, or ambiguous completion. | package, stage, audit |
| `terminalize_git_runner_authority_failure` | Terminalize deterministic failure not tied to normal completion. | package, audit |
| `terminalize_git_runner_authority_expiry` | Terminalize expiry. | package, audit |
| `revoke_git_runner_authority_package` | Terminalize revocation. | package, audit |
| `finalize_git_runner_authority_aggregate` | Mark all-stage aggregate consumed. | package, audit |
| `read_git_runner_authority_consumption_state` | Read immutable state for ambiguity resolution. | none |

No generic update-state, generic event append, raw SQL, direct table mutation, caller-selected enum, caller-selected stage list, or caller-provided command is planned.

## Transaction Invariants

Every mutating operation must execute as one database transaction:

1. validate closed request shape;
2. lock the target package row;
3. check immutable identity and fingerprint linkage;
4. check transition version;
5. check active consumer if required;
6. check expiry/revocation/terminal state;
7. check stage state if required;
8. update package and stage rows;
9. insert audit event;
10. return closed result.

If audit append fails, the state mutation must roll back. If state mutation fails, no audit success event may be appended.

## Registration Transaction

Inputs:

- package ID;
- package fingerprint;
- package contract identity/version;
- authority policy fingerprint;
- capability/policy identities;
- sequence/session/executable/revalidation/worktree/compatibility fingerprints;
- issued/expires timestamps;
- six stage grants and fingerprints;
- registration request fingerprint.

Predicates:

- package validates against the future pure transition contract;
- expiry is still valid where registration-time validation applies;
- no existing consumption key;
- no conflicting package ID;
- no conflicting package fingerprint;
- exactly six stage grants, indexes 0 through 5.

Effects:

- insert package row in `issued`;
- insert six stage rows in `pending`;
- insert audit event `package_registered`;
- return registration result.

No consumer is claimed and no authority is consumed.

## Claim Transaction

Predicates:

- package exists;
- state is `issued`;
- terminal is false;
- active consumer is null;
- not expired or revoked;
- transition version matches;
- package and policy fingerprints match.

Effects:

- set state `active`;
- set active consumer ID/fingerprint;
- set `claimed_at`;
- increment transition version;
- append audit event.

Second claims fail closed. There is no lease renewal or lock stealing in v1.

## Stage Consumption Transaction

Predicates:

- package exists and is non-terminal;
- active consumer matches;
- transition version matches;
- not expired or revoked;
- `retry_count = 0`;
- `fallback_attempted = false`;
- `in_flight_stage_index is null`;
- requested stage equals `next_consumable_stage_index`;
- stage row exists and is not consumed;
- stage grant fingerprint and stage authority fingerprint match;
- process-attempt and direct-spawn request fingerprints match the future pure transition request.

Effects:

- mark stage consumed;
- store consumed timestamp and consumer fingerprint;
- store stage-consumption, process-attempt, and direct-spawn request fingerprints;
- set `in_flight_stage_index` to the consumed stage;
- increment consumed count and decrement remaining count;
- keep `next_consumable_stage_index` at the same stage until completion;
- set state to `partially_consumed`;
- increment transition versions;
- append audit event.

If this transaction is not proven committed, the future runner must not start a process except through a separately reviewed read-back proof.

## Stage Completion Transaction

Predicates:

- package exists and is non-terminal;
- active consumer matches;
- transition version matches;
- requested stage equals `in_flight_stage_index`;
- stage is consumed;
- completion not already recorded;
- completion evidence fingerprint links to the exact stage-consumption fingerprint;
- interpretation evidence is present only where that stage expects it;
- outcome belongs to the closed completion union.

Accepted completion effects:

- record completion evidence;
- clear `in_flight_stage_index`;
- advance `next_consumable_stage_index`;
- update stage/package fingerprints;
- append audit event.

Deterministic failed completion effects:

- record failure reason;
- set state `failed_consumed`;
- terminalize package;
- append audit event.

Ambiguous completion effects:

- record ambiguity reason;
- set state `ambiguous_failed_consumed`;
- terminalize package;
- append audit event.

No completion path reopens a consumed stage.

## Aggregate Finalization Transaction

Predicates:

- active consumer matches;
- transition version matches;
- all six stages are consumed;
- all six completions are accepted;
- no in-flight stage remains;
- package not expired or revoked;
- aggregate evidence fingerprint links all stage completion fingerprints;
- authority package and policy fingerprints match.

Effects:

- store aggregate fingerprint;
- set state `consumed`;
- set terminal true;
- append audit event;
- return closed consumed result.

Aggregate finalization does not imply runtime readiness or Git compatibility authority.

## Expiry And Revocation Transactions

Expiry can terminalize only if the package is not already `consumed`, `failed_consumed`, `ambiguous_failed_consumed`, or `revoked`.

Revocation can terminalize only if exact package identity and transition version match and the package is not already terminal.

Both transitions append audit in the same transaction and return closed results. They do not delete package or stage rows.

## Failure And Ambiguity

Closed storage failures:

- `storage_operation_rejected`: operation is known not to have committed or known database validation failed;
- `storage_operation_ambiguous`: commit state is uncertain, for example response loss after possible commit;
- `storage_unavailable_rejected`: storage could not be reached before mutation;
- `storage_integrity_rejected`: schema, constraint, or read-back evidence contradicts expected shape.

Ambiguous results never permit blind retry. The only allowed continuation is read-back by immutable identifiers through `read_git_runner_authority_consumption_state`. If read-back is still ambiguous, authority remains unusable.

## Result Union Families

Registration:

- `registration_input_rejected`;
- `package_registered`;
- `duplicate_registration_rejected`;
- `package_identity_conflict_rejected`;
- `package_fingerprint_reuse_rejected`;
- `registration_expired_rejected`;
- `storage_operation_rejected`;
- `storage_operation_ambiguous`.

Claim:

- `claim_input_rejected`;
- `consumer_claimed`;
- `package_not_registered`;
- `package_terminal_rejected`;
- `package_expired`;
- `package_revoked`;
- `concurrent_consumer_rejected`;
- `stale_transition_rejected`;
- `storage_operation_rejected`;
- `storage_operation_ambiguous`.

Stage consumption:

- `stage_consumption_input_rejected`;
- `stage_consumed`;
- `wrong_consumer_rejected`;
- `stale_transition_rejected`;
- `stage_order_rejected`;
- `stage_already_consumed`;
- `stage_in_flight_rejected`;
- `package_terminal_rejected`;
- `package_expired`;
- `package_revoked`;
- `storage_operation_rejected`;
- `storage_operation_ambiguous`.

Completion:

- `stage_completion_input_rejected`;
- `stage_completion_accepted`;
- `stage_completion_failed_terminalized`;
- `stage_completion_ambiguous_terminalized`;
- `stage_not_consumed`;
- `stage_completion_already_recorded`;
- `stage_completion_linkage_rejected`;
- `package_terminal_rejected`;
- `storage_operation_rejected`;
- `storage_operation_ambiguous`.

Aggregate:

- `aggregate_input_rejected`;
- `aggregate_finalized_consumed`;
- `aggregate_prerequisite_rejected`;
- `wrong_consumer_rejected`;
- `stale_transition_rejected`;
- `package_expired`;
- `package_revoked`;
- `package_terminal_rejected`;
- `storage_operation_rejected`;
- `storage_operation_ambiguous`.

Read:

- `state_read`;
- `state_not_found`;
- `state_read_input_rejected`;
- `state_read_ambiguous`;
- `storage_operation_rejected`.

## Database Error Mapping

The future adapter must map database failures into closed reasons. It must not expose raw database details.

Known conflicts map to deterministic reasons before generic storage failure. Unknown database exceptions map to `storage_operation_rejected` unless commit state is uncertain, in which case they map to `storage_operation_ambiguous`.

## Fingerprint Propagation

Every request and result fingerprint must include:

- operation identity;
- schema identity/version;
- package ID/fingerprint;
- consumption key;
- authority policy fingerprint;
- transition version before and after;
- consumer fingerprint when applicable;
- stage index when applicable;
- stage and completion fingerprints when applicable;
- state before and after;
- status and reason;
- timestamp evidence;
- authority posture: no runtime activation, no authority expansion, no retry, no fallback, no TOCTOU elimination.

Changing any source-controlled policy, package, stage, consumer, transition, status, reason, or timestamp evidence must change the relevant fingerprint or reject validation.

## Privacy And Error Limits

Transaction inputs and outputs may include only approved identifiers, fingerprints, stage indexes, counts, states, reasons, and timestamps.

They must not include raw output, repository paths, porcelain paths, credentials, environment values, process handles, PIDs, SQLSTATE, constraint names, query text, stack traces, or unredacted internal errors.

## RLS And Function Posture

The future migration should use:

- RLS enabled on all tables;
- no anon/authenticated table policies;
- no direct client grants;
- SECURITY DEFINER functions with fixed search path and schema-qualified table references;
- no dynamic SQL;
- no string-built identifiers;
- no caller-selected enum/status/reason;
- no service-role client in pure modules;
- no runtime caller before separate review.

This posture is planning only and creates no database function in Action 614.

## Why This Does Not Authorize Runtime

The transaction contract only records future one-shot state. It does not create a runner, consume current authority, execute Git, inspect a repository, observe a process, or activate API/UI/runtime wiring.

A future consumed-stage record is a prerequisite for process creation, not process creation itself. Process creation remains a separate boundary requiring its own implementation and review.

## Exact Next Action

Action 615 - Implement Pure Atomic Dormant Git Authority Consumption Transition Contract.

The pure contract should model the closed states, requests, result unions, transition predicates, fingerprints, and privacy posture before any migration or database RPC is implemented.
