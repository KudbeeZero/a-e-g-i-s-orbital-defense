# 05 · Decision Log (ADR-lite)

Lightweight record of decisions. Newest at top. Each: what we decided, why, status.

---

### D-005 · GitHub Pages for the playable preview link
- **Date:** 2026-06-20
- **Decision:** Publish the front end to GitHub Pages via
  `.github/workflows/deploy-pages.yml` on merge to `main`. `vite.config.js` gains a
  `base: process.env.BASE_PATH || "/"` so the ICP build is unaffected and only the Pages
  build uses the repo subpath.
- **Why:** Tomi wanted an easy preview link; the app builds static and plays without a
  backend or login (verified). Pages = zero external accounts, fully in-repo.
- **Trade-off:** Pages gives **one live URL refreshed on merge**, not per-PR previews.
  Per-PR previews (Vercel/Netlify) remain the "bigger & better" follow-up in the backlog.
- **Status:** Implemented (folded into PR #6). URL:
  https://kudbeezero.github.io/a-e-g-i-s-orbital-defense/

### D-004 · Backlog tracked via GitHub Issues (going forward)
- **Date:** 2026-06-20
- **Decision:** The canonical backlog tracker is GitHub Issues (labels + milestones).
  `../BACKLOG.md` is the human-readable seed/snapshot; Issues become the live tracker.
- **Why:** Native to the "GitHub universal memory layer" direction; actionable from PRs.
- **Status:** Backlog seeded in repo. Issue creation is a follow-up pending Tomi's go-ahead.

### D-003 · Notion is the canonical home + main dashboard
- **Date:** 2026-06-20
- **Decision:** The living memory layer and the multi-project dashboard live in Notion. The
  repo `.aegis/` is the version-controlled source snapshot; Notion is the daily-driver mirror.
- **Why:** Tomi's main dashboard for all projects is in Notion; that's where he works.
- **Status:** Notion population staged as a separate step (outward-facing write) after the
  scaffold PR is reviewed. Links to be filled into `00-overview.md` once created.

### D-002 · `project.manifest.json` is the dashboard / universal-memory contract
- **Date:** 2026-06-20
- **Decision:** A single standardized JSON manifest per project is the machine-readable
  contract. Dashboards and the future universal memory layer read it without parsing prose.
- **Why:** Decouples consumers from doc formatting; one stable schema scales across repos.
- **Status:** Implemented at `../project.manifest.json`.

### D-001 · Establish an in-repo `.aegis/` memory layer
- **Date:** 2026-06-20
- **Decision:** Stand up a committed, diffable memory layer (this directory) as the first
  real documentation of the system.
- **Why:** Project was exported from Caffeine and never finished; no docs/tracking existed.
- **Status:** Implemented (this PR — scaffold only; automation/sync are follow-ups).

---

> **Pre-history (inferred from git):** the project grew through gameplay-focused PRs —
> improved controls + ICBM threats, upgrade effects + pause, globe camera tuning, a
> cinematic orbital Earth scene, and enemy aircraft with a 2-HP mechanic + city shield
> domes (most recent, PR #5). These predate this decision log.
