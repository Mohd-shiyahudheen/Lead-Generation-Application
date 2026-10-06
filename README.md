# SaaSquatch Signal

> **"From thousands of companies to the companies worth pursuing first."**

An explainable lead intelligence and prioritization layer built for acquisition entrepreneurs, search funds, and M&A deal teams. Built as the Caprae Capital Full Stack Developer AI-Readiness Pre-Screening Challenge within a strict 5-hour engineering budget.

---

## 🎯 The Core Problem & Strategic Product Decision

### Reference Product Analysis: [SaaSquatch Leads](https://www.saasquatchleads.com/)
SaaSquatch Leads is a discovery platform for bootstrapped and privately-held software businesses. It solves the **discovery problem** by indexing thousands of companies with revenue, headcount, tech stacks, and contact data.

### The Critical Gap
Discovering companies is only half the battle. A search fund or acquisition entrepreneur who exports 2,000 SaaS companies from SaaSquatch immediately faces a bottleneck:
- **Which of these 2,000 companies should I evaluate first?**
- **Which companies actually fit my fund's investment mandate (revenue range, headcount, industry, geography)?**
- **Why is Company A a better target than Company B?**

Without an intelligence layer, entrepreneurs waste tens of hours manually reviewing spreadsheets, or they blast generic outreach to unqualified leads.

### The Product Decision
Rather than attempting to clone a web scraper or build a commodity CRM within the 5-hour time budget, **SaaSquatch Signal** adds the missing high-value intelligence layer: **Explainable Lead Scoring, Deal Signals, and Prioritization**.

```
Discovery (SaaSquatch) ───► Intelligence & Prioritization (Signal) ───► Targeted Outreach
(Finds thousands)           (Identifies the 20 worth pursuing first)       (High-conversion)
```

---

## ✨ Key Features & The End-to-End Workflow

1. **Ideal Customer Profile (ICP) Builder (`/icp`)**
   - Configure target industries (multi-select + custom tags), revenue range ($1M–$10M presets), headcount ranges (10–100), and target geographies.
   - **Real-Time Re-Scoring**: Modifying the ICP immediately recalculates scores for the entire pipeline in real time.

2. **Deterministic 5-Factor Scoring Engine**
   - Produces a **0–100 fit score** and assigns companies to **Tiers A, B, C, or D**.
   - **100% Explainable**: No black-box AI scores. Every point is tied to explicit mathematical factors with human-readable rationale.

3. **Structured Deal Signals**
   - 7 boolean indicators per company:
     - `Revenue in Target Range`
     - `Industry Match`
     - `Strong Employee Count`
     - `Growth Signal`
     - `Decision Maker Found`
     - `High Data Completeness`
     - `Potential Acquisition Fit` (composite signal)

4. **Actionable Recommendations & AI Thesis**
   - Generates natural-language acquisition theses and next steps (e.g. *"Initiate executive outreach to Marcus Vance"*).
   - **Fallback-First Architecture**: Works seamlessly out of the box with deterministic intelligence; upgrades to LLM-generated recommendations if `AI_API_KEY` is provided. AI failure will never break the product.

5. **Executive Dashboard (`/dashboard`)**
   - High-level pipeline KPIs (Total Analyzed, Tier A %, Tier B %, Average Fit Score).
   - Active ICP mandate banner.
   - Quick access to the highest-priority acquisition targets.

6. **Interactive Leads Catalog (`/leads`)**
   - Fast debounced search across companies, founders, industries, and descriptions.
   - One-click tier filter tabs (Tier A, Tier B, Tier C, Tier D).
   - Multi-column sorting (Score, Revenue, Employees, Name).
   - Server-side pagination.
   - One-click "Reset Demo Data" for immediate evaluation.

---

## 🧮 Scoring Engine Specification

