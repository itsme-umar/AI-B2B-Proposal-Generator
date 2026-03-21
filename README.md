# AI B2B Proposal Generator

A full-stack application that generates **sustainability-focused product proposals** for B2B clients using AI (Google Gemini). Users provide client details and budget; the system returns a structured proposal (product mix, budget allocation, cost breakdown, impact summary) and saves it to MongoDB.

## Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, TailwindCSS, React Server Components where applicable
- **Backend:** Next.js API routes, TypeScript
- **Database:** MongoDB with Mongoose
- **AI:** Google Gemini API

## Features

- Form for client name, industry, sustainability goals, total budget, preferred categories, and notes
- AI-generated proposal with:
  - Sustainable product mix (products, categories, reasons)
  - Budget allocation per category (within total budget)
  - Estimated cost breakdown
  - Impact positioning summary
- Proposals saved to MongoDB
- Structured error handling (invalid JSON, Gemini errors, budget validation, DB errors)
- Strong TypeScript types throughout

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

- **MONGODB_URI** – Choose one:
  - **Local (e.g. Homebrew on Mac):** `mongodb://127.0.0.1:27017/ai-b2b-proposals` — start MongoDB first (`brew services start mongodb-community` or your install’s service name).
  - **Atlas (cloud):** copy the full string from [Atlas](https://www.mongodb.com/cloud/atlas) → **Database → Connect → Drivers**. Host must be like `cluster0.abc12.mongodb.net` — **never** the fake host `cluster.mongodb.net` (causes DNS / “fake hostname” errors).
- **GEMINI_API_KEY** – API key from [Google AI Studio](https://aistudio.google.com/apikey)
- **GEMINI_MODEL** (optional) – Model id, default `gemini-2.5-flash`. Older ids like `gemini-1.5-flash` return 404; see [Gemini models](https://ai.google.dev/gemini-api/docs/models/gemini).

### 3. MongoDB

- **Local:** Install/start MongoDB, set `MONGODB_URI=mongodb://127.0.0.1:27017/ai-b2b-proposals`.
- **Atlas:** Create a cluster and use the **Drivers** connection string (real `cluster0....mongodb.net` host).
- You do not need to create the database or collection manually; Mongoose creates collections on first write.

**Troubleshooting `querySrv ENOTFOUND _mongodb._tcp...`**

- You are almost certainly using an invalid hostname (often the README placeholder `cluster.mongodb.net`). Use the exact SRV string from Atlas.
- If your password contains `@`, `#`, `:`, etc., [URL-encode](https://www.mongodb.com/docs/atlas/troubleshoot-connection/#special-characters-in-connection-string-password) it in the URI.
- Rarely: corporate DNS/firewall blocks SRV lookups — try another network or Atlas support docs for non-SRV connection strings.

### 4. Gemini API

- Go to [Google AI Studio](https://aistudio.google.com/apikey), sign in, and create an API key.
- Add it to `.env.local` as `GEMINI_API_KEY`.

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use the form to submit client details and generate a proposal.

## Project structure

```
/app
  /api
    /generate-proposal
      route.ts          # POST handler: validate → Gemini → validate JSON → save → respond
  layout.tsx
  page.tsx              # Dashboard with form + result area
  globals.css
/components
  ProposalForm.tsx      # Client & requirements form
  ProposalResult.tsx   # Renders full proposal (product mix, tables, summary)
  BudgetTable.tsx      # Budget allocation + cost breakdown tables
  ProductMixCard.tsx   # Single product card
/lib
  mongodb.ts            # MongoDB connection (cached)
  gemini.ts             # Gemini prompt + generateProposalWithGemini()
/models
  Proposal.ts           # Mongoose schema for Proposal
/types
  proposal.ts           # ProposalInput, AIProposalResponse, ProposalDocument, etc.
/utils
  jsonValidator.ts      # Parse + validate AI JSON, strip code fences
```

## API

### POST `/api/generate-proposal`

**Body:**

```json
{
  "client_name": "string",
  "industry": "string",
  "sustainability_goals": "string",
  "total_budget": number,
  "preferred_categories": ["string"],
  "notes": "string"
}
```

**Success (200):**

```json
{
  "success": true,
  "proposal": { "_id", "client_name", "industry", ... }
}
```

**Error (4xx/5xx):**

```json
{
  "success": false,
  "error": "message",
  "code": "VALIDATION_ERROR | GEMINI_ERROR | INVALID_AI_JSON | BUDGET_EXCEEDED | MONGODB_ERROR"
}
```

## Error handling

- **Invalid request body / validation:** 400, `VALIDATION_ERROR`
- **Gemini API failure:** 502, `GEMINI_ERROR`
- **Invalid or non-compliant AI JSON:** 502, `INVALID_AI_JSON`
- **Allocation exceeds total budget:** 400, `BUDGET_EXCEEDED`
- **MongoDB connection/save failure:** 503, `MONGODB_ERROR`

## Build & production

```bash
npm run build
npm start
```

Ensure `MONGODB_URI` and `GEMINI_API_KEY` are set in the production environment.

## License

MIT
