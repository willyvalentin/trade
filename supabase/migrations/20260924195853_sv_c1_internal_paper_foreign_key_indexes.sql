-- SV-C1 staging follow-up: cover every composite child foreign key used by
-- the brokerless internal-paper entry lifecycle. The tables are inert and
-- empty until a separately reviewed account activation; these indexes are
-- additive and do not grant execution or browser access.

create index if not exists internal_paper_entry_intents_account_owner_idx
  on public.internal_paper_entry_intents (account_id, owner_user_id);
create index if not exists internal_paper_entry_intents_scan_owner_idx
  on public.internal_paper_entry_intents (decision_scan_run_id, owner_user_id);
create index if not exists internal_paper_entry_intents_snapshot_owner_idx
  on public.internal_paper_entry_intents (snapshot_id, owner_user_id);

create index if not exists internal_paper_fills_account_owner_idx
  on public.internal_paper_fills (account_id, owner_user_id);
create index if not exists internal_paper_fills_intent_account_owner_idx
  on public.internal_paper_fills (intent_id, account_id, owner_user_id);
create index if not exists internal_paper_fills_owner_idx
  on public.internal_paper_fills (owner_user_id);

create index if not exists internal_paper_positions_account_owner_idx
  on public.internal_paper_positions (account_id, owner_user_id);
create index if not exists internal_paper_positions_intent_account_owner_idx
  on public.internal_paper_positions (intent_id, account_id, owner_user_id);
create index if not exists internal_paper_positions_entry_fill_account_owner_idx
  on public.internal_paper_positions (entry_fill_id, account_id, owner_user_id);

create index if not exists internal_paper_ledger_account_owner_idx
  on public.internal_paper_ledger_entries (account_id, owner_user_id);
create index if not exists internal_paper_ledger_intent_account_owner_idx
  on public.internal_paper_ledger_entries (intent_id, account_id, owner_user_id);
create index if not exists internal_paper_ledger_fill_account_owner_idx
  on public.internal_paper_ledger_entries (fill_id, account_id, owner_user_id);
create index if not exists internal_paper_ledger_owner_idx
  on public.internal_paper_ledger_entries (owner_user_id);

comment on index public.internal_paper_entry_intents_account_owner_idx is
  'Covers the account/owner foreign key for brokerless internal-paper entry intents.';
comment on index public.internal_paper_fills_intent_account_owner_idx is
  'Covers the intent/account/owner foreign key for brokerless internal-paper fills.';
comment on index public.internal_paper_positions_intent_account_owner_idx is
  'Covers the intent/account/owner foreign key for brokerless internal-paper positions.';
comment on index public.internal_paper_ledger_intent_account_owner_idx is
  'Covers the intent/account/owner foreign key for brokerless internal-paper ledger rows.';
