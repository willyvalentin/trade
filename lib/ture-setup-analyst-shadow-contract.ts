export const TURE_SETUP_ANALYST_SHADOW_CONTRACT_VERSION =
  "ture_setup_analyst_shadow_contract_v1" as const;

export const TURE_SETUP_ANALYST_SHADOW_ASSESSMENT_VERSION =
  "ture_setup_analyst_shadow_assessment_v1" as const;

export const tureSetupAnalystReadOnlyToolIds = [
  "getCandidateContext",
  "getIntradayIndicators",
  "getMarketRegime",
  "getRankingContext",
  "getRecommendationPlanContext",
  "getPortfolioRiskContext",
] as const;

export type TureSetupAnalystReadOnlyToolId =
  (typeof tureSetupAnalystReadOnlyToolIds)[number];

export type TureSetupAnalystAuthority = {
  shadow_only: true;
  may_change_canonical_recommendation: false;
  may_change_ranking: false;
  may_change_execution_eligibility: false;
  may_change_position_state: false;
  may_change_risk_settings: false;
  may_place_or_cancel_orders: false;
  may_submit_broker_instructions: false;
};

export const TURE_SETUP_ANALYST_AUTHORITY: TureSetupAnalystAuthority =
  Object.freeze({
    shadow_only: true,
    may_change_canonical_recommendation: false,
    may_change_ranking: false,
    may_change_execution_eligibility: false,
    may_change_position_state: false,
    may_change_risk_settings: false,
    may_place_or_cancel_orders: false,
    may_submit_broker_instructions: false,
  });

export type TureSetupAnalystPlanSnapshot = {
  entry_price: number;
  stop_price: number;
  target_price: number;
};

export type TureSetupAnalystShadowRequest = {
  contract_version: typeof TURE_SETUP_ANALYST_SHADOW_CONTRACT_VERSION;
  mode: "shadow_only";
  candidate_id: string;
  recommendation_id: string;
  canonical_snapshot_id: string;
  captured_at: string;
  plan_snapshot: Readonly<TureSetupAnalystPlanSnapshot>;
  allowed_tools: readonly TureSetupAnalystReadOnlyToolId[];
  authority: TureSetupAnalystAuthority;
};

export type CreateTureSetupAnalystShadowRequestInput = Omit<
  TureSetupAnalystShadowRequest,
  "contract_version" | "mode" | "allowed_tools" | "authority"
>;

export type TureSetupAnalystThesisQuality =
  | "strong"
  | "adequate"
  | "weak"
  | "insufficient_evidence";

export type TureSetupAnalystAlignment =
  | "aligned"
  | "mixed"
  | "misaligned"
  | "insufficient_evidence";

export type TureSetupAnalystTradeAssessment =
  | "trade"
  | "no_trade"
  | "insufficient_evidence";

export type TureSetupAnalystShadowAssessment = {
  assessment_version: typeof TURE_SETUP_ANALYST_SHADOW_ASSESSMENT_VERSION;
  contract_version: typeof TURE_SETUP_ANALYST_SHADOW_CONTRACT_VERSION;
  mode: "shadow_only";
  agent_version: string;
  model_version: string;
  prompt_version: string;
  candidate_id: string;
  recommendation_id: string;
  thesis_quality: TureSetupAnalystThesisQuality;
  contradiction_flags: readonly string[];
  strongest_evidence: readonly string[];
  weakest_evidence: readonly string[];
  data_quality_concerns: readonly string[];
  regime_alignment: TureSetupAnalystAlignment;
  setup_alignment: TureSetupAnalystAlignment;
  risk_concerns: readonly string[];
  trade_or_no_trade_assessment: TureSetupAnalystTradeAssessment;
  confidence_in_assessment: number;
  escalation_reason: string | null;
  trace_id: string | null;
  authority: TureSetupAnalystAuthority;
};

export type TureSetupAnalystAssessmentValidationResult =
  | {
      valid: true;
      assessment: Readonly<TureSetupAnalystShadowAssessment>;
      errors: readonly [];
    }
  | { valid: false; assessment: null; errors: readonly string[] };

const assessmentKeys = [
  "assessment_version",
  "authority",
  "candidate_id",
  "confidence_in_assessment",
  "contract_version",
  "contradiction_flags",
  "data_quality_concerns",
  "escalation_reason",
  "mode",
  "model_version",
  "prompt_version",
  "recommendation_id",
  "regime_alignment",
  "risk_concerns",
  "setup_alignment",
  "strongest_evidence",
  "thesis_quality",
  "trace_id",
  "trade_or_no_trade_assessment",
  "weakest_evidence",
  "agent_version",
] as const;

