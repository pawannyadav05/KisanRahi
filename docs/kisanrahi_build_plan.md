# KisanRahi — Complete Build Plan (Full-Stack, 6-Person Team, PWA)
**Goal: WIN. Not impress on paper — win in front of judges with a live, working, demoable product.**

This is the single source of truth. It's written to be handed directly to an AI coding agent (Antigravity, Claude Code, Cursor, or whichever tool a teammate prefers) — every section that matters for building is literal and copy-pasteable, not just descriptive.

---

## 1. The One-Line Pitch (memorize this)

> "KisanRahi lets a farmer list produce by voice on WhatsApp, automatically pools it with nearby farmers to hit truck-load volumes, prices it fairly using live government mandi data, and matches it to a bulk buyer — cutting out the middlemen who currently take 30-50% margins."

Say this exact sentence in the first 15 seconds of your pitch. Judges decide a lot in the first minute.

---

## 2. What We Are Building

KisanRahi is a digital bridge between village farmers and city buyers, delivered as an installable **Progressive Web App** — it has to work like a real app on a farmer's phone, including offline, not just a website.

**The village-tomato-to-city journey:**

1. A farmer with 200kg of tomatoes — too little to sell profitably alone — sends a WhatsApp voice note.
2. The system turns that voice note into a structured listing.
3. The listing is auto-assigned to the nearest village hub and pooled with nearby farmers until it hits truckload size.
4. A hub manager grades the pooled produce with an AI camera check — Grade A/B/C — so no middleman can claim "poor quality" to cut the price.
5. The system checks the real government mandi price for that crop that day.
6. A buyer — bulk institutional or a city housing society — sees the graded, priced, pooled lot and orders it.
7. A driver picks up from each hub and drops the consolidated load at an urban point.
8. The order is confirmed and each farmer gets a payout notification — fast and fair.
9. A ministry-level dashboard shows farmer earnings, consumer savings, and transit loss in real time.

Every step maps to one of the 6 full-stack verticals below. If a teammate doesn't understand why their piece exists in this story, raise it before building starts — not after.

---

## 3. The Shared Contract (Pawan builds this FIRST — everyone else waits for it)

This is what lets 6 people build in parallel without blocking each other. It is not a discussion — it's three files, written in full below, ready to paste into a repo. **Pawan builds and pushes these in the first 90 minutes. Nobody else writes app code until this exists on `main`.**

### a) `types/kisanrahi.ts` — the data contract (frontend and backend both obey this exactly)

```ts
// KisanRahi — Shared Data Contract
// Every view and every backend module MUST use these exact shapes.
// Do not modify after hour 1.5 without flagging the team chat first.

export type Language = 'en' | 'hi';
export type UserRole = 'farmer' | 'hub_manager' | 'bulk_buyer' | 'retail_consumer' | 'driver' | 'doca_admin';
export type ListingStatus = 'Listed' | 'Graded' | 'Pooled' | 'Paid';

export interface CropListing {
  id: string;
  farmerId: string;
  farmerName: string;
  crop: string;
  qtyKg: number;
  location: { lat: number; lng: number; villageName: string };
  status: ListingStatus;
  createdAt: string; // ISO timestamp
}

export interface GradeResult {
  listingId: string;
  grade: 'A' | 'B' | 'C';
  uniformityPct: number;
  damagePct: number;
  gradedAt: string;
}

export interface PooledLot {
  hubId: string;
  hubName: string;
  totalKg: number;
  capacityKg: number;
  listings: CropListing[];
  status: 'Filling' | 'Ready' | 'Dispatched';
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerType: 'B2B' | 'B2C';
  lotId: string;
  qtyKg: number;
  pricePerKg: number;
  escrowStatus: 'Pending' | 'Locked' | 'Released';
}

export interface PayoutRecord {
  id: string;
  farmerId: string;
  orderId: string;
  amountInr: number;
  status: 'Pending' | 'Confirmed' | 'Failed';
  gatewayRef: string;       // real payment gateway transaction/payout ID (test-mode)
  gatewayProvider: 'razorpayx' | 'razorpay_test';
  confirmedAt?: string;
}

export interface RouteStop {
  hubId: string;
  hubName: string;
  pickupKg: number;
  status: 'Completed' | 'Pending' | 'EnRoute';
  eta: string;
}

export interface AdminMetrics {
  farmerRealizationPct: number;
  consumerPriceReductionPct: number;
  transitLossPct: number;
  activeHubs: number;
  activeRuns: number;
}
```

