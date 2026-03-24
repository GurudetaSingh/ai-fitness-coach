🏋️ IronMind — AI Fitness Tracker & Coach

IronMind is a modern fitness tracking web app that enables users to log workouts, visualize progress, and receive real-time AI-powered coaching insights based on their training data.

🚀 Features
📝 Workout Tracking
Log exercises with weight, reps, sets, and date
Choose from 16 common exercises (bench press, squat, deadlift, etc.)
View and manage workout history
Persistent storage using browser localStorage
📊 Progress Visualization
Interactive charts showing weight and volume trends over time
Stats dashboard:
Total volume
Max weight
Active training days
🤖 AI Coaching (Gemini-powered)
Workout data is sent to a backend server for analysis
AI generates 3–5 personalized insights, such as:
Plateau detection
Recovery and fatigue analysis
Programming recommendations (deloads, variation, intensity)
Fallback to rule-based insights if AI service is unavailable
💬 Chat with Your Coach
Ask questions like:
“Should I deload?”
“How do I improve my bench?”
AI responses are context-aware, using your full workout history
🛠️ Tech Stack
Frontend
React 18 + TypeScript
Vite
Tailwind CSS
Recharts
Radix UI
Backend
Node.js + Express
Google Gemini API (2.5 Flash)
REST API with CORS + proxy handling
Data Layer
localStorage (client-side persistence)
⚙️ Architecture
React Frontend (Vite)
   ↓
Express Backend (API layer)
   ↓
Google Gemini API (AI processing)
Frontend handles UI, state, and chart rendering
Backend securely manages API calls and AI requests
AI model analyzes workout history and returns coaching insights
🧠 How It Works
Workout data is stored locally and managed via React state
When workouts are logged, data is optionally sent to the backend
The backend formats and sends structured prompts to the AI model
AI returns actionable coaching insights based on user history
If the AI service is unavailable, a rule-based engine provides fallback recommendations
🔮 Future Improvements
User authentication + cloud data sync
Advanced LLM coaching (periodization, long-term planning)
Workout planning & scheduling
Nutrition tracking & calorie integration
Mobile app (React Native)
🧑‍💻 Setup
git clone https://github.com/your-username/ironmind
cd ironmind
npm install
npm run dev
