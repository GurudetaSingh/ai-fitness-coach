import { Trash2 } from "lucide-react";
import type { WorkoutEntry } from "@/lib/fitness-store";

interface Props {
  workouts: WorkoutEntry[];
  onDelete: (id: string) => void;
}

export default function WorkoutHistory({ workouts, onDelete }: Props) {
  const sorted = [...workouts].sort((a, b) => b.date.localeCompare(a.date));
  const recent = sorted.slice(0, 10);

  if (recent.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No workouts yet. Start logging to track your gains!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {recent.map((w) => (
        <div
          key={w.id}
          className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50 group hover:border-primary/20 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm truncate">{w.exercise}</span>
              <span className="text-xs text-muted-foreground">
                {(() => {
                  const [y, m, d] = w.date.split("-").map(Number);
                  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                })()}
              </span>
            </div>
            <div className="flex gap-3 mt-1 text-xs text-muted-foreground font-mono">
              <span>{w.weight} lbs</span>
              <span>{w.sets}×{w.reps}</span>
              <span className="text-primary/70">{w.weight * w.reps * w.sets} vol</span>
            </div>
          </div>
          <button
            onClick={() => onDelete(w.id)}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all active:scale-[0.95]"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
