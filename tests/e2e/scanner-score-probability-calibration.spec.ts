import { expect, test } from "@playwright/test";

import {
  applyScannerScoreProbabilityCalibration,
  buildScannerScoreProbabilityCalibrationModel,
  SCANNER_SCORE_PROBABILITY_CALIBRATION_MODEL_VERSION,
  type ScannerScoreProbabilityCalibrationTrainingInput,
} from "@/lib/scanner-score-probability-calibration";

const trainingStartAt = "2026-08-28T13:30:00.000Z";
const trainingEndAt = "2026-09-28T13:30:00.000Z";

function observations(
  count = 30,
  score: (index: number) => number = () => 70,
): ScannerScoreProbabilityCalibrationTrainingInput[] {
  return Array.from({ length: count }, (_, index) => {
    const day = 24 + (index % 3);
    return {
      candidate_id: `candidate-${index}`,
      ticker: ["AAPL", "MSFT", "NVDA"][index % 3]!,
      decision_at: `2026-09-${day}T14:00:00.000Z`,
      outcome_evaluated_at: `2026-09-${day}T15:05:00.000Z`,
      baseline_score: score(index),
      candidate_score: score(index),
      terminal_outcome:
        index % 2 === 0 ? "target_before_stop" : "stop_before_target",
    };
  });
}

test.describe("scanner score probability calibration", () => {
  test("fits an immutable prior-only model and applies probability semantics", () => {
    const model = buildScannerScoreProbabilityCalibrationModel({
      fittedAt: trainingEndAt,
      trainingStartAt,
      trainingEndAt,
      observations: observations(),
    });

    expect(model).not.toBeNull();
    expect(model?.contract_version).toBe(
      SCANNER_SCORE_PROBABILITY_CALIBRATION_MODEL_VERSION,
    );
    expect(model?.sample_count).toBe(30);
    expect(model?.trading_day_count).toBe(3);
    expect(model?.ticker_count).toBe(3);
    expect(model?.live_ranking_effect).toBe(false);

    const applied = applyScannerScoreProbabilityCalibration({
      model,
      arm: "candidate",
      score: 70,
      decisionAt: "2026-09-28T13:45:00.000Z",
    });
    expect(applied).toMatchObject({
      bucket_id: "score_60_80",
      probability: 0.5,
      training_sample_count: 30,
      probability_semantics: "calibrated_probability_0_1",
    });
  });

  test("rejects future outcome leakage and duplicate candidate identities", () => {
    const futureOutcome = observations();
    futureOutcome[0] = {
      ...futureOutcome[0]!,
      outcome_evaluated_at: "2026-09-28T13:31:00.000Z",
    };
    expect(buildScannerScoreProbabilityCalibrationModel({
      fittedAt: trainingEndAt,
      trainingStartAt,
      trainingEndAt,
      observations: futureOutcome,
    })).toBeNull();

    const duplicate = observations();
    duplicate[1] = { ...duplicate[1]!, candidate_id: "candidate-0" };
    expect(buildScannerScoreProbabilityCalibrationModel({
      fittedAt: trainingEndAt,
      trainingStartAt,
      trainingEndAt,
      observations: duplicate,
    })).toBeNull();
  });

  test("does not claim probability semantics for an under-sampled score bucket", () => {
    const model = buildScannerScoreProbabilityCalibrationModel({
      fittedAt: trainingEndAt,
      trainingStartAt,
      trainingEndAt,
      observations: observations(30, (index) => index < 9 ? 50 : 70),
    });
    expect(model).not.toBeNull();
    expect(applyScannerScoreProbabilityCalibration({
      model,
      arm: "baseline",
      score: 50,
      decisionAt: "2026-09-28T14:00:00.000Z",
    })).toBeNull();
    expect(applyScannerScoreProbabilityCalibration({
      model,
      arm: "baseline",
      score: 70,
      decisionAt: "2026-09-28T14:00:00.000Z",
    })?.training_sample_count).toBe(21);
  });

  test("rejects model tampering and use before fit cutoff", () => {
    const model = buildScannerScoreProbabilityCalibrationModel({
      fittedAt: trainingEndAt,
      trainingStartAt,
      trainingEndAt,
      observations: observations(),
    });
    expect(model).not.toBeNull();
    expect(applyScannerScoreProbabilityCalibration({
      model,
      arm: "candidate",
      score: 70,
      decisionAt: "2026-09-28T13:29:59.999Z",
    })).toBeNull();
    expect(applyScannerScoreProbabilityCalibration({
      model: model
        ? { ...model, sample_count: model.sample_count + 1 }
        : null,
      arm: "candidate",
      score: 70,
      decisionAt: "2026-09-28T14:00:00.000Z",
    })).toBeNull();
  });
});
