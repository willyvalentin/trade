import type { SemiAutoAvanzaAgentPayload } from "@/lib/semi-auto-agent-payload-contract";
import {
  findRealAvanzaSelectorMappingEntry,
  realAvanzaDisallowedStableSelectorStrategies,
  realAvanzaFirstFillOnlyRequiredSelectorKeys,
  realAvanzaForbiddenFinalSelectors,
  realAvanzaSelectorMapping,
  type RealAvanzaSelectorMappingEntry,
} from "@/lib/real-avanza-selector-mapping-contract";

export type RealAvanzaFillOnlyOrderForm =
  | "avancerad"
  | "stop_loss"
  | "glidande";

export type RealAvanzaFillOnlyRequestedAction =
  | "fill_only"
  | "final_submit"
  | string;

export type RealAvanzaFillOnlyGuardInput = {
  payload: Partial<SemiAutoAvanzaAgentPayload> | null | undefined;
  order_form: RealAvanzaFillOnlyOrderForm | string;
  max_amount_cap_sek?: number | null;
  explicit_total_amount_sek?: number | null;
  currency?: string | null;
  fx_to_sek_rate?: number | null;
  requested_action?: RealAvanzaFillOnlyRequestedAction | null;
};

export type RealAvanzaFillOnlyGuardStatus =
  | "approved_for_fill_only_poc"
  | "blocked";

export type RealAvanzaFillOnlyBlockingReason =
  | "payload_missing"
  | "non_semi_auto_payload"
  | "automatic_submit_allowed"
  | "agent_submit_allowed"
  | "human_final_confirmation_not_required"
  | "final_submit_action_forbidden"
  | "unsupported_order_form"
  | "sell_deferred_for_first_poc"
  | "stop_loss_deferred_for_first_poc"
  | "glidande_deferred_for_first_poc"
  | "missing_quantity_or_amount"
  | "missing_price"
  | "cap_cannot_be_calculated"
  | "unknown_currency_or_fx"
  | "cap_exceeded";

export type RealAvanzaFillOnlyPolicyFlags = {
  max_amount_cap_sek: number;
  automatic_submit_allowed_false: true;
  final_submit_forbidden: true;
  human_final_confirmation_required: true;
  advanced_buy_only: true;
  cap_never_authorizes_submit: true;
};

export type RealAvanzaFillOnlySelectorPolicyStatus = "ready" | "blocked";

export type RealAvanzaFillOnlySelectorSizingMode = "amount" | "quantity";

export type RealAvanzaFillOnlySelectorPolicyInput = {
  available_selector_keys?: readonly string[] | null;
  requested_selectors?: readonly string[] | null;
  sizing_mode?: RealAvanzaFillOnlySelectorSizingMode | null;
};

export type RealAvanzaFillOnlySelectorPolicy = {
  status: RealAvanzaFillOnlySelectorPolicyStatus;
  required_selectors_present: boolean;
  required_selector_keys: readonly string[];
  required_selectors: readonly string[];
  missing_required_selector_keys: readonly string[];
  forbidden_final_selectors: readonly string[];
  forbidden_selectors_present: readonly string[];
  review_selectors_blocked_by_default: readonly string[];
  blocked_first_poc_selectors: readonly string[];
  allowed_read_selectors: readonly string[];
  future_fill_candidate_selectors: readonly string[];
  generated_selector_strategy_rejected: boolean;
  rejected_generated_selectors: readonly string[];
  account_selector_read_only_human_verify: boolean;
  side_buy_state_required: boolean;
  limit_order_type_required: boolean;
  total_amount_required_for_cap_verification: boolean;
};

export type RealAvanzaFillOnlyGuardDecision = {
  status: RealAvanzaFillOnlyGuardStatus;
  approved_for_fill_only_poc: boolean;
  blocking_reasons: RealAvanzaFillOnlyBlockingReason[];
  notional_amount_sek: number | null;
  policy_flags: RealAvanzaFillOnlyPolicyFlags;
  selector_policy: RealAvanzaFillOnlySelectorPolicy;
};

