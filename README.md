# Spanish ITS

Spanish ITS is an intelligent tutoring system for learning Spanish medical terminology. It combines Learn study views, adaptive Practice prompts, and a Dashboard summary so a learner can study terms, answer recall questions, and track progress over time using a lightweight JSON-backed backend.

This project is split into two parts:

- `client/` — the React + TypeScript frontend
- `server/` — the Express + TypeScript backend

The frontend is the part you open in the browser.
The backend is the API server that the frontend talks to.

## Project Structure

```text
spanish-its/
├── client/
├── server/
├── resetLearningProgress.js
└── README.md
```

## Current Features

- Learn page for studying medical terms as flashcards
- Guided Learn recommendations that prioritize unseen terms first, then weaker or less-reviewed terms
- Practice flow with active typed recall items
  - English -> Spanish
  - Spanish -> English
- Learner progress tracking in JSON files
- Dashboard summaries by mastery band and medical system
- Reset script for restoring learner progress from seed files

## Requirements

- Node.js
- npm

If you already have a recent Node.js version that supports the current React, Vite, and TypeScript tooling, the project should run normally.

## What Each Server Does

### Client Server

The `client` uses Vite as the development server.

Its job is to:
- run the React app
- reload the page automatically when you make frontend changes
- proxy `/api` requests to the backend during development

By default, Vite usually runs on:

```text
http://localhost:5173
```

That is the address you usually open in your browser.

### Backend Server

The `server` uses Express with TypeScript.

Its job is to:
- handle API routes
- return data to the React frontend
- contain backend logic for the application

In this project, the backend runs on:

```text
http://localhost:3001
```

Current backend routes include:

```text
GET  /api/kcs
GET  /api/dashboard
GET  /api/learn/next
POST /api/learn/view
GET  /api/practice/next
POST /api/practice/submit
```

## How the Two Servers Work Together

During development:

1. The React app runs on port `5173`
2. The Express server runs on port `3001`
3. When the frontend makes a request to `/api/...`, Vite forwards that request to the Express server

Because of the Vite proxy, frontend code can use requests like:

```ts
fetch("/api/dashboard")
```

instead of:

```ts
fetch("http://localhost:3001/api/dashboard")
```

This keeps frontend code cleaner and avoids common development CORS issues.

## How to Start the Project

You need two terminals open: one for the backend and one for the frontend.

If you want one command from the project root, use:

```bash
./dev-servers.sh start
```

Available management commands:

```bash
./dev-servers.sh start
./dev-servers.sh stop
./dev-servers.sh restart
./dev-servers.sh status
```

The script runs both development servers in the background and writes logs to:

```text
/tmp/spanish-its-dev/server.log
/tmp/spanish-its-dev/client.log
```

### 1. Start the backend server

From the project root:

```bash
cd server
npm install
npm run dev
```

This starts the Express + TypeScript backend.

### 2. Start the frontend server

Open a second terminal, then from the project root:

```bash
cd client
npm install
npm run dev
```

This starts the Vite React frontend.

## How to Use the App During Development

1. Make sure the backend server is running
2. Make sure the frontend server is running
3. Open the frontend URL shown in the terminal
4. Use the React app in the browser
5. The frontend will call the backend through `/api` routes

## How the App Works

### Learn

The Learn page shows one knowledge component at a time like a flashcard. The backend tracks whether a term has been viewed, when it was first and last viewed, and how many times it has been seen.

### Practice

The Practice flow selects a knowledge component adaptively based on learner state. It currently uses active typed recall items and avoids inactive multiple-choice items.

### Dashboard

The Dashboard summarizes total progress, practiced terms, mastery bands, and category-level performance by medical system.

## Data Files

This project currently uses JSON files instead of a database.

### Seed data

Main seed content lives in:

```text
server/src/data/seed/
```

Examples:
- `knowledgeComponents.json`
- `practiceItems.json`
- `bktParameters.json`

### Live learner data

Learner progress lives in:

```text
server/src/data/learner/
```

Examples:
- `learnerState.json`
- `attemptHistory.json`

### Learner reset seeds

The reset script restores live learner progress from:

```text
server/src/data/learner/learnerState.seed.json
server/src/data/learner/attemptHistory.seed.json
```

## Typical Development Workflow

### When working on the frontend

Work inside:

```text
client/src/
```

Examples:
- React components
- pages
- styling
- fetch calls to the backend

### When working on the backend

Work inside:

```text
server/src/
```

Examples:
- Express routes
- API logic
- request handling
- future database logic

## Common Commands

### Frontend

```bash
cd client
npm run dev
```

### Backend

```bash
cd server
npm run dev
```

### Backend production build

```bash
cd server
npm run build
npm start
```

### Backend tests

From the project root:

```bash
cd server
npm test
```

These integration tests use Vitest and Supertest to verify:
- `GET /api/practice/next`
- `POST /api/practice/submit`
- `GET /api/learn/next`
- `POST /api/learn/view`

They use the current JSON-backed storage during the test run and restore the learner data files after the tests finish.

### Reset learner progress

From the project root:

```bash
node resetLearningProgress.js
```

This copies the learner seed files into the live learner progress files:
- `server/src/data/learner/learnerState.seed.json` -> `server/src/data/learner/learnerState.json`
- `server/src/data/learner/attemptHistory.seed.json` -> `server/src/data/learner/attemptHistory.json`

Behavior:
- existing live learner files are overwritten
- missing live learner files are created automatically
- the script fails with a clear error if a seed file is missing or contains invalid JSON

## Troubleshooting

### The frontend loads but no backend data appears

Check that:
- the backend server is running on port `3001`
- the frontend server is running on port `5173`
- your backend route exists
- your frontend fetch path starts with `/api`

### Proxy not working

Check that `client/vite.config.ts` includes the Vite proxy config for `/api`.

If you changed `vite.config.ts`, restart the frontend dev server.

### Port already in use

If port `5173` or `3001` is already being used, stop the other process using that port and restart the correct server.

## API Overview

### `GET /api/kcs`

Returns the available knowledge components used by the app.

### `GET /api/dashboard`

Returns the dashboard summary, category summaries, and KC rows for learner progress.

### `GET /api/learn/next`

Returns the next recommended term for the Learn page, prioritizing unseen terms first and then guided review terms.

### `POST /api/learn/view`

Marks a KC as viewed in Learn and updates:
- `hasViewedLearn`
- `firstViewedAt`
- `lastViewedAt`
- `learnViewCount`

### `GET /api/practice/next`

Returns the next recommended practice KC and one eligible active practice item.

### `POST /api/practice/submit`

Scores the learner response, updates learner state, appends attempt history, and returns the updated result payload.

## Summary

- Spanish ITS is an adaptive tutor for Spanish medical terminology
- `client/` = React frontend
- `server/` = Express backend
- JSON files currently store seed content and learner progress
- run both servers during development
- open the frontend in the browser
- frontend API calls go through the Vite proxy to the backend
