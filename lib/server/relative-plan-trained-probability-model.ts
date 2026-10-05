import "server-only";
import type { RecommendationLearningBaselineSource } from "@/lib/recommendation-learning-baseline-source";
import { buildScannerScoreProbabilityCalibrationModel,
  type ScannerScoreProbabilityCalibrationTrainingInput } from "@/lib/scanner-score-probability-calibration";
import { buildRelativePlanProspectiveEnrollment } from "@/lib/server/relative-plan-prospective-enrollment";
import { verifiedRelativePlanProspectiveFreeze, relativePlanSemanticFingerprint,
  relativePlanSemanticJson, type RelativePlanProspectiveFreeze } from "@/lib/server/relative-plan-prospective-comparison";
import type { RelativePlanContextOutcomeComparison } from "@/lib/scanner-relative-plan-context-outcomes";

export const RELATIVE_PLAN_TRAINED_PROBABILITY_MODEL_VERSION = "relative_plan_trained_probability_model_v1" as const;
export const RELATIVE_PLAN_TRAINED_PROBABILITY_RECEIPT_VERSION = "relative_plan_trained_probability_receipt_v1" as const;
// Physical complete-capsule bound, never a sampling or quality threshold.
export const RELATIVE_PLAN_TRAINED_PROBABILITY_MAX_BYTES = 8 * 1048576;

type TrainingReceipt = {
  run_fingerprint: string; decision_at: string; candidate_id: string; ticker: string;
  baseline_score: number; candidate_score: number; snapshot_fingerprint: string | null;
  outcome_id: string | null; evaluated_at: string | null; recorded_at: string | null;
  terminal_outcome: string | null; binary_label: 0 | 1 | null;
  outcome_reason: string | null;
  resolution: "binary" | "non_binary" | "missing_or_conflicting";
};
export type RelativePlanTrainedProbabilityModel = {
  contract_version: typeof RELATIVE_PLAN_TRAINED_PROBABILITY_MODEL_VERSION;
  owner_user_id: string; prospective_freeze_id: string; plan_fingerprint: string;
  training_window: RelativePlanProspectiveFreeze["plan"]["windows"]["training"];
  forward_cutoff: string;
  fitting_boundary_semantics: "declared_data_cutoff_not_training_job_execution_time";
  training_source_as_of: string;
  retained_training_source: RecommendationLearningBaselineSource;
  model: NonNullable<ReturnType<typeof buildScannerScoreProbabilityCalibrationModel>>;
  original_training_receipts: TrainingReceipt[];
  original_training_membership_fingerprint: string;
  fitting_input_fingerprint: string;
  original_population_count: number; canonical_outcome_count: number;
  missing_outcome_count: number; non_binary_outcome_count: number;
  model_binding_fingerprint: string;
  authority: RelativePlanProspectiveFreeze["plan"]["authority"];
};
export type RelativePlanTrainedProbabilityReceipt = {
  contract_version: typeof RELATIVE_PLAN_TRAINED_PROBABILITY_RECEIPT_VERSION;
  materialization_id: string; owner_user_id: string; materialized_at: string; committed_read_at: string;
  trained_model: RelativePlanTrainedProbabilityModel;
};

/** Current label values are deliberately excluded: only the original enrolled
 * identities, scores and bound snapshot plans must match the sealed population. */
export function relativePlanTrainedPopulationMatches(receipt: RelativePlanTrainedProbabilityReceipt,
  comparisons: RelativePlanContextOutcomeComparison[]): boolean {
  if (comparisons.some(row => !Number.isFinite(Date.parse(row.decision_timestamp ?? "")))) return false;
  const current = [...comparisons].sort((a, b) => Date.parse(a.decision_timestamp ?? "") - Date.parse(b.decision_timestamp ?? "") ||
    a.scan_run_fingerprint.localeCompare(b.scan_run_fingerprint)).flatMap(comparison => comparison.candidates.map(row => ({
      run_fingerprint: comparison.scan_run_fingerprint, decision_at: new Date(comparison.decision_timestamp!).toISOString(), candidate_id: row.candidate_id,
      ticker: row.ticker, baseline_score: row.baseline_score, candidate_score: row.shadow_score,
      snapshot_fingerprint: row.snapshot_fingerprint })));
  const sealed = receipt.trained_model.original_training_receipts.map(row => ({
    run_fingerprint: row.run_fingerprint, decision_at: row.decision_at, candidate_id: row.candidate_id,
    ticker: row.ticker, baseline_score: row.baseline_score, candidate_score: row.candidate_score,
    snapshot_fingerprint: row.snapshot_fingerprint }));
  return relativePlanSemanticJson(current) === relativePlanSemanticJson(sealed);
}

