# Convex backend

This folder holds Convex schema and functions. Generated types live in `_generated/` (created by the Convex CLI).

## First-time setup

1. Install dependencies from the repo root: `npm install`
2. Run `npx convex dev` and sign in / link a Convex project when prompted.
3. Copy the deployment URL into `.env.local` as `VITE_CONVEX_URL` (Vite exposes only `VITE_*` variables to the client).

Then run the Vite app in another terminal: `npm run dev`.

See [Convex + Vite](https://docs.convex.dev/client/react) for client usage when you add queries and mutations.
