# Action 647: Execution Agent Deterministic Safety Replay

The replay harness in `lib/execution-agent-deterministic-safety-replay.ts` supplies a pure, fixture-driven regression surface for the execution decision path. It reuses the candidate picker, authority contract, Avanza handoff builder, lifecycle transition helper, and broker-result record mapper, while always supplying explicit timestamps and stable identifiers.

Priority remains stop loss, then target, then entries. Semi-automatic mode always terminates preparation at `waiting_for_manual_confirmation`; it never permits a real submission. Automatic mode additionally requires explicit replay authority and only models the `broker_order_submitting` state. The replay never performs a real submission.

Broker terminal fixtures are normalized into completed, failed, cancelled, or needs-review lifecycle outcomes. Duplicate confirmations create no second record or terminal audit event. Conflicting confirmations and cross-execution results fail closed. The fixture and result have a SHA-256 replay fingerprint, so identical normalized inputs reconstruct the same trace after a restart.

Every result exposes zero provider calls, database writes, real broker submissions, and real trade mutations. `trade_mutations` is simulation-only evidence. The harness has no HTTP, browser, storage, environment, database, provider, or broker adapter path. It is a local safety tool for future Avanza live-trial readiness, not an execution mechanism.
