-- Read-only production preflight for the exact additive IF-4 evaluation-charter
-- migration. It returns aggregate object state only: never application rows,
-- recommendation contents, owner IDs or provider material.
begin read only;

with required_relations as (
  select unnest(array[
    'recommendation_learning_baseline_freezes',
    'recommendation_scan_runs'
  ]) as relation_name
), relation_state as (
  select required_relations.relation_name,
    to_regclass('public.' || required_relations.relation_name) is not null as exists
  from required_relations
), target_state as (
  select
    to_regclass('public.recommendation_evaluation_charters') is not null as charter_table_exists,
    exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'recommendation_learning_baseline_freezes'
        and column_name = 'evaluation_charter_fingerprint'
    ) as baseline_charter_column_exists
)
select
  bool_and(relation_state.exists) as required_relations_present,
  bool_or(not relation_state.exists) as prerequisite_missing,
  target_state.charter_table_exists,
  target_state.baseline_charter_column_exists,
  (
    bool_and(relation_state.exists)
    and not target_state.charter_table_exists
    and not target_state.baseline_charter_column_exists
  ) as eligible_for_exact_additive_apply
from relation_state
cross join target_state
group by target_state.charter_table_exists, target_state.baseline_charter_column_exists;

rollback;
