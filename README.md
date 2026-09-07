# GOOvd 🖼️🎬

AI-native image & video generation desktop app, powered by Google Gemini + Vertex AI (Imagen 3 / Veo).

GOOvd is a lightweight desktop "combine" for creative generation: type an idea, let an autonomous Gemini agent structure it into a director-quality prompt and decide when to trigger generation, then get a finished image or video back — all through your own API keys, no accounts, no lock-in.

## ✨ Features
- **Agentic prompt structuring** — Gemini (gemini-3.6-flash) analyzes your raw prompt and preset selections (style, lighting, camera angle) and autonomously calls a generate_media tool via native function calling — the model decides when a prompt is detailed enough to generate, not a hardcoded rule.
- **Multi-model generation** — switch between: Google Imagen 3 (Fast / High Quality), Google Vertex Video (Veo) / Luma (Vertex) for video, with automatic fallback if Veo access isn't available.
- **Continue Video** — extract the last frame of a generated clip and seamlessly continue it with a new prompt (image-to-video), up to 3 continuations per session.
- **Style / Lighting / Camera presets** — one-click cinematic, macro, 3D, minimalist, and cyberpunk styles, each with a hand-tuned prompt fragment baked in.
- **Live observability** — every agent decision, generation result, and error is streamed to Grafana Cloud (Loki) in real time, so the full agent → tool-call → result pipeline is auditable, not a black box.
- **Multi-language UI** — uk / en / ru / es, full coverage (every label and button, not just partial keys).
- **Bring your own keys** — no server, no accounts, no telemetry. You supply your own Google AI Studio key, Vertex service account, and/or OpenAI key; everything runs locally on your machine.

## 🧠 How it works
```text
User prompt + presets
       │
       ▼
Gemini (function calling)
│ decides to call
→ ▼ generate_media(mode, prompt, style, aspectRatio)
       │
       └─→ Vertex AI (Imagen 3 / Veo / Luma)
       │
       ▼
Result → GOOvd preview player + Grafana log
```
The generation call is a genuine tool invocation inside a single Gemini agent turn — the app doesn't just call two APIs back-to-back on button clicks, the model itself decides when the prompt is ready and triggers the tool.

## 🛠️ Tech stack
| Layer | Tech |
|---|---|
| **Frontend** | React + TypeScript + Vite, TailwindCSS |
| **Desktop shell** | Electron (Node.js) |
| **Bridge** | IPC (Inter-Process Communication) |
| **Agent** | Gemini API (@google/genai), native function calling |
| **Image/Video generation** | Vertex AI (Imagen 3, Veo), Luma (Vertex) |
| **Observability** | Grafana Cloud (Loki push API) |

## 🚀 Getting started

### 1. Clone & install
```bash
git clone https://github.com/<your-username>/goovd.git
cd goovd
npm install
```

### 2. Add your own keys
Copy `.env.example` to `.env` and fill in:
```env
GEMINI_API_KEY=your_google_ai_studio_key_here
GRAFANA_API_KEY=your_grafana_cloud_key_here
GRAFANA_PUSH_URL=your_grafana_loki_push_url_here
```
- **Gemini key** — free, get one at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
- **Vertex AI** — place your own service account JSON as `google-keys.json` in the project root, with the Vertex AI User role and the Vertex AI API enabled on your Google Cloud project
- **Grafana Cloud** — free tier, no card required, at [grafana.com](https://grafana.com/)

No keys? The app runs in demo mode automatically — a curated set of pre-generated sample outputs are shown instead, so the full UI/UX flow can still be reviewed end to end.

### 3. Run in dev mode (hot reload, no build step)
```bash
npm run dev
```
or on Windows, double-click `START_APP.bat`.

## 📊 Grafana dashboard
Every agent run pushes three event types to Loki:
- `agent_decision` — the moment Gemini calls the generation tool
- `generation_result` — success / mock / status + duration
- `generation_error` — provider error codes

Query in Grafana Explore: `{job="goovd-agent"}`. See `/docs/grafana-dashboard.md` for ready-made LogQL panels.

## 🎥 Demo
[Demo video link] · [Downloadable build (Google Drive)]

## ⚠️ Notes
- This repo contains no API keys or credentials — `google-keys.json`, `.env`, and `*.key` are gitignored.
- Built for Agentic Cinema: The Blockbuster Hackathon (Devpost).
- GOOvd is provided as-is; generation costs (Vertex AI usage) are billed to whichever API key you supply.

## 📄 License
MIT License