# Vilvetti

Mobile-first web client (Vite + React + TypeScript) and backend (Convex) for small HVAC / heat pump field operations: structured job closeouts so the office gets invoice-ready handoffs without chasing technicians. Product direction lives under [`docs/product/`](docs/product/).

## FR-14: In-app updates (MVP)

Aligned with [§10 Notifications / Communication](docs/product/prd.md#10-notifications--communication) in the PRD ([`docs/product/prd.md`](docs/product/prd.md)).

- **No outbound notifications in MVP:** there are no email, SMS, or push integrations for new assignments or completed closeouts. Coordinators and technicians rely on opening the app—not on external alerts.
- **Updates while the app is open:** the React client uses Convex **`useQuery`** (reactive subscriptions). Job lists and detail screens refresh automatically when data changes, as long as the browser tab is open and the connection is active—you see new assignments and completed work without manually reloading the page.
- **Mobile browsers:** when a tab is in the background, the OS may pause networking; updates may not stream until you bring Vilvetti forward again. On return, Convex reconnects and the UI catches up. **There is no dedicated pull-to-refresh control for MVP** (you do not need one for basic freshness); this is **not** an offline-first product—expect connectivity when using live data.

**Summary:** _Realtime-style updates in-app while connected_ replaces _external messaging_ for MVP—they are different channels: stay-in-app visibility vs. no third-party notification pipeline.

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
