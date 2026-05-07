# Field service job coordination

Web client (Vite + React + TypeScript) and backend (Convex) for small HVAC / heat pump field operations. Product direction lives under [`docs/product/`](docs/product/).

## Prerequisites

- Node.js 20+ (recommended)
- npm

## Scripts

| Script                 | Purpose                          |
| ---------------------- | -------------------------------- |
| `npm run dev`          | Vite dev server (frontend)       |
| `npm run dev:convex`   | Convex dev sync + dashboard      |
| `npm run build`        | Typecheck + production build     |
| `npm run preview`      | Preview production build locally |
| `npm run lint`         | ESLint                           |
| `npm run format`       | Prettier write                   |
| `npm run format:check` | Prettier check                   |

Run **`npm run dev`** and **`npm run dev:convex`** in two terminals after [Convex](convex/README.md) is configured.

## Stack

Vite, React, TypeScript, Convex, Tailwind CSS, shadcn/ui conventions (`components.json`, `cn()` helper). Engineering decisions: [`docs/engineering/tooling-and-standards.md`](docs/engineering/tooling-and-standards.md).

## Environment

Copy `.env.example` to `.env.local` and set `VITE_CONVEX_URL` from the Convex dashboard or CLI output.