function fits(row: TrainingReceipt): row is TrainingReceipt & { binary_label: 0 | 1; evaluated_at: string } {
  return row.resolution === "binary" && row.binary_label !== null && row.evaluated_at !== null;
}
function fittingInputs(rows: TrainingReceipt[]): ScannerScoreProbabilityCalibrationTrainingInput[] {
  return rows.filter(fits).map(row => ({ candidate_id: row.candidate_id, ticker: row.ticker,
    decision_at: row.decision_at, outcome_evaluated_at: row.evaluated_at,
    baseline_score: row.baseline_score, candidate_score: row.candidate_score,
    terminal_outcome: row.binary_label === 1 ? "target_before_stop" : "stop_before_target" }));
}

/** A training job candidate, never a materialization receipt. A separate
 * database transaction must observe the committed model before held-out starts. No
 * historical reconstruction may substitute for that forward-time boundary. */
export function buildRelativePlanTrainedProbabilityModel(input: {
  owner: string; freeze: unknown; source: RecommendationLearningBaselineSource; now: Date;
}) {
  const blocked = (blocker: string) => ({ status: "not_ready" as const, trained_model: null, blocker });
  const freeze = verifiedRelativePlanProspectiveFreeze(input.freeze, input.owner);
  if (!freeze || !Number.isFinite(input.now.getTime())) return blocked("trained_probability_original_freeze_invalid");
  const plan = freeze.plan, cutoff = Date.parse(plan.windows.held_out.start_at);
  if (input.now.getTime() < Date.parse(plan.windows.training.end_at) + 3600000) return blocked("trained_probability_training_maturity_not_reached");
  if (input.now.getTime() >= cutoff) return blocked("trained_probability_forward_cutoff_already_reached");
  const original = buildRelativePlanProspectiveEnrollment(input);
  if (!original) return blocked("trained_probability_original_population_unavailable");
  const byId = new Map<string, RecommendationLearningBaselineSource["outcomes"]>();
  for (const outcome of input.source.outcomes) {
    const rows = byId.get(outcome.id) ?? []; rows.push(outcome); byId.set(outcome.id, rows);
  }
  const training = original.partitions[0].decisions;
  const trainingRuns = new Set(training.map(row => row.fingerprint));
  const snapshots = input.source.snapshots.filter(row => trainingRuns.has(row.scan_run_id ?? ""));
  const snapshotFingerprints = new Set(snapshots.map(row => row.snapshot_fingerprint));
  const outcomeIds = new Set(input.source.outcomes.filter(row => row.snapshot_fingerprint !== null &&
    snapshotFingerprints.has(row.snapshot_fingerprint)).map(row => row.id));
  // Retain full original normalized evidence, including conflicting/late
  // labels, not merely the fitted winners or a self-hashed score summary.
  // Freeze the actual JSON persistence representation. Optional undefined
  // object fields cannot survive JSONB; retaining them in a JS-only hash
  // would make an otherwise exact committed read irreproducible.
  const retainedSource: RecommendationLearningBaselineSource = JSON.parse(JSON.stringify({
    scanRuns: input.source.scanRuns.filter(row => trainingRuns.has(row.run_fingerprint)).sort((a, b) => a.id.localeCompare(b.id)),
    snapshots: [...snapshots].sort((a, b) => a.id.localeCompare(b.id)),
    outcomes: input.source.outcomes.filter(row => (row.snapshot_fingerprint !== null &&
      snapshotFingerprints.has(row.snapshot_fingerprint)) || outcomeIds.has(row.id))
      .sort((a, b) => a.id.localeCompare(b.id)),
  }));
  const receipts: TrainingReceipt[] = [];
  for (const decision of training) for (const row of decision.comparison.candidates) {
    if (row.context_status !== "assessed" || typeof row.baseline_score !== "number" ||
      typeof row.shadow_score !== "number" || !Number.isFinite(row.baseline_score) || !Number.isFinite(row.shadow_score)) {
      return blocked("trained_probability_original_assessment_invalid");
    }
    const matches = row.outcome_id ? byId.get(row.outcome_id) ?? [] : input.source.outcomes.filter(outcome =>
      outcome.snapshot_fingerprint === row.snapshot_fingerprint && outcome.ticker === row.ticker && outcome.horizon === "60m");
    const outcome = matches.length === 1 ? matches[0] : null;
    const evaluated = Date.parse(outcome?.evaluated_at ?? ""), recorded = Date.parse(outcome?.created_at ?? "");
    const available = row.outcome_status === "resolved" && outcome !== null &&
      outcome.snapshot_fingerprint === row.snapshot_fingerprint && outcome.ticker === row.ticker &&
      evaluated >= Date.parse(decision.decision_at) + 3600000 && recorded >= evaluated &&
      evaluated <= input.now.getTime() && recorded <= input.now.getTime() && evaluated < cutoff && recorded < cutoff;
    const label = available && row.terminal_outcome === "target_before_stop" ? 1 :
      available && row.terminal_outcome === "stop_before_target" ? 0 : null;
    // The receipt's existing clock contract is canonical UTC; the retained
    // original source above preserves its exact offset encoding independently.
    receipts.push({ run_fingerprint: decision.fingerprint, decision_at: new Date(decision.decision_at).toISOString(),
      candidate_id: row.candidate_id, ticker: row.ticker, baseline_score: row.baseline_score,
      candidate_score: row.shadow_score, snapshot_fingerprint: row.snapshot_fingerprint,
      outcome_id: row.outcome_id ?? outcome?.id ?? null, evaluated_at: Number.isFinite(evaluated) ? new Date(evaluated).toISOString() : null,
      recorded_at: Number.isFinite(recorded) ? new Date(recorded).toISOString() : null,
      terminal_outcome: available ? row.terminal_outcome : null, binary_label: label,
      outcome_reason: available ? row.outcome_reason : "canonical_label_unavailable_at_training_job",
      resolution: !available ? "missing_or_conflicting" : label === null ? "non_binary" : "binary" });
  }
  const inputs = fittingInputs(receipts);
  const model = buildScannerScoreProbabilityCalibrationModel({ fittedAt: plan.windows.held_out.start_at,
    trainingStartAt: plan.windows.training.start_at, trainingEndAt: plan.windows.held_out.start_at, observations: inputs });
  if (!model) return blocked("trained_probability_unchanged_training_policy_insufficient");
  const body: Omit<RelativePlanTrainedProbabilityModel, "model_binding_fingerprint"> = {
    contract_version: RELATIVE_PLAN_TRAINED_PROBABILITY_MODEL_VERSION,
    owner_user_id: input.owner, prospective_freeze_id: freeze.freeze_id, plan_fingerprint: plan.plan_fingerprint,
    training_window: { ...plan.windows.training }, forward_cutoff: plan.windows.held_out.start_at,
    fitting_boundary_semantics: "declared_data_cutoff_not_training_job_execution_time",
    training_source_as_of: input.now.toISOString(), retained_training_source: retainedSource, model,
    original_training_receipts: receipts,
    original_training_membership_fingerprint: relativePlanSemanticFingerprint(receipts.map(row => [row.run_fingerprint, row.candidate_id])),
    fitting_input_fingerprint: relativePlanSemanticFingerprint(inputs), original_population_count: receipts.length,
    canonical_outcome_count: receipts.filter(row => row.resolution !== "missing_or_conflicting").length,
    missing_outcome_count: receipts.filter(row => row.resolution === "missing_or_conflicting").length,
    non_binary_outcome_count: receipts.filter(row => row.resolution === "non_binary").length,
    authority: { ...plan.authority },
  };
  const trained = { ...body, model_binding_fingerprint: relativePlanSemanticFingerprint(body) };
  if (Buffer.byteLength(relativePlanSemanticJson(trained), "utf8") > RELATIVE_PLAN_TRAINED_PROBABILITY_MAX_BYTES) {
    return blocked("trained_probability_complete_training_capsule_too_large");
  }
  return { status: "ready" as const, trained_model: trained, blocker: null };
}

