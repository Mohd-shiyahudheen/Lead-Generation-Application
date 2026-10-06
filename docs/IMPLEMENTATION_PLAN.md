# Implementation Plan — SaaSquatch Signal

## Project Overview

**Product:** SaaSquatch Signal  
**Positioning:** "From thousands of companies to the companies worth pursuing first."  
**Constraint:** 5-hour engineering budget  

---

## Feature Scope

### PRIMARY: Explainable Lead Scoring & Prioritization

| Feature | Status | Priority |
|---|---|---|
| ICP Definition (create/edit target profile) | ✅ In scope | P0 |
| Lead dataset with realistic fictional companies | ✅ In scope | P0 |
| Deterministic scoring engine (0–100) | ✅ In scope | P0 |
| Priority classification (A/B/C/D tiers) | ✅ In scope | P0 |
| Score breakdown with per-factor explanation | ✅ In scope | P0 |
| Dashboard with summary metrics | ✅ In scope | P0 |
| Lead table with search, filter, sort | ✅ In scope | P0 |
| Lead detail view with score explanation | ✅ In scope | P0 |
| Loading / empty / error states | ✅ In scope | P0 |

### SECONDARY: Deal Signals

| Feature | Status | Priority |
|---|---|---|
| Visual signal indicators per lead | ✅ In scope | P1 |
| "Why this lead?" deterministic explanation | ✅ In scope | P1 |
| AI-generated recommendation (with fallback) | ✅ In scope | P2 |

---

## Time Budget

| Phase | Time | Activities |
|---|---|---|
| **Phase 1: Planning** | 0:00–0:30 | Reference analysis, product decision, docs |
| **Phase 2: Architecture** | 0:30–1:00 | UX wireframe, tech architecture, schema design |
| **Phase 3: Backend** | 1:00–2:00 | Express server, MongoDB models, scoring engine, API routes, seed data |
| **Phase 4: Frontend Core** | 2:00–3:15 | React setup, Dashboard, ICP form, Lead table with search/filter/sort |
| **Phase 5: Lead Details** | 3:15–4:15 | Lead detail view, score breakdown, deal signals, "Why this lead?" |
| **Phase 6: Polish** | 4:15–4:40 | Error/loading/empty states, responsive design, visual polish |
| **Phase 7: Finalize** | 4:40–5:00 | Scoring tests, README, deployment prep, final review |

---

## Tasks

### Phase 1: Planning (0:00–0:30) ✅
- [x] Inspect workspace
- [x] Study SaaSquatch reference product
- [x] Document product analysis
- [x] Define problem statement
- [x] Create implementation plan
- [x] Create architecture document

### Phase 2: Architecture (0:30–1:00)
- [ ] Initialize monorepo structure (`/server` + `/client`)
- [ ] Set up Express + TypeScript backend
- [ ] Set up React + TypeScript + Tailwind frontend
- [ ] Configure environment variables
- [ ] Define database schemas (Lead, ICP)

### Phase 3: Backend (1:00–2:00)
- [ ] Create Lead model (Mongoose)
- [ ] Create ICP model (Mongoose)
- [ ] Build scoring engine module (`/server/services/scoring.ts`)
  - [ ] `calculateRevenueFit(lead, icp)` → 0–1
  - [ ] `calculateIndustryFit(lead, icp)` → 0–1
  - [ ] `calculateEmployeeFit(lead, icp)` → 0–1
  - [ ] `calculateGrowthSignal(lead)` → 0–1
  - [ ] `calculateDataConfidence(lead)` → 0–1
  - [ ] `computeScore(factors)` → 0–100
  - [ ] `classifyPriority(score)` → A/B/C/D
  - [ ] `generateScoreReasons(factors, lead, icp)` → string[]
- [ ] Write unit tests for scoring engine
- [ ] Build API routes:
  - [ ] `GET /api/leads` — list with pagination, search, filter, sort
  - [ ] `GET /api/leads/:id` — single lead detail
  - [ ] `POST /api/leads/analyze` — re-score all leads against active ICP
  - [ ] `POST /api/leads/:id/explain` — AI explanation (with fallback)
  - [ ] `GET /api/icp` — get active ICP
  - [ ] `POST /api/icp` — create/update ICP
- [ ] Add Zod validation for all inputs
- [ ] Create seed script with 25–30 realistic fictional companies
- [ ] Consistent error handling middleware

