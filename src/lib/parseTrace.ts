import type { StepOutcome, TraceStep } from "../types";
import { assertNever } from "../types";

const OUTCOMES: ReadonlySet<string> = new Set([
  "ok",
  "detour",
  "must-ask",
  "post-mistake",
  "irreversible",
]);

function isOutcome(v: unknown): v is StepOutcome {
  return typeof v === "string" && OUTCOMES.has(v);
}

function asStringArray(v: unknown, field: string): string[] {
  if (!Array.isArray(v) || !v.every((x) => typeof x === "string")) {
    throw new Error(`Invalid ${field}: expected string[]`);
  }
  return v;
}

function asNumberArray(v: unknown, field: string): number[] {
  if (!Array.isArray(v) || !v.every((x) => typeof x === "number")) {
    throw new Error(`Invalid ${field}: expected number[]`);
  }
  return v;
}

export function parseTraceLine(line: string, lineNo: number): TraceStep {
  let raw: unknown;
  try {
    raw = JSON.parse(line);
  } catch {
    throw new Error(`Line ${lineNo}: invalid JSON`);
  }
  if (!raw || typeof raw !== "object") {
    throw new Error(`Line ${lineNo}: expected object`);
  }
  const o = raw as Record<string, unknown>;
  if (!isOutcome(o.outcome)) {
    throw new Error(`Line ${lineNo}: invalid outcome`);
  }
  const options = asStringArray(o.options, "options");
  const teacher_probs = asNumberArray(o.teacher_probs, "teacher_probs");
  if (options.length !== teacher_probs.length) {
    throw new Error(`Line ${lineNo}: options/probs length mismatch`);
  }
  return {
    id: String(o.id ?? `line-${lineNo}`),
    step: Number(o.step ?? lineNo - 1),
    episode: String(o.episode ?? "unknown"),
    phase: String(o.phase ?? ""),
    utterance: String(o.utterance ?? ""),
    state: String(o.state ?? ""),
    options,
    teacher_probs,
    chosen: String(o.chosen ?? options[0] ?? ""),
    args:
      o.args && typeof o.args === "object"
        ? (o.args as Record<string, unknown>)
        : {},
    outcome: o.outcome,
    irreversible: Boolean(o.irreversible),
    injected: Boolean(o.injected),
  };
}

export function parseTraceJsonl(text: string): TraceStep[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  return lines.map((line, i) => parseTraceLine(line, i + 1));
}

/** Derive display tag from outcome (already annotated in fixtures). */
export function tagForOutcome(outcome: StepOutcome): string {
  switch (outcome) {
    case "ok":
      return "ok";
    case "detour":
      return "detour";
    case "must-ask":
      return "must-ask";
    case "post-mistake":
      return "post-mistake";
    case "irreversible":
      return "irreversible";
    default:
      return assertNever(outcome);
  }
}

export function summarizeAnnotations(steps: TraceStep[]): Record<StepOutcome, number> {
  const counts: Record<StepOutcome, number> = {
    ok: 0,
    detour: 0,
    "must-ask": 0,
    "post-mistake": 0,
    irreversible: 0,
  };
  for (const s of steps) {
    counts[s.outcome] += 1;
  }
  return counts;
}
