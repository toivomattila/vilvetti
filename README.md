# Vilvetti

Mobile-first web app for **small HVAC / heat pump field teams**: structured job closeouts so the office gets invoice-ready handoffs without chasing technicians.

**Stack:** Vite, React, TypeScript, Convex, Tailwind CSS, and shadcn-style UI primitives.

## Quick start

1. **Install:** `npm install`
2. **Backend:** From the repo root, run `npm run dev:convex` (or `npx convex dev`), sign in, and link a deployment. Copy the deployment URL into `.env.local` as `VITE_CONVEX_URL`. First-time Convex steps are summarized in [`convex/README.md`](convex/README.md).
3. **Frontend:** In another terminal, `npm run dev` and open the URL Vite prints (typically `http://localhost:5173`).

You need both processes running for a working local app.

## Prerequisites

- Node.js **20+**
- npm
- A [Convex](https://www.convex.dev/) account (free tier is fine for development)

## Configuration

Copy `.env.example` to `.env.local` and set `VITE_CONVEX_URL` from the Convex dashboard or CLI.

Convex Auth uses deployment environment variables (`JWT_PRIVATE_KEY`, JWKS); see comments in `.env.example` and [`scripts/generate-convex-auth-keys.mjs`](scripts/generate-convex-auth-keys.mjs).

## Scripts

| Command                 | Purpose                              |
| ----------------------- | ------------------------------------ |
| `npm run dev`           | Vite dev server                      |
| `npm run dev:convex`    | Convex dev sync and dashboard        |
| `npm run build`         | Typecheck and production build       |
| `npm run preview`       | Preview the production build locally |
| `npm run lint`          | ESLint                               |
| `npm run format`        | Prettier (write)                     |
| `npm run format:check`  | Prettier (check only)                |
| `npm run test`          | Vitest (single run)                  |
| `npm run test:watch`    | Vitest (watch)                       |
| `npm run test:coverage` | Vitest with coverage                 |

## Documentation

Product context, PRD, and engineering standards live under **[`docs/`](docs/README.md)**—start there for requirements and tooling decisions.
