import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { WorkoutEntry } from "@/lib/fitness-store";

interface Props {
  workouts: WorkoutEntry[];
}

export default function ProgressChart({ workouts }: Props) {
  const exercises = useMemo(() => {
    const set = new Set(workouts.map((w) => w.exercise));
    return Array.from(set);
  }, [workouts]);

  const [selected, setSelected] = useState(exercises[0] || "");

  const data = useMemo(() => {
    return workouts
      .filter((w) => w.exercise === selected)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((w) => ({
        date: new Date(w.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        weight: w.weight,
        volume: w.weight * w.reps * w.sets,
      }));
  }, [workouts, selected]);

  if (exercises.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        Log workouts to see your progress charts
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {exercises.map((ex) => (
          <button
            key={ex}
            onClick={() => setSelected(ex)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-[0.97] ${
              selected === ex
                ? "bg-primary text-primary-foreground glow-primary"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {ex}
          </button>
        ))}
      </div>

      {data.length > 0 && (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 12% 18%)" />
              <XAxis dataKey="date" tick={{ fill: "hsl(220 8% 52%)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(220 8% 52%)", fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip
                contentStyle={{
                  background: "hsl(220 16% 11%)",
                  border: "1px solid hsl(220 12% 18%)",
                  borderRadius: "8px",
                  fontSize: 13,
                  color: "hsl(40 10% 92%)",
                }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="hsl(14 90% 58%)"
                strokeWidth={2.5}
                dot={{ fill: "hsl(14 90% 58%)", r: 3 }}
                activeDot={{ r: 5, fill: "hsl(14 90% 58%)" }}
                name="Weight (lbs)"
              />
              <Line
                type="monotone"
                dataKey="volume"
                stroke="hsl(36 95% 55%)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Volume"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
