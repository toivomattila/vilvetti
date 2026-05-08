# PRD divergences (`prd.md` vs implementation)

**Purpose:** Items that are **implemented** but **do not match** the PRD as written. These are for human review; they are **not** auto-queued as build TODOs in gap-analysis runs.

**Baseline (gap-analysis pass 1):** branch `main`, commit `e6ae124822bfea27847edbb8b27ee307d2d45f71`.

---

## FR-13 / S6 — Release for invoicing is two explicit actions, not one

**PRD:** From `Completed`, office transitions to `Invoice Ready` with **one action** after viewing closeout (`docs/product/prd.md` FR-13 row).

**Code:** Office must call `markCloseoutViewed` (sets `closeoutViewedAt`) and then `releaseForInvoicing`; backend rejects release without `closeoutViewedAt`.

- `convex/jobs.ts` — `releaseForInvoicing` throws if `!job.closeoutViewedAt` (lines 478–481).
- `src/pages/OfficeJobDetailPage.tsx` — separate “Mark closeout reviewed” vs “Release for invoicing” (gated on reviewed state).

**Note:** Semantically this still enforces “review before release,” but the UX is **two** taps/mutations, not a single control.

---

## “Viewed” vs “reviewed” semantics

**PRD:** FR-13 implies viewing closeout before release; open questions mention waivers.

**Code:** `closeoutViewedAt` is set by an explicit **“Mark closeout reviewed”** action with no viewport/proof-of-read guarantee—coordinator could click without reading. PRD’s “cannot skip without viewing” is enforced only as **must set viewed timestamp before release**, not literal viewing.

- `convex/jobs.ts` — `markCloseoutViewed` (lines 441–461).

---

## S1 — Sign-in screen scope

**PRD:** Screen S1 lists sign in / sign out only.

**Code:** `EmailPasswordAuth.tsx` exposes sign-up and mode toggle in the same surface as sign-in (broader than the PRD table’s “Must NOT” list, which only excludes SSO-specific items).

---

## S2 — Office job list extras

**PRD:** S2 “Must NOT” excludes analytics/charts/exports; core purpose is triage.

**Code:** `OfficeJobsPage.tsx` includes technician invite-code management (`ensureTechnicianInviteCode`)—useful for onboarding but **not** described in the S2 table.

---

## S4 / S5 — Information architecture

**PRD:** Separate screens S4 (my jobs) and S5 (closeout).

**Code:** Closeout lives on `/field/jobs/:id` (`TechnicianJobDetailPage.tsx`) with list on `/field` (`TechnicianJobsPage.tsx`)—functionally aligned, but **not** a dedicated closeout route/screen split as in the PRD table.

---

## Status literals vs PRD wording

**PRD:** States named `Scheduled`, `In Progress`, `Completed`, `Invoice Ready`.

**Code:** Persistence uses `scheduled`, `in_progress`, `completed`, `invoice_ready` (`convex/schema.ts`, `convex/jobs.ts`); UI labels map to title case (`src/lib/jobs.ts`). **Semantic match**; naming differs from PRD prose only.

---

## FR-12 — Submit timestamp: on-screen local vs paste UTC

**PRD:** FR-12 calls for an **immutable timestamp of submit** on the office read screen.

**Code:** `OfficeJobDetailPage.tsx` renders `submittedAt` with `new Date(...).toLocaleString()` (browser **local** timezone). `buildCloseoutPasteText` in `src/lib/closeoutText.ts` formats the same field with `Intl.DateTimeFormat` **`timeZone: 'UTC'`** and the paste block appends “(UTC)” (`closeoutText.test.ts` asserts this). Same instant, **two different user-visible representations**—can confuse coordinators copying text next to the on-screen clock.

---

## §9 closeout payload — Signature “metadata”

**PRD:** `customerSignature` described as “blob ref + **metadata**.”

