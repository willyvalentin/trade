# Action 590 Checkpoint - Rejected Fingerprint Remediation

## Scope

Action 590 remediated only `A589-MED-001`: rejected result fingerprints did not bind exact rejected overflow/truncation input flags.

No parser, Git runner, runtime/API/UI/runner wiring, credential, environment, network, Avanza, trading, persistence, migration, deployment, commit, push, merge, or deploy behavior was introduced.

## Files Created

- `docs/pure-byte-oriented-porcelain-status-completion-action-590-rejected-fingerprint-remediation.md`
- `docs/pure-byte-oriented-porcelain-status-completion-action-590-checkpoint.md`

## Files Modified

- `lib/post-trade-pure-byte-oriented-porcelain-status-completion-contract-core.ts`
- `tests/e2e/post-trade-pure-byte-oriented-porcelain-status-completion-contract.spec.ts`
- `docs/pure-byte-oriented-porcelain-status-completion-contract-action-586.md`
- `docs/pure-byte-oriented-porcelain-status-completion-action-588-review-remediation.md`
- `docs/ture-agent-dev-chat-3-continuation-summary.md`

## Remediation

Added safe `rejectedInputEvidence` for output-retention rejects after safe schema, identity, linkage, lifecycle, count/flag, and authority posture checks.

The rejected summary binds overflow/truncation flags, validated counts, safe byte fingerprints, source linkage, capability/purpose/argv, worktree/sequence identity, and authority/runtime/live/TOCTOU posture into a domain-separated rejected-input fingerprint. The final result fingerprint now includes that summary.

Accepted results keep `rejectedInputEvidence:null`. Early malformed, malformed identity, malformed source linkage, malformed numeric, or unsafe authority inputs keep `rejectedInputEvidence:null`.

## Privacy And Authority

Rejected summaries retain no raw stdout/stderr hex payload, no porcelain records, no paths, no filenames, no parser fields, no repository-read authority, no compatibility authority, and no runtime authority.

## Focused Tests

Focused suite before Action 590: 42 tests.

Focused suite after Action 590: 45 tests.

New coverage proves same-reason flag differentiation, count and safe-byte-fingerprint binding, malformed input summary suppression, determinism, deep freeze, and raw-payload privacy.

## Validation

- `./node_modules/.bin/tsc --noEmit`: passed after authorized worktree write for `tsconfig.tsbuildinfo`.
- Focused byte-completion suite: first sandbox run hit known Playwright `.last-run.json` `EPERM`; authorized rerun passed, 45 tests.
- Adjacent simple-observation, Apple Git-version parser, generic Git-version parser, dormant Git-version orchestrator, neutralization, raw-completion, and direct-spawn suites: 282 passed.
- Revalidation, dormant composition, pure composition, trusted resolver/security, and Action 533 suites: 756 passed.
- Broad dormant/process/credential/CLI/authorization suites excluding the known missing migration-static file: 1403 passed.
- Migration baseline limitation check: `supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql` remains absent.
- Scoped ESLint on changed TS/JS files: passed.
- `git diff --check`: passed.
- quiet `.env.local` diff guard: passed.
- `find docs -type f -size 0`: passed.
- Static rejected-result schema, validation-stage, rejected-input evidence, flag/count binding, byte-fingerprint retention, result-union consistency, fingerprint differentiation, semantic-validation, privacy/no-payload, determinism/immutability, authority/no-runtime, parser-separation, export-surface, runtime-reachability, and prohibited-operation reviews: passed for the changed production core. Repository-wide broad prohibited-operation scan showed unrelated existing app/API hits only.

## Decision

Decision:

`post_trade_pure_byte_oriented_porcelain_status_completion_rejected_fingerprint_finding_remediated_ready_for_re_review`

Result status:

`post_trade_pure_byte_oriented_porcelain_status_completion_action_590_remediation_completed`

Recommended next Action:

Action 591 - Independent Final Re-Review of Pure Byte-Oriented Porcelain Status Completion Rejected Fingerprint Remediation.
