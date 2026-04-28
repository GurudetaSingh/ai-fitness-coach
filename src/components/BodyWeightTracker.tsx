import { useState } from "react";
import { Scale, Trash2, TrendingUp, TrendingDown, Minus, Pencil, Check, X } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { BodyWeight } from "@/lib/fitness-store";

function getLocalDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface Props {
  entries: BodyWeight[];
  onAdd: (entry: { date: string; weight: number }) => void;
  onUpdate: (id: string, weight: number) => void;
  onDelete: (id: string) => void;
}

export default function BodyWeightTracker({ entries, onAdd, onUpdate, onDelete }: Props) {
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(getLocalDate);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editWeight, setEditWeight] = useState("");

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const chartData = sorted.map((e) => ({ date: formatDate(e.date), weight: e.weight }));
  const latest = sorted[sorted.length - 1];
  const previous = sorted[sorted.length - 2];
  const diff = latest && previous ? latest.weight - previous.weight : null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!weight) return;
    onAdd({ date, weight: parseFloat(weight) });
    setWeight("");
    setDate(getLocalDate());
  }

  function startEdit(entry: BodyWeight) {
    setEditingId(entry.id);
    setEditWeight(String(entry.weight));
  }

  function commitEdit(id: string) {
    const val = parseFloat(editWeight);
    if (!isNaN(val) && val > 0) onUpdate(id, val);
    setEditingId(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <div className="flex-1">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-1.5 block">Weight (lbs)</Label>
          <Input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="175.5" className="bg-background border-border" />
        </div>
        <div className="flex-1">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-1.5 block">Date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-background border-border" />
        </div>
        <Button type="submit" variant="fire" className="shrink-0">
          <Scale className="w-4 h-4" />
          Log
        </Button>
      </form>

      {latest && (
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-background/50 border border-border/50">
          <span className="text-2xl font-bold">{latest.weight}</span>
          <span className="text-sm text-muted-foreground">lbs</span>
          {diff !== null && (
            <div className={`flex items-center gap-1 text-xs ml-auto ${diff > 0 ? "text-primary" : diff < 0 ? "text-accent" : "text-muted-foreground"}`}>
              {diff > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : diff < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
              {diff > 0 ? "+" : ""}{diff.toFixed(1)} lbs vs last
            </div>
          )}
        </div>
      )}

      {chartData.length >= 2 && (
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 12% 18%)" />
              <XAxis dataKey="date" tick={{ fill: "hsl(220 8% 52%)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(220 8% 52%)", fontSize: 11 }} axisLine={false} tickLine={false} width={40} domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ background: "hsl(220 16% 11%)", border: "1px solid hsl(220 12% 18%)", borderRadius: "8px", fontSize: 13, color: "hsl(40 10% 92%)" }} />
              <Line type="monotone" dataKey="weight" stroke="hsl(200 80% 55%)" strokeWidth={2.5} dot={{ fill: "hsl(200 80% 55%)", r: 3 }} activeDot={{ r: 5 }} name="Weight (lbs)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {sorted.length > 0 && (
        <div className="space-y-1.5 max-h-36 overflow-y-auto">
          {[...sorted].reverse().slice(0, 10).map((e) => (
            <div key={e.id} className="px-3 py-2 rounded-lg bg-background/50 border border-border/50 group hover:border-primary/20 transition-colors">
              {editingId === e.id ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-muted-foreground w-16 shrink-0">{formatDate(e.date)}</span>
                  <Input
                    type="number"
                    step="0.1"
                    value={editWeight}
                    onChange={(ev) => setEditWeight(ev.target.value)}
                    onKeyDown={(ev) => { if (ev.key === "Enter") commitEdit(e.id); if (ev.key === "Escape") cancelEdit(); }}
                    autoFocus
                    className="h-7 text-sm bg-background border-border px-2"
                  />
                  <span className="text-xs text-muted-foreground">lbs</span>
                  <button onClick={() => commitEdit(e.id)} className="p-1 rounded-md text-primary hover:bg-primary/10 transition-colors">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={cancelEdit} className="p-1 rounded-md text-muted-foreground hover:bg-secondary transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono">{formatDate(e.date)}</span>
                  <span className="text-sm font-medium">{e.weight} lbs</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => startEdit(e)} className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors active:scale-[0.95]">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onDelete(e.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors active:scale-[0.95]">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {entries.length === 0 && (
        <p className="text-center py-4 text-sm text-muted-foreground">
          Log your weight to track trends over time
        </p>
      )}
    </div>
  );
}
