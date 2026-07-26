# Action 659B: Forward-Recovery Artifact and Evidence

## Status

`action_659b_recovery_artifact_implemented` is a local-only implementation
result. It does not authorize production execution, create a backup, or alter
the recovery conclusion from Action 659.

## Scope

The recovery module is deliberately limited to a known post-containment drift:
one or more of the 19 contained tables has disabled RLS or an incorrect table
ACL for `PUBLIC`, `anon`, `authenticated`, or `service_role`, while every other
security-critical containment contract remains intact.

It resets each target table to the same server-only contract as Action 650:

- `PUBLIC`, `anon`, and `authenticated` have no table privileges;
- `service_role` has only `SELECT`, `INSERT`, `UPDATE`, and `DELETE`;
- RLS is enabled; and
- no browser-facing policy is introduced.

It is forward repair, not rollback. It does not restore business data, legacy
policies, browser access, historical grants, or a prior database state.

## Preconditions and aborts

The reviewed bundle obtains an advisory transaction lock and requires exact
Action 650 history (`20260724002000`, name, and six statements). It also
requires that the recovery history version `20260724003000` is absent.

The bundle aborts before mutation when a target table or owner is unknown, an
unallowlisted role has any direct table or column privilege on a target table,
an unallowlisted member inherits a runtime role, any policy exists, forbidden
history exists, the append-only function/trigger contract differs, or an
Action 652 transactional/login RPC contract differs. Explicit non-owner
column-level grants are outside this narrow repair contract and are rejected
before any change, so recovery cannot leave browser column access behind. The
table-ACL allowlist is only
the verified table owner, `PUBLIC`, `anon`, `authenticated`, and
`service_role`; an otherwise unknown role with no target-scope access is
permitted. The same inventory is exposed by the read-only recovery readback.
It also aborts when no documented ACL/RLS drift exists. It never uses `CREATE
OR REPLACE`, drops a trigger, or rewrites history.

Missing or altered append-only functions/triggers, policy drift, missing tables,
owner drift, Action 652 RPC drift, and any business-data incident are outside
this first module. They need separately named recovery modules and review.

## Execution authority

Only a separately authorized production recovery action may use
`scripts/action-659b-apply-20260724003000.sql`. That action must first capture
the read-only result from
`scripts/action-659b-production-recovery-readback.sql`, confirm the exact
documented drift, and stop after one transaction and its readback.

The migration source is
`supabase/migrations/20260724003000_repair_contained_trading_data_access_acl_rls.sql`.
The SQL Editor bundle, rather than a general migration command, is the reviewed
production execution path.

## Post-recovery evidence

The readback requires the containment history, all 19 tables, no policies,
server-only ACL/RLS state, append-only enforcement, and Action 652 RPC
contracts. A successful recovery history entry must contain exactly one
statement marker with the expected version and name.

## Action 659B.2 exact-allowlist amendment

Action 659C found that the earlier artifact checked only the named containment
tables, a function body substring, and the presence of three expected triggers.
It could therefore accept an extra public table, a semantically altered
append-only function, or an additional non-internal audit trigger.

The revised pre-mutation contract now:

- permits exactly the 19 containment tables plus the explicit Action 652G
  `application_login_abuse_buckets` exception among `public` ordinary or
  partitioned tables; unrelated schemas, system relations, extensions, views,
  and sequences are out of scope;
- verifies the append-only function's schema, zero-argument identity, owner,
  language, return type, invoker mode, volatility, strictness, parallel state,
  exact `search_path`, normalized body, and execute ACL; and
- permits only one non-internal trigger on each audit/event table, with the
  exact name, function, enabled state, row-level timing/event bitmask expected
  from Action 650. Internal system triggers remain permitted.

The focused disposable-Docker scenarios cover source and bundle rejection for
the three former gaps, plus no-false-positive cases for another schema,
whitespace-only function formatting, internal constraint triggers, and a
combined canonical ACL/RLS repair.

The Action 659B.2 artifacts are frozen at:

- recovery source: `bde7343841dddc2f36ebd9fe017422c9803ff594a310920b3235e42bc4c00229`
- SQL Editor bundle: `6de0fd3c18ebe3dd38fb7ae6a373436c3ba371b6e262c59767122649899742e2`
- readback: `6f52b987c938276b55af54fc1e0e051997ebc966c9200dfdb5cb1430b74b99df`

## Next validation

Action 659C must validate baseline to Action 650 to documented ACL/RLS drift to
Action 659B recovery in disposable PostgreSQL. It must prove atomic rollback,
history rollback, unknown-drift refusal, browser-denial preservation, digest
integrity, and deterministic readback states before any new production readiness
gate can be considered.

## Action 659B.1 hardening amendment

The original recovery accepted an explicit grant to an otherwise unknown role
because it inspected only `PUBLIC`, `anon`, `authenticated`, and `service_role`.
The recovery source and reviewed SQL Editor bundle now inventory the catalog
ACLs for every target relation and column before repair. Unknown table or column
grantees, and unknown members of a runtime role, abort the transaction before
`REVOKE`, `GRANT`, RLS changes, or recovery-history insertion. An unknown role
with no target-scope access remains valid. Explicit non-owner column ACLs for
known roles also abort because this narrow module repairs table-level ACL/RLS
drift only.

The revised local-only artifacts are frozen at:

- recovery source: `829b10e5a962a7524636aa5f5b571650b52ec0b7b189ca709fe53ddbbeae61c1`
- SQL Editor bundle: `a37b3851186b380f7c6e35f36d8776967cf6bf279a54e5294fd7996edd3cab71`
- readback: `502dc312dcbbab25ff3c906c13d68af6fa66e03b05885d4a039b11a427601745`

Action 659C must rerun its complete recovery round-trip and failure matrix
against these revised artifacts before any execution review.
