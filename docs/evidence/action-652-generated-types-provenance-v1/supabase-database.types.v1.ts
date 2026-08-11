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
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
          validation_errors?: Json
          validation_status?: string
          validation_warnings?: Json
        }
        Relationships: []
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
          position_id: string | null
          recommendation: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          explanation?: string | null
          id?: string
          new_stop?: number | null
          position_id?: string | null
          recommendation?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          explanation?: string | null
          id?: string
          new_stop?: number | null
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
        ]
      }
      positions: {
        Row: {
          closed_at: string | null
          company_name: string | null
          created_at: string | null
          current_stop: number | null
          entry_price: number
          exit_notes: string | null
          exit_price: number | null
          id: string
          latest_recommendation: string | null
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
          exit_notes?: string | null
          exit_price?: number | null
          id?: string
          latest_recommendation?: string | null
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
          exit_notes?: string | null
          exit_price?: number | null
          id?: string
          latest_recommendation?: string | null
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
      user_settings: {
        Row: {
          created_at: string | null
          id: string
          long_only: boolean
          max_open_positions: number
          max_recommendations_per_session: number
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
      [_ in never]: never
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
