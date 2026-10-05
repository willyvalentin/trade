import { relativePlanCompleteHttpResponse } from "@/lib/server/relative-plan-complete-http-response";
import { createRelativePlanProspectiveService } from "@/lib/server/relative-plan-prospective-service";
import { requireApplicationSession, applicationSessionUnauthorizedResponse,
  applicationMutationForbiddenResponse } from "@/lib/server/application-session";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };
export async function GET(request: Request) {
  const session = await requireApplicationSession();
  if (!session) return applicationSessionUnauthorizedResponse();
  const result = await createRelativePlanProspectiveService().read(session.owner_user_id);
  return relativePlanCompleteHttpResponse(result, { status: result.status === "unavailable" ? 503 : 200, headers, acceptEncoding: request.headers.get("accept-encoding") });
}
export async function POST(request: Request) {
  const session = await requireApplicationSession();
  if (!session) return applicationSessionUnauthorizedResponse();
  const origin = applicationMutationForbiddenResponse(request);
  if (origin) return origin;
  const result = await createRelativePlanProspectiveService().freeze(session.owner_user_id, await request.json().catch(() => null));
  return relativePlanCompleteHttpResponse(result, { status: result.status === "frozen" ? 201 : result.status === "already_frozen" ? 200
    : result.status === "invalid_request" ? 400 : result.status === "conflicting" ? 409 : 503, headers, acceptEncoding: request.headers.get("accept-encoding") });
}
