# Post-Mistake Distill Lab — Demo script

Static Vite + React app. No API keys. Fixtures encode paper-faithful mock probabilities from [JevAgentHarness](https://arxiv.org/abs/2610.21412).

## One-minute path

1. Open the site (or `npm run dev` / `npm run preview`).
2. Banner should read **Demo mode: using recorded teacher labels**.
3. Sample trace auto-loads (or click **Load sample trace**).
4. Timeline shows chips: `ok`, `must-ask`, `irreversible`, `post-mistake`, `detour`.
5. Click the **must-ask** step → inspector shows ask_user≈63% vs cancel≈37%, plus soft-mix label (α=0.3).
6. Click **Flip leaderboard** → StartLux-style ~69.5% vs AgentDecision-4B-style ~91.5% on the agent-shifted quiz.
7. Click **Export distill set** → `distill-set.json` with `post_mistake` rows near ~30%.
8. Optional: **Inject mistake** → new irreversible + post-mistake rows appear for labeling.

## Offline

After the first load of `/fixtures/sample-trace.jsonl` and `/fixtures/quiz-items.json`, the UI is fully client-side (no network calls for inference).

## Build / Netlify

```bash
npm install
npm run build
```

`netlify.toml`: build command `npm run build`, publish `dist`.

## Screenshots

See `artifacts/annotated-timeline.png` and `artifacts/leaderboard-flip.png`.
