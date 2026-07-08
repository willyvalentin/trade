# Post-Trade Supabase Staging Grant Posture Resolution Gate, No Write

## Summary

Purpose: define the no-write gate for resolving or explicitly accepting the broad grant posture warning found during staging read-only RLS catalog verification.

Result: grant posture hardening is recommended. No grant changes were made.

Decision: `post_trade_supabase_staging_grant_posture_hardening_recommended_no_write`.

## Target

- Environment: `ture-staging`
- Project ref / safe identifier: `pdvzyuhykomwfqyyztru`

Production remains blocked.

## Context

Action 427 completed read-only staging catalog verification.

Confirmed:

- expected baseline tables exist
- expected execution and post-trade tables exist
- RLS enabled state matches migration/static evidence
- legacy baseline policies match migration/static evidence
- post-trade persistence tables have RLS enabled and zero policies, matching future-gated policy design

Remaining warning:

- live grant metadata is broad for `anon`, `authenticated`, and `service_role`
- broad grants are present across inspected tables, including post-trade persistence tables

## Current Effective Safety Posture

For post-trade persistence tables:

- RLS is enabled
- zero policies exist
- client access remains deny-by-default where no applicable policies exist
- runtime/API/UI write paths remain inactive

This means broad grants do not currently authorize post-trade client access by themselves.

However, broad grants still deserve explicit resolution before write-path readiness because:

- future policies could accidentally expose more access than intended if broad grants remain
- broad grants make the authorization posture harder to reason about
- write-path activation should depend on least-privilege grants plus intentional policies, not RLS alone
- staging should model the intended safe posture before any future runtime or API write gate

## Resolution Options

### Option A: Accept Warning As Temporary Staging-Only Limitation

Allowed only under an explicit future acceptance checkpoint.

Would mean:

- broad grants are acknowledged as a known staging-only limitation
- production remains blocked
- runtime/API/UI write paths remain separately gated
- no grant changes occur

Use only if the team decides the staging warning is acceptable for a narrow future step.

### Option B: Create Future Grant-Hardening Migration Draft, No Apply

Recommended.

Would mean:

- create a source-controlled migration draft that narrows grants for post-trade and execution tables
- keep the draft no-apply until separately reviewed and approved
- keep RLS/policies aligned with future-gated write-path design
- do not apply to staging until a separate gate

This is the safest next option because it creates an auditable least-privilege plan without mutating staging.

### Option C: Further Read-Only Catalog Analysis

Use if grant details remain ambiguous.

Allowed future shape:

- read-only catalog metadata only
- no application row reads
- no grant changes
- no migration apply or repair
- no data writes

This is useful if a future hardening draft needs exact privilege details beyond Action 427 output.

## Recommended Next Option

Recommendation: Option B, create a future grant-hardening migration draft with no apply.

Rationale:

- Action 427 already provided enough evidence that broad grants exist.
- The current effective safety posture is blocked by RLS/no-policy for post-trade tables, but that is not the preferred long-term authorization shape.
- A no-apply draft keeps staging unchanged while making the proposed least-privilege posture reviewable.
- Write-path readiness should not advance until broad grant posture is hardened or explicitly accepted as a staging-only limitation.

## Pass Criteria Before Write-Path Readiness

Pass if one of these is true:

- grants are hardened through a reviewed and separately approved migration apply, with live catalog verification afterward
- the broad grant warning is explicitly accepted as a staging-only limitation under a separate approval gate, and remaining runtime/API/UI write-path gates stay separate

For a clean readiness path, preferred pass condition is:

- post-trade persistence grants are least-privilege
- policies are intentional and reviewed
- live catalog verification confirms expected grants and policies
- runtime/API/UI write paths remain separately approved

## Fail Criteria

Fail if:

- broad grants plus permissive policies allow unintended access
- broad grants are treated as acceptable without explicit staging-only acceptance
- any grant change is attempted without a reviewed migration and separate apply approval
- any inspection requires application table row reads
- any resolution requires staging data writes, production connection, migration repair, or runtime activation

## Forbidden In This Gate

Not run and still forbidden:

- grant changes
- `grant`
- `revoke`
- staging data write
- test row insertion
- migration apply
- migration repair
- migration marking
- `supabase db push`
- `supabase migration up`
- `supabase db reset`
- production DB connection
- production Supabase write
- API activation
- Trade UI execution
- runtime write-path activation
- browser automation
- Avanza login
- credential/session/BankID handling
- order action
- settlement retrieval
- live trade mutation
- live position mutation

## Safety Confirmation

Confirmed for Action 428:

- no production connection
- no production state touch
- no production Supabase write
- no staging data write
- no grant changes
- no test row insertion
- no migration apply
- no migration repair
- no migration marking
- no DB write
- no Supabase write
- no API activation
- no Trade UI execution
- no runtime write-path activation
- no Avanza/browser automation
- no credential/session/BankID handling
- no order behavior
- no settlement retrieval
- no real trade/broker data insertion
- no live trade mutation
- no live position mutation

## Final Decision

`post_trade_supabase_staging_grant_posture_hardening_recommended_no_write`