const authorityKeys = [
  "may_change_canonical_recommendation",
  "may_change_execution_eligibility",
  "may_change_position_state",
  "may_change_ranking",
  "may_change_risk_settings",
  "may_place_or_cancel_orders",
  "may_submit_broker_instructions",
  "shadow_only",
] as const;

function hasText(value: unknown, maximumLength = 500): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.length <= maximumLength
  );
}

function hasFinitePositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isTimestamp(value: unknown): value is string {
  return hasText(value, 100) && Number.isFinite(Date.parse(value));
}

function hasExactOwnDataKeys(
  value: unknown,
  keys: readonly string[],
): value is Record<string, unknown> {
  if (!value || typeof value !== "object") return false;

  try {
    if (Object.getPrototypeOf(value) !== Object.prototype) return false;
    const ownKeys = Reflect.ownKeys(value);
    if (ownKeys.some((key) => typeof key !== "string")) return false;
    if (ownKeys.length !== keys.length) return false;
    if (![...ownKeys].every((key) => keys.includes(key as never))) return false;

    return ownKeys.every((key) => {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      return Boolean(
        descriptor &&
          descriptor.enumerable &&
          Object.prototype.hasOwnProperty.call(descriptor, "value"),
      );
    });
  } catch {
    return false;
  }
}

function ownData(value: Record<string, unknown>, key: string): unknown {
  const descriptor = Object.getOwnPropertyDescriptor(value, key);
  return descriptor?.value;
}

