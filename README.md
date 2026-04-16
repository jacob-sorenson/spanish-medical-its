# Spanish ITS

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
└── README.md
```

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

Example API route:

```text
GET /api/hello
```

## How the Two Servers Work Together

During development:

1. The React app runs on port `5173`
2. The Express server runs on port `3001`
3. When the frontend makes a request to `/api/...`, Vite forwards that request to the Express server

Because of the Vite proxy, frontend code can use requests like:

```ts
fetch("/api/hello")
```

instead of:

```ts
fetch("http://localhost:3001/api/hello")
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

### Reset learner progress

From the project root:

```bash
node resetLearningProgress.js
```

This resets:
- `server/src/data/learner/attemptHistory.json` back to `[]`
- `server/src/data/learner/learnerState.json` back to the fresh baseline for all active knowledge components

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

## Summary

- `client/` = React frontend
- `server/` = Express backend
- run both servers during development
- open the frontend in the browser
- frontend API calls go through the Vite proxy to the backend
