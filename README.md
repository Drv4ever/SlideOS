# SlideOS

SlideOS is a full-stack AI-assisted presentation builder. Users describe a topic in plain language, get a fully designed deck, then edit, reorder, remix, present, export and share it — all in the browser.

**What you can do today:**

- Generate a structured, designed deck from a prompt (slide count, text density, tone, audience, scenario are all tunable).
- Edit in two surfaces: the **Outline Editor** (quick heading/bullet edits) and the **Visual Editor** (drag blocks, change fonts/colors, per-slide fills, speaker notes).
- Redesign the whole deck or a single slide with AI (**Remix**).
- Drag to reorder slides, undo/redo (Ctrl+Z/Y), and rely on **autosave** so edits are never lost.
- Export **PPTX** (pptxgenjs) or **PDF** (browser print, one 16:9 slide per page).
- Share any deck via a public, read-only link.
- Pick from 12 curated themes and 7 instant (no-LLM) templates.

This repository is a monorepo:

- `frontend/` — React 18 + Vite client
- `backend/` — Node.js + Express + MongoDB API

---

## Core Architecture (System Design)

### High-level flow

```text
                         ┌─────────────────────────────────────────────┐
                         │                 FRONTEND (Vite)              │
                         │  Landing → Generator → Preview → View → Share│
                         │            │  ▲                 │            │
                         │   local editor state (slides)   │  render     │
                         │   undo/autosave hooks           ▼            │
                         │            │            Design Engine        │
                         └────────────┼─────────────────────┬───────────┘
                                      │ HTTP/JSON           │  layout descriptions
                                      ▼                     ▼
                         ┌──────────────────────────────────────┐
                         │               BACKEND (Express)       │
                         │  routes → auth → controllers          │
                         │     → services → Mongo (Mongoose)     │
                         └──────────────────────────────────────┘
```

### Backend

Layered `Route → Middleware → Controller → Service` pipeline.

| Layer | Files | Responsibility |
|---|---|---|
| Entry | `server.js`, `app.js` | Express setup, CORS, 10 MB JSON body, route mounting, MongoDB connect, `/api/health` |
| Routes | `src/routes/*.route.js` | Declare endpoints and which middleware/controller handles them |
| Middleware | `src/middleware/middleware.js` | JWT verification (protected routes) |
| Controllers | `src/controllers/*.controller.js` | Parse/validate requests, orchestrate services, shape responses |
| Services | `src/services/groq.service.js`, `image.service.js` | External integrations (Groq LLM, Unsplash) |
| Utils | `src/utils/themeBrief.js`, `fakeaigeneration.js`, `validaters/generate.validator.js` | Prompt briefs, deterministic fallback generator, input validation |
| Models | `models/users.js`, `models/presentation.js` | Mongoose schemas (users, decks) |

**Key endpoint groups** (`BASE_URL = http://localhost:5000/api`):

- `POST /auth/register`, `POST /auth/login`, `POST /auth/google` — email/password (bcrypt + JWT) and Google OAuth (ID-token verification).
- `POST /generate` (auth) — AI deck generation (below).
- `POST|GET /presentations`, `GET|PUT|DELETE /presentations/:id` (auth) — owned decks only.
- `GET /presentations/share/:id` (**no auth**) — public read-only deck for share links.
- `GET /health` — liveness.

### The generation pipeline (single source of truth)

```text
POST /api/generate  { prompt, slides, textAmount, theme, tone, audience, scenario, mode }
        │
        ▼
validateGenerateInput ── rejects invalid slides/textAmount/theme
        │
        ▼
generateWithGroq(mode="generate" | "remix")
        ├─ builds system prompt: FIELD_DEFINITIONS + LAYOUT_RULES + theme brief + count constraint
        ├─ Groq chat.completions (JSON mode, adaptive max_tokens = 1024 + slides*256)
        └─ normalizeSlideCount(deck, slides)  ← the count is ENFORCED here:
             pads short decks / trims extras / renumbers slideNumber 1..N
        │
        ▼  (on API/JSON failure → fakeAIGenerate fallback, flagged `fallback: true`)
        ▼
fetchSlideImages(slides)  ── Unsplash random photo per imageKeyword (100 ms throttle)
        │
        ▼
JSON: { title, slides: [{ slideNumber, heading, content[], imageKeyword, layout }], images[] }
```