const defaultMaxAmountCapSek = 1000;

function isPositiveFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function normalizeCurrency(value: string | null | undefined): string {
  return (value ?? "SEK").trim().toUpperCase() || "SEK";
}

function normalizeAction(value: string | null | undefined): string {
  return (value ?? "fill_only").trim().toLowerCase();
}

function normalizeSelector(value: string): string {
  return value.trim();
}

function getSelectorEntry(selector: string): RealAvanzaSelectorMappingEntry | null {
  const normalized = normalizeSelector(selector);

  return (
    realAvanzaSelectorMapping.find(
      (entry) =>
        entry.selector === normalized ||
        entry.fallbackSelectors?.includes(normalized) === true,
    ) ?? null
  );
}

function getSelectorEntryByKey(key: string): RealAvanzaSelectorMappingEntry {
  const entry = findRealAvanzaSelectorMappingEntry(key);

  if (!entry) {
    throw new Error(`Missing real Avanza selector mapping entry: ${key}`);
  }

  return entry;
}

function uniqueStrings(values: readonly string[]): string[] {
  return [...new Set(values)];
}

export function getForbiddenFinalSelectors(): readonly string[] {
  return realAvanzaForbiddenFinalSelectors;
}

export function getRequiredFirstFillOnlySelectors(
  sizingMode: RealAvanzaFillOnlySelectorSizingMode = "amount",
): readonly string[] {
  const requiredKeys = getRequiredFirstFillOnlySelectorKeys(sizingMode);

  return requiredKeys.map((key) => getSelectorEntryByKey(key).selector);
}

export function getRequiredFirstFillOnlySelectorKeys(
  sizingMode: RealAvanzaFillOnlySelectorSizingMode = "amount",
): readonly string[] {
  const keys = realAvanzaFirstFillOnlyRequiredSelectorKeys.filter(
    (key) => key !== "amount_input" && key !== "quantity_input",
  );

  return uniqueStrings([
    ...keys,
    sizingMode === "quantity" ? "quantity_input" : "amount_input",
  ]);
}

export function isSelectorForbiddenFinalAction(selector: string): boolean {
  const entry = getSelectorEntry(selector);

  return (
    entry?.classifications.includes("forbidden_final_action") === true ||
    realAvanzaForbiddenFinalSelectors.includes(normalizeSelector(selector))
  );
}

export function isSelectorBlockedForFirstPoc(selector: string): boolean {
  const entry = getSelectorEntry(selector);

  return (
    entry?.firstPocBehavior === "block" ||
    entry?.firstPocBehavior === "forbidden"
  );
}

export function isSelectorAllowedReadForFirstPoc(selector: string): boolean {
  return getSelectorEntry(selector)?.firstPocBehavior === "allowed_read";
}

export function isSelectorFutureFillCandidate(selector: string): boolean {
  const entry = getSelectorEntry(selector);

  return (
    entry?.classifications.includes("future_fill_candidate") === true &&
    entry.firstPocBehavior === "allowed_fill_after_approval"
  );
}

export function isGeneratedSelectorStrategyRejected(selector: string): boolean {
  const normalized = normalizeSelector(selector);

  return (
    normalized.includes("_ngcontent-") ||
    normalized.includes("_nghost-") ||
    normalized.includes("generated-") ||
    normalized.includes("aza-select-id-3") ||
    normalized === "#list-item-link-0" ||
    (realAvanzaDisallowedStableSelectorStrategies as readonly string[]).includes(
      normalized,
    )
  );
}

