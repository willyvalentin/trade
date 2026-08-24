-- Action 666EJ — aggregate-only control-character provenance classification.
--
-- This query deliberately returns one boolean-only JSON document. It never
-- returns a recommendation, owner, field value, identifier, source text,
-- connection identifier, or credential. It classifies only the source-field
-- shape relevant to Action 666DE's control-character prohibition.

begin transaction isolation level repeatable read read only;

set local statement_timeout = '20s';
set local lock_timeout = '1s';
set local idle_in_transaction_session_timeout = '20s';
set local search_path = pg_catalog;
set local row_security = off;

with source_shape as (
  select
    bool_or(
      direction ~ '[[:cntrl:]]'
      or session_type ~ '[[:cntrl:]]'
      or status ~ '[[:cntrl:]]'
      or ticker ~ '[[:cntrl:]]'
      or coalesce(company_name, '') ~ '[[:cntrl:]]'
      or coalesce(confidence, '') ~ '[[:cntrl:]]'
      or coalesce(setup_type, '') ~ '[[:cntrl:]]'
      or coalesce(timeframe, '') ~ '[[:cntrl:]]'
    ) as categorical_control_character_present,
    bool_or(
      coalesce(invalidation, '') ~ '[[:cntrl:]]'
      or coalesce(reason_to_avoid, '') ~ '[[:cntrl:]]'
      or coalesce(thesis, '') ~ '[[:cntrl:]]'
    ) as narrative_control_character_present,
    bool_or(
      pg_catalog.regexp_replace(coalesce(invalidation, ''), E'[\\t\\n\\r]', '', 'g') ~ '[[:cntrl:]]'
      or pg_catalog.regexp_replace(coalesce(reason_to_avoid, ''), E'[\\t\\n\\r]', '', 'g') ~ '[[:cntrl:]]'
      or pg_catalog.regexp_replace(coalesce(thesis, ''), E'[\\t\\n\\r]', '', 'g') ~ '[[:cntrl:]]'
    ) as narrative_non_whitespace_control_character_present
  from public.recommendations
), classification as (
  select
    coalesce(categorical_control_character_present, false)
      as categorical_control_character_present,
    coalesce(narrative_control_character_present, false)
      as narrative_control_character_present,
    coalesce(narrative_non_whitespace_control_character_present, false)
      as narrative_non_whitespace_control_character_present
  from source_shape
)
select pg_catalog.jsonb_build_object(
  'contract_version', 'position_version_lineage_control_character_projection_provenance_reconciliation_v1',
  'transaction_read_only', current_setting('transaction_read_only') = 'on',
  'transaction_isolation', current_setting('transaction_isolation'),
  'row_security_fail_closed', current_setting('row_security') = 'off',
  'categorical_control_character_present', categorical_control_character_present,
  'narrative_control_character_present', narrative_control_character_present,
  'narrative_non_whitespace_control_character_present', narrative_non_whitespace_control_character_present,
  'legacy_narrative_preservation_candidate',
    narrative_control_character_present
    and not categorical_control_character_present
    and not narrative_non_whitespace_control_character_present,
  'explicit_data_quality_remediation_required',
    categorical_control_character_present
    or narrative_non_whitespace_control_character_present
)
from classification;

rollback;
