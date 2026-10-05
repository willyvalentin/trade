import { expect, test } from "@playwright/test";
import { readRelativePlanCharterRuntimeSource } from "@/lib/server/relative-plan-charter-runtime-source";
import { prospectiveOwner, prospectiveReceipt } from "../fixtures/relative-plan-prospective";
import { charterRuntimeRows } from "../fixtures/relative-plan-charter-runtime";

// API fault injection only. Actual persisted SDK/receipt consumption is a
// separate integrated acceptance check; these are not production evidence.
type Response = { data: unknown; count: number | null; error: unknown };
const empty: Response = { data: [], count: 0, error: null };
function client(responses: Response[] = []) {
  const calls: Array<{ table: string; filters: Array<[string, unknown[]]> }> = [];
  const value = { from(table: string) {
    const index = calls.length, call = { table, filters: [] as Array<[string, unknown[]]> }; calls.push(call);
    const builder: Record<string, (...args: unknown[]) => unknown> = {};
    for (const method of ["select", "eq", "gte", "lt", "order", "limit"]) {
      builder[method] = (...args: unknown[]) => { call.filters.push([method, args]); return builder; };
    }
    builder.abortSignal = () => Promise.resolve(responses[index] ?? empty);
    return builder;
  } };
  return { calls, value: value as unknown as NonNullable<Parameters<typeof readRelativePlanCharterRuntimeSource>[1]> };
}
function input() { return { owner: prospectiveOwner, freeze: prospectiveReceipt(), now: new Date("2026-10-12T19:00:00.000Z") }; }

test("uses complete double reads for owned cycles and scheduled attempts in the fixed observed window", async () => {
  const sdk = client(), result = await readRelativePlanCharterRuntimeSource(input(), sdk.value);
  expect(result.status).toBe("available");
  expect(result.partitions?.[0]).toMatchObject({ partition: "held_out", status: "available", evidence: [], unattributed_attempt_count: 0 });
  expect(result.partitions?.[1].status).toBe("not_started");
  expect(sdk.calls).toHaveLength(4);
  for (const call of sdk.calls) {
    expect(call.filters).toContainEqual(["select", ["*", { count: "exact" }]]);
    expect(call.filters).toContainEqual(["limit", [1001]]);
    expect(call.filters.some(([method, args]) => method === "lt" && args[1] === "2026-10-12T19:00:00.001Z")).toBe(true);
    if (call.table === "observation_cycle_receipts") expect(call.filters).toContainEqual(["eq", ["owner_user_id", prospectiveOwner]]);
  }
});

test("future forward windows cause no source read, and invalid owner/clock cannot query", async () => {
  const sdk = client();
  const result = await readRelativePlanCharterRuntimeSource({ ...input(), now: new Date("2026-10-10T19:00:00.000Z") }, sdk.value);
  expect(result.partitions?.every(row => row.status === "not_started")).toBe(true);
  expect(sdk.calls).toHaveLength(0);
  for (const request of [{ ...input(), owner: "bad_owner" }, { ...input(), now: new Date(NaN) }]) {
    expect((await readRelativePlanCharterRuntimeSource(request, sdk.value)).status).toBe("unavailable");
  }
  expect(sdk.calls).toHaveLength(0);
});

test("unknown-owner attempts are disclosed rather than assigned to the frozen owner or treated as successful", async () => {
  const row = { attempt_fingerprint: "unattributed_original_attempt", utc_timestamp: "2026-10-12T17:00:00.000Z" };
  const attempts = { ...empty, data: [row], count: 1 };
  const sdk = client([empty, attempts, empty, attempts]);
  const result = await readRelativePlanCharterRuntimeSource(input(), sdk.value);
  expect(result.partitions?.[0]).toMatchObject({ evidence: [], scheduled_attempt_count: 1, unattributed_attempt_count: 1 });
});

test("incomplete, over-bound and errored reads never become a truncated quality denominator", async () => {
  for (const response of [
    { ...empty, count: 1 }, { ...empty, count: null }, { ...empty, error: { message: "private database diagnostic" } },
    { ...empty, data: Array.from({ length: 1001 }, () => ({})), count: 1001 },
  ]) {
    const result = await readRelativePlanCharterRuntimeSource(input(), client([response]).value);
    expect(result).toMatchObject({ status: "unavailable", partitions: null });
    expect(JSON.stringify(result)).not.toContain("private database diagnostic");
  }
});

test("same-count receipt mutations between complete passes fail closed", async () => {
  const attempts = { ...empty, data: [{ attempt_fingerprint: "one" }], count: 1 };
  const changed = { ...attempts, data: [{ attempt_fingerprint: "one", payload_json: { changed: true } }] };
  const result = await readRelativePlanCharterRuntimeSource(input(), client([empty, attempts, empty, changed]).value);
  expect(result).toMatchObject({ status: "unavailable", partitions: null, blocker: "relative_plan_runtime_source_changed_during_read" });
});

test("cross-owner or malformed cycle rows cannot become owned reliability evidence", async () => {
  for (const row of [{ receipt_json: null }, { owner_user_id: "99999999-9999-4999-8999-999999999999", receipt_json: {} }]) {
    const cycles = { ...empty, data: [row], count: 1 };
    const result = await readRelativePlanCharterRuntimeSource(input(), client([cycles, empty, cycles, empty]).value);
    expect(result).toMatchObject({ status: "unavailable", partitions: null, blocker: "relative_plan_runtime_receipt_or_attempt_binding_invalid" });
  }
});

test("decodes actual producer rows and refuses forged status, slot, build, clock or original run bindings", async () => {
  const original = charterRuntimeRows({ at: "2026-10-12T17:00:00.000Z", fingerprint: "synthetic_original_charter_run" });
  for (const mode of ["complete", "status", "slot", "build", "clock", "run"] as const) {
    const rows = structuredClone(original);
    if (mode === "status") Object.assign(rows.cycle, { cycle_status: "failed" });
    else if (mode === "slot") rows.attempt.payload_json.scheduled_slot_started_at_utc = "2026-10-12T17:15:00.000Z";
    else if (mode === "build") rows.attempt.payload_json.build_deployment_identity.commit_ref = "c".repeat(40);
    else if (mode === "clock") rows.attempt.route_received_at = "2026-10-12T17:00:01.000Z";
    else if (mode === "run") rows.attempt.scan_run_fingerprint = "synthetic_other_charter_run";
    const cycles = { ...empty, data: [rows.cycle], count: 1 }, attempts = { ...empty, data: [rows.attempt], count: 1 };
    const result = await readRelativePlanCharterRuntimeSource(input(), client([cycles, attempts, cycles, attempts]).value);
    expect(result.status).toBe(mode === "complete" ? "available" : "unavailable");
    if (mode === "complete") {
      expect(result.partitions?.[0].evidence[0].credit_readback.reservation.finalization_proven).toBe(true);
      expect(result.partitions?.[0].evidence[0].receipt.cycle_status).toBe("completed");
    }
  }
});
