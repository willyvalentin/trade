import { createHash } from "node:crypto";

export const INTERNAL_PAPER_EVENT_RISK_ADMISSION_VERSION =
  "internal_paper_event_risk_admission_v1" as const;
export const INTERNAL_PAPER_EVENT_RISK_POLICY_VERSION =
  "internal_paper_event_risk_policy_v1" as const;
export const INTERNAL_PAPER_EVENT_RISK_SNAPSHOT_VERSION =
  "internal_paper_event_risk_snapshot_v1" as const;
export const INTERNAL_PAPER_EVENT_RISK_RESULT_VERSION =
  "internal_paper_event_risk_result_v1" as const;

export const INTERNAL_PAPER_EVENT_RISK_TYPES = [
  "earnings",
  "company_guidance",
  "macro_cpi",
  "macro_fomc",
  "macro_jobs",
  "ex_dividend",
  "stock_split",
  "trading_halt",
  "options_expiration",
  "sector_event",
  "other_material",
] as const;

export type InternalPaperEventRiskType =
  (typeof INTERNAL_PAPER_EVENT_RISK_TYPES)[number];
export type InternalPaperEventRiskAction = "allow" | "reduce" | "deny";
export type InternalPaperEventRiskScope = "market" | "sector" | "ticker";

export type InternalPaperEventRiskRule = Readonly<{
  rule_id: string;
  event_type: InternalPaperEventRiskType;
  lead_seconds: number;
  lag_seconds: number;
  action: InternalPaperEventRiskAction;
  size_multiplier_bps: number;
}>;

export type InternalPaperEventRiskPolicy = Readonly<{
  policy_version: typeof INTERNAL_PAPER_EVENT_RISK_POLICY_VERSION;
  policy_id: string;
  effective_from: string;
  expires_at: string;
  max_snapshot_age_seconds: number;
  required_event_types: readonly InternalPaperEventRiskType[];
  rules: readonly InternalPaperEventRiskRule[];
}>;

export type InternalPaperEventRiskCoverage = Readonly<{
  event_type: InternalPaperEventRiskType;
  target_ticker: string;
  target_sector: string | null;
  provider: string;
  provider_dataset_version: string;
  observed_at: string;
  event_window_start: string;
  event_window_end: string;
  search_complete: boolean;
  reported_revision_count: number;
  reported_logical_event_count: number;
  entitlement_reference: string;
  retention_rights_reference: string;
}>;

export type InternalPaperEventRiskEventRevision = Readonly<{
  logical_event_id: string;
  revision_id: string;
  revision_sequence: number;
  event_type: InternalPaperEventRiskType;
  scope: InternalPaperEventRiskScope;
  ticker: string | null;
  sector: string | null;
  status: "scheduled" | "active" | "resolved" | "cancelled";
  starts_at: string;
  ends_at: string;
  revision_published_at: string;
  observed_at: string;
  provider: string;
  provider_dataset_version: string;
}>;

export type InternalPaperEventRiskSnapshot = Readonly<{
  snapshot_version: typeof INTERNAL_PAPER_EVENT_RISK_SNAPSHOT_VERSION;
  snapshot_id: string;
  target_ticker: string;
  target_sector: string | null;
  decision_at: string;
  observed_at: string;
  coverage: readonly InternalPaperEventRiskCoverage[];
  event_revisions: readonly InternalPaperEventRiskEventRevision[];
}>;

export type InternalPaperEventRiskMatchedEvent = Readonly<{
  logical_event_id: string;
  revision_id: string;
  event_type: InternalPaperEventRiskType;
  scope: InternalPaperEventRiskScope;
  status: "scheduled" | "active" | "resolved";
  starts_at: string;
  ends_at: string;
  matched_rule_ids: readonly string[];
  action: InternalPaperEventRiskAction;
  size_multiplier_bps: number;
}>;

type Authority = Readonly<{
  can_request_provider_data: false;
  can_change_ranking_or_publication: false;
  can_persist_policy_or_evidence: false;
  can_enqueue_internal_paper_work: false;
  can_execute_broker_action: false;
}>;

