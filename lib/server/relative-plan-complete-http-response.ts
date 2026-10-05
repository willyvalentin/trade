import "server-only";
import { NextResponse } from "next/server";
import { gzipSync } from "node:zlib";

// Netlify's buffered envelope has a 6 MB limit. Leave framing overhead;
// never truncate the original population or capsule to manufacture a response.
export const RELATIVE_PLAN_COMPLETE_RESPONSE_MAX_BYTES = 5 * 1048576;
// Binary transport may be base64-framed by a function adapter. 4 MiB stays
// below 6 MB even after 4/3 expansion. Decoded JSON has its own strict bound.
export const RELATIVE_PLAN_COMPLETE_GZIP_MAX_BYTES = 4 * 1048576;
export const RELATIVE_PLAN_COMPLETE_DECODED_MAX_BYTES = 16 * 1048576;
function acceptsGzip(header: string | null | undefined) {
  if (!header || header.length > 8192) return false;
  const entries = header.toLowerCase().split(",").map(part => part.trim().split(";").map(field => field.trim()));
  const selected = entries.filter(fields => fields[0] === "gzip");
  const relevant = selected.length ? selected : entries.filter(fields => fields[0] === "*");
  return relevant.length > 0 && relevant.every(fields => fields.length === 1 ||
    (fields.length === 2 && /^q=(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/.test(fields[1]) && Number(fields[1].slice(2)) > 0));
}
export function relativePlanCompleteHttpResponse(result: unknown, options: {
  status: number; headers: Record<string, string>; acceptEncoding?: string | null;
}) {
  try {
    const json = JSON.stringify(result);
    const bytes = typeof json === "string" ? Buffer.byteLength(json, "utf8") : Infinity;
    const headers = { ...options.headers, "Content-Type": "application/json", "Cache-Control": "no-store", "Vary": "Accept-Encoding" };
    if (bytes > RELATIVE_PLAN_COMPLETE_RESPONSE_MAX_BYTES && bytes <= RELATIVE_PLAN_COMPLETE_DECODED_MAX_BYTES && acceptsGzip(options.acceptEncoding)) {
      const compressed = gzipSync(json, { level: 6 });
      if (compressed.byteLength <= RELATIVE_PLAN_COMPLETE_GZIP_MAX_BYTES) return new NextResponse(new Uint8Array(compressed), {
        status: options.status, headers: { ...headers, "Content-Encoding": "gzip" },
      });
    }
    if (bytes > RELATIVE_PLAN_COMPLETE_RESPONSE_MAX_BYTES) {
      return NextResponse.json({ status: "unavailable", receipt: null, learning: null,
        blocker: "relative_plan_complete_response_exceeds_buffered_transport_limit" }, { status: 503,
        headers });
    }
    return new NextResponse(json, { status: options.status, headers });
  } catch {
    return NextResponse.json({ status: "unavailable", receipt: null, learning: null,
      blocker: "relative_plan_complete_response_unserializable" }, { status: 503,
      headers: { ...options.headers, "Cache-Control": "no-store" } });
  }
}