function exactRecord(value: unknown, fields: string[]): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value) &&
    [Object.prototype, null].includes(Object.getPrototypeOf(value)) &&
    Object.keys(value).length === fields.length && fields.every(field => Object.hasOwn(value, field));
}
function instant(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) &&
    Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
}
function textIdentity(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 512 && value.trim() === value;
}
function verifyModel(value: unknown, freeze: RelativePlanProspectiveFreeze, materializedAt: string): RelativePlanTrainedProbabilityModel | null {
  if (!exactRecord(value, ["contract_version", "owner_user_id", "prospective_freeze_id", "plan_fingerprint", "training_window",
    "forward_cutoff", "fitting_boundary_semantics", "training_source_as_of", "retained_training_source", "model", "original_training_receipts", "original_training_membership_fingerprint",
    "fitting_input_fingerprint", "original_population_count", "canonical_outcome_count", "missing_outcome_count",
    "non_binary_outcome_count", "model_binding_fingerprint", "authority"]) ||
    value.contract_version !== RELATIVE_PLAN_TRAINED_PROBABILITY_MODEL_VERSION ||
    value.owner_user_id !== freeze.owner_user_id || value.prospective_freeze_id !== freeze.freeze_id ||
    value.plan_fingerprint !== freeze.plan.plan_fingerprint ||
    relativePlanSemanticJson(value.training_window) !== relativePlanSemanticJson(freeze.plan.windows.training) ||
    value.forward_cutoff !== freeze.plan.windows.held_out.start_at ||
    value.fitting_boundary_semantics !== "declared_data_cutoff_not_training_job_execution_time" ||
    !instant(value.training_source_as_of) || Date.parse(value.training_source_as_of) > Date.parse(materializedAt) ||
    !exactRecord(value.retained_training_source, ["scanRuns", "snapshots", "outcomes"]) ||
    ![value.retained_training_source.scanRuns, value.retained_training_source.snapshots, value.retained_training_source.outcomes]
      .every(rows => Array.isArray(rows) && rows.length <= 100000 && rows.every(row => row && typeof row === "object" && !Array.isArray(row))) ||
    relativePlanSemanticJson(value.authority) !== relativePlanSemanticJson(freeze.plan.authority) ||
    !Array.isArray(value.original_training_receipts)) return null;
  const rows: TrainingReceipt[] = [], candidates = new Set<string>(), runTimes = new Map<string, string>();
  let previousRun = "", previousTime = -Infinity;
  const start = Date.parse(freeze.plan.windows.training.start_at), end = Date.parse(freeze.plan.windows.training.end_at);
  const materialized = Date.parse(materializedAt), cutoff = Date.parse(freeze.plan.windows.held_out.start_at);
  for (const raw of value.original_training_receipts) {
    if (!exactRecord(raw, ["run_fingerprint", "decision_at", "candidate_id", "ticker", "baseline_score", "candidate_score",
      "snapshot_fingerprint", "outcome_id", "evaluated_at", "recorded_at", "terminal_outcome", "binary_label", "outcome_reason", "resolution"]) ||
      !textIdentity(raw.run_fingerprint) || !textIdentity(raw.candidate_id) || candidates.has(raw.candidate_id) ||
      !textIdentity(raw.ticker) || raw.ticker !== raw.ticker.toUpperCase() || !instant(raw.decision_at) ||
      Date.parse(raw.decision_at) < start || Date.parse(raw.decision_at) >= end ||
      typeof raw.baseline_score !== "number" || !Number.isFinite(raw.baseline_score) || raw.baseline_score < 0 || raw.baseline_score > 100 ||
      typeof raw.candidate_score !== "number" || !Number.isFinite(raw.candidate_score) || raw.candidate_score < 0 || raw.candidate_score > 100 ||
      (raw.snapshot_fingerprint !== null && !textIdentity(raw.snapshot_fingerprint)) ||
      (raw.outcome_id !== null && !textIdentity(raw.outcome_id)) ||
      (raw.evaluated_at !== null && !instant(raw.evaluated_at)) || (raw.recorded_at !== null && !instant(raw.recorded_at)) ||
      (raw.outcome_reason !== null && !textIdentity(raw.outcome_reason))) return null;
    const decisionTime = Date.parse(raw.decision_at);
    if (decisionTime < previousTime || (decisionTime === previousTime && raw.run_fingerprint < previousRun) ||
      (runTimes.has(raw.run_fingerprint) && runTimes.get(raw.run_fingerprint) !== raw.decision_at)) return null;
    previousTime = decisionTime; previousRun = raw.run_fingerprint;
    candidates.add(raw.candidate_id); runTimes.set(raw.run_fingerprint, raw.decision_at);
    if (raw.resolution === "missing_or_conflicting") {
      // Observed receipt identities/clocks remain disclosed, but unavailable
      // labels never enter model fitting, even if the observation is later.
      if (raw.binary_label !== null || raw.terminal_outcome !== null ||
        raw.outcome_reason !== "canonical_label_unavailable_at_training_job") return null;
    } else {
      if (!textIdentity(raw.snapshot_fingerprint) || !textIdentity(raw.outcome_id) || !instant(raw.evaluated_at) || !instant(raw.recorded_at) ||
        Date.parse(raw.evaluated_at) < decisionTime + 3600000 || Date.parse(raw.recorded_at) < Date.parse(raw.evaluated_at) ||
        Date.parse(raw.recorded_at) > materialized || Date.parse(raw.evaluated_at) > materialized ||
        Date.parse(raw.recorded_at) >= cutoff || Date.parse(raw.evaluated_at) >= cutoff) return null;
      if (raw.resolution === "binary") {
        if (!((raw.binary_label === 1 && raw.terminal_outcome === "target_before_stop") ||
          (raw.binary_label === 0 && raw.terminal_outcome === "stop_before_target"))) return null;
      } else if (raw.resolution !== "non_binary" || raw.binary_label !== null ||
        !["no_entry", "neither"].includes(String(raw.terminal_outcome))) return null;
    }
    rows.push(raw as TrainingReceipt);
  }
  const observations = fittingInputs(rows);
  const rebuilt = buildScannerScoreProbabilityCalibrationModel({ fittedAt: freeze.plan.windows.held_out.start_at,
    trainingStartAt: freeze.plan.windows.training.start_at, trainingEndAt: freeze.plan.windows.held_out.start_at, observations });
  if (!rebuilt || relativePlanSemanticJson(rebuilt) !== relativePlanSemanticJson(value.model) ||
    value.original_population_count !== rows.length || value.canonical_outcome_count !== rows.filter(row => row.resolution !== "missing_or_conflicting").length ||
    value.missing_outcome_count !== rows.filter(row => row.resolution === "missing_or_conflicting").length ||
    value.non_binary_outcome_count !== rows.filter(row => row.resolution === "non_binary").length ||
    value.original_training_membership_fingerprint !== relativePlanSemanticFingerprint(rows.map(row => [row.run_fingerprint, row.candidate_id])) ||
    value.fitting_input_fingerprint !== relativePlanSemanticFingerprint(observations)) return null;
  const { model_binding_fingerprint: binding, ...body } = value;
  if (binding !== relativePlanSemanticFingerprint(body)) return null;
  // Reproduce the canonical decision/source/outcome link from the retained
  // capsule itself. Mutable contemporary history is never used for this check.
  const rebuiltCandidate = buildRelativePlanTrainedProbabilityModel({ owner: freeze.owner_user_id, freeze,
    source: value.retained_training_source as RecommendationLearningBaselineSource,
    now: new Date(value.training_source_as_of) }).trained_model;
  return rebuiltCandidate && relativePlanSemanticJson(rebuiltCandidate) === relativePlanSemanticJson(value)
    ? value as RelativePlanTrainedProbabilityModel : null;
}

