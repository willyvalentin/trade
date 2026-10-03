import "server-only";
import { NextResponse } from "next/server";

// Netlify's buffered envelope has a 6 MB limit. Leave framing overhead;
// never truncate the original population or capsule to manufacture a response.
export const RELATIVE_PLAN_COMPLETE_RESPONSE_MAX_BYTES = 5 * 1048576;
export function relativePlanCompleteHttpResponse(result: unknown, options: { status: number; headers: Record<string, string> }) {
  try {
    const json = JSON.stringify(result);
    if (typeof json !== "string" || Buffer.byteLength(json, "utf8") > RELATIVE_PLAN_COMPLETE_RESPONSE_MAX_BYTES) {
      return NextResponse.json({ status: "unavailable", receipt: null, learning: null,
        blocker: "relative_plan_complete_response_exceeds_buffered_transport_limit" }, { status: 503,
        headers: { ...options.headers, "Cache-Control": "no-store" } });
    }
    return new NextResponse(json, { status: options.status,
      headers: { ...options.headers, "Content-Type": "application/json", "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ status: "unavailable", receipt: null, learning: null,
      blocker: "relative_plan_complete_response_unserializable" }, { status: 503,
      headers: { ...options.headers, "Cache-Control": "no-store" } });
  }
}
