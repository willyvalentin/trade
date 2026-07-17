# Action 540 - Root Page Dynamic Rendering Contract For Turbopack

## Result

Fixed the Turbopack build failure identified in Action 539.

## Root Cause

`app/page.tsx` rendered the root `Home` server component and awaited `readHistoricalCandleStorageSchema()` during the render path. That helper performs live Supabase schema readback through `client.from(table).select(...)`. Turbopack evaluated the root page during static generation and rejected that uncached live I/O with `docs/messages/no-cache` and `docs/messages/prerender-error`.

## Source Change

Changed only `app/page.tsx`.

The existing route segment declaration remains:

```ts
export const dynamic = "force-dynamic";
```

Added the supported Next.js request-time boundary:

```ts
import { connection } from "next/server";

await connection();
```

The boundary is placed immediately before `readHistoricalCandleStorageSchema()`, so the Supabase schema read remains live and request-bound instead of being evaluated during Turbopack static generation.

## Validation

- `npx next typegen`: passed
- `npx tsc --noEmit`: passed
- `npm run lint`: passed with pre-existing warnings
- `npm run build`: passed with Turbopack

## Candidate Hash Impact

Source changed, so candidate hash reconstruction is required. The prior 32-file candidate is now historical, and the next candidate reconstruction must include the updated `app/page.tsx`.

## Safety

No deployment, preview activation, provider call, Supabase write, replay, feedback, recommendation ranking, scanner, execution, Add Trade, risk, or sizing behavior was changed.