### Phase 4: Frontend Core (2:00–3:15)
- [ ] Set up React app with Vite + TypeScript + Tailwind
- [ ] Install and configure TanStack Query
- [ ] Create API service layer
- [ ] Build app shell (sidebar navigation, responsive layout)
- [ ] Build Dashboard page:
  - [ ] Summary cards (Total leads, A-tier, B-tier, Needs Review)
  - [ ] Active ICP indicator
  - [ ] Priority distribution visualization
  - [ ] Quick-access ranked lead list
- [ ] Build ICP Definition page:
  - [ ] Form: industries (multi-select), revenue range (min/max), employee range (min/max), locations
  - [ ] Save ICP → triggers re-scoring
  - [ ] Current ICP display
- [ ] Build Lead Table:
  - [ ] Columns: Company, Revenue, Employees, Industry, Score, Priority, Signals, Action
  - [ ] Server-side search (debounced)
  - [ ] Filter by priority tier
  - [ ] Sort by score, revenue, employees, name
  - [ ] Priority badge with color coding
  - [ ] Pagination

### Phase 5: Lead Details & Polish (3:15–4:15)
- [ ] Build Lead Detail page:
  - [ ] Company information card
  - [ ] Contact information card
  - [ ] Score display (large, prominent)
  - [ ] Score breakdown (visual bars for each factor)
  - [ ] Deal signals (checkmark-style indicators)
  - [ ] "Why this lead?" section with deterministic explanation
  - [ ] "Generate AI Recommendation" button (optional, with fallback)
  - [ ] Recommended action section
- [ ] Loading skeletons for all data fetches
- [ ] Empty state for no leads / no ICP defined
- [ ] Error states with retry

### Phase 6: Visual Polish (4:15–4:40)
- [ ] Responsive layout (mobile-friendly)
- [ ] Consistent typography and spacing
- [ ] Priority color system (A=green, B=blue, C=amber, D=gray)
- [ ] Subtle transitions on page navigation
- [ ] Score progress ring / visual indicator
- [ ] Professional data table styling
- [ ] Dark theme (consistent with B2B SaaS aesthetic)

### Phase 7: Finalize (4:40–5:00)
- [ ] Run and verify scoring unit tests
- [ ] Verify all API endpoints work
- [ ] Write comprehensive README.md
- [ ] Document environment variables
- [ ] Prepare .env.example files
- [ ] Add .gitignore
- [ ] Verify no secrets committed
- [ ] Verify demo can run with `npm install && npm run dev`

---

## Dependencies

| Dependency | Purpose |
|---|---|
| **express** | HTTP server |
| **mongoose** | MongoDB ODM |
| **zod** | Input validation |
| **cors** | CORS handling |
| **dotenv** | Environment config |
| **react** | UI framework |
| **react-router-dom** | Client-side routing |
| **@tanstack/react-query** | Server state management |
| **tailwindcss** | Utility CSS |
| **lucide-react** | Icon library |
| **vitest** | Testing |

---

## Definition of Done

- [ ] User can define an ICP (industry, revenue range, employee range, locations)
- [ ] User can view a dashboard with summary metrics and ranked leads
- [ ] User can search, filter, and sort leads
- [ ] Every lead has a deterministic, explainable score (0–100)
- [ ] Priority tier (A/B/C/D) is visually obvious in every context
- [ ] Lead detail page shows full score breakdown with per-factor explanation
- [ ] Deal signals are visually displayed per lead
- [ ] "Why this lead?" provides a natural-language explanation
- [ ] Application handles loading, error, and empty states
- [ ] Backend validates all inputs with Zod
- [ ] Database stores and retrieves leads and ICP
- [ ] Scoring engine has unit tests
- [ ] UI is responsive
- [ ] README is complete with setup instructions
- [ ] Architecture is documented
- [ ] Environment variables are documented
- [ ] No secrets are committed
- [ ] Application runs from `npm install && npm run dev`

---

## Explicitly Out of Scope

| Feature | Reason |
|---|---|
| User authentication | Not essential to demonstrate scoring workflow |
| Web scraping / data ingestion | Time-intensive; doesn't demonstrate business insight |
| Real external API integrations | Requires API keys and rate limiting setup |
| CRM functionality | Too broad; dilutes the focused product decision |
| Email/outreach automation | Already exists in SaaSquatch enterprise tier |
| Multi-tenant architecture | Unnecessary for a prototype |
| Kubernetes / microservices | Explicitly forbidden by assignment |
| Complex deployment pipelines | CI/CD is not the focus |
| Real-time data updates | WebSocket infrastructure is overkill |
| Chatbot / conversational AI | "AI for AI's sake" — adds no business value here |
| Export to CSV/Excel | Nice-to-have but not core to scoring demonstration |
| Multiple ICP profiles | Single active ICP is sufficient for demo |