export type InternalPaperEventRiskAdmissionResult = Readonly<{
  result_version: typeof INTERNAL_PAPER_EVENT_RISK_RESULT_VERSION;
  admission_version: typeof INTERNAL_PAPER_EVENT_RISK_ADMISSION_VERSION;
  status: "completed" | "blocked";
  disposition: "admitted" | "reduced" | "denied" | "unavailable";
  size_multiplier_bps: number | null;
  policy_id: string | null;
  snapshot_id: string | null;
  target_ticker: string | null;
  decision_at: string | null;
  covered_event_types: readonly InternalPaperEventRiskType[];
  matched_events: readonly InternalPaperEventRiskMatchedEvent[];
  reason_codes: readonly string[];
  evidence_limits: readonly [
    "provided_snapshot_only",
    "provider_entitlement_not_independently_verified",
    "no_provider_or_runtime_authority",
    "no_strategy_quality_or_alpha_claim",
  ];
  authority: Authority;
  input_digest: string;
  result_digest: string;
}>;

export type InternalPaperEventRiskAdmissionInput = Readonly<{
  admission_version: typeof INTERNAL_PAPER_EVENT_RISK_ADMISSION_VERSION;
  policy: InternalPaperEventRiskPolicy;
  snapshot: InternalPaperEventRiskSnapshot;
}>;

const EVENT_TYPE_SET = new Set<string>(INTERNAL_PAPER_EVENT_RISK_TYPES);
const SYMBOL_PATTERN = /^[A-Z][A-Z0-9.-]{0,14}$/;
const IDENTIFIER_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9:._/-]{0,159}$/;
const MAX_WINDOW_SECONDS = 14 * 24 * 60 * 60;
const AUTHORITY = Object.freeze({
  can_request_provider_data: false,
  can_change_ranking_or_publication: false,
  can_persist_policy_or_evidence: false,
  can_enqueue_internal_paper_work: false,
  can_execute_broker_action: false,
}) satisfies Authority;
const EVIDENCE_LIMITS = Object.freeze([
  "provided_snapshot_only",
  "provider_entitlement_not_independently_verified",
  "no_provider_or_runtime_authority",
  "no_strategy_quality_or_alpha_claim",
] as const);

function canonical(value: unknown): unknown {
  if (typeof value === "number" && !Number.isFinite(value)) {
    return { __invalid_non_finite_number__: String(value) };
  }
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, canonical(item)]),
    );
  }
  return value;
}

function digest(value: unknown) {
  return createHash("sha256")
    .update(JSON.stringify(canonical(value)))
    .digest("hex");
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    for (const item of Object.values(value as Record<string, unknown>)) {
      deepFreeze(item);
    }
    Object.freeze(value);
  }
  return value;
}

function explicitInstant(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.endsWith("Z") &&
    Number.isFinite(Date.parse(value))
  );
}

function identifier(value: unknown): value is string {
  return typeof value === "string" && IDENTIFIER_PATTERN.test(value);
}

function boundedText(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim() === value &&
    value.length > 0 &&
    value.length <= 240
  );
}

function safeIntegerBetween(value: unknown, minimum: number, maximum: number) {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= minimum &&
    value <= maximum
  );
}

function uniqueSorted<T extends string>(values: readonly T[]) {
  return Array.from(new Set(values)).sort() as T[];
}

