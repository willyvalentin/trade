"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  browserAgentPrototypePlanJson,
  buildBrowserAgentPrototypePlan,
  type BrowserAgentPrototypePlan,
} from "@/lib/browser-agent-prototype-plan";
import {
  AVANZA_VERIFICATION_NOTES_STORAGE_KEY,
  avanzaVerificationNotesJson,
  createDefaultAvanzaVerificationNotesState,
  normalizeAvanzaVerificationNotesState,
  validateAvanzaVerificationNotes,
  type AvanzaFieldVerificationNote,
  type AvanzaVerificationCriticality,
  type AvanzaVerificationNoteSource,
  type AvanzaVerificationNoteStatus,
  type AvanzaVerificationNotesState,
  type AvanzaVerificationNotesValidation,
} from "@/lib/avanza-field-verification-notes";
import {
  getIntradayScanWindow,
  getIntradayScanWindowLabel,
  type IntradayScanWindow,
} from "@/lib/intraday-scan-window";
import {
  defaultBrokerCostModel,
  readBrokerCostModelFromStorage,
  writeBrokerCostModelToStorage,
  type BrokerCostModel,
} from "@/lib/broker-costs";
import {
  createDefaultRiskControlsSettings,
  normalizeRiskControlsSettings,
  riskControlsSettingsJson,
  RISK_CONTROLS_STORAGE_KEY,
  type RiskControlsMode,
  type RiskControlsPositionSizeMode,
  type RiskControlsPositionSizingMode,
  type RiskControlsSettings,
} from "@/lib/risk-controls";
import {
  buildDataModeClaritySummary,
  dataModeClaritySummaryJson,
} from "@/lib/data-mode-clarity";
import { supabase } from "@/lib/supabase";
import { normalizeUnknownError } from "@/lib/error-logging";

type UserSettingsRow = {
  id: string | number;
  created_at: string | null;
  updated_at: string | null;
  portfolio_size: number | string | null;
  risk_per_trade_percent: number | string | null;
  max_recommendations_per_session: number | string | null;
  max_open_positions: number | string | null;
  preferred_timeframe: string | null;
  long_only: boolean | null;
};

type SettingsForm = {
  portfolioSize: string;
  riskPerTradePercent: string;
  maxRecommendationsPerSession: string;
  maxOpenPositions: string;
  preferredTimeframe: string;
  longOnly: boolean;
  brokerCostsEnabled: boolean;
  brokerCostBroker: BrokerCostModel["broker"];
  commissionMode: BrokerCostModel["commission_mode"];
  entryFixedCommission: string;
  exitFixedCommission: string;
  commissionPercent: string;
  minimumCommission: string;
  fxFeePercent: string;
  estimatedUsdSekRate: string;
  includeEntryCommission: boolean;
  includeEstimatedExitCommission: boolean;
  includeFxFee: boolean;
};

type ScheduledScanRun = {
  id: string | number;
  created_at: string | null;
  scan_date: string | null;
  session_type: string | null;
  status: string | null;
  recommendations_created: number | string | null;
  message: string | null;
};

type MarketStatus = {
  isOpenDay: boolean;
  reason: string;
  date: string;
  dayType: "trading_day" | "weekend" | "holiday" | "early_close" | "unknown";
  marketOpenTime: string | null;
  marketCloseTime: string | null;
  provider: string;
  fromCache: boolean;
};

const emptyForm: SettingsForm = {
  portfolioSize: "",
  riskPerTradePercent: "",
  maxRecommendationsPerSession: "",
  maxOpenPositions: "",
  preferredTimeframe: "",
  longOnly: true,
  brokerCostsEnabled: defaultBrokerCostModel.enabled,
  brokerCostBroker: defaultBrokerCostModel.broker,
  commissionMode: defaultBrokerCostModel.commission_mode,
  entryFixedCommission: String(defaultBrokerCostModel.entry_fixed_commission),
  exitFixedCommission: String(defaultBrokerCostModel.exit_fixed_commission),
  commissionPercent: String(defaultBrokerCostModel.commission_percent),
  minimumCommission: String(defaultBrokerCostModel.minimum_commission),
  fxFeePercent: String(defaultBrokerCostModel.fx_fee_percent),
  estimatedUsdSekRate: String(defaultBrokerCostModel.estimated_usd_sek_rate ?? ""),
  includeEntryCommission: defaultBrokerCostModel.include_entry_commission,
  includeEstimatedExitCommission:
    defaultBrokerCostModel.include_estimated_exit_commission,
  includeFxFee: defaultBrokerCostModel.include_fx_fee,
};

const defaultSettingsRow = {
  portfolio_size: 100000,
  risk_per_trade_percent: 0.5,
  max_recommendations_per_session: 5,
  max_open_positions: 5,
  preferred_timeframe: "Intraday / day trade",
  long_only: true,
};

function toForm(row: UserSettingsRow): SettingsForm {
  const brokerCostModel = readBrokerCostModelFromStorage();

  return {
    portfolioSize: String(row.portfolio_size ?? ""),
    riskPerTradePercent: String(row.risk_per_trade_percent ?? ""),
    maxRecommendationsPerSession: String(
      row.max_recommendations_per_session ?? "",
    ),
    maxOpenPositions: String(row.max_open_positions ?? ""),
    preferredTimeframe: row.preferred_timeframe ?? "",
    longOnly: row.long_only ?? true,
    brokerCostsEnabled: brokerCostModel.enabled,
    brokerCostBroker: brokerCostModel.broker,
    commissionMode: brokerCostModel.commission_mode,
    entryFixedCommission: String(brokerCostModel.entry_fixed_commission),
    exitFixedCommission: String(brokerCostModel.exit_fixed_commission),
    commissionPercent: String(brokerCostModel.commission_percent),
    minimumCommission: String(brokerCostModel.minimum_commission),
    fxFeePercent: String(brokerCostModel.fx_fee_percent),
    estimatedUsdSekRate: String(brokerCostModel.estimated_usd_sek_rate ?? ""),
    includeEntryCommission: brokerCostModel.include_entry_commission,
    includeEstimatedExitCommission:
      brokerCostModel.include_estimated_exit_commission,
    includeFxFee: brokerCostModel.include_fx_fee,
  };
}

function parseNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function validateSettings(form: SettingsForm) {
  const portfolioSize = parseNumber(form.portfolioSize);
  const riskPerTradePercent = parseNumber(form.riskPerTradePercent);
  const maxRecommendationsPerSession = parseNumber(
    form.maxRecommendationsPerSession,
  );
  const maxOpenPositions = parseNumber(form.maxOpenPositions);
  const entryFixedCommission = parseNumber(form.entryFixedCommission);
  const exitFixedCommission = parseNumber(form.exitFixedCommission);
  const commissionPercent = parseNumber(form.commissionPercent);
  const minimumCommission = parseNumber(form.minimumCommission);
  const fxFeePercent = parseNumber(form.fxFeePercent);
  const estimatedUsdSekRate = parseNumber(form.estimatedUsdSekRate);

  if (portfolioSize === null || portfolioSize <= 0) {
    return "Portfolio size must be greater than 0.";
  }

  if (
    riskPerTradePercent === null ||
    riskPerTradePercent <= 0 ||
    riskPerTradePercent > 5
  ) {
    return "Risk per trade must be greater than 0 and no more than 5%.";
  }

  if (
    maxRecommendationsPerSession === null ||
    maxRecommendationsPerSession < 1 ||
    maxRecommendationsPerSession > 10
  ) {
    return "Max recommendations per session must be between 1 and 10.";
  }

  if (
    maxOpenPositions === null ||
    maxOpenPositions < 1 ||
    maxOpenPositions > 20
  ) {
    return "Max open positions must be between 1 and 20.";
  }

  if (!form.preferredTimeframe.trim()) {
    return "Preferred timeframe cannot be empty.";
  }

  if (
    entryFixedCommission === null ||
    exitFixedCommission === null ||
    commissionPercent === null ||
    minimumCommission === null ||
    fxFeePercent === null
  ) {
    return "Broker cost fields must be valid numbers.";
  }

  if (
    entryFixedCommission < 0 ||
    exitFixedCommission < 0 ||
    commissionPercent < 0 ||
    minimumCommission < 0 ||
    fxFeePercent < 0
  ) {
    return "Broker cost fields cannot be negative.";
  }

  if (form.brokerCostsEnabled && (estimatedUsdSekRate === null || estimatedUsdSekRate <= 0)) {
    return "Estimated USD/SEK rate must be greater than 0 when broker cost estimates are enabled.";
  }

  return null;
}

async function fetchFirstSettingsRow() {
  return supabase
    .from("user_settings")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
}

async function createDefaultSettingsRow() {
  return supabase
    .from("user_settings")
    .insert(defaultSettingsRow)
    .select("*")
    .single();
}

async function fetchRecentScheduledScanRuns() {
  return supabase
    .from("scheduled_scan_runs")
    .select(
      "id,created_at,scan_date,session_type,status,recommendations_created,message",
    )
    .order("created_at", { ascending: false })
    .limit(20);
}

