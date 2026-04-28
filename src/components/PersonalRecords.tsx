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
  estOneRM: number | null;
}

function epley(weight: number, reps: number): number {
  return Math.round(weight * (1 + reps / 30));
}

function computePRs(workouts: WorkoutEntry[]): PR[] {
  const maxWeightMap = new Map<string, WorkoutEntry>();
  const bestOneRMMap = new Map<string, number>();

  for (const w of workouts) {
    const current = maxWeightMap.get(w.exercise);
    if (!current || w.weight > current.weight || (w.weight === current.weight && w.weight * w.reps * w.sets > current.weight * current.reps * current.sets)) {
      maxWeightMap.set(w.exercise, w);
    }
    if (w.weight > 0) {
      const orm = epley(w.weight, w.reps);
      if (orm > (bestOneRMMap.get(w.exercise) ?? 0)) {
        bestOneRMMap.set(w.exercise, orm);
      }
    }
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return Array.from(maxWeightMap.values())
    .map((w) => ({
      exercise: w.exercise,
      weight: w.weight,
      reps: w.reps,
      sets: w.sets,
      date: w.date,
      isRecent: new Date(w.date) >= sevenDaysAgo,
      estOneRM: bestOneRMMap.get(w.exercise) ?? null,
    }))
    .sort((a, b) => b.weight - a.weight || b.reps - a.reps);
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
            <p className="text-sm font-bold font-mono">{pr.weight > 0 ? `${pr.weight} lbs` : "Bodyweight"}</p>
            <p className="text-xs text-muted-foreground font-mono">{pr.sets}×{pr.reps}</p>
            {pr.estOneRM !== null && (
              <p className="text-xs text-accent font-mono">~{pr.estOneRM} 1RM</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
