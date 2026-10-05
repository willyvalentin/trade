import { NextResponse } from "next/server";
import {
  applicationMutationForbiddenResponse,
  applicationSessionUnauthorizedResponse,
  requireApplicationSession,
} from "@/lib/server/application-session";
import { prepareCompletedSessionHistories } from "@/lib/server/completed-session-history-preparation";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };

// Explicit owner command, not a scan, scheduler, GET side effect or retry loop.
// All population, session and credit decisions remain server-owned.
export async function POST(request: Request) {
  const session = await requireApplicationSession();
  if (!session) return applicationSessionUnauthorizedResponse();
  const origin = applicationMutationForbiddenResponse(request);
  if (origin) return origin;
  const invalid = () => NextResponse.json({ status: "invalid_request",
    blocker: "history_preparation_request_invalid", current_price_allowed: false,
    publication_allowed: false, broker_allowed: false }, { status: 400, headers });
  if (new URL(request.url).search ||
    request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") return invalid();
  const body = request.body?.getReader();
  if (!body) return invalid();
  try {
    let text = "", bytes = 0;
    const decoder = new TextDecoder("utf-8", { fatal: true });
    for (;;) {
      const chunk = await body.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > 256) { await body.cancel(); return invalid(); }
      text += decoder.decode(chunk.value, { stream: true });
    }
    text += decoder.decode();
    const parsed: unknown = JSON.parse(text);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed) || Object.keys(parsed).length) return invalid();
  } catch {
    return invalid();
  } finally {
    body.releaseLock();
  }
  const result = await prepareCompletedSessionHistories({ signal: request.signal });
  // Partial means a finished bounded batch, not an async job or trade decision.
  return NextResponse.json(result, { status: result.status === "blocked" ? 422 : 200, headers });
}