export function evaluateSelectorPolicyForFirstFillOnlyPoc(
  input: RealAvanzaFillOnlySelectorPolicyInput = {},
): RealAvanzaFillOnlySelectorPolicy {
  const sizingMode = input.sizing_mode === "quantity" ? "quantity" : "amount";
  const availableKeys = new Set(
    input.available_selector_keys ?? realAvanzaSelectorMapping.map((entry) => entry.key),
  );
  const requestedSelectors = input.requested_selectors ?? [];
  const requiredKeys = getRequiredFirstFillOnlySelectorKeys(sizingMode);
  const missingRequiredKeys = requiredKeys.filter((key) => !availableKeys.has(key));
  const forbiddenSelectorsPresent = requestedSelectors.filter((selector) =>
    isSelectorForbiddenFinalAction(selector),
  );
  const rejectedGeneratedSelectors = requestedSelectors.filter((selector) =>
    isGeneratedSelectorStrategyRejected(selector),
  );
  const requiredSelectors = requiredKeys.map(
    (key) => getSelectorEntryByKey(key).selector,
  );
  const reviewBlockedSelectors = realAvanzaSelectorMapping
    .filter(
      (entry) =>
        entry.stages.includes("review_stage") &&
        entry.firstPocBehavior === "block",
    )
    .map((entry) => entry.selector);
  const blockedFirstPocSelectors = realAvanzaSelectorMapping
    .filter(
      (entry) =>
        entry.firstPocBehavior === "block" ||
        entry.firstPocBehavior === "forbidden",
    )
    .map((entry) => entry.selector);
  const allowedReadSelectors = realAvanzaSelectorMapping
    .filter((entry) => entry.firstPocBehavior === "allowed_read")
    .map((entry) => entry.selector);
  const futureFillCandidateSelectors = realAvanzaSelectorMapping
    .filter((entry) =>
      entry.classifications.includes("future_fill_candidate"),
    )
    .map((entry) => entry.selector);
  const blocked =
    missingRequiredKeys.length > 0 ||
    forbiddenSelectorsPresent.length > 0 ||
    rejectedGeneratedSelectors.length > 0;

  return {
    status: blocked ? "blocked" : "ready",
    required_selectors_present: missingRequiredKeys.length === 0,
    required_selector_keys: requiredKeys,
    required_selectors: requiredSelectors,
    missing_required_selector_keys: missingRequiredKeys,
    forbidden_final_selectors: getForbiddenFinalSelectors(),
    forbidden_selectors_present: forbiddenSelectorsPresent,
    review_selectors_blocked_by_default: reviewBlockedSelectors,
    blocked_first_poc_selectors: blockedFirstPocSelectors,
    allowed_read_selectors: allowedReadSelectors,
    future_fill_candidate_selectors: futureFillCandidateSelectors,
    generated_selector_strategy_rejected: rejectedGeneratedSelectors.length > 0,
    rejected_generated_selectors: rejectedGeneratedSelectors,
    account_selector_read_only_human_verify:
      isSelectorAllowedReadForFirstPoc('button[aria-haspopup="listbox"]') &&
      getSelectorEntryByKey("account_selector_collapsed").classifications.includes(
        "human_verify_required",
      ),
    side_buy_state_required: requiredKeys.includes("side_switch_buy_state"),
    limit_order_type_required: requiredKeys.includes("order_type_limit_checked"),
    total_amount_required_for_cap_verification: requiredKeys.includes("total_amount"),
  };
}

function calculateNotionalSek(
  input: RealAvanzaFillOnlyGuardInput,
): { amount: number | null; reasons: RealAvanzaFillOnlyBlockingReason[] } {
  const payload = input.payload;
  const reasons: RealAvanzaFillOnlyBlockingReason[] = [];
  const currency = normalizeCurrency(input.currency);
  const capAmount = input.explicit_total_amount_sek;

  if (isPositiveFiniteNumber(capAmount)) {
    return { amount: capAmount, reasons };
  }

  const quantity = payload?.quantity;
  const price = payload?.limit_price ?? payload?.entry_price;

  const hasQuantity = isPositiveFiniteNumber(quantity);
  const hasPrice = isPositiveFiniteNumber(price);

  if (!hasQuantity) {
    reasons.push("missing_quantity_or_amount");
  }

  if (!hasPrice) {
    reasons.push("missing_price");
  }

  if (!hasQuantity || !hasPrice) {
    reasons.push("cap_cannot_be_calculated");
    return { amount: null, reasons };
  }

  const nativeAmount = quantity * price;

  if (currency === "SEK") {
    return { amount: Number(nativeAmount.toFixed(2)), reasons };
  }

  if (!isPositiveFiniteNumber(input.fx_to_sek_rate)) {
    return { amount: null, reasons: ["unknown_currency_or_fx"] };
  }

  return {
    amount: Number((nativeAmount * input.fx_to_sek_rate).toFixed(2)),
    reasons,
  };
}