### b) `mock-data.ts` — shared fake backend (every screen must run off this before real logic exists)

```ts
import type { CropListing, GradeResult, PooledLot, Order, PayoutRecord, RouteStop, AdminMetrics } from './types/kisanrahi';

export const mockListings: CropListing[] = [
  { id: 'L1', farmerId: 'F1', farmerName: 'Ramesh Yadav', crop: 'Tomato', qtyKg: 200, location: { lat: 24.95, lng: 84.03, villageName: 'Sasaram' }, status: 'Pooled', createdAt: new Date().toISOString() },
  { id: 'L2', farmerId: 'F2', farmerName: 'Sunita Devi', crop: 'Tomato', qtyKg: 300, location: { lat: 24.96, lng: 84.02, villageName: 'Sasaram' }, status: 'Pooled', createdAt: new Date().toISOString() },
  { id: 'L3', farmerId: 'F3', farmerName: 'Bimal Singh', crop: 'Tomato', qtyKg: 250, location: { lat: 24.94, lng: 84.04, villageName: 'Sasaram' }, status: 'Graded', createdAt: new Date().toISOString() },
];

export const mockGrades: GradeResult[] = [
  { listingId: 'L1', grade: 'A', uniformityPct: 92, damagePct: 3, gradedAt: new Date().toISOString() },
];

export const mockPooledLots: PooledLot[] = [
  { hubId: 'H1', hubName: 'Sasaram Hub #3', totalKg: 1850, capacityKg: 2500, listings: mockListings, status: 'Filling' },
];

export const mockOrders: Order[] = [
  { id: 'O1', buyerId: 'B1', buyerName: 'Patna Caterers Co-op', buyerType: 'B2B', lotId: 'H1', qtyKg: 750, pricePerKg: 16.2, escrowStatus: 'Locked' },
];

export const mockPayouts: PayoutRecord[] = [
  { id: 'P1', farmerId: 'F1', orderId: 'O1', amountInr: 18000, status: 'Confirmed', gatewayRef: 'pout_test_88213', gatewayProvider: 'razorpayx', confirmedAt: new Date().toISOString() },
];

export const mockRoute: RouteStop[] = [
  { hubId: 'H1', hubName: 'Sasaram PACS', pickupKg: 800, status: 'Completed', eta: '02:10 AM' },
  { hubId: 'H2', hubName: 'Dehri FPO', pickupKg: 1100, status: 'Pending', eta: '02:50 AM' },
];

export const mockAdminMetrics: AdminMetrics = {
  farmerRealizationPct: 76.4,
  consumerPriceReductionPct: 28.2,
  transitLossPct: 2.8,
  activeHubs: 412,
  activeRuns: 86,
};
```

### c) Design tokens — `tailwind.config.ts` colors block

```ts
colors: {
  navy: '#0b2545',      // primary header / national
  navyLight: '#133b5c',
  green: '#138808',      // tricolor accent
  greenDark: '#15803d',
  saffron: '#f97316',    // tricolor accent
  saffronDark: '#ea580c',
  canvas: '#f1f5f9',     // background
  card: '#ffffff',
  border: '#cbd5e1',
}
```
Typography: `Inter`, `Noto Sans Devanagari`, `system-ui`. All text must hit WCAG 2.1 AA contrast.

### d) Shared components — build once, import everywhere

- `<GovHeader />` — "भारत सरकार | Government of India" / "उपभोक्ता मामले विभाग | DoCA" bar, with Language Switcher (EN/हिंदी), Text Size Adjuster (A-/A/A+), High Contrast toggle, and Offline Sync indicator (`● ऑनलाइन (Online)` / `○ ऑफलाइन सुरक्षित (Offline Cached)`).
- `<RoleSwitcher />` — top demo toolbar toggling between all 6 views live, for judges.

**Nobody edits `types/kisanrahi.ts`, `mock-data.ts`, or the Tailwind color tokens after hour 1.5 without flagging it in the team chat first.**

