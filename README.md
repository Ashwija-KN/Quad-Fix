# Quad Fix — Campus Problem Solver

One hub for the small, everyday problems on campus. Quad Fix bundles six tools into a single web app, plus an admin desk to keep things moving.

**Live site:** https://quad-fix.netlify.app

---

## Features

| Module | What it does |
|---|---|
| **Lost & Found** | Post a lost or found item, get smart match suggestions (category, location, date, keyword overlap), and claim items with a unique pickup code |
| **Parking Finder** | Live status (free / filling / full) for every campus lot, updated by students |
| **Maintenance & Complaints** | Report broken facilities and track them from *Reported* → *In Progress* → *Resolved* |
| **Study Room Booking** | See which library rooms are free and reserve an hourly slot |
| **Canteen Crowd Tracker** | Crowd level (quiet / moderate / packed) and today's menu for each canteen |
| **Safety SOS** | One-tap alert that captures your location and logs it for campus security |
| **Admin Desk** | Approve Lost & Found posts, confirm claim handovers, manage lots/rooms, update report status, resolve SOS alerts |

---

## Tech stack

- **Framework:** [TanStack Start](https://tanstack.com/start) (React 19 + TanStack Router, server-side rendering)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 with a custom "field notebook" design system
- **Build tool:** Vite, with Nitro producing the server output
- **Hosting:** Netlify (SSR runs as a Netlify Function)
- **Built with:** Lovable for the initial scaffold

---

## Getting started

### Prerequisites

- Node.js 18 or newer (check with `node -v`)
- npm (ships with Node)

### Run locally

```bash
# 1. Go into the project folder (the one containing package.json)
cd campus-app

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Then open the URL printed in the terminal (usually http://localhost:5173).

### Useful scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

---

## Deploying to Netlify

The project includes a `netlify.toml` and is configured to build with the Nitro `netlify` preset, so no extra setup is needed.

### Option A — Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

The first time, choose **Create & configure a new project** (or **Link this directory to an existing project** to update a site you've already deployed).

### Option B — Connect a Git repository

1. Push the project to GitHub.
2. In Netlify: **Add new site → Import an existing project**, then pick the repo.
3. Netlify reads `netlify.toml` and builds automatically. Every push redeploys.

> A plain drag-and-drop upload won't work for this project. It needs a build step and a serverless function, and drag-and-drop publishes files as-is without running a build.

---

## Project structure

```
campus-app/
├── netlify.toml              # Build command + publish directory
├── vite.config.ts            # Vite config, pins the Netlify Nitro preset
├── package.json
└── src/
    ├── router.tsx            # Router setup
    ├── start.ts              # Request middleware (error handling, CSRF)
    ├── server.ts             # SSR entry with error wrapper
    ├── styles.css            # Design system (colors, fonts, utilities)
    ├── components/campus/
    │   └── ui.tsx            # Shared UI: Layout, Panel, Btn, Stamp, Field...
    ├── lib/
    │   ├── campus-store.ts   # Data store, seed data, matching algorithm
    │   ├── admin-auth.ts     # Server function that checks the admin passcode
    │   ├── error-page.ts     # Fallback HTML for server errors
    │   └── utils.ts
    └── routes/
        ├── __root.tsx        # Root layout, 404 and error boundaries
        ├── index.tsx         # Home dashboard
        ├── lost-found.tsx
        ├── parking.tsx
        ├── maintenance.tsx
        ├── study-rooms.tsx
        ├── canteen.tsx
        ├── safety.tsx
        └── admin.tsx
```

---

## Admin access

The admin desk lives at `/admin`. The demo passcode is `admin123`.

The passcode is checked **server-side** through a TanStack Start server function (`src/lib/admin-auth.ts`), so the check itself is not shipped in the browser bundle. This is still a demo-grade gate: one shared passcode, no sessions, no rate limiting. Replace it with real authentication before the app handles anything sensitive.

---


## License

Add a license of your choice before sharing the code publicly (MIT is a common default).
