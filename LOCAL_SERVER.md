# Local Dev Server — Port Registry

**Single source of truth for which local URL the dev server runs on.**
Any agent/dev MUST read and update this file before starting a server.

## Current

| Field | Value |
|-------|-------|
| Base port | `5000` |
| Active URL | http://localhost:5000 |
| Status | not running |

## Rules (see CLAUDE.md → Local development)
1. The dev server runs on **port 5000** by default (`npm run dev`).
2. **Never stop, kill, or restart** a server that is already running.
3. If port 5000 (or the current active port) is already in use / occupied,
   **increment** to the next number (5001 → 5002 → …). Do NOT reuse or reclaim
   the busy port.
4. After starting a server on a new port, **update the table above** (Active URL
   + Status) and append a line to the History log below.

## History
<!-- newest first: YYYY-MM-DD — port — note -->
- 2026-07-06 — 5000 — initial registry created (server not yet started)