---

## 4. PWA Requirements (non-negotiable — this is a Progressive Web App, not a website)

| Requirement | How |
|---|---|
| Installable | `manifest.json` with app name, icons (192px/512px), `display: "standalone"`, theme color `#0b2545` |
| Offline support | Service worker (use `@ducanh2912/next-pwa` — it supports Next.js App Router) caching the app shell + last-fetched data, so the Farmer view still opens on a spotty rural connection |
| Offline sync indicator | `<GovHeader />`'s online/offline badge reads `navigator.onLine` plus a service-worker cache-status check, and flips between "● ऑनलाइन (Online)" and "○ ऑफलाइन सुरक्षित (Offline Cached)" |
| Queued actions | If a farmer records a voice listing while offline, queue it in IndexedDB and auto-submit when connection returns — say this is "planned" if not fully wired by the demo, but the offline badge itself must work live |
| Mobile-first | Farmer view specifically must be tested on an actual phone browser, not just a resized laptop window — min touch target 52px per spec |

**Minimum bar for the demo:** the app installs to a home screen, the offline indicator genuinely flips when you kill your wifi on stage, and the app shell still renders offline. Full offline queueing is a stretch goal, not a demo blocker.

---

## 4a. Real Payment Integration — Abhay's build plan (test-mode, not production money movement)

"Real integration" means actual API calls to a real payment gateway, not a UI that fakes a success screen. It does **not** mean moving real money on stage — no hackathon team should be doing that, and a live production Payment Aggregator license isn't obtainable in a hackathon window anyway.

1. **Use Razorpay's (or RazorpayX's) test/sandbox mode** — free test API keys, real request/response cycle, no actual money moves, but every call hits their real API and returns real gateway transaction IDs.
2. **Build a `createPayout(order: Order)` service function** that calls the test-mode API to simulate a payout to the farmer's UPI ID, and writes back a `PayoutRecord` with the real `gatewayRef` returned by the sandbox.
3. **Handle both outcomes honestly** — test mode lets you trigger both success and failure responses; show both states in the UI (Confirmed / Failed) rather than only ever showing success, since judges may ask what a failure looks like.
4. **This is the module everything else depends on** — Pawan's Farmer view payment card, Vani's dispatch status, and Piyush's B2B order flow all read from `PayoutRecord`. Build and merge this early so those three aren't blocked waiting on it.

Say in the pitch, clearly: *"This is a real integration against Razorpay's test environment — actual API calls, actual transaction IDs — running in sandbox mode. Going live would mean switching to production keys under a licensed Payment Aggregator relationship, which is a compliance step, not an engineering one."* That sentence is the difference between "real integration" reading as credible versus reading as a claim you can't back up under questioning.

---

## 5. The 6 Full-Stack Verticals

