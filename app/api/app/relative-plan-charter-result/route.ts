import { relativePlanCompleteHttpResponse } from "@/lib/server/relative-plan-complete-http-response";
import { createRelativePlanCharterResultService } from "@/lib/server/relative-plan-charter-result-service";
import { requireApplicationSession, applicationSessionUnauthorizedResponse,
  applicationMutationForbiddenResponse } from "@/lib/server/application-session";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };
export async function GET(request: Request) {
  const session = await requireApplicationSession();
  if (!session) return applicationSessionUnauthorizedResponse();
  const result = await createRelativePlanCharterResultService().read(session.owner_user_id);
  return relativePlanCompleteHttpResponse(result,{ status: result.status === "unavailable" ? 503 : 200,headers, acceptEncoding: request.headers.get("accept-encoding") });
}
export async function POST(request: Request) {
  const session = await requireApplicationSession();
  if (!session) return applicationSessionUnauthorizedResponse();
  const origin = applicationMutationForbiddenResponse(request);
  if (origin) return origin;
  const result = await createRelativePlanCharterResultService().finalize(session.owner_user_id,await request.json().catch(() => null),
    { acceptEncoding: request.headers.get("accept-encoding") });
  return relativePlanCompleteHttpResponse(result,{ status: result.status === "finalized" ? 201 : result.status === "already_finalized" ? 200
    : result.status === "invalid_request" ? 400 : result.status === "conflicting" ? 409
      : result.status === "not_ready" || result.status === "not_found" ? 422 : 503,headers, acceptEncoding: request.headers.get("accept-encoding") });
}
