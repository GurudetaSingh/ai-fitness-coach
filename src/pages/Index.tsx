import { useState, useCallback, useMemo, useEffect } from "react";
import { Flame, Brain, Trophy, LogOut, Loader2, UserPlus } from "lucide-react";
import WorkoutForm from "@/components/WorkoutForm";
import ProgressChart from "@/components/ProgressChart";
import AICoach from "@/components/AICoach";
import WorkoutHistory from "@/components/WorkoutHistory";
import StatsBar from "@/components/StatsBar";
import BodyWeightTracker from "@/components/BodyWeightTracker";
import PersonalRecords from "@/components/PersonalRecords";
import { supabase } from "@/lib/supabase";
import { useGuestMode } from "@/lib/guest-context";
import { DEMO_WORKOUTS, DEMO_BODY_WEIGHTS } from "@/lib/demo-data";
import {
  getWorkouts,
  addWorkout,
  deleteWorkout,
  generateInsights,
  getBodyWeights,
  addBodyWeight,
  updateBodyWeight,
  deleteBodyWeight,
  updateWorkout,
  type WorkoutEntry,
  type BodyWeight,
} from "@/lib/fitness-store";

export default function Index() {
  const { guestMode, exitGuestMode } = useGuestMode();
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [bodyWeights, setBodyWeights] = useState<BodyWeight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (guestMode) {
      setWorkouts([...DEMO_WORKOUTS].sort((a, b) => b.date.localeCompare(a.date)));
      setBodyWeights(DEMO_BODY_WEIGHTS);
      setLoading(false);
      return;
    }
    Promise.all([getWorkouts(), getBodyWeights()])
      .then(([w, bw]) => { setWorkouts(w); setBodyWeights(bw); })
      .finally(() => setLoading(false));
  }, [guestMode]);

  const handleAdd = useCallback(async (entry: Omit<WorkoutEntry, "id">) => {
    const isDuplicate = workouts.some(
      (w) => w.date === entry.date && w.exercise === entry.exercise &&
        w.weight === entry.weight && w.reps === entry.reps && w.sets === entry.sets
    );
    if (isDuplicate) return;
    if (guestMode) {
      setWorkouts((prev) => [{ ...entry, id: crypto.randomUUID() }, ...prev]);
      return;
    }
    const newEntry = await addWorkout(entry);
    if (newEntry) setWorkouts((prev) => [newEntry, ...prev]);
  }, [workouts, guestMode]);

  const handleUpdate = useCallback(async (id: string, updates: Omit<WorkoutEntry, "id">) => {
    if (guestMode) {
      setWorkouts((prev) => prev.map((w) => w.id === id ? { id, ...updates } : w));
      return;
    }
    const updated = await updateWorkout(id, updates);
    setWorkouts((prev) => prev.map((w) => w.id === id ? updated : w));
  }, [guestMode]);

  const handleDelete = useCallback(async (id: string) => {
    if (guestMode) { setWorkouts((prev) => prev.filter((w) => w.id !== id)); return; }
    await deleteWorkout(id);
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
  }, [guestMode]);

  const handleAddBodyWeight = useCallback(async (entry: { date: string; weight: number }) => {
    if (guestMode) {
      setBodyWeights((prev) => {
        const existing = prev.find((w) => w.date === entry.date);
        if (existing) return prev.map((w) => w.date === entry.date ? { ...w, weight: entry.weight } : w);
        return [...prev, { ...entry, id: crypto.randomUUID() }];
      });
      return;
    }
    const result = await addBodyWeight(entry);
    setBodyWeights((prev) => {
      const existing = prev.find((w) => w.id === result.id);
      if (existing) return prev.map((w) => w.id === result.id ? result : w);
      return [...prev, result];
    });
  }, [guestMode]);

  const handleUpdateBodyWeight = useCallback(async (id: string, weight: number) => {
    if (guestMode) { setBodyWeights((prev) => prev.map((w) => w.id === id ? { ...w, weight } : w)); return; }
    const updated = await updateBodyWeight(id, weight);
    setBodyWeights((prev) => prev.map((w) => w.id === id ? updated : w));
  }, [guestMode]);

  const handleDeleteBodyWeight = useCallback(async (id: string) => {
    if (guestMode) { setBodyWeights((prev) => prev.filter((w) => w.id !== id)); return; }
    await deleteBodyWeight(id);
    setBodyWeights((prev) => prev.filter((w) => w.id !== id));
  }, [guestMode]);

  const insights = useMemo(() => generateInsights(workouts), [workouts]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 opacity-0 animate-fade-up">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center glow-primary">
              <Flame className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">IronMind</h1>
              <p className="text-xs text-muted-foreground">AI Fitness Coach</p>
            </div>
          </div>
          <div className="flex items-center gap-4 opacity-0 animate-fade-up" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Brain className="w-4 h-4 text-primary" />
              <span className="hidden sm:inline">AI-powered insights</span>
            </div>
            {guestMode ? (
              <button onClick={exitGuestMode} className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors font-medium">
                <UserPlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign up to save</span>
              </button>
            ) : (
              <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {guestMode && (
        <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 text-center text-xs text-primary">
          You're exploring with demo data — nothing is saved.{" "}
          <button onClick={exitGuestMode} className="underline underline-offset-2 font-medium hover:text-primary/80 transition-colors">
            Sign up to track your own progress
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <main className="container max-w-6xl mx-auto px-4 py-6 space-y-6">
          <StatsBar workouts={workouts} />

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="space-y-6">
              <section className="bg-card border border-border rounded-xl p-5 opacity-0 animate-fade-up" style={{ animationDelay: "200ms" }}>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Log Workout</h2>
                <WorkoutForm onAdd={handleAdd} />
              </section>

              <section className="bg-card border border-border rounded-xl p-5 opacity-0 animate-fade-up" style={{ animationDelay: "280ms" }}>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Recent Activity</h2>
                <WorkoutHistory workouts={workouts} onUpdate={handleUpdate} onDelete={handleDelete} />
              </section>

              <section className="bg-card border border-border rounded-xl p-5 opacity-0 animate-fade-up" style={{ animationDelay: "340ms" }}>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Body Weight</h2>
                <BodyWeightTracker entries={bodyWeights} onAdd={handleAddBodyWeight} onUpdate={handleUpdateBodyWeight} onDelete={handleDeleteBodyWeight} />
              </section>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <section className="bg-card border border-border rounded-xl p-5 opacity-0 animate-fade-up" style={{ animationDelay: "350ms" }}>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Progress</h2>
                <ProgressChart workouts={workouts} />
              </section>

              <section className="bg-card border border-border rounded-xl p-5 opacity-0 animate-fade-up" style={{ animationDelay: "420ms" }}>
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Personal Records</h2>
                </div>
                <PersonalRecords workouts={workouts} />
              </section>

              <section className="bg-card border border-border rounded-xl p-5 opacity-0 animate-fade-up" style={{ animationDelay: "490ms" }}>
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">AI Coach</h2>
                </div>
                <AICoach insights={insights} workouts={workouts} bodyWeights={bodyWeights} />
              </section>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
