# Action 590 - Rejected Fingerprint Remediation

## Scope

Action 590 remediates only `A589-MED-001` against the uncommitted pure byte-oriented porcelain-status completion contract.

Finding: rejected result fingerprints did not bind the exact rejected overflow/truncation input flags because rejected results retained `evidence:null` and were fingerprinted over the closed result shape, selected reason, and authority posture only.

No Git status command was executed through production behavior. No process was created or observed. No porcelain records were interpreted. No paths or filenames were exposed. No repository-read authority was granted. No runner was implemented. No runtime/API/UI/runner path was activated. No credentials, environment, network, Avanza, trading, persistence, migration, deployment, commit, push, merge, or deploy behavior was added.

## Finding Matrix

| Finding | Previous state | Remediation | Status |
| --- | --- | --- | --- |
| `A589-MED-001` | Same selected rejection reason could produce the same result fingerprint for distinct overflow/truncation flags. | Added `rejectedInputEvidence` for safely summarized output-retention rejects and included it in the result fingerprint. | Remediated pending independent Action 591 re-review. |

## Previous Model

Rejected results used `status:"blocked_fail_closed"`, deterministic `reason` and `blockingReasons`, `evidence:null`, authority/runtime/live fields pinned false, and a result fingerprint over those fields. That preserved fail-closed behavior and privacy, but did not distinguish same-reason rejected states such as stdout overflow only versus stdout overflow plus truncation.

## New Safe Rejected-Input Evidence Model

Rejected overflow/truncation states now receive a safe `rejectedInputEvidence` object only after schema closure, identity, source linkage, lifecycle, primitive count/flag types, and authority/runtime posture are safe enough to summarize.

The summary binds validation stage, selected reason, overflow and truncation flags, validated stdout/stderr/combined counts, safe byte fingerprints where possible, lifecycle category, completion reason, source spawn/evidence/observation fingerprints, session, purpose, tool, platform, executable, argv, policy, worktree, sequence, and authority/runtime/live/TOCTOU posture.

It does not retain raw stdout/stderr hex payloads, paths, filenames, porcelain records, parser output, or repository-read authority. Early malformed inputs, malformed identity, malformed source linkage, unsafe lifecycle, unsafe authority posture, or malformed numeric fields keep `rejectedInputEvidence:null`.

## Byte Retention Policy

Valid rejected byte payloads are represented by SHA-256 fingerprints only. Malformed hex or count mismatch yields null safe byte fingerprints and null raw-output fingerprint. Raw hex is never copied into the rejected summary.

## Result Schema And Version Decision

The contract remains v1 because the package is still uncommitted and the change is an additive hardening of the unapproved rejected-result schema. The accepted result path remains semantically unchanged and has `rejectedInputEvidence:null`.

## Fingerprint Changes

The existing result fingerprint now includes `rejectedInputEvidence`. The new rejected-input fingerprint domain is domain-separated from accepted evidence and raw-output fingerprints. Fingerprints remain audit linkage only and grant no provenance or authority.

## Tests Added

The focused suite increased from 42 to 45 tests.

Added coverage proves same-reason overflow/truncation fingerprint differentiation, count and safe-byte-fingerprint binding without raw payload retention, early malformed input summary suppression, determinism, and deep freeze.

## Remaining Limitations

The contract remains pure and fixture-only. It does not parse porcelain records, inspect a repository, execute Git, observe a process, decide compatibility, or activate a runner. Action 591 must independently re-review this remediation before final approval.

## Validation

Initial validation:

- `./node_modules/.bin/tsc --noEmit`: passed after authorized worktree write for `tsconfig.tsbuildinfo`.
- Focused byte-completion suite: first sandbox run hit known Playwright `.last-run.json` `EPERM`; authorized rerun passed, 45 tests.

Final validation commands and counts are recorded in the Action 590 checkpoint and final report. The required migration-static suite remains limited by the pre-existing absence of `supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql`.

## Recommendation

Recommended next Action:

Action 591 - Independent Final Re-Review of Pure Byte-Oriented Porcelain Status Completion Rejected Fingerprint Remediation.

No deploy is recommended. A source-control checkpoint commit may be considered only after Action 591 independently approves the remediation and the complete diff has been manually inspected.
