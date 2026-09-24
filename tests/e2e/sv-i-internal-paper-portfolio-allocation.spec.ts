import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";

import {
  allocateInternalPaperPortfolio,
  INTERNAL_PAPER_PORTFOLIO_ALLOCATION_VERSION,
  INTERNAL_PAPER_PORTFOLIO_RISK_ESTIMATE_VERSION,
  verifyInternalPaperPortfolioAllocationDigest,
  type InternalPaperPortfolioAllocationInput,
  type InternalPaperPortfolioCandidate,
  type InternalPaperPortfolioRiskEstimate,
} from "@/lib/internal-paper-portfolio-allocation";

const fingerprint = (value: string) =>
  createHash("sha256").update(value).digest("hex");
const allocationAt = "2026-09-24T13:45:30.000Z";
const decisionAt = "2026-09-24T13:45:00.000Z";

function riskEstimate(
  overrides: Partial<InternalPaperPortfolioRiskEstimate> = {},
): InternalPaperPortfolioRiskEstimate {
  return {
    estimate_version: INTERNAL_PAPER_PORTFOLIO_RISK_ESTIMATE_VERSION,
    sector: "technology",
    correlation_group: "mega_cap_tech",
    beta: 1,
    stress_losses: [
      { scenario_id: "market_down_5pct", loss_per_share: 3 },
      { scenario_id: "sector_drawdown", loss_per_share: 4 },
    ],
    observed_at: "2026-09-24T13:44:45.000Z",
    model_version: "portfolio_risk_model_v1",
    source_fingerprint: fingerprint("risk"),
    ...overrides,
  };
}

function candidate(
  candidateId: string,
  overrides: Partial<InternalPaperPortfolioCandidate> = {},
): InternalPaperPortfolioCandidate {
  return {
    candidate_id: candidateId,
    decision_fingerprint: fingerprint(`decision-${candidateId}`),
    decision_timestamp: decisionAt,
    ticker: candidateId,
    entry_price: 100,
    stop_price: 98,
    calibrated_net_expected_value_r: 0.6,
    calibration_version: "frozen_oos_calibration_v1",
    calibration_evaluation_fingerprint: fingerprint(`calibration-${candidateId}`),
    risk_estimate: riskEstimate(),
    ...overrides,
  };
}

function input(
  overrides: Partial<InternalPaperPortfolioAllocationInput> = {},
): InternalPaperPortfolioAllocationInput {
  return {
    allocation_version: INTERNAL_PAPER_PORTFOLIO_ALLOCATION_VERSION,
    policy: {
      policy_version: "internal_paper_portfolio_policy_v1",
      allocation_at: allocationAt,
      max_open_positions: 3,
      cash_balance: 10_000,
      cash_reserve: 1_000,
      max_total_open_risk: 500,
      max_position_risk: 200,
      max_sector_open_risk: 250,
      max_sector_positions: 1,
      max_correlation_group_open_risk: 250,
      max_correlation_group_positions: 1,
      max_absolute_beta_notional: 10_000,
      stress_scenarios: [
        {
          scenario_version: "internal_paper_portfolio_stress_scenario_v1",
          scenario_id: "market_down_5pct",
          max_open_loss: 500,
        },
        {
          scenario_version: "internal_paper_portfolio_stress_scenario_v1",
          scenario_id: "sector_drawdown",
          max_open_loss: 500,
        },
      ],
      spread_bps: 10,
      slippage_bps: 10,
      commission_per_order: 1,
      max_risk_estimate_age_seconds: 120,
    },
    open_positions: [],
    candidates: [
      candidate("ALPHA", { calibrated_net_expected_value_r: 0.8 }),
      candidate("BRAVO", {
        calibrated_net_expected_value_r: 0.7,
        risk_estimate: riskEstimate({
          sector: "healthcare",
          correlation_group: "healthcare_large_cap",
          beta: 0.6,
          source_fingerprint: fingerprint("bravo-risk"),
        }),
      }),
    ],
    ...overrides,
  };
}

test("allocates calibrated net-EV deterministically with dynamic risk and cash sizing", () => {
  const result = allocateInternalPaperPortfolio(input());

  expect(result.status).toBe("completed");
  if (result.status !== "completed") return;
  expect(result.candidate_decisions).toEqual([
    expect.objectContaining({
      candidate_id: "ALPHA",
      status: "selected",
      quantity: 89,
      estimated_entry_price: 100.15,
      estimated_cash_required: 8914.35,
      estimated_open_risk: 193.35,
    }),
    expect.objectContaining({
      candidate_id: "BRAVO",
      status: "rejected",
      reason_codes: ["cash_reserve_limit_reached"],
    }),
  ]);
  expect(result.selected_count).toBe(1);
  expect(result.remaining_cash).toBe(85.65);
  expect(verifyInternalPaperPortfolioAllocationDigest(result)).toBe(true);
});

