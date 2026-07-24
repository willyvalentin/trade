import { NextResponse } from "next/server";

import { buildAction308MinimalReplayWithSignalPackagePing } from "@/lib/action-308-minimal-replay-with-signal-package-ping";

export const dynamic = "force-dynamic";

const noStoreHeaders = {
  "Cache-Control": "no-store",
};

export async function GET() {
  return NextResponse.json(buildAction308MinimalReplayWithSignalPackagePing(), {
    headers: noStoreHeaders,
  });
}
