import type { TraceStep } from "../types";
import { tagForOutcome } from "../lib/parseTrace";

interface Props {
  steps: TraceStep[];
  selectedId: string | null;
  exportIds: Set<string>;
  onSelect: (id: string) => void;
  onToggleExport: (id: string) => void;
}

export function TraceTimeline({
  steps,
  selectedId,
  exportIds,
  onSelect,
  onToggleExport,
}: Props) {
  return (
    <ol className="timeline" aria-label="Agent trace timeline">
      {steps.map((step, i) => {
        const tag = tagForOutcome(step.outcome);
        const active = step.id === selectedId;
        return (
          <li
            key={step.id}
            className={`timeline-item tag-${tag}${active ? " is-active" : ""}${
              step.injected ? " is-injected" : ""
            }`}
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <button
              type="button"
              className="timeline-main"
              onClick={() => onSelect(step.id)}
              aria-pressed={active}
            >
              <span className="timeline-step">#{step.step}</span>
              <span className={`chip chip-${tag}`}>{tag}</span>
              <span className="timeline-chosen">{step.chosen}</span>
              <span className="timeline-phase">{step.phase}</span>
            </button>
            <label className="export-check">
              <input
                type="checkbox"
                checked={exportIds.has(step.id)}
                onChange={() => onToggleExport(step.id)}
                aria-label={`Include step ${step.step} in export`}
              />
            </label>
          </li>
        );
      })}
    </ol>
  );
}
