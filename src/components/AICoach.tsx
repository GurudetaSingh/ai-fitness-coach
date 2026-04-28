import { useState, useEffect, useRef } from "react";
import {
  Brain,
  Flame,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Bed,
  Send,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  generateAIInsights,
  chatWithCoach,
  type ChatMessage,
} from "@/lib/ai-service";
import type { WorkoutEntry } from "@/lib/fitness-store";

interface Props {
  insights: string[];
  workouts: WorkoutEntry[];
}

function getIcon(insight: string) {
  if (insight.includes("plateaued"))
    return <TrendingUp className="w-4 h-4 text-accent shrink-0 mt-0.5" />;
  if (insight.includes("dropped"))
    return <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />;
  if (insight.includes("progress"))
    return <Flame className="w-4 h-4 text-primary shrink-0 mt-0.5" />;
  if (insight.includes("variety"))
    return <RotateCcw className="w-4 h-4 text-accent shrink-0 mt-0.5" />;
  if (insight.includes("rest") || insight.includes("recover"))
    return <Bed className="w-4 h-4 text-success shrink-0 mt-0.5" />;
  return <Brain className="w-4 h-4 text-primary shrink-0 mt-0.5" />;
}

export default function AICoach({ insights, workouts }: Props) {
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (workouts.length < 3) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    generateAIInsights(workouts)
      .then((result) => {
        if (!cancelled) setAiInsights(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? "Failed to get AI insights");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [workouts]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || chatLoading) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setChatLoading(true);

    try {
      const reply = await chatWithCoach(workouts, newMessages);
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Sorry, I couldn't respond. Please try again.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  }

  const displayInsights = aiInsights.length > 0 ? aiInsights : insights;
  const showAIBadge = aiInsights.length > 0;

  return (
    <div className="space-y-4">
      {loading && (
        <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Analyzing your workouts...
        </div>
      )}

      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
          {error}
          <span className="block text-xs mt-1 text-muted-foreground">
            Showing rule-based insights instead.
          </span>
        </div>
      )}

      {showAIBadge && (
        <div className="flex items-center gap-1.5 text-xs text-primary">
          <Sparkles className="w-3 h-3" />
          Powered by Gemini
        </div>
      )}

      <div className="space-y-3">
        {(error ? insights : displayInsights).map((insight, i) => (
          <div
            key={i}
            className="flex gap-3 p-3 rounded-lg bg-background/50 border border-border/50"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {getIcon(insight)}
            <p className="text-sm leading-relaxed">{insight}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-border/50 pt-4 space-y-3">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
          Ask your coach
        </p>

        {messages.length > 0 && (
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2.5 rounded-lg text-sm ${
                  msg.role === "user"
                    ? "bg-primary/10 text-foreground ml-8"
                    : "bg-background/50 border border-border/50 mr-8"
                }`}
              >
                {msg.content}
              </div>
            ))}
            {chatLoading && (
              <div className="flex items-center gap-2 p-2.5 text-sm text-muted-foreground">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Thinking...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. Should I deload this week?"
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            type="submit"
            disabled={!input.trim() || chatLoading}
            className="px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
