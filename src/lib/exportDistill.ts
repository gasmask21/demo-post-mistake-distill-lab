import type { DistillRow, TraceStep } from "../types";
import { toDistillRow, validateDistillRow } from "./sftLabel";

export interface DistillExport {
  schema: "post-mistake-distill-v1";
  soft_mix_alpha: number;
  paper_echo: {
    target_post_mistake_pct: number;
    actual_post_mistake_pct: number;
    note: string;
  };
  rows: DistillRow[];
}

export function buildDistillExport(
  steps: TraceStep[],
  selectedIds: Set<string> | null,
): DistillExport {
  const selected =
    selectedIds && selectedIds.size > 0
      ? steps.filter((s) => selectedIds.has(s.id))
      : steps;
  const rows = selected.map((s) => toDistillRow(s));
  const post = rows.filter((r) => r.post_mistake).length;
  const pct = rows.length ? (100 * post) / rows.length : 0;
  return {
    schema: "post-mistake-distill-v1",
    soft_mix_alpha: 0.3,
    paper_echo: {
      target_post_mistake_pct: 30.9,
      actual_post_mistake_pct: Math.round(pct * 10) / 10,
      note: "Paper §5 / Table 3: SFT on agent states with ~30.9% post-mistake.",
    },
    rows,
  };
}

export function validateExport(data: DistillExport): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  if (data.schema !== "post-mistake-distill-v1") {
    errors.push("bad schema");
  }
  if (!Array.isArray(data.rows) || data.rows.length === 0) {
    errors.push("rows empty");
  }
  for (const [i, row] of data.rows.entries()) {
    if (!validateDistillRow(row)) {
      errors.push(`row ${i} fails schema`);
    }
  }
  return { ok: errors.length === 0, errors };
}

export function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
