create or replace function public.ci_hur_read_for_usage_accounting(
  p_historical_utc_day date
)
returns table (
  reconciliation_identity text,
  contract_version text,
  operation_type text,
  record_type text,
  target_claim_id text,
  source_execution_id text,
  source_audit_id text,
  authorization_id text,
  usage_units smallint,
  provider_request_count_for_reconciliation smallint,
  reason_code text,
  historical_utc_day date
)
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select
    reconciliation.reconciliation_identity,
    reconciliation.contract_version,
    reconciliation.operation_type,
    reconciliation.record_type,
    reconciliation.target_claim_id,
    reconciliation.source_execution_id,
    reconciliation.source_audit_id,
    reconciliation.authorization_id,
    reconciliation.usage_units,
    reconciliation.provider_request_count_for_reconciliation,
    reconciliation.reason_code,
    reconciliation.historical_utc_day
  from public.ci_hur_reconciliations as reconciliation
  where reconciliation.historical_utc_day = p_historical_utc_day
  order by reconciliation.reconciliation_identity;
$$;

revoke all on function public.ci_hur_read_for_usage_accounting(date)
from public, anon, authenticated;

grant execute on function public.ci_hur_read_for_usage_accounting(date)
to service_role;

comment on function public.ci_hur_read_for_usage_accounting(date) is
  'Action 642 bounded read-only service-role RPC for scheduled usage accounting. Returns reconciliation evidence for one UTC day without exposing direct table access or mutating state.';