**Code:** Only `signatureStorageId` is stored on `jobs` (`convex/schema.ts`); submit patches that id only (`convex/jobs.ts`). No separate metadata record (dimensions, capture time, etc.). FR-11 acceptance (captured, stored, visible) is met; the **literal §9 shape** is not.

---

## Pass 2 delta (2026-05-08)

Added **FR-12 timestamp presentation** and **§9 signature metadata** rows above. Confirmed non-divergences: zero photos allowed server-side (PRD §13 open); 12-photo cap enforced server-side only (not a PRD conflict). **Materials/notes optional emptiness** vs FR-08 wording was refined in **pass 6** — see **FR-08 / §9** row below.

---

## Pass 3 delta (2026-05-08)

**No new divergence rows.** P1 items (draft save for text fields, date picker on technician list, copy text) are implemented per §13 recorded decisions; partial draft (no photo/signature in `localStorage`) is a **coverage gap** vs ideal S5 save-progress, not a contradiction with the PRD table (“P1 optional”). Onboarding matches §9 org open questions.

---

## §11 — PRD references ESLint accessibility tooling not present

**PRD:** §11 states technician flows should follow WCAG-minded touch targets and points to **engineering ESLint a11y** (`docs/product/prd.md`).

**Code:** `eslint.config.js` uses `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, and `eslint-plugin-react-refresh` only—**no** `eslint-plugin-jsx-a11y` or equivalent accessibility ruleset. `package.json` has no `eslint-plugin-jsx-a11y` dependency. UI still uses large-touch primitives (`src/components/ui/button.tsx` `min-h-11`, etc.), but the **PRD-cited enforcement mechanism** is not configured.

---

## Pass 4 delta (2026-05-08)

Added **§11 — ESLint a11y** row (PRD cites engineering ESLint a11y; `eslint.config.js` has no `jsx-a11y`). Non-goal sweep (§4): no analytics, outbound notifications, or invoicing product in `src`/`convex`. Authz test scope remains a **test gap**, not a product divergence.

---

## Pass 5 delta (2026-05-08)

**No new divergence rows** after re-read of `docs/product/prd-divergences.md` and targeted grep for release/mark viewed, timestamps, eslint plugins, signature fields.

---

## FR-08 / §9 — Materials and notes are not required to be non-empty

**PRD:** FR-08 says submit is blocked until **required fields** are satisfied and points at §9 for the closeout payload, which lists `materialsUsed` and `notes` alongside work, hours, photos, and signature.

**Code:** `submitCloseout` enforces non-empty trimmed **`workCompleted`**, **`laborHours`** in range, **`signatureStorageId`**, photo count/storage existence, and status `in_progress`; **`materialsUsed`** and **`notes`** are trimmed when present but **may be empty strings** (`convex/jobs.ts`).

**Note:** §9 also allows free-text materials for MVP—human interpretation may treat these as “optional narrative fields.” If pilots expect “always capture materials,” the PRD should name them **required** explicitly.

---

## S2 — “Closeout submitted” badge uses status fallback, not only `submittedAt`

**PRD:** S2 triage calls out submitted vs not submitted.

**Code:** `isCloseoutSubmitted` returns true when `submittedAt != null` **or** status is `completed` / `invoice_ready` (`src/lib/jobs.ts`). Normal submit sets `submittedAt`; the extra status branch is defensive if data were inconsistent.

---

## Pass 6 delta (2026-05-07)

**Baseline:** `main` @ `1026cae0b2c0f93e5aa7fcb2c52ae38c8ee12dc0`.

- Added **FR-08 / §9 optional empty materials & notes** (server validation scope).
- Added **S2 submitted-badge heuristic** (status fallback vs timestamp-only reading).
- Confirmed prior rows still apply (FR-13 two-step, viewed semantics, S1 sign-up surface, S2 invite extras, IA S4/S5, status literals, FR-12 local vs UTC paste, §9 signature metadata shape, §11 ESLint jsx-a11y absent).
- **No change** to §11 ESLint row: still no `eslint-plugin-jsx-a11y` in `eslint.config.js`.
