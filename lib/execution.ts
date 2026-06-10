export type ExecutionMode = "semi_automatic" | "automatic";

export type ExecutionAction = "buy" | "sell";

export type ExecutionTriggerType =
  | "exit_stop_loss_reached"
  | "exit_risk_required"
  | "exit_end_of_day"
  | "exit_target_reached"
  | "manual_exit_requested"
  | "entry_recommendation_ready"
  | "manual_entry_requested";

export type ExecutionAuthority = {
  authority_version: "1.0";
  mode: ExecutionMode;
  can_create_execution_intent: true;
  can_prepare_broker_form: true;
  can_submit_broker_order: boolean;
  allowFinalSubmit: boolean;
  requires_human_final_confirmation: boolean;
  final_confirmation_actor: "human" | "agent";
  required_safety_checks: ExecutionSafetyCheck[];
  forbidden_agent_actions: ExecutionForbiddenAgentAction[];
};

export type ExecutionSafetyCheck =
  | "validate_execution_intent"
  | "validate_trading_package_freshness"
  | "validate_broker_form_matches_intent"
  | "validate_account_and_instrument"
  | "validate_risk_limits"
  | "validate_no_higher_priority_exit_pending";

export type ExecutionForbiddenAgentAction =
  | "submit_order"
  | "click_buy"
  | "click_sell"
  | "confirm_order"
  | "bypass_safety_checks"
  | "override_human_confirmation"
  | "modify_intent_after_review";

export type ExecutionIntent = {
  intent_version: "1.0";
  intent_id: string;
  created_at: string;
  mode: ExecutionMode;
  authority: ExecutionAuthority;
  action: ExecutionAction;
  trigger_type: ExecutionTriggerType;
  trigger_priority: number;
  broker_hint: "AVANZA";
  source:
    | "recommendation"
    | "live_day_trade_position"
    | "manual"
    | "risk_control";
  trading_package: ExecutionTradingPackage;
  safety_warnings: string[];
  broker_result: BrokerExecutionResult | null;
};

export type ExecutionTradingPackage = {
  package_version: "1.0";
  recommendation_id: string | null;
  live_position_id: string | null;
  ticker: string;
  market: "US" | string;
  quantity: number | null;
  order_type: "market" | "limit" | "market_reference" | "limit_reference";
  limit_price: number | null;
  stop_loss: number | null;
  target_price: number | null;
  expires_at: string | null;
  payload_id: string | null;
  payload_fingerprint: string | null;
};

export type BrokerExecutionStatus =
  | "submitted"
  | "filled"
  | "partially_filled"
  | "rejected"
  | "cancelled"
  | "unknown";

export type BrokerExecutionResult = {
  broker_hint: "AVANZA";
  status: BrokerExecutionStatus;
  captured_at: string;
  broker_order_id: string | null;
  submitted_at: string | null;
  filled_at: string | null;
  filled_quantity: number | null;
  average_fill_price: number | null;
  rejection_reason: string | null;
  cancellation_reason: string | null;
  raw_status: string | null;
  notes: string[];
};

export type ExecutionIntentValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
  expected_trigger_priority: number | null;
  expected_authority: ExecutionAuthority | null;
};

export const DEFAULT_EXECUTION_MODE: ExecutionMode = "semi_automatic";
export const EXECUTION_MODE_STORAGE_KEY = "ture_execution_mode";

export function isExecutionDevToolsEnabled(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return env.NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS === "true";
}

export function isAutomaticExecutionModeFeatureEnabled(
  value = process.env.NEXT_PUBLIC_ENABLE_AUTOMATIC_EXECUTION,
): boolean {
  return value === "true";
}

export function normalizeExecutionMode(
  value: unknown,
  options: { automaticEnabled?: boolean } = {},
): ExecutionMode {
  if (value === "automatic") {
    return options.automaticEnabled ? "automatic" : DEFAULT_EXECUTION_MODE;
  }

  if (value === "semi_automatic") {
    return "semi_automatic";
  }

  return DEFAULT_EXECUTION_MODE;
}

const sharedRequiredSafetyChecks: ExecutionSafetyCheck[] = [
  "validate_execution_intent",
  "validate_trading_package_freshness",
  "validate_broker_form_matches_intent",
  "validate_account_and_instrument",
  "validate_risk_limits",
  "validate_no_higher_priority_exit_pending",
];

export const SEMI_AUTOMATIC_EXECUTION_AUTHORITY: ExecutionAuthority = {
  authority_version: "1.0",
  mode: "semi_automatic",
  can_create_execution_intent: true,
  can_prepare_broker_form: true,
  can_submit_broker_order: false,
  allowFinalSubmit: false,
  requires_human_final_confirmation: true,
  final_confirmation_actor: "human",
  required_safety_checks: sharedRequiredSafetyChecks,
  forbidden_agent_actions: [
    "submit_order",
    "click_buy",
    "click_sell",
    "confirm_order",
    "bypass_safety_checks",
    "override_human_confirmation",
    "modify_intent_after_review",
  ],
};

export const AUTOMATIC_EXECUTION_AUTHORITY: ExecutionAuthority = {
  authority_version: "1.0",
  mode: "automatic",
  can_create_execution_intent: true,
  can_prepare_broker_form: true,
  can_submit_broker_order: true,
  allowFinalSubmit: true,
  requires_human_final_confirmation: false,
  final_confirmation_actor: "agent",
  required_safety_checks: sharedRequiredSafetyChecks,
  forbidden_agent_actions: [
    "bypass_safety_checks",
    "override_human_confirmation",
    "modify_intent_after_review",
  ],
};

