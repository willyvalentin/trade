-- Draft: harden post-trade and execution persistence grants.
--
-- NO APPLY YET.
-- This migration file is a code artifact only and requires separate review
-- before it may be applied in any Supabase environment.
--
-- Scope:
-- - grant hardening only
-- - post-trade persistence tables
-- - execution audit persistence table
-- - no data writes
-- - no RLS weakening
-- - no permissive policies
-- - no runtime/API/Trade UI write path
--
-- Do not apply this migration until a separate no-apply review task approves
-- the least-privilege grant posture, rollback plan, and non-production
-- validation plan.

revoke all privileges on table public.execution_confirmation_evidence
  from anon, authenticated;

revoke all privileges on table public.execution_settlement_reviews
  from anon, authenticated;

revoke all privileges on table public.execution_cost_breakdowns
  from anon, authenticated;

revoke all privileges on table public.execution_deviation_reviews
  from anon, authenticated;

revoke all privileges on table public.execution_learning_candidates
  from anon, authenticated;

revoke all privileges on table public.execution_redacted_artifacts
  from anon, authenticated;

revoke all privileges on table public.execution_record_audit_events
  from anon, authenticated;

grant all privileges on table public.execution_confirmation_evidence
  to service_role;

grant all privileges on table public.execution_settlement_reviews
  to service_role;

grant all privileges on table public.execution_cost_breakdowns
  to service_role;

grant all privileges on table public.execution_deviation_reviews
  to service_role;

grant all privileges on table public.execution_learning_candidates
  to service_role;

grant all privileges on table public.execution_redacted_artifacts
  to service_role;

grant all privileges on table public.execution_record_audit_events
  to service_role;

comment on table public.execution_confirmation_evidence is
  'DRAFT/NO APPLY YET. Post-trade confirmation evidence remains RLS-protected. This grant-hardening draft removes anon/authenticated table privileges and preserves service_role/server-side capability only.';

comment on table public.execution_settlement_reviews is
  'DRAFT/NO APPLY YET. Post-trade settlement reviews remain RLS-protected. This grant-hardening draft removes anon/authenticated table privileges and preserves service_role/server-side capability only.';

comment on table public.execution_cost_breakdowns is
  'DRAFT/NO APPLY YET. Post-trade cost breakdowns remain RLS-protected. This grant-hardening draft removes anon/authenticated table privileges and preserves service_role/server-side capability only.';

comment on table public.execution_deviation_reviews is
  'DRAFT/NO APPLY YET. Post-trade deviation reviews remain RLS-protected. This grant-hardening draft removes anon/authenticated table privileges and preserves service_role/server-side capability only.';

comment on table public.execution_learning_candidates is
  'DRAFT/NO APPLY YET. Post-trade learning candidates remain RLS-protected and cannot auto-promote. This grant-hardening draft removes anon/authenticated table privileges and preserves service_role/server-side capability only.';

comment on table public.execution_redacted_artifacts is
  'DRAFT/NO APPLY YET. Redacted artifact metadata remains RLS-protected and stores no raw artifact content. This grant-hardening draft removes anon/authenticated table privileges and preserves service_role/server-side capability only.';

comment on table public.execution_record_audit_events is
  'DRAFT/NO APPLY YET. Execution audit events remain RLS-protected. This grant-hardening draft removes anon/authenticated table privileges and preserves service_role/server-side capability only.';

-- Grant-hardening approach:
-- - anon receives no table privileges for these persistence tables.
-- - authenticated receives no table privileges for these persistence tables.
-- - service_role retains server-side table capability for future gated server
--   flows only.
-- - RLS remains enabled by the prior migrations.
-- - No policies are created, altered, or dropped in this draft.
-- - Future scoped read/write policies require a separate design, review, and
--   apply gate.
--
-- Rollback notes:
-- - Test rollback in non-production before any production step.
-- - A rollback would need an explicit grant-restoration decision.
-- - Do not restore broad anon/authenticated privileges without a separate
--   approval gate and live catalog verification.