async function fetchMarketStatusForUi() {
  try {
    const response = await fetch("/api/market-calendar/status", {
      cache: "no-store",
    });
    const result = (await response.json().catch(() => null)) as {
      market_status?: MarketStatus;
      error?: string;
    } | null;

    if (!response.ok) {
      throw new Error(result?.error || "Could not load market calendar status.");
    }

    return {
      marketStatus: result?.market_status ?? null,
      error: "",
    };
  } catch (error) {
    console.error("[settings] market_status_error", {
      source: "/api/market-calendar/status",
      error: normalizeUnknownError(error),
    });

    return {
      marketStatus: null,
      error: "Market calendar status is unavailable right now.",
    };
  }
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not recorded";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatSessionType(value: string | null) {
  if (value === "morning") {
    return "Early session";
  }

  if (value === "midday") {
    return "Later session";
  }

  return value ?? "Unknown";
}

function getScanWindowFromRunMessage(message: string | null) {
  const match = message?.match(/scan_window=([a-z_]+)/);
  const value = match?.[1] as IntradayScanWindow | undefined;

  if (
    value === "pre_market" ||
    value === "opening" ||
    value === "morning_momentum" ||
    value === "midday" ||
    value === "afternoon" ||
    value === "power_hour" ||
    value === "closed"
  ) {
    return getIntradayScanWindowLabel(value);
  }

  return "Not recorded";
}

function logBrowserAgentPrototypePlanEvent(
  type:
    | "browser_agent_prototype_plan_generated"
    | "browser_agent_prototype_plan_copied",
  plan: BrowserAgentPrototypePlan,
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const current = JSON.parse(
      window.localStorage.getItem("trade-management-events") ?? "[]",
    );
    const events = Array.isArray(current) ? current : [];

    events.push({
      type,
      timestamp: new Date().toISOString(),
      plan_id: plan.plan_id,
      plan_version: plan.plan_version,
      plan_kind: plan.plan_kind,
      overall_readiness_status: plan.overall_readiness_status,
      current_phase_id: plan.current_phase_id,
      next_recommended_action: plan.next_recommended_action,
      required_dom_block_count: plan.required_dom_blocks.length,
      hard_stop_count: plan.hard_stops.length,
      human_checkpoint_count: plan.human_checkpoints.length,
      forbidden_action_count: plan.forbidden_actions.length,
    });

    window.localStorage.setItem(
      "trade-management-events",
      JSON.stringify(events.slice(-200)),
    );
  } catch {
    // Settings audit events are diagnostic only and must never block settings UI.
  }
}

function readAvanzaVerificationNotesState() {
  if (typeof window === "undefined") {
    return createDefaultAvanzaVerificationNotesState();
  }

  try {
    const stored = window.localStorage.getItem(
      AVANZA_VERIFICATION_NOTES_STORAGE_KEY,
    );

    return stored
      ? normalizeAvanzaVerificationNotesState(JSON.parse(stored))
      : createDefaultAvanzaVerificationNotesState();
  } catch {
    return createDefaultAvanzaVerificationNotesState();
  }
}

function readRiskControlsSettings() {
  if (typeof window === "undefined") {
    return createDefaultRiskControlsSettings();
  }

  try {
    const stored = window.localStorage.getItem(RISK_CONTROLS_STORAGE_KEY);

    return stored
      ? normalizeRiskControlsSettings(JSON.parse(stored))
      : createDefaultRiskControlsSettings();
  } catch {
    return createDefaultRiskControlsSettings();
  }
}

function writeRiskControlsSettings(settings: RiskControlsSettings) {
  window.localStorage.setItem(
    RISK_CONTROLS_STORAGE_KEY,
    riskControlsSettingsJson(settings),
  );
}

function logRiskControlsSettingsEvent(
  type: "risk_controls_saved" | "risk_controls_reset",
  settings: RiskControlsSettings,
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const current = JSON.parse(
      window.localStorage.getItem("trade-management-events") ?? "[]",
    );
    const events = Array.isArray(current) ? current : [];

    events.push({
      type,
      timestamp: new Date().toISOString(),
      source: "settings_risk_controls",
      storage_key: RISK_CONTROLS_STORAGE_KEY,
      enabled: settings.enabled,
      mode: settings.mode,
      max_risk_per_trade_amount: settings.max_risk_per_trade_amount,
      max_risk_per_trade_percent: settings.max_risk_per_trade_percent,
      account_size: settings.account_size,
      default_risk_amount_per_trade: settings.default_risk_amount_per_trade,
      default_risk_percent_per_trade: settings.default_risk_percent_per_trade,
      max_position_value: settings.max_position_value,
      position_sizing_mode: settings.position_sizing_mode,
      max_daily_loss_amount: settings.max_daily_loss_amount,
      max_daily_loss_r: settings.max_daily_loss_r,
      max_trades_per_day: settings.max_trades_per_day,
      max_open_positions: settings.max_open_positions,
    });

    window.localStorage.setItem(
      "trade-management-events",
      JSON.stringify(events.slice(-200)),
    );
  } catch {
    // Local risk-control audit must never block Settings.
  }
}

function writeAvanzaVerificationNotesState(
  state: AvanzaVerificationNotesState,
) {
  window.localStorage.setItem(
    AVANZA_VERIFICATION_NOTES_STORAGE_KEY,
    avanzaVerificationNotesJson(state),
  );
}

function logAvanzaVerificationNotesEvent(
  type:
    | "avanza_verification_notes_saved"
    | "avanza_verification_notes_reset"
    | "avanza_verification_notes_imported"
    | "avanza_verification_notes_exported",
  validation: AvanzaVerificationNotesValidation,
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const current = JSON.parse(
      window.localStorage.getItem("trade-management-events") ?? "[]",
    );
    const events = Array.isArray(current) ? current : [];

    events.push({
      type,
      timestamp: new Date().toISOString(),
      source: "settings_manual_avanza_verification_notes",
      storage_key: AVANZA_VERIFICATION_NOTES_STORAGE_KEY,
      status: validation.status,
      verified_critical_fields_count:
        validation.summary.verified_critical_fields_count,
      missing_critical_fields_count:
        validation.summary.missing_critical_fields_count,
      mismatch_count: validation.summary.mismatch_count,
      needs_review_count: validation.summary.needs_review_count,
      can_future_agent_prepare_buy_form:
        validation.summary.can_future_agent_prepare_buy_form,
      can_future_agent_prepare_sell_form:
        validation.summary.can_future_agent_prepare_sell_form,
      can_future_agent_submit_order:
        validation.summary.can_future_agent_submit_order,
      human_final_confirmation_required:
        validation.summary.human_final_confirmation_required,
    });

    window.localStorage.setItem(
      "trade-management-events",
      JSON.stringify(events.slice(-200)),
    );
  } catch {
    // Local verification notes audit must never block settings.
  }
}