/** Read only a database-attested immutable capsule. Model self-hashes alone
 * do not attest the original population; the actual job must read it from the
 * owner-bound persisted source before sealing, and the store verifies readback. */
export function verifiedRelativePlanTrainedProbabilityReceipt(value: unknown, freezeValue: unknown,
  owner: string): RelativePlanTrainedProbabilityReceipt | null {
  try {
    const freeze = verifiedRelativePlanProspectiveFreeze(freezeValue, owner);
    if (!freeze || !exactRecord(value, ["contract_version", "materialization_id", "owner_user_id", "materialized_at", "committed_read_at", "trained_model"]) ||
      value.contract_version !== RELATIVE_PLAN_TRAINED_PROBABILITY_RECEIPT_VERSION || value.owner_user_id !== owner ||
      typeof value.materialization_id !== "string" || !/^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value.materialization_id) ||
      !instant(value.materialized_at) || Date.parse(value.materialized_at) < Date.parse(freeze.plan.windows.training.end_at) + 3600000 ||
      Date.parse(value.materialized_at) >= Date.parse(freeze.plan.windows.held_out.start_at) ||
      !instant(value.committed_read_at) || Date.parse(value.committed_read_at) < Date.parse(value.materialized_at) ||
      Date.parse(value.committed_read_at) >= Date.parse(freeze.plan.windows.held_out.start_at) ||
      Buffer.byteLength(relativePlanSemanticJson(value.trained_model), "utf8") > RELATIVE_PLAN_TRAINED_PROBABILITY_MAX_BYTES) return null;
    const model = verifyModel(value.trained_model, freeze, value.materialized_at);
    return model ? { contract_version: RELATIVE_PLAN_TRAINED_PROBABILITY_RECEIPT_VERSION,
      materialization_id: value.materialization_id, owner_user_id: owner, materialized_at: value.materialized_at,
      committed_read_at: value.committed_read_at, trained_model: model } : null;
  } catch { return null; }
}
