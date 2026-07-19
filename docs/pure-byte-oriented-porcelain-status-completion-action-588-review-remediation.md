# Action 588 - Byte-Oriented Porcelain Status Completion Review Remediation

## Summary

Action 588 remediated the single blocking Action 587 finding, `A587-MED-001`, against the uncommitted Action 586 pure byte-oriented porcelain-status completion contract.

The remediation is intentionally narrow:

- split overflow state flag reasons by stdout, stderr, and combined output;
- add one closed truncation reason, `truncated_output_rejected`;
- define deterministic precedence;
- add focused tests for single flags, combined precedence, and recomputed accepted-evidence forgeries.

No parser, Git runner, runtime/API/UI/runner wiring, credential, environment, network, Avanza, trading, persistence, deployment, commit, push, merge, or deploy behavior was added.

## Finding-To-Remediation Matrix

| Finding | Previous Behavior | Remediation | Tests |
| --- | --- | --- | --- |
| `A587-MED-001` | `stdoutOverflow`, `stderrOverflow`, `combinedOverflow`, and all truncation flags failed closed but collapsed to `stdout_overflow_rejected`. | `stdoutOverflow` maps to `stdout_overflow_rejected`; `stderrOverflow` maps to `stderr_overflow_rejected`; `combinedOverflow` maps to `combined_overflow_rejected`; any truncation flag maps to `truncated_output_rejected`. | Added focused cases for single flags, mixed flag precedence, and recomputed accepted-evidence forgeries. |

## Corrected Reason Mapping

- `stdoutOverflow:true` -> `stdout_overflow_rejected`
- `stderrOverflow:true` -> `stderr_overflow_rejected`
- `combinedOverflow:true` -> `combined_overflow_rejected`
- `stdoutTruncated:true`, `stderrTruncated:true`, or `combinedTruncated:true` -> `truncated_output_rejected`

`truncated_output_rejected` is a narrow output-retention reason. It is not a parser-level status-truncated reason and does not imply record parsing.

## Reason Precedence

The contract now uses this deterministic precedence:

1. schema, identity, and fingerprint shape;
2. capability, platform, tool, executable, exact argv;
3. source spawn and source linkage;
4. lifecycle, exit, signal, termination, retry, fallback;
5. authority, runtime, live, and TOCTOU claims;
6. stream and decoding-state errors;
7. stdout overflow;
8. stderr overflow;
9. combined overflow;
10. truncation;
11. stderr content;
12. hex grammar;
13. declared byte-count consistency;
14. accepted construction.

When multiple output-retention flags are present, the first reason in this order is the result reason and the first blocking reason. Examples:

- stdout + stderr overflow -> `stdout_overflow_rejected`;
- stderr + combined overflow -> `stderr_overflow_rejected`;
- combined overflow + truncation -> `combined_overflow_rejected`;
- truncation only -> `truncated_output_rejected`.

## Production Changes

Changed file:

- `lib/post-trade-pure-byte-oriented-porcelain-status-completion-contract-core.ts`

Changes:

- added closed reason `truncated_output_rejected`;
- updated `REASON_ORDER`;
- split overflow/truncation flag validation into precise reasons.

Unchanged:

- contract identity;
- exact argv;
- byte representation;
- byte limits;
- lifecycle model;
- source linkage;
- result-union shape except the narrow reason enum addition;
- authority posture;
- runtime reachability;
- export architecture.

## Focused Tests Added

Changed file:

- `tests/e2e/post-trade-pure-byte-oriented-porcelain-status-completion-contract.spec.ts`

Focused suite count:

- before: 33 tests;
- after: 42 tests.

Added coverage:

- stdout overflow only;
- stderr overflow only;
- combined overflow only;
- truncation only;
- stdout + stderr overflow precedence;
- stdout + combined overflow precedence;
- stderr + combined overflow precedence;
- all overflow flags precedence;
- truncation combined with each overflow class;
- recomputed accepted-evidence forgeries for the same cases.

Each focused case asserts blocked status, exact reason, no accepted evidence, no partial accepted stdout payload, `authority:"none"`, immutable output, and deterministic fingerprint.

## Fingerprint Impact

Rejected results retain no accepted evidence, but their final result fingerprint binds:

- selected deterministic reason;
- complete blocking reason list;
- result status;
- authority/runtime/live posture;
- null accepted evidence.

Action 590 addendum: Action 589 found this was insufficient for same-reason rejected overflow/truncation states. Action 590 adds safe `rejectedInputEvidence` for output-retention rejects and binds that summary into the final result fingerprint while still retaining no accepted evidence and no raw stdout/stderr hex payload.

Accepted evidence validation rejects recomputed forged evidence containing overflow or truncation flags even when fingerprints are recomputed. Fingerprint correctness remains necessary but insufficient.

## Result Union

The closed result union remains:

- `accepted_fixture_byte_oriented_porcelain_status_completion`;
- `blocked_fail_closed`.

No accepted overflow or truncation category was added. Rejected results retain `evidence:null` and no partial accepted byte payload. Action 590 adds rejected-input audit summaries for safe overflow/truncation rejects only; those summaries are not accepted evidence and do not include raw payload.

## Authority And Runtime

The remediation does not grant:

- repository-read authority;
- process authority;
- observer authority;
- CLI execution authority;
- compatibility authority;
- runtime authority;
- staging or deployment authority;
- credential or network authority.

No runtime/API/UI/runner path imports the contract.

## Remaining Limitations

This remediation does not finally approve the contract. It only prepares the Action 586/588 package for independent final re-review.

The contract still does not parse porcelain records, classify clean/dirty state, inspect repository paths, evaluate Git compatibility, execute Git, or provide runtime activation.

The unrelated migration baseline limitation remains: `supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql` is absent in this checkout.

## Validation

Validation was run as part of Action 588 and is summarized in the Action 588 checkpoint and final response.

## Re-Review Recommendation

Recommended next Action:

Action 589 - Independent Final Re-Review of Pure Byte-Oriented Porcelain Status Completion Reason Remediation.

## Commit / Deploy

No deploy is recommended. A source-control checkpoint commit may be considered only after Action 589 independently approves the remediation and the complete diff has been manually inspected.

## Decision

Decision:

`post_trade_pure_byte_oriented_porcelain_status_completion_action_587_finding_remediated_ready_for_re_review`

Result status:

`post_trade_pure_byte_oriented_porcelain_status_completion_action_588_remediation_completed`
