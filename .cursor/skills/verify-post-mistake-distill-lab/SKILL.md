---
name: verify-post-mistake-distill-lab
description: Launch, doctor, drive, evidence, and cleanup checks for the Post-Mistake Distill Lab demo.
---

# Verify Post-Mistake Distill Lab

Use this skill to confirm the static demo meets pass/fail acceptance.

## Launch

```bash
npm install
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

Open `http://127.0.0.1:4173/`. Confirm the demo banner is visible.

## Doctor

- [ ] `netlify.toml` has `command = "npm run build"` and `publish = "dist"`.
- [ ] Fixtures exist: `public/fixtures/sample-trace.jsonl`, `public/fixtures/quiz-items.json`.
- [ ] No env vars or API keys required.
- [ ] `npm run build` exits 0.
- [ ] Sample JSONL parses without errors (open DevTools console while loading).

Quick schema sniff on export (browser console after export, or unit of truth in UI “Schema valid”):

```text
schema: post-mistake-distill-v1
rows[].state | options | label | confidence | post_mistake
```

## Drive

1. Click **Load sample trace** (or rely on auto-load).
2. Confirm legend counts: `must-ask ≥ 1`, `post-mistake ≥ 1`.
3. Select must-ask step; confirm teacher bars and soft-mix label.
4. Click **Flip leaderboard**; read story line ~69.5% vs ~91.5%.
5. Click **Export distill set**; file downloads; post-mistake % near 30%.
6. Click **Inject mistake**; timeline gains irreversible + post-mistake injected rows.
7. Disconnect network (optional) and re-interact with already-loaded fixtures / in-memory state.

## Evidence

Capture:

- Annotated timeline with must-ask / post-mistake chips → `artifacts/annotated-timeline.png`
- Leaderboard after flip → `artifacts/leaderboard-flip.png`

Paste paths into the PR / DEMO.md.

## Cleanup

```bash
# stop preview (Ctrl+C)
rm -rf dist
# do not commit node_modules or .netlify
```

Leave `artifacts/*.png` committed when documenting a ship; regenerate if UI changes.
