#!/usr/bin/env node

import { spawn } from "node:child_process";

const CONTRACT_VERSION = "avanza_localhost_bridge_v1";
const PORT = Number.parseInt(
  process.env.AVANZA_LOCALHOST_BRIDGE_SMOKE_PORT ?? "47832",
  10,
);
const BASE_URL = `http://127.0.0.1:${PORT}`;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForHealth() {
  const deadline = Date.now() + 6000;
  let lastError = null;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${BASE_URL}/health`);

      if (response.ok) {
        return response.json();
      }
    } catch (error) {
      lastError = error;
    }

    await delay(150);
  }

  throw lastError ?? new Error("Timed out waiting for bridge health.");
}

async function postJson(path, body) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "http://localhost:3000",
    },
    body: JSON.stringify(body),
  });

  return {
    status: response.status,
    body: await response.json(),
  };
}

function buildRunPayload() {
  const requestId = "avanza_agent_request_smoke_001";
  const createdAt = new Date().toISOString();
  const intent = {
    intent_version: "1.0",
    intent_id: "execution_intent_smoke_001",
    created_at: createdAt,
    mode: "semi_automatic",
    authority: {
      authority_version: "1.0",
      mode: "semi_automatic",
      can_create_execution_intent: true,
      can_prepare_broker_form: true,
      can_submit_broker_order: false,
      allowFinalSubmit: false,
      requires_human_final_confirmation: true,
      final_confirmation_actor: "human",
      required_safety_checks: [
        "validate_execution_intent",
        "validate_trading_package_freshness",
        "validate_broker_form_matches_intent",
        "validate_account_and_instrument",
        "validate_risk_limits",
        "validate_no_higher_priority_exit_pending",
      ],
      forbidden_agent_actions: [
        "submit_order",
        "click_buy",
        "click_sell",
        "confirm_order",
        "bypass_safety_checks",
        "override_human_confirmation",
        "modify_intent_after_review",
      ],
    },
    action: "sell",
    trigger_type: "manual_exit_requested",
    trigger_priority: 5,
    broker_hint: "AVANZA",
    source: "manual",
    trading_package: {
      package_version: "1.0",
      recommendation_id: null,
      live_position_id: "live_position_smoke_001",
      ticker: "QA.SMOKE",
      market: "US",
      quantity: 12,
      order_type: "limit",
      limit_price: 42.25,
      stop_loss: 39.5,
      target_price: 48.75,
      expires_at: null,
      payload_id: "payload_smoke_001",
      payload_fingerprint: "payload_smoke_fingerprint_001",
    },
    safety_warnings: [],
    broker_result: null,
  };

  return {
    version: CONTRACT_VERSION,
    dryRun: true,
    envelope: {
      envelopeId: "avanza_agent_bridge_request_smoke_001",
      createdAt,
      version: "avanza_agent_bridge_v1",
      type: "request",
      requestId,
      transport: "local_process",
      payload: {
        requestId,
        version: "avanza_agent_request_v1",
        broker: "avanza",
      },
      metadata: {
        smoke_test: true,
      },
    },
    request: {
      requestId,
      createdAt,
      version: "avanza_agent_request_v1",
      broker: "avanza",
      handoff: {
        version: "avanza_execution_handoff_v2",
        createdAt,
        broker: "avanza",
        status: "ready",
        mode: "semi_automatic",
        action: "sell",
        triggerType: "manual_exit_requested",
        intent,
        authority: intent.authority,
        safetyChecks: [
          {
            id: "ticker_exists",
            status: "passed",
            message: "Ticker is present.",
          },
          {
            id: "quantity_positive",
            status: "passed",
            message: "Quantity is positive.",
          },
          {
            id: "action_supported",
            status: "passed",
            message: "Execution action is supported.",
          },
          {
            id: "broker_is_avanza",
            status: "passed",
            message: "Broker is Avanza.",
          },
          {
            id: "authority_exists",
            status: "passed",
            message: "Execution authority is present.",
          },
          {
            id: "mode_authority_aligned",
            status: "passed",
            message: "Execution mode and authority are aligned.",
          },
        ],
        canPrepareOrder: true,
        canSubmitFinalOrder: false,
      },
      mode: "semi_automatic",
      action: "sell",
      authority: intent.authority,
      safetyChecks: [
        {
          id: "ticker_exists",
          status: "passed",
          message: "Ticker is present.",
        },
      ],
      requireManualFinalConfirmation: true,
      allowAutomaticFinalSubmit: false,
      metadata: {
        smoke_test: true,
      },
    },
    metadata: {
      smoke_test: true,
      local_diagnostics_only: true,
    },
  };
}

async function runSmoke() {
  const child = spawn(process.execPath, [
    "scripts/avanza-localhost-bridge-server.mjs",
  ], {
    env: {
      ...process.env,
      AVANZA_LOCALHOST_BRIDGE_PORT: String(PORT),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  let output = "";

  child.stdout.on("data", (chunk) => {
    output += chunk.toString();
  });
  child.stderr.on("data", (chunk) => {
    output += chunk.toString();
  });

  try {
    const health = await waitForHealth();

    assert(health.version === CONTRACT_VERSION, "Health version mismatch.");
    assert(health.bridgeStatus === "available", "Health status mismatch.");
    assert(
      health.capabilities?.supportsRealBrokerAutomation === false,
      "Health must report no real broker automation.",
    );

    const run = await postJson("/run", buildRunPayload());

    assert(run.status === 200, "Valid run should return HTTP 200.");
    assert(run.body.accepted === true, "Valid run should be accepted.");
    assert(run.body.result?.status === "unknown", "Run result should be unknown.");
    assert(
      Array.isArray(run.body.result?.progressEvents) &&
        run.body.result.progressEvents.length >= 3,
      "Run result should include echo progress events.",
    );
    assert(
      typeof run.body.result?.brokerResult === "undefined",
      "Run result must not include brokerResult.",
    );
    assert(
      run.body.mockOrderPageAvailable === true,
      "Run should report mock order page metadata available.",
    );
    assert(
      run.body.mockOrderFillPlanValid === true,
      "Run should include a valid mock order fill plan.",
    );
    assert(
      run.body.mockOrderPageUrl?.startsWith("/mock-broker/order?"),
      "Run should include a relative mock order page URL.",
    );
    assert(
      run.body.mockOrderPageUrl.includes("ticker=QA.SMOKE"),
      "Mock order page URL should include the smoke ticker.",
    );
    assert(
      run.body.mockOrderFillPlan?.values?.some(
        (value) => value.fieldKey === "ticker" && value.value === "QA.SMOKE",
      ),
      "Mock order fill plan should include the smoke ticker.",
    );
    assert(
      Array.isArray(run.body.mockOrderFillPlanErrors) &&
        run.body.mockOrderFillPlanErrors.length === 0,
      "Valid mock order fill plan should not include errors.",
    );
    assert(
      run.body.mockAgentRunAttempted === undefined ||
        run.body.mockAgentRunAttempted === false,
      "Default run must not attempt the mock agent runner.",
    );

    const explicitMockAgentRun = await postJson("/run", {
      ...buildRunPayload(),
      enableMockAgentRun: true,
      mockPageBaseUrl: "https://example.com",
    });

    assert(
      explicitMockAgentRun.status === 200,
      "Explicit mock-agent run request should keep valid dry-run HTTP 200.",
    );
    assert(
      explicitMockAgentRun.body.accepted === true,
      "Explicit mock-agent run request should keep valid dry-run accepted.",
    );
    assert(
      explicitMockAgentRun.body.mockAgentRunAttempted === true,
      "Explicit mock-agent run should report attempted.",
    );
    assert(
      explicitMockAgentRun.body.mockAgentRunOk === false,
      "Non-local mockPageBaseUrl should fail the mock-agent run safely.",
    );
    assert(
      Array.isArray(explicitMockAgentRun.body.mockAgentRunErrors) &&
        explicitMockAgentRun.body.mockAgentRunErrors.length > 0,
      "Failed explicit mock-agent run should include errors.",
    );
    assert(
      typeof explicitMockAgentRun.body.result?.brokerResult === "undefined",
      "Explicit mock-agent run must not include brokerResult.",
    );

    const invalidRun = await postJson("/run", {
      version: CONTRACT_VERSION,
      dryRun: false,
    });

    assert(invalidRun.status === 400, "Invalid run should return HTTP 400.");
    assert(invalidRun.body.accepted === false, "Invalid run should not be accepted.");
    assert(
      Array.isArray(invalidRun.body.errors) && invalidRun.body.errors.length > 0,
      "Invalid run should include errors.",
    );

    const cancel = await postJson("/cancel", {
      version: CONTRACT_VERSION,
      requestId: "avanza_agent_request_smoke_001",
      reason: "Smoke test finished.",
    });

    assert(cancel.status === 200, "Cancel should return HTTP 200.");
    assert(cancel.body.cancelled === true, "Cancel should be acknowledged.");

    console.log("Localhost bridge stub smoke test passed.");
  } finally {
    child.kill("SIGTERM");

    await new Promise((resolve) => {
      child.once("exit", resolve);
      setTimeout(resolve, 1000);
    });

    if (child.exitCode && child.exitCode !== 0 && child.exitCode !== null) {
      console.error(output);
    }
  }
}

runSmoke().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