function sameStringSet(left: readonly string[], right: readonly string[]) {
  const a = uniqueSorted(left);
  const b = uniqueSorted(right);
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function eventType(value: unknown): value is InternalPaperEventRiskType {
  return typeof value === "string" && EVENT_TYPE_SET.has(value);
}

function actionRank(action: InternalPaperEventRiskAction) {
  return action === "deny" ? 2 : action === "reduce" ? 1 : 0;
}

function validateRule(rule: InternalPaperEventRiskRule) {
  return (
    identifier(rule.rule_id) &&
    eventType(rule.event_type) &&
    safeIntegerBetween(rule.lead_seconds, 0, MAX_WINDOW_SECONDS) &&
    safeIntegerBetween(rule.lag_seconds, 0, MAX_WINDOW_SECONDS) &&
    ["allow", "reduce", "deny"].includes(rule.action) &&
    safeIntegerBetween(rule.size_multiplier_bps, 0, 10_000) &&
    ((rule.action === "allow" && rule.size_multiplier_bps === 10_000) ||
      (rule.action === "reduce" &&
        rule.size_multiplier_bps > 0 &&
        rule.size_multiplier_bps < 10_000) ||
      (rule.action === "deny" && rule.size_multiplier_bps === 0))
  );
}

function validatePolicy(
  policy: InternalPaperEventRiskPolicy,
  decisionMs: number,
) {
  if (
    policy.policy_version !== INTERNAL_PAPER_EVENT_RISK_POLICY_VERSION ||
    !identifier(policy.policy_id) ||
    !explicitInstant(policy.effective_from) ||
    !explicitInstant(policy.expires_at) ||
    Date.parse(policy.effective_from) >= Date.parse(policy.expires_at) ||
    decisionMs < Date.parse(policy.effective_from) ||
    decisionMs >= Date.parse(policy.expires_at) ||
    !safeIntegerBetween(policy.max_snapshot_age_seconds, 1, 86_400) ||
    !sameStringSet(policy.required_event_types, INTERNAL_PAPER_EVENT_RISK_TYPES) ||
    policy.required_event_types.length !== INTERNAL_PAPER_EVENT_RISK_TYPES.length ||
    policy.rules.length === 0 ||
    policy.rules.some((rule) => !validateRule(rule))
  ) {
    return false;
  }
  const ruleIds = policy.rules.map((rule) => rule.rule_id);
  if (new Set(ruleIds).size !== ruleIds.length) return false;
  return INTERNAL_PAPER_EVENT_RISK_TYPES.every((type) =>
    policy.rules.some((rule) => rule.event_type === type),
  );
}

function rulesForType(
  policy: InternalPaperEventRiskPolicy,
  type: InternalPaperEventRiskType,
) {
  return policy.rules.filter((rule) => rule.event_type === type);
}

function coverageWindowRequired(
  rules: readonly InternalPaperEventRiskRule[],
  decisionMs: number,
) {
  return {
    start: decisionMs - Math.max(...rules.map((rule) => rule.lag_seconds)) * 1_000,
    end: decisionMs + Math.max(...rules.map((rule) => rule.lead_seconds)) * 1_000,
  };
}

function validateCoverage(
  coverage: InternalPaperEventRiskCoverage,
  input: InternalPaperEventRiskAdmissionInput,
  decisionMs: number,
) {
  const snapshot = input.snapshot;
  const rules = rulesForType(input.policy, coverage.event_type);
  const required = coverageWindowRequired(rules, decisionMs);
  return (
    eventType(coverage.event_type) &&
    coverage.target_ticker === snapshot.target_ticker &&
    coverage.target_sector === snapshot.target_sector &&
    boundedText(coverage.provider) &&
    boundedText(coverage.provider_dataset_version) &&
    explicitInstant(coverage.observed_at) &&
    Date.parse(coverage.observed_at) <= decisionMs &&
    decisionMs - Date.parse(coverage.observed_at) <=
      input.policy.max_snapshot_age_seconds * 1_000 &&
    explicitInstant(coverage.event_window_start) &&
    explicitInstant(coverage.event_window_end) &&
    Date.parse(coverage.event_window_start) <= required.start &&
    Date.parse(coverage.event_window_end) >= required.end &&
    Date.parse(coverage.event_window_start) < Date.parse(coverage.event_window_end) &&
    coverage.search_complete === true &&
    safeIntegerBetween(coverage.reported_revision_count, 0, 1_000_000) &&
    safeIntegerBetween(coverage.reported_logical_event_count, 0, 1_000_000) &&
    boundedText(coverage.entitlement_reference) &&
    boundedText(coverage.retention_rights_reference)
  );
}

function revisionScopeKey(revision: InternalPaperEventRiskEventRevision) {
  return `${revision.scope}:${revision.ticker ?? ""}:${revision.sector ?? ""}`;
}

function validatesAndAppliesToTarget(
  revision: InternalPaperEventRiskEventRevision,
  snapshot: InternalPaperEventRiskSnapshot,
  coverage: InternalPaperEventRiskCoverage,
  decisionMs: number,
) {
  const startsMs = Date.parse(revision.starts_at);
  const endsMs = Date.parse(revision.ends_at);
  const publishedMs = Date.parse(revision.revision_published_at);
  const observedMs = Date.parse(revision.observed_at);
  const scopeValid =
    (revision.scope === "market" &&
      revision.ticker === null &&
      revision.sector === null) ||
    (revision.scope === "ticker" &&
      revision.ticker === snapshot.target_ticker &&
      revision.sector === null) ||
    (revision.scope === "sector" &&
      snapshot.target_sector !== null &&
      revision.ticker === null &&
      revision.sector === snapshot.target_sector);
  return (
    identifier(revision.logical_event_id) &&
    identifier(revision.revision_id) &&
    safeIntegerBetween(revision.revision_sequence, 1, 1_000_000) &&
    eventType(revision.event_type) &&
    ["market", "sector", "ticker"].includes(revision.scope) &&
    ["scheduled", "active", "resolved", "cancelled"].includes(revision.status) &&
    scopeValid &&
    explicitInstant(revision.starts_at) &&
    explicitInstant(revision.ends_at) &&
    startsMs <= endsMs &&
    startsMs >= Date.parse(coverage.event_window_start) &&
    endsMs <= Date.parse(coverage.event_window_end) &&
    explicitInstant(revision.revision_published_at) &&
    explicitInstant(revision.observed_at) &&
    publishedMs <= observedMs &&
    observedMs <= decisionMs &&
    revision.provider === coverage.provider &&
    revision.provider_dataset_version === coverage.provider_dataset_version
  );
}

type Validation = Readonly<{
  coverage: Map<InternalPaperEventRiskType, InternalPaperEventRiskCoverage>;
  latestRevisions: InternalPaperEventRiskEventRevision[];
  reasons: string[];
}>;

function validateSnapshot(
  input: InternalPaperEventRiskAdmissionInput,
  decisionMs: number,
): Validation {
  const snapshot = input.snapshot;
  const reasons: string[] = [];
  const coverageByType = new Map<
    InternalPaperEventRiskType,
    InternalPaperEventRiskCoverage
  >();

  if (
    snapshot.snapshot_version !== INTERNAL_PAPER_EVENT_RISK_SNAPSHOT_VERSION ||
    !identifier(snapshot.snapshot_id) ||
    !SYMBOL_PATTERN.test(snapshot.target_ticker) ||
    (snapshot.target_sector !== null && !boundedText(snapshot.target_sector)) ||
    !explicitInstant(snapshot.decision_at) ||
    Date.parse(snapshot.decision_at) !== decisionMs ||
    !explicitInstant(snapshot.observed_at) ||
    Date.parse(snapshot.observed_at) > decisionMs ||
    decisionMs - Date.parse(snapshot.observed_at) >
      input.policy.max_snapshot_age_seconds * 1_000
  ) {
    reasons.push("snapshot_contract_invalid");
  }

  for (const coverage of snapshot.coverage) {
    if (coverageByType.has(coverage.event_type)) {
      reasons.push("coverage_duplicate");
      continue;
    }
    coverageByType.set(coverage.event_type, coverage);
    if (!validateCoverage(coverage, input, decisionMs)) {
      reasons.push("coverage_invalid_or_incomplete");
    }
  }
  if (!sameStringSet([...coverageByType.keys()], input.policy.required_event_types)) {
    reasons.push("required_coverage_missing");
  }

  const revisionIds = new Set<string>();
  const revisionsByLogicalId = new Map<string, InternalPaperEventRiskEventRevision[]>();
  for (const revision of snapshot.event_revisions) {
    if (revisionIds.has(revision.revision_id)) reasons.push("revision_id_duplicate");
    revisionIds.add(revision.revision_id);
    const coverage = coverageByType.get(revision.event_type);
    if (
      !coverage ||
      !validatesAndAppliesToTarget(revision, snapshot, coverage, decisionMs)
    ) {
      reasons.push("event_revision_invalid_or_not_point_in_time");
    }
    revisionsByLogicalId.set(revision.logical_event_id, [
      ...(revisionsByLogicalId.get(revision.logical_event_id) ?? []),
      revision,
    ]);
  }

  const latestRevisions: InternalPaperEventRiskEventRevision[] = [];
  for (const revisions of revisionsByLogicalId.values()) {
    const identities = new Set(
      revisions.map(
        (revision) =>
          `${revision.event_type}:${revision.provider}:${revision.provider_dataset_version}:${revisionScopeKey(revision)}`,
      ),
    );
    const sequences = revisions.map((revision) => revision.revision_sequence);
    if (identities.size !== 1 || new Set(sequences).size !== sequences.length) {
      reasons.push("event_revision_chain_invalid");
      continue;
    }
    const ordered = [...revisions].sort((left, right) => {
      const time =
        Date.parse(left.revision_published_at) -
        Date.parse(right.revision_published_at);
      return time || left.revision_sequence - right.revision_sequence;
    });
    for (let index = 1; index < ordered.length; index += 1) {
      const prior = ordered[index - 1]!;
      const current = ordered[index]!;
      if (
        Date.parse(prior.revision_published_at) ===
          Date.parse(current.revision_published_at) ||
        prior.revision_sequence >= current.revision_sequence
      ) {
        reasons.push("event_revision_chain_invalid");
      }
    }
    if (
      ordered[0]?.revision_sequence !== 1 ||
      ordered.some(
        (revision, index) => revision.revision_sequence !== index + 1,
      )
    ) {
      reasons.push("event_revision_chain_incomplete");
    }
    latestRevisions.push(ordered.at(-1)!);
  }

  for (const type of INTERNAL_PAPER_EVENT_RISK_TYPES) {
    const coverage = coverageByType.get(type);
    if (!coverage) continue;
    const typeRevisions = snapshot.event_revisions.filter(
      (revision) => revision.event_type === type,
    );
    const logicalCount = new Set(
      typeRevisions.map((revision) => revision.logical_event_id),
    ).size;
    if (
      coverage.reported_revision_count !== typeRevisions.length ||
      coverage.reported_logical_event_count !== logicalCount
    ) {
      reasons.push("coverage_count_mismatch");
    }
  }

  return {
    coverage: coverageByType,
    latestRevisions,
    reasons: uniqueSorted(reasons),
  };
}

function matchingRules(
  revision: InternalPaperEventRiskEventRevision,
  rules: readonly InternalPaperEventRiskRule[],
  decisionMs: number,
) {
  const start = Date.parse(revision.starts_at);
  const end = Date.parse(revision.ends_at);
  return rules.filter(
    (rule) =>
      decisionMs >= start - rule.lead_seconds * 1_000 &&
      decisionMs <= end + rule.lag_seconds * 1_000,
  );
}

function matchedEvent(
  revision: InternalPaperEventRiskEventRevision,
  rules: readonly InternalPaperEventRiskRule[],
): InternalPaperEventRiskMatchedEvent {
  const strongest = [...rules].sort((left, right) => {
    const rank = actionRank(right.action) - actionRank(left.action);
    return rank || left.size_multiplier_bps - right.size_multiplier_bps;
  })[0]!;
  const multiplier =
    strongest.action === "deny"
      ? 0
      : Math.min(...rules.map((rule) => rule.size_multiplier_bps));
  return {
    logical_event_id: revision.logical_event_id,
    revision_id: revision.revision_id,
    event_type: revision.event_type,
    scope: revision.scope,
    status: revision.status as "scheduled" | "active" | "resolved",
    starts_at: revision.starts_at,
    ends_at: revision.ends_at,
    matched_rule_ids: rules.map((rule) => rule.rule_id).sort(),
    action: strongest.action,
    size_multiplier_bps: multiplier,
  };
}

function terminal(
  input: InternalPaperEventRiskAdmissionInput,
  value: Omit<
    InternalPaperEventRiskAdmissionResult,
    "result_version" | "admission_version" | "evidence_limits" | "authority" | "input_digest" | "result_digest"
  >,
) {
  const payload = {
    result_version: INTERNAL_PAPER_EVENT_RISK_RESULT_VERSION,
    admission_version: INTERNAL_PAPER_EVENT_RISK_ADMISSION_VERSION,
    ...value,
    evidence_limits: EVIDENCE_LIMITS,
    authority: AUTHORITY,
    input_digest: digest(input),
  } as const;
  return deepFreeze({
    ...payload,
    result_digest: digest(payload),
  }) satisfies InternalPaperEventRiskAdmissionResult;
}

export function verifyInternalPaperEventRiskAdmissionDigest(
  result: InternalPaperEventRiskAdmissionResult,
) {
  const { result_digest: resultDigest, ...payload } = result;
  return /^[a-f0-9]{64}$/.test(resultDigest) && digest(payload) === resultDigest;
}

export function evaluateInternalPaperEventRiskAdmission(
  input: InternalPaperEventRiskAdmissionInput,
): InternalPaperEventRiskAdmissionResult {
  const snapshot = input.snapshot;
  const decisionMs = explicitInstant(snapshot?.decision_at)
    ? Date.parse(snapshot.decision_at)
    : Number.NaN;
  const base = {
    policy_id: identifier(input.policy?.policy_id) ? input.policy.policy_id : null,
    snapshot_id: identifier(snapshot?.snapshot_id) ? snapshot.snapshot_id : null,
    target_ticker:
      typeof snapshot?.target_ticker === "string" ? snapshot.target_ticker : null,
    decision_at: explicitInstant(snapshot?.decision_at)
      ? snapshot.decision_at
      : null,
  };

  if (
    input.admission_version !== INTERNAL_PAPER_EVENT_RISK_ADMISSION_VERSION ||
    !Number.isFinite(decisionMs)
  ) {
    return terminal(input, {
      status: "blocked",
      disposition: "unavailable",
      size_multiplier_bps: null,
      ...base,
      covered_event_types: [],
      matched_events: [],
      reason_codes: ["admission_contract_invalid"],
    });
  }
  if (!validatePolicy(input.policy, decisionMs)) {
    return terminal(input, {
      status: "blocked",
      disposition: "unavailable",
      size_multiplier_bps: null,
      ...base,
      covered_event_types: [],
      matched_events: [],
      reason_codes: ["event_risk_policy_invalid"],
    });
  }

  const validation = validateSnapshot(input, decisionMs);
  if (validation.reasons.length > 0) {
    return terminal(input, {
      status: "blocked",
      disposition: "unavailable",
      size_multiplier_bps: null,
      ...base,
      covered_event_types: uniqueSorted([...validation.coverage.keys()]),
      matched_events: [],
      reason_codes: validation.reasons,
    });
  }

  const matched = validation.latestRevisions
    .filter((revision) => revision.status !== "cancelled")
    .map((revision) => ({
      revision,
      rules: matchingRules(
        revision,
        rulesForType(input.policy, revision.event_type),
        decisionMs,
      ),
    }))
    .filter((item) => item.rules.length > 0)
    .map((item) => matchedEvent(item.revision, item.rules))
    .sort((left, right) =>
      `${left.event_type}:${left.logical_event_id}`.localeCompare(
        `${right.event_type}:${right.logical_event_id}`,
      ),
    );

  const strongestRank = Math.max(0, ...matched.map((event) => actionRank(event.action)));
  const disposition =
    strongestRank === 2 ? "denied" : strongestRank === 1 ? "reduced" : "admitted";
  const sizeMultiplier =
    disposition === "denied"
      ? 0
      : Math.min(10_000, ...matched.map((event) => event.size_multiplier_bps));
  const reasonCodes =
    disposition === "denied"
      ? ["event_risk_denied"]
      : disposition === "reduced"
        ? ["event_risk_reduced"]
        : matched.length > 0
          ? ["event_risk_matched_allow"]
          : ["no_applicable_event_risk"];

  return terminal(input, {
    status: "completed",
    disposition,
    size_multiplier_bps: sizeMultiplier,
    ...base,
    covered_event_types: [...INTERNAL_PAPER_EVENT_RISK_TYPES],
    matched_events: matched,
    reason_codes: reasonCodes,
  });
}
