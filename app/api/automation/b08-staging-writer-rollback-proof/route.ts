import { NextResponse } from "next/server";

import {
  B08StagingWriterRollbackProofAuthorizationError,
  executeB08StagingWriterRollbackProof,
} from "@/lib/server/b08-staging-writer-rollback-proof";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 10;

const noStoreHeaders = { "Cache-Control": "no-store" };
const proofTokenHeader = "x-ture-staging-proof-token";

function response(body: Record<string, string>, status: number) {
  return NextResponse.json(body, { status, headers: noStoreHeaders });
}

// Temporary B-08 branch-deploy proof endpoint. It deliberately exposes no
// request body, database identifiers, receipt, deploy controls, or production
// configuration. Delete it together with its one-time branch-deploy secret
// immediately after the single verified staging rollback proof.
export async function POST(request: Request) {
  try {
    const result = await executeB08StagingWriterRollbackProof(
      request.headers.get(proofTokenHeader),
    );
    return response(result, 200);
  } catch (error) {
    if (error instanceof B08StagingWriterRollbackProofAuthorizationError) {
      return response({ error: "Not found." }, 404);
    }

    return response({ error: "Unavailable." }, 503);
  }
}

export function GET() {
  return response({ error: "Not found." }, 404);
}
