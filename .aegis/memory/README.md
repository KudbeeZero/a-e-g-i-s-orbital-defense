# AEGIS Memory Layer

This `.aegis/` directory is the **memory layer** for AEGIS Orbital Defense — a
version-controlled, diffable index of what this system is, how it's built, what works,
what's missing, and where we're going next.

## Why this exists
The project was built on Caffeine and exported but never finished. This memory layer is
the first pass at scanning and indexing the whole system so that:

1. Anyone (human or agent) can understand the project in minutes, not hours.
2. It can feed a **Notion main dashboard** that tracks all of Tomi's projects.
3. It can later feed a **GitHub universal memory layer** across repos.

## What's here
| File | Purpose |
|------|---------|
| `00-overview.md` | Identity, one-paragraph summary, current status, links |
| `01-architecture.md` | Modules and data flow |
| `02-system-scan.md` | The index — file/module inventory with purpose + status |
| `03-state-and-data.md` | Zustand store shape, save format, storage, ICP |
| `04-status.md` | Completeness matrix: done / stubbed / broken / missing |
| `05-decisions.md` | Decision log (ADR-lite) |
| `06-glossary.md` | Domain terms (threats, weapons, upgrades, cities, phases) |
| `index.json` | Machine-readable list of these memory docs |
| `../project.manifest.json` | Standardized manifest the dashboard / universal layer reads |
| `../BACKLOG.md` | Ranked backlog incl. "bigger & better" features |

## How it maps to Notion
The repo is the **source of truth**. Notion is the **living dashboard mirror** where Tomi
reads and maintains it day-to-day. `project.manifest.json` is the contract: the Notion
project card and the future universal memory layer both read it without parsing prose.

## How to refresh it
Today this is maintained by hand (or by an agent) after meaningful changes. The planned
follow-up is a GitHub Action that regenerates `index.json` / `project.manifest.json` and
syncs to Notion on every merge to `main`. Until then: after a change, update the relevant
doc, bump `lastScanned` in the manifest, and note it in `05-decisions.md`.

_Last scanned: 2026-06-20 · at commit `97c15f1`._
