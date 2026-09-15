# 🌾 KisanRahi — Collaborative Team Setup & AI Prompts

> **One-Line Pitch:**  
> *"KisanRahi lets a farmer list produce by voice on WhatsApp, automatically pools it with nearby farmers to hit truck-load volumes, prices it fairly using live government mandi data, and matches it to a bulk buyer — cutting out the middlemen who currently take 30-50% margins."*

---

## 🚀 Quick Setup (For Teammates Cloning the Repository)

1. **Clone the repository:**
   ```bash
   git clone <YOUR_GITHUB_REPO_URL>
   cd KisanRahi
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Create your feature branch:**
   ```bash
   git checkout -b feature/<your-name>-<your-module>
   # Example: git checkout -b feature/vani-hub-manager
   ```

---

## 🛡️ Shared Data Contract & Architecture

All teammates **MUST** adhere strictly to the shared contract defined in:
- 📄 [`types/kisanrahi.ts`](file:///Users/pawankumaryadav/Desktop/KisanRahi/types/kisanrahi.ts) — Data shapes (`CropListing`, `GradeResult`, `PooledLot`, `Order`, `PayoutRecord`, `RouteStop`, `AdminMetrics`).
- 📄 [`lib/mock-data.ts`](file:///Users/pawankumaryadav/Desktop/KisanRahi/lib/mock-data.ts) — Shared mock objects.
- 🎨 [`tailwind.config.ts`](file:///Users/pawankumaryadav/Desktop/KisanRahi/tailwind.config.ts) — Color tokens (`navy`, `navyLight`, `green`, `saffron`, `canvas`).

> ⚠️ **Rule:** Do not edit `types/kisanrahi.ts` or `lib/mock-data.ts` without notifying the team chat first.

---

## 🤖 Teammate AI Prompt Instructions

You can use **any AI coding tool** of your choice (Antigravity, Claude Code, Cursor, Copilot, ChatGPT, etc.).

---

### 📋 Section A: Generic Copy-Paste Prompt Template (For Any Teammate & Any Module)

> **Instructions:** Copy the box below, replace `[YOUR_NAME]`, `[YOUR_MODULE_NAME]`, and `[MODULE_DETAILS]` with your details, and paste it into your AI coding tool!

```markdown
Hello AI! I am [YOUR_NAME] working on the KisanRahi project.
I am assigned to build the [YOUR_MODULE_NAME] module.

