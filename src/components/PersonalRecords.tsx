import { useMemo } from "react";
import { Trophy } from "lucide-react";
import type { WorkoutEntry } from "@/lib/fitness-store";

interface PR {
  exercise: string;
  weight: number;
  reps: number;
  sets: number;
  date: string;
  isRecent: boolean;
}

function computePRs(workouts: WorkoutEntry[]): PR[] {
  const map = new Map<string, WorkoutEntry>();

  for (const w of workouts) {
    const current = map.get(w.exercise);
    if (!current || w.weight > current.weight || (w.weight === current.weight && w.weight * w.reps * w.sets > current.weight * current.reps * current.sets)) {
      map.set(w.exercise, w);
    }
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return Array.from(map.values())
    .map((w) => ({
      exercise: w.exercise,
      weight: w.weight,
      reps: w.reps,
      sets: w.sets,
      date: w.date,
      isRecent: new Date(w.date) >= sevenDaysAgo,
    }))
    .sort((a, b) => b.weight - a.weight);
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

interface Props {
  workouts: WorkoutEntry[];
}

export default function PersonalRecords({ workouts }: Props) {
  const prs = useMemo(() => computePRs(workouts), [workouts]);

  if (prs.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
        Log workouts to see your personal records
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {prs.map((pr) => (
        <div
          key={pr.exercise}
          className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
            pr.isRecent
              ? "bg-primary/5 border-primary/30"
              : "bg-background/50 border-border/50"
          }`}
        >
          <Trophy className={`w-4 h-4 shrink-0 ${pr.isRecent ? "text-primary" : "text-muted-foreground"}`} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{pr.exercise}</p>
            <p className="text-xs text-muted-foreground">{formatDate(pr.date)}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-bold font-mono">{pr.weight} lbs</p>
            <p className="text-xs text-muted-foreground font-mono">{pr.sets}×{pr.reps}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
