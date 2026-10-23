import type { DistillRow, TraceStep } from "../types";
import { SOFT_MIX_ALPHA } from "../types";

/** One-hot on chosen index; soft mix with teacher probs: (1-α)*one_hot + α*teacher */
export function softMixLabel(
  options: string[],
  chosen: string,
  teacherProbs: number[],
  alpha: number = SOFT_MIX_ALPHA,
): { oneHot: number[]; label: number[] } {
  const oneHot = options.map((o) => (o === chosen ? 1 : 0));
  const label = oneHot.map((h, i) => (1 - alpha) * h + alpha * (teacherProbs[i] ?? 0));
  return { oneHot, label };
}

export function confidenceOf(teacherProbs: number[]): number {
  return teacherProbs.length ? Math.max(...teacherProbs) : 0;
}

export function harnessQuestion(step: TraceStep): string {
  return (
    `Given agent state, choose the next tool (typed multiple-choice).\n` +
    `State: ${step.state}\n` +
    `Options: ${step.options.map((o, i) => `${i}:${o}`).join(" | ")}`
  );
}

export function toDistillRow(step: TraceStep, alpha: number = SOFT_MIX_ALPHA): DistillRow {
  const { oneHot, label } = softMixLabel(
    step.options,
    step.chosen,
    step.teacher_probs,
    alpha,
  );
  return {
    state: step.state,
    options: step.options,
    label,
    confidence: confidenceOf(step.teacher_probs),
    post_mistake: step.outcome === "post-mistake",
    step_id: step.id,
    outcome: step.outcome,
    chosen: step.chosen,
    soft_mix_alpha: alpha,
    one_hot: oneHot,
    teacher_probs: step.teacher_probs,
  };
}

export function validateDistillRow(row: unknown): row is DistillRow {
  if (!row || typeof row !== "object") return false;
  const r = row as Record<string, unknown>;
  return (
    typeof r.state === "string" &&
    Array.isArray(r.options) &&
    Array.isArray(r.label) &&
    typeof r.confidence === "number" &&
    typeof r.post_mistake === "boolean"
  );
}
