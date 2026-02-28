# SlideOS

SlideOS is an AI-assisted presentation builder where users can:
- generate slide outlines from prompts,
- edit outlines,
- open a full visual slide editor,
- export PPTX,
- save presentations to MongoDB,
- reopen and continue editing later.

This repository is a full-stack monorepo:
- `frontend/` -> React + Vite client
- `backend/` -> Node.js + Express + MongoDB API

## Features

- JWT authentication (`register`, `login`)
- Protected slide generation endpoint
- AI generation with fallback logic
- Saved presentations per user
- Open previously saved presentations
- Update saved presentations after editing
- PPTX export from editor view
- Light-theme only UI

## Tech Stack

### Frontend
- React 18
- Vite
- React Router
- Tailwind CSS (plus custom UI components)
- `react-rnd` (drag/resize slide elements)
- `pptxgenjs` (PowerPoint export)

### Backend
- Node.js (ES Modules)
- Express
- MongoDB + Mongoose
- JWT (`jsonwebtoken`)
- Password hashing (`bcryptjs`)
- CORS + body parsing

## Project Structure

```text
SlideOS/
├─ backend/
│  ├─ app.js
│  ├─ server.js
│  ├─ models/
│  │  ├─ users.js
│  │  └─ presentation.js
│  └─ src/
│     ├─ controllers/
│     │  ├─ login.controller.js
│     │  ├─ generate.controller.js
│     │  └─ presentation.controller.js
│     ├─ middleware/
│     │  └─ middleware.js
│     ├─ routes/
│     │  ├─ auth.route.js
│     │  ├─ generate.route.js
│     │  └─ presentation.route.js
│     ├─ services/gemini.service.js
│     ├─ utils/fakeaigeneration.js
│     └─ validaters/generate.validator.js
│
├─ frontend/
│  ├─ src/
│  │  ├─ App.jsx
│  │  ├─ main.jsx
│  │  ├─ components/
│  │  │  ├─ AuthForm.jsx
│  │  │  ├─ Header.jsx
│  │  │  ├─ Footer.jsx
│  │  │  ├─ PresentationGenerator.jsx
│  │  │  └─ ui/*
│  │  ├─ pages/
│  │  │  ├─ MyPresentations.jsx
│  │  │  ├─ PresentationPreview.jsx
│  │  │  └─ PresentationView.jsx
│  │  ├─ providers/ThemeProvider.jsx
│  │  ├─ services/presentationService.js
│  │  └─ styles/*
│  └─ package.json
└─ README.md
```

## Prerequisites

- Node.js 18+
- npm
- MongoDB running locally (default used: `mongodb://127.0.0.1:27017/slideOS`)

## Environment Variables

### Backend (`backend/.env`)

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/slideOS
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=optional_if_using_gemini
```

### Frontend (`frontend/.env`)

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Installation

### 1) Backend

```bash
cd backend
npm install
npm run start
```

Backend should run on `http://localhost:5000`.

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend should run on `http://localhost:5173`.

## API Overview

Base URL: `http://localhost:5000/api`

### Auth
- `POST /auth/register`
- `POST /auth/login`

### Generation
- `POST /generate` (protected)

### Presentations
- `POST /presentations` (protected) -> save new
- `GET /presentations` (protected) -> list mine
- `GET /presentations/:id` (protected) -> fetch one
- `PUT /presentations/:id` (protected) -> update one

Use header for protected endpoints:

```http
Authorization: Bearer <token>
```

## User Flow

1. User registers/logs in.
2. Frontend stores JWT in `localStorage`.
3. User generates slides from prompt.
4. Generated presentation is saved to DB.
5. User edits outline in Preview page.
6. User opens Presentation View for advanced editing.
7. User clicks **Save Changes** in Presentation View to persist updates.
8. User can reopen from **My Presentations** later.

## Notes and Limits

- Backend request body limit is configured to `10mb` in `backend/app.js`.
- If large image-heavy payloads exceed this, increase limit carefully.
- Saved records include editable content JSON; very large content can impact DB size.

## Troubleshooting

### `Invalid or expired token`
- Clear old token from browser storage.
- Login again.
- Ensure `JWT_SECRET` is stable and backend restarted.

### `PayloadTooLargeError: request entity too large`
- Increase JSON body limit in `backend/app.js`.
- Reduce embedded image size/base64 payload when possible.

### CORS/API errors from frontend
- Ensure backend is running on port `5000`.
- Ensure `VITE_API_BASE_URL=http://localhost:5000/api`.
- Restart frontend after env changes.

## Scripts

### Backend
- `npm run start` -> run server
- `npm run dev` -> run with Node watch mode

### Frontend
- `npm run dev` -> start Vite dev server
- `npm run build` -> production build

## Current Status

Implemented:
- Auth, protected generation, save/list/open/update presentations, PPT export.

Possible next improvements:
- delete/rename presentations,
- autosave in editor,
- pagination/search in My Presentations,
- refresh-token flow,
- tests (unit/integration/e2e).

## License

No license file is currently included. Add one (for example `MIT`) before open-source publishing.
