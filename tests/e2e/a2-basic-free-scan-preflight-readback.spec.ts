import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { expect, test } from "@playwright/test";
import { buildSync } from "esbuild";

const migrationPath =
  "supabase/migrations/20260925171512_a2_multi_slot_scan_preflight.sql";

function validSnapshot() {
  return {
    preflight_version: "basic_free_scheduled_scan_preflight_v2",
    trading_date: "2026-09-24",
    target_slot_utc: "2026-09-24T13:45:00.000Z",
    total_reservation_count: 0,
    total_reserved_credits: 0,
    normal_scan_reservation_count: 0,
    normal_scan_reserved_credits: 0,
    catalog_observation_reservation_count: 0,
    catalog_observation_reserved_credits: 0,
    active_reservation_count: 0,
    active_reserved_credits: 0,
    terminal_reservation_count: 0,
    terminal_reserved_credits: 0,
    target_slot_reservation_count: 0,
    target_slot_reserved_credits: 0,
    minimum_declared_daily_credit_budget: null,
    maximum_declared_daily_credit_budget: null,
    minimum_declared_per_minute_credit_budget: null,
    maximum_declared_per_minute_credit_budget: null,
    target_slot_attempt_count: 0,
    unresolved_scheduled_attempt_count: 0,
  };
}

async function loadRuntime() {
  const directory = mkdtempSync(resolve(tmpdir(), "ture-a2-preflight-"));
  const output = resolve(directory, "a2-preflight.cjs");
  buildSync({
    entryPoints: [
      resolve(process.cwd(), "lib/basic-free-scheduled-scan-preflight-readback.ts"),
    ],
    outfile: output,
    bundle: true,
    platform: "node",
    format: "cjs",
  });
  const runtime = (await import(pathToFileURL(output).href)) as {
    basicFreeScheduledScanPreflightReadbackFromUnknown: (
      value: unknown,
      expected: { trading_date: string; target_slot_utc: string },
    ) => Record<string, unknown>;
    evaluateBasicFreeScheduledScanPreflight: (
      value: Record<string, unknown>,
    ) => Record<string, unknown>;
  };
  return {
    ...runtime,
    dispose() {
      rmSync(directory, { recursive: true, force: true });
    },
  };
}

const expected = {
  trading_date: "2026-09-24",
  target_slot_utc: "2026-09-24T13:45:00.000Z",
};

test("A.2 preflight permits a canonical empty, unclaimed target state", async () => {
  const runtime = await loadRuntime();
  try {
    const readback = runtime.basicFreeScheduledScanPreflightReadbackFromUnknown(
      validSnapshot(),
      expected,
    );
    expect(readback).toMatchObject({
      status: "available",
      snapshot: {
        total_reserved_credits: 0,
        target_slot_attempt_count: 0,
        unresolved_scheduled_attempt_count: 0,
      },
    });
    expect(runtime.evaluateBasicFreeScheduledScanPreflight(readback)).toEqual({
      status: "ready",
      readback,
      reason_codes: [],
    });
  } finally {
    runtime.dispose();
  }
});

test("A.2 preflight permits prior terminal normal slots while daily capacity remains", async () => {
  const runtime = await loadRuntime();
  try {
    for (const priorTerminal of [
      {
        total_reservation_count: 1,
        total_reserved_credits: 8,
        normal_scan_reservation_count: 1,
        normal_scan_reserved_credits: 8,
        terminal_reservation_count: 1,
        terminal_reserved_credits: 8,
      },
      {
        total_reservation_count: 99,
        total_reserved_credits: 792,
        normal_scan_reservation_count: 99,
        normal_scan_reserved_credits: 792,
        terminal_reservation_count: 99,
        terminal_reserved_credits: 792,
      },
    ]) {
      const readback = runtime.basicFreeScheduledScanPreflightReadbackFromUnknown(
        {
          ...validSnapshot(),
          ...priorTerminal,
          minimum_declared_daily_credit_budget: 800,
          maximum_declared_daily_credit_budget: 800,
          minimum_declared_per_minute_credit_budget: 8,
          maximum_declared_per_minute_credit_budget: 8,
        },
        expected,
      );
      expect(readback).toMatchObject({ status: "available" });
      expect(runtime.evaluateBasicFreeScheduledScanPreflight(readback)).toEqual({
        status: "ready",
        readback,
        reason_codes: [],
      });
    }
  } finally {
    runtime.dispose();
  }
});

test("A.2 preflight blocks duplicate target work, active work, unresolved delivery, and exhausted capacity", async () => {
  const runtime = await loadRuntime();
  try {
    for (const [change, reason] of [
      [{ target_slot_attempt_count: 1 }, "target_slot_attempt_already_exists"],
      [{ unresolved_scheduled_attempt_count: 1 }, "unresolved_scheduled_attempt_exists"],
      [{ active_reservation_count: 1, active_reserved_credits: 8, total_reservation_count: 1, total_reserved_credits: 8, normal_scan_reservation_count: 1, normal_scan_reserved_credits: 8, minimum_declared_daily_credit_budget: 800, maximum_declared_daily_credit_budget: 800, minimum_declared_per_minute_credit_budget: 8, maximum_declared_per_minute_credit_budget: 8 }, "active_basic_free_reservation_exists"],
      [{ target_slot_reservation_count: 1, target_slot_reserved_credits: 8, terminal_reservation_count: 1, terminal_reserved_credits: 8, total_reservation_count: 1, total_reserved_credits: 8, normal_scan_reservation_count: 1, normal_scan_reserved_credits: 8, minimum_declared_daily_credit_budget: 800, maximum_declared_daily_credit_budget: 800, minimum_declared_per_minute_credit_budget: 8, maximum_declared_per_minute_credit_budget: 8 }, "target_slot_reservation_already_exists"],
      [{ total_reservation_count: 100, total_reserved_credits: 800, normal_scan_reservation_count: 100, normal_scan_reserved_credits: 800, terminal_reservation_count: 100, terminal_reserved_credits: 800, minimum_declared_daily_credit_budget: 800, maximum_declared_daily_credit_budget: 800, minimum_declared_per_minute_credit_budget: 8, maximum_declared_per_minute_credit_budget: 8 }, "daily_basic_free_credit_capacity_unavailable"],
    ] as const) {
      const readback = runtime.basicFreeScheduledScanPreflightReadbackFromUnknown(
        { ...validSnapshot(), ...change },
        expected,
      );
      expect(readback).toMatchObject({ status: "available" });
      expect(runtime.evaluateBasicFreeScheduledScanPreflight(readback)).toMatchObject({
        status: "blocked",
        reason_codes: expect.arrayContaining([reason]),
      });
    }
  } finally {
    runtime.dispose();
  }
});

