import { useState, useCallback, useMemo } from "react";
import { Flame, Brain, Trophy } from "lucide-react";
import WorkoutForm from "@/components/WorkoutForm";
import ProgressChart from "@/components/ProgressChart";
import AICoach from "@/components/AICoach";
import WorkoutHistory from "@/components/WorkoutHistory";
import StatsBar from "@/components/StatsBar";
import BodyWeightTracker from "@/components/BodyWeightTracker";
import PersonalRecords from "@/components/PersonalRecords";
import {
  getWorkouts,
  addWorkout,
  deleteWorkout,
  generateInsights,
  getBodyWeights,
  addBodyWeight,
  deleteBodyWeight,
  type WorkoutEntry,
  type BodyWeight,
} from "@/lib/fitness-store";

export default function Index() {
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>(getWorkouts);
  const [bodyWeights, setBodyWeights] = useState<BodyWeight[]>(getBodyWeights);

  const handleAdd = useCallback(
    (entry: Omit<WorkoutEntry, "id">) => {
      const newEntry = addWorkout(entry);
      if (newEntry) setWorkouts((prev) => [...prev, newEntry]);
    },
    []
  );

  const handleDelete = useCallback((id: string) => {
    deleteWorkout(id);
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const handleAddBodyWeight = useCallback((entry: { date: string; weight: number }) => {
    const result = addBodyWeight(entry);
    setBodyWeights((prev) => {
      const existing = prev.find((w) => w.id === result.id);
      if (existing) return prev.map((w) => w.id === result.id ? result : w);
      return [...prev, result];
    });
  }, []);

  const handleDeleteBodyWeight = useCallback((id: string) => {
    deleteBodyWeight(id);
    setBodyWeights((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const insights = useMemo(() => generateInsights(workouts), [workouts]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
          <div className="flex items-center gap-2 text-xs text-muted-foreground opacity-0 animate-fade-up" style={{ animationDelay: "100ms" }}>
            <Brain className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">AI-powered insights</span>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <StatsBar workouts={workouts} />

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Log + History */}
          <div className="space-y-6">
            <section className="bg-card border border-border rounded-xl p-5 opacity-0 animate-fade-up" style={{ animationDelay: "200ms" }}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Log Workout</h2>
              <WorkoutForm onAdd={handleAdd} />
            </section>

            <section className="bg-card border border-border rounded-xl p-5 opacity-0 animate-fade-up" style={{ animationDelay: "280ms" }}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Recent Activity</h2>
              <WorkoutHistory workouts={workouts} onDelete={handleDelete} />
            </section>

            <section className="bg-card border border-border rounded-xl p-5 opacity-0 animate-fade-up" style={{ animationDelay: "340ms" }}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Body Weight</h2>
              <BodyWeightTracker entries={bodyWeights} onAdd={handleAddBodyWeight} onDelete={handleDeleteBodyWeight} />
            </section>
          </div>

          {/* Right: Charts + AI Coach */}
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
    </div>
  );
}
