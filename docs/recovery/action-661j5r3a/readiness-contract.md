# Action 661J.5R.3A PostgreSQL readiness contract

`action_661j5r3a_postgres_readiness_policy_rebuild_v1` is a bounded
state machine. It permits runtime identity capture and fixture setup only
after three consecutive successful probe cycles in this order:

1. the container is running;
2. `pg_isready` accepts the expected database and role;
3. `SELECT 1` succeeds through `psql`.

Any failed readiness or SQL probe resets the consecutive-success count.
The policy polls every 250 milliseconds, permits at most 120 attempts, and
has a 30,000 millisecond timeout. A container exit fails immediately. A
timeout or exit writes only a bounded, sanitized readiness diagnostic and
must not create scenario evidence, a record, a shard, or a persisted result.

The readiness receipt binds the policy version and digest, attempt count,
elapsed time, terminal reason, final probe state, and consecutive stable
probe count. Runtime identity capture, baseline construction, precondition
seeding, and migration execution occur after receipt verification.

The prior Action 661J.5R.3 Run A remains
`historical_partial_runtime_evidence`. It is not an input to the fresh R.3A
four-run aggregate.
