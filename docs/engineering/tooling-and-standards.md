# Tooling, technical decisions, and engineering standards

This document records **intended** technical choices, conventions, and rationale for this repository. It is a **standards and decision log**, not an implementation checklist: tooling may be introduced incrementally, but should align with these goals.

## Goals

| Goal | What “good” looks like |
|------|-------------------------|
| **Maintainability** | New contributors and future-you can follow one obvious path; modules have clear responsibilities. |
| **Code quality** | Strict types, consistent style, meaningful tests, no silent regressions. |
| **Developer experience** | Fast feedback locally, predictable scripts, minimal ceremony for common tasks. |
| **AI-assisted development** | Small diffs, explicit boundaries, CI that catches mistakes so agents and humans share the same guardrails. |
| **Long-term cleanliness** | Dead code and dependency drift are detected and removed; architecture stays understandable. |
| **Reviewability** | PRs are easy to read: formatting is automated, boundaries are enforceable, tests explain behavior. |
| **Operational simplicity** | Few moving parts in deploy/runtime; Convex handles backend state; Vercel hosts the static/SSR edge as appropriate. |

---

## Application stack

| Layer | Choice | What it is | Why it exists here |
|-------|--------|--------------|---------------------|
| **Build / dev server** | **Vite** | Fast ES-module-native bundler and dev server. | Fast cold start and HMR; simple config; good TypeScript defaults; CI-friendly `vite build`. |
| **UI** | **React** | Component model for interactive web UI. | Large ecosystem, strong patterns for forms and async UI; works well with Convex client. |
| **Language** | **TypeScript** | Typed superset of JavaScript. | Catches whole classes of bugs at compile time; enables safer refactors and better editor support. |
| **Backend / data / realtime** | **Convex** | Hosted backend with database, functions, and reactive subscriptions. | One place for mutations, queries, and auth-aware logic; realtime updates fit field workflows without hand-rolled WebSocket plumbing. |
| **Styling** | **Tailwind CSS** | Utility-first CSS in markup/class names. | Consistent spacing and typography; fast iteration; small CSS surface when purged. |
| **Components** | **shadcn/ui** + **Radix UI** | Copy-in components built on unstyled, accessible primitives (Radix). | Accessible patterns (focus, keyboard, ARIA) without reinventing dialogs, selects, etc.; own the code, avoid opaque component lock-in. |
| **Hosting** | **Vercel** | Edge-friendly hosting for frontend (and optional serverless). | Simple deploys from Git; fits Vite static or SSR adapters; pairs with Convex as separate backend URL. |

### Stack interplay

- **Vite + React + TypeScript** produce the client bundle; **Convex** is the system of record and API.
- **Tailwind + shadcn/ui** keep UI consistent; Radix is the low-level behavior layer under shadcn patterns.
- **Vercel** serves the app; **Convex** is not replaced by Vercel serverless for core data—keep backend concerns in Convex unless there is a clear exception (document exceptions when they appear).

### Where the stack should not be stretched

- Do not move **business rules** into Vercel edge functions “just because” if they belong in Convex (auth, consistency, data shape).
- Do not use **Tailwind** as an excuse for unstructured markup—keep components small and named.
- **shadcn** components are meant to be **edited**; avoid treating them as a black-box dependency you cannot simplify.

---

## Core quality gates

### TypeScript (strict mode)

- **What:** Compiler option set that disallows common loose patterns (`strict`, `noImplicitAny`, etc., per `tsconfig`).
- **Why:** Maximizes value of TypeScript for refactors and reviews; aligns AI-generated code with the same rules as human code.
- **Where it helps:** Prevents `undefined` surprises, bad optional handling, and silent type holes.
- **Do not overuse:** Not every value needs a branded type or heavy conditional types—prefer simple types and `zod` inference where runtime validation matters.

### ESLint

- **What:** Pluggable linter for JavaScript/TypeScript and many frameworks.
- **Why:** Catches bug patterns, inconsistent React usage, and accessibility footguns before review.
- **Where it helps:** Local editor feedback and CI; shared rules reduce style debates in PRs.
- **Do not overuse:** Too many stylistic rules create noise; prefer a small core that teams actually fix; use Prettier for formatting, not ESLint.

### Prettier

- **What:** Opinionated code formatter.
- **Why:** One formatting truth; diffs stay minimal and reviewable.
- **Where it helps:** Every TS/TSX/JSON/CSS file touched in PRs.
- **Do not overuse:** Do not fight Prettier with per-line disables except in rare cases (e.g. generated code isolation).

### prettier-plugin-tailwindcss

- **What:** Sorts Tailwind class lists in a canonical order.
- **Why:** Reduces merge churn and makes class-heavy JSX easier to scan.
- **Where it helps:** Components with many utilities.
- **Do not overuse:** If a class string is built dynamically, keep logic readable—sorting applies to static strings; complex `cn()` usage still needs human judgment.

### Husky or Lefthook + lint-staged

