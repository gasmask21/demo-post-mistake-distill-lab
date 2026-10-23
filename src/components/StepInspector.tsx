import type { TraceStep } from "../types";
import { SOFT_MIX_ALPHA } from "../types";
import { harnessQuestion, softMixLabel, confidenceOf } from "../lib/sftLabel";

interface Props {
  step: TraceStep | null;
}

export function StepInspector({ step }: Props) {
  if (!step) {
    return (
      <div className="inspector empty">
        <p>Select a timeline step to inspect the harness MCQ, teacher probs, and SFT label.</p>
      </div>
    );
  }

  const { oneHot, label } = softMixLabel(
    step.options,
    step.chosen,
    step.teacher_probs,
    SOFT_MIX_ALPHA,
  );
  const conf = confidenceOf(step.teacher_probs);

  return (
    <div className="inspector">
      <header className="inspector-head">
        <h2>Step inspector</h2>
        <p className="muted">
          Soft mix α={SOFT_MIX_ALPHA}: label = (1−α)·one-hot + α·teacher — paper Eq. style.
        </p>
      </header>

      <section>
        <h3>Harness question</h3>
        <pre className="question">{harnessQuestion(step)}</pre>
      </section>

      <section>
        <h3>Teacher (Jev-mock) probability vector</h3>
        <ul className="prob-bars">
          {step.options.map((opt, i) => {
            const p = step.teacher_probs[i] ?? 0;
            return (
              <li key={opt}>
                <div className="prob-meta">
                  <span>{opt}</span>
                  <span>{(p * 100).toFixed(1)}%</span>
                </div>
                <div className="bar-track">
                  <div
                    className={`bar-fill${opt === step.chosen ? " is-chosen" : ""}`}
                    style={{ width: `${p * 100}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
        <p className="muted">Max confidence: {(conf * 100).toFixed(1)}%</p>
      </section>

      <section>
        <h3>Training label</h3>
        <div className="label-grid">
          <div>
            <h4>One-hot</h4>
            <code>{JSON.stringify(oneHot.map((x) => Number(x.toFixed(2))))}</code>
          </div>
          <div>
            <h4>Soft mix (α={SOFT_MIX_ALPHA})</h4>
            <code>{JSON.stringify(label.map((x) => Number(x.toFixed(3))))}</code>
          </div>
        </div>
      </section>

      <section>
        <h3>Utterance / args</h3>
        <p>{step.utterance}</p>
        <code className="args">{JSON.stringify(step.args)}</code>
      </section>
    </div>
  );
}
