# Action 542 - Immediate Pre-Spawn Revalidation Planning Gate

## Scope

Action 542 is a planning and approval-gate action only. It does not implement filesystem revalidation, does not invoke the live resolver, does not invoke the live composition adapter, and does not modify resolver or composition behavior.

## Approved Chain Checkpoint

The approved chain remains:

```text
server-only live resolver
  -> original object with private provenance
dormant server-only live composition adapter
  -> neutral non-authoritative metadata
pure fixture composition contract
```

The chain grants no spawn authority. `composition_complete` is structural evidence only.

## Revalidation Boundary Requirement

Before any future read-only CLI process spawn can be considered, a separate server-only immediate pre-spawn revalidation boundary must verify that the executable filesystem object still matches the initial resolver-approved evidence.

The future boundary must be dormant after implementation and must emit evidence only. It must not execute the executable and must not grant process-start permission.

## Fail-Closed Rules

The future boundary must fail closed for:

- missing file;
- non-regular file;
- symlink or indirect path type;
- changed `deviceId`, `inode`, `sizeBytes`, `mode`, or `modifiedTimeMs`;
- path mismatch;
- tool mismatch;
- platform mismatch;
- policy mismatch;
- purpose mismatch;
- session mismatch;
- stale or expired evidence;
- cloned, serialized, reconstructed, mutated, malformed, or cross-boundary evidence;
- unknown policy;
- unsupported tool;
- unsupported platform;
- filesystem errors;
- caller-supplied path, policy, filesystem primitive, dependency injection, environment source, config source, or metadata assertion.

## Mandatory Action 543 Constraints

Action 543 must include:

- server-only first import;
- production API closure;
- fixed canonical policy/path usage;
- no caller dependency injection;
- no PATH, env, or config trust source;
- `lstat` only;
- exact metadata comparison;
- regular-file requirement;
- symlink rejection;
- immutable non-authoritative evidence;
- private/original-object or session/fingerprint linkage where required;
- no authority;
- no spawn;
- no retry;
- no persistence;
- no runtime wiring;
- machine-independent tests through a non-production seam;
- static security review after implementation;
- independent final re-review after any remediation.

## Mandatory Review Gates

Future work must proceed through:

1. Action 543 implementation without activation.
2. Static/security review of the Action 543 implementation.
3. Remediation if any static/security blocker is found.
4. Independent re-review if remediation occurs.
5. Only after approval, a separate direct-spawn design gate.

## Absent Authority

Action 542 does not authorize:

- immediate pre-spawn revalidation implementation;
- process spawn;
- process observation;
- CLI execution;
- CLI-version collection;
- credentials;
- environment reads;
- network access;
- authorization consumption;
- runner/API/UI activation;
- Avanza interaction;
- order or position behavior;
- settlement retrieval;
- persistence;
- deployment.

## Decision

Decision: `post_trade_immediate_pre_spawn_revalidation_boundary_plan_ready`

Result status: `post_trade_immediate_pre_spawn_revalidation_action_542_planning_gate_completed`

Recommended next action: Action 543 - Implement Dormant Server-Only Immediate Pre-Spawn Revalidation Adapter.