- **What:** Git hooks runners; **lint-staged** runs commands only on staged files.
- **Why:** Fast local feedback before push; optional gate so broken lint/format never lands on main.
- **Where it helps:** Pre-commit format + lint on changed files.
- **Do not overuse:** Hooks should stay **fast**—full E2E in pre-commit is wrong; heavy work belongs in CI. Choose **Husky** (common npm default) or **Lefthook** (fast, language-agnostic YAML config)—pick one per repo, not both.

---

## Testing

| Tool | What it is | Why | Where it helps | Do not overuse |
|------|------------|-----|----------------|----------------|
| **Vitest** | Vite-native test runner | Same pipeline as app build; fast watch mode | Unit tests for pure functions, hooks, small components | Replacing every E2E with mocked unit tests—some flows need real browser |
| **React Testing Library** | Renders React trees and queries like a user | Tests behavior, not implementation details | Forms, closeout fields, conditional UI | Testing internal state or private methods |
| **@testing-library/jest-dom** | Custom matchers (`toBeInTheDocument`, etc.) | Clearer assertions | Component tests | N/A—lightweight |
| **@testing-library/user-event** | Realistic keyboard/pointer simulation | Better interaction fidelity than `fireEvent` alone | Inputs, signatures (where applicable) | Every micro-interaction—focus on critical paths |
| **Playwright** | Cross-browser E2E automation | Catches integration regressions CI cannot see in unit tests | Core loop: login → job → closeout → office view | Full matrix on every PR—keep a **smoke** subset fast, run broader nightly if needed |
| **convex-test** | Testing utilities for Convex functions | Validates backend logic and auth rules without production | Mutations/queries, invariants, access control | Re-implementing the whole DB in mocks—prefer official patterns |
| **MSW** | Mock Service Worker | Intercepts HTTP and can mock REST/GraphQL | Early UI work before backend ready; Storybook; rare legacy edges | Convex-heavy app: most data is not REST—use **convex-test** for backend, MSW only where HTTP mocking truly helps |

**How they work together:** Vitest + RTL + user-event + jest-dom for **fast** feedback on UI and utils; **convex-test** for **backend** correctness; **Playwright** for **thin** critical-path E2E; **MSW** optional and scoped—avoid duplicating Convex with fake REST unless there is a concrete need.

---

## ESLint plugins (beyond a baseline)

| Plugin | What it does | Why | Where it helps | Do not overuse |
|--------|----------------|-----|----------------|----------------|
| **eslint-plugin-react-hooks** | Enforces Rules of Hooks | Prevents subtle React bugs | All components/hooks | — |
| **eslint-plugin-jsx-a11y** | Flags accessibility issues in JSX | Legal/ethical UX; fewer production surprises | Interactive UI | Heuristic false positives—fix or narrowly disable with comment |
| **@typescript-eslint/parser** + **eslint-plugin** | Type-aware lint rules for TS | Catches TS-specific footguns | TS/TSX | Slow rules on huge files—tune for perf if needed |
| **eslint-plugin-jsdoc** | JSDoc consistency / required tags (if configured) | Documents public APIs when you choose to require them | Exported library-style modules | Demanding JSDoc on every internal function—conflicts with “lightweight comments” philosophy |
| **eslint-plugin-import-x** | ESM/CJS import hygiene, ordering, cycles (config-dependent) | Consistent imports; can catch circular deps | Whole codebase | Aggressive resolver config that fights Vite/Convex—keep config minimal |
| **eslint-import-resolver-typescript** | Resolves `paths` and TS types for import rules | Makes import-x rules accurate with TS aliases | Monorepos / path aliases | — |
| **eslint-plugin-boundaries** | Enforces allowed imports between **layers** (e.g. `ui` → `features` → `api`) | Prevents “spaghetti imports” and keeps architecture reviewable | Growing codebase with clear folders | Over-segmentation (10 layers) slows everyone—start with a few boundaries and expand deliberately |

---

## Runtime validation and safety

### Zod

- **What:** TypeScript-first schema library; parse and infer types from one definition.
- **Why:** Runtime data (forms, env, external JSON, Convex **public** args) is not proven by compile-time types alone.
- **Where it helps:** Environment variables; dangerous boundaries (user input, webhooks if any); optional: Convex function args for extra clarity (align with Convex’s own validators—avoid duplicate conflicting validation).
- **Do not overuse:** Validating every tiny internal object—validate **trust boundaries** and ambiguous input.

### Environment variables (Zod)

- **What:** Single module that parses `import.meta.env` / `process.env` with a Zod schema at startup.
- **Why:** Fails **fast** in dev and CI when config is wrong; no silent `undefined` API URLs.
- **Where it helps:** Build-time and client bundle boundaries for Convex URL, feature flags, etc.
- **Do not overuse:** Putting secrets in client-exposed env—**never** expose secrets to the browser; Convex and Vercel each have their own secret mechanisms.

---

## Codebase hygiene and drift prevention