function isBoundedStringArray(value: unknown): value is readonly string[] {
  if (!Array.isArray(value)) return false;

  try {
    if (Object.getPrototypeOf(value) !== Array.prototype) return false;
    const ownKeys = Reflect.ownKeys(value);
    if (ownKeys.some((key) => typeof key === "symbol")) return false;
    const lengthDescriptor = Object.getOwnPropertyDescriptor(value, "length");
    const length = lengthDescriptor?.value;
    if (
      typeof length !== "number" ||
      !Number.isSafeInteger(length) ||
      length < 0 ||
      length > 12 ||
      ownKeys.length !== length + 1 ||
      !ownKeys.includes("length")
    ) {
      return false;
    }

    for (let index = 0; index < length; index += 1) {
      const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
      if (
        !descriptor ||
        !descriptor.enumerable ||
        !Object.prototype.hasOwnProperty.call(descriptor, "value") ||
        !hasText(descriptor.value)
      ) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

function matchesAuthority(value: unknown): value is TureSetupAnalystAuthority {
  if (!hasExactOwnDataKeys(value, authorityKeys)) return false;

  return (
    ownData(value, "shadow_only") === true &&
    ownData(value, "may_change_canonical_recommendation") === false &&
    ownData(value, "may_change_ranking") === false &&
    ownData(value, "may_change_execution_eligibility") === false &&
    ownData(value, "may_change_position_state") === false &&
    ownData(value, "may_change_risk_settings") === false &&
    ownData(value, "may_place_or_cancel_orders") === false &&
    ownData(value, "may_submit_broker_instructions") === false
  );
}

function frozenStrings(value: readonly string[]): readonly string[] {
  return Object.freeze([...value]);
}

function invalid(errors: string[]): TureSetupAnalystAssessmentValidationResult {
  return { valid: false, assessment: null, errors: Object.freeze(errors) };
}

export function createTureSetupAnalystShadowRequest(
  input: CreateTureSetupAnalystShadowRequestInput,
): Readonly<TureSetupAnalystShadowRequest> {
  if (
    !hasText(input.candidate_id, 200) ||
    !hasText(input.recommendation_id, 200) ||
    !hasText(input.canonical_snapshot_id, 200) ||
    !isTimestamp(input.captured_at) ||
    !hasFinitePositiveNumber(input.plan_snapshot.entry_price) ||
    !hasFinitePositiveNumber(input.plan_snapshot.stop_price) ||
    !hasFinitePositiveNumber(input.plan_snapshot.target_price)
  ) {
    throw new TypeError("Invalid Ture Setup Analyst shadow request input.");
  }

  return Object.freeze({
    contract_version: TURE_SETUP_ANALYST_SHADOW_CONTRACT_VERSION,
    mode: "shadow_only",
    candidate_id: input.candidate_id,
    recommendation_id: input.recommendation_id,
    canonical_snapshot_id: input.canonical_snapshot_id,
    captured_at: input.captured_at,
    plan_snapshot: Object.freeze({ ...input.plan_snapshot }),
    allowed_tools: Object.freeze([...tureSetupAnalystReadOnlyToolIds]),
    authority: TURE_SETUP_ANALYST_AUTHORITY,
  });
}

export function validateTureSetupAnalystShadowAssessment(
  value: unknown,
): TureSetupAnalystAssessmentValidationResult {
  if (!hasExactOwnDataKeys(value, assessmentKeys)) {
    return invalid(["assessment_shape_invalid"]);
  }

  const errors: string[] = [];
  const assessmentVersion = ownData(value, "assessment_version");
  const contractVersion = ownData(value, "contract_version");
  const mode = ownData(value, "mode");
  const thesisQuality = ownData(value, "thesis_quality");
  const regimeAlignment = ownData(value, "regime_alignment");
  const setupAlignment = ownData(value, "setup_alignment");
  const tradeAssessment = ownData(value, "trade_or_no_trade_assessment");
  const confidence = ownData(value, "confidence_in_assessment");
  const escalationReason = ownData(value, "escalation_reason");
  const traceId = ownData(value, "trace_id");

  if (assessmentVersion !== TURE_SETUP_ANALYST_SHADOW_ASSESSMENT_VERSION) {
    errors.push("assessment_version_invalid");
  }
  if (contractVersion !== TURE_SETUP_ANALYST_SHADOW_CONTRACT_VERSION) {
    errors.push("contract_version_invalid");
  }
  if (mode !== "shadow_only") errors.push("mode_must_be_shadow_only");

  for (const key of [
    "agent_version",
    "model_version",
    "prompt_version",
    "candidate_id",
    "recommendation_id",
  ]) {
    if (!hasText(ownData(value, key), 200)) errors.push(`${key}_invalid`);
  }

  if (
    !(["strong", "adequate", "weak", "insufficient_evidence"] as const).includes(
      thesisQuality as never,
    )
  ) {
    errors.push("thesis_quality_invalid");
  }
  if (
    !(["aligned", "mixed", "misaligned", "insufficient_evidence"] as const).includes(
      regimeAlignment as never,
    )
  ) {
    errors.push("regime_alignment_invalid");
  }
  if (
    !(["aligned", "mixed", "misaligned", "insufficient_evidence"] as const).includes(
      setupAlignment as never,
    )
  ) {
    errors.push("setup_alignment_invalid");
  }
  if (
    !(["trade", "no_trade", "insufficient_evidence"] as const).includes(
      tradeAssessment as never,
    )
  ) {
    errors.push("trade_or_no_trade_assessment_invalid");
  }
  if (
    typeof confidence !== "number" ||
    !Number.isFinite(confidence) ||
    confidence < 0 ||
    confidence > 1
  ) {
    errors.push("confidence_in_assessment_invalid");
  }
  if (escalationReason !== null && !hasText(escalationReason)) {
    errors.push("escalation_reason_invalid");
  }
  if (traceId !== null && !hasText(traceId, 200)) errors.push("trace_id_invalid");

  for (const key of [
    "contradiction_flags",
    "strongest_evidence",
    "weakest_evidence",
    "data_quality_concerns",
    "risk_concerns",
  ]) {
    if (!isBoundedStringArray(ownData(value, key))) errors.push(`${key}_invalid`);
  }

  if (!matchesAuthority(ownData(value, "authority"))) {
    errors.push("authority_must_remain_shadow_only");
  }
  if (errors.length > 0) return invalid(errors);

  const assessment: TureSetupAnalystShadowAssessment = {
    assessment_version: assessmentVersion as typeof TURE_SETUP_ANALYST_SHADOW_ASSESSMENT_VERSION,
    contract_version: contractVersion as typeof TURE_SETUP_ANALYST_SHADOW_CONTRACT_VERSION,
    mode: "shadow_only",
    agent_version: ownData(value, "agent_version") as string,
    model_version: ownData(value, "model_version") as string,
    prompt_version: ownData(value, "prompt_version") as string,
    candidate_id: ownData(value, "candidate_id") as string,
    recommendation_id: ownData(value, "recommendation_id") as string,
    thesis_quality: thesisQuality as TureSetupAnalystThesisQuality,
    contradiction_flags: frozenStrings(
      ownData(value, "contradiction_flags") as string[],
    ),
    strongest_evidence: frozenStrings(
      ownData(value, "strongest_evidence") as string[],
    ),
    weakest_evidence: frozenStrings(
      ownData(value, "weakest_evidence") as string[],
    ),
    data_quality_concerns: frozenStrings(
      ownData(value, "data_quality_concerns") as string[],
    ),
    regime_alignment: regimeAlignment as TureSetupAnalystAlignment,
    setup_alignment: setupAlignment as TureSetupAnalystAlignment,
    risk_concerns: frozenStrings(ownData(value, "risk_concerns") as string[]),
    trade_or_no_trade_assessment: tradeAssessment as TureSetupAnalystTradeAssessment,
    confidence_in_assessment: confidence as number,
    escalation_reason: escalationReason as string | null,
    trace_id: traceId as string | null,
    authority: TURE_SETUP_ANALYST_AUTHORITY,
  };

  return { valid: true, assessment: Object.freeze(assessment), errors: [] };
}
