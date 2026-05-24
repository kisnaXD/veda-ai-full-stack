# VedaAI Assessment Creator

## Prerequisites

- Node.js 20 or newer
- Docker Desktop (for MongoDB + Redis)
- An OpenAI-compatible API key (OpenAI, Groq, OpenRouter, Together, etc.)

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start MongoDB and Redis**

   ```bash
   npm run infra:up
   ```

3. **Create env files**

   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env.local
   ```

4. **Add your LLM key**

   Open `apps/api/.env` and set:

   ```
   LLM_API_KEY=<your-key>
   ```

   For **Groq** (free tier), also set:

   ```
   LLM_BASE_URL=https://api.groq.com/openai/v1
   LLM_MODEL=llama-3.3-70b-versatile
   ```

   For **OpenAI**, leave `LLM_BASE_URL` as-is and use a model like `gpt-4o-mini`.

   > If you leave `LLM_API_KEY` empty, the backend serves a structured mock paper so you can demo the full flow without any key.

5. **Run the app**

   ```bash
   npm run dev
   ```

   - Web: http://localhost:3000
   - API: http://localhost:4000

## Useful scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start frontend + backend concurrently |
| `npm run build` | Build all three workspaces |
| `npm run infra:up` | Start Mongo + Redis containers |
| `npm run infra:down` | Stop Mongo + Redis containers |
| `npm run infra:logs` | Tail Mongo + Redis logs |

## Stack

Next.js 14 + Tailwind + Zustand + Socket.IO client, Express + Mongoose + BullMQ + Socket.IO server, Puppeteer for PDF export, Zod schemas shared between client and server.
