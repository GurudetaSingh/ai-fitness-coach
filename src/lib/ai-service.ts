import type { WorkoutEntry, BodyWeight } from "./fitness-store";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8787";

function buildContext(workouts: WorkoutEntry[], bodyWeights: BodyWeight[]): string {
  const parts: string[] = [];

  if (workouts.length > 0) {
    const sorted = [...workouts].sort((a, b) => b.date.localeCompare(a.date));
    const recent = sorted.slice(0, 50);
    const uniqueExercises = [...new Set(workouts.map((w) => w.exercise))];
    const totalSessions = new Set(workouts.map((w) => w.date)).size;

    parts.push(
      `Total workouts logged: ${workouts.length}`,
      `Unique exercises: ${uniqueExercises.join(", ")}`,
      `Training days: ${totalSessions}`,
      "",
      "Recent workouts (newest first):",
      ...recent.map((w) => `${w.date}: ${w.exercise} — ${w.weight}lbs × ${w.reps} reps × ${w.sets} sets`)
    );
  } else {
    parts.push("No workouts logged yet.");
  }

  if (bodyWeights.length > 0) {
    const sorted = [...bodyWeights].sort((a, b) => a.date.localeCompare(b.date));
    const latest = sorted[sorted.length - 1];
    const oldest = sorted[0];
    const change = latest.weight - oldest.weight;

    parts.push(
      "",
      "Body weight history:",
      ...sorted.slice(-20).map((e) => `${e.date}: ${e.weight}lbs`),
      `Current weight: ${latest.weight}lbs`,
      `Change over tracking period: ${change >= 0 ? "+" : ""}${change.toFixed(1)}lbs`
    );
  }

  return parts.join("\n");
}

export async function generateAIInsights(
  workouts: WorkoutEntry[],
  bodyWeights: BodyWeight[]
): Promise<string[]> {
  const res = await fetch(`${API_URL}/api/insights`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ workouts: buildContext(workouts, bodyWeights) }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error((err as { error?: string }).error ?? "Request failed");
  }

  return ((await res.json()) as { insights: string[] }).insights;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function chatWithCoach(
  workouts: WorkoutEntry[],
  bodyWeights: BodyWeight[],
  messages: ChatMessage[]
): Promise<string> {
  const res = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      workouts: buildContext(workouts, bodyWeights),
      messages,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error((err as { error?: string }).error ?? "Request failed");
  }

  return ((await res.json()) as { reply: string }).reply;
}
