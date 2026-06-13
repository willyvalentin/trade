export const SAFE_BROWSER_ACTION_CONTRACT_VERSION =
  "safe_browser_action_v1" as const;

export const FINAL_CONFIRM_DENYLIST_TERMS = [
  "Bekräfta köp",
  "Bekräfta sälj",
  "Confirm buy",
  "Confirm sell",
  "Confirm purchase",
  "Confirm order",
  "Submit order",
  "Place order",
] as const;

export type SafeBrowserActionKind =
  | "click"
  | "fill"
  | "read"
  | "wait_for"
  | "select"
  | "stop";

export type SafeBrowserActionMode = "semi_automatic" | "automatic";

export type SafeBrowserActionRiskLevel =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type SafeBrowserActionTarget = {
  label?: string;
  role?: string;
  testId?: string;
  text?: string;
  description?: string;
  riskLevel?: SafeBrowserActionRiskLevel;
};

export type SafeBrowserAction = {
  actionId: string;
  kind: SafeBrowserActionKind;
  mode: SafeBrowserActionMode;
  target: SafeBrowserActionTarget;
  value?: string | number | boolean | null;
  reason: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
};

export type SafeBrowserActionInput = Omit<
  SafeBrowserAction,
  "actionId" | "createdAt"
> & {
  actionId?: string;
  createdAt?: string;
};

export type SafeBrowserActionValidationResult = {
  ok: boolean;
  blocked: boolean;
  errors: string[];
  warnings: string[];
  matchedDenylistTerms: string[];
  riskLevel: SafeBrowserActionRiskLevel;
};

const RISK_LEVEL_RANK: Record<SafeBrowserActionRiskLevel, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

const SEMI_AUTO_FINAL_CONFIRM_BLOCKED_KINDS: SafeBrowserActionKind[] = [
  "click",
  "select",
];

function normalizeForMatch(value: string) {
  return value.trim().toLocaleLowerCase("sv-SE");
}

function collectTargetText(target: SafeBrowserActionTarget) {
  return [target.label, target.text, target.description]
    .filter((item): item is string => typeof item === "string")
    .map(normalizeForMatch)
    .filter(Boolean);
}

function getMatchedFinalConfirmDenylistTerms(target: SafeBrowserActionTarget) {
  const targetText = collectTargetText(target);

  if (targetText.length === 0) {
    return [];
  }

  return FINAL_CONFIRM_DENYLIST_TERMS.filter((term) => {
    const normalizedTerm = normalizeForMatch(term);
    return targetText.some((item) => item.includes(normalizedTerm));
  });
}

export function isFinalConfirmLikeTarget(target: SafeBrowserActionTarget) {
  return getMatchedFinalConfirmDenylistTerms(target).length > 0;
}

export function getSafeBrowserActionRiskLevel(
  action: Pick<SafeBrowserAction, "kind" | "target">,
): SafeBrowserActionRiskLevel {
  if (action.target.riskLevel) {
    return action.target.riskLevel;
  }

  if (isFinalConfirmLikeTarget(action.target)) {
    return "critical";
  }

  if (action.kind === "click" || action.kind === "select") {
    return "medium";
  }

  return "low";
}

export function getSafeBrowserActionDisplayLabel(
  action: Pick<SafeBrowserAction, "kind" | "target">,
) {
  return (
    action.target.label ||
    action.target.text ||
    action.target.testId ||
    action.target.description ||
    action.kind
  );
}

export function createBlockedSafeBrowserActionResult(
  errors: string[],
  options?: {
    warnings?: string[];
    matchedDenylistTerms?: string[];
    riskLevel?: SafeBrowserActionRiskLevel;
  },
): SafeBrowserActionValidationResult {
  return {
    ok: false,
    blocked: true,
    errors,
    warnings: options?.warnings ?? [],
    matchedDenylistTerms: options?.matchedDenylistTerms ?? [],
    riskLevel: options?.riskLevel ?? "critical",
  };
}

export function createSafeBrowserAction(
  input: SafeBrowserActionInput,
): SafeBrowserAction {
  const actionId =
    input.actionId ||
    `safe_action_${Date.now().toString(36)}_${Math.random()
      .toString(36)
      .slice(2, 10)}`;

  return {
    ...input,
    actionId,
    createdAt: input.createdAt || new Date().toISOString(),
  };
}

export function validateSafeBrowserAction(
  action: SafeBrowserAction,
): SafeBrowserActionValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const matchedDenylistTerms = getMatchedFinalConfirmDenylistTerms(
    action.target,
  );
  const riskLevel = getSafeBrowserActionRiskLevel(action);
  const isFinalConfirmTarget = matchedDenylistTerms.length > 0;

  if (!action.actionId.trim()) {
    errors.push("Safe browser action requires actionId.");
  }

  if (!action.reason.trim()) {
    errors.push("Safe browser action requires a reason.");
  }

  if (!action.createdAt.trim()) {
    errors.push("Safe browser action requires createdAt.");
  }

  if (
    action.mode === "semi_automatic" &&
    isFinalConfirmTarget &&
    SEMI_AUTO_FINAL_CONFIRM_BLOCKED_KINDS.includes(action.kind)
  ) {
    errors.push(
      "Semi-automatic mode must not click or select final confirmation targets.",
    );
  }

  if (
    action.mode === "semi_automatic" &&
    riskLevel === "critical" &&
    action.kind !== "read" &&
    action.kind !== "wait_for" &&
    action.kind !== "stop"
  ) {
    errors.push(
      "Semi-automatic mode blocks critical-risk browser actions unless they are read, wait_for, or stop.",
    );
  }

  if (
    action.mode === "automatic" &&
    isFinalConfirmTarget &&
    (action.kind === "click" || action.kind === "select")
  ) {
    warnings.push(
      "Automatic final confirmation is out of scope for the first Avanza prototype and requires separate approval.",
    );
  }

  if (
    RISK_LEVEL_RANK[riskLevel] >= RISK_LEVEL_RANK.high &&
    action.kind !== "read" &&
    action.kind !== "wait_for" &&
    action.kind !== "stop"
  ) {
    warnings.push(
      `${riskLevel} risk browser action requires explicit review before future implementation.`,
    );
  }

  if (errors.length > 0) {
    return createBlockedSafeBrowserActionResult(errors, {
      warnings,
      matchedDenylistTerms,
      riskLevel,
    });
  }

  return {
    ok: true,
    blocked: false,
    errors: [],
    warnings,
    matchedDenylistTerms,
    riskLevel,
  };
}