The **requested slide count is the contract**: even if the LLM under-generates, `normalizeSlideCount` guarantees the deck is exactly N slides.

### The design engine (shared render truth)

The frontend renders slides through one engine so **every surface looks identical**:

```text
                slide data (outline OR editor format)
                           │
        designedLayouts.computeSlideLayout(slide, theme, { index, total })
                           │  layout description (heading/bullets/cards/stat/images)
                           ▼
      ┌─────────────┬──────────────┬──────────────┬───────────────┐
      ▼             ▼              ▼              ▼               ▼
  SlideStage    MiniSlide       DesignCanvas   Present overlay  PPTX export
  (Preview)   (thumbnails)      (editor)        (fullscreen)   (pptxLayouts)
```

- `extractSlideRoles` normalizes any schema (`{heading, content[]}` OR `{elements[]}`) to canonical roles.
- Edits write back through `updateSlideRole` / `design.overrides` (per-block font/size/position), so the canvas, thumbnails, present mode, and PPTX all stay in sync.
- `themes.js` (12 curated themes) and `deckTemplates.js` (7 instant templates) are the frontend catalogs; `themeBrief.js` mirrors them server-side so the LLM prompt gets palette/fonts/mood even when only a theme id is sent.

### Editor state management

- **Undo/Redo** — `hooks/useUndoHistory.js`: a drop-in state wrapper with a bounded history stack (`setValue` accepts plain values or updaters).
- **Autosave** — `hooks/useAutosave.js`: debounced PUT (1.8 s idle) driven by a `signature` string; skips unchanged decks, flushes on navigation, `saveNow()` for manual save / Ctrl+S.
- Slide reorder uses framer-motion `Reorder.Group` in the visual editor thumbnails; deletes are recoverable via a toast **Undo** action.

### Data model

```text
User {
  email, passwordHash, name, googleId?, createdAt
}
Presentation {
  userId -> User, title, prompt, theme, slidesCount,
  content: { slides[], editorSlides[], slideNotes[], textAmount, fonts },
  isPublic: Boolean (default false),
  timestamps
}
```

- Decks are owned and access-controlled (403 for other users).
- Public sharing only exposes `title`, `theme`, `content`, `slidesCount`, `updatedAt` — never `userId`.
- The 10 MB body limit and embedded base64 images mean very large image-heavy decks can grow DB size.

---

## Tech Stack

### Frontend

- React 18 + Vite, React Router 7
- Tailwind CSS v4 + shadcn-style `components/ui/*`
- framer-motion (layout, reorder, scroll reveal)
- `react-rnd` (drag blocks in the visual editor), `pptxgenjs` (PPTX export)
- `sonner` (toasts), lucide-react (icons)

### Backend

- Node.js (ES Modules), Express
- MongoDB + Mongoose
- JWT (`jsonwebtoken`) + bcrypt password hashing
- Google OAuth ID-token verification
- External AI: **Groq** (`openai/gpt-oss-120b`, JSON mode) for generation/remix, **Unsplash** for deck imagery, **Pollinations** (keyless) for on-demand AI images in the editor

### Tests

- Backend: Jest (`backend/__tests__`) — validators, controllers, services, integration, fallback utils.
- Frontend: Vitest + Testing Library (`frontend/src/__tests__`) — hooks (undo history, autosave), utils (remix, themes, layouts, slideModel, etc.).

---

## Project Structure

```text
SlideOS/
├─ backend/
│  ├─ app.js / server.js
│  ├─ models/
│  │  ├─ users.js
│  │  └─ presentation.js
│  ├─ src/
│  │  ├─ controllers/
│  │  │  ├─ login.controller.js
│  │  │  ├─ generate.controller.js
│  │  │  └─ presentation.controller.js
│  │  ├─ middleware/middleware.js
│  │  ├─ routes/{auth,generate,presentation}.route.js
│  │  ├─ services/{groq,image}.service.js
│  │  └─ utils/{themeBrief,fakeaigeneration,generate.validator}.js
│  └─ __tests__/            # Jest suites
│
├─ frontend/
│  ├─ src/
│  │  ├─ App.jsx / main.jsx  # routing (incl. public /share/:id)
│  │  ├─ pages/              # LandingPage, PresentationGenerator, PresentationPreview,
│  │  │                      # PresentationView, MyPresentations, ShareView
│  │  ├─ components/         # SlideStage, DesignCanvas, ShareDialog, Header, AppSidebar,
│  │  │                      # AuthForm, LandingScrollSections, ui/*
│  │  ├─ hooks/              # useUndoHistory, useAutosave
│  │  ├─ utils/              # designedLayouts, pptxLayouts, pptxExport, remix, themes,
│  │  │                      # slideModel, deckTemplates, imageGen, ...
│  │  ├─ services/presentationService.js
│  │  └─ __tests__/          # Vitest suites
│  └─ package.json
└─ README.md
```

