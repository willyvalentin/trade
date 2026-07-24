import { NextResponse } from "next/server";

import {
  hb307cCanaryPurpose,
  hb307cCanaryRouteBuildMarker,
  hb307cNoEffectResponse,
} from "@/app/api/hb307c/ping/route";

export const dynamic = "force-dynamic";

type Hb307cBody = {
  auth_check_only?: unknown;
};

const noStoreHeaders = {
  "Cache-Control": "no-store",
};

function jsonNoStore(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: noStoreHeaders });
}

function secretText(value: string | null | undefined) {
  return value ?? "";
}

function buildAuthDiagnostics(input: {
  expectedSecret: string | undefined;
  providedSecret: string | null;
}) {
  const expected = secretText(input.expectedSecret);
  const provided = secretText(input.providedSecret);

  return {
    env_name_used: "AUTOMATION_SECRET",
    server_secret_present: expected.length > 0,
    server_secret_length: expected.length,
    header_name_used: "x-automation-secret",
    header_present: input.providedSecret !== null,
    header_length: provided.length,
    header_matches: expected.length > 0 && provided === expected,
    trimmed_header_matches:
      expected.length > 0 && provided.trim() === expected.trim(),
    runtime: "server",
    diagnostics_safe: true,
  };
}

async function parseBody(request: Request): Promise<Hb307cBody> {
  try {
    const text = await request.text();
    if (!text.trim()) return {};
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Hb307cBody)
      : {};
  } catch {
    return {};
  }
}

export async function POST(request: Request) {
  const body = await parseBody(request);
  const expectedSecret = process.env.AUTOMATION_SECRET;
  const providedSecret = request.headers.get("x-automation-secret");
  const authDiagnostics = buildAuthDiagnostics({
    expectedSecret,
    providedSecret,
  });

  if (!authDiagnostics.header_matches) {
    return jsonNoStore(
      {
        error: "Unauthorized.",
        auth_boundary: "route_handler",
        route_build_marker: hb307cCanaryRouteBuildMarker,
        purpose: hb307cCanaryPurpose,
        auth_diagnostics: authDiagnostics,
        ...hb307cNoEffectResponse,
      },
      401,
    );
  }

  if (body.auth_check_only !== true) {
    return jsonNoStore(
      {
        error: "auth_check_only_true_required",
        route_build_marker: hb307cCanaryRouteBuildMarker,
        purpose: hb307cCanaryPurpose,
        auth_diagnostics: authDiagnostics,
        ...hb307cNoEffectResponse,
      },
      400,
    );
  }

  return jsonNoStore({
    ok: true,
    auth_check_only: true,
    route_build_marker: hb307cCanaryRouteBuildMarker,
    purpose: hb307cCanaryPurpose,
    auth_diagnostics: authDiagnostics,
    ...hb307cNoEffectResponse,
  });
}
