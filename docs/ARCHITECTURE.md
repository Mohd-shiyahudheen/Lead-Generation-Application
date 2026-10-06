# Architecture — SaaSquatch Signal

## System Overview

SaaSquatch Signal is a monorepo containing a React frontend and Express backend, backed by MongoDB. The architecture is intentionally simple — a single backend process serves both the API and (in production) the static frontend build.

```
┌─────────────────────────────────────────────────────────┐
│                     Client (Browser)                     │
│  React + TypeScript + Tailwind + TanStack Query          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │
│  │Dashboard │ │ICP Setup │ │Lead Table│ │Lead Detail │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP/REST (JSON)
┌────────────────────────┴────────────────────────────────┐
│                   Server (Express)                       │
│  ┌──────────┐ ┌───────────┐ ┌──────────┐ ┌───────────┐  │
│  │  Routes  │→│Validation │→│ Services │→│  Models   │  │
│  │(Express) │ │  (Zod)    │ │(Scoring) │ │(Mongoose) │  │
│  └──────────┘ └───────────┘ └──────────┘ └───────────┘  │
│                                    │                     │
│                            ┌───────┴───────┐             │
│                            │  AI Service   │             │
│                            │  (Optional)   │             │
│                            └───────────────┘             │
└────────────────────────────┬────────────────────────────┘
                             │ Mongoose ODM
┌────────────────────────────┴────────────────────────────┐
│                    MongoDB Atlas                         │
│  ┌──────────────┐ ┌──────────────┐                       │
│  │  leads        │ │  icps        │                       │
│  │  collection   │ │  collection  │                       │
│  └──────────────┘ └──────────────┘                       │
└─────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Stack
- **React 18** — UI framework
- **TypeScript** — Type safety
- **Vite** — Build tool and dev server
- **Tailwind CSS** — Utility-first styling
- **React Router v6** — Client-side routing
- **TanStack Query v5** — Server state management with caching
- **Lucide React** — Icon library

### Route Structure
```
/                   → Dashboard (redirect)
/dashboard          → Dashboard (summary metrics + ranked leads)
/icp                → ICP Definition (create/edit target profile)
/leads              → Lead Table (search, filter, sort, paginate)
/leads/:id          → Lead Detail (score breakdown, signals, explanation)
```

### Component Architecture
```
App
├── Layout
│   ├── Sidebar (navigation)
│   └── MainContent
│       ├── Dashboard
│       │   ├── MetricCards (total, A-tier, B-tier, review)
│       │   ├── ICPIndicator
│       │   └── TopLeadsTable
│       ├── ICPForm
│       │   ├── IndustrySelect
│       │   ├── RevenueRange
│       │   ├── EmployeeRange
│       │   └── LocationSelect
│       ├── LeadTable
│       │   ├── SearchBar
│       │   ├── FilterBar (priority tier)
│       │   ├── SortableTable
│       │   ├── PriorityBadge
│       │   ├── SignalIndicators
│       │   └── Pagination
│       └── LeadDetail
│           ├── CompanyInfo
│           ├── ContactInfo
│           ├── ScoreDisplay (large ring/gauge)
│           ├── ScoreBreakdown (factor bars)
│           ├── DealSignals (visual checklist)
│           ├── WhyThisLead (explanation text)
│           └── RecommendedAction
├── LoadingState
├── EmptyState
└── ErrorState
```

### State Management
- **Server state**: TanStack Query handles all API data fetching, caching, and invalidation
- **Local UI state**: React useState for filters, search terms, form inputs
- **No global state library** — unnecessary for this scope

### API Service Layer
A thin TypeScript service layer wraps fetch calls:
```typescript
// api/leads.ts
export const getLeads = (params: LeadQueryParams) => fetch(...)
export const getLead = (id: string) => fetch(...)
export const analyzeLeads = () => fetch(...)
export const explainLead = (id: string) => fetch(...)

// api/icp.ts
export const getICP = () => fetch(...)
export const createICP = (data: ICPInput) => fetch(...)
```

---

## Backend Architecture

### Stack
- **Node.js** — Runtime
- **Express** — HTTP framework
- **TypeScript** — Type safety
- **Mongoose** — MongoDB ODM
- **Zod** — Request validation
- **cors** — Cross-origin support
- **dotenv** — Environment configuration

### Directory Structure
```
server/
├── src/
│   ├── index.ts              # Entry point, Express app setup
│   ├── config/
│   │   └── database.ts       # MongoDB connection
│   ├── models/
│   │   ├── Lead.ts           # Lead schema + model
│   │   └── ICP.ts            # ICP schema + model
│   ├── routes/
│   │   ├── leads.ts          # Lead endpoints
│   │   └── icp.ts            # ICP endpoints
│   ├── services/
│   │   ├── scoring.ts        # ⭐ Core scoring engine
│   │   ├── signals.ts        # Deal signal detection
│   │   └── ai.ts             # AI explanation (with fallback)
│   ├── middleware/
│   │   ├── validation.ts     # Zod validation middleware
│   │   └── errorHandler.ts   # Consistent error responses
│   ├── seed/
│   │   └── data.ts           # Realistic fictional company data
│   └── types/
│       └── index.ts          # Shared TypeScript interfaces
├── tests/
│   └── scoring.test.ts       # Unit tests for scoring engine
├── package.json
├── tsconfig.json
└── .env.example
```

### Request Flow
```
Incoming Request
    ↓
