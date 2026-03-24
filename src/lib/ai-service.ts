import type { WorkoutEntry } from "./fitness-store";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8787";

function buildWorkoutSummary(workouts: WorkoutEntry[]): string {
  if (workouts.length === 0) return "No workouts logged yet.";

  const sorted = [...workouts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const recent = sorted.slice(0, 50);

  const lines = recent.map(
    (w) =>
      `${w.date}: ${w.exercise} — ${w.weight}lbs × ${w.reps} reps × ${w.sets} sets`
  );

  const uniqueExercises = [...new Set(workouts.map((w) => w.exercise))];
  const totalSessions = new Set(workouts.map((w) => w.date)).size;

  return [
    `Total workouts logged: ${workouts.length}`,
    `Unique exercises: ${uniqueExercises.join(", ")}`,
    `Training days: ${totalSessions}`,
    "",
    "Recent workouts (newest first):",
    ...lines,
  ].join("\n");
}

export async function generateAIInsights(
  workouts: WorkoutEntry[]
): Promise<string[]> {
  const res = await fetch(`${API_URL}/api/insights`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ workouts: buildWorkoutSummary(workouts) }),
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
  messages: ChatMessage[]
): Promise<string> {
  const res = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      workouts: buildWorkoutSummary(workouts),
      messages,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error((err as { error?: string }).error ?? "Request failed");
  }

  return ((await res.json()) as { reply: string }).reply;
}