| Tool | What it is | Why | Where it helps | Do not overuse |
|------|------------|-----|----------------|----------------|
| **knip** | Finds unused files, exports, and dependencies | One tool for “dead code + orphan deps” | Regular cleanup passes; CI optional/staged | Running with max strictness until noise drowns signal—configure entry points carefully for Vite + Convex |
| **ts-prune** | Finds unused exports in TS | Lighter complement when knip config is heavy | Quick export audits | Duplicate of knip’s export finding—prefer **one** primary workflow to avoid thrash |
| **depcheck** | Finds unused/missing `package.json` deps | Keeps `package.json` honest | After refactors | False positives on Convex/Vite plugins—tune ignores |
| **madge** | Dependency graph / circular dependency detection | Catches cycles before they hurt bundlers and reasoning | CI or occasional `npm script` | Blocking on every tiny graph quirk—tune to **cycles** only |

**Practical stance:** Prefer **knip** as the main “housekeeping” command once configured; use **madge** for **cycles**; treat **ts-prune** / **depcheck** as optional if knip + manual review already cover the repo—document the chosen combo in `package.json` scripts when implemented.

---

## Tailwind and styling utilities

| Package | What it is | Why | Where it helps | Do not overuse |
|---------|------------|-----|----------------|----------------|
| **tailwind-merge** | Merges Tailwind classes correctly (last wins) | Avoid conflicting utilities when composing variants | shadcn `cn()` patterns | Dynamic class strings that become unreadable—prefer `cva` |
| **clsx** | Small conditional class list helper | Readable boolean classes | Any component | Nested ternaries—use `cva` instead |
| **class-variance-authority (cva)** | Variant API for component styles | Self-documenting variants (`size`, `intent`) | Buttons, inputs, repeated patterns | Every div—reserve for real variants |

---

## Developer experience (repository)

- **Path aliases (`@/` etc.):** Stable imports; shorter refactors when moving files.
- **Consistent import ordering:** ESLint (`import-x`) keeps diffs predictable; alphabetical or grouped “external → internal”.
- **Useful npm scripts:** `dev`, `build`, `lint`, `lint:fix`, `format`, `format:check`, `test`, `test:watch`, `e2e` (or `test:e2e`)—names should match CI.
- **CI-ready scripts:** Same commands locally and in GitHub Actions—no “works on my machine” one-off bash.
- **GitHub Actions:** Run `lint`, `format:check`, `typecheck`, `test`, and optionally Playwright on PRs; cache dependencies.

---

## GitHub Actions (when added)

- **What:** CI pipelines on push/PR.
- **Why:** Enforces the same quality gates for every contributor and for AI-generated PRs.
- **Where it helps:** Required checks before merge; visible failures early.
- **Do not overuse:** Long sequential jobs—parallelize lint/typecheck/test; use path filters for expensive E2E if the repo grows.

---

## Documentation and comments

- Prefer **self-documenting code**: clear function names, small functions, explicit types.
- Prefer **good naming** over long comments.
- Comments explain **why** (intent, tradeoffs, invariants), not **what** (the code already says what).
- Avoid **redundant** comments and autogenerated **docstring spam**.
- Use **lightweight JSDoc** only for non-obvious public APIs or Convex patterns where a one-liner prevents repeated mistakes.

---

## AI-assisted development

- Prefer **small, focused** changesets—easier to review and revert.
- Minimize **unnecessary abstractions**—YAGNI until a second use case appears.
- Avoid **premature optimization**; measure hot paths when needed.
- **Aggressively remove dead code**—knip/PR discipline; AI tends to add files—CI and hygiene tools push back.
- Keep **architecture explicit**: folder conventions, `eslint-plugin-boundaries`, and short docs (this file + product docs) beat implicit tribal rules.
- Make failures **visible early**: CI = typecheck + lint + tests; Convex rules in official docs for auth and validators.
- Keep **business context** in `docs/product/` and **engineering context** here so agents and humans share source-of-truth.

---

## How everything fits together

```text
Developer / AI edits code
    → Editor: TypeScript strict + ESLint (+ Tailwind IntelliSense)
    → Pre-commit: format (Prettier + Tailwind class sort) + lint-staged lint
    → CI: format check, lint, typecheck, unit tests, convex-test, (optional Playwright smoke)
    → Deploy: Vite build → Vercel; Convex functions/schema via Convex deploy
```

- **Prettier** owns formatting; **ESLint** owns correctness and selected style; **TypeScript** owns types; **Zod** owns runtime trust boundaries; **Vitest/convex-test/Playwright** own confidence; **knip/madge** own drift over time.

---

## Summary principles

1. **One pipeline:** local scripts mirror CI.
2. **Strict types + validated env + tests** over heroics at review time.
3. **Convex** for authoritative backend logic; **React** for UI; do not blur without reason.
4. **Boundaries** (ESLint + folders) over ad-hoc imports as the codebase grows.
5. **Hygiene tools** run on a schedule or in CI—not only when someone remembers.
6. **Comments** explain intent; **tools** enforce shape; **tests** lock behavior.

This document should be updated when the stack or conventions change—treat it as the engineering counterpart to product docs under `docs/product/`.
