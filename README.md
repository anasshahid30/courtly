# Courtly — AI-Powered Virtual Legal Practice Environment

> **Tagline:** Practice law before you practice law.  
> **Wordmark:** courtly.  
> **Jurisdiction:** England & Wales (Common Law)  
> **Category:** Virtual Legal Education & Trial Advocacy Simulation

---

## 🏛️ Executive Overview

**Courtly** is an immersive, voice-enabled virtual legal practice environment created for law students, aspiring advocates, clinical legal educators, and law schools.

Unlike traditional case-law lookup engines or generic chat assistants, Courtly provides **high-fidelity courtroom proceedings** with an active judicial bench (*The Hon. Justice Robert Vance*), adversarial opposing counsel (*Eleanor Davies KC*), witnesses, real-time evidentiary objections, exhibit tendering, and structured post-session judicial scorecards.

---

## 🚀 Key Features Across the 5 Core Pages

### 1. Homepage (`/`)
* **Advocacy Hero:** Dynamic voice preview teaser of the presiding judge delivering formal courtroom instructions.
* **10 Legal Practice Domains:** Business Law (Live), Contract Law (Live), Corporate Governance, Civil Litigation, Criminal Advocacy, Constitutional Law, Property Law, Family Law, Employment Law, and IP Law with status badges.
* **Feature Highlights:** Voice-First Interaction, Active Judicial Bench & Evidentiary Objections, and Judicial Rubric Scorecards.
* **Institutional Showcase:** Custom cohort moot assignments, automated grading rubrics, and clinical legal analytics for universities.
* **Onboarding & Auth Modals:** Role selection (Student vs Educator), jurisdiction calibration, practice goals, and interactive microphone testing.

### 2. Student Practice Dashboard (`/dashboard`)
* **Advocate Stats Strip:** Practice hours, advocate average score (e.g. 84% - First Class Honours), simulation completions, and daily practice streak.
* **Simulation Discovery:** Instant search, domain pills, and difficulty level filtering (`Beginner`, `Intermediate`, `Advanced`).
* **Interactive Simulation Cards:** Tags, estimated duration, learning objectives, and direct "Launch Proceeding" & "Case File" triggers.
* **Educator Portal Tab:** Cohort management (LLB 3rd Year Clinic), class submission distribution, and rubric analytics.
* **Platform & RAG Admin Tab:** Status of indexed statutes, chunking verification, and document ingestion studio.

### 3. Flagship Virtual Courtroom (`/courtroom`)
* **Case Setup Mode:**
  * Complete case docket (*Henderson v. Caldwell Trading Ltd*, Claim No. CL-2025-000842).
  * Role selection (Claimant Counsel vs Defendant Counsel).
  * Difficulty & judicial interruption frequency configuration.
  * Microphone & Web Audio speech synthesis toggle.
  * Case dossier & exhibit inspection.
* **Live Courtroom Mode:**
  * **3D-Styled Courtroom Layout:** Bench cards for the Presiding Judge, Opposing Counsel, Witness Box, and Student Advocate podium with active speaking glow and waveform animations.
  * **6 Procedural Stages:**
    1. Preliminary Submissions
    2. Claimant Opening Submissions
    3. Examination-in-Chief & Evidence Tender
    4. Defense Cross-Examination & Objection Handling
    5. Closing Submissions & Mitigation
    6. Judicial Determination & Oral Ruling
  * **Evidentiary Objections:** Intervene with objections on grounds of *Leading the Witness*, *Hearsay (Civil Evidence Act 1995)*, *Relevance*, *Speculation*, or *Argumentative / Badgering* with live judicial rulings.
  * **Evidence Tender Dock:** Formally tender Exhibit A (Distribution Agreement) and Exhibit B (Signed Inspection Release) on the court record.
  * **Live Searchable Transcript:** Timestamped dialogue, speaker tags, and key moment markers.
  * **Audio Synthesis:** Real-time Web Speech API voice synthesis delivering spoken dialogue.

