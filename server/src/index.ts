import "dotenv/config";
import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
const PORT = parseInt(process.env.PORT ?? "8787", 10);
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? "http://localhost:5173";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is required. Add it to server/.env");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const isDev = !process.env.ALLOWED_ORIGIN || process.env.ALLOWED_ORIGIN.includes("localhost");

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (isDev && origin.startsWith("http://localhost")) return callback(null, true);
    if (ALLOWED_ORIGIN && origin === ALLOWED_ORIGIN) return callback(null, true);
    callback(new Error("Not allowed by CORS"));
  }
}));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const SYSTEM_PROMPT = `You are IronMind, an expert AI fitness coach. You analyze workout data and provide actionable, personalized coaching advice.

Rules:
- Be concise and specific. Each insight should be 1-2 sentences max.
- Reference the user's actual numbers (weights, reps, exercises) when giving advice.
- Focus on: progressive overload, recovery, exercise selection, plateau-breaking, and injury prevention.
- Be encouraging but honest.`;

app.post("/api/insights", async (req, res) => {
  try {
    const { workouts } = req.body as { workouts: string };

    const prompt = `${SYSTEM_PROMPT}

Return exactly 3-5 bullet-point insights, each on its own line starting with a dash (-).
Do NOT use emojis. Do NOT use markdown formatting beyond dashes.

Here is the user's workout data:
${workouts}

Provide personalized coaching insights:`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const insights = text
      .split("\n")
      .map((line) => line.replace(/^-\s*/, "").trim())
      .filter((line) => line.length > 0);

    res.json({ insights });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    res.status(500).json({ error: message });
  }
});

app.post("/api/chat", async (req, res) => {
  try {
    const { workouts, messages } = req.body as {
      workouts: string;
      messages?: { role: string; content: string }[];
    };

    const history = (messages ?? [])
      .map((m) => `${m.role === "user" ? "User" : "Coach"}: ${m.content}`)
      .join("\n");

    const prompt = `${SYSTEM_PROMPT}

User's workout data:
${workouts}

Conversation so far:
${history}

Respond as the coach. Be concise (2-4 sentences). Reference their actual data when relevant.`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    res.json({ reply });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    res.status(500).json({ error: message });
  }
});

app.listen(PORT, () => {
  console.log(`IronMind API running on http://localhost:${PORT}`);
});