---

## Prerequisites

- Node.js 18+
- npm
- MongoDB running locally (default `mongodb://127.0.0.1:27017/slideOS`)

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/slideOS
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
GROQ_API_KEY=your_groq_api_key            # required for AI generation
UNSPLASH_ACCESS_KEY=your_unsplash_key      # optional; slides render without it
VITE_GOOGLE_CLIENT_ID=your_google_client_id # optional; for Google OAuth
```

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id  # optional; enables Google sign-in button
```

## Installation

### 1) Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:5000`.

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## API Overview

Base URL: `http://localhost:5000/api`

### Auth

- `POST /auth/register` — `{ email, password, name? }`
- `POST /auth/login` — `{ email, password }`
- `POST /auth/google` — `{ credential }` (Google ID token)

### Generation

- `POST /generate` (auth) — `{ prompt, slides, textAmount, theme, tone?, audience?, scenario?, mode? }`
  - `mode: "generate"` (default) or `"remix"` (redesign an existing deck)
  - Response: `{ success, data: { title, theme, slides[], images[], fallback? } }`
  - `fallback: true` means the LLM was unavailable and the deterministic starter generator was used.

### Presentations (all protected except share)

- `POST /presentations` — save a new deck
- `GET /presentations` — list my decks (metadata)
- `GET /presentations/:id` — fetch one deck
- `PUT /presentations/:id` — update (title, theme, slidesCount, content, `isPublic`)
- `DELETE /presentations/:id` — delete
- `GET /presentations/share/:id` — **public**, read-only deck (no auth)

Protected endpoints use:

```http
Authorization: Bearer <token>
```

## User Flow

1. User registers/logs in (email/password or Google); JWT stored in `localStorage`.
2. On the landing page, a typed topic carries over into the generator after login.
3. User picks a theme, slide count, text density, tone, audience and scenario, then generates.
4. The deck is saved automatically and opens in the **Outline Editor**.
5. User edits headings/bullets, reorders cards, or opens the **Visual Editor** for block-level design.
6. Edits are autosaved (1.8 s debounce); **Save**/**Ctrl+S** forces an immediate save; mistakes are undoable.
7. User can **Redesign** with AI, generate AI images per slide, add speaker notes, or reorder by drag.
8. User exports to **PPTX** or **PDF**, or presents full-screen (arrow keys).
9. User can make the deck public and copy a **share link** (`/share/:id`) — viewers present without an account.
10. Decks can be reopened, searched, renamed, or deleted from **My Presentations**.

## Notes and Limits

- Backend body limit is `10mb` (`backend/app.js`); large base64 image payloads can hit this.
- Local image uploads become base64 data-URLs stored in MongoDB — heavy decks bloat the DB.
- Unsplash is best-effort: missing `UNSPLASH_ACCESS_KEY` results in slides without photos (graceful).
- If Groq is down/rate-limited, generation falls back to a topic-aware starter deck flagged `fallback: true` so the user is never blocked.

## Troubleshooting

### `Invalid or expired token`

- Clear the old token from browser storage, log in again.
- Keep `JWT_SECRET` stable and restart the backend.

### `PayloadTooLargeError: request entity too large`

- Increase the JSON body limit in `backend/app.js`.
- Reduce embedded image/base64 payload sizes.

### CORS/API errors from the frontend

- Ensure the backend runs on port `5000` and `VITE_API_BASE_URL` is correct.
- Restart the frontend after env changes.

## Scripts

### Backend

- `npm run dev` — run with Node watch mode
- `npm run start` — run server
- `npm test` — Jest suite (78 tests)

### Frontend

- `npm run dev` — start Vite dev server
- `npm run build` — production build
- `npm run test` — Vitest suite (131 tests)

---

Made for learning purposes.
