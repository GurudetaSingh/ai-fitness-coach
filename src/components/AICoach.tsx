import { Brain, Flame, TrendingUp, AlertTriangle, RotateCcw, Bed } from "lucide-react";

interface Props {
  insights: string[];
}

function getIcon(insight: string) {
  if (insight.includes("📊") || insight.includes("plateaued")) return <TrendingUp className="w-4 h-4 text-accent shrink-0 mt-0.5" />;
  if (insight.includes("⚠️") || insight.includes("dropped")) return <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />;
  if (insight.includes("🔥") || insight.includes("progress")) return <Flame className="w-4 h-4 text-primary shrink-0 mt-0.5" />;
  if (insight.includes("🔄") || insight.includes("variety")) return <RotateCcw className="w-4 h-4 text-accent shrink-0 mt-0.5" />;
  if (insight.includes("🛌") || insight.includes("rest")) return <Bed className="w-4 h-4 text-success shrink-0 mt-0.5" />;
  return <Brain className="w-4 h-4 text-primary shrink-0 mt-0.5" />;
}

function cleanEmoji(text: string) {
  return text.replace(/^[📊⚠️🔥🔄🛌💪🎯]\s*/, "");
}

export default function AICoach({ insights }: Props) {
  return (
    <div className="space-y-3">
      {insights.map((insight, i) => (
        <div
          key={i}
          className="flex gap-3 p-3 rounded-lg bg-background/50 border border-border/50"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          {getIcon(insight)}
          <p className="text-sm leading-relaxed">{cleanEmoji(insight)}</p>
        </div>
      ))}
    </div>
  );
}
