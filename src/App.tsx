import { useCallback, useEffect, useMemo, useState } from "react";
import { DemoBanner } from "./components/DemoBanner";
import { ExportPanel } from "./components/ExportPanel";
import { LeaderboardFlip } from "./components/LeaderboardFlip";
import { StepInspector } from "./components/StepInspector";
import { TraceTimeline } from "./components/TraceTimeline";
import { injectScriptedMistake } from "./lib/injectMistake";
import { parseTraceJsonl, summarizeAnnotations } from "./lib/parseTrace";
import type { QuizFixture, TraceStep } from "./types";
import "./App.css";

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}`);
  return res.text();
}

export default function App() {
  const [steps, setSteps] = useState<TraceStep[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [exportIds, setExportIds] = useState<Set<string>>(new Set());
  const [quiz, setQuiz] = useState<QuizFixture | null>(null);
  const [flipRunning, setFlipRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const selected = useMemo(
    () => steps.find((s) => s.id === selectedId) ?? null,
    [steps, selectedId],
  );

  const counts = useMemo(() => summarizeAnnotations(steps), [steps]);

  const applyTrace = useCallback((parsed: TraceStep[]) => {
    setSteps(parsed);
    setExportIds(new Set(parsed.map((s) => s.id)));
    const prefer =
      parsed.find((s) => s.outcome === "must-ask") ??
      parsed.find((s) => s.outcome === "post-mistake") ??
      parsed[0];
    setSelectedId(prefer?.id ?? null);
    setLoaded(true);
    setError(null);
  }, []);

  const loadSample = useCallback(async () => {
    try {
      const [jsonl, quizJson] = await Promise.all([
        fetchText("/fixtures/sample-trace.jsonl"),
        fetchText("/fixtures/quiz-items.json"),
      ]);
      applyTrace(parseTraceJsonl(jsonl));
      setQuiz(JSON.parse(quizJson) as QuizFixture);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    }
  }, [applyTrace]);

  useEffect(() => {
    void loadSample();
  }, [loadSample]);

  const onUpload = async (file: File | null) => {
    if (!file) return;
    try {
      const text = await file.text();
      applyTrace(parseTraceJsonl(text));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Parse failed");
    }
  };

  const onToggleExport = (id: string) => {
    setExportIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onInject = () => {
    setSteps((prev) => {
      const next = injectScriptedMistake(prev);
      const added = next.filter((s) => s.injected);
      if (added.length) {
        setExportIds((ids) => {
          const n = new Set(ids);
          for (const s of added) n.add(s.id);
          return n;
        });
        setSelectedId(added[added.length - 1]?.id ?? null);
      }
      return next;
    });
  };

  const onFlip = () => {
    setFlipRunning(false);
    requestAnimationFrame(() => setFlipRunning(true));
  };

  return (
    <div className="app">
      <DemoBanner />

      <header className="hero">
        <div className="hero-bg" aria-hidden />
        <div className="hero-inner">
          <p className="brand">Post-Mistake Distill Lab</p>
          <h1>Train on states your agent actually reaches.</h1>
          <p className="lede">
            Annotate a DecisionGym-style trace — must-ask and post-mistake included — flip the
            isolated BFCL leaderboard, and export a distill JSON set (~30% post-mistake).
          </p>
          <div className="cta-row">
            <button type="button" className="btn primary" onClick={() => void loadSample()}>
              Load sample trace
            </button>
            <label className="btn ghost file-btn">
              Upload JSONL
              <input
                type="file"
                accept=".jsonl,.json,application/jsonl,text/plain"
                hidden
                onChange={(e) => void onUpload(e.target.files?.[0] ?? null)}
              />
            </label>
            <button
              type="button"
              className="btn ghost"
              onClick={onInject}
              disabled={!steps.length}
            >
              Inject mistake
            </button>
          </div>
        </div>
      </header>

      {error && (
        <p className="error-banner" role="alert">
          {error}
        </p>
      )}

      <main className="workspace">
        <section className="panel timeline-panel">
          <header className="panel-head">
            <h2>Annotated timeline</h2>
            {loaded && (
              <ul className="legend" aria-label="Annotation counts">
                <li>
                  <span className="chip chip-ok">ok</span> {counts.ok}
                </li>
                <li>
                  <span className="chip chip-must-ask">must-ask</span> {counts["must-ask"]}
                </li>
                <li>
                  <span className="chip chip-post-mistake">post-mistake</span>{" "}
                  {counts["post-mistake"]}
                </li>
                <li>
                  <span className="chip chip-irreversible">irreversible</span>{" "}
                  {counts.irreversible}
                </li>
                <li>
                  <span className="chip chip-detour">detour</span> {counts.detour}
                </li>
              </ul>
            )}
          </header>
          {steps.length ? (
            <TraceTimeline
              steps={steps}
              selectedId={selectedId}
              exportIds={exportIds}
              onSelect={setSelectedId}
              onToggleExport={onToggleExport}
            />
          ) : (
            <p className="muted pad">Load the sample JSONL fixture to begin.</p>
          )}
        </section>

        <section className="panel inspector-panel">
          <StepInspector step={selected} />
        </section>

        <section className="panel lb-panel">
          <LeaderboardFlip quiz={quiz} running={flipRunning} onRun={onFlip} />
        </section>

        <section className="panel export-wrap">
          <ExportPanel steps={steps} exportIds={exportIds} />
        </section>
      </main>

      <footer className="site-foot">
        <p>
          Inspired by{" "}
          <a href="https://arxiv.org/abs/2610.21412" target="_blank" rel="noreferrer">
            JevAgentHarness
          </a>{" "}
          — fixtures only; no model weights or API keys.
        </p>
      </footer>
    </div>
  );
}
