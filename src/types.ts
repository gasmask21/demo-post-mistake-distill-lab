export type StepOutcome =
  | "ok"
  | "detour"
  | "must-ask"
  | "post-mistake"
  | "irreversible";

export interface TraceStep {
  id: string;
  step: number;
  episode: string;
  phase: string;
  utterance: string;
  state: string;
  options: string[];
  teacher_probs: number[];
  chosen: string;
  args: Record<string, unknown>;
  outcome: StepOutcome;
  irreversible: boolean;
  /** Set when user injects a scripted mistake branch */
  injected?: boolean;
}

export interface DistillRow {
  state: string;
  options: string[];
  label: number[];
  confidence: number;
  post_mistake: boolean;
  step_id: string;
  outcome: StepOutcome;
  chosen: string;
  soft_mix_alpha: number;
  one_hot: number[];
  teacher_probs: number[];
}

export interface QuizItem {
  id: string;
  kind: string;
  prompt: string;
  options: string[];
  gold: string;
  isolated_pick: string;
  agent_pick: string;
}

export interface QuizFixture {
  title: string;
  paper_story: {
    isolated_bfcl_champ: {
      name: string;
      isolated_accuracy: number;
      agent_accuracy: number;
    };
    agent_decision_4b: {
      name: string;
      isolated_accuracy: number;
      agent_accuracy: number;
    };
  };
  items: QuizItem[];
}

export const SOFT_MIX_ALPHA = 0.3;

export function assertNever(x: never): never {
  throw new Error(`Unhandled case: ${String(x)}`);
}
