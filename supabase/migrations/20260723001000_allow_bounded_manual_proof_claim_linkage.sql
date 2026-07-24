alter table public.bounded_shadow_collector_proof_audits
  add column if not exists daily_claim_execution_id text null;

alter table public.bounded_shadow_collector_proof_audits
  add column if not exists policy_total_credits smallint not null default 377,
  add column if not exists policy_hard_reserve_credits smallint not null default 57,
  add column if not exists policy_normal_planned_max_credits smallint not null default 320;

alter table public.bounded_shadow_collector_proof_audits
  drop constraint if exists bounded_shadow_collector_proof_audits_claim_kind_check;

alter table public.bounded_shadow_collector_proof_audits
  add constraint bounded_shadow_collector_proof_audits_claim_kind_check
  check (
    (
      entry_kind = 'bounded_manual_proof'
      and (
        (
          daily_claim_id is null
          and daily_claim_status is null
          and daily_claim_execution_id is null
        )
        or (
          daily_claim_id is not null
          and daily_claim_status in ('completed', 'failed')
          and daily_claim_execution_id is not null
          and daily_claim_id = 'canary_claim_' || daily_claim_execution_id
          and length(daily_claim_execution_id) between 1 and 128
        )
      )
    )
    or (
      entry_kind = 'scheduled_shadow_collector_canary'
      and daily_claim_id is not null
      and daily_claim_status in ('claimed', 'attempted', 'completed', 'failed')
      and daily_claim_execution_id is null
    )
  );

alter table public.bounded_shadow_collector_proof_audits
  add constraint bounded_shadow_collector_proof_audits_policy_check
  check (
    policy_total_credits = 377
    and policy_hard_reserve_credits = 57
    and policy_normal_planned_max_credits = 320
  );

comment on column public.bounded_shadow_collector_proof_audits.daily_claim_execution_id is
  'Sanitized deterministic execution identity for terminal claim-linked bounded manual proof receipts only.';