Please read the following shared files first to understand our data contract and project structure:
1. `types/kisanrahi.ts` — Data interfaces (CropListing, GradeResult, PooledLot, Order, PayoutRecord, RouteStop, AdminMetrics)
2. `lib/mock-data.ts` — Initial mock datasets
3. `tailwind.config.ts` — Ashoka color tokens (navy #0b2545, green #138808, saffron #f97316, canvas #f1f5f9)

My specific module responsibility is:
[MODULE_DETAILS / SPECIFICATION]

Requirements for code generation:
- Write TypeScript code in Next.js App Router format.
- Store my frontend view inside `components/roles/[my-role-name]/` (e.g. `components/roles/farmer/`).
- Store my backend logic or service functions inside `services/[my-module-name]/`.
- Do NOT alter `types/kisanrahi.ts` schema unless explicitly requested.
- Use Lucide-react icons and Tailwind CSS matching the Ashoka color tokens.
- Ensure the UI is mobile-friendly, accessible, and clean.

Let's begin building my module step-by-step!
```

---

### 👥 Section B: Pre-Configured Persona Prompts (Ready to Copy-Paste)

Below are the tailored, copy-pasteable AI prompts for each of the 6 team verticals:

---

#### 1️⃣ Pawan — Farmer View + Voice Listing (View A)
> **Branch:** `feature/pawan-farmer`  
> **Copy & Paste into AI Tool:**
> ```markdown
> Using the existing `types/kisanrahi.ts` and `lib/mock-data.ts` (do not modify them), build View A — Farmer View in `components/roles/farmer/FarmerView.tsx`. Build a mobile-first screen with min-52px touch targets, a floating action button with a mic icon that records a voice note (using Web Speech API or simulated speech-to-text) and parses it into a `CropListing` (crop, qty, village) added to `mock-data.ts`'s listings array, a card list of "My Crop Batches" showing status steps Listed → Graded → Pooled → Paid, and a high-contrast "Payment Assurance Card" showing a confirmed `PayoutRecord` amount with a green checkmark and the real gateway reference (from Abhay's test-mode payment integration — consume the `PayoutRecord`, don't build payment logic here). Use the Ashoka design tokens (`navy`, `green`, `saffron`, `canvas`) and Lucide-react icons.
> ```

---

#### 2️⃣ Minhaj — 3PL Driver View + Pooling & Hub Routing (View E)
> **Branch:** `feature/minhaj-driver`  
> **Copy & Paste into AI Tool:**
> ```markdown
> Using the existing `types/kisanrahi.ts` and `lib/mock-data.ts` (do not modify them), build two things:
> (1) A service function in `services/routing/hub-assignment.ts` that takes an array of `CropListing`s, computes distance to a list of hub coordinates using the haversine formula, assigns listings to nearest hub, and groups same-hub listings into a `PooledLot`.
> (2) View E — 3PL Driver in `components/roles/driver/DriverView.tsx`: a trip-sheet screen showing truck registration and total assigned load, and a stop-by-stop list of `RouteStop`s (hub name, pickup kg, status Completed/Pending/EnRoute, ETA) with a "Scan Crate QR Code & Confirm Handoff" button that flips a stop's status. Use Ashoka design tokens and Lucide icons.
> ```

---

#### 3️⃣ Vani — Hub Manager View + Dispatch Readiness & Gate Pass (View B)
> **Branch:** `feature/vani-hub-manager`  
> **Copy & Paste into AI Tool:**
> ```markdown
> Using the existing `types/kisanrahi.ts` and `lib/mock-data.ts` (do not modify them), build View B — FPO Hub Manager in `components/roles/hub-manager/HubManagerView.tsx`:
> - A "Crate Inward" form (digital weighment input, crop-type dropdown).
> - An "AI Camera Inspection Viewfinder" panel that displays a `GradeResult` (Uniformity %, Surface Damage %, Grade A/B/C badge) — consume a `GradeResult` object and render it.
> - A "Truckload Consolidation Meter" progress bar showing `PooledLot.totalKg / PooledLot.capacityKg`.
> - A Dispatch Readiness function in `services/hub/dispatch.ts` that watches a `PooledLot` and flips its status from `Filling` to `Ready` once `totalKg` reaches `capacityKg`, and a "Generate Dispatch Gate Pass" button that produces a gate pass record. Reflect payment confirmations from Abhay's `PayoutRecord`.
> ```

---

#### 4️⃣ Avinish — DoCA Admin View + Live Agmarknet Price Check (View F)
> **Branch:** `feature/avinish-doca-admin`  
> **Copy & Paste into AI Tool:**
> ```markdown
> Using the existing `types/kisanrahi.ts` and `lib/mock-data.ts` (do not modify them), build View F — DoCA Admin in `components/roles/doca-admin/DoCAAdminView.tsx`:
> - A multi-metric dashboard rendering `AdminMetrics` (Farmer Realization %, Consumer Price Reduction %, Transit Loss %, Active Hubs, Active Runs) as stat cards.
> - An "Agmarknet Mandi Price Parity Alert Table" flagging any crop where retail price exceeds 200% of farm-gate cost.
> - An escrow settlement status monitor with a dispute queue ("Resolve" button that flips status badge).
> - A service function in `services/agmarknet/price-check.ts` that fetches live mandi price data from the Agmarknet/data.gov.in public API for a given crop and returns a floor price.
> ```

---

#### 5️⃣ Piyush — Bulk Buyer View + B2B Buyer Matching (View C)
> **Branch:** `feature/piyush-bulk-buyer`  
> **Copy & Paste into AI Tool:**
> ```markdown
> Using the existing `types/kisanrahi.ts` and `lib/mock-data.ts` (do not modify them), build View C — Bulk Institutional Buyer in `components/roles/bulk-buyer/BulkBuyerView.tsx`:
> - A wholesale lot catalog (Onion, Tomato, Potato, Pulses) built from `PooledLot` data.
> - A price-transparency comparison table per lot showing APMC Mandi Wholesale Benchmark, KisanRahi Direct Sourced Price (% savings), and Direct Farmer Share.
> - A "Book Consolidated Consignment (Min 100 kg)" action that creates an `Order` (buyerType: 'B2B') with an "Escrow Protected" stamp/badge.
> ```

---

#### 6️⃣ Abhay — Retail Consumer / RWA View + AI Crop Grading + Real Payments (View D)
> **Branch:** `feature/abhay-retail-payments`  
> **Copy & Paste into AI Tool:**
> ```markdown
> Using the existing `types/kisanrahi.ts` and `lib/mock-data.ts` (do not modify them), build four things:
> (1) Real payment integration in `services/payment/payout.ts`: set up Razorpay/RazorpayX in test/sandbox mode. Write a `createPayout(order: Order)` service function calling the test-mode API to simulate a UPI payout to a farmer, writing back a `PayoutRecord` (with real `gatewayRef`, status `Confirmed` or `Failed`) into `mock-data.ts`'s payouts array.
> (2) AI Crop Grading service in `services/grading/classifier.ts`: TensorFlow.js / Teachable Machine classifier returning a `GradeResult` (uniformityPct, damagePct, grade) from an uploaded image.
> (3) View D — Retail Consumer & RWA Societies in `components/roles/retail-consumer/RetailConsumerView.tsx`: a community order panel with delivery window banner ("अगला वितरण: शनिवार सुबह 7:00 बजे"), weekly harvest packs, society collection point info, and order action calling the payment service from (1).
> ```

---

## 🤝 Team Workflow & Merging Rules

1. **Commit your changes locally:**
   ```bash
   git add .
   git commit -m "feat(module): completed assigned vertical features"
   ```
2. **Push your feature branch to GitHub:**
   ```bash
   git push origin feature/<your-name>-<your-module>
   ```
3. **Open a Pull Request** against `main` for integration review!