export default function SettingsPage() {
  const [settingsId, setSettingsId] = useState<UserSettingsRow["id"] | null>(
    null,
  );
  const [form, setForm] = useState<SettingsForm>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [automationRuns, setAutomationRuns] = useState<ScheduledScanRun[]>([]);
  const [isLoadingAutomationRuns, setIsLoadingAutomationRuns] = useState(true);
  const [automationMessage, setAutomationMessage] = useState("");
  const [marketStatus, setMarketStatus] = useState<MarketStatus | null>(null);
  const [marketStatusMessage, setMarketStatusMessage] = useState("");
  const [browserAgentPlanCreatedAt] = useState(() => new Date().toISOString());
  const [browserAgentPlanCopyStatus, setBrowserAgentPlanCopyStatus] =
    useState("");
  const [avanzaNotesState, setAvanzaNotesState] = useState(() =>
    readAvanzaVerificationNotesState(),
  );
  const [avanzaNotesMessage, setAvanzaNotesMessage] = useState("");
  const [avanzaNotesImportJson, setAvanzaNotesImportJson] = useState("");
  const [riskControlsSettings, setRiskControlsSettings] = useState(() =>
    readRiskControlsSettings(),
  );
  const [riskControlsMessage, setRiskControlsMessage] = useState("");
  const browserAgentPlanGeneratedRef = useRef(false);
  const browserAgentPlan = useMemo(
    () =>
      buildBrowserAgentPrototypePlan({
        createdAt: browserAgentPlanCreatedAt,
      }),
    [browserAgentPlanCreatedAt],
  );
  const browserAgentPlanJson = useMemo(
    () => browserAgentPrototypePlanJson(browserAgentPlan),
    [browserAgentPlan],
  );
  const avanzaNotesValidation = useMemo(
    () => validateAvanzaVerificationNotes(avanzaNotesState),
    [avanzaNotesState],
  );
  const avanzaNotesJson = useMemo(
    () => avanzaVerificationNotesJson(avanzaNotesState),
    [avanzaNotesState],
  );
  const riskControlsJson = useMemo(
    () => riskControlsSettingsJson(riskControlsSettings),
    [riskControlsSettings],
  );

  async function loadSettings() {
    setIsLoading(true);
    setMessage("");
    setSuccessMessage("");

    const { data, error } = await fetchFirstSettingsRow();

    if (error) {
      setMessage(error.message);
      setIsLoading(false);
      return;
    }

    let settingsRow = data as UserSettingsRow | null;

    if (!settingsRow) {
      const { data: newSettingsRow, error: insertError } =
        await createDefaultSettingsRow();

      if (insertError) {
        setMessage(
          `Settings row was missing, and the default row could not be created: ${insertError.message}`,
        );
        setIsLoading(false);
        return;
      }

      settingsRow = newSettingsRow as UserSettingsRow | null;
    }

    if (!settingsRow) {
      setMessage("Settings could not be loaded because no settings row exists.");
      setIsLoading(false);
      return;
    }

    setSettingsId(settingsRow.id);
    setForm(toForm(settingsRow));
    setIsLoading(false);
  }

  async function loadAutomationRuns() {
    setIsLoadingAutomationRuns(true);
    setAutomationMessage("");

    const [{ data, error }, marketStatusResult] = await Promise.all([
      fetchRecentScheduledScanRuns(),
      fetchMarketStatusForUi(),
    ]);

    if (error) {
      setAutomationMessage(error.message);
      setAutomationRuns([]);
    } else {
      setAutomationRuns((data ?? []) as ScheduledScanRun[]);
    }

    setMarketStatus(marketStatusResult.marketStatus);
    setMarketStatusMessage(marketStatusResult.error);
    setIsLoadingAutomationRuns(false);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadSettings();
      loadAutomationRuns();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (browserAgentPlanGeneratedRef.current) {
      return;
    }

    browserAgentPlanGeneratedRef.current = true;
    logBrowserAgentPrototypePlanEvent(
      "browser_agent_prototype_plan_generated",
      browserAgentPlan,
    );
  }, [browserAgentPlan]);

  function updateField(field: keyof SettingsForm, value: string | boolean) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
    setMessage("");
    setSuccessMessage("");
  }

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (settingsId === null) {
      setMessage(
        "Settings cannot be saved because no settings row is loaded. Refresh the page to create the default settings row.",
      );
      return;
    }

    const validationError = validateSettings(form);

    if (validationError) {
      setMessage(validationError);
      return;
    }

    setIsSaving(true);
    setMessage("");
    setSuccessMessage("");

    const { data, error } = await supabase
      .from("user_settings")
      .update({
        portfolio_size: Number(form.portfolioSize),
        risk_per_trade_percent: Number(form.riskPerTradePercent),
        max_recommendations_per_session: Number(
          form.maxRecommendationsPerSession,
        ),
        max_open_positions: Number(form.maxOpenPositions),
        preferred_timeframe: form.preferredTimeframe.trim(),
        long_only: form.longOnly,
        updated_at: new Date().toISOString(),
      })
      .eq("id", settingsId)
      .select("*")
      .maybeSingle();

    if (error) {
      setMessage(error.message);
      setIsSaving(false);
      return;
    }

    if (!data) {
      setMessage(
        "Settings could not be saved because the settings row no longer exists. Refresh the page to recreate it.",
      );
      setSettingsId(null);
      setIsSaving(false);
      return;
    }

    const settingsRow = data as UserSettingsRow;
    writeBrokerCostModelToStorage({
      enabled: form.brokerCostsEnabled,
      broker: form.brokerCostBroker,
      market: "US",
      account_currency: "SEK",
      trade_currency: "USD",
      commission_mode: form.commissionMode,
      entry_fixed_commission: Number(form.entryFixedCommission),
      exit_fixed_commission: Number(form.exitFixedCommission),
      commission_percent: Number(form.commissionPercent),
      minimum_commission: Number(form.minimumCommission),
      fx_fee_percent: Number(form.fxFeePercent),
      estimated_usd_sek_rate: Number(form.estimatedUsdSekRate),
      include_entry_commission: form.includeEntryCommission,
      include_estimated_exit_commission: form.includeEstimatedExitCommission,
      include_fx_fee: form.includeFxFee,
      notes: "Broker costs are estimates. Always verify actual fees in Avanza.",
    });
    setSettingsId(settingsRow.id);
    setForm(toForm(settingsRow));
    setSuccessMessage("Settings saved.");
    setIsSaving(false);
  }

  async function copyBrowserAgentPlanJson() {
    try {
      await navigator.clipboard.writeText(browserAgentPlanJson);
      logBrowserAgentPrototypePlanEvent(
        "browser_agent_prototype_plan_copied",
        browserAgentPlan,
      );
      setBrowserAgentPlanCopyStatus("Browser agent plan JSON copied.");
    } catch {
      setBrowserAgentPlanCopyStatus("Copy failed. Open the JSON details and copy manually.");
    }
  }

  function updateAvanzaVerificationNote(
    noteId: string,
    patch: Partial<AvanzaFieldVerificationNote>,
  ) {
    setAvanzaNotesState((current) => {
      const updatedAt = new Date().toISOString();

      return {
        ...current,
        updated_at: updatedAt,
        notes: current.notes.map((note) =>
          note.note_id === noteId
            ? {
                ...note,
                ...patch,
                criticality:
                  note.criticality === "forbidden_final_confirmation"
                    ? "forbidden_final_confirmation"
                    : (patch.criticality ?? note.criticality),
                updated_at: updatedAt,
              }
            : note,
        ),
      };
    });
    setAvanzaNotesMessage("");
  }

  function saveAvanzaVerificationNotes() {
    const nextState = {
      ...avanzaNotesState,
      updated_at: new Date().toISOString(),
    };
    const nextValidation = validateAvanzaVerificationNotes(nextState);

    try {
      writeAvanzaVerificationNotesState(nextState);
      setAvanzaNotesState(nextState);
      logAvanzaVerificationNotesEvent(
        "avanza_verification_notes_saved",
        nextValidation,
      );
      setAvanzaNotesMessage("Manual Avanza verification notes saved locally.");
    } catch {
      setAvanzaNotesMessage("Could not save Avanza verification notes locally.");
    }
  }

  function resetAvanzaVerificationNotes() {
    const nextState = createDefaultAvanzaVerificationNotesState();
    const nextValidation = validateAvanzaVerificationNotes(nextState);

    try {
      writeAvanzaVerificationNotesState(nextState);
      setAvanzaNotesState(nextState);
      setAvanzaNotesImportJson("");
      logAvanzaVerificationNotesEvent(
        "avanza_verification_notes_reset",
        nextValidation,
      );
      setAvanzaNotesMessage("Manual Avanza verification notes reset locally.");
    } catch {
      setAvanzaNotesMessage("Could not reset Avanza verification notes locally.");
    }
  }

  async function copyAvanzaVerificationNotesJson() {
    try {
      await navigator.clipboard.writeText(avanzaNotesJson);
      logAvanzaVerificationNotesEvent(
        "avanza_verification_notes_exported",
        avanzaNotesValidation,
      );
      setAvanzaNotesMessage("Avanza verification notes JSON copied.");
    } catch {
      setAvanzaNotesMessage("Copy failed. Open the JSON details and copy manually.");
    }
  }

  function importAvanzaVerificationNotesJson() {
    try {
      const nextState = normalizeAvanzaVerificationNotesState(
        JSON.parse(avanzaNotesImportJson),
      );
      const nextValidation = validateAvanzaVerificationNotes(nextState);
      writeAvanzaVerificationNotesState(nextState);
      setAvanzaNotesState(nextState);
      logAvanzaVerificationNotesEvent(
        "avanza_verification_notes_imported",
        nextValidation,
      );
      setAvanzaNotesMessage("Avanza verification notes imported locally.");
    } catch {
      setAvanzaNotesMessage("Import failed. Paste valid Avanza notes JSON.");
    }
  }

  function updateRiskControlsSettings(
    patch: Partial<RiskControlsSettings>,
  ) {
    setRiskControlsSettings((current) => ({
      ...current,
      ...patch,
      updated_at: new Date().toISOString(),
    }));
    setRiskControlsMessage("");
  }

  function updateRiskControlsNumber(
    key: keyof Pick<
      RiskControlsSettings,
      | "max_risk_per_trade_amount"
      | "max_risk_per_trade_percent"
      | "account_size"
      | "default_risk_amount_per_trade"
      | "default_risk_percent_per_trade"
      | "max_position_value"
      | "max_daily_loss_amount"
      | "max_daily_loss_r"
      | "max_trades_per_day"
      | "max_open_positions"
      | "cooldown_after_loss_minutes"
    >,
    value: string,
  ) {
    const parsed = Number(value);
    updateRiskControlsSettings({
      [key]: Number.isFinite(parsed) && parsed > 0 ? parsed : null,
    } as Partial<RiskControlsSettings>);
  }

  function updateRiskControlsTickers(
    key: "allowed_tickers" | "blocked_tickers",
    value: string,
  ) {
    updateRiskControlsSettings({
      [key]: value
        .split(",")
        .map((item) => item.trim().toUpperCase())
        .filter(Boolean),
    });
  }

  function saveRiskControlsSettings() {
    const nextSettings = normalizeRiskControlsSettings({
      ...riskControlsSettings,
      updated_at: new Date().toISOString(),
    });

    try {
      writeRiskControlsSettings(nextSettings);
      setRiskControlsSettings(nextSettings);
      logRiskControlsSettingsEvent("risk_controls_saved", nextSettings);
      setRiskControlsMessage("Risk controls saved locally.");
    } catch {
      setRiskControlsMessage("Could not save risk controls locally.");
    }
  }

  function resetRiskControlsSettings() {
    const nextSettings = createDefaultRiskControlsSettings();

    try {
      writeRiskControlsSettings(nextSettings);
      setRiskControlsSettings(nextSettings);
      logRiskControlsSettingsEvent("risk_controls_reset", nextSettings);
      setRiskControlsMessage("Risk controls reset to defaults.");
    } catch {
      setRiskControlsMessage("Could not reset risk controls locally.");
    }
  }

  async function copyRiskControlsSettingsJson() {
    try {
      await navigator.clipboard.writeText(riskControlsJson);
      setRiskControlsMessage("Risk controls JSON copied.");
    } catch {
      setRiskControlsMessage("Copy failed. Open JSON details and copy manually.");
    }
  }

  const dataModeClaritySummary = buildDataModeClaritySummary({
    environment: process.env.NODE_ENV,
    demo_mode_enabled:
      process.env.NODE_ENV === "development" ||
      process.env.NEXT_PUBLIC_ENABLE_DEMO_TRADING_FLOW === "true",
    future_agent_packages: {
      available: true,
      count: 1,
    },
    mock_broker_tools_enabled:
      process.env.NODE_ENV === "development" ||
      process.env.NEXT_PUBLIC_ENABLE_DEMO_TRADING_FLOW === "true",
    supabase_connected: true,
    now: browserAgentPlanCreatedAt,
  });

  return (
    <main className="min-h-screen bg-[#060707] text-zinc-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-6 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              <span>Private app</span>
              <span className="h-1 w-1 rounded-full bg-emerald-400" />
              <span>Risk controls</span>
            </div>
            <div>
              <h1 className="font-mono text-4xl font-semibold tracking-normal text-white sm:text-5xl">
                Settings
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
                Personal trading limits for intraday recommendation flow and risk.
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-zinc-300 transition hover:border-white/25 hover:text-white"
          >
            Back to Trade
          </Link>
        </header>

        {message && (
          <div className="rounded-lg border border-amber-300/25 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
            {message}
          </div>
        )}

        {successMessage && (
          <div className="rounded-lg border border-[#00db94]/25 bg-[#00db94]/10 p-4 text-sm leading-6 text-emerald-100">
            {successMessage}
          </div>
        )}

        <section className="rounded-lg border border-cyan-300/15 bg-cyan-300/[0.045] p-4 text-sm leading-6 text-zinc-300">
          <div className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-cyan-100">
            Data / execution reality
          </div>
          <p className="mt-2">
            Risk controls and agent specs are configuration and read/prepare-only
            safety contracts. Ture does not send broker orders, handle
            credentials, control Avanza, or automate KÖP/SÄLJ.
          </p>
          <div
            id="trade-data-mode-clarity-json"
            data-agent-readable="true"
            className="sr-only"
          >
            {dataModeClaritySummaryJson(dataModeClaritySummary)}
          </div>
        </section>

        {isLoading ? (
          <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.025] p-8 text-center">
            <h2 className="font-mono text-lg font-semibold text-white">
              Loading settings
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
              Trade is reading your user_settings row.
            </p>
          </div>
        ) : (
          <form
            onSubmit={saveSettings}
            className="bg-surface-subtle rounded-lg border border-white/10 p-5"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <SettingsField label="Portfolio Size">
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.portfolioSize}
                  onChange={(event) =>
                    updateField("portfolioSize", event.target.value)
                  }
                  className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none transition focus:border-emerald-300"
                />
              </SettingsField>

              <SettingsField label="Risk Per Trade %">
                <input
                  required
                  type="number"
                  min="0.01"
                  max="5"
                  step="0.01"
                  value={form.riskPerTradePercent}
                  onChange={(event) =>
                    updateField("riskPerTradePercent", event.target.value)
                  }
                  className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none transition focus:border-emerald-300"
                />
              </SettingsField>

              <SettingsField label="Max Recommendations Per Session">
                <input
                  required
                  type="number"
                  min="1"
                  max="10"
                  step="1"
                  value={form.maxRecommendationsPerSession}
                  onChange={(event) =>
                    updateField(
                      "maxRecommendationsPerSession",
                      event.target.value,
                    )
                  }
                  className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none transition focus:border-emerald-300"
                />
              </SettingsField>

              <SettingsField label="Max Open Positions">
                <input
                  required
                  type="number"
                  min="1"
                  max="20"
                  step="1"
                  value={form.maxOpenPositions}
                  onChange={(event) =>
                    updateField("maxOpenPositions", event.target.value)
                  }
                  className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none transition focus:border-emerald-300"
                />
              </SettingsField>

              <SettingsField label="Preferred Timeframe">
                <input
                  required
                  type="text"
                  value={form.preferredTimeframe}
                  onChange={(event) =>
                    updateField("preferredTimeframe", event.target.value)
                  }
                  className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none transition focus:border-emerald-300"
                />
              </SettingsField>

              <div className="rounded-md border border-white/10 bg-black/25 p-4">
                <div className="flex min-h-12 items-center justify-between gap-4">
                  <div>
                    <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                      Long Only
                    </div>
                    <div className="mt-1 text-sm text-zinc-300">
                      {form.longOnly ? "Enabled" : "Disabled"}
                    </div>
                  </div>
                  <label className="relative inline-flex h-7 w-12 cursor-pointer items-center rounded-full border border-white/10 bg-zinc-800 transition has-[:checked]:border-[#00db94]/40 has-[:checked]:bg-[#00db94]/25">
                    <input
                      type="checkbox"
                      checked={form.longOnly}
                      onChange={(event) =>
                        updateField("longOnly", event.target.checked)
                      }
                      className="peer sr-only"
                    />
                    <span className="ml-1 h-5 w-5 rounded-full bg-zinc-500 transition peer-checked:translate-x-5 peer-checked:bg-emerald-200" />
                  </label>
                </div>
              </div>
            </div>

            <section className="mt-6 rounded-lg border border-cyan-300/15 bg-cyan-300/[0.035] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-mono text-sm font-bold uppercase tracking-[0.16em] text-cyan-100">
                    Broker Cost Model
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Broker costs are estimates. Always verify actual fees in
                    Avanza.
                  </p>
                </div>
                <label className="relative inline-flex h-7 w-12 cursor-pointer items-center rounded-full border border-white/10 bg-zinc-800 transition has-[:checked]:border-[#00db94]/40 has-[:checked]:bg-[#00db94]/25">
                  <input
                    type="checkbox"
                    checked={form.brokerCostsEnabled}
                    onChange={(event) =>
                      updateField("brokerCostsEnabled", event.target.checked)
                    }
                    className="peer sr-only"
                  />
                  <span className="ml-1 h-5 w-5 rounded-full bg-zinc-500 transition peer-checked:translate-x-5 peer-checked:bg-emerald-200" />
                </label>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <SettingsField label="Broker">
                  <select
                    value={form.brokerCostBroker}
                    onChange={(event) =>
                      updateField(
                        "brokerCostBroker",
                        event.target.value as BrokerCostModel["broker"],
                      )
                    }
                    className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none transition focus:border-emerald-300"
                  >
                    <option value="AVANZA">Avanza</option>
                    <option value="CUSTOM">Custom</option>
                  </select>
                </SettingsField>

                <SettingsField label="Commission Mode">
                  <select
                    value={form.commissionMode}
                    onChange={(event) =>
                      updateField(
                        "commissionMode",
                        event.target.value as BrokerCostModel["commission_mode"],
                      )
                    }
                    className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none transition focus:border-emerald-300"
                  >
                    <option value="fixed">Fixed</option>
                    <option value="percentage">Percentage</option>
                    <option value="fixed_plus_percentage">
                      Fixed + percentage
                    </option>
                  </select>
                </SettingsField>

                <SettingsField label="Entry Fixed Commission SEK">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.entryFixedCommission}
                    onChange={(event) =>
                      updateField("entryFixedCommission", event.target.value)
                    }
                    className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none transition focus:border-emerald-300"
                  />
                </SettingsField>

                <SettingsField label="Exit Fixed Commission SEK">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.exitFixedCommission}
                    onChange={(event) =>
                      updateField("exitFixedCommission", event.target.value)
                    }
                    className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none transition focus:border-emerald-300"
                  />
                </SettingsField>

                <SettingsField label="Commission Percent">
                  <input
                    type="number"
                    min="0"
                    step="0.001"
                    value={form.commissionPercent}
                    onChange={(event) =>
                      updateField("commissionPercent", event.target.value)
                    }
                    className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none transition focus:border-emerald-300"
                  />
                </SettingsField>

                <SettingsField label="Minimum Commission SEK">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.minimumCommission}
                    onChange={(event) =>
                      updateField("minimumCommission", event.target.value)
                    }
                    className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none transition focus:border-emerald-300"
                  />
                </SettingsField>

                <SettingsField label="FX Fee Percent">
                  <input
                    type="number"
                    min="0"
                    step="0.001"
                    value={form.fxFeePercent}
                    onChange={(event) =>
                      updateField("fxFeePercent", event.target.value)
                    }
                    className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none transition focus:border-emerald-300"
                  />
                </SettingsField>

                <SettingsField label="Estimated USD/SEK Rate">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.estimatedUsdSekRate}
                    onChange={(event) =>
                      updateField("estimatedUsdSekRate", event.target.value)
                    }
                    className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none transition focus:border-emerald-300"
                  />
                </SettingsField>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <SettingsToggle
                  label="Include entry commission"
                  checked={form.includeEntryCommission}
                  onChange={(checked) =>
                    updateField("includeEntryCommission", checked)
                  }
                />
                <SettingsToggle
                  label="Include estimated exit commission"
                  checked={form.includeEstimatedExitCommission}
                  onChange={(checked) =>
                    updateField("includeEstimatedExitCommission", checked)
                  }
                />
                <SettingsToggle
                  label="Include FX fee"
                  checked={form.includeFxFee}
                  onChange={(checked) => updateField("includeFxFee", checked)}
                />
              </div>
            </section>

            <RiskControlsSettingsPanel
              settings={riskControlsSettings}
              settingsJson={riskControlsJson}
              message={riskControlsMessage}
              onUpdate={updateRiskControlsSettings}
              onUpdateNumber={updateRiskControlsNumber}
              onUpdateTickers={updateRiskControlsTickers}
              onSave={saveRiskControlsSettings}
              onReset={resetRiskControlsSettings}
              onCopyJson={copyRiskControlsSettingsJson}
            />

            <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-6 text-zinc-500">
                These controls are saved for future intraday trading logic.
              </p>
              <button
                type="submit"
                disabled={isSaving}
                className="min-h-11 rounded-full bg-white px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-zinc-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
              >
                {isSaving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </form>
        )}

        <AutomationStatusPanel
          automationRuns={automationRuns}
          isLoading={isLoadingAutomationRuns}
          message={automationMessage}
          marketStatus={marketStatus}
          marketStatusMessage={marketStatusMessage}
          onRefresh={loadAutomationRuns}
        />

        <BrowserAgentPrototypePlanPanel
          plan={browserAgentPlan}
          planJson={browserAgentPlanJson}
          copyStatus={browserAgentPlanCopyStatus}
          onCopy={copyBrowserAgentPlanJson}
        />

        <AvanzaVerificationNotesPanel
          state={avanzaNotesState}
          validation={avanzaNotesValidation}
          notesJson={avanzaNotesJson}
          message={avanzaNotesMessage}
          importJson={avanzaNotesImportJson}
          onImportJsonChange={setAvanzaNotesImportJson}
          onUpdateNote={updateAvanzaVerificationNote}
          onSave={saveAvanzaVerificationNotes}
          onReset={resetAvanzaVerificationNotes}
          onCopyJson={copyAvanzaVerificationNotesJson}
          onImportJson={importAvanzaVerificationNotesJson}
        />
      </div>
    </main>
  );
}

