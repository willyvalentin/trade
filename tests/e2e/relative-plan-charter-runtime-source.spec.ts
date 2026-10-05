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
function persistedProducerRows() {
  const rows = charterRuntimeRows({ at: "2026-10-12T17:00:00.000Z", fingerprint: "synthetic_original_charter_run" });
  // Actual SQL-default metadata absent from the pure producer. The cycle's
  // generation-time updated_at legitimately precedes its database insertion.
  return { cycle: { ...rows.cycle, created_at: "2026-10-12T17:00:10.001Z" },
    attempt: { ...rows.attempt, updated_at: "2026-10-12T17:00:10.001Z" } };
}

test("current runtime cannot count future-recorded original cycles or attempts", async () => {
  for (const kind of ["cycle", "attempt"] as const) for (const field of ["created_at", "updated_at"] as const) {
    const rows = structuredClone(persistedProducerRows());
    Object.assign(rows[kind], { [field]: "2026-10-12T19:00:00.000001Z" });
    const before = JSON.stringify(rows);
    const cycles = { ...empty, data: [rows.cycle], count: 1 }, attempts = { ...empty, data: [rows.attempt], count: 1 };
    const result = await readRelativePlanCharterRuntimeSource(input(), client([cycles, attempts, cycles, attempts]).value);
    expect(result, `${kind}.${field} must not qualify cost/reliability after as-of`).toMatchObject({
      status: "unavailable", partitions: null, blocker: "relative_plan_runtime_source_recording_times_invalid" });
    expect(JSON.stringify(rows)).toBe(before);
  }
});

test("raw runtime clocks must be explicit and possible without inventing legacy defaults", async () => {
  for (const kind of ["cycle", "attempt"] as const) for (const field of ["created_at", "updated_at"] as const) {
    for (const clock of [undefined, null, "2026-10-12", "2026-10-12T17:00:00", "2026-02-30T17:00:00Z",
      "2026-10-12T24:00:00Z", "2026-10-12T19:00:00.001Z"]) {
      const rows = structuredClone(persistedProducerRows());
      Object.assign(rows[kind], { [field]: clock });
      const before = JSON.stringify(rows);
      const cycles = { ...empty, data: [rows.cycle], count: 1 }, attempts = { ...empty, data: [rows.attempt], count: 1 };
      const result = await readRelativePlanCharterRuntimeSource(input(), client([cycles, attempts, cycles, attempts]).value);
      expect(result).toMatchObject({ status: "unavailable", partitions: null,
        blocker: "relative_plan_runtime_source_recording_times_invalid" });
      expect(JSON.stringify(rows)).toBe(before);
    }
  }
});

test("exact and explicit-offset recording instants preserve original cost and producer clock semantics", async () => {
  for (const clock of ["2026-10-12T19:00:00.000000Z", "2026-10-12T21:00:00.000000+02:00",
    "2026-10-12T14:59:59.999999-04:00", null]) {
    const rows = persistedProducerRows();
    if (clock) for (const kind of ["cycle", "attempt"] as const) Object.assign(rows[kind], {
      created_at: clock, updated_at: clock });
    else expect(Date.parse(rows.cycle.created_at)).toBeGreaterThan(Date.parse(rows.cycle.updated_at));
    const before = JSON.stringify(rows);
    const cycles = { ...empty, data: [rows.cycle], count: 1 }, attempts = { ...empty, data: [rows.attempt], count: 1 };
    const result = await readRelativePlanCharterRuntimeSource(input(), client([cycles, attempts, cycles, attempts]).value);
    expect(result.status).toBe("available");
    expect(result.partitions?.[0]).toMatchObject({ observation_cycle_count: 1, scheduled_attempt_count: 1,
      unattributed_attempt_count: 0 });
    expect(result.partitions?.[0].evidence[0].credit_readback.reservation.requested_credits).toBe(8);
    expect(JSON.stringify(rows)).toBe(before);
  }
});

test("global unknown attempts keep their denominator and privacy, but future recording invalidates the whole read", async () => {
  const rows = persistedProducerRows();
  const unknown = { attempt_fingerprint: "unattributed_original_attempt", utc_timestamp: "2026-10-12T17:30:00.000Z",
    created_at: "2026-10-12T17:30:00.000Z", updated_at: "2026-10-12T17:30:01.000Z",
    payload_json: { private_owner_payload: "must_remain_redacted" } };
  for (const future of [false, true]) {
    const member = { ...unknown, updated_at: future ? "2026-10-12T19:00:00.000001Z" : unknown.updated_at };
    const cycles = { ...empty, data: [rows.cycle], count: 1 }, attempts = { ...empty, data: [rows.attempt, member], count: 2 };
    const before = JSON.stringify([cycles, attempts]);
    const result = await readRelativePlanCharterRuntimeSource(input(), client([cycles, attempts, cycles, attempts]).value);
    if (future) expect(result).toMatchObject({ status: "unavailable", partitions: null,
      blocker: "relative_plan_runtime_source_recording_times_invalid" });
    else {
      expect(result.partitions?.[0]).toMatchObject({ observation_cycle_count: 1, scheduled_attempt_count: 2,
        unattributed_attempt_count: 1 });
      expect(result.partitions?.[0].retained_rows?.scheduled_attempts).toContainEqual({
        attempt_fingerprint: unknown.attempt_fingerprint, utc_timestamp: unknown.utc_timestamp });
    }
    expect(JSON.stringify(result)).not.toContain("must_remain_redacted");
    expect(JSON.stringify([cycles, attempts])).toBe(before);
  }
});

test("a recording-clock mutation on the stable second pass retains the existing source-change rejection", async () => {
  const rows = persistedProducerRows(), changed = { ...rows.attempt, updated_at: "2026-10-12T19:00:00.000001Z" };
  const cycles = { ...empty, data: [rows.cycle], count: 1 }, attempts = { ...empty, data: [rows.attempt], count: 1 };
  const result = await readRelativePlanCharterRuntimeSource(input(), client([cycles, attempts, cycles,
    { ...attempts, data: [changed] }]).value);
  expect(result).toMatchObject({ status: "unavailable", partitions: null,
    blocker: "relative_plan_runtime_source_changed_during_read" });
});

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
  const row = { attempt_fingerprint: "unattributed_original_attempt", utc_timestamp: "2026-10-12T17:00:00.000Z",
    created_at: "2026-10-12T17:00:00.000Z", updated_at: "2026-10-12T17:00:01.000Z" };
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
  const original = persistedProducerRows();
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
