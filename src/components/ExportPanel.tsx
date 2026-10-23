import type { TraceStep } from "../types";
import {
  buildDistillExport,
  downloadJson,
  validateExport,
} from "../lib/exportDistill";

interface Props {
  steps: TraceStep[];
  exportIds: Set<string>;
}

export function ExportPanel({ steps, exportIds }: Props) {
  const payload = buildDistillExport(steps, exportIds.size ? exportIds : null);
  const post = payload.rows.filter((r) => r.post_mistake).length;
  const pct = payload.paper_echo.actual_post_mistake_pct;
  const validation = validateExport(payload);

  const onExport = () => {
    downloadJson("distill-set.json", payload);
  };

  return (
    <div className="export-panel">
      <header>
        <h2>Export distill set</h2>
        <p className="muted">
          Downloads {"{state, options, label, confidence, post_mistake}"} JSON for selected
          steps (or all if none checked).
        </p>
      </header>
      <div className="export-stats">
        <div>
          <span className="stat-num">{payload.rows.length}</span>
          <span className="stat-label">rows</span>
        </div>
        <div>
          <span className="stat-num">{post}</span>
          <span className="stat-label">post-mistake</span>
        </div>
        <div>
          <span className="stat-num">{pct.toFixed(1)}%</span>
          <span className="stat-label">of export (paper ~30.9%)</span>
        </div>
      </div>
      <p className={`schema-status ${validation.ok ? "ok" : "bad"}`}>
        Schema {validation.ok ? "valid" : `invalid: ${validation.errors.join(", ")}`}
      </p>
      <button
        type="button"
        className="btn primary"
        onClick={onExport}
        disabled={!steps.length || !validation.ok}
      >
        Export distill set
      </button>
    </div>
  );
}
