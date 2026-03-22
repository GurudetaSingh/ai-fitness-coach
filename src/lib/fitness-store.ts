export interface WorkoutEntry {
  id: string;
  date: string;
  exercise: string;
  weight: number;
  reps: number;
  sets: number;
}

export interface BodyWeight {
  date: string;
  weight: number;
}

const WORKOUTS_KEY = "fitness-workouts";
const BODYWEIGHT_KEY = "fitness-bodyweight";

export function getWorkouts(): WorkoutEntry[] {
  const raw = localStorage.getItem(WORKOUTS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function addWorkout(entry: Omit<WorkoutEntry, "id">): WorkoutEntry {
  const workouts = getWorkouts();
  const newEntry = { ...entry, id: crypto.randomUUID() };
  workouts.push(newEntry);
  localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
  return newEntry;
}

export function deleteWorkout(id: string) {
  const workouts = getWorkouts().filter((w) => w.id !== id);
  localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
}

export function getBodyWeights(): BodyWeight[] {
  const raw = localStorage.getItem(BODYWEIGHT_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function addBodyWeight(entry: BodyWeight) {
  const weights = getBodyWeights();
  weights.push(entry);
  localStorage.setItem(BODYWEIGHT_KEY, JSON.stringify(weights));
}

export const COMMON_EXERCISES = [
  "Bench Press",
  "Squat",
  "Deadlift",
  "Overhead Press",
  "Barbell Row",
  "Pull-up",
  "Dumbbell Curl",
  "Tricep Pushdown",
  "Leg Press",
  "Romanian Deadlift",
  "Lat Pulldown",
  "Cable Fly",
  "Lateral Raise",
  "Face Pull",
  "Leg Curl",
  "Leg Extension",
];

export function generateInsights(workouts: WorkoutEntry[]): string[] {
  if (workouts.length < 3) {
    return ["Log a few more workouts to get personalized AI coaching insights! 💪"];
  }

  const insights: string[] = [];
  const exerciseMap = new Map<string, WorkoutEntry[]>();

  workouts.forEach((w) => {
    const existing = exerciseMap.get(w.exercise) || [];
    existing.push(w);
    exerciseMap.set(w.exercise, existing);
  });

  exerciseMap.forEach((entries, exercise) => {
    const sorted = entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    if (sorted.length < 2) return;

    const recent = sorted.slice(-3);
    const weights = recent.map((e) => e.weight);
    const allSame = weights.every((w) => w === weights[0]);
    const decreasing = weights.length >= 2 && weights[weights.length - 1] < weights[0];
    const totalVolume = recent.map((e) => e.weight * e.reps * e.sets);
    const volumeDecreasing = totalVolume.length >= 2 && totalVolume[totalVolume.length - 1] < totalVolume[0];

    if (allSame && sorted.length >= 3) {
      insights.push(
        `📊 Your ${exercise} has plateaued at ${weights[0]}lbs. Consider adding micro-plates (+2.5lbs), increasing reps before weight, or trying pause reps.`
      );
    } else if (decreasing) {
      insights.push(
        `⚠️ Your ${exercise} weight dropped from ${weights[0]} to ${weights[weights.length - 1]}lbs. This might indicate fatigue — consider a deload week with 50-60% of your working weight.`
      );
    } else if (volumeDecreasing) {
      insights.push(
        `📉 Total volume on ${exercise} is trending down. Try adding an extra set or increasing rest time to 3-4 minutes between heavy sets.`
      );
    }

    if (sorted.length >= 5) {
      const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
      const secondHalf = sorted.slice(Math.floor(sorted.length / 2));
      const avgFirst = firstHalf.reduce((s, e) => s + e.weight, 0) / firstHalf.length;
      const avgSecond = secondHalf.reduce((s, e) => s + e.weight, 0) / secondHalf.length;
      if (avgSecond > avgFirst * 1.05) {
        insights.push(
          `🔥 Great progress on ${exercise}! You've increased your average weight by ${Math.round(((avgSecond - avgFirst) / avgFirst) * 100)}%. Keep this momentum going.`
        );
      }
    }
  });

  // General insights
  const uniqueExercises = new Set(workouts.map((w) => w.exercise));
  if (uniqueExercises.size <= 3) {
    insights.push(
      "🔄 You're only training a few exercises. Consider adding variety — compound movements like rows, pull-ups, or lunges can help balanced development."
    );
  }

  const dates = [...new Set(workouts.map((w) => w.date))].sort();
  if (dates.length >= 7) {
    const recentWeek = dates.slice(-7);
    const daysInWeek = new Set(recentWeek).size;
    if (daysInWeek >= 6) {
      insights.push(
        "🛌 You've trained 6+ days recently. Recovery is when muscles grow — consider at least 1-2 full rest days per week."
      );
    }
  }

  if (workouts.length >= 20 && insights.length === 0) {
    insights.push(
      "💪 Solid consistency! Consider periodizing your training — alternate between strength (3-5 reps), hypertrophy (8-12 reps), and endurance (15+ reps) phases every 4-6 weeks."
    );
  }

  return insights.length > 0
    ? insights
    : ["Keep logging workouts! More data means better coaching insights. 🎯"];
}
