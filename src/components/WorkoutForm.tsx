import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { COMMON_EXERCISES } from "@/lib/fitness-store";

interface Props {
  onAdd: (entry: { date: string; exercise: string; weight: number; reps: number; sets: number }) => void;
}

function getLocalDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function WorkoutForm({ onAdd }: Props) {
  const [exercise, setExercise] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [sets, setSets] = useState("");
  const [date, setDate] = useState(getLocalDate);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filtered = COMMON_EXERCISES.filter((e) =>
    e.toLowerCase().includes(exercise.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exercise || !reps || !sets) return;
    onAdd({
      date,
      exercise: exercise.trim(),
      weight: weight ? parseFloat(weight) : 0,
      reps: parseInt(reps),
      sets: parseInt(sets),
    });
    setWeight("");
    setReps("");
    setSets("");
    setDate(getLocalDate());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 relative">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-1.5 block">Exercise</Label>
          <Input
            value={exercise}
            onChange={(e) => { setExercise(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="e.g. Bench Press"
            className="bg-background border-border"
          />
          {showSuggestions && exercise && filtered.length > 0 && (
            <div className="absolute z-10 top-full mt-1 w-full bg-card border border-border rounded-lg shadow-xl max-h-40 overflow-y-auto">
              {filtered.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors"
                  onMouseDown={() => { setExercise(ex); setShowSuggestions(false); }}
                >
                  {ex}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-1.5 block">Weight (lbs) — blank for bodyweight</Label>
          <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="0" className="bg-background border-border" />
        </div>
        <div>
          <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-1.5 block">Date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-background border-border" />
        </div>
        <div>
          <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-1.5 block">Reps</Label>
          <Input type="number" value={reps} onChange={(e) => setReps(e.target.value)} placeholder="8" className="bg-background border-border" />
        </div>
        <div>
          <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-1.5 block">Sets</Label>
          <Input type="number" value={sets} onChange={(e) => setSets(e.target.value)} placeholder="3" className="bg-background border-border" />
        </div>
      </div>

      <Button type="submit" variant="fire" className="w-full">
        <Plus className="w-4 h-4" />
        Log Workout
      </Button>
    </form>
  );
}
