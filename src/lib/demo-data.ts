import type { WorkoutEntry, BodyWeight } from "./fitness-store";

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

let idCounter = 0;
function id() { return `demo-${++idCounter}`; }

// Upper body sessions (Bench, OHP, Pull-up, Row) — progressive overload
const upperSessions: [number, number, number, number, number][] = [
  // [daysAgo, bench, ohp, pullupReps, rowWeight]
  [52, 135, 85, 6, 115],
  [46, 135, 85, 6, 115],
  [40, 140, 90, 7, 120],
  [34, 140, 90, 7, 120],
  [28, 145, 95, 8, 125],
  [22, 145, 95, 8, 125],
  [16, 150, 100, 9, 130],
  [10, 150, 100, 9, 130],
  [4,  155, 105, 10, 135],
];

// Lower body sessions (Squat, Deadlift, Leg Press) — progressive overload
const lowerSessions: [number, number, number, number][] = [
  // [daysAgo, squat, deadlift, legPress]
  [55, 185, 225, 225],
  [49, 185, 225, 225],
  [43, 190, 235, 235],
  [37, 190, 235, 235],
  [31, 195, 245, 245],
  [25, 195, 245, 245],
  [19, 200, 255, 255],
  [13, 200, 255, 255],
  [7,  205, 265, 265],
  [2,  205, 265, 265],
];

export const DEMO_WORKOUTS: WorkoutEntry[] = [
  ...upperSessions.flatMap(([ago, bench, ohp, pullupReps, row]) => [
    { id: id(), date: daysAgo(ago), exercise: "Bench Press",  weight: bench, sets: 3, reps: 8 },
    { id: id(), date: daysAgo(ago), exercise: "Overhead Press", weight: ohp, sets: 3, reps: 8 },
    { id: id(), date: daysAgo(ago), exercise: "Pull-up",      weight: 0,    sets: 3, reps: pullupReps },
    { id: id(), date: daysAgo(ago), exercise: "Barbell Row",  weight: row,  sets: 3, reps: 8 },
  ]),
  ...lowerSessions.flatMap(([ago, squat, deadlift, legPress]) => [
    { id: id(), date: daysAgo(ago), exercise: "Squat",        weight: squat,    sets: 3, reps: 5 },
    { id: id(), date: daysAgo(ago), exercise: "Deadlift",     weight: deadlift, sets: 1, reps: 5 },
    { id: id(), date: daysAgo(ago), exercise: "Leg Press",    weight: legPress, sets: 3, reps: 10 },
  ]),
];

export const DEMO_BODY_WEIGHTS: BodyWeight[] = [
  { id: id(), date: daysAgo(56), weight: 182 },
  { id: id(), date: daysAgo(49), weight: 181.5 },
  { id: id(), date: daysAgo(42), weight: 181 },
  { id: id(), date: daysAgo(35), weight: 180 },
  { id: id(), date: daysAgo(28), weight: 179.5 },
  { id: id(), date: daysAgo(21), weight: 179 },
  { id: id(), date: daysAgo(14), weight: 178.5 },
  { id: id(), date: daysAgo(7),  weight: 178 },
  { id: id(), date: daysAgo(3),  weight: 177.5 },
  { id: id(), date: daysAgo(0),  weight: 177 },
];
