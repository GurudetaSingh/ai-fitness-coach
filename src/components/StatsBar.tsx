import { Dumbbell, Calendar, TrendingUp, Zap } from "lucide-react";
import type { WorkoutEntry } from "@/lib/fitness-store";

interface Props {
  workouts: WorkoutEntry[];
}

export default function StatsBar({ workouts }: Props) {
  const totalWorkouts = workouts.length;
  const uniqueDays = new Set(workouts.map((w) => w.date)).size;
  const totalVolume = workouts.reduce((s, w) => s + w.weight * w.reps * w.sets, 0);
  const maxWeight = workouts.length > 0 ? Math.max(...workouts.map((w) => w.weight)) : 0;

  const stats = [
    { label: "Total Lifts", value: totalWorkouts, icon: Dumbbell, color: "text-primary" },
    { label: "Active Days", value: uniqueDays, icon: Calendar, color: "text-accent" },
    { label: "Total Volume", value: totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}k` : totalVolume, icon: TrendingUp, color: "text-success" },
    { label: "Max Weight", value: maxWeight > 0 ? `${maxWeight}` : "—", icon: Zap, color: "text-primary" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className="bg-card border border-border rounded-xl p-4 opacity-0 animate-fade-up"
          style={{ animationDelay: `${i * 80 + 100}ms` }}
        >
          <div className="flex items-center gap-2 mb-2">
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</span>
          </div>
          <div className="stat-number">{stat.value}</div>
        </div>
      ))}
    </div>
  );
}
