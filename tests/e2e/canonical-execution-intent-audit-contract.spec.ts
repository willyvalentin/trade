import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";
import ts from "typescript";

import {
  SEMI_AUTOMATIC_EXECUTION_AUTHORITY,
  type ExecutionIntent,
} from "../../lib/execution";
const contractPath = join(
  process.cwd(),
  "lib/server/canonical-execution-intent-audit-contract.ts",
);
const executionPath = join(process.cwd(), "lib/execution.ts");
const migrationPath = join(
  process.cwd(),
  "supabase/migrations/20260909100801_action_666jd_canonical_execution_intent_audit.sql",
);

type LoadedContract = {
  CANONICAL_EXECUTION_INTENT_AUDIT_AUTHORITY_BOUNDARIES: Record<string, false>;
  CANONICAL_EXECUTION_INTENT_AUDIT_CONTRACT_VERSION: string;
  prepareCanonicalExecutionIntentAudit(input: {
    ownerUserId: string;
    intent: ExecutionIntent;
  }): {
    valid: boolean;
    persisted: false;
    disposition: string;
    errors: string[];
    payload?: {
      contract_version: string;
      intent: {
        trading_package: { ticker: string; market: string };
        safety_warnings: string[];
      };
    };
    semanticPayloadSha256?: string;
    canonicalIntentIdentity?: string;
    idempotencyKey?: string;
    insertCandidate?: { audit_envelope: Record<string, string> };
  };
};

function source(path: string) {
  return readFileSync(path, "utf8");
}

function transpile(path: string) {
  return ts.transpileModule(source(path), {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: path,
  }).outputText;
}

function loadContract(): LoadedContract {
  const executionSandbox = {
    exports: {} as Record<string, unknown>,
    process: { env: {} },
  };
  vm.runInNewContext(transpile(executionPath), executionSandbox, {
    filename: executionPath,
  });

  const contractSandbox = {
    Array,
    Date,
    JSON,
    Number,
    Object,
    Set,
    String,
    exports: {} as Record<string, unknown>,
    require: (specifier: string) => {
      if (specifier === "server-only") return {};
      if (specifier === "node:crypto") return require("node:crypto");
      if (specifier === "@/lib/execution") return executionSandbox.exports;
      throw new Error(`unexpected import: ${specifier}`);
    },
  };
  vm.runInNewContext(transpile(contractPath), contractSandbox, {
    filename: contractPath,
  });

  return contractSandbox.exports as LoadedContract;
}

function makeIntent(overrides: Partial<ExecutionIntent> = {}): ExecutionIntent {
  return {
    intent_version: "1.0",
    intent_id: "c01-intent-0001",
    created_at: "2026-09-09T10:15:00.000Z",
    mode: "semi_automatic",
    authority: {
      ...SEMI_AUTOMATIC_EXECUTION_AUTHORITY,
      required_safety_checks: [
        ...SEMI_AUTOMATIC_EXECUTION_AUTHORITY.required_safety_checks,
      ],
      forbidden_agent_actions: [
        ...SEMI_AUTOMATIC_EXECUTION_AUTHORITY.forbidden_agent_actions,
      ],
    },
    action: "buy",
    trigger_type: "entry_recommendation_ready",
    trigger_priority: 6,
    broker_hint: "AVANZA",
    source: "recommendation",
    trading_package: {
      package_version: "1.0",
      recommendation_id: "recommendation-c01-001",
      live_position_id: null,
      ticker: " aapl ",
      market: " us ",
      quantity: 10,
      order_type: "limit",
      limit_price: 125.5,
      stop_loss: 120,
      target_price: 132,
      expires_at: "2026-09-09T11:15:00.000Z",
      payload_id: "payload-c01-001",
      payload_fingerprint: "fingerprint-c01-001",
    },
    safety_warnings: ["manual confirmation required", "manual confirmation required"],
    broker_result: null,
    ...overrides,
  };
}