test("enforces sector and correlation concentration before selecting a lower-ranked independent signal", () => {
  const result = allocateInternalPaperPortfolio(
    input({
      policy: {
        ...input().policy,
        cash_balance: 100_000,
        cash_reserve: 0,
        max_total_open_risk: 1_000,
        max_position_risk: 200,
        max_sector_open_risk: 250,
        max_sector_positions: 1,
        max_correlation_group_open_risk: 250,
        max_correlation_group_positions: 1,
      },
      candidates: [
        candidate("ALPHA", { calibrated_net_expected_value_r: 0.9 }),
        candidate("TECH2", { calibrated_net_expected_value_r: 0.8 }),
        candidate("BRAVO", {
          calibrated_net_expected_value_r: 0.7,
          risk_estimate: riskEstimate({
            sector: "healthcare",
            correlation_group: "healthcare_large_cap",
            beta: 0.6,
            source_fingerprint: fingerprint("bravo-risk"),
          }),
        }),
      ],
    }),
  );

  expect(result.status).toBe("completed");
  if (result.status !== "completed") return;
  expect(result.candidate_decisions.map((item) => [item.candidate_id, item.status, item.reason_codes])).toEqual([
    ["ALPHA", "selected", []],
    ["TECH2", "rejected", ["sector_position_limit_reached"]],
    ["BRAVO", "selected", []],
  ]);
});

test("sizes a correlated candidate only within the remaining correlation-group risk budget", () => {
  const result = allocateInternalPaperPortfolio(
    input({
      policy: {
        ...input().policy,
        cash_balance: 100_000,
        cash_reserve: 0,
        max_open_positions: 2,
        max_sector_positions: 2,
        max_sector_open_risk: 1_000,
        max_correlation_group_positions: 2,
        max_correlation_group_open_risk: 250,
        max_absolute_beta_notional: 100_000,
      },
      candidates: [
        candidate("ALPHA", { calibrated_net_expected_value_r: 0.9 }),
        candidate("CORRELATED", {
          calibrated_net_expected_value_r: 0.8,
          risk_estimate: riskEstimate({
            sector: "communications",
            correlation_group: "mega_cap_tech",
            source_fingerprint: fingerprint("correlated-risk"),
          }),
        }),
      ],
    }),
  );

  expect(result.status).toBe("completed");
  if (result.status !== "completed") return;
  expect(result.candidate_decisions).toEqual([
    expect.objectContaining({ candidate_id: "ALPHA", quantity: 92 }),
    expect.objectContaining({
      candidate_id: "CORRELATED",
      status: "selected",
      quantity: 22,
      estimated_open_risk: 49.3,
    }),
  ]);
  expect(result.total_estimated_open_risk).toBe(249.1);
});

test("sizes a candidate under each explicit stress-loss cap and records the scenario exposure", () => {
  const result = allocateInternalPaperPortfolio(
    input({
      policy: {
        ...input().policy,
        cash_balance: 100_000,
        cash_reserve: 0,
        max_total_open_risk: 1_000,
        max_position_risk: 1_000,
        max_sector_open_risk: 1_000,
        max_sector_positions: 3,
        max_correlation_group_open_risk: 1_000,
        max_correlation_group_positions: 3,
        max_absolute_beta_notional: 100_000,
        stress_scenarios: [
          {
            scenario_version: "internal_paper_portfolio_stress_scenario_v1",
            scenario_id: "market_down_5pct",
            max_open_loss: 200,
          },
          {
            scenario_version: "internal_paper_portfolio_stress_scenario_v1",
            scenario_id: "sector_drawdown",
            max_open_loss: 500,
          },
        ],
      },
      candidates: [candidate("ALPHA", { calibrated_net_expected_value_r: 0.9 })],
    }),
  );

  expect(result.status).toBe("completed");
  if (result.status !== "completed") return;
  expect(result.candidate_decisions).toEqual([
    expect.objectContaining({
      candidate_id: "ALPHA",
      status: "selected",
      quantity: 66,
      estimated_stress_losses: [
        { scenario_id: "market_down_5pct", estimated_open_loss: 200 },
        { scenario_id: "sector_drawdown", estimated_open_loss: 266 },
      ],
    }),
  ]);
  expect(result.stress_scenario_losses).toEqual([
    { scenario_id: "market_down_5pct", estimated_open_loss: 200 },
    { scenario_id: "sector_drawdown", estimated_open_loss: 266 },
  ]);
});