Express Router (route matching)
    ↓
Zod Validation Middleware (schema validation)
    ↓
Controller Logic (in route handler)
    ↓
Service Layer (scoring, signals, AI)
    ↓
Mongoose Model (database operations)
    ↓
Response (JSON with consistent structure)
    ↓
Error Handler Middleware (catches any unhandled errors)
```

---

## Database Architecture

### MongoDB Collections

#### `leads` Collection
```javascript
{
  _id: ObjectId,
  companyName: String,          // "Meridian SaaS Solutions"
  website: String,              // "https://meridiansaas.com"
  industry: String,             // "SaaS / Software"
  location: String,             // "Austin, TX"
  revenue: Number,              // 4200000 (annual, in dollars)
  employees: Number,            // 35
  foundedYear: Number,          // 2018
  description: String,          // Brief company description
  contact: {
    name: String,               // "Sarah Chen"
    title: String,              // "CEO & Founder"
    email: String,              // "sarah@meridiansaas.com"
    linkedin: String            // "linkedin.com/in/sarahchen"
  },
  signals: {
    revenueFit: Number,         // 0-1 (computed)
    industryFit: Number,        // 0-1 (computed)
    employeeFit: Number,        // 0-1 (computed)
    growthSignal: Number,       // 0-1 (computed)
    dataConfidence: Number      // 0-1 (computed)
  },
  score: Number,                // 0-100 (computed)
  priority: String,             // "A" | "B" | "C" | "D"
  scoreReasons: [String],       // ["Revenue ($4.2M) is within target range", ...]
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ score: -1 }` — Sort by score descending
- `{ priority: 1 }` — Filter by priority tier
- `{ industry: 1 }` — Filter by industry
- `{ companyName: "text" }` — Text search

#### `icps` Collection
```javascript
{
  _id: ObjectId,
  name: String,                 // "Default Acquisition Profile"
  industries: [String],         // ["SaaS / Software", "IT Services"]
  minRevenue: Number,           // 1000000
  maxRevenue: Number,           // 10000000
  minEmployees: Number,         // 10
  maxEmployees: Number,         // 100
  locations: [String],          // ["United States", "Canada"]
  isActive: Boolean,            // true (only one active at a time)
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Design

### Endpoints

| Method | Path | Purpose | Response |
|---|---|---|---|
| `GET` | `/api/leads` | List leads with pagination, search, filter, sort | `{ leads: Lead[], total: number, page: number }` |
| `GET` | `/api/leads/:id` | Get single lead detail | `{ lead: Lead }` |
| `POST` | `/api/leads/analyze` | Re-score all leads against active ICP | `{ scored: number, message: string }` |
| `POST` | `/api/leads/:id/explain` | Generate AI explanation for lead | `{ explanation: string }` |
| `GET` | `/api/icp` | Get active ICP | `{ icp: ICP \| null }` |
| `POST` | `/api/icp` | Create or update ICP | `{ icp: ICP }` |
| `GET` | `/api/dashboard` | Dashboard summary metrics | `{ total, aCount, bCount, cCount, dCount, topLeads }` |

### Query Parameters for `GET /api/leads`

| Param | Type | Default | Example |
|---|---|---|---|
| `page` | number | 1 | `?page=2` |
| `limit` | number | 20 | `?limit=10` |
| `search` | string | — | `?search=meridian` |
| `priority` | string | — | `?priority=A` |
| `industry` | string | — | `?industry=SaaS` |
| `sortBy` | string | `score` | `?sortBy=revenue` |
| `sortOrder` | string | `desc` | `?sortOrder=asc` |

### Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [{ "field": "minRevenue", "message": "Must be a positive number" }]
  }
}
```

---

## Scoring Flow

The scoring engine is the intellectual core of the product. It must be:
- **Deterministic** — same inputs always produce the same score
- **Explainable** — every score comes with human-readable reasons
- **Testable** — pure functions with no side effects
- **Configurable** — weights can be adjusted without code changes

### Algorithm

```
Score = Σ (factor_value × factor_weight) × 100

Factors:
  revenueFit     × 0.25  (25 points max)
  industryFit    × 0.20  (20 points max)
  employeeFit    × 0.20  (20 points max)
  growthSignal   × 0.20  (20 points max)
  dataConfidence × 0.15  (15 points max)
                   ────
  Total:           1.00  (100 points max)
