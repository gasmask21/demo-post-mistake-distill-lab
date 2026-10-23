# Features map — Post-Mistake Distill Lab

| Feature | Path | What it does |
| --- | --- | --- |
| Trace parser + annotator | `src/lib/parseTrace.ts`, `public/fixtures/sample-trace.jsonl` | Loads DecisionGym-like JSONL; tags `ok` / `detour` / `must-ask` / `post-mistake` / `irreversible`. |
| Timeline UI | `src/components/TraceTimeline.tsx` | Scrubbable annotated steps; multi-select for export. |
| Step inspector | `src/components/StepInspector.tsx`, `src/lib/sftLabel.ts` | Harness-style typed MCQ, teacher probs, one-hot + soft mix α=0.3. |
| Leaderboard flip | `src/components/LeaderboardFlip.tsx`, `public/fixtures/quiz-items.json` | Isolated BFCL champ (~69.5% agent) vs AgentDecision-4B-style (~91.5%) on 10 shifted items. |
| Export distill set | `src/components/ExportPanel.tsx`, `src/lib/exportDistill.ts` | Downloads `{state, options, label, confidence, post_mistake}` JSON; shows ~30% post-mistake share. |
| Inject mistake | `src/lib/injectMistake.ts` | Branches irreversible wrong-cancel + post-mistake recovery into the live trace. |
| Demo banner | `src/components/DemoBanner.tsx` | “Demo mode: using recorded teacher labels” — no keys. |

## Pass / fail checklist

1. `npm run build` succeeds; `netlify.toml` publishes `dist`.
2. **Load sample trace** marks ≥1 `must-ask` and ≥1 `post-mistake`.
3. Step inspector shows options + probs + soft-mix label.
4. **Flip leaderboard** animates ~69.5% vs ~91.5% paper story.
5. **Export distill set** validates schema; post-mistake rows ≈30% of export.
6. **Inject mistake** appends a new labeled post-mistake row.
7. Works offline after first load (fixtures under `/fixtures`).