test("C-01 canonical intent audit produces a deterministic, immutable pre-broker candidate", () => {
  const contract = loadContract();
  const input = {
    ownerUserId: "11111111-1111-4111-8111-111111111111",
    intent: makeIntent(),
  };
  const first = contract.prepareCanonicalExecutionIntentAudit(input);
  const second = contract.prepareCanonicalExecutionIntentAudit({
    ...input,
    intent: makeIntent({
      created_at: "2026-09-09T12:15:00+02:00",
    }),
  });

  expect(first.valid).toBe(true);
  expect(second.valid).toBe(true);

  if (!first.valid || !second.valid) {
    return;
  }

  expect(first.persisted).toBe(false);
  expect(first.disposition).toBe("canonical_intent_audit_prepared_not_persisted");
  expect(first.payload.contract_version).toBe(
    contract.CANONICAL_EXECUTION_INTENT_AUDIT_CONTRACT_VERSION,
  );
  expect(first.payload?.intent.trading_package.ticker).toBe("AAPL");
  expect(first.payload?.intent.trading_package.market).toBe("US");
  expect(first.payload?.intent.safety_warnings).toEqual([
    "manual confirmation required",
  ]);
  expect(first.semanticPayloadSha256).toMatch(/^[0-9a-f]{64}$/);
  expect(first.canonicalIntentIdentity).toBe(
    `execution_intent:v1:${first.semanticPayloadSha256}`,
  );
  expect(first.idempotencyKey).toBe(
    `execution_intent_audit:v1:${first.canonicalIntentIdentity}`,
  );
  expect(first.canonicalIntentIdentity).toBe(second.canonicalIntentIdentity);
  expect(first.insertCandidate?.audit_envelope).toEqual({
    contract_version: contract.CANONICAL_EXECUTION_INTENT_AUDIT_CONTRACT_VERSION,
    canonical_intent_identity: first.canonicalIntentIdentity,
    semantic_payload_sha256: first.semanticPayloadSha256,
    idempotency_key: first.idempotencyKey,
    owner_user_id: "11111111-1111-4111-8111-111111111111",
    intent_id: "c01-intent-0001",
    audit_event_type: "intent_issued",
    audit_status: "prepared",
  });
  expect(Object.isFrozen(first)).toBe(true);
  expect(Object.isFrozen(first.payload)).toBe(true);
  expect(Object.isFrozen(first.payload.intent)).toBe(true);
  expect(Object.isFrozen(first.insertCandidate)).toBe(true);
});

