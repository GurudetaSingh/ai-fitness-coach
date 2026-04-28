import { useState } from "react";
import { Trash2, Pencil, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { COMMON_EXERCISES, type WorkoutEntry } from "@/lib/fitness-store";

interface EditState {
  exercise: string;
  weight: string;
  reps: string;
  sets: string;
  date: string;
}

interface Props {
  workouts: WorkoutEntry[];
  onUpdate: (id: string, updates: Omit<WorkoutEntry, "id">) => void;
  onDelete: (id: string) => void;
}

export default function WorkoutHistory({ workouts, onUpdate, onDelete }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState>({ exercise: "", weight: "", reps: "", sets: "", date: "" });
  const [showSuggestions, setShowSuggestions] = useState(false);

  const sorted = [...workouts].sort((a, b) => b.date.localeCompare(a.date));
  const recent = sorted.slice(0, 10);

  function startEdit(w: WorkoutEntry) {
    setEditingId(w.id);
    setEditState({ exercise: w.exercise, weight: String(w.weight), reps: String(w.reps), sets: String(w.sets), date: w.date });
  }

  function commitEdit(id: string) {
    const { exercise, weight, reps, sets, date } = editState;
    if (!exercise || !weight || !reps || !sets || !date) return;
    onUpdate(id, { exercise, weight: parseFloat(weight), reps: parseInt(reps), sets: parseInt(sets), date });
    setEditingId(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  const filtered = COMMON_EXERCISES.filter((e) =>
    e.toLowerCase().includes(editState.exercise.toLowerCase())
  );

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
        <div key={w.id} className="rounded-lg bg-background/50 border border-border/50 group hover:border-primary/20 transition-colors overflow-visible">
          {editingId === w.id ? (
            <div className="p-3 space-y-2">
              <div className="relative">
                <Input
                  value={editState.exercise}
                  onChange={(e) => { setEditState((s) => ({ ...s, exercise: e.target.value })); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  placeholder="Exercise"
                  className="h-7 text-sm bg-background border-border px-2"
                />
                {showSuggestions && editState.exercise && filtered.length > 0 && (
                  <div className="absolute z-10 top-full mt-1 w-full bg-card border border-border rounded-lg shadow-xl max-h-32 overflow-y-auto">
                    {filtered.map((ex) => (
                      <button key={ex} type="button" className="w-full text-left px-3 py-1.5 text-xs hover:bg-secondary transition-colors"
                        onMouseDown={() => { setEditState((s) => ({ ...s, exercise: ex })); setShowSuggestions(false); }}>
                        {ex}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                <Input value={editState.weight} onChange={(e) => setEditState((s) => ({ ...s, weight: e.target.value }))} placeholder="lbs" type="number" className="h-7 text-xs bg-background border-border px-2" />
                <Input value={editState.reps} onChange={(e) => setEditState((s) => ({ ...s, reps: e.target.value }))} placeholder="reps" type="number" className="h-7 text-xs bg-background border-border px-2" />
                <Input value={editState.sets} onChange={(e) => setEditState((s) => ({ ...s, sets: e.target.value }))} placeholder="sets" type="number" className="h-7 text-xs bg-background border-border px-2" />
                <Input value={editState.date} onChange={(e) => setEditState((s) => ({ ...s, date: e.target.value }))} type="date" className="h-7 text-xs bg-background border-border px-2" />
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={cancelEdit} className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-muted-foreground hover:bg-secondary transition-colors">
                  <X className="w-3 h-3" /> Cancel
                </button>
                <button onClick={() => commitEdit(w.id)} className="flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                  <Check className="w-3 h-3" /> Save
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">{w.exercise}</span>
                  <span className="text-xs text-muted-foreground">
                    {(() => { const [y, m, d] = w.date.split("-").map(Number); return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" }); })()}
                  </span>
                </div>
                <div className="flex gap-3 mt-1 text-xs text-muted-foreground font-mono">
                  {w.weight > 0 && <span>{w.weight} lbs</span>}
                  <span>{w.sets}×{w.reps}</span>
                  {w.weight > 0 && <span className="text-primary/70">{w.weight * w.reps * w.sets} vol</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => startEdit(w)} className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors active:scale-[0.95]">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => onDelete(w.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors active:scale-[0.95]">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