function SettingsField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block rounded-md border border-white/10 bg-black/25 p-4">
      <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function RiskControlsSettingsPanel({
  settings,
  settingsJson,
  message,
  onUpdate,
  onUpdateNumber,
  onUpdateTickers,
  onSave,
  onReset,
  onCopyJson,
}: {
  settings: RiskControlsSettings;
  settingsJson: string;
  message: string;
  onUpdate: (patch: Partial<RiskControlsSettings>) => void;
  onUpdateNumber: (
    key: keyof Pick<
      RiskControlsSettings,
      | "max_risk_per_trade_amount"
      | "max_risk_per_trade_percent"
      | "account_size"
      | "default_risk_amount_per_trade"
      | "default_risk_percent_per_trade"
      | "max_position_value"
      | "max_daily_loss_amount"
      | "max_daily_loss_r"
      | "max_trades_per_day"
      | "max_open_positions"
      | "cooldown_after_loss_minutes"
    >,
    value: string,
  ) => void;
  onUpdateTickers: (
    key: "allowed_tickers" | "blocked_tickers",
    value: string,
  ) => void;
  onSave: () => void;
  onReset: () => void;
  onCopyJson: () => void;
}) {
  return (
    <section className="mt-6 rounded-lg border border-amber-300/15 bg-amber-300/[0.035] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-mono text-sm font-bold uppercase tracking-[0.16em] text-amber-100">
            Risk Controls
          </h3>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Local Ture-layer limits for warning and strict trade creation gates.
            They do not control brokers, submit orders, or block closing trades.
          </p>
        </div>
        <SettingsToggle
          label={settings.enabled ? "Enabled" : "Disabled"}
          checked={settings.enabled}
          onChange={(checked) => onUpdate({ enabled: checked })}
        />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <SettingsField label="Mode">
          <select
            value={settings.mode}
            onChange={(event) =>
              onUpdate({ mode: event.target.value as RiskControlsMode })
            }
            className="mt-2 min-h-12 w-full cursor-pointer rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none transition focus:border-amber-300"
          >
            <option value="demo">Demo - warnings only</option>
            <option value="real_prep">Real prep - manual review</option>
            <option value="strict">Strict - block new trade creation</option>
          </select>
        </SettingsField>

        <SettingsField label="Default Position Size Mode">
          <select
            value={settings.default_position_size_mode}
            onChange={(event) =>
              onUpdate({
                default_position_size_mode: event.target
                  .value as RiskControlsPositionSizeMode,
              })
            }
            className="mt-2 min-h-12 w-full cursor-pointer rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none transition focus:border-amber-300"
          >
            <option value="manual">Manual</option>
            <option value="risk_based">Risk based</option>
          </select>
        </SettingsField>

        <SettingsField label="Position Sizing Mode">
          <select
            value={settings.position_sizing_mode}
            onChange={(event) =>
              onUpdate({
                position_sizing_mode: event.target
                  .value as RiskControlsPositionSizingMode,
              })
            }
            className="mt-2 min-h-12 w-full cursor-pointer rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none transition focus:border-amber-300"
          >
            <option value="manual">Manual</option>
            <option value="risk_controls">Risk controls</option>
            <option value="fixed_risk_amount">Fixed risk amount</option>
            <option value="fixed_risk_percent">Fixed risk percent</option>
            <option value="max_affordable">Max affordable</option>
          </select>
        </SettingsField>

        {[
          ["Max Risk Per Trade Amount", "max_risk_per_trade_amount"],
          ["Max Risk Per Trade %", "max_risk_per_trade_percent"],
          ["Account Size", "account_size"],
          ["Default Risk Amount / Trade", "default_risk_amount_per_trade"],
          ["Default Risk % / Trade", "default_risk_percent_per_trade"],
          ["Max Position Value", "max_position_value"],
          ["Max Daily Loss Amount", "max_daily_loss_amount"],
          ["Max Daily Loss R", "max_daily_loss_r"],
          ["Max Trades Per Day", "max_trades_per_day"],
          ["Max Open Positions", "max_open_positions"],
        ].map(([label, key]) => (
          <SettingsField key={key} label={label}>
            <input
              type="number"
              min="0"
              step={key.includes("trades") || key.includes("positions") ? "1" : "0.01"}
              value={
                settings[key as keyof RiskControlsSettings] === null
                  ? ""
                  : String(settings[key as keyof RiskControlsSettings])
              }
              onChange={(event) =>
                onUpdateNumber(
                  key as Parameters<typeof onUpdateNumber>[0],
                  event.target.value,
                )
              }
              placeholder="Optional"
              className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none placeholder:text-zinc-600 focus:border-amber-300"
            />
          </SettingsField>
        ))}

        <SettingsField label="Allowed Tickers">
          <input
            value={settings.allowed_tickers.join(", ")}
            onChange={(event) =>
              onUpdateTickers("allowed_tickers", event.target.value)
            }
            placeholder="Optional comma-separated list"
            className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none placeholder:text-zinc-600 focus:border-amber-300"
          />
        </SettingsField>

        <SettingsField label="Blocked Tickers">
          <input
            value={settings.blocked_tickers.join(", ")}
            onChange={(event) =>
              onUpdateTickers("blocked_tickers", event.target.value)
            }
            placeholder="Optional comma-separated list"
            className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none placeholder:text-zinc-600 focus:border-amber-300"
          />
        </SettingsField>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <SettingsToggle
          label="Require manual review for real mode"
          checked={settings.require_manual_review_for_real_mode}
          onChange={(checked) =>
            onUpdate({ require_manual_review_for_real_mode: checked })
          }
        />
        <SettingsToggle
          label="Block new trades after daily stop"
          checked={settings.block_new_trades_after_daily_stop}
          onChange={(checked) =>
            onUpdate({ block_new_trades_after_daily_stop: checked })
          }
        />
        <SettingsToggle
          label="Cooldown after loss"
          checked={settings.cooldown_after_loss_enabled}
          onChange={(checked) =>
            onUpdate({ cooldown_after_loss_enabled: checked })
          }
        />
        <SettingsField label="Cooldown Minutes">
          <input
            type="number"
            min="1"
            step="1"
            value={settings.cooldown_after_loss_minutes ?? ""}
            onChange={(event) =>
              onUpdateNumber("cooldown_after_loss_minutes", event.target.value)
            }
            placeholder="Optional"
            className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none placeholder:text-zinc-600 focus:border-amber-300"
          />
        </SettingsField>
      </div>

      <SettingsField label="Notes">
        <textarea
          value={settings.notes ?? ""}
          onChange={(event) => onUpdate({ notes: event.target.value || null })}
          rows={3}
          className="mt-2 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm leading-6 text-white outline-none focus:border-amber-300"
        />
      </SettingsField>

      <div className="mt-4 rounded-md border border-white/10 bg-black/25 p-4 text-sm leading-6 text-zinc-400">
        Strict mode can block new Live Day Trade creation when limits are
        breached. Closing or selling an existing trade is never blocked by risk
        controls.
      </div>

      <div
        id="trade-risk-controls-settings-json"
        data-agent-readable="true"
        className="sr-only"
      >
        {settingsJson}
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onSave}
          className="min-h-11 cursor-pointer rounded-full bg-white px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-zinc-950 transition hover:bg-amber-100"
        >
          Save Risk Controls
        </button>
        <button
          type="button"
          onClick={onCopyJson}
          className="min-h-11 cursor-pointer rounded-full border border-amber-200/20 bg-amber-200/[0.06] px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-amber-100 transition hover:border-amber-100/40 hover:text-white"
        >
          Copy JSON
        </button>
        <button
          type="button"
          onClick={onReset}
          className="min-h-11 cursor-pointer rounded-full border border-rose-200/20 bg-rose-200/[0.06] px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-rose-100 transition hover:border-rose-100/40 hover:text-white"
        >
          Reset
        </button>
      </div>

      <details className="mt-4 rounded-md border border-white/10 bg-black/25 p-4">
        <summary className="cursor-pointer font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-300">
          View risk controls JSON
        </summary>
        <pre className="mt-4 max-h-80 overflow-auto rounded-md border border-white/10 bg-black/40 p-4 text-xs leading-5 text-zinc-300">
          {settingsJson}
        </pre>
      </details>

      {message && (
        <div className="mt-4 rounded-md border border-[#00db94]/20 bg-[#00db94]/10 p-3 text-sm text-emerald-100">
          {message}
        </div>
      )}
    </section>
  );
}

function SettingsToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-12 items-center justify-between gap-3 rounded-md border border-white/10 bg-black/25 px-4 py-3">
      <span className="text-sm text-zinc-300">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 shrink-0 accent-[#00db94]"
      />
    </label>
  );
}

function BrowserAgentPrototypePlanPanel({
  plan,
  planJson,
  copyStatus,
  onCopy,
}: {
  plan: BrowserAgentPrototypePlan;
  planJson: string;
  copyStatus: string;
  onCopy: () => void;
}) {
  const currentPhase = plan.phases.find(
    (phase) => phase.phase_id === plan.current_phase_id,
  );
  const majorBlockers = plan.hard_stops.slice(0, 6);
  const visibleHumanCheckpoints = plan.human_checkpoints.slice(0, 5);
  const visibleForbiddenActions = plan.forbidden_actions.slice(0, 6);

  return (
    <section className="bg-surface-subtle rounded-lg border border-cyan-300/15 p-5">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-200">
            Developer / Safety Spec
          </div>
          <h2 className="mt-2 font-mono text-2xl font-semibold tracking-normal text-white">
            Browser Agent Prototype Plan v2
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Read-only future-agent plan. Real broker execution stays human-only;
            no browser agent runtime, Avanza automation, credentials, or order
            submission is enabled.
          </p>
        </div>

        <button
          type="button"
          onClick={onCopy}
          className="min-h-11 cursor-pointer rounded-full border border-cyan-200/20 bg-cyan-200/[0.06] px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-cyan-100 transition hover:border-cyan-100/40 hover:text-white"
        >
          Copy Browser Agent Plan JSON
        </button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <PlanMetric
          label="Readiness"
          value={formatPlanValue(plan.overall_readiness_status)}
        />
        <PlanMetric
          label="Current phase"
          value={currentPhase?.title ?? plan.current_phase_label}
        />
        <PlanMetric
          label="DOM contracts"
          value={String(plan.required_dom_blocks.length)}
        />
        <PlanMetric
          label="Real broker agent"
          value={plan.can_run_real_broker_agent ? "Enabled" : "Disabled"}
        />
      </div>

      <div className="mt-4 rounded-md border border-white/10 bg-black/25 p-4">
        <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Next Recommended Action
        </div>
        <p className="mt-2 text-sm leading-6 text-zinc-200">
          {plan.next_recommended_action}
        </p>
        <p className="mt-2 text-sm leading-6 text-amber-100">
          Avanza is not ready yet: {plan.why_avanza_is_not_ready_yet}
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-zinc-500">
            Local/dev mock only. This harness does not connect to Avanza.
          </p>
          <Link
            href="/mock-broker"
            className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-cyan-200/20 bg-cyan-200/[0.06] px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-cyan-100 transition hover:border-cyan-100/40 hover:text-white"
          >
            Open Mock Broker Dry Run Harness
          </Link>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <PlanList
          title="Major hard stops"
          items={majorBlockers.map((stop) => stop.label)}
        />
        <PlanList
          title="Human checkpoints"
          items={visibleHumanCheckpoints.map((checkpoint) => checkpoint.label)}
        />
        <PlanList
          title="Forbidden actions"
          items={visibleForbiddenActions.map((action) => action.label)}
        />
      </div>

      <details className="mt-4 rounded-md border border-white/10 bg-black/25 p-4">
        <summary className="cursor-pointer font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-300">
          View phases and required DOM blocks
        </summary>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div>
            <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Phases
            </h3>
            <div className="mt-3 space-y-3">
              {plan.phases.map((phase) => (
                <div
                  key={phase.phase_id}
                  className="rounded-md border border-white/10 bg-white/[0.025] p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="font-mono text-xs font-semibold text-white">
                      Phase {phase.phase_number}: {phase.title}
                    </div>
                    <StatusPill status={formatPlanValue(phase.status)} />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    {phase.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Required DOM Blocks
            </h3>
            <div className="mt-3 max-h-96 overflow-auto rounded-md border border-white/10 bg-black/30 p-3">
              <ul className="space-y-2 text-xs leading-5 text-zinc-300">
                {plan.required_dom_blocks.map((block) => (
                  <li key={block.dom_id}>
                    <span className="font-mono text-cyan-100">
                      {block.dom_id}
                    </span>
                    <span className="text-zinc-500"> - {block.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </details>

      <details className="mt-4 rounded-md border border-white/10 bg-black/25 p-4">
        <summary className="cursor-pointer font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-300">
          View browser agent plan JSON
        </summary>
        <pre className="mt-4 max-h-96 overflow-auto rounded-md border border-white/10 bg-black/40 p-4 text-xs leading-5 text-zinc-300">
          {planJson}
        </pre>
      </details>

      <div
        id="trade-browser-agent-prototype-plan-json"
        data-agent-readable="true"
        className="sr-only"
      >
        {planJson}
      </div>

      {copyStatus && (
        <div className="mt-4 rounded-md border border-[#00db94]/20 bg-[#00db94]/10 p-3 text-sm text-emerald-100">
          {copyStatus}
        </div>
      )}
    </section>
  );
}

function AvanzaVerificationNotesPanel({
  state,
  validation,
  notesJson,
  message,
  importJson,
  onImportJsonChange,
  onUpdateNote,
  onSave,
  onReset,
  onCopyJson,
  onImportJson,
}: {
  state: AvanzaVerificationNotesState;
  validation: AvanzaVerificationNotesValidation;
  notesJson: string;
  message: string;
  importJson: string;
  onImportJsonChange: (value: string) => void;
  onUpdateNote: (
    noteId: string,
    patch: Partial<AvanzaFieldVerificationNote>,
  ) => void;
  onSave: () => void;
  onReset: () => void;
  onCopyJson: () => void;
  onImportJson: () => void;
}) {
  const buyNotes = state.notes.filter((note) => note.side === "BUY");
  const sellNotes = state.notes.filter((note) => note.side === "SELL");

  return (
    <section className="bg-surface-subtle rounded-lg border border-violet-300/15 p-5">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-200">
            Manual Verification
          </div>
          <h2 className="mt-2 font-mono text-2xl font-semibold tracking-normal text-white">
            Manual Avanza Field Verification Notes
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
            Local notes for real Avanza labels, steps, selector notes, and
            screenshot references. These notes now feed runtime Avanza Field
            Verification Reports for prepare-only readiness; they do not control
            Avanza and never permit order submission.
          </p>
        </div>

        <span
          className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${verificationNotesStatusTone(
            validation.status,
          )}`}
        >
          {formatPlanValue(validation.status)}
        </span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <PlanMetric
          label="Verified critical"
          value={String(validation.summary.verified_critical_fields_count)}
        />
        <PlanMetric
          label="Missing critical"
          value={String(validation.summary.missing_critical_fields_count)}
        />
        <PlanMetric
          label="Mismatches"
          value={String(validation.summary.mismatch_count)}
        />
        <PlanMetric
          label="Can submit order"
          value={validation.summary.can_future_agent_submit_order ? "Yes" : "No"}
        />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <PlanMetric
          label="Future buy prepare"
          value={
            validation.summary.can_future_agent_prepare_buy_form
              ? "Ready"
              : "Blocked"
          }
        />
        <PlanMetric
          label="Future sell prepare"
          value={
            validation.summary.can_future_agent_prepare_sell_form
              ? "Ready"
              : "Blocked"
          }
        />
      </div>

      <div className="mt-4 rounded-md border border-amber-300/20 bg-amber-300/[0.055] p-4 text-sm leading-6 text-amber-100">
        Verified final KÖP/SÄLJ button notes only document the stop boundary.
        They do not mean an agent may click them. Final Avanza confirmation
        remains human-only.
      </div>

      <div className="mt-4 rounded-md border border-cyan-300/15 bg-cyan-300/[0.045] p-4 text-sm leading-6 text-cyan-100/90">
        Runtime reports can use verified BUY/SELL critical notes to show
        prepare-only readiness. Order submission remains impossible in Ture and
        can_future_agent_submit_order stays false.
      </div>

      {(validation.blockers.length > 0 || validation.warnings.length > 0) && (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <PlanList
            title="Blockers"
            items={validation.blockers.map((blocker) => blocker.message)}
          />
          <PlanList
            title="Warnings"
            items={validation.warnings.map((warning) => warning.message)}
          />
        </div>
      )}

      <details className="mt-4 rounded-md border border-white/10 bg-black/25 p-4" open>
        <summary className="cursor-pointer font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-300">
          BUY verification notes
        </summary>
        <AvanzaVerificationNotesTable
          notes={buyNotes}
          onUpdateNote={onUpdateNote}
        />
      </details>

      <details className="mt-4 rounded-md border border-white/10 bg-black/25 p-4">
        <summary className="cursor-pointer font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-300">
          SELL verification notes
        </summary>
        <AvanzaVerificationNotesTable
          notes={sellNotes}
          onUpdateNote={onUpdateNote}
        />
      </details>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onSave}
          className="min-h-11 cursor-pointer rounded-full bg-white px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-zinc-950 transition hover:bg-violet-100"
        >
          Save Notes Locally
        </button>
        <button
          type="button"
          onClick={onCopyJson}
          className="min-h-11 cursor-pointer rounded-full border border-violet-200/20 bg-violet-200/[0.06] px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-violet-100 transition hover:border-violet-100/40 hover:text-white"
        >
          Export / Copy JSON
        </button>
        <button
          type="button"
          onClick={onReset}
          className="min-h-11 cursor-pointer rounded-full border border-rose-200/20 bg-rose-200/[0.06] px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-rose-100 transition hover:border-rose-100/40 hover:text-white"
        >
          Reset Defaults
        </button>
      </div>

      <details className="mt-4 rounded-md border border-white/10 bg-black/25 p-4">
        <summary className="cursor-pointer font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-300">
          Import / export verification notes JSON
        </summary>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div>
            <label className="block">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                Import JSON
              </span>
              <textarea
                value={importJson}
                onChange={(event) => onImportJsonChange(event.target.value)}
                rows={10}
                className="mt-2 w-full rounded-md border border-white/10 bg-black/35 p-3 font-mono text-xs leading-5 text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-violet-200/50"
                placeholder="Paste exported Avanza verification notes JSON..."
              />
            </label>
            <button
              type="button"
              onClick={onImportJson}
              className="mt-3 min-h-10 cursor-pointer rounded-md border border-violet-300/30 bg-violet-300/10 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-violet-100 transition hover:border-violet-200/70"
            >
              Import JSON
            </button>
          </div>
          <div>
            <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Current JSON
            </div>
            <pre className="mt-2 max-h-80 overflow-auto rounded-md border border-white/10 bg-black/40 p-4 text-xs leading-5 text-zinc-300">
              {notesJson}
            </pre>
          </div>
        </div>
      </details>

      <div className="mt-4 rounded-md border border-white/10 bg-black/25 p-4">
        <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Storage
        </div>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Saved locally under{" "}
          <span className="font-mono text-zinc-200">
            {AVANZA_VERIFICATION_NOTES_STORAGE_KEY}
          </span>
          . No DB persistence is used.
        </p>
      </div>

      {message && (
        <div className="mt-4 rounded-md border border-[#00db94]/20 bg-[#00db94]/10 p-3 text-sm text-emerald-100">
          {message}
        </div>
      )}
    </section>
  );
}

function AvanzaVerificationNotesTable({
  notes,
  onUpdateNote,
}: {
  notes: AvanzaFieldVerificationNote[];
  onUpdateNote: (
    noteId: string,
    patch: Partial<AvanzaFieldVerificationNote>,
  ) => void;
}) {
  return (
    <div className="mt-4 space-y-4">
      {notes.map((note) => (
        <div
          key={note.note_id}
          className="rounded-md border border-white/10 bg-black/25 p-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-sm font-semibold text-white">
                {note.display_label}
              </p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                {note.expected_generic_label}
              </p>
            </div>
            <span
              className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${verificationCriticalityTone(
                note.criticality,
              )}`}
            >
              {formatPlanValue(note.criticality)}
            </span>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
                Status
              </span>
              <select
                value={note.status}
                onChange={(event) =>
                  onUpdateNote(note.note_id, {
                    status: event.target.value as AvanzaVerificationNoteStatus,
                  })
                }
                className="mt-2 min-h-11 w-full cursor-pointer rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none focus:border-violet-200/50"
              >
                <option value="unverified">Unverified</option>
                <option value="verified">Verified</option>
                <option value="mismatch">Mismatch</option>
                <option value="needs_review">Needs review</option>
                <option value="deprecated">Deprecated</option>
              </select>
            </label>

            <label className="block">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
                Criticality
              </span>
              <select
                value={note.criticality}
                disabled={note.criticality === "forbidden_final_confirmation"}
                onChange={(event) =>
                  onUpdateNote(note.note_id, {
                    criticality: event.target.value as AvanzaVerificationCriticality,
                  })
                }
                className="mt-2 min-h-11 w-full cursor-pointer rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none focus:border-violet-200/50 disabled:cursor-not-allowed disabled:text-zinc-500"
              >
                <option value="critical">Critical</option>
                <option value="important">Important</option>
                <option value="optional">Optional</option>
                <option value="forbidden_final_confirmation">
                  Forbidden final confirmation
                </option>
              </select>
            </label>

            <label className="block">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
                Actual Avanza label
              </span>
              <input
                value={note.actual_avanza_label}
                onChange={(event) =>
                  onUpdateNote(note.note_id, {
                    actual_avanza_label: event.target.value,
                  })
                }
                className="mt-2 min-h-11 w-full rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-violet-200/50"
              />
            </label>

            <label className="block">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
                Selector / data-testid note
              </span>
              <input
                value={note.selector_or_data_testid_note}
                onChange={(event) =>
                  onUpdateNote(note.note_id, {
                    selector_or_data_testid_note: event.target.value,
                  })
                }
                placeholder="Manual note only; do not invent selectors"
                className="mt-2 min-h-11 w-full rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-violet-200/50"
              />
            </label>

            <label className="block">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
                Source
              </span>
              <select
                value={note.source}
                onChange={(event) =>
                  onUpdateNote(note.note_id, {
                    source: event.target.value as AvanzaVerificationNoteSource,
                  })
                }
                className="mt-2 min-h-11 w-full cursor-pointer rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none focus:border-violet-200/50"
              >
                <option value="user_note">User note</option>
                <option value="manual_observation">Manual observation</option>
                <option value="screenshot_reference">Screenshot reference</option>
                <option value="dom_inspection">DOM inspection note</option>
              </select>
            </label>

            <label className="block">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
                Screenshot reference
              </span>
              <input
                value={note.screenshot_reference}
                onChange={(event) =>
                  onUpdateNote(note.note_id, {
                    screenshot_reference: event.target.value,
                  })
                }
                className="mt-2 min-h-11 w-full rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-violet-200/50"
              />
            </label>

            <label className="block">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
                Verified date
              </span>
              <input
                value={note.verified_at}
                onChange={(event) =>
                  onUpdateNote(note.note_id, {
                    verified_at: event.target.value,
                  })
                }
                placeholder="YYYY-MM-DD"
                className="mt-2 min-h-11 w-full rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-violet-200/50"
              />
            </label>

            <label className="block">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
                Verified by
              </span>
              <input
                value={note.verified_by}
                onChange={(event) =>
                  onUpdateNote(note.note_id, {
                    verified_by: event.target.value,
                  })
                }
                className="mt-2 min-h-11 w-full rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-violet-200/50"
              />
            </label>
          </div>

          <label className="mt-3 block">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
              Notes
            </span>
            <textarea
              value={note.notes}
              onChange={(event) =>
                onUpdateNote(note.note_id, { notes: event.target.value })
              }
              rows={2}
              className="mt-2 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm leading-6 text-white outline-none focus:border-violet-200/50"
            />
          </label>

          {note.criticality === "forbidden_final_confirmation" && (
            <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
              Verification here only documents the final button. It never gives
              an agent permission to click KÖP/SÄLJ.
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function verificationNotesStatusTone(
  status: AvanzaVerificationNotesValidation["status"],
) {
  if (status === "ready") {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }

  if (status === "needs_review") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  if (status === "blocked") {
    return "border-rose-300/30 bg-rose-300/10 text-rose-100";
  }

  return "border-white/10 bg-white/[0.035] text-zinc-400";
}

function verificationCriticalityTone(criticality: AvanzaVerificationCriticality) {
  if (criticality === "critical") {
    return "border-rose-300/30 bg-rose-300/10 text-rose-100";
  }

  if (criticality === "forbidden_final_confirmation") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  if (criticality === "important") {
    return "border-cyan-300/30 bg-cyan-300/10 text-cyan-100";
  }

  return "border-white/10 bg-white/[0.035] text-zinc-400";
}

function PlanMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-black/25 p-4">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
        {label}
      </div>
      <div className="mt-2 break-words font-mono text-sm text-white">
        {value || "Not available"}
      </div>
    </div>
  );
}

function PlanList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-md border border-white/10 bg-black/25 p-4">
      <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {title}
      </h3>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-300">
        {items.length > 0 ? (
          items.map((item) => <li key={item}>{item}</li>)
        ) : (
          <li>Not available</li>
        )}
      </ul>
    </div>
  );
}

function formatPlanValue(value: string) {
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function AutomationStatusPanel({
  automationRuns,
  isLoading,
  message,
  marketStatus,
  marketStatusMessage,
  onRefresh,
}: {
  automationRuns: ScheduledScanRun[];
  isLoading: boolean;
  message: string;
  marketStatus: MarketStatus | null;
  marketStatusMessage: string;
  onRefresh: () => void;
}) {
  const lastAutomationRun = automationRuns[0] ?? null;
  const currentWindow = getIntradayScanWindow(new Date());

  return (
    <section className="bg-surface-subtle rounded-lg border border-white/10 p-5">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
            Automation
          </div>
          <h2 className="mt-2 font-mono text-2xl font-semibold tracking-normal text-white">
            Automation Status
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Scheduled scans are triggered by Netlify every 15 minutes on
            weekdays. Trade checks the market calendar and only generates day
            trade recommendations inside active intraday windows.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="min-h-11 rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-zinc-300 transition hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:text-zinc-600"
        >
          {isLoading ? "Refreshing..." : "Refresh Status"}
        </button>
      </div>

      <div className="mt-5 space-y-3">
        <MarketCalendarStatusCard
          marketStatus={marketStatus}
          isLoading={isLoading}
          message={marketStatusMessage}
        />

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-md border border-white/10 bg-black/25 p-4">
            <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Current intraday window
            </div>
            <div className="mt-2 font-mono text-sm text-white">
              {getIntradayScanWindowLabel(currentWindow)}
            </div>
          </div>

          <div className="rounded-md border border-white/10 bg-black/25 p-4">
            <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Active day trading hours
            </div>
            <div className="mt-2 font-mono text-sm text-white">
              09:30&ndash;16:00 New York time
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className="mt-5 rounded-lg border border-amber-300/25 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
          {message}
        </div>
      )}

      {isLoading ? (
        <div className="mt-5 rounded-lg border border-dashed border-white/15 bg-white/[0.025] p-6 text-center">
          <h3 className="font-mono text-base font-semibold text-white">
            Loading automation status
          </h3>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Trade is reading recent scheduled_scan_runs rows.
          </p>
        </div>
      ) : automationRuns.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-white/15 bg-white/[0.025] p-6 text-center text-sm leading-6 text-zinc-400">
          No automated scans have run yet.
        </div>
      ) : (
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <AutomationInfoCard
            title="Current Window"
            details={[
              ["Window", getIntradayScanWindowLabel(currentWindow)],
              ["Market", getMarketStatusLabel(marketStatus)],
            ]}
          />
          <AutomationInfoCard
            title="Last Scan"
            details={[
              ["Window", getScanWindowFromRunMessage(lastAutomationRun?.message ?? null)],
              ["Legacy session", formatSessionType(lastAutomationRun?.session_type ?? null)],
            ]}
          />
          <AutomationRunCard
            title="Latest Result"
            run={lastAutomationRun}
          />
        </div>
      )}
    </section>
  );
}

function AutomationInfoCard({
  title,
  details,
}: {
  title: string;
  details: [string, string][];
}) {
  return (
    <article className="rounded-md border border-white/10 bg-black/25 p-4">
      <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {title}
      </h3>
      <dl className="mt-4 space-y-3 text-sm">
        {details.map(([label, value]) => (
          <AutomationDetail key={label} label={label} value={value} />
        ))}
      </dl>
    </article>
  );
}

function AutomationRunCard({
  title,
  run,
}: {
  title: string;
  run: ScheduledScanRun | null;
}) {
  return (
    <article className="rounded-md border border-white/10 bg-black/25 p-4">
      <div className="flex min-h-8 items-start justify-between gap-3">
        <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          {title}
        </h3>
        {run && <StatusPill status={run.status} />}
      </div>

      {run ? (
        <dl className="mt-4 space-y-3 text-sm">
          <AutomationDetail
            label="Legacy session"
            value={formatSessionType(run.session_type)}
          />
          <AutomationDetail
            label="Scan window"
            value={getScanWindowFromRunMessage(run.message)}
          />
          <AutomationDetail
            label="Recommendations created"
            value={String(run.recommendations_created ?? 0)}
          />
          <AutomationDetail label="Status" value={run.status ?? "Unknown"} />
          <AutomationDetail
            label="Message"
            value={run.message?.trim() || "No message recorded"}
          />
          <AutomationDetail
            label="Created at"
            value={formatDateTime(run.created_at)}
          />
        </dl>
      ) : (
        <p className="mt-4 text-sm leading-6 text-zinc-500">
          No run has been recorded for this scan type yet.
        </p>
      )}
    </article>
  );
}

function getMarketStatusLabel(marketStatus: MarketStatus | null) {
  if (!marketStatus) {
    return "Unknown";
  }

  if (marketStatus.dayType === "early_close") {
    return "Early close";
  }

  if (marketStatus.dayType === "unknown") {
    return "Unknown";
  }

  return marketStatus.isOpenDay ? "Open" : "Closed";
}

function getMarketStatusBadgeStatus(
  marketStatus: MarketStatus | null,
  isLoading: boolean,
) {
  if (isLoading) {
    return "Loading";
  }

  if (!marketStatus) {
    return "Unknown";
  }

  if (marketStatus.dayType === "unknown") {
    return "Provider unavailable";
  }

  return marketStatus.isOpenDay ? "completed" : "Closed";
}

function MarketCalendarStatusCard({
  marketStatus,
  isLoading,
  message,
}: {
  marketStatus: MarketStatus | null;
  isLoading: boolean;
  message: string;
}) {
  const statusValue = isLoading
    ? "Loading"
    : getMarketStatusLabel(marketStatus);
  const providerValue = isLoading
    ? "Loading"
    : marketStatus?.provider ?? "Unavailable";
  const cacheValue = isLoading
    ? "Loading"
    : marketStatus
      ? marketStatus.fromCache
        ? "Fresh cache"
        : "Live provider or fallback"
      : "Unavailable";
  const reasonValue = isLoading
    ? "Loading market calendar status..."
    : marketStatus?.reason || message || "No market calendar result yet";

  return (
    <div className="rounded-md border border-white/10 bg-black/25 p-4">
      <div className="flex min-h-8 items-start justify-between gap-3">
        <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Market Calendar
        </div>
        <StatusPill status={getMarketStatusBadgeStatus(marketStatus, isLoading)} />
      </div>

      <dl className="mt-4 space-y-3 text-sm">
        <AutomationDetail label="Status" value={statusValue} />
        <AutomationDetail label="Provider" value={providerValue} />
        <AutomationDetail label="Cache" value={cacheValue} />
        <AutomationDetail label="Reason" value={reasonValue} />
      </dl>
    </div>
  );
}

function AutomationDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
        {label}
      </dt>
      <dd className="mt-1 break-words text-zinc-200">{value}</dd>
    </div>
  );
}

function StatusPill({ status }: { status: string | null }) {
  const isCompleted = status === "completed";

  return (
    <span
      className={`rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${
        isCompleted
          ? "border-[#00db94]/30 bg-[#00db94]/10 text-emerald-100"
          : "border-amber-300/30 bg-amber-300/10 text-amber-100"
      }`}
    >
      {status ?? "Unknown"}
    </span>
  );
}