test("C-01 rejects automatic, post-broker and lineage-incomplete intents fail-closed", () => {
  const contract = loadContract();
  const base = {
    ownerUserId: "11111111-1111-4111-8111-111111111111",
  };
  const automatic = contract.prepareCanonicalExecutionIntentAudit({
    ...base,
    intent: makeIntent({
      mode: "automatic",
      authority: {
        ...SEMI_AUTOMATIC_EXECUTION_AUTHORITY,
        mode: "automatic",
        can_submit_broker_order: true,
        allowFinalSubmit: true,
        requires_human_final_confirmation: false,
        final_confirmation_actor: "agent",
      },
    }),
  });
  const postBroker = contract.prepareCanonicalExecutionIntentAudit({
    ...base,
    intent: makeIntent({
      broker_result: {
        broker_hint: "AVANZA",
        status: "submitted",
        captured_at: "2026-09-09T10:16:00.000Z",
        broker_order_id: "not-admitted",
        submitted_at: "2026-09-09T10:16:00.000Z",
        filled_at: null,
        filled_quantity: null,
        average_fill_price: null,
        rejection_reason: null,
        cancellation_reason: null,
        raw_status: "submitted",
        notes: [],
      },
    }),
  });
  const missingLineage = contract.prepareCanonicalExecutionIntentAudit({
    ...base,
    intent: makeIntent({
      trading_package: {
        ...makeIntent().trading_package,
        recommendation_id: null,
      },
    }),
  });
  const malformedRuntimeValue = contract.prepareCanonicalExecutionIntentAudit({
    ...base,
    intent: makeIntent({
      source: "untrusted_runtime_value" as ExecutionIntent["source"],
    }),
  });
  const malformedShape = contract.prepareCanonicalExecutionIntentAudit(
    null as unknown as { ownerUserId: string; intent: ExecutionIntent },
  );

  expect(automatic.valid).toBe(false);
  expect(postBroker.valid).toBe(false);
  expect(missingLineage.valid).toBe(false);
  expect(malformedRuntimeValue.valid).toBe(false);
  expect(malformedShape.valid).toBe(false);

  if (!automatic.valid) {
    expect(automatic.errors).toContain("execution_mode_not_semi_automatic");
    expect(automatic.persisted).toBe(false);
  }
  if (!postBroker.valid) {
    expect(postBroker.errors).toContain(
      "pre_broker_intent_must_not_include_broker_result",
    );
    expect(postBroker.persisted).toBe(false);
  }
  if (!missingLineage.valid) {
    expect(missingLineage.errors).toContain("entry_intent_requires_recommendation_id");
    expect(missingLineage.persisted).toBe(false);
  }
  if (!malformedRuntimeValue.valid) {
    expect(malformedRuntimeValue.errors).toContain("intent_source_not_admitted");
    expect(malformedRuntimeValue.persisted).toBe(false);
  }
  if (!malformedShape.valid) {
    expect(malformedShape.errors).toContain(
      "canonical_execution_intent_audit_input_invalid",
    );
    expect(malformedShape.persisted).toBe(false);
  }
});

test("C-01 source and migration retain server-only append-only containment", () => {
  const contract = source(contractPath);
  const migration = readFileSync(migrationPath, "utf8");
  const loaded = loadContract();

  expect(contract.startsWith('import "server-only";')).toBe(true);
  expect(contract).toContain("CANONICAL_EXECUTION_INTENT_AUDIT_AUTHORITY_BOUNDARIES");
  expect(contract).toContain("mayPersistAudit: false");
  expect(contract).toContain("mayReadDatabase: false");
  expect(contract).toContain("mayCallBroker: false");
  expect(contract).toContain("maySubmitBrokerOrder: false");
  expect(contract).not.toContain("createClient");
  expect(contract).not.toContain("process.env");
  expect(contract).not.toContain("fetch(");
  expect(contract).not.toContain(".from(");
  expect(contract).not.toContain(".insert(");
  expect(contract).not.toContain("localStorage");
  expect(contract).not.toContain("sessionStorage");

  expect(migration).toContain("create table public.canonical_execution_intent_audits");
  expect(migration).toContain("canonical_execution_intent_audits_identity_check");
  expect(migration).toContain("'execution_intent:v1:' || semantic_payload_sha256");
  expect(migration).toContain("canonical_execution_intent_audits_payload_scalar_consistency_check");
  expect(migration).toContain("intent_payload #>> '{intent,created_at}'");
  expect(migration).toContain("enable row level security");
  expect(migration).toContain("revoke all privileges on table public.canonical_execution_intent_audits");
  expect(migration).toContain("from public, anon, authenticated, service_role");
  expect(migration).toContain("before update or delete on public.canonical_execution_intent_audits");
  expect(migration).toContain("canonical execution intent audits are immutable");
  expect(migration).not.toContain("create policy");
  expect(migration).not.toMatch(/grant\s+(select|insert|update|delete)/i);
  expect(loaded.CANONICAL_EXECUTION_INTENT_AUDIT_AUTHORITY_BOUNDARIES).toEqual({
    mayPersistAudit: false,
    mayReadDatabase: false,
    mayCreateDatabaseClient: false,
    mayCallRoute: false,
    mayPrepareBrokerOrder: false,
    mayCallBroker: false,
    maySubmitBrokerOrder: false,
    mayEnableAutomaticExecution: false,
  });
});
