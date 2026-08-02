# Action 667M.5J — Diagnostic replay foundation freeze and independent review

Action 667M.5J freezes the diagnostic foundation from the 20-session raw
admission through the real offline market-context replay. It performs no new
normalization or replay and does not copy external candle or replay data into
Git.

## Frozen scope

The freeze binds 29 repository artifacts and two external artifact roots:

- M.5F raw admission, 2,420,049-record reconciliation, receive-lag evidence,
  documentation, and regression;
- M.5G sale-condition decision, diagnostic all-reported-trades candle policy,
  fixtures, documentation, evidence, and regression;
- M.5H normalization contract, fixtures, implementation, TypeScript/Python
  tests, documentation, and evidence;
- M.5I schedule, replay implementation, tests, documentation, and evidence;
- the two authoritative 2026 XNYS calendar artifacts;
- the exact v1/v2 evaluator, strict-instant, threshold, inactive bridge, and
  replay-core dependencies exercised by M.5I.

Every repository path is bound by SHA-256 and historical Git status. External
data remains outside Git and is bound by manifest SHA, inventory digest,
complete-tree digest, lineage digest, artifact count, and file permissions.

## Independent review

The 21 review dimensions are approved. The review confirms:

- one disposition for each of 2,420,049 records and zero lineage gaps;
- duplicate records remain distinct raw identities and are never silently
  removed;
- 1,120 missing minutes remain explicit gaps with no forward fill;
- diagnostic candles cannot claim official or canonical OHLCV;
- sale-condition semantics remain unavailable;
- the two-second watermark remains provisional and empirically unvalidated;
- all 60 decisions use finalized candles and exclude later candles/sessions;
- eleven-sector breadth remains `not_full_market_breadth`;
- evidence strength remains ordinal and non-probabilistic;
- v1/v2 parity is 60/60;
- no outcome, P&L, performance, canonical, database, provider, or live path is
  active.

## Findings

No blockers or major findings were identified.

- H-001, minor, carried from M.5H: a three-record read-only decoder API probe
  preceded the complete M.5H hash preflight. It created no normalized artifact,
  and all raw hashes remained unchanged.
- J-001, minor: external replay producer metadata names the stacked base commit
  while the replay runner was an uncommitted worktree artifact. Exact runner
  and evaluator bytes are nevertheless losslessly bound by M.5I evidence and
  the M.5J freeze. The producer `git_commit` field must not be used alone as the
  executable source identity.

Neither finding is remediated in this Action.

## Verification

- Relevant K–M.5J Playwright regression: 218 passed, 0 failed, including the
  existing cross-timezone child-process matrices.
- M.5J scoped regression: 7 passed, 0 failed.
- M.5H pure Python aggregation tests: 4 passed, 0 failed. The system Python did
  not have the optional `databento_dbn` modules installed, so the pure tests
  used non-executing in-memory import stubs. No decoder call, installation,
  normalization, or raw-data read occurred.
- TypeScript, scoped ESLint, JSON parity, and `git diff --check`: passed.

## Decision

The foundation is ready for a separate local checkpoint Action. This does not
authorize canonical binding, live ranking, new normalization, replay,
performance evaluation, provider activity, commit, push, PR, or deployment.
