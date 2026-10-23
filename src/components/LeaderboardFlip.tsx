import { useEffect, useState } from "react";
import type { QuizFixture } from "../types";

interface Props {
  quiz: QuizFixture | null;
  running: boolean;
  onRun: () => void;
}

function AccMeter({
  label,
  isolated,
  animateTo,
  accent,
}: {
  label: string;
  isolated: number;
  animateTo: number | null;
  accent: "isolated" | "agent";
}) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (animateTo == null) {
      setShown(0);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const dur = 1200;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(animateTo * eased);
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [animateTo]);

  return (
    <article className={`lb-card lb-${accent}`}>
      <h3>{label}</h3>
      <dl>
        <div>
          <dt>Isolated BFCL</dt>
          <dd>{(isolated * 100).toFixed(1)}%</dd>
        </div>
        <div>
          <dt>Agent-shifted tasks</dt>
          <dd className="big">{(shown * 100).toFixed(1)}%</dd>
        </div>
      </dl>
      <div className="lb-meter" aria-hidden>
        <div className="lb-meter-fill" style={{ width: `${shown * 100}%` }} />
      </div>
    </article>
  );
}

export function LeaderboardFlip({ quiz, running, onRun }: Props) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!running) return;
    setRevealed(false);
    const t = window.setTimeout(() => setRevealed(true), 80);
    return () => window.clearTimeout(t);
  }, [running]);

  if (!quiz) {
    return <div className="leaderboard empty">Load sample to unlock leaderboard flip.</div>;
  }

  const iso = quiz.paper_story.isolated_bfcl_champ;
  const agent = quiz.paper_story.agent_decision_4b;

  const isolatedCorrect = quiz.items.filter((i) => i.isolated_pick === i.gold).length;
  const agentCorrect = quiz.items.filter((i) => i.agent_pick === i.gold).length;

  return (
    <div className="leaderboard">
      <header className="lb-head">
        <div>
          <h2>Leaderboard flip</h2>
          <p className="muted">
            Same 10 shifted / must-ask quiz items. Isolated champ looks strong on BFCL, then
            collapses on agent states — AgentDecision-4B-style wins.
          </p>
        </div>
        <button type="button" className="btn primary" onClick={onRun} disabled={!quiz}>
          Flip leaderboard
        </button>
      </header>

      <div className="lb-grid">
        <AccMeter
          label={iso.name}
          isolated={iso.isolated_accuracy}
          animateTo={revealed ? iso.agent_accuracy : null}
          accent="isolated"
        />
        <AccMeter
          label={agent.name}
          isolated={agent.isolated_accuracy}
          animateTo={revealed ? agent.agent_accuracy : null}
          accent="agent"
        />
      </div>

      {revealed && (
        <p className="lb-story" role="status">
          Fixture quiz score: isolated mock {isolatedCorrect}/10 · agent-trained mock{" "}
          {agentCorrect}/10 — paper story ~{(iso.agent_accuracy * 100).toFixed(1)}% vs ~
          {(agent.agent_accuracy * 100).toFixed(1)}%.
        </p>
      )}

      <details className="quiz-details">
        <summary>Show 10 quiz items</summary>
        <ol>
          {quiz.items.map((item) => (
            <li key={item.id}>
              <span className={`chip chip-${item.kind === "ok" ? "ok" : item.kind}`}>{item.kind}</span>{" "}
              {item.prompt}
              <div className="quiz-picks">
                gold=<code>{item.gold}</code> · isolated=<code>{item.isolated_pick}</code> ·
                agent=<code>{item.agent_pick}</code>
              </div>
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
}
