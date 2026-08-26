# SnapSpend 💸

**An AI-powered personal expense tracker.** Snap a photo of a receipt and let Gemini read it, ask questions about your spending in plain English, and keep an eye on your monthly budget with a mood-aware dashboard — all built with React, Redux Toolkit, Firebase, and Google's Gemini API.

🔗 **[Live Demo](https://snapspend-71ef5.web.app)** &nbsp;•&nbsp; 📦 **[Repository](https://github.com/Anu1606-dev/SnapSpend)** 

---

## Overview

SnapSpend is a full-stack expense tracking web app that goes beyond manual data entry. Instead of typing every purchase by hand, users can photograph a receipt and have Gemini's vision model extract the merchant, amount, date, and category automatically — with a confirm/edit step so nothing gets saved without the user's approval. A built-in AI chat assistant answers natural-language questions like *"how much did I spend on food last month?"* using **real function calling**, not text parsing or guesswork — every answer is grounded in the user's actual Firestore data.

Built solo, end-to-end: authentication, data modeling, security rules, AI integration, state management, responsive UI, dark mode, and production deployment.

## ✨ Features

**Core**
- 🔐 **Authentication** — Firebase email/password auth with persistent sessions
- ✍️ **Manual expense entry** — amount, merchant, category, payment method, location, date, notes
- 📷 **Receipt scanning** — photo upload → Gemini vision extracts structured data → user confirms/edits before saving
- ✨ **AI auto-categorization** — Gemini classifies expenses into one of 7 categories using constrained (enum) structured output — never an invalid category
- 📋 **Expense list** — filterable by category and date range, with inline edit and delete
- 📊 **Dashboard** — monthly totals, month-over-month comparison, category breakdown (pie chart), and a 6-month spending trend (bar chart)
- 💬 **AI chat** — ask spending questions in natural language; Gemini calls real functions against live Firestore data and cites how many transactions backed each answer

**Beyond the core scope**
- 🐷 **Budget & Savings tracker** — set a monthly income/budget, and get a pace-based "mood" indicator (on track / overspending / etc.) that compares actual spend-so-far against time-elapsed in the month, not just a flat percentage
- 👤 **User profiles** — name and avatar color, reflected across the app
- 🌗 **Dark/light theme** — manually toggled, fully custom color palette (not a generic Tailwind dark mode swap), persisted across sessions
- 📱 **Fully responsive** — sidebar navigation on desktop, bottom tab bar with a quick-action menu on mobile

## 🧠 How the AI actually works

This isn't a thin wrapper around a chat widget — two distinct Gemini capabilities are used deliberately for different jobs:

**1. Structured extraction (receipt scanning + categorization)**
Receipt images and merchant names are sent to Gemini with a strict JSON schema (`responseSchema`) and an `enum` constraint on the category field. Gemini is *mathematically guaranteed* to return one of the app's 7 valid categories — never a made-up value — because Google's structured output feature enforces the schema, not just a prompt instruction.

**2. Function calling (AI chat)**
The chat assistant is given two tool definitions — `getExpenseSummary` and `listExpenses` — and a system instruction telling it to always call a tool before answering. When the user asks a question, Gemini decides which tool to call and with what arguments (e.g. computing the actual date range for "last month" itself); the app executes that function **locally against already-fetched Firestore data**, and returns the result to Gemini, which then writes the final answer. Gemini never sees or touches the raw database — it only ever receives computed results, the same way it would call an internal API in production.

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite |
| Routing | React Router (nested routes, protected layouts) |
| State management | Redux Toolkit (async thunks) |
| Styling | Tailwind CSS v4 (custom `@theme` design tokens for dark mode) |
| Icons | lucide-react |
| Charts | Recharts |
| Auth & Database | Firebase Authentication, Cloud Firestore |
| AI | Google Gemini API (`@google/genai`) — vision, structured output, function calling |
| Hosting | Firebase Hosting |

## 📸 Screenshots

*Add screenshots or a short screen recording here — this section sells the project before anyone reads a line of code. A shot of the Dashboard, the receipt-scan confirm screen, and the AI chat in action cover the most visually compelling features.*

## 🚀 Getting Started

### Prerequisites
- Node.js 20.19+ or 22.12+
- A Firebase project (Authentication + Firestore enabled)
- A Gemini API key ([aistudio.google.com](https://aistudio.google.com))

### Installation

```bash
git clone <https://github.com/Anu1606-dev/SnapSpend.git>
cd snapspend
npm install
```

### Environment variables

Create a `.env` file in the project root:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_GEMINI_API_KEY=
```

### Firestore security rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /expenses/{expenseId} {
      allow read, update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
    match /budgets/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /profiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Run locally

```bash
npm run dev
```

### Build & deploy

```bash
npm run build
firebase deploy --only hosting
```

## 📁 Project Structure

```
src/
├── components/       # Shared UI: layout shell, nav, protected routes
├── features/         # Redux Toolkit slices (auth, expenses, budget, profile)
├── hooks/            # useAuthListener, useIsDarkMode
├── pages/            # One component per route
├── services/         # firebase.js, gemini.js (all external API calls live here)
├── store/            # Redux store config
├── utils/            # Calculations, constants, date helpers
├── App.jsx           # Route definitions
├── main.jsx          # Entry point, theme init
└── index.css         # Tailwind + design tokens
```

## 🔒 Security notes

- Every Firestore collection is scoped per-user via security rules — verified server-side, not just hidden in the UI.
- The Gemini API key is restricted to the Gemini API only (no access to other Google Cloud services on the same key).
- No secrets are committed to version control (`.env` is git-ignored).

## 🗺 Roadmap

- [ ] Store the actual receipt image (Cloud Storage) alongside extracted data
- [ ] Password reset / forgot-password flow
- [ ] Migrate to TypeScript
- [ ] Automated tests (unit + integration)
- [ ] Multi-currency support

## 📄 License

MIT — feel free to fork and adapt.

## 👤 Author

*Anushka Sarkar* — [GitHub](https://github.com/Anu1606-dev) • [LinkedIn](https://www.linkedin.com/in/anushka-sarkar-07b2502b9/) • [Portfolio](#)