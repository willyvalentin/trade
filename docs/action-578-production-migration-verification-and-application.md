# Action 578 - Production Migration Verification and Controlled Application

## Result

- Verification timestamp: `2026-07-22T11:16:43Z`
- Production project: `ekdyop...ilyoo` (Trade)
- Repository production commit: `e362427ec91122bcdc46c8759b6cca1352cc0e2f`
- Final decision: `production_migrations_applied_and_verified`
- Recommended next action: Rerun Action 577 - Production Calendar and Readiness Verification.

## Preconditions

- Local branch: `codex/actions-572-574-durable-audit-credit-ledger-shadow-canary`
- Local Action 576 commit: `332683b961ad2877e1a13bcae8b8e8e1a8d2706c`
- Remote `main` includes Action 576 through merge `e362427ec91122bcdc46c8759b6cca1352cc0e2f`.
- `git diff --check`: passed.
- Existing unrelated worktree files retained: `deno.lock` and the Action 577 record.
- Canary repository schedule declaration: absent.
- Provider request required: false.

## Reviewed Migration Files

Each local migration exactly matched the deployed repository copy before application.

| Version | SHA-256 | Pre-application classification | Application result |
| --- | --- | --- | --- |
| `20260721000000_create_bounded_shadow_collector_proof_audits.sql` | `41c28175025da6203ef543e2ea9deb3e5e8eb184550839b5fb7a6c66489be61b` | `missing` | applied and verified |
| `20260721001000_create_continuous_intelligence_credit_ledger.sql` | `a80d81cdfa92432792f35100c93017934956d33eb43c2c4fadb7baa32a0858a2` | `missing` | applied and verified |
| `20260721002000_create_continuous_intelligence_shadow_canary_daily_claims.sql` | `91ced3871cfc9f4c8523e4c913aa0cce246ad641c9da95508352ae5514576d62` | `missing` | applied and verified |
| `20260722000000_create_continuous_intelligence_shadow_canary_readiness_probe.sql` | `714aca68ceb65cfd25d99c3ad04d6d7e4ef7b38bdd1ffce5162974571e09cde4` | `missing` | applied and verified |

The isolated Supabase migration workspace contained only the remote-history baseline migrations and the next approved migration at each step. Every dry run listed exactly one pending migration before it was applied.

## Post-application Schema Verification

- Audit table exists with RLS enabled, unique receipt identity, explicit constrained canary entry kind, and the no-effect constraint including `supabase_writes_executed = false`.
- Credit ledger table exists with RLS enabled, unique source receipt and ledger entry identities, constrained canary entry kind, zero-reserve protection, constrained reconciliation status, and policy values `377 / 57 / 320`.
- Daily-claims table exists with RLS enabled and lifecycle statuses constrained to `claimed`, `attempted`, `completed`, and `failed`.
- Capacity-claim definition uses an advisory transaction lock and enforces two runs and two estimated credits per UTC day.
- Begin-attempt and finalization definitions preserve exact claim, execution, fingerprint, and contract identity. Finalization permits only `attempted` to `completed` or `failed`.
- Lifecycle RPC execution is denied to `public`, `anon`, and `authenticated`, and granted to `service_role` only.
- The readiness probe exists, is `STABLE`, non-mutating, service-role-only, and denies public, anon, and authenticated execution.

## Readiness Probe

The authenticated production readiness route returned HTTP `200`:

- Route contract: `continuous_intelligence_shadow_canary_activation_readiness_v1`
- Schema probe: `available` / `continuous_intelligence_shadow_canary_readiness_probe_v1`
- All required tables and lifecycle RPCs: available
- Lifecycle permissions: safe
- All audit, ledger, and claim constraints: available
- Calendar: verified, current, covered, and ready
- Provider budget: configured, `within_budget`, one normal credit authorized, hard reserve preserved, zero reserve used
- Policy: `377 / 57 / 320`
- Readiness decision: `not_ready`

Remaining readiness blockers are configuration observations only:

- durable audit flag unresolved
- credit ledger flag unresolved
- canary flag unresolved
- kill switch unresolved
- deployment schedule state unverified
- duplicate schedule state unverified
- schedule frequency state unverified

No unknown production signal was treated as a safe or absent value.

## No Operational Writes Or Execution

- Audit operational rows after application: `0`
- Ledger operational rows after application: `0`
- Daily-claim operational rows after application: `0`
- Provider calls: none
- Canary execution, claim, begin-attempt, and finalize RPC invocation: none
- Audit or ledger operational writes: none
- Historical receipt import, flag change, kill-switch change, schedule change, commit, push, pull request, or application deployment: none

The only production mutations were the four explicitly authorized schema migrations.
