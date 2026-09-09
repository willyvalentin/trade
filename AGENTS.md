<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


# Ture product delivery

Before choosing new work, read the **active sections** at the top of:

1. `docs/ture-master-roadmap.md` — MVP scope, release sequence and acceptance.
2. `docs/ture-current-state-ledger.md` — the single Now / Next / Blocked queue.
3. `docs/roadmap-operating-governance.md` — bounded delivery and blocker rules.

The user's 2026-09-09 direction is MVP first, then the full vision. Historical
Action chains do not select current work. Implement the next acceptance-linked
user behavior; do not create static successors, governance frameworks or later
release features just to keep busy. Reuse working code. Keep one product slice
active, budget 4–16 active hours, cap initial investigation at four hours and
bundle necessary implementation, behavior tests and documentation.

Follow existing user authorization for reversible local implementation and
checks; do not invent permission gates. Preserve safety, privacy and applicable
external-operation/release authority. Report verified behavior and its actual
environment; source-only or local sandbox work is not production completion.
Preserve dirty worktrees and start from verified current main. Update the active
ledger only when the selected outcome, evidence or a material blocker changes.
