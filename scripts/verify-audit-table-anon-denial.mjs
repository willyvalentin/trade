#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

const TABLE_NAME = "execution_record_audit_events";
const REQUIRED_ENV = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
];

const classification = {
  denied: "denied",
  unexpectedlyAllowed: "unexpectedly_allowed",
  inconclusive: "inconclusive",
  configMissing: "config_missing",
  executionError: "execution_error",
};

function safeLog(message, details = undefined) {
  if (details === undefined) {
    console.log(message);
    return;
  }

  console.log(`${message} ${JSON.stringify(details)}`);
}

function getMissingEnv() {
  return REQUIRED_ENV.filter((name) => !process.env[name]);
}

function classifySupabaseError(error) {
  const code = typeof error?.code === "string" ? error.code : "";
  const message = typeof error?.message === "string" ? error.message : "";
  const normalized = `${code} ${message}`.toLowerCase();

  if (
    code === "42501" ||
    normalized.includes("row-level security") ||
    normalized.includes("permission denied") ||
    normalized.includes("not authorized") ||
    normalized.includes("unauthorized")
  ) {
    return classification.denied;
  }

  return classification.unexpectedlyAllowed;
}

async function runSelectCheck(client) {
  const { count, error } = await client
    .from(TABLE_NAME)
    .select("id", { count: "exact", head: true });

  if (error) {
    return {
      check: "anon_select",
      result: classifySupabaseError(error),
      error_code: error.code ?? "unknown",
      rows_visible: null,
    };
  }

  const rowsVisible = typeof count === "number" ? count : null;

  return {
    check: "anon_select",
    result:
      rowsVisible === 0
        ? classification.denied
        : classification.unexpectedlyAllowed,
    error_code: null,
    rows_visible: rowsVisible,
  };
}

async function attemptAnonCleanup(client, marker) {
  const { error } = await client
    .from(TABLE_NAME)
    .delete()
    .eq("idempotency_key", marker);

  if (error) {
    return {
      attempted: true,
      result: "cleanup_failed_or_denied",
      error_code: error.code ?? "unknown",
      may_have_persisted: true,
    };
  }

  return {
    attempted: true,
    result: "cleanup_succeeded_or_no_visible_row",
    error_code: null,
    may_have_persisted: false,
  };
}

async function runInsertCheck(client) {
  const marker = `anon-denial-${randomUUID()}`;
  const payload = {
    id: randomUUID(),
    execution_record_id: randomUUID(),
    event_type: "anon_denial_probe",
    event_source: "scripts/verify-audit-table-anon-denial.mjs",
    event_status: "attempted",
    event_payload: { marker },
    evidence_payload: { marker },
    source_system: "local_denial_harness",
    idempotency_key: marker,
    duplicate_prevention_key: marker,
    metadata: { marker, purpose: "anon_denial_verification" },
  };

  const { error } = await client.from(TABLE_NAME).insert(payload);

  if (error) {
    return {
      check: "anon_insert",
      result: classifySupabaseError(error),
      error_code: error.code ?? "unknown",
      cleanup: {
        attempted: false,
        result: "not_needed",
        error_code: null,
        may_have_persisted: false,
      },
    };
  }

  const cleanup = await attemptAnonCleanup(client, marker);

  return {
    check: "anon_insert",
    result: classification.unexpectedlyAllowed,
    error_code: null,
    cleanup,
  };
}

function summarize(results) {
  if (results.some((result) => result.result === classification.unexpectedlyAllowed)) {
    return classification.unexpectedlyAllowed;
  }

  if (results.every((result) => result.result === classification.denied)) {
    return classification.denied;
  }

  if (results.some((result) => result.result === classification.executionError)) {
    return classification.executionError;
  }

  return classification.inconclusive;
}

async function main() {
  safeLog("Audit table anon denial harness starting.");
  safeLog("Required env vars are checked by name only.", {
    required_env: REQUIRED_ENV,
  });

  const missingEnv = getMissingEnv();

  if (missingEnv.length > 0) {
    safeLog("Configuration missing.", {
      classification: classification.configMissing,
      missing_env: missingEnv,
    });
    process.exitCode = 2;
    return;
  }

  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );

  try {
    const selectResult = await runSelectCheck(client);
    const insertResult = await runInsertCheck(client);
    const results = [selectResult, insertResult];
    const overall = summarize(results);

    safeLog("Anon denial harness result.", {
      classification: overall,
      checks: results,
      service_role_used: false,
      production_routes_called: false,
      app_runtime_mutated: false,
    });

    if (overall === classification.denied) {
      process.exitCode = 0;
      return;
    }

    process.exitCode = overall === classification.unexpectedlyAllowed ? 1 : 3;
  } catch (error) {
    safeLog("Anon denial harness execution error.", {
      classification: classification.executionError,
      error_name: error instanceof Error ? error.name : "unknown",
      error_message: error instanceof Error ? error.message : "unknown",
    });
    process.exitCode = 3;
  }
}

await main();