| # | Person | Frontend View | Backend Module | Role Notes |
|---|---|---|---|---|
| 1 | **Pawan** | View A — Farmer | Module 1: WhatsApp/Voice Listing | **Also: Shared Foundation + Integration Lead.** Builds the contract (Section 3) first, merges everyone's branches at both checkpoints, owns the Role Switcher wiring. Heaviest load on the team — if the WhatsApp/voice integration eats too much time, hand the deep Twilio debugging to whoever finishes their own vertical first rather than letting it block the merge. |
| 2 | **Minhaj** | View E — 3PL Driver | Module 2: Pooling + Nearest-Hub Routing | Listings auto-cluster by nearest hub (haversine distance) → pooled lot forms → driver's run-sheet shows stop-by-stop pickup route |
| 3 | **Vani** | View B — FPO Hub Manager | Module 6: Dispatch Readiness & Gate Pass | Builds the logic that flips a `PooledLot` from `Filling` to `Ready` once it hits capacity and generates the "Dispatch Gate Pass" record. Her viewfinder panel consumes Abhay's `GradeResult` output and her consolidation meter consumes Minhaj's `PooledLot` output — she doesn't build either of those services herself, just renders and acts on them. |
| 4 | **Avinish** | View F — DoCA Admin | Module 4: Live Agmarknet Price Check | Pulls real government mandi price data → feeds the price-parity alert table on the admin dashboard and the price shown to buyers |
| 5 | **Piyush** | View C — Bulk Buyer | Module 5: Buyer Matching (B2B) | Buyer sees graded, priced, pooled lots in a catalog with the price-comparison table → books a consolidated consignment |
| 6 | **Abhay** | View D — Retail Consumer / RWA | Module 3: AI Crop Grading (stock classifier) + Module 5B: Buyer Matching (B2C) + **Module 7: Real Payment Integration** | Builds the Teachable Machine/TF.js grading service (feeds Vani's viewfinder), the B2C weekly-basket ordering flow for his own screen, and now the real payment integration end-to-end (see Section 6a and his agent prompt in Section 8) — this is the heaviest backend load after Pawan's, so he should build payment integration first since every other order-completing view depends on it working. |

**Note on ownership:** Payment moved off Vani and onto Abhay as a real integration, not a mock. Vani's Hub Manager view still needs *something* to react to once a payout lands (a status change on her dispatched lots), but she no longer owns the payment logic itself — Abhay's payment service is the single source of truth for payout state, consumed by Vani's, Pawan's, and Piyush's screens alike.

---

## 6. Full Tech Stack

| Layer | Tool | Why |
|---|---|---|
| Frontend framework | Next.js 14/15 (App Router), TypeScript, Tailwind CSS | Fast to scaffold, matches the gov-portal spec exactly |
| PWA layer | `@ducanh2912/next-pwa` (App Router compatible) | Service worker + manifest, minimal config |
| UI components | Shadcn UI (Tabs, Cards, Dialogs, Progress, Badges, Alert) | Accessible primitives, no design-from-scratch needed |
| Icons | Lucide-react (`Mic`, `Scale`, `Truck`, `ShieldCheck`, `Camera`, `FileText`) | Matches spec, consistent icon language |
| Map | Leaflet.js (free, no API key hassle) | Simple radius/hub clustering visual |
| Backend | Node.js + Express (or FastAPI if the team's stronger in Python) | Whichever the team already knows |
| Database | PostgreSQL (skip PostGIS — radius clustering in application code with basic lat/long math) | Overkill otherwise for a demo dataset |
| WhatsApp | Twilio WhatsApp Sandbox | Free, works in minutes, no business verification needed |
| Speech-to-text | Browser Web Speech API or OpenAI Whisper API | Whisper is a single API call, very reliable |
| Crop grading | Google Teachable Machine → exported TensorFlow.js model | No-code training in minutes, runs in-browser |
| Price data | Agmarknet / data.gov.in public API | Real, free, government-sourced |
| Routing logic | Haversine formula (plain code) | Simplified nearest-hub assignment, not OR-Tools |
| Payments | Razorpay / RazorpayX **test-mode API** — real API calls, sandbox credentials, no live money movement | Genuine integration for the demo without needing payment-aggregator licensing to go live |
| Hosting | Vercel (frontend) + Render (backend) | Free tier, deploys in minutes |

---

## 7. What to Explicitly NOT Build

- ❌ ONDC/Beckn integration — roadmap slide only
- ❌ Real-time bidding via Socket.io — unnecessary complexity
- ❌ Multi-language beyond Hindi + English — hardcode 2, say the rest is a config change
- ❌ Full OR-Tools CVRPTW solver — nearest-hub logic already demonstrates the idea
- ❌ Custom-trained YOLOv8 defect model — the Teachable Machine classifier is the honest v0
- ❌ Full offline action queueing — the offline *indicator* must work live; full queued-sync is a stretch goal only
- ❌ **Production payment aggregator licensing** — the payment integration itself is real (test-mode API), but going live under a licensed PA relationship is a compliance step outside hackathon scope

---

## 8. Agent-Ready Build Prompts (copy-paste one block per person into Antigravity, Claude Code, Cursor, or whichever tool that teammate uses)

Each block below is self-contained. Paste it into your AI coding tool as-is, after the shared contract (Section 3) already exists in the repo.

### Pawan — Foundation + Integration Lead + Farmer View + WhatsApp Listing

> Build a Next.js 14 App Router + TypeScript + Tailwind PWA called KisanRahi. First: set up `types/kisanrahi.ts` and `mock-data.ts` exactly as specified in the shared contract, plus a `tailwind.config.ts` with the KisanRahi color tokens (navy `#0b2545`, green `#138808`, saffron `#f97316`, canvas `#f1f5f9`). Build `<GovHeader />` (top bar: "भारत सरकार | Government of India", language switcher EN/हिंदी, text-size A-/A/A+ toggle, high-contrast toggle, online/offline indicator reading `navigator.onLine`) and `<RoleSwitcher />` (a toolbar that swaps which role's view is rendered). Set up the PWA layer with `@ducanh2912/next-pwa`, a `manifest.json`, and a service worker caching the app shell. Then build View A — Farmer: a mobile-first screen with min-52px touch targets, a floating action button with a mic icon that records a voice note (use the Web Speech API) and parses it into a `CropListing` (crop, qty, village) added to `mock-data.ts`'s listings array, a card list of "My Crop Batches" showing status steps Listed → Graded → Pooled → Paid, and a high-contrast "Payment Assurance Card" showing a confirmed `PayoutRecord` amount with a green checkmark and the real gateway reference (from Abhay's test-mode payment integration — consume the `PayoutRecord`, don't build payment logic here). All data must come from the shared types and mock data — do not invent new shapes.

### Minhaj — 3PL Driver View + Pooling & Hub Routing

> Using the existing `types/kisanrahi.ts` and `mock-data.ts` (do not modify them), build two things in a Next.js/TypeScript/Tailwind app: (1) a backend/service function that takes an array of `CropListing`s, computes distance to a hardcoded list of 3-4 hub coordinates using the haversine formula, assigns each listing to its nearest hub, and groups same-hub listings within a time window into a `PooledLot`; (2) View E — 3PL Driver: a trip-sheet screen showing truck registration and total assigned load, and a stop-by-stop list of `RouteStop`s (hub name, pickup kg, status Completed/Pending/EnRoute, ETA) with a "Scan Crate QR Code & Confirm Handoff" button that flips a stop's status. Use the Ashoka Navy/Green/Saffron design tokens and Shadcn Card/Badge/Progress components. Show a Leaflet map with hub markers and the pooled-lot fill level.

### Vani — Hub Manager View + Dispatch Readiness & Gate Pass

> Using the existing `types/kisanrahi.ts` and `mock-data.ts` (do not modify them), build View B — FPO Hub Manager in Next.js/TypeScript/Tailwind: a "Crate Inward" form (digital weighment input, crop-type dropdown), an "AI Camera Inspection Viewfinder" panel that displays a `GradeResult` (Uniformity %, Surface Damage %, Grade A/B/C badge) — this data comes from a grading service Abhay is building, so just consume a `GradeResult` object and render it, don't build the classifier yourself. Also build a "Truckload Consolidation Meter" progress bar showing `PooledLot.totalKg / PooledLot.capacityKg`. Separately, build the Dispatch Readiness service: a function that watches a `PooledLot` and flips its status from `Filling` to `Ready` once `totalKg` reaches `capacityKg`, and a "Generate Dispatch Gate Pass" button/action that produces a simple gate-pass record (hub, total weight, timestamp, destination) once the lot is `Ready`. Once Abhay's payment module confirms a payout for an order tied to a dispatched lot, reflect that status on this screen too — read from his `PayoutRecord`, don't build payment logic here. Use Shadcn Card/Progress/Badge components and the shared design tokens.

### Avinish — DoCA Admin View + Live Agmarknet Price Check

> Using the existing `types/kisanrahi.ts` and `mock-data.ts` (do not modify them), build View F — DoCA Admin in Next.js/TypeScript/Tailwind: a multi-metric dashboard rendering `AdminMetrics` (Farmer Realization %, Consumer Price Reduction %, Transit Loss %, Active Hubs, Active Runs) as stat cards, an "Agmarknet Mandi Price Parity Alert Table" flagging any crop where retail price exceeds 200% of farm-gate cost, and an escrow settlement status monitor with a dispute queue (a static list with a "Resolve" button that flips a status badge is enough). Separately, build a service function that fetches live mandi price data from the Agmarknet/data.gov.in public API for a given crop and returns a floor price — this feeds both this dashboard's price table and the price shown to buyers elsewhere in the app. Use Shadcn Table/Badge/Alert components and the shared design tokens.

### Piyush — Bulk Buyer View + B2B Buyer Matching

> Using the existing `types/kisanrahi.ts` and `mock-data.ts` (do not modify them), build View C — Bulk Institutional Buyer in Next.js/TypeScript/Tailwind: a wholesale lot catalog (Onion, Tomato, Potato, Pulses) built from `PooledLot` data, a price-transparency comparison table per lot showing APMC Mandi Wholesale Benchmark, KisanRahi Direct Sourced Price (with % savings), and Direct Farmer Share, and a "Book Consolidated Consignment (Min 100 kg)" action that creates an `Order` (buyerType: 'B2B') with an "Escrow Protected" stamp/badge. Use Shadcn Table/Card/Badge components and the shared design tokens.

### Abhay — Retail Consumer / RWA View + AI Crop Grading + B2C Matching + Real Payment Integration

> Using the existing `types/kisanrahi.ts` and `mock-data.ts` (do not modify them), build four things in Next.js/TypeScript/Tailwind — build the payment integration first since other teammates' screens depend on it:
>
> **(1) Real payment integration:** set up Razorpay/RazorpayX in **test/sandbox mode** (free test API keys). Write a `createPayout(order: Order)` service function that calls the test-mode API to simulate a UPI payout to a farmer, and writes back a `PayoutRecord` (with the real `gatewayRef` and `gatewayProvider` returned by the sandbox, status `Confirmed` or `Failed`) into `mock-data.ts`'s payouts array. Handle both success and failure responses from the sandbox — don't only wire up the happy path. Expose a small notification/toast component other views can trigger when a payout lands, since Pawan's Farmer view, Vani's Hub Manager view, and Piyush's Bulk Buyer view all read from this.
>
> **(2) AI Crop Grading service:** train a small image classifier in Google Teachable Machine (15-20 sample photos per grade class A/B/C), export as TensorFlow.js, and write a function that takes an uploaded photo and returns a `GradeResult` (uniformityPct, damagePct, grade) — this feeds Vani's Hub Manager viewfinder, so keep the function signature simple and well-documented.
>
> **(3) View D — Retail Consumer & RWA Societies:** a clean community order panel with a delivery-window banner ("अगला वितरण: शनिवार सुबह 7:00 बजे — cutoff in 14 hours"), pre-set weekly harvest packs (e.g. "10 kg Vegetable Society Combo — ₹240"), a society collection-point detail line, and an order action that creates an `Order` (buyerType: 'B2C') and calls the payment service from (1) once confirmed.
>
> Use Shadcn Card/Alert components and the shared design tokens. Since this is three real integrations for one person, build and merge the payment service before anything else — it's the one other teammates are blocked on.

---

## 9. Collaboration Mechanics

- **One shared GitHub repo.** `main` protected. Everyone branches as `feature/<name>` (e.g. `feature/pawan-farmer-foundation`).
- **Everyone uses their own AI tool** — Antigravity, Claude Code, Cursor, Copilot, whatever they're fastest with. The shared types, mock data, and design tokens are the only things that have to match, not the tool.
- **No continuous merging.** Merge only at the two fixed checkpoints below.
- **Each vertical is a self-contained folder** — `/components/roles/<role>/` for frontend, `/services/<module>/` for backend logic.

---

## 10. Timeline (36-hour hackathon assumption — adjust to your actual window)

| Time | Milestone |
|---|---|
| Hour 0–1.5 | Pawan builds the shared contract: types, mock data, design tokens, `<GovHeader />`, `<RoleSwitcher />`, PWA manifest + service worker skeleton. Everyone else reviews the spec and their agent prompt (Section 8) — not code yet. |
| Hour 1.5–2 | Shared contract pushed to `main`. All 5 others branch off and start building against mock data immediately, each running their Section 8 prompt through their own AI tool. |
| Hour 2–10 | Each person builds their full vertical end to end, using mock data where a cross-vertical dependency (like Vani's grading input) isn't ready yet. |
| Hour 10–12 | **Checkpoint 1:** everyone pushes their branch. Pawan merges all 6, wires the Role Switcher to the 6 real views, does a first end-to-end click-through. |
| Hour 12–18 | Sleep / buffer block. |
| Hour 18–24 | Cross-vertical wiring: Pawan's listings feed Minhaj's pooling, Minhaj's pooled lots feed Vani's dispatch meter, Abhay's grading service feeds Vani's viewfinder, graded lots feed Avinish's price data and Piyush/Abhay's catalogs, confirmed orders call Abhay's real payment service, and payout results feed back into Pawan's, Vani's, and Piyush's screens plus Avinish's admin metrics. |
| Hour 24–28 | **Checkpoint 2:** full integration test — every role, every view, switching live via the Role Switcher. Test the PWA offline indicator by actually killing wifi. Never show a broken view. |
| Hour 28–31 | Accessibility pass (text-size toggle, high-contrast toggle, WCAG AA contrast, real-phone check on the Farmer view), seed final realistic demo data. |
| Hour 31–33 | Polish, freeze the Role Switcher toolbar for presentation. |
| Hour 33–35 | Rehearse the full pitch and role-switch demo **out loud, twice, with the actual build.** |
| Hour 35–36 | Buffer for last-minute bugs. Final deploy freeze — do not touch code after this. |

**Rule: freeze feature work at least 1 hour before judging. A working simple demo beats a broken ambitious one every time.**

---

## 11. Demo Script

1. **Open on the problem** (10 sec): "A farmer with 250kg of tomatoes can't get a fair price alone — middlemen exploit that."
2. **Live-switch to Farmer view** — send a real WhatsApp voice note on stage, show it become a structured listing. Optionally kill wifi for a second to show the offline indicator flip.
3. **Switch to 3PL Driver view** — show the listing pooled and assigned to a hub on the route.
4. **Switch to Hub Manager view** — upload a produce photo, watch it get graded live. Say clearly: "This is a proof-of-concept classifier trained on a small sample set."
5. **Switch to Bulk Buyer or Retail Consumer view** — show the graded, priced lot, place an order. Mention the live Agmarknet price pull.
6. **Switch to Hub Manager or Farmer view again** — show the payout confirmation land, with a real gateway transaction reference on screen. Say clearly: "This is a real Razorpay test-mode integration — actual API calls, actual transaction IDs, running in sandbox. Going live under a licensed Payment Aggregator is a compliance step, not an engineering one."
7. **Switch to DoCA Admin view** — show the metrics move from the flow just run.
8. **Close with differentiation** (15 sec): vs e-NAM and ONDC.
9. **Roadmap slide** (5 sec): fine-tuned grading, full OR-Tools routing, ONDC, production payment aggregator licensing, full offline queueing — all "next."

---

## 12. Anticipated Judge Questions

| Question | Your Answer |
|---|---|
| "How is this different from e-NAM?" | e-NAM digitizes existing mandi trading; we solve pre-mandi aggregation. |
| "Is this data real or mocked?" | Pricing is real (Agmarknet API), payment is a real test-mode integration (Razorpay sandbox), grading is a proof-of-concept model — be honest module-by-module if asked. |
| "Is your grading model production-grade?" | No — proof-of-concept on a small sample set; production needs a larger dataset and fine-tuning. |
| "Why not a real routing optimizer?" | We built the hub-assignment logic a real solver would consume; full OR-Tools is a scaling exercise. |
| "Is this legally compliant for payments?" | The integration itself is real — Razorpay test-mode API, real transaction IDs, sandbox credentials. Going live with real money requires a licensed Payment Aggregator relationship, which is a compliance step we haven't taken, not a technical gap. |
| "Does it work offline?" | The app shell and offline indicator work live; full offline action queueing is roadmap. |

---

## 13. Slide Deck Structure (8 slides max)

1. Problem (cited stat) · 2. One-line pitch · 3. Flow diagram · 4. Live demo · 5. Tech stack · 6. Differentiation · 7. Roadmap · 8. Impact/ask

---

## 14. The One Rule That Matters Most

**Every single thing you show on stage must actually work when clicked, live.** A judge forgives a small scope. A judge does not forgive a broken demo or a caught exaggeration.
