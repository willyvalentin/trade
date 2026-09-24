-- SV-C2 follow-up: cover every foreign key introduced by the durable exit
-- schema. This migration is additive and creates no account, runtime,
-- schedule, provider request, candidate publication or broker path.

set lock_timeout = '5s';
set statement_timeout = '60s';

create index internal_paper_exit_intents_owner_idx
  on public.internal_paper_exit_intents (owner_user_id);
create index internal_paper_exit_intents_account_owner_idx
  on public.internal_paper_exit_intents (account_id, owner_user_id);
create index internal_paper_exit_intents_position_account_owner_idx
  on public.internal_paper_exit_intents (
    position_id, account_id, owner_user_id
  );

create index internal_paper_exit_fills_owner_idx
  on public.internal_paper_exit_fills (owner_user_id);
create index internal_paper_exit_fills_account_owner_idx
  on public.internal_paper_exit_fills (account_id, owner_user_id);
create index internal_paper_exit_fills_position_account_owner_idx
  on public.internal_paper_exit_fills (
    position_id, account_id, owner_user_id
  );
create index internal_paper_exit_fills_intent_account_owner_idx
  on public.internal_paper_exit_fills (
    intent_id, account_id, owner_user_id
  );

create index internal_paper_ledger_exit_intent_account_owner_idx
  on public.internal_paper_ledger_entries (
    exit_intent_id, account_id, owner_user_id
  ) where exit_intent_id is not null;
create index internal_paper_ledger_exit_fill_account_owner_idx
  on public.internal_paper_ledger_entries (
    exit_fill_id, account_id, owner_user_id
  ) where exit_fill_id is not null;