test("rejects missing, stale, future and post-decision risk facts without substituting a score", () => {
  const result = allocateInternalPaperPortfolio(
    input({
      candidates: [
        candidate("STALE", {
          risk_estimate: riskEstimate({
            observed_at: "2026-09-24T13:40:00.000Z",
            source_fingerprint: fingerprint("stale"),
          }),
        }),
        candidate("FUTURE", {
          risk_estimate: riskEstimate({
            observed_at: "2026-09-24T13:46:00.000Z",
            source_fingerprint: fingerprint("future"),
          }),
        }),
        candidate("UNCALIBRATED", {
          calibrated_net_expected_value_r: Number.NaN,
          calibration_version: "",
        }),
      ],
    }),
  );

  expect(result.status).toBe("completed");
  if (result.status !== "completed") return;
  expect(result.selected_count).toBe(0);
  expect(result.candidate_decisions).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        candidate_id: "STALE",
        reason_codes: ["risk_estimate_stale_or_future"],
      }),
      expect.objectContaining({
        candidate_id: "FUTURE",
        reason_codes: expect.arrayContaining([
          "risk_estimate_after_decision",
          "risk_estimate_stale_or_future",
        ]),
      }),
      expect.objectContaining({
        candidate_id: "UNCALIBRATED",
        reason_codes: ["candidate_calibrated_net_ev_unavailable"],
      }),
    ]),
  );
});

test("fails closed when the policy or a risk estimate lacks the exact stress-scenario evidence", () => {
  const invalidPolicy = allocateInternalPaperPortfolio(
    input({ policy: { ...input().policy, stress_scenarios: [] } }),
  );
  const unsupportedCandidate = allocateInternalPaperPortfolio(
    input({
      candidates: [
        candidate("ALPHA", {
          risk_estimate: riskEstimate({
            stress_losses: [
              { scenario_id: "market_down_5pct", loss_per_share: 3 },
            ],
          }),
        }),
      ],
    }),
  );

  expect(invalidPolicy).toMatchObject({
    status: "blocked",
    reason_codes: ["allocation_policy_stress_scenarios_invalid"],
  });
  expect(unsupportedCandidate).toMatchObject({
    status: "completed",
    selected_count: 0,
    candidate_decisions: [
      expect.objectContaining({
        status: "rejected",
        reason_codes: ["risk_estimate_stress_scenarios_unsupported"],
      }),
    ],
  });
});

test("treats an existing stress-limit breach as a global stop before allocating new risk", () => {
  const result = allocateInternalPaperPortfolio(
    input({
      policy: {
        ...input().policy,
        stress_scenarios: [
          {
            scenario_version: "internal_paper_portfolio_stress_scenario_v1",
            scenario_id: "market_down_5pct",
            max_open_loss: 100,
          },
          {
            scenario_version: "internal_paper_portfolio_stress_scenario_v1",
            scenario_id: "sector_drawdown",
            max_open_loss: 500,
          },
        ],
      },
      open_positions: [
        {
          position_id: "position-alpha",
          ticker: "ALPHA",
          quantity: 40,
          entry_price: 100,
          stop_price: 98,
          risk_estimate: riskEstimate(),
        },
      ],
    }),
  );

  expect(result).toMatchObject({
    status: "blocked",
    reason_codes: ["open_portfolio_exceeds_policy"],
    candidate_decisions: [],
  });
});

test("treats an over-limit pre-existing portfolio as a global stop, not an invitation to resize it", () => {
  const result = allocateInternalPaperPortfolio(
    input({
      policy: { ...input().policy, max_total_open_risk: 100 },
      open_positions: [
        {
          position_id: "position-alpha",
          ticker: "ALPHA",
          quantity: 100,
          entry_price: 100,
          stop_price: 98,
          risk_estimate: riskEstimate(),
        },
      ],
    }),
  );

  expect(result).toMatchObject({
    status: "blocked",
    reason_codes: ["open_portfolio_exceeds_policy"],
    candidate_decisions: [],
  });
  expect(verifyInternalPaperPortfolioAllocationDigest(result)).toBe(true);
});

test("treats two candidate records for one decision lineage as a global stop", () => {
  const sharedDecisionFingerprint = fingerprint("shared-decision");
  const result = allocateInternalPaperPortfolio(
    input({
      candidates: [
        candidate("ALPHA", { decision_fingerprint: sharedDecisionFingerprint }),
        candidate("BRAVO", {
          decision_fingerprint: sharedDecisionFingerprint,
          risk_estimate: riskEstimate({
            sector: "healthcare",
            correlation_group: "healthcare_large_cap",
            source_fingerprint: fingerprint("bravo-risk"),
          }),
        }),
      ],
    }),
  );

  expect(result).toMatchObject({
    status: "blocked",
    reason_codes: ["candidate_decision_lineage_duplicate"],
    candidate_decisions: [],
  });
  expect(verifyInternalPaperPortfolioAllocationDigest(result)).toBe(true);
});

