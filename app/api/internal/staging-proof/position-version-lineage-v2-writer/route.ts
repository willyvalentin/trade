import { NextResponse } from "next/server";

import {
  PositionVersionLineageV2WriterStagingRollbackProofAuthorizationError,
  runPositionVersionLineageV2WriterStagingRollbackProof,
} from "@/lib/server/position-version-lineage-v2-writer-staging-rollback-proof";

const proofTokenHeader = "x-ture-staging-proof-token";
const noStoreHeaders = { "Cache-Control": "no-store" };

/**
 * Draft-preview-only B-08 proof endpoint. It accepts no body or database
 * identifiers and performs the fixed staging invocation only with the
 * protected proof-token header. This route must be removed before any Ready
 * pull request or merge; it is not a product, UI, queue, provider, or broker
 * endpoint.
 */
export async function POST(request: Request) {
  try {
    const result = await runPositionVersionLineageV2WriterStagingRollbackProof(
      request.headers.get(proofTokenHeader),
    );
    return NextResponse.json(result, { headers: noStoreHeaders });
  } catch (error) {
    if (error instanceof PositionVersionLineageV2WriterStagingRollbackProofAuthorizationError) {
      return NextResponse.json({ error: "Not found" }, { status: 404, headers: noStoreHeaders });
    }

    return NextResponse.json(
      { error: "Staging proof unavailable" },
      { status: 503, headers: noStoreHeaders },
    );
  }
}