const executionTriggerPriority: Record<ExecutionTriggerType, number> = {
  exit_stop_loss_reached: 1,
  exit_risk_required: 2,
  exit_end_of_day: 3,
  exit_target_reached: 4,
  manual_exit_requested: 5,
  entry_recommendation_ready: 6,
  manual_entry_requested: 7,
};

const exitTriggerTypes: ExecutionTriggerType[] = [
  "exit_stop_loss_reached",
  "exit_risk_required",
  "exit_end_of_day",
  "exit_target_reached",
  "manual_exit_requested",
];

const entryTriggerTypes: ExecutionTriggerType[] = [
  "entry_recommendation_ready",
  "manual_entry_requested",
];

export function getExecutionAuthorityForMode(
  mode: ExecutionMode,
): ExecutionAuthority {
  return mode === "automatic"
    ? AUTOMATIC_EXECUTION_AUTHORITY
    : SEMI_AUTOMATIC_EXECUTION_AUTHORITY;
}

export function getExecutionTriggerPriority(
  triggerType: ExecutionTriggerType,
): number {
  return executionTriggerPriority[triggerType];
}

export function compareExecutionIntentPriority(
  a: Pick<ExecutionIntent, "created_at" | "intent_id" | "trigger_type">,
  b: Pick<ExecutionIntent, "created_at" | "intent_id" | "trigger_type">,
): number {
  const priorityDifference =
    getExecutionTriggerPriority(a.trigger_type) -
    getExecutionTriggerPriority(b.trigger_type);

  if (priorityDifference !== 0) {
    return priorityDifference;
  }

  const createdAtDifference =
    Date.parse(a.created_at) - Date.parse(b.created_at);

  if (Number.isFinite(createdAtDifference) && createdAtDifference !== 0) {
    return createdAtDifference;
  }

  return a.intent_id.localeCompare(b.intent_id);
}

export function validateExecutionIntent(
  intent: Partial<ExecutionIntent> | null | undefined,
): ExecutionIntentValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!intent) {
    return {
      valid: false,
      errors: ["Execution intent is missing."],
      warnings,
      expected_trigger_priority: null,
      expected_authority: null,
    };
  }

  const expectedAuthority = intent.mode
    ? getExecutionAuthorityForMode(intent.mode)
    : null;
  const expectedTriggerPriority = intent.trigger_type
    ? getExecutionTriggerPriority(intent.trigger_type)
    : null;

  if (!intent.intent_id) {
    errors.push("Execution intent id is missing.");
  }

  if (!intent.created_at || !Number.isFinite(Date.parse(intent.created_at))) {
    errors.push("Execution intent created_at is missing or invalid.");
  }

  if (!intent.mode) {
    errors.push("Execution mode is missing.");
  }

  if (!intent.action) {
    errors.push("Execution action is missing.");
  }

  if (!intent.trigger_type) {
    errors.push("Execution trigger type is missing.");
  }

  if (intent.broker_hint && intent.broker_hint !== "AVANZA") {
    errors.push("Execution intent broker_hint must be AVANZA.");
  }

  if (intent.mode && intent.mode !== DEFAULT_EXECUTION_MODE) {
    warnings.push("Automatic execution mode is advanced opt-in, not the default.");
  }

  if (
    intent.trigger_type &&
    exitTriggerTypes.includes(intent.trigger_type) &&
    intent.action !== "sell"
  ) {
    errors.push("Exit execution triggers must create sell intents.");
  }

  if (
    intent.trigger_type &&
    entryTriggerTypes.includes(intent.trigger_type) &&
    intent.action !== "buy"
  ) {
    errors.push("Entry execution triggers must create buy intents.");
  }

  if (
    expectedTriggerPriority !== null &&
    intent.trigger_priority !== expectedTriggerPriority
  ) {
    errors.push("Execution trigger priority does not match trigger type.");
  }

  if (!intent.authority) {
    errors.push("Execution authority is missing.");
  } else if (expectedAuthority) {
    if (intent.authority.mode !== expectedAuthority.mode) {
      errors.push("Execution authority mode does not match execution mode.");
    }

    if (
      intent.authority.can_submit_broker_order !==
      expectedAuthority.can_submit_broker_order
    ) {
      errors.push("Execution authority submit permission does not match mode.");
    }

    if (intent.authority.allowFinalSubmit !== expectedAuthority.allowFinalSubmit) {
      errors.push("Execution authority final submit permission does not match mode.");
    }

    if (
      intent.authority.requires_human_final_confirmation !==
      expectedAuthority.requires_human_final_confirmation
    ) {
      errors.push(
        "Execution authority human confirmation requirement does not match mode.",
      );
    }
  }

  if (!intent.trading_package) {
    errors.push("Execution trading package is missing.");
  } else {
    if (!intent.trading_package.ticker.trim()) {
      errors.push("Execution trading package ticker is missing.");
    }

    if (
      intent.trigger_type &&
      entryTriggerTypes.includes(intent.trigger_type) &&
      !intent.trading_package.recommendation_id
    ) {
      warnings.push("Entry intent has no recommendation id.");
    }

    if (
      intent.trigger_type &&
      exitTriggerTypes.includes(intent.trigger_type) &&
      !intent.trading_package.live_position_id
    ) {
      warnings.push("Exit intent has no live position id.");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    expected_trigger_priority: expectedTriggerPriority,
    expected_authority: expectedAuthority,
  };
}
