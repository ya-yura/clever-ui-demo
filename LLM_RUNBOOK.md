# LLM Runbook (constant, do not change without a strong reason)

This repo must stay always runnable. Treat this file and the base configs as constants; only cosmetic/feature work should change other code.

## Stack
- React + TypeScript + Vite
- TailwindCSS, Framer Motion, Zustand/Jotai, React Router
- Dexie (IndexedDB), Workbox PWA

## Start / dev server
- Install deps: `npm install`
- Run dev (canonical): `npm run dev`
  - Bound to `http://localhost:5180` (`--host --port 5180 --strictPort` via package.json)
  - If the port is busy, free it (on Windows: `netstat -ano | findstr 5180` then `taskkill /PID <pid> /F`) and rerun.
- Alt direct command (only if npm script fails): `npx vite --host --port 5180 --strictPort --config vite.config.ts`

## Production build
- `npm run build`
- `npm run preview` (serves the built PWA)

## Data / demo
- If backend (OData) is unreachable, logic auto-falls back to demo data. Do not remove this.

## Do not change unless absolutely necessary
- `package.json` scripts (dev/build commands, ports)
- `vite.config.ts` (server host/port, aliases, PWA setup, proxy)
- PWA/Workbox manifest basics

## What changes are allowed
- UI/UX tweaks, styles, layouts, copy
- Module features that do not break startup/build

If unsure, ask before touching the core config. Keep the system always runnable on 5180.