export function classifyRealAvanzaFillOnlyAction(
  action: RealAvanzaFillOnlyRequestedAction | null | undefined,
): "fill_only" | "final_submit_forbidden" {
  const normalized = normalizeAction(action);

  if (
    normalized === "final_submit" ||
    normalized.includes("bekräfta köp") ||
    normalized.includes("bekrafta kop") ||
    normalized.includes("bekräfta sälj") ||
    normalized.includes("bekrafta salj")
  ) {
    return "final_submit_forbidden";
  }

  return "fill_only";
}

export function evaluateRealAvanzaFillOnlyGuard(
  input: RealAvanzaFillOnlyGuardInput,
): RealAvanzaFillOnlyGuardDecision {
  const cap = isPositiveFiniteNumber(input.max_amount_cap_sek)
    ? input.max_amount_cap_sek
    : defaultMaxAmountCapSek;
  const payload = input.payload;
  const blockingReasons = new Set<RealAvanzaFillOnlyBlockingReason>();
  const orderForm = input.order_form.trim().toLowerCase();
  const action = classifyRealAvanzaFillOnlyAction(input.requested_action);
  const selector_policy = evaluateSelectorPolicyForFirstFillOnlyPoc();
  const policy_flags: RealAvanzaFillOnlyPolicyFlags = {
    max_amount_cap_sek: cap,
    automatic_submit_allowed_false: true,
    final_submit_forbidden: true,
    human_final_confirmation_required: true,
    advanced_buy_only: true,
    cap_never_authorizes_submit: true,
  };

  if (!payload) {
    blockingReasons.add("payload_missing");
  }

  if (payload?.mode !== "semi_auto") {
    blockingReasons.add("non_semi_auto_payload");
  }

  if (payload?.authority?.automatic_submit_allowed !== false) {
    blockingReasons.add("automatic_submit_allowed");
  }

  if (payload?.authority?.agent_can_submit_order !== false) {
    blockingReasons.add("agent_submit_allowed");
  }

  if (payload?.authority?.human_final_confirmation_required !== true) {
    blockingReasons.add("human_final_confirmation_not_required");
  }

  if (action === "final_submit_forbidden") {
    blockingReasons.add("final_submit_action_forbidden");
  }

  if (orderForm !== "avancerad") {
    blockingReasons.add("unsupported_order_form");
  }

  if (orderForm === "stop_loss") {
    blockingReasons.add("stop_loss_deferred_for_first_poc");
  }

  if (orderForm === "glidande") {
    blockingReasons.add("glidande_deferred_for_first_poc");
  }

  if (payload?.side === "sell" || payload?.action === "sell") {
    blockingReasons.add("sell_deferred_for_first_poc");
  }

  const notional = calculateNotionalSek(input);

  for (const reason of notional.reasons) {
    blockingReasons.add(reason);
  }

  if (notional.amount !== null && notional.amount > cap) {
    blockingReasons.add("cap_exceeded");
  }

  const reasons = [...blockingReasons];

  return {
    status: reasons.length === 0 ? "approved_for_fill_only_poc" : "blocked",
    approved_for_fill_only_poc: reasons.length === 0,
    blocking_reasons: reasons,
    notional_amount_sek: notional.amount,
    policy_flags,
    selector_policy,
  };
}