### 4. Legal Research Workspace (`/workspace`)
* **Statutory & Precedent Reader:** Full-text access to *Sale of Goods Act 1979*, *Unfair Contract Terms Act 1977*, and *Hadley v Baxendale [1854]*.
* **AI Research Assistant:** Chat with verified Common Law authorities, statutory extraction, and zero-hallucination compliance.
* **RAG Document Ingestion:** Drag-and-drop ingestion of problem sets and PDF briefs with extraction telemetry.

### 5. Performance & Analytics (`/performance`)
* **Overall Advocate Rating:** 84/100 (First Class Honours / High Distinction).
* **5-Competency Radar Chart:** Legal Reasoning (88%), Evidence Handling (85%), Oral Fluency (79%), Procedural Compliance (92%), Bench Responsiveness (85%).
* **Longitudinal Growth Chart:** Progress tracking across simulated sessions.
* **Judicial Critique Rubric:** Specific praise and recommendations from Justice Vance.
* **Key Moments Timeline:** Timestamped judicial milestones with score impact.
* **Export PDF Report:** One-click evaluation report generation.

---

## 🛠️ Technology Stack & Architecture

* **Framework:** Next.js 16 (App Router, Turbopack, React 19)
* **Styling & Design System:** TailwindCSS v4 with Courtly color palette (Navy `#14232D`, Steel Blue `#356C91`, Warm Gold `#C7A979`, Amber, Emerald)
* **Icons & UI:** Lucide React, Radix/Base UI components, Sonner toasts
* **Charts:** Recharts (Radar, Bar, Cartesian coordinates)
* **State Management:** Zustand with localStorage persistence
* **Speech Engine:** Web Speech API (`SpeechSynthesisUtterance`) with voice modulation by courtroom role
* **Type Safety:** 100% strict TypeScript models and interfaces

---

## 📁 Project Directory Structure

```
src/
├── app/
│   ├── layout.tsx         # Root layout with typography, Navbar, Footer, Sonner Toaster
│   ├── page.tsx           # 1. Homepage & Marketing
│   ├── dashboard/
│   │   └── page.tsx       # 2. Dashboard, Practice Hub, Educator & Admin Tabs
│   ├── courtroom/
│   │   └── page.tsx       # 3. Flagship Virtual Courtroom Proceeding Interface
│   ├── workspace/
│   │   └── page.tsx       # 4. Legal Research Workspace & Document Reader
│   └── performance/
│       └── page.tsx       # 5. Performance, Radar Analytics & Judicial Scorecard
├── components/
│   ├── layout/            # Navbar, Footer
│   ├── auth/              # AuthModal, OnboardingModal
│   ├── courtroom/         # ObjectionModal
│   ├── legal/             # EvidenceViewerModal, CaseFileModal
│   └── ui/                # Reusable design system components
├── services/
│   ├── interfaces.ts      # Typed service interfaces (FastAPI ready)
│   └── mock/              # Mock service implementations with localStorage
├── data/
│   ├── mock-data.ts       # Structured cases, statutes, evidence, rubrics
│   └── courtroom-script.ts# 6-stage procedural dialogue engine
├── lib/
│   ├── store.ts           # Zustand global state store
│   ├── audio.ts           # Speech synthesis & voice visualizer utility
│   └── utils.ts           # Classnames and formatting helpers
└── types/
    └── index.ts           # Comprehensive TypeScript model definitions
```

---

## ⚡ Getting Started Locally

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Build and test production bundle
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔌 Backend Integration (Future FastAPI API)

All service calls in `src/services/` implement the typed `AuthService`, `SimulationService`, `CourtroomService`, `ResearchService`, `PerformanceService`, and `NotificationService` interfaces in `src/services/interfaces.ts`.

To switch from the client mock services to a live FastAPI / Python backend:
1. Set `NEXT_PUBLIC_API_URL=https://api.courtly.legal` in `.env.local`.
2. Replace `src/services/mock/index.ts` with HTTP client calls using `fetch` or `axios`.
3. Connect the live courtroom voice WebSocket streaming endpoint to `src/app/courtroom/page.tsx`.

---

## ⚖️ Academic Integrity & Pedagogy

Courtly simulations are designed for clinical legal training. All statutory citations (*Sale of Goods Act 1979*, *Unfair Contract Terms Act 1977*) and judicial precedents (*Hadley v Baxendale [1854]*) are authentic and grounded in English Common Law jurisprudence.