```

### Factor Calculations

**Revenue Fit (0–1):**
- 1.0 if revenue is within ICP's [minRevenue, maxRevenue]
- Decays linearly to 0.0 as distance from range increases
- 0.3 if revenue data is missing (penalize but don't exclude)

**Industry Fit (0–1):**
- 1.0 if exact match to an ICP industry
- 0.5 if partial match (related industry)
- 0.0 if no match

**Employee Fit (0–1):**
- 1.0 if employee count is within ICP's [minEmployees, maxEmployees]
- Decays linearly to 0.0 as distance increases
- 0.3 if employee data is missing

**Growth Signal (0–1):**
- Based on company age, employee count trajectory, revenue indicators
- Heuristic: younger company + higher revenue = stronger growth signal
- Example: Founded 2020, $5M revenue, 40 employees → strong growth

**Data Confidence (0–1):**
- Based on completeness of available data fields
- Full profile (name, email, linkedin, revenue, employees, industry, website) = 1.0
- Missing fields reduce confidence proportionally

### Priority Classification

| Score Range | Priority | Label |
|---|---|---|
| 90–100 | A | High Priority |
| 75–89 | B | Good Candidate |
| 60–74 | C | Review |
| 0–59 | D | Low Priority |

### Score Reasons Generation

Each factor generates a human-readable reason:
```
Revenue ($4.2M) is within target range ($1M–$10M) → +25/25
Industry (SaaS / Software) matches ICP criteria → +20/20
Employee count (35) is within target range (10–100) → +20/20
Company shows moderate growth signals (founded 2018, 35 employees) → +15/20
High data completeness (6/7 fields available) → +12/15
───────────────────────────────────────────
Total: 92/100 — Priority A (High Priority)
```

---

## AI Flow

### Purpose
AI is used **only** for generating natural-language recommendations. The core scoring is deterministic and never depends on AI.

### Flow
```
User clicks "Generate Recommendation" on Lead Detail
    ↓
Client sends POST /api/leads/:id/explain
    ↓
Server assembles structured context:
  - Lead data (company, revenue, employees, industry)
  - Score breakdown (all factor values and reasons)
  - ICP criteria
  - Deal signals
    ↓
If AI API key available:
  → Send structured prompt to AI API
  → Return natural-language recommendation
    ↓
If AI API key unavailable OR AI call fails:
  → Generate deterministic template-based explanation
  → "This company appears to be a [priority] acquisition candidate
     because [top 3 score reasons joined with 'and']."
    ↓
Response: { explanation: string, source: "ai" | "deterministic" }
```

### Key Principle
> **AI failure must never break the product.** The deterministic fallback always works.

---

## Deployment Architecture

### Target
```
Frontend → Vercel (static build)
Backend  → Render / Railway (Node.js service)
Database → MongoDB Atlas (free tier)
```

### Local Development
```
client/  → Vite dev server (port 5173)
server/  → Express dev server (port 3001)
MongoDB  → Atlas connection string in .env
```

### Environment Variables
```bash
# Server
PORT=3001
MONGODB_URI=mongodb+srv://...
NODE_ENV=development
AI_API_KEY=          # Optional — app works without it
AI_API_URL=          # Optional — endpoint for AI calls

# Client
VITE_API_URL=http://localhost:3001/api
```

---

## Performance Approach

| Technique | Where | Why |
|---|---|---|
| **MongoDB indexes** | `score`, `priority`, `industry`, text on `companyName` | Fast sorting, filtering, search |
| **Server-side pagination** | `GET /api/leads` | Don't send entire dataset to client |
| **Server-side filtering** | Query params → MongoDB query | Reduce payload size |
| **TanStack Query caching** | Client | Avoid redundant API calls |
| **Debounced search** | Client search input (300ms) | Reduce server load during typing |
| **Selective re-fetching** | Query invalidation after ICP save | Only re-fetch when data changes |

---

## Security Approach

| Concern | Mitigation |
|---|---|
| Input validation | Zod schemas on all incoming requests |
| Secrets exposure | `.env` files, never committed to git |
| Error leakage | Error handler strips stack traces in production |
| MongoDB injection | Mongoose parameterized queries |
| XSS | React auto-escapes output |
| CORS | Configured to allow only expected origins |

---

## Trade-offs

| Decision | Chose | Over | Why |
|---|---|---|---|
| Pre-seeded data | ✅ Realistic fictional dataset | Live scraping | Demonstrates the intelligence workflow without spending time on scraping infrastructure |
| Single ICP | ✅ One active ICP | Multiple ICPs | Simplifies UX and reduces engineering time; demonstrates the concept |
| Monorepo | ✅ `/client` + `/server` in one repo | Separate repos | Easier to clone, understand, and review |
| MongoDB | ✅ Document store | PostgreSQL | Better fit for flexible lead schemas; matches assignment spec |
| Deterministic scoring | ✅ Weighted formula | ML model | Explainable, testable, no training data needed |
| Optional AI | ✅ Fallback-first | AI-dependent | Product must work without API keys |
| Tailwind | ✅ Utility CSS | Component library | Fast to iterate, assignment-recommended |
| Dark theme | ✅ Professional B2B aesthetic | Light theme | Matches SaaSquatch's visual language; feels premium |