The scoring engine lives in [server/src/services/scoring.ts](file:///d:/Interview-Task/Caprae%20Capital/server/src/services/scoring.ts). It is a pure, isolated module with 100% unit test coverage.

### Factor Weights

| Factor | Weight | Max Points | Description |
|---|---|---|---|
| **Revenue Fit** | **25%** | 25 pts | 1.0 inside target range; decays linearly outside range; 0.3 if undisclosed |
| **Industry Fit** | **20%** | 20 pts | 1.0 for exact match; 0.5 for related/token match; 0.0 for unrelated |
| **Employee Fit** | **20%** | 20 pts | 1.0 inside headcount range; decays linearly outside range; 0.3 if missing |
| **Growth Signal** | **20%** | 20 pts | Composite of revenue growth %, headcount growth %, and company age |
| **Data Completeness** | **15%** | 15 pts | Proportion of key fields populated (finances, founder, website, description) |
| **Total** | **100%** | **100 pts** | |

### Priority Tiers

| Score Range | Priority Tier | Badge | Recommended Action |
|---|---|---|---|
| **90 – 100** | **Tier A** | 🟢 High Priority | Immediate personalized executive outreach |
| **75 – 89** | **Tier B** | 🔵 Good Candidate | Add to shortlist; preliminary tech validation |
| **60 – 74** | **Tier C** | 🟡 Needs Review | Monitor; enrich missing data fields |
| **0 – 59** | **Tier D** | ⚪ Low Priority | Deprioritize; outside mandate |

---

## 🏛️ System Architecture

Monorepo design with isolated client and server packages:

```
Caprae Capital/
├── client/                     # Frontend (React 18, Vite, TypeScript, Tailwind)
│   ├── src/
│   │   ├── api/client.ts       # REST client with typed responses
│   │   ├── components/         # PriorityBadge, ScoreRing, ScoreBreakdownBar, DealSignalList, etc.
│   │   ├── pages/              # DashboardPage, LeadsPage, LeadDetailPage, ICPPage
│   │   ├── types/              # Client TypeScript interfaces
│   │   ├── App.tsx             # TanStack Query + React Router
│   │   └── index.css           # Custom dark theme & glassmorphism
│   ├── package.json
│   ├── vite.config.ts          # Vite proxy to backend port 3001
│   └── tailwind.config.js
│
├── server/                     # Backend (Node.js, Express, TypeScript, Mongoose, Zod)
│   ├── src/
│   │   ├── config/database.ts  # Mongoose connection
│   │   ├── models/             # Lead.ts, ICP.ts
│   │   ├── routes/             # leads.ts, icp.ts, dashboard.ts
│   │   ├── services/           # scoring.ts, signals.ts, ai.ts
│   │   ├── seed/               # Realistic 28-company fictional dataset
│   │   ├── middleware/         # validation.ts (Zod), errorHandler.ts
│   │   └── index.ts            # Express app with auto-seeder
│   ├── tests/
│   │   └── scoring.test.ts     # Comprehensive unit tests with Vitest
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                       # Planning artifacts
│   ├── PRODUCT_ANALYSIS.md     # Reference breakdown & strategic justification
│   ├── ARCHITECTURE.md         # Full architectural specification
│   └── IMPLEMENTATION_PLAN.md  # 5-hour time budget and execution phases
│
├── package.json                # Monorepo runner scripts
├── .env.example
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** >= 18
- **npm** >= 9
- **MongoDB** (local service on `mongodb://localhost:27017` or a MongoDB Atlas URI in `.env`)

### 1. Installation
Clone the repository and install all dependencies:

```bash
# From workspace root:
npm run install:all
```

*(Alternatively, run `npm install` inside both `/server` and `/client` directories).*

### 2. Environment Setup (Optional)
The application works immediately out-of-the-box with default settings. To customize ports or configure an optional AI provider, copy `.env.example`:

```bash
cp .env.example server/.env
```

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/saasquatch-signal
NODE_ENV=development

# Optional AI API (App works 100% without this via deterministic fallback)
AI_API_KEY=
AI_API_URL=https://api.openai.com/v1/chat/completions
```

### 3. Running the Application
Start both the backend server and frontend client concurrently:

```bash
npm run dev
```

Or run them in separate terminals:
```bash
# Terminal 1: Backend API (port 3001)
npm run dev:server

# Terminal 2: Frontend UI (port 5173)
npm run dev:client
```

Open your browser to **[http://localhost:5173](http://localhost:5173)**.

> **Note on Seeding**: The server automatically seeds the database with the default acquisition ICP and 28 realistic fictional companies on first run! You can also run `npm run seed` or click **"Reset Demo Data"** in the sidebar at any time.

---

## 🧪 Testing the Scoring Engine

Run the scoring engine unit test suite:

```bash
npm test
```

Or from the server directory:
```bash
cd server
npm test
```

### Unit Test Coverage
- `calculateRevenueFit`: Range bounds, linear distance decay, missing value fallback
- `calculateIndustryFit`: Exact matches, token/keyword overlap, unrelated industries
- `calculateEmployeeFit`: Headcount bounds, distance decay, missing value handling
- `calculateGrowthSignal`: Explicit revenue & employee growth metrics, company age heuristics
- `calculateDataCompleteness`: Field-level weight validation
- `computeScore`: Weighted sums and boundary extremes (0 and 100)
- `classifyPriority`: Tier threshold boundaries (A, B, C, D)
- `scoreLead`: Full end-to-end deterministic evaluation
- `Deal Signals & AI Fallback`: Boolean signal detection and recommendation text generation

---

## ⏱️ 5-Hour Engineering Budget & Trade-Offs

| Time Window | Phase | Execution |
|---|---|---|
| **0:00 – 0:30** | Reference Analysis & Planning | Analyzed SaaSquatch Leads, drafted `PRODUCT_ANALYSIS.md`, established positioning |
| **0:30 – 1:00** | Architecture & Schemas | Created `ARCHITECTURE.md`, `IMPLEMENTATION_PLAN.md`, schema designs, API contracts |
| **1:00 – 2:00** | Backend & Scoring Engine | Implemented Express, Mongoose, Zod, pure scoring engine, signals service, seed data |
| **2:00 – 3:15** | Frontend Core | Built React + Tailwind + Vite setup, Dashboard KPIs, Lead Catalog with filters/sorting |
| **3:15 – 4:15** | Lead Detail & Signals | Built Lead Detail, SVG circular gauge, factor breakdown bars, deal signals checklist |
| **4:15 – 4:40** | Polish & UX | Added responsive design, empty/loading states, toasts, dark theme styling |
| **4:40 – 5:00** | Verification & Finalization | Vitest test suite pass, verified API proxy, comprehensive README documentation |

### Strategic Trade-Off Decisions
1. **Pre-Seeded Fictional Dataset over Live Web Scraping**: Live scraping is commodity plumbing prone to rate limits and anti-bot captchas. Pre-seeding 28 realistic companies allowed spending 100% of engineering time on the core intellectual problem: **lead intelligence and explainability**.
2. **Single Active ICP over Complex Multi-Tenancy**: A single active ICP enables immediate, delightful real-time re-scoring feedback without unnecessary auth or team invitation friction.
3. **Deterministic First, AI as Enhancement**: AI models can hallucinate or fail when API keys are absent. By making deterministic scoring the foundation and AI an optional layer with graceful fallback, the product is 100% reliable.
