export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      application_login_abuse_buckets: {
        Row: {
          bucket_key: string
          failure_count: number
          updated_at: string
          window_expires_at: string
        }
        Insert: {
          bucket_key: string
          failure_count: number
          updated_at?: string
          window_expires_at: string
        }
        Update: {
          bucket_key?: string
          failure_count?: number
          updated_at?: string
          window_expires_at?: string
        }
        Relationships: []
      }
      bounded_shadow_collector_proof_audits: {
        Row: {
          actual_credits: number | null
          actual_credits_known: boolean
          authorization_consumed: boolean
          authorization_request_bound: boolean
          authorization_single_use: boolean
          build_marker: string
          candle_count: number | null
          confidence_changes: boolean
          contract_version: string
          created_at: string
          daily_claim_execution_id: string | null
          daily_claim_id: string | null
          daily_claim_status: string | null
          durable: boolean
          entry_kind: string
          estimated_credits: number | null
          execution_or_broker_actions: boolean
          execution_ready_reserve_consumed: boolean
          execution_status: string
          fallback_used: boolean | null
          first_candle_at: string | null
          generated_at: string
          hard_reserve_preserved: boolean
          id: string
          interval: string
          last_candle_at: string | null
          operator_authorization_verified: boolean
          persisted: boolean
          planner_allocated_credits: number | null
          planner_contract: string | null
          planner_demand_source: string | null
          planner_requested_credits: number | null
          planner_rest_layer: string | null
          planner_session: string | null
          planner_version: string | null
          planner_workload_class: string | null
          planner_workload_id: string | null
          policy_hard_reserve_credits: number
          policy_normal_planned_max_credits: number
          policy_total_credits: number
          primary_result_category: string
          process_local_only: boolean
          proof_executable_credits: number | null
          provider_attempt_occurred: boolean
          provider_credit_ceiling: number
          provider_metadata_status: string
          provider_request_count: number
          provider_response_structurally_valid: boolean | null
          provider_status_category: string | null
          ranking_changes: boolean
          rate_limited: boolean | null
          receipt_id: string
          recommendation_changes: boolean
          request_fingerprint: string
          requested_end: string
          requested_start: string
          retry_count: number | null
          safe_blocker_or_failure_category: string | null
          safe_operator_message: string
          scanner_changes: boolean
          schedule_changes: boolean
          shared_cache_mutated: boolean
          supabase_writes_executed: boolean
          ticker: string
          timeout_occurred: boolean
        }
        Insert: {
          actual_credits?: number | null
          actual_credits_known: boolean
          authorization_consumed: boolean
          authorization_request_bound: boolean
          authorization_single_use: boolean
          build_marker: string
          candle_count?: number | null
          confidence_changes: boolean
          contract_version: string
          created_at?: string
          daily_claim_execution_id?: string | null
          daily_claim_id?: string | null
          daily_claim_status?: string | null
          durable?: boolean
          entry_kind: string
          estimated_credits?: number | null
          execution_or_broker_actions: boolean
          execution_ready_reserve_consumed?: boolean
          execution_status: string
          fallback_used?: boolean | null
          first_candle_at?: string | null
          generated_at: string
          hard_reserve_preserved: boolean
          id?: string
          interval: string
          last_candle_at?: string | null
          operator_authorization_verified: boolean
          persisted?: boolean
          planner_allocated_credits?: number | null
          planner_contract?: string | null
          planner_demand_source?: string | null
          planner_requested_credits?: number | null
          planner_rest_layer?: string | null
          planner_session?: string | null
          planner_version?: string | null
          planner_workload_class?: string | null
          planner_workload_id?: string | null
          policy_hard_reserve_credits?: number
          policy_normal_planned_max_credits?: number
          policy_total_credits?: number
          primary_result_category: string
          process_local_only?: boolean
          proof_executable_credits?: number | null
          provider_attempt_occurred: boolean
          provider_credit_ceiling: number
          provider_metadata_status: string
          provider_request_count: number
          provider_response_structurally_valid?: boolean | null
          provider_status_category?: string | null
          ranking_changes: boolean
          rate_limited?: boolean | null
          receipt_id: string
          recommendation_changes: boolean
          request_fingerprint: string
          requested_end: string
          requested_start: string
          retry_count?: number | null
          safe_blocker_or_failure_category?: string | null
          safe_operator_message: string
          scanner_changes: boolean
          schedule_changes: boolean
          shared_cache_mutated: boolean
          supabase_writes_executed: boolean
          ticker: string
          timeout_occurred: boolean
        }
        Update: {
          actual_credits?: number | null
          actual_credits_known?: boolean
          authorization_consumed?: boolean
          authorization_request_bound?: boolean
          authorization_single_use?: boolean
          build_marker?: string
          candle_count?: number | null
          confidence_changes?: boolean
          contract_version?: string
          created_at?: string
          daily_claim_execution_id?: string | null
          daily_claim_id?: string | null
          daily_claim_status?: string | null
          durable?: boolean
          entry_kind?: string
          estimated_credits?: number | null
          execution_or_broker_actions?: boolean
          execution_ready_reserve_consumed?: boolean
          execution_status?: string
          fallback_used?: boolean | null
          first_candle_at?: string | null
          generated_at?: string
          hard_reserve_preserved?: boolean
          id?: string
          interval?: string
          last_candle_at?: string | null
          operator_authorization_verified?: boolean
          persisted?: boolean
          planner_allocated_credits?: number | null
          planner_contract?: string | null
          planner_demand_source?: string | null
          planner_requested_credits?: number | null
          planner_rest_layer?: string | null
          planner_session?: string | null
          planner_version?: string | null
          planner_workload_class?: string | null
          planner_workload_id?: string | null
          policy_hard_reserve_credits?: number
          policy_normal_planned_max_credits?: number
          policy_total_credits?: number
          primary_result_category?: string
          process_local_only?: boolean
          proof_executable_credits?: number | null
          provider_attempt_occurred?: boolean
          provider_credit_ceiling?: number
          provider_metadata_status?: string
          provider_request_count?: number
          provider_response_structurally_valid?: boolean | null
          provider_status_category?: string | null
          ranking_changes?: boolean
          rate_limited?: boolean | null
          receipt_id?: string
          recommendation_changes?: boolean
          request_fingerprint?: string
          requested_end?: string
          requested_start?: string
          retry_count?: number | null
          safe_blocker_or_failure_category?: string | null
          safe_operator_message?: string
          scanner_changes?: boolean
          schedule_changes?: boolean
          shared_cache_mutated?: boolean
          supabase_writes_executed?: boolean
          ticker?: string
          timeout_occurred?: boolean
        }
        Relationships: []
      }
      ci_hur_audits: {
        Row: {
          after_total_accounted_usage_units: number
          audit_identity: string
          authorization_id: string
          before_claim_capacity_units: number
          before_ordinary_ledger_units: number
          before_reconciliation_units: number
          created_at: string
          deployment_commit: string
          eligibility_classification: string
          expected_missing_usage_units: number
          final_result: string
          id: string
          persisted_at: string
          reason_code: string
          reconciliation_identity: string
          requested_by: string
          source_audit_id: string
          source_failure_classification: string
          target_claim_id: string
        }
        Insert: {
          after_total_accounted_usage_units: number
          audit_identity: string
          authorization_id: string
          before_claim_capacity_units: number
          before_ordinary_ledger_units: number
          before_reconciliation_units: number
          created_at?: string
          deployment_commit: string
          eligibility_classification: string
          expected_missing_usage_units: number
          final_result: string
          id?: string
          persisted_at: string
          reason_code: string
          reconciliation_identity: string
          requested_by: string
          source_audit_id: string
          source_failure_classification: string
          target_claim_id: string
        }
        Update: {
          after_total_accounted_usage_units?: number
          audit_identity?: string
          authorization_id?: string
          before_claim_capacity_units?: number
          before_ordinary_ledger_units?: number
          before_reconciliation_units?: number
          created_at?: string
          deployment_commit?: string
          eligibility_classification?: string
          expected_missing_usage_units?: number
          final_result?: string
          id?: string
          persisted_at?: string
          reason_code?: string
          reconciliation_identity?: string
          requested_by?: string
          source_audit_id?: string
          source_failure_classification?: string
          target_claim_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ci_hur_audits_authorization_id_fkey"
            columns: ["authorization_id"]
            isOneToOne: false
            referencedRelation: "ci_hur_authorizations"
            referencedColumns: ["authorization_id"]
          },
          {
            foreignKeyName: "ci_hur_audits_reconciliation_identity_fkey"
            columns: ["reconciliation_identity"]
            isOneToOne: true
            referencedRelation: "ci_hur_reconciliations"
            referencedColumns: ["reconciliation_identity"]
          },
          {
            foreignKeyName: "ci_hur_audits_source_audit_id_fkey"
            columns: ["source_audit_id"]
            isOneToOne: false
            referencedRelation: "bounded_shadow_collector_proof_audits"
            referencedColumns: ["receipt_id"]
          },
          {
            foreignKeyName: "ci_hur_audits_target_claim_id_fkey"
            columns: ["target_claim_id"]
            isOneToOne: false
            referencedRelation: "continuous_intelligence_shadow_canary_daily_claims"
            referencedColumns: ["claim_id"]
          },
        ]
      }
      ci_hur_authorizations: {
        Row: {
          authorization_id: string
          consumed_at: string | null
          consumed_reconciliation_identity: string | null
          contract_version: string
          created_at: string
          deployment_commit: string
          evidence_digest: string
          expected_claim_capacity_units: number
          expected_missing_usage_units: number
          expected_ordinary_ledger_units: number
          expected_reconciliation_units: number
          expires_at: string
          issued_at: string
          operation_type: string
          reason_code: string
          reconciliation_identity: string
          requested_by: string
          source_audit_id: string
          status: string
          target_claim_id: string
        }
        Insert: {
          authorization_id: string
          consumed_at?: string | null
          consumed_reconciliation_identity?: string | null
          contract_version?: string
          created_at?: string
          deployment_commit: string
          evidence_digest: string
          expected_claim_capacity_units: number
          expected_missing_usage_units: number
          expected_ordinary_ledger_units: number
          expected_reconciliation_units: number
          expires_at: string
          issued_at: string
          operation_type?: string
          reason_code?: string
          reconciliation_identity: string
          requested_by: string
          source_audit_id: string
          status?: string
          target_claim_id: string
        }
        Update: {
          authorization_id?: string
          consumed_at?: string | null
          consumed_reconciliation_identity?: string | null
          contract_version?: string
          created_at?: string
          deployment_commit?: string
          evidence_digest?: string
          expected_claim_capacity_units?: number
          expected_missing_usage_units?: number
          expected_ordinary_ledger_units?: number
          expected_reconciliation_units?: number
          expires_at?: string
          issued_at?: string
          operation_type?: string
          reason_code?: string
          reconciliation_identity?: string
          requested_by?: string
          source_audit_id?: string
          status?: string
          target_claim_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ci_hur_authorizations_source_audit_id_fkey"
            columns: ["source_audit_id"]
            isOneToOne: false
            referencedRelation: "bounded_shadow_collector_proof_audits"
            referencedColumns: ["receipt_id"]
          },
          {
            foreignKeyName: "ci_hur_authorizations_target_claim_id_fkey"
            columns: ["target_claim_id"]
            isOneToOne: false
            referencedRelation: "continuous_intelligence_shadow_canary_daily_claims"
            referencedColumns: ["claim_id"]
          },
        ]
      }
      ci_hur_reconciliations: {
        Row: {
          authorization_id: string
          authorized_at: string
          contract_version: string
          created_at: string
          deployment_commit: string
          evidence_digest: string
          historical_provider_event_at: string
          historical_utc_day: string
          id: string
          operation_type: string
          provider: string
          provider_request_count_for_reconciliation: number
          reason_code: string
          reconciled_at: string
          reconciliation_identity: string
          record_type: string
          source_audit_id: string
          source_execution_id: string
          target_claim_id: string
          usage_units: number
        }
        Insert: {
          authorization_id: string
          authorized_at: string
          contract_version: string
          created_at?: string
          deployment_commit: string
          evidence_digest: string
          historical_provider_event_at: string
          historical_utc_day: string
          id?: string
          operation_type: string
          provider: string
          provider_request_count_for_reconciliation?: number
          reason_code: string
          reconciled_at: string
          reconciliation_identity: string
          record_type?: string
          source_audit_id: string
          source_execution_id: string
          target_claim_id: string
          usage_units: number
        }
        Update: {
          authorization_id?: string
          authorized_at?: string
          contract_version?: string
          created_at?: string
          deployment_commit?: string
          evidence_digest?: string
          historical_provider_event_at?: string
          historical_utc_day?: string
          id?: string
          operation_type?: string
          provider?: string
          provider_request_count_for_reconciliation?: number
          reason_code?: string
          reconciled_at?: string
          reconciliation_identity?: string
          record_type?: string
          source_audit_id?: string
          source_execution_id?: string
          target_claim_id?: string
          usage_units?: number
        }
        Relationships: [
          {
            foreignKeyName: "ci_hur_reconciliation_audit_required"
            columns: ["reconciliation_identity"]
            isOneToOne: true
            referencedRelation: "ci_hur_audits"
            referencedColumns: ["reconciliation_identity"]
          },
          {
            foreignKeyName: "ci_hur_reconciliations_authorization_id_fkey"
            columns: ["authorization_id"]
            isOneToOne: true
            referencedRelation: "ci_hur_authorizations"
            referencedColumns: ["authorization_id"]
          },
          {
            foreignKeyName: "ci_hur_reconciliations_source_audit_id_fkey"
            columns: ["source_audit_id"]
            isOneToOne: false
            referencedRelation: "bounded_shadow_collector_proof_audits"
            referencedColumns: ["receipt_id"]
          },
          {
            foreignKeyName: "ci_hur_reconciliations_target_claim_id_fkey"
            columns: ["target_claim_id"]
            isOneToOne: true
            referencedRelation: "continuous_intelligence_shadow_canary_daily_claims"
            referencedColumns: ["claim_id"]
          },
        ]
      }
      continuous_intelligence_credit_ledger: {
        Row: {
          actual_credits_known: boolean
          confidence_changes: boolean
          contract_version: string
          created_at: string
          durable_audit_persisted: boolean
          entry_kind: string
          execution_or_broker_actions: boolean
          execution_ready_reserve_consumed: boolean
          execution_result_category: string
          generated_at: string
          hard_reserve_preserved: boolean
          id: string
          interval: string
          ledger_entry_id: string
          normal_capacity_credits_charged: number | null
          planner_allocated_credits: number | null
          planner_requested_credits: number | null
          policy_hard_reserve_credits: number
          policy_normal_planned_max_credits: number
          policy_total_credits: number
          proof_executable_credits: number | null
          provider: string
          provider_estimated_credits: number | null
          provider_reported_actual_credits: number | null
          provider_request_count: number
          provider_status_category: string | null
          ranking_changes: boolean
          recommendation_changes: boolean
          reconciled_credits: number | null
          reconciliation_source: string
          reconciliation_status: string
          request_fingerprint: string
          requested_end: string
          requested_start: string
          reserve_credits_charged: number
          safe_note_category: string
          scanner_changes: boolean
          schedule_changes: boolean
          shared_cache_mutated: boolean
          source_receipt_id: string
          supabase_writes_executed: boolean
          ticker: string
        }
        Insert: {
          actual_credits_known: boolean
          confidence_changes: boolean
          contract_version: string
          created_at?: string
          durable_audit_persisted: boolean
          entry_kind: string
          execution_or_broker_actions: boolean
          execution_ready_reserve_consumed?: boolean
          execution_result_category: string
          generated_at: string
          hard_reserve_preserved: boolean
          id?: string
          interval: string
          ledger_entry_id: string
          normal_capacity_credits_charged?: number | null
          planner_allocated_credits?: number | null
          planner_requested_credits?: number | null
          policy_hard_reserve_credits: number
          policy_normal_planned_max_credits: number
          policy_total_credits: number
          proof_executable_credits?: number | null
          provider: string
          provider_estimated_credits?: number | null
          provider_reported_actual_credits?: number | null
          provider_request_count: number
          provider_status_category?: string | null
          ranking_changes: boolean
          recommendation_changes: boolean
          reconciled_credits?: number | null
          reconciliation_source: string
          reconciliation_status: string
          request_fingerprint: string
          requested_end: string
          requested_start: string
          reserve_credits_charged?: number
          safe_note_category: string
          scanner_changes: boolean
          schedule_changes: boolean
          shared_cache_mutated: boolean
          source_receipt_id: string
          supabase_writes_executed: boolean
          ticker: string
        }
        Update: {
          actual_credits_known?: boolean
          confidence_changes?: boolean
          contract_version?: string
          created_at?: string
          durable_audit_persisted?: boolean
          entry_kind?: string
          execution_or_broker_actions?: boolean
          execution_ready_reserve_consumed?: boolean
          execution_result_category?: string
          generated_at?: string
          hard_reserve_preserved?: boolean
          id?: string
          interval?: string
          ledger_entry_id?: string
          normal_capacity_credits_charged?: number | null
          planner_allocated_credits?: number | null
          planner_requested_credits?: number | null
          policy_hard_reserve_credits?: number
          policy_normal_planned_max_credits?: number
          policy_total_credits?: number
          proof_executable_credits?: number | null
          provider?: string
          provider_estimated_credits?: number | null
          provider_reported_actual_credits?: number | null
          provider_request_count?: number
          provider_status_category?: string | null
          ranking_changes?: boolean
          recommendation_changes?: boolean
          reconciled_credits?: number | null
          reconciliation_source?: string
          reconciliation_status?: string
          request_fingerprint?: string
          requested_end?: string
          requested_start?: string
          reserve_credits_charged?: number
          safe_note_category?: string
          scanner_changes?: boolean
          schedule_changes?: boolean
          shared_cache_mutated?: boolean
          source_receipt_id?: string
          supabase_writes_executed?: boolean
          ticker?: string
        }
        Relationships: []
      }
      continuous_intelligence_shadow_canary_daily_claims: {
        Row: {
          claim_id: string
          contract_version: string
          created_at: string
          estimated_credits: number
          execution_id: string
          finalized_at: string | null
          id: string
          provider_attempted: boolean
          request_fingerprint: string
          source_receipt_id: string | null
          status: string
          utc_day: string
        }
        Insert: {
          claim_id: string
          contract_version?: string
          created_at?: string
          estimated_credits: number
          execution_id: string
          finalized_at?: string | null
          id?: string
          provider_attempted?: boolean
          request_fingerprint: string
          source_receipt_id?: string | null
          status?: string
          utc_day: string
        }
        Update: {
          claim_id?: string
          contract_version?: string
          created_at?: string
          estimated_credits?: number
          execution_id?: string
          finalized_at?: string | null
          id?: string
          provider_attempted?: boolean
          request_fingerprint?: string
          source_receipt_id?: string | null
          status?: string
          utc_day?: string
        }
        Relationships: []
      }
      continuous_intelligence_shadow_canary_manual_authorizations: {
        Row: {
          authorization_id: string
          budget_policy_version: string
          calendar_contract_version: string
          calendar_fingerprint: string
          canary_contract_version: string
          claim_contract_version: string
          claim_id: string
          consumed_at: string | null
          contract_version: string
          deployment_build_marker: string
          deployment_commit: string
          estimated_credits: number
          execution_id: string
          expires_at: string
          interval: string
          issued_at: string
          policy_hard_reserve_credits: number
          policy_normal_planned_max_credits: number
          policy_total_credits: number
          purpose: string
          request_fingerprint: string
          requested_end: string
          requested_start: string
          status: string
          ticker: string
          token_hash: string
        }
        Insert: {
          authorization_id: string
          budget_policy_version: string
          calendar_contract_version: string
          calendar_fingerprint: string
          canary_contract_version: string
          claim_contract_version: string
          claim_id: string
          consumed_at?: string | null
          contract_version?: string
          deployment_build_marker: string
          deployment_commit: string
          estimated_credits: number
          execution_id: string
          expires_at: string
          interval: string
          issued_at: string
          policy_hard_reserve_credits: number
          policy_normal_planned_max_credits: number
          policy_total_credits: number
          purpose?: string
          request_fingerprint: string
          requested_end: string
          requested_start: string
          status?: string
          ticker: string
          token_hash: string
        }
        Update: {
          authorization_id?: string
          budget_policy_version?: string
          calendar_contract_version?: string
          calendar_fingerprint?: string
          canary_contract_version?: string
          claim_contract_version?: string
          claim_id?: string
          consumed_at?: string | null
          contract_version?: string
          deployment_build_marker?: string
          deployment_commit?: string
          estimated_credits?: number
          execution_id?: string
          expires_at?: string
          interval?: string
          issued_at?: string
          policy_hard_reserve_credits?: number
          policy_normal_planned_max_credits?: number
          policy_total_credits?: number
          purpose?: string
          request_fingerprint?: string
          requested_end?: string
          requested_start?: string
          status?: string
          ticker?: string
          token_hash?: string
        }
        Relationships: []
      }
      continuous_intelligence_shadow_canary_manual_execution_leases: {
        Row: {
          authorization_id: string
          claim_id: string
          consumed_at: string | null
          contract_version: string
          estimated_credits: number
          execution_id: string
          execution_lease_id: string
          expires_at: string
          interval: string
          issued_at: string
          policy_hard_reserve_credits: number
          policy_normal_planned_max_credits: number
          policy_total_credits: number
          request_fingerprint: string
          requested_end: string
          requested_start: string
          status: string
          ticker: string
        }
        Insert: {
          authorization_id: string
          claim_id: string
          consumed_at?: string | null
          contract_version?: string
          estimated_credits: number
          execution_id: string
          execution_lease_id: string
          expires_at: string
          interval: string
          issued_at: string
          policy_hard_reserve_credits: number
          policy_normal_planned_max_credits: number
          policy_total_credits: number
          request_fingerprint: string
          requested_end: string
          requested_start: string
          status?: string
          ticker: string
        }
        Update: {
          authorization_id?: string
          claim_id?: string
          consumed_at?: string | null
          contract_version?: string
          estimated_credits?: number
          execution_id?: string
          execution_lease_id?: string
          expires_at?: string
          interval?: string
          issued_at?: string
          policy_hard_reserve_credits?: number
          policy_normal_planned_max_credits?: number
          policy_total_credits?: number
          request_fingerprint?: string
          requested_end?: string
          requested_start?: string
          status?: string
          ticker?: string
        }
        Relationships: [
          {
            foreignKeyName: "continuous_intelligence_shadow_canary_man_authorization_id_fkey"
            columns: ["authorization_id"]
            isOneToOne: true
            referencedRelation: "continuous_intelligence_shadow_canary_manual_authorizations"
            referencedColumns: ["authorization_id"]
          },
        ]
      }
      execution_agent_progress_events: {
        Row: {
          agent_run_id: string | null
          created_at: string
          event_type: string
          id: string
          intent_id: string | null
          is_dev: boolean
          is_mock: boolean
          lifecycle_event_type: string | null
          message: string | null
          metadata: Json
          request_id: string | null
          source_environment: string
          user_id: string | null
        }
        Insert: {
          agent_run_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          intent_id?: string | null
          is_dev?: boolean
          is_mock?: boolean
          lifecycle_event_type?: string | null
          message?: string | null
          metadata?: Json
          request_id?: string | null
          source_environment?: string
          user_id?: string | null
        }
        Update: {
          agent_run_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          intent_id?: string | null
          is_dev?: boolean
          is_mock?: boolean
          lifecycle_event_type?: string | null
          message?: string | null
          metadata?: Json
          request_id?: string | null
          source_environment?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "execution_agent_progress_events_agent_run_id_fkey"
            columns: ["agent_run_id"]
            isOneToOne: false
            referencedRelation: "execution_agent_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      execution_agent_runs: {
        Row: {
          action: string | null
          bridge_transport: string | null
          broker: string
          broker_result_present: boolean
          created_at: string
          error: string | null
          id: string
          intent_id: string | null
          is_dev: boolean
          is_mock: boolean
          metadata: Json
          mode: string | null
          position_id: string | null
          recommendation_id: string | null
          request_id: string
          request_summary: Json
          result_status: string | null
          result_summary: Json
          runner_name: string | null
          runner_version: string | null
          source_environment: string
          ticker: string | null
          updated_at: string
          user_id: string | null
          warnings: Json
        }
        Insert: {
          action?: string | null
          bridge_transport?: string | null
          broker?: string
          broker_result_present?: boolean
          created_at?: string
          error?: string | null
          id?: string
          intent_id?: string | null
          is_dev?: boolean
          is_mock?: boolean
          metadata?: Json
          mode?: string | null
          position_id?: string | null
          recommendation_id?: string | null
          request_id: string
          request_summary?: Json
          result_status?: string | null
          result_summary?: Json
          runner_name?: string | null
          runner_version?: string | null
          source_environment?: string
          ticker?: string | null
          updated_at?: string
          user_id?: string | null
          warnings?: Json
        }
        Update: {
          action?: string | null
          bridge_transport?: string | null
          broker?: string
          broker_result_present?: boolean
          created_at?: string
          error?: string | null
          id?: string
          intent_id?: string | null
          is_dev?: boolean
          is_mock?: boolean
          metadata?: Json
          mode?: string | null
          position_id?: string | null
          recommendation_id?: string | null
          request_id?: string
          request_summary?: Json
          result_status?: string | null
          result_summary?: Json
          runner_name?: string | null
          runner_version?: string | null
          source_environment?: string
          ticker?: string | null
          updated_at?: string
          user_id?: string | null
          warnings?: Json
        }
        Relationships: []
      }
      execution_lifecycle_events: {
        Row: {
          action: string | null
          created_at: string
          event_type: string
          id: string
          intent_id: string | null
          is_dev: boolean
          is_mock: boolean
          lifecycle_id: string | null
          message: string | null
          metadata: Json
          mode: string | null
          payload: Json
          position_id: string | null
          recommendation_id: string | null
          source: string
          source_environment: string
          state_from: string | null
          state_to: string | null
          ticker: string | null
          trigger_type: string | null
          user_id: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string
          event_type: string
          id?: string
          intent_id?: string | null
          is_dev?: boolean
          is_mock?: boolean
          lifecycle_id?: string | null
          message?: string | null
          metadata?: Json
          mode?: string | null
          payload?: Json
          position_id?: string | null
          recommendation_id?: string | null
          source?: string
          source_environment?: string
          state_from?: string | null
          state_to?: string | null
          ticker?: string | null
          trigger_type?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string
          event_type?: string
          id?: string
          intent_id?: string | null
          is_dev?: boolean
          is_mock?: boolean
          lifecycle_id?: string | null
          message?: string | null
          metadata?: Json
          mode?: string | null
          payload?: Json
          position_id?: string | null
          recommendation_id?: string | null
          source?: string
          source_environment?: string
          state_from?: string | null
          state_to?: string | null
          ticker?: string | null
          trigger_type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      execution_record_audit_events: {
        Row: {
          actor_id: string | null
          actor_type: string | null
          created_at: string
          duplicate_prevention_key: string | null
          event_payload: Json
          event_source: string
          event_status: string
          event_type: string
          evidence_payload: Json
          execution_record_id: string
          id: string
          idempotency_key: string
          metadata: Json
          occurred_at: string | null
          request_id: string | null
          schema_version: string
          source_fingerprint: string | null
          source_system: string
          trace_id: string | null
          writer_version: string | null
        }
        Insert: {
          actor_id?: string | null
          actor_type?: string | null
          created_at?: string
          duplicate_prevention_key?: string | null
          event_payload?: Json
          event_source: string
          event_status: string
          event_type: string
          evidence_payload?: Json
          execution_record_id: string
          id?: string
          idempotency_key: string
          metadata?: Json
          occurred_at?: string | null
          request_id?: string | null
          schema_version?: string
          source_fingerprint?: string | null
          source_system: string
          trace_id?: string | null
          writer_version?: string | null
        }
        Update: {
          actor_id?: string | null
          actor_type?: string | null
          created_at?: string
          duplicate_prevention_key?: string | null
          event_payload?: Json
          event_source?: string
          event_status?: string
          event_type?: string
          evidence_payload?: Json
          execution_record_id?: string
          id?: string
          idempotency_key?: string
          metadata?: Json
          occurred_at?: string | null
          request_id?: string | null
          schema_version?: string
          source_fingerprint?: string | null
          source_system?: string
          trace_id?: string | null
          writer_version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "execution_record_audit_events_execution_record_id_fkey"
            columns: ["execution_record_id"]
            isOneToOne: false
            referencedRelation: "execution_records"
            referencedColumns: ["id"]
          },
        ]
      }
      execution_records: {
        Row: {
          account_id: string | null
          audit_metadata: Json
          broker: string
          broker_confirmation_id: string | null
          broker_order_id: string | null
          broker_result_fingerprint: string | null
          broker_result_id: string | null
          captured_at: string | null
          confirmed_at: string
          created_at: string
          currency: string | null
          execution_mode: string
          execution_phase: string
          fees: number | null
          gross_amount: number | null
          handoff_session_id: string | null
          id: string
          idempotency_key: string
          instrument_id: string | null
          instrument_name: string | null
          instrument_type: string | null
          is_dev: boolean
          is_mock: boolean
          market: string | null
          metadata: Json
          net_amount: number | null
          planning_snapshot_id: string | null
          price: number
          quantity: number
          record_fingerprint: string
          side: string
          source_environment: string
          source_fingerprint: string
          source_position_id: string | null
          source_recommendation_id: string | null
          ticker: string
          updated_at: string
          user_id: string
          validation_errors: Json
          validation_status: string
          validation_warnings: Json
        }
        Insert: {
          account_id?: string | null
          audit_metadata?: Json
          broker: string
          broker_confirmation_id?: string | null
          broker_order_id?: string | null
          broker_result_fingerprint?: string | null
          broker_result_id?: string | null
          captured_at?: string | null
          confirmed_at: string
          created_at?: string
          currency?: string | null
          execution_mode: string
          execution_phase: string
          fees?: number | null
          gross_amount?: number | null
          handoff_session_id?: string | null
          id?: string
          idempotency_key: string
          instrument_id?: string | null
          instrument_name?: string | null
          instrument_type?: string | null
          is_dev?: boolean
          is_mock?: boolean
          market?: string | null
          metadata?: Json
          net_amount?: number | null
          planning_snapshot_id?: string | null
          price: number
          quantity: number
          record_fingerprint: string
          side: string
          source_environment: string
          source_fingerprint: string
          source_position_id?: string | null
          source_recommendation_id?: string | null
          ticker: string
          updated_at?: string
          user_id: string
          validation_errors?: Json
          validation_status: string
          validation_warnings?: Json
        }
        Update: {
          account_id?: string | null
          audit_metadata?: Json
          broker?: string
          broker_confirmation_id?: string | null
          broker_order_id?: string | null
          broker_result_fingerprint?: string | null
          broker_result_id?: string | null
          captured_at?: string | null
          confirmed_at?: string
          created_at?: string
          currency?: string | null
          execution_mode?: string
          execution_phase?: string
          fees?: number | null
          gross_amount?: number | null
          handoff_session_id?: string | null
          id?: string
          idempotency_key?: string
          instrument_id?: string | null
          instrument_name?: string | null
          instrument_type?: string | null
          is_dev?: boolean
          is_mock?: boolean
          market?: string | null
          metadata?: Json
          net_amount?: number | null
          planning_snapshot_id?: string | null
          price?: number
          quantity?: number
          record_fingerprint?: string
          side?: string
          source_environment?: string
          source_fingerprint?: string
          source_position_id?: string | null
          source_recommendation_id?: string | null
          ticker?: string
          updated_at?: string
          user_id?: string
          validation_errors?: Json
          validation_status?: string
          validation_warnings?: Json
        }
        Relationships: []
      }
      historical_candle_fetch_runs: {
        Row: {
          cache_hits: number
          cache_misses: number
          candle_count: number
          completed_at: string | null
          created_at: string
          error_type: string | null
          id: string
          interval: string
          metadata: Json
          provider: string
          provider_credits_estimated: number | null
          provider_credits_used: number | null
          request_type: string
          requested_at: string
          status: string
          ticker_count: number
          trading_day_end: string | null
          trading_day_start: string | null
        }
        Insert: {
          cache_hits?: number
          cache_misses?: number
          candle_count?: number
          completed_at?: string | null
          created_at?: string
          error_type?: string | null
          id?: string
          interval: string
          metadata?: Json
          provider: string
          provider_credits_estimated?: number | null
          provider_credits_used?: number | null
          request_type: string
          requested_at?: string
          status?: string
          ticker_count?: number
          trading_day_end?: string | null
          trading_day_start?: string | null
        }
        Update: {
          cache_hits?: number
          cache_misses?: number
          candle_count?: number
          completed_at?: string | null
          created_at?: string
          error_type?: string | null
          id?: string
          interval?: string
          metadata?: Json
          provider?: string
          provider_credits_estimated?: number | null
          provider_credits_used?: number | null
          request_type?: string
          requested_at?: string
          status?: string
          ticker_count?: number
          trading_day_end?: string | null
          trading_day_start?: string | null
        }
        Relationships: []
      }
      historical_candles: {
        Row: {
          adjusted: boolean
          cache_key: string
          close: number
          created_at: string
          duplicate_of_id: string | null
          fetch_run_id: string | null
          high: number
          id: string
          interval: string
          low: number
          metadata: Json
          open: number
          provider: string
          provider_request_id: string | null
          quality_flags: string[]
          raw_payload: Json | null
          session: string
          source: string
          ticker: string
          timestamp: string
          timezone: string
          trading_day: string
          updated_at: string
          validation_status: string
          volume: number | null
        }
        Insert: {
          adjusted?: boolean
          cache_key: string
          close: number
          created_at?: string
          duplicate_of_id?: string | null
          fetch_run_id?: string | null
          high: number
          id?: string
          interval: string
          low: number
          metadata?: Json
          open: number
          provider: string
          provider_request_id?: string | null
          quality_flags?: string[]
          raw_payload?: Json | null
          session?: string
          source?: string
          ticker: string
          timestamp: string
          timezone?: string
          trading_day: string
          updated_at?: string
          validation_status?: string
          volume?: number | null
        }
        Update: {
          adjusted?: boolean
          cache_key?: string
          close?: number
          created_at?: string
          duplicate_of_id?: string | null
          fetch_run_id?: string | null
          high?: number
          id?: string
          interval?: string
          low?: number
          metadata?: Json
          open?: number
          provider?: string
          provider_request_id?: string | null
          quality_flags?: string[]
          raw_payload?: Json | null
          session?: string
          source?: string
          ticker?: string
          timestamp?: string
          timezone?: string
          trading_day?: string
          updated_at?: string
          validation_status?: string
          volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "historical_candles_duplicate_of_id_fkey"
            columns: ["duplicate_of_id"]
            isOneToOne: false
            referencedRelation: "historical_candles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historical_candles_fetch_run_id_fkey"
            columns: ["fetch_run_id"]
            isOneToOne: false
            referencedRelation: "historical_candle_fetch_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      market_calendar_cache: {
        Row: {
          cache_date: string
          created_at: string | null
          day_type: string
          id: string
          is_open_day: boolean
          market_close_time: string | null
          market_open_time: string | null
          provider: string
          raw: Json | null
          reason: string | null
          updated_at: string | null
        }
        Insert: {
          cache_date: string
          created_at?: string | null
          day_type: string
          id?: string
          is_open_day: boolean
          market_close_time?: string | null
          market_open_time?: string | null
          provider?: string
          raw?: Json | null
          reason?: string | null
          updated_at?: string | null
        }
        Update: {
          cache_date?: string
          created_at?: string | null
          day_type?: string
          id?: string
          is_open_day?: boolean
          market_close_time?: string | null
          market_open_time?: string | null
          provider?: string
          raw?: Json | null
          reason?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      market_regime_snapshots: {
        Row: {
          created_at: string | null
          id: string
          qqq_above_ma20: boolean | null
          qqq_above_ma50: boolean | null
          qqq_change_5d_percent: number | null
          qqq_close: number | null
          qqq_ma20: number | null
          qqq_ma50: number | null
          regime: string
          spy_above_ma20: boolean | null
          spy_above_ma50: boolean | null
          spy_change_5d_percent: number | null
          spy_close: number | null
          spy_ma20: number | null
          spy_ma50: number | null
          summary: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          qqq_above_ma20?: boolean | null
          qqq_above_ma50?: boolean | null
          qqq_change_5d_percent?: number | null
          qqq_close?: number | null
          qqq_ma20?: number | null
          qqq_ma50?: number | null
          regime: string
          spy_above_ma20?: boolean | null
          spy_above_ma50?: boolean | null
          spy_change_5d_percent?: number | null
          spy_close?: number | null
          spy_ma20?: number | null
          spy_ma50?: number | null
          summary?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          qqq_above_ma20?: boolean | null
          qqq_above_ma50?: boolean | null
          qqq_change_5d_percent?: number | null
          qqq_close?: number | null
          qqq_ma20?: number | null
          qqq_ma50?: number | null
          regime?: string
          spy_above_ma20?: boolean | null
          spy_above_ma50?: boolean | null
          spy_change_5d_percent?: number | null
          spy_close?: number | null
          spy_ma20?: number | null
          spy_ma50?: number | null
          summary?: string | null
        }
        Relationships: []
      }
      position_updates: {
        Row: {
          action: string
          created_at: string | null
          explanation: string | null
          id: string
          new_stop: number | null
          owner_user_id: string
          position_id: string | null
          recommendation: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          explanation?: string | null
          id?: string
          new_stop?: number | null
          owner_user_id: string
          position_id?: string | null
          recommendation?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          explanation?: string | null
          id?: string
          new_stop?: number | null
          owner_user_id?: string
          position_id?: string | null
          recommendation?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "position_updates_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "position_updates_position_owner_fkey"
            columns: ["position_id", "owner_user_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id", "owner_user_id"]
          },
        ]
      }
      position_version_history: {
        Row: {
          durable_recommendation_version: number
          owner_user_id: string
          position_id: string
          position_state_digest: string
          position_state_frame: Json
          position_version: number
          recommendation_id: string
          recommendation_identity: string
          recommendation_normative_digest: string
          recorded_at: string
        }
        Insert: {
          durable_recommendation_version: number
          owner_user_id: string
          position_id: string
          position_state_digest: string
          position_state_frame: Json
          position_version: number
          recommendation_id: string
          recommendation_identity: string
          recommendation_normative_digest: string
          recorded_at?: string
        }
        Update: {
          durable_recommendation_version?: number
          owner_user_id?: string
          position_id?: string
          position_state_digest?: string
          position_state_frame?: Json
          position_version?: number
          recommendation_id?: string
          recommendation_identity?: string
          recommendation_normative_digest?: string
          recorded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "position_version_history_position_owner_fkey"
            columns: ["position_id", "owner_user_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id", "owner_user_id"]
          },
          {
            foreignKeyName: "position_version_history_recommendation_owner_fkey"
            columns: ["recommendation_id", "owner_user_id"]
            isOneToOne: false
            referencedRelation: "recommendations"
            referencedColumns: ["id", "owner_user_id"]
          },
        ]
      }
      positions: {
        Row: {
          closed_at: string | null
          company_name: string | null
          created_at: string | null
          current_stop: number | null
          entry_price: number
          execution_metadata: Json | null
          exit_notes: string | null
          exit_price: number | null
          id: string
          latest_recommendation: string | null
          owner_user_id: string
          pnl: number | null
          pnl_percent: number | null
          position_size: number | null
          r_multiple: number | null
          recommendation_id: string | null
          status: string
          target_1: number | null
          target_2: number | null
          ticker: string
        }
        Insert: {
          closed_at?: string | null
          company_name?: string | null
          created_at?: string | null
          current_stop?: number | null
          entry_price: number
          execution_metadata?: Json | null
          exit_notes?: string | null
          exit_price?: number | null
          id?: string
          latest_recommendation?: string | null
          owner_user_id: string
          pnl?: number | null
          pnl_percent?: number | null
          position_size?: number | null
          r_multiple?: number | null
          recommendation_id?: string | null
          status?: string
          target_1?: number | null
          target_2?: number | null
          ticker: string
        }
        Update: {
          closed_at?: string | null
          company_name?: string | null
          created_at?: string | null
          current_stop?: number | null
          entry_price?: number
          execution_metadata?: Json | null
          exit_notes?: string | null
          exit_price?: number | null
          id?: string
          latest_recommendation?: string | null
          owner_user_id?: string
          pnl?: number | null
          pnl_percent?: number | null
          position_size?: number | null
          r_multiple?: number | null
          recommendation_id?: string | null
          status?: string
          target_1?: number | null
          target_2?: number | null
          ticker?: string
        }
        Relationships: [
          {
            foreignKeyName: "positions_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "recommendations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "positions_recommendation_owner_fkey"
            columns: ["recommendation_id", "owner_user_id"]
            isOneToOne: false
            referencedRelation: "recommendations"
            referencedColumns: ["id", "owner_user_id"]
          },
        ]
      }
      recommendation_batches: {
        Row: {
          batch_fingerprint: string
          batch_type: string
          created_at: string
          data_mode: string
          experimental_count: number
          expires_at: string | null
          freshness_status: string | null
          gap_to_target: number | null
          id: string
          market_session_phase: string | null
          overflow_above_target: number | null
          owner_user_id: string
          payload_json: Json
          published_at: string | null
          recommendation_count: number
          scan_run_fingerprint: string | null
          serving_decision: string | null
          status: string
          strong_count: number
          target_status: string
          trading_date: string | null
          unknown_tier_count: number
          updated_at: string
          valid_count: number
          warnings_json: Json
          window: string
        }
        Insert: {
          batch_fingerprint: string
          batch_type?: string
          created_at?: string
          data_mode?: string
          experimental_count?: number
          expires_at?: string | null
          freshness_status?: string | null
          gap_to_target?: number | null
          id: string
          market_session_phase?: string | null
          overflow_above_target?: number | null
          owner_user_id: string
          payload_json?: Json
          published_at?: string | null
          recommendation_count?: number
          scan_run_fingerprint?: string | null
          serving_decision?: string | null
          status?: string
          strong_count?: number
          target_status?: string
          trading_date?: string | null
          unknown_tier_count?: number
          updated_at?: string
          valid_count?: number
          warnings_json?: Json
          window?: string
        }
        Update: {
          batch_fingerprint?: string
          batch_type?: string
          created_at?: string
          data_mode?: string
          experimental_count?: number
          expires_at?: string | null
          freshness_status?: string | null
          gap_to_target?: number | null
          id?: string
          market_session_phase?: string | null
          overflow_above_target?: number | null
          owner_user_id?: string
          payload_json?: Json
          published_at?: string | null
          recommendation_count?: number
          scan_run_fingerprint?: string | null
          serving_decision?: string | null
          status?: string
          strong_count?: number
          target_status?: string
          trading_date?: string | null
          unknown_tier_count?: number
          updated_at?: string
          valid_count?: number
          warnings_json?: Json
          window?: string
        }
        Relationships: []
      }
      recommendation_outcomes: {
        Row: {
          best_price: number | null
          best_r: number | null
          created_at: string
          entry_triggered: boolean | null
          eod_price: number | null
          eod_r: number | null
          evaluated_at: string
          first_terminal_event: string
          horizon: string
          id: string
          owner_user_id: string
          payload_json: Json
          recommendation_id: string | null
          recommended_at: string | null
          snapshot_fingerprint: string | null
          snapshot_id: string | null
          status: string
          stop_hit: boolean | null
          target_hit: boolean | null
          ticker: string | null
          updated_at: string
          warnings_json: Json
          worst_price: number | null
          worst_r: number | null
        }
        Insert: {
          best_price?: number | null
          best_r?: number | null
          created_at?: string
          entry_triggered?: boolean | null
          eod_price?: number | null
          eod_r?: number | null
          evaluated_at?: string
          first_terminal_event?: string
          horizon?: string
          id: string
          owner_user_id: string
          payload_json?: Json
          recommendation_id?: string | null
          recommended_at?: string | null
          snapshot_fingerprint?: string | null
          snapshot_id?: string | null
          status?: string
          stop_hit?: boolean | null
          target_hit?: boolean | null
          ticker?: string | null
          updated_at?: string
          warnings_json?: Json
          worst_price?: number | null
          worst_r?: number | null
        }
        Update: {
          best_price?: number | null
          best_r?: number | null
          created_at?: string
          entry_triggered?: boolean | null
          eod_price?: number | null
          eod_r?: number | null
          evaluated_at?: string
          first_terminal_event?: string
          horizon?: string
          id?: string
          owner_user_id?: string
          payload_json?: Json
          recommendation_id?: string | null
          recommended_at?: string | null
          snapshot_fingerprint?: string | null
          snapshot_id?: string | null
          status?: string
          stop_hit?: boolean | null
          target_hit?: boolean | null
          ticker?: string | null
          updated_at?: string
          warnings_json?: Json
          worst_price?: number | null
          worst_r?: number | null
        }
        Relationships: []
      }
      recommendation_scan_runs: {
        Row: {
          accepted_count: number
          completed_at: string | null
          created_at: string
          data_mode: string
          duplicate_ticker_count: number | null
          experimental_count: number
          gap_to_target: number | null
          id: string
          incomplete_count: number
          incomplete_data_candidate_count: number | null
          incomplete_tier_count: number
          market_session_phase: string | null
          needs_review_count: number
          observed_at: string
          overflow_above_target: number | null
          owner_user_id: string
          payload_json: Json
          raw_candidate_count: number | null
          rejected_count: number
          rejected_tier_count: number
          run_fingerprint: string
          scan_duration_ms: number | null
          scan_observability_status: string
          scanned_ticker_count: number | null
          stale_candidate_count: number | null
          started_at: string | null
          status: string
          strong_count: number
          ticker_count: number
          trading_date: string | null
          unknown_tier_count: number
          updated_at: string
          valid_count: number
          visible_recommendation_count: number
          warnings_json: Json
          window: string
          window_target_status: string
        }
        Insert: {
          accepted_count?: number
          completed_at?: string | null
          created_at?: string
          data_mode?: string
          duplicate_ticker_count?: number | null
          experimental_count?: number
          gap_to_target?: number | null
          id: string
          incomplete_count?: number
          incomplete_data_candidate_count?: number | null
          incomplete_tier_count?: number
          market_session_phase?: string | null
          needs_review_count?: number
          observed_at?: string
          overflow_above_target?: number | null
          owner_user_id: string
          payload_json?: Json
          raw_candidate_count?: number | null
          rejected_count?: number
          rejected_tier_count?: number
          run_fingerprint: string
          scan_duration_ms?: number | null
          scan_observability_status?: string
          scanned_ticker_count?: number | null
          stale_candidate_count?: number | null
          started_at?: string | null
          status?: string
          strong_count?: number
          ticker_count?: number
          trading_date?: string | null
          unknown_tier_count?: number
          updated_at?: string
          valid_count?: number
          visible_recommendation_count?: number
          warnings_json?: Json
          window?: string
          window_target_status?: string
        }
        Update: {
          accepted_count?: number
          completed_at?: string | null
          created_at?: string
          data_mode?: string
          duplicate_ticker_count?: number | null
          experimental_count?: number
          gap_to_target?: number | null
          id?: string
          incomplete_count?: number
          incomplete_data_candidate_count?: number | null
          incomplete_tier_count?: number
          market_session_phase?: string | null
          needs_review_count?: number
          observed_at?: string
          overflow_above_target?: number | null
          owner_user_id?: string
          payload_json?: Json
          raw_candidate_count?: number | null
          rejected_count?: number
          rejected_tier_count?: number
          run_fingerprint?: string
          scan_duration_ms?: number | null
          scan_observability_status?: string
          scanned_ticker_count?: number | null
          stale_candidate_count?: number | null
          started_at?: string | null
          status?: string
          strong_count?: number
          ticker_count?: number
          trading_date?: string | null
          unknown_tier_count?: number
          updated_at?: string
          valid_count?: number
          visible_recommendation_count?: number
          warnings_json?: Json
          window?: string
          window_target_status?: string
        }
        Relationships: []
      }
      recommendation_snapshots: {
        Row: {
          confidence: number | null
          created_at: string
          data_mode: string
          entry: number | null
          id: string
          intake_quality_json: Json | null
          linked_position_id: string | null
          market_session_phase: string | null
          owner_user_id: string
          payload_json: Json
          rationale: string | null
          recommendation_id: string | null
          recommended_at: string | null
          risk_reward: number | null
          scan_observability_json: Json | null
          scan_run_id: string | null
          score: number | null
          snapshot_fingerprint: string
          source_mode: string
          status: string
          stop: number | null
          target: number | null
          ticker: string | null
          updated_at: string
          was_taken: boolean
          window: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          data_mode?: string
          entry?: number | null
          id: string
          intake_quality_json?: Json | null
          linked_position_id?: string | null
          market_session_phase?: string | null
          owner_user_id: string
          payload_json?: Json
          rationale?: string | null
          recommendation_id?: string | null
          recommended_at?: string | null
          risk_reward?: number | null
          scan_observability_json?: Json | null
          scan_run_id?: string | null
          score?: number | null
          snapshot_fingerprint: string
          source_mode?: string
          status?: string
          stop?: number | null
          target?: number | null
          ticker?: string | null
          updated_at?: string
          was_taken?: boolean
          window?: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          data_mode?: string
          entry?: number | null
          id?: string
          intake_quality_json?: Json | null
          linked_position_id?: string | null
          market_session_phase?: string | null
          owner_user_id?: string
          payload_json?: Json
          rationale?: string | null
          recommendation_id?: string | null
          recommended_at?: string | null
          risk_reward?: number | null
          scan_observability_json?: Json | null
          scan_run_id?: string | null
          score?: number | null
          snapshot_fingerprint?: string
          source_mode?: string
          status?: string
          stop?: number | null
          target?: number | null
          ticker?: string | null
          updated_at?: string
          was_taken?: boolean
          window?: string
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          archived: boolean
          company_name: string | null
          confidence: string | null
          created_at: string | null
          direction: string
          entry_high: number | null
          entry_low: number | null
          id: string
          invalidation: string | null
          owner_user_id: string
          reason_to_avoid: string | null
          risk_reward: number | null
          session_type: string
          setup_type: string | null
          status: string
          stop_loss: number | null
          target_1: number | null
          target_2: number | null
          thesis: string | null
          ticker: string
          timeframe: string | null
        }
        Insert: {
          archived?: boolean
          company_name?: string | null
          confidence?: string | null
          created_at?: string | null
          direction?: string
          entry_high?: number | null
          entry_low?: number | null
          id?: string
          invalidation?: string | null
          owner_user_id: string
          reason_to_avoid?: string | null
          risk_reward?: number | null
          session_type?: string
          setup_type?: string | null
          status?: string
          stop_loss?: number | null
          target_1?: number | null
          target_2?: number | null
          thesis?: string | null
          ticker: string
          timeframe?: string | null
        }
        Update: {
          archived?: boolean
          company_name?: string | null
          confidence?: string | null
          created_at?: string | null
          direction?: string
          entry_high?: number | null
          entry_low?: number | null
          id?: string
          invalidation?: string | null
          owner_user_id?: string
          reason_to_avoid?: string | null
          risk_reward?: number | null
          session_type?: string
          setup_type?: string | null
          status?: string
          stop_loss?: number | null
          target_1?: number | null
          target_2?: number | null
          thesis?: string | null
          ticker?: string
          timeframe?: string | null
        }
        Relationships: []
      }
      scanner_cache: {
        Row: {
          change_5d_percent: number | null
          created_at: string | null
          distance_to_20d_high: number | null
          high_20d: number | null
          id: string
          latest_close: number | null
          ma20: number | null
          ma50: number | null
          proposed_entry_high: number | null
          proposed_entry_low: number | null
          proposed_risk_reward: number | null
          proposed_stop_loss: number | null
          proposed_target_1: number | null
          proposed_target_2: number | null
          raw: Json | null
          ticker: string
          trend_context: string | null
          updated_at: string | null
          volume_context: string | null
          volume_ratio: number | null
        }
        Insert: {
          change_5d_percent?: number | null
          created_at?: string | null
          distance_to_20d_high?: number | null
          high_20d?: number | null
          id?: string
          latest_close?: number | null
          ma20?: number | null
          ma50?: number | null
          proposed_entry_high?: number | null
          proposed_entry_low?: number | null
          proposed_risk_reward?: number | null
          proposed_stop_loss?: number | null
          proposed_target_1?: number | null
          proposed_target_2?: number | null
          raw?: Json | null
          ticker: string
          trend_context?: string | null
          updated_at?: string | null
          volume_context?: string | null
          volume_ratio?: number | null
        }
        Update: {
          change_5d_percent?: number | null
          created_at?: string | null
          distance_to_20d_high?: number | null
          high_20d?: number | null
          id?: string
          latest_close?: number | null
          ma20?: number | null
          ma50?: number | null
          proposed_entry_high?: number | null
          proposed_entry_low?: number | null
          proposed_risk_reward?: number | null
          proposed_stop_loss?: number | null
          proposed_target_1?: number | null
          proposed_target_2?: number | null
          raw?: Json | null
          ticker?: string
          trend_context?: string | null
          updated_at?: string | null
          volume_context?: string | null
          volume_ratio?: number | null
        }
        Relationships: []
      }
      scheduled_scan_attempts: {
        Row: {
          allowed: boolean | null
          attempt_fingerprint: string
          batch_fingerprint: string | null
          built_count: number | null
          created_at: string
          http_status: number | null
          id: string
          intraday_scan_window: string | null
          message: string | null
          mode: string
          ny_timestamp: string | null
          official_window: string
          orchestration_decision: string | null
          outcome: string
          payload_json: Json
          published_count: number | null
          ranked_count: number | null
          raw_count: number | null
          recommendations_created: number | null
          route_received_at: string | null
          scan_run_fingerprint: string | null
          scheduled_function_fired_at: string | null
          scheduled_scan_run_id: string | null
          selected_count: number | null
          skip_reason: string | null
          source: string
          trading_date: string | null
          updated_at: string
          utc_timestamp: string
        }
        Insert: {
          allowed?: boolean | null
          attempt_fingerprint: string
          batch_fingerprint?: string | null
          built_count?: number | null
          created_at?: string
          http_status?: number | null
          id?: string
          intraday_scan_window?: string | null
          message?: string | null
          mode?: string
          ny_timestamp?: string | null
          official_window?: string
          orchestration_decision?: string | null
          outcome?: string
          payload_json?: Json
          published_count?: number | null
          ranked_count?: number | null
          raw_count?: number | null
          recommendations_created?: number | null
          route_received_at?: string | null
          scan_run_fingerprint?: string | null
          scheduled_function_fired_at?: string | null
          scheduled_scan_run_id?: string | null
          selected_count?: number | null
          skip_reason?: string | null
          source?: string
          trading_date?: string | null
          updated_at?: string
          utc_timestamp?: string
        }
        Update: {
          allowed?: boolean | null
          attempt_fingerprint?: string
          batch_fingerprint?: string | null
          built_count?: number | null
          created_at?: string
          http_status?: number | null
          id?: string
          intraday_scan_window?: string | null
          message?: string | null
          mode?: string
          ny_timestamp?: string | null
          official_window?: string
          orchestration_decision?: string | null
          outcome?: string
          payload_json?: Json
          published_count?: number | null
          ranked_count?: number | null
          raw_count?: number | null
          recommendations_created?: number | null
          route_received_at?: string | null
          scan_run_fingerprint?: string | null
          scheduled_function_fired_at?: string | null
          scheduled_scan_run_id?: string | null
          selected_count?: number | null
          skip_reason?: string | null
          source?: string
          trading_date?: string | null
          updated_at?: string
          utc_timestamp?: string
        }
        Relationships: []
      }
      scheduled_scan_runs: {
        Row: {
          created_at: string | null
          id: string
          message: string | null
          recommendations_created: number
          scan_date: string
          session_type: string
          status: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message?: string | null
          recommendations_created?: number
          scan_date: string
          session_type: string
          status?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string | null
          recommendations_created?: number
          scan_date?: string
          session_type?: string
          status?: string
        }
        Relationships: []
      }
      symbol_metadata: {
        Row: {
          company_name: string | null
          created_at: string
          exchange: string | null
          logo_source: string | null
          logo_updated_at: string | null
          logo_url: string | null
          provider_payload: Json | null
          symbol: string
          updated_at: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          exchange?: string | null
          logo_source?: string | null
          logo_updated_at?: string | null
          logo_url?: string | null
          provider_payload?: Json | null
          symbol: string
          updated_at?: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          exchange?: string | null
          logo_source?: string | null
          logo_updated_at?: string | null
          logo_url?: string | null
          provider_payload?: Json | null
          symbol?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string | null
          id: string
          long_only: boolean
          max_open_positions: number
          max_recommendations_per_session: number
          owner_user_id: string
          portfolio_size: number
          preferred_timeframe: string
          risk_per_trade_percent: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          long_only?: boolean
          max_open_positions?: number
          max_recommendations_per_session?: number
          owner_user_id: string
          portfolio_size?: number
          preferred_timeframe?: string
          risk_per_trade_percent?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          long_only?: boolean
          max_open_positions?: number
          max_recommendations_per_session?: number
          owner_user_id?: string
          portfolio_size?: number
          preferred_timeframe?: string
          risk_per_trade_percent?: number
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admit_ci_shadow_canary_manual_lease: {
        Args: {
          p_authorization_id: string
          p_authorization_token: string
          p_claim_id: string
          p_execution_id: string
          p_execution_lease_id: string
          p_request_fingerprint: string
          p_utc_day: string
        }
        Returns: {
          admission_status: string
          authorization_id: string
          claim_id: string
          claim_status: string
          execution_lease_id: string
        }[]
      }
      admit_continuous_intelligence_shadow_canary_manual_execution: {
        Args: {
          p_authorization_id: string
          p_authorization_token: string
          p_claim_id: string
          p_execution_id: string
          p_request_fingerprint: string
          p_utc_day: string
        }
        Returns: {
          admission_status: string
          authorization_id: string
          claim_id: string
          claim_status: string
        }[]
      }
      app_login_abuse_finalize_success: {
        Args: { p_client_identity_digest?: string }
        Returns: boolean
      }
      app_login_abuse_reserve: {
        Args: { p_client_identity_digest?: string }
        Returns: {
          allowed: boolean
          result_code: string
          retry_after_seconds: number
        }[]
      }
      app_open_owned_position_transaction: {
        Args: {
          p_command_version: string
          p_company_name: string
          p_current_stop: number
          p_entry_price: number
          p_execution_metadata: Json
          p_owner_user_id: string
          p_position_size: number
          p_recommendation_id: string
          p_target_1: number
          p_target_2: number
          p_ticker: string
        }
        Returns: {
          disposition: string
          position_id: string
          snapshot_link_count: number
        }[]
      }
      app_open_position_transaction: {
        Args: {
          p_command_version: string
          p_company_name: string
          p_current_stop: number
          p_entry_price: number
          p_execution_metadata: Json
          p_position_size: number
          p_recommendation_id: string
          p_target_1: number
          p_target_2: number
          p_ticker: string
        }
        Returns: {
          disposition: string
          position_id: string
          snapshot_link_count: number
        }[]
      }
      begin_continuous_intelligence_shadow_canary_attempt: {
        Args: {
          p_claim_id: string
          p_execution_id: string
          p_expected_contract_version?: string
          p_request_fingerprint: string
        }
        Returns: {
          attempt_status: string
          claim_id: string
          claim_status: string
        }[]
      }
      ci_hur_issue: {
        Args: {
          p_authorization_id: string
          p_deployment_commit: string
          p_evidence_digest: string
          p_expected_claim_capacity_units: number
          p_expected_missing_usage_units: number
          p_expected_ordinary_ledger_units: number
          p_expected_reconciliation_units: number
          p_expires_at: string
          p_issued_at: string
          p_reconciliation_identity: string
          p_requested_by: string
          p_source_audit_id: string
          p_target_claim_id: string
        }
        Returns: {
          authorization_id: string
          outcome: string
          reconciliation_identity: string
        }[]
      }
      ci_hur_read_for_usage_accounting: {
        Args: { p_historical_utc_day: string }
        Returns: {
          authorization_id: string
          contract_version: string
          historical_utc_day: string
          operation_type: string
          provider_request_count_for_reconciliation: number
          reason_code: string
          reconciliation_identity: string
          record_type: string
          source_audit_id: string
          source_execution_id: string
          target_claim_id: string
          usage_units: number
        }[]
      }
      ci_hur_reconcile: {
        Args: {
          p_authorization_id: string
          p_contract_version: string
          p_deployment_commit: string
          p_evidence_digest: string
          p_expected_claim_capacity_units: number
          p_expected_missing_usage_units: number
          p_expected_ordinary_ledger_units: number
          p_expected_reconciliation_units: number
          p_expected_source_audit_id: string
          p_reconciliation_identity: string
          p_target_claim_id: string
        }
        Returns: {
          authorization_id: string
          ordinary_ledger_units: number
          outcome: string
          reconciliation_identity: string
          reconciliation_units: number
          target_claim_id: string
          total_accounted_usage_units: number
        }[]
      }
      ci_hur_target_allowed: {
        Args: {
          p_claim_id: string
          p_execution_id: string
          p_source_receipt_id: string
        }
        Returns: boolean
      }
      ci_hur_target_claim_id_allowed: {
        Args: { p_claim_id: string }
        Returns: boolean
      }
      ci_hur_target_provider_result_allowed: {
        Args: {
          p_claim_id: string
          p_execution_id: string
          p_primary_result_category: string
          p_source_receipt_id: string
        }
        Returns: boolean
      }
      ci_mca_consume: {
        Args: {
          p_authorization_id: string
          p_authorization_token: string
          p_claim_id: string
          p_execution_id: string
          p_request_fingerprint: string
        }
        Returns: {
          authorization_id: string
          authorization_status: string
          budget_policy_version: string
          calendar_contract_version: string
          calendar_fingerprint: string
          canary_contract_version: string
          claim_contract_version: string
          claim_id: string
          consumed_at: string
          contract_version: string
          deployment_build_marker: string
          deployment_commit: string
          estimated_credits: number
          execution_id: string
          expires_at: string
          issued_at: string
          market_interval: string
          outcome: string
          policy_hard_reserve_credits: number
          policy_normal_planned_max_credits: number
          policy_total_credits: number
          purpose: string
          request_fingerprint: string
          requested_end: string
          requested_start: string
          ticker: string
        }[]
      }
      ci_mca_issue: {
        Args: {
          p_authorization_id: string
          p_budget_policy_version: string
          p_calendar_contract_version: string
          p_calendar_fingerprint: string
          p_canary_contract_version: string
          p_claim_contract_version: string
          p_claim_id: string
          p_deployment_build_marker: string
          p_deployment_commit: string
          p_estimated_credits: number
          p_execution_id: string
          p_expires_at: string
          p_interval: string
          p_issued_at: string
          p_policy_hard_reserve_credits: number
          p_policy_normal_planned_max_credits: number
          p_policy_total_credits: number
          p_purpose: string
          p_request_fingerprint: string
          p_requested_end: string
          p_requested_start: string
          p_ticker: string
          p_token_hash: string
        }
        Returns: {
          authorization_id: string
          authorization_status: string
          budget_policy_version: string
          calendar_contract_version: string
          calendar_fingerprint: string
          canary_contract_version: string
          claim_contract_version: string
          claim_id: string
          consumed_at: string
          contract_version: string
          deployment_build_marker: string
          deployment_commit: string
          estimated_credits: number
          execution_id: string
          expires_at: string
          issued_at: string
          market_interval: string
          outcome: string
          policy_hard_reserve_credits: number
          policy_normal_planned_max_credits: number
          policy_total_credits: number
          purpose: string
          request_fingerprint: string
          requested_end: string
          requested_start: string
          ticker: string
        }[]
      }
      ci_mca_readiness: {
        Args: never
        Returns: {
          active_issued_authorization_count: number
          active_issued_lease_count: number
          authorization_issue_rpc_anon_executable: boolean
          authorization_issue_rpc_authenticated_executable: boolean
          authorization_issue_rpc_available: boolean
          authorization_issue_rpc_public_executable: boolean
          authorization_issue_rpc_service_role_executable: boolean
          authorization_issue_rpc_signature_valid: boolean
          authorization_table_available: boolean
          authorization_table_rls_enabled: boolean
          lease_issue_rpc_anon_executable: boolean
          lease_issue_rpc_authenticated_executable: boolean
          lease_issue_rpc_available: boolean
          lease_issue_rpc_public_executable: boolean
          lease_issue_rpc_service_role_executable: boolean
          lease_issue_rpc_signature_valid: boolean
          lease_table_available: boolean
          lease_table_rls_enabled: boolean
          transaction_prerequisites_valid: boolean
        }[]
      }
      claim_continuous_intelligence_shadow_canary: {
        Args: {
          p_claim_id: string
          p_estimated_credits: number
          p_execution_id: string
          p_request_fingerprint: string
          p_utc_day: string
        }
        Returns: {
          blocker: string
          claim_id: string
          claim_status: string
          claimed: boolean
          idempotent: boolean
        }[]
      }
      finalize_continuous_intelligence_shadow_canary_attempt: {
        Args: {
          p_claim_id: string
          p_execution_id: string
          p_expected_contract_version: string
          p_finalized_at: string
          p_provider_attempted: boolean
          p_request_fingerprint: string
          p_source_receipt_id: string
          p_terminal_status: string
        }
        Returns: {
          claim_id: string
          claim_status: string
          finalization_status: string
          provider_attempted: boolean
        }[]
      }
      issue_ci_shadow_canary_manual_lease: {
        Args: {
          p_authorization_id: string
          p_budget_policy_version: string
          p_calendar_contract_version: string
          p_calendar_fingerprint: string
          p_canary_contract_version: string
          p_claim_contract_version: string
          p_claim_id: string
          p_deployment_build_marker: string
          p_deployment_commit: string
          p_estimated_credits: number
          p_execution_id: string
          p_execution_lease_id: string
          p_expires_at: string
          p_interval: string
          p_issued_at: string
          p_policy_hard_reserve_credits: number
          p_policy_normal_planned_max_credits: number
          p_policy_total_credits: number
          p_purpose: string
          p_request_fingerprint: string
          p_requested_end: string
          p_requested_start: string
          p_ticker: string
          p_token_hash: string
        }
        Returns: {
          authorization_id: string
          authorization_status: string
          execution_lease_id: string
          expires_at: string
          issued_at: string
          lease_status: string
          outcome: string
        }[]
      }
      read_continuous_intelligence_shadow_canary_readiness: {
        Args: never
        Returns: {
          audit_canary_entry_kind_constrained: boolean
          audit_no_effect_constraint_available: boolean
          audit_table_available: boolean
          begin_attempt_rpc_available: boolean
          claim_rpc_available: boolean
          claim_status_constraint_available: boolean
          claim_table_available: boolean
          finalize_attempt_rpc_available: boolean
          ledger_canary_entry_kind_constrained: boolean
          ledger_table_available: boolean
          ledger_zero_reserve_constraint_available: boolean
          lifecycle_rpcs_anon_executable: boolean
          lifecycle_rpcs_authenticated_executable: boolean
          lifecycle_rpcs_public_executable: boolean
          lifecycle_rpcs_service_role_executable: boolean
          probe_contract_version: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