test("A.2 preflight fails closed on malformed, mismatched, or inconsistent aggregates", async () => {
  const runtime = await loadRuntime();
  try {
    for (const snapshot of [
      { ...validSnapshot(), target_slot_utc: "2026-09-24T13:46:00.000Z" },
      { ...validSnapshot(), total_reserved_credits: 801 },
      { ...validSnapshot(), normal_scan_reserved_credits: 1 },
      {
        ...validSnapshot(),
        total_reservation_count: 1,
        total_reserved_credits: 8,
        normal_scan_reservation_count: 1,
        normal_scan_reserved_credits: 8,
        terminal_reservation_count: 0,
        terminal_reserved_credits: 0,
        minimum_declared_daily_credit_budget: 800,
        maximum_declared_daily_credit_budget: 800,
        minimum_declared_per_minute_credit_budget: 8,
        maximum_declared_per_minute_credit_budget: 8,
      },
      {
        ...validSnapshot(),
        total_reservation_count: 1,
        total_reserved_credits: 8,
        normal_scan_reservation_count: 1,
        normal_scan_reserved_credits: 8,
        terminal_reservation_count: 1,
        terminal_reserved_credits: 7,
        minimum_declared_daily_credit_budget: 800,
        maximum_declared_daily_credit_budget: 800,
        minimum_declared_per_minute_credit_budget: 8,
        maximum_declared_per_minute_credit_budget: 8,
      },
      {
        ...validSnapshot(),
        target_slot_reservation_count: 0,
        target_slot_reserved_credits: 8,
      },
      {
        ...validSnapshot(),
        total_reservation_count: 1,
        total_reserved_credits: 1,
        catalog_observation_reservation_count: 1,
        catalog_observation_reserved_credits: 1,
        terminal_reservation_count: 1,
        terminal_reserved_credits: 1,
        minimum_declared_daily_credit_budget: 799,
        maximum_declared_daily_credit_budget: 799,
        minimum_declared_per_minute_credit_budget: 8,
        maximum_declared_per_minute_credit_budget: 8,
      },
      { ...validSnapshot(), preflight_version: "unknown" },
      null,
    ]) {
      expect(
        runtime.basicFreeScheduledScanPreflightReadbackFromUnknown(snapshot, expected),
      ).toEqual({
        status: "unavailable",
        reason_codes: ["basic_free_scheduled_scan_preflight_missing_or_invalid"],
      });
    }
  } finally {
    runtime.dispose();
  }
});

test("A.2 SQL and authenticated route preserve private, read-only preflight boundaries", () => {
  const migration = readFileSync(resolve(process.cwd(), migrationPath), "utf8");
  const route = readFileSync(
    resolve(process.cwd(), "app/api/app/basic-free-scan-preflight/route.ts"),
    "utf8",
  );
  const adapter = readFileSync(
    resolve(process.cwd(), "lib/server/basic-free-scheduled-scan-preflight-readback.ts"),
    "utf8",
  );

  expect(migration).toContain("security definer");
  expect(migration).toContain("set search_path = pg_catalog, public");
  expect(migration).toContain("revoke all on function public.read_basic_free_scheduled_scan_preflight_v2");
  expect(migration).toContain("from public, anon, authenticated;");
  expect(migration).toContain("grant execute on function public.read_basic_free_scheduled_scan_preflight_v2");
  expect(migration).toContain("to service_role;");
  expect(migration).toContain("date_bin(");
  expect(migration).toContain("'1970-01-01 00:00:00+00'::timestamptz");
  expect(migration).toContain("to_char(");
  expect(migration).toContain("YYYY-MM-DD\"T\"HH24:MI:SS.MS\"Z\"");
  expect(migration).toContain("status in ('completed', 'failed')");
  expect(migration).toContain("minute_bucket = requested_target_slot_utc");
  expect(migration).toContain("basic_free_scheduled_scan_preflight_v2");
  expect(migration).not.toContain("insert into public.basic_free_discovery_credit_reservations");
  expect(migration).not.toContain("update public.basic_free_discovery_credit_reservations");
  expect(migration).not.toContain("delete from public.basic_free_discovery_credit_reservations");
  expect(route).toContain("requireApplicationSession");
  expect(route).toContain("export async function GET");
  expect(route).not.toContain("export async function POST");
  expect(route).toContain("basic_free_scheduled_scan_preflight_route_v2");
  expect(route).toContain("scheduler_activation_allowed: false");
  expect(route).toContain("provider_request_allowed: false");
  expect(route).toContain("broker_action_allowed: false");
  expect(adapter).toContain("basicFreeScheduledScanPreflightRpcName");
  expect(adapter).not.toContain(".from(");
});