test("enforces absolute beta notional without cancelling opposite beta exposures", () => {
  const result = allocateInternalPaperPortfolio(
    input({
      policy: {
        ...input().policy,
        cash_balance: 100_000,
        cash_reserve: 0,
        max_absolute_beta_notional: 100,
      },
      candidates: [
        candidate("HIGHBETA", {
          risk_estimate: riskEstimate({ beta: -2, source_fingerprint: fingerprint("beta") }),
        }),
      ],
    }),
  );

  expect(result.status).toBe("completed");
  if (result.status !== "completed") return;
  expect(result.candidate_decisions).toEqual([
    expect.objectContaining({
      candidate_id: "HIGHBETA",
      status: "rejected",
      reason_codes: ["absolute_beta_limit_reached"],
    }),
  ]);
});

test("is order-independent and retains no provider, publication, paper-write or broker authority", () => {
  const forward = allocateInternalPaperPortfolio(input());
  const reversed = allocateInternalPaperPortfolio(
    input({ candidates: [...input().candidates].reverse() }),
  );

  expect(forward).toEqual(reversed);
  expect(forward.authority).toEqual({
    can_request_provider_data: false,
    can_change_ranking_or_publication: false,
    can_persist_or_submit_internal_paper_command: false,
    can_execute_broker_action: false,
  });
  expect(Object.isFrozen(forward)).toBe(true);
  expect(Object.isFrozen(forward.authority)).toBe(true);
  expect(Object.isFrozen(forward.candidate_decisions)).toBe(true);
  expect(() => {
    (forward.authority as { can_execute_broker_action: boolean }).can_execute_broker_action = true;
  }).toThrow(TypeError);
  expect(() => {
    (forward.candidate_decisions as unknown as { push(value: unknown): number }).push({});
  }).toThrow(TypeError);
});

test("uses a total deterministic sort even when candidates have invalid calibrated net-EV", () => {
  const candidates = [
    candidate("ZULU", {
      calibrated_net_expected_value_r: Number.NaN,
      calibration_version: "",
    }),
    candidate("ALPHA", {
      calibrated_net_expected_value_r: Number.NaN,
      calibration_version: "",
    }),
  ];
  const forward = allocateInternalPaperPortfolio(input({ candidates }));
  const reversed = allocateInternalPaperPortfolio(
    input({ candidates: [...candidates].reverse() }),
  );

  expect(forward).toEqual(reversed);
  expect(forward).toMatchObject({
    status: "completed",
    candidate_decisions: [
      { candidate_id: "ALPHA", status: "rejected" },
      { candidate_id: "ZULU", status: "rejected" },
    ],
  });
});

test("keeps malformed net-EV evidence distinct from an explicitly unavailable value", () => {
  const malformed = allocateInternalPaperPortfolio(
    input({
      candidates: [
        candidate("ALPHA", {
          calibrated_net_expected_value_r: Number.NaN,
          calibration_version: "",
        }),
      ],
    }),
  );
  const unavailable = allocateInternalPaperPortfolio(
    input({
      candidates: [
        candidate("ALPHA", {
          calibrated_net_expected_value_r: null as unknown as number,
          calibration_version: "",
        }),
      ],
    }),
  );

  expect(malformed).toMatchObject({ status: "completed", selected_count: 0 });
  expect(unavailable).toMatchObject({ status: "completed", selected_count: 0 });
  expect(malformed.input_digest).not.toBe(unavailable.input_digest);
  expect(verifyInternalPaperPortfolioAllocationDigest(malformed)).toBe(true);
  expect(verifyInternalPaperPortfolioAllocationDigest(unavailable)).toBe(true);
});

test("blocks malformed runtime payloads with a receipt instead of throwing", () => {
  const malformedPolicy = {
    allocation_version: INTERNAL_PAPER_PORTFOLIO_ALLOCATION_VERSION,
    policy: null,
    open_positions: [],
    candidates: [],
  } as unknown as InternalPaperPortfolioAllocationInput;
  const malformedCandidate = input({
    candidates: [null as unknown as InternalPaperPortfolioCandidate],
  });

  expect(() => allocateInternalPaperPortfolio(malformedPolicy)).not.toThrow();
  expect(() => allocateInternalPaperPortfolio(malformedCandidate)).not.toThrow();
  const policyResult = allocateInternalPaperPortfolio(malformedPolicy);
  const candidateResult = allocateInternalPaperPortfolio(malformedCandidate);
  expect(policyResult).toMatchObject({
    status: "blocked",
    reason_codes: ["allocation_input_structure_invalid"],
  });
  expect(candidateResult).toMatchObject({
    status: "blocked",
    reason_codes: ["allocation_input_structure_invalid"],
  });
  expect(verifyInternalPaperPortfolioAllocationDigest(policyResult)).toBe(true);
  expect(verifyInternalPaperPortfolioAllocationDigest(candidateResult)).toBe(true);
});
