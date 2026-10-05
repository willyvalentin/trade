-- Lossless full original daily/session archives for the unchanged charter.
-- Change ONLY the independently bounded decoded source limit (16 -> 32 MiB).
-- Stored JSONB remains <=8 MiB; owner/model/clock/RLS/ACL/immutability remain.
-- No data rewrite, new table, collection, publication or execution privilege.
-- Recovery: stop new finalization if needed; retain the 32 MiB reader after
-- any larger immutable result exists. Never shrink the decoder, rewrite old
-- capsules or delete evidence as a rollback. Restore writer limits separately.
begin;
set local lock_timeout = '3s';
set local statement_timeout = '30s';
do $capacity$
declare
  original_definition text;
  old_bound constant text := 'not between 1 and 16777216';
  new_bound constant text := 'not between 1 and 33554432';
begin
  original_definition := pg_catalog.pg_get_functiondef(
    'public.finalize_relative_plan_charter_result_v1(uuid,uuid,jsonb,text)'::regprocedure);
  if strpos(original_definition, old_bound) = 0 and
     (length(original_definition) - length(replace(original_definition, new_bound, ''))) / length(new_bound) = 1 then return; end if;
  if (length(original_definition) - length(replace(original_definition, old_bound, ''))) / length(old_bound) <> 1 or
     strpos(original_definition, new_bound) > 0 then
    raise exception 'relative_plan_original_source_capacity_definition_unexpected';
  end if;
  -- Exact single-literal replacement preserves every other existing guard,
  -- function attribute and grant. Unexpected deployed definitions fail closed.
  execute replace(original_definition, old_bound, new_bound);
end;
$capacity$;
notify pgrst, 'reload schema';
commit;
