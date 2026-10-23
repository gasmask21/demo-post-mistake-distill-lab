import type { TraceStep } from "../types";

/** Branch a scripted irreversible wrong-cancel + post-mistake recovery into the trace. */
export function injectScriptedMistake(steps: TraceStep[]): TraceStep[] {
  if (steps.some((s) => s.injected)) {
    return steps;
  }
  const baseStep = Math.max(-1, ...steps.map((s) => s.step)) + 1;
  const injected: TraceStep[] = [
    {
      id: `inj-${baseStep}`,
      step: baseStep,
      episode: "injected-mistake",
      phase: "inject-irreversible",
      utterance: "[Inject] Agent cancels ORD-9901 without asking.",
      state:
        "INJECTED MISTAKE: Ambiguous multi-order state; agent executed irreversible cancel on ORD-9901. Offline BFCL never contains this post-error distribution.",
      options: ["cancel_order", "ask_user", "lookup_orders", "reflect", "stop"],
      teacher_probs: [0.34, 0.52, 0.06, 0.05, 0.03],
      chosen: "cancel_order",
      args: { order_id: "ORD-9901" },
      outcome: "irreversible",
      irreversible: true,
      injected: true,
    },
    {
      id: `inj-${baseStep + 1}`,
      step: baseStep + 1,
      episode: "injected-mistake",
      phase: "inject-post-mistake",
      utterance: "[Inject] Customer: That was the wrong order!",
      state:
        "POST-MISTAKE (injected): After wrong cancel, harness should pose recovery MCQ — ask/restore — not another isolated BFCL cancel.",
      options: ["ask_user", "restore_order", "cancel_order", "reflect", "stop"],
      teacher_probs: [0.46, 0.31, 0.05, 0.12, 0.06],
      chosen: "ask_user",
      args: {
        question: "Restore ORD-9901 and confirm the correct order to cancel?",
      },
      outcome: "post-mistake",
      irreversible: false,
      injected: true,
    },
  ];
  return [...steps, ...injected];
}
