# Product Requirements Document (PRD)

**Purpose:** Turn the brutally minimal MVP into an **executable specification** for design, implementation, and test.  
**Status:** Working document — update as validation learns.  
**Related:** [Target customer & problem](avatar.md), [MVP definition](mvp-definition.md), [Core operational workflow](core-operational-workflow.md), [Engineering standards](../engineering/tooling-and-standards.md).

---

## 1. Product Overview

### What the product does

A **mobile-first web application** that lets **field technicians** submit a **structured job closeout** immediately after a service visit, so **office staff** receive **complete, invoice-ready operational data** without chasing details through calls, WhatsApp, and memory.

The product does **not** replace invoicing or accounting; it replaces the **fragmented handoff** between technician and office for post-visit information.

### Who it is for

**Primary:** Independent **Finnish residential HVAC / heat pump maintenance** companies roughly **4–15 employees**, with **multiple technicians**, **recurring residential visits**, and **owner or office coordinator** heavily involved in coordination and invoicing.

**Ideal first deployment:** one office coordinator, **2–5 technicians**, using the product **only** for closeout and invoice-required information; other workflows (scheduling chatter, WhatsApp dispatch, external invoicing) may stay as today.

### Operational pain it solves

- Office **cannot finalize invoicing** without **manually chasing** work description, materials, hours, photos, notes, and customer confirmation.
- Information is **inconsistent, incomplete, and late** because it was never captured in **structured, complete form at the moment work finished**.

### Why the pain matters

- **Cashflow and revenue timing:** delayed closeout → delayed invoices → delayed payment.
- **Admin load and interruptions:** coordinator stops other work to call technicians and reconstruct jobs.
- **Quality and dispute risk:** weak documentation makes disputes and underbilling more likely.
- **Technician friction:** follow-ups and “what did you use on Matti’s job?” break focus and morale.

---

## 2. Core Problem Statement

### Exact workflow problem

**Completed field service information is not captured in a structured, complete, and invoice-ready format at the moment work is finished.**  
The business still needs that data for **invoicing and operational tracking**, so it is **reconstructed later** through ad hoc channels.

### How businesses currently handle it

- **Channels:** phone, WhatsApp, SMS, verbal handoff, paper notes, spreadsheets, calendar entries, photos left on personal phones.
- **Coordination:** office creates and assigns work outside or partly outside any single system; technician performs visit; technician **reports back** asynchronously; office **fills gaps** before invoicing.

### Why current workflows fail

- **No single capture moment:** reporting happens **after** the visit, from memory, in **free form**.
- **No structured schema:** same facts appear differently or not at all across jobs.
- **Fragmentation:** critical data lives in messages and devices, not in one **invoice-oriented** record tied to the job.

### Operational consequences

- **Invoicing delay** and **slower cashflow**.
- **High coordinator overhead** (chasing, reconciling).
- **Weak job history** for the next visit or technician.
- **Fragile Technician → Office handoff** (see [core operational workflow](core-operational-workflow.md)) driving admin workload and customer clarity.

---

## 3. Goals

### Primary operational goals

1. **Closeout completeness:** For jobs completed through the product, the office has **one structured record** containing work completed, labor hours, materials, notes, photos, and customer signature **without post-hoc chasing** for those fields.
2. **Timeliness:** Closeout is submitted **in the same work session as the visit** (same day as visit; target: before technician moves on to unrelated context—product should make this natural on phone).
3. **Invoice readiness:** After closeout submission, coordinator can **create an invoice in their existing tool** using only the product’s job/closeout view (no mandatory second round-trip for the **defined** fields).

### Measurable improvements (pilot-oriented, not vanity)

| Measure                             | Definition                                                                                                     | Direction                            |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| **Chase events per job**            | Count of office-initiated follow-ups (calls/messages) **specifically** for missing closeout fields after visit | **↓ toward zero** for in-app jobs    |
| **Invoice lag**                     | Time from **visit date** to **invoice issued** (tracked outside app or self-reported)                          | **↓** vs baseline month              |
| **Closeout submission rate**        | % of assigned jobs that reach **Invoice Ready** with submitted closeout                                        | **↑** toward 100% for pilot cohort   |
| **Time to first complete closeout** | Minutes from “job visible to technician” to **submitted** closeout                                             | Stable or **↓** as technicians adopt |

### What success looks like

- Coordinators say they can **invoice without chasing** for the fields the product collects.
- Technicians say **on-phone closeout** is **no worse than** (ideally easier than) WhatsApp + photos + later calls.
- Owner sees **faster billing** or **lower admin time** on pilot jobs—**operational** outcomes, not dashboard engagement.

---

## 4. Non-Goals

The MVP **does not** attempt to solve the following. **Do not implement** these in MVP scope without explicit PRD revision.

### Excluded product features

- **Invoice generation**, PDF templates, or sending invoices to customers.
- **Accounting / ERP integration** (Netvisor, Procountor, etc.).
- **Route optimization**, map-based dispatch, GPS tracking.
- **Payroll**, **inventory / stock**, **procurement**.
- **Multi-branch / franchise** models, **enterprise RBAC**, org-wide analytics.
- **Dashboards**, **KPI analytics**, **AI summaries** of visits.
- **Automated scheduling**, **recurring job engines**, **quoting / CRM** pipelines.
- **Rich asset / equipment CMDB** or **full maintenance history** products.

### Intentionally ignored complexity

- **External notifications** (email/SMS/push providers) — see §10; **in-app visibility only** for MVP constraint.
- **Perfect offline-first** behavior (define minimal behavior under poor connectivity in §11; full offline queue is non-goal unless promoted).
- **Multi-language UI** beyond what pilot needs (Finnish-first acceptable; document decision).

### Future ideas (not now)

- Customer portal, digital payments, parts ordering, warranty registration, compliance checklists, integrations with wholesaler catalogs.

---

## 5. User Roles

Only **two** application roles for MVP.

### Office coordinator / owner

| Aspect                       | Definition                                                                                                                                |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Responsibilities**         | Create jobs, assign technicians, ensure jobs progress to **Invoice Ready**, review closeout for obvious gaps before invoicing externally. |
| **Goals**                    | Stop chasing missing visit data; speed invoicing; reduce mental load from fragmented channels.                                            |
| **Key actions**              | Log in; create job; pick technician and appointment; monitor lists; open completed/invoice-ready jobs; read full closeout.                |
| **Technical sophistication** | **Low to medium** — comfortable with web apps, spreadsheets, and messaging today; must not require “IT admin” skills.                     |

### Field technician

| Aspect                       | Definition                                                                                                                               |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Responsibilities**         | Perform visit (out of app); **in app**: open assigned job, enter structured closeout, capture signature, submit.                         |
| **Goals**                    | Minimal admin time after visit; clear “what do I fill in”; no duplicate reporting in three channels.                                     |
| **Key actions**              | Log in; see today’s assignments; complete closeout fields; attach photos; collect signature; submit.                                     |
| **Technical sophistication** | **Low** — primary context is phone, gloves, van; UI must be **large-touch, short-path, forgiving** (validation messages plain language). |

**No separate roles** (customer, dispatcher-only, accountant login, admin superuser) in MVP.

---

## 6. Core Workflow

End-to-end **core loop** only.

### Step A — Office creates job

| Item              | Specification                                                                                                     |
| ----------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Trigger**       | Coordinator decides a visit is needed (customer may have contacted them by any channel **outside** this product). |
| **Actions**       | Create job: customer name, address, appointment date, problem/notes, assign technician.                           |
| **State**         | Job enters **`Scheduled`** (or equivalent initial state).                                                         |
| **Notifications** | None outbound. Technician sees job when they **open app** (assigned jobs list).                                   |
| **Completion**    | Job persisted and visible to assigned technician in their assignment list for the appointment day context.        |

### Step B — Technician performs visit (physical)

| Item              | Specification                                                                                                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Trigger**       | Appointment time / technician arrives (real world).                                                                                                                                                    |
| **Actions**       | Work happens on site; **product may be unused** during actual wrench time.                                                                                                                             |
| **State**         | Technician moves job to **`In Progress`** when starting the visit or opening the job for closeout (exact trigger **Open Question** §13); must be **`In Progress`** before submit if enforcement is on. |
| **Notifications** | None required.                                                                                                                                                                                         |
| **Completion**    | Visit done; technician is ready to **close out in app**.                                                                                                                                               |

### Step C — Technician submits structured closeout

| Item              | Specification                                                                                                                                                                                                                                                                             |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Trigger**       | Visit complete; technician opens assigned job.                                                                                                                                                                                                                                            |
| **Actions**       | Fill work completed, hours, materials, notes; upload photos; capture customer signature; **submit** closeout.                                                                                                                                                                             |
| **State**         | On valid submit: job moves from **`In Progress`** to **`Completed`** (closeout persisted and locked). Coordinator then moves **`Completed`** → **`Invoice Ready`** after review (single explicit action, **P0**—see FR-13), unless pilot decides auto-advance (document decision in §13). |
| **Notifications** | **In-app only:** job appears for office under **`Completed`** on next load or realtime update—no email/SMS.                                                                                                                                                                               |
| **Completion**    | Closeout **immutable** for MVP after submit (no technician edit—see Open Questions if edit needed).                                                                                                                                                                                       |

### Step D — Office reviews closeout and invoices externally

| Item              | Specification                                                                                                                                                                                                  |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Trigger**       | Job is **`Completed`** (closeout submitted and visible).                                                                                                                                                       |
| **Actions**       | Review read-only closeout; tap **Release for invoicing** when satisfied (**`Completed` → `Invoice Ready`**, FR-13) unless auto-advance applies; create invoice in **external** system using the closeout data. |
| **State**         | After release: **`Invoice Ready`**. No further required states in MVP (optional “Marked invoiced” **non-goal** unless added later).                                                                            |
| **Notifications** | None.                                                                                                                                                                                                          |
| **Completion**    | Invoice created externally **without** calling technician for the captured fields; coordinator sign-off recorded if **`Invoice Ready`** is distinct from **`Completed`**.                                      |

---

## 7. Functional Requirements

**Priority:** **P0** = must ship for MVP validation; **P1** = acceptable in first release if trivial, else fast follow.

| ID        | Requirement                              | Why                                                                           | Acceptance criteria                                                                                                                                                                                                        | Pri |
| --------- | ---------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| **FR-01** | **Authentication**                       | Only assigned staff see company jobs.                                         | User can sign in and out; unauthenticated users cannot read/write jobs. Session persists reasonably on mobile browser.                                                                                                     | P0  |
| **FR-02** | **Role discrimination**                  | Office vs technician capabilities differ.                                     | After sign-in, **technician** cannot create jobs for others; **office** cannot impersonate submit closeout **for** technician without a defined rule (default: **only technician** submits closeout for their assignment). | P0  |
| **FR-03** | **Create job**                           | Core loop entry.                                                              | Office can create job with: customer name, address, appointment date, notes/problem, assigned technician; job appears in office list and technician assignment list.                                                       | P0  |
| **FR-04** | **List jobs (office)**                   | Coordinator triage.                                                           | Lists or filters show **Scheduled** (may include not-yet-started assignments), **In Progress**, **Completed** (closeout submitted, pending coordinator release), and **Invoice Ready** (released for external invoicing).  | P0  |
| **FR-05** | **List assigned jobs (technician)**      | Field use.                                                                    | Technician sees jobs **assigned to them**; default filter **today** (with ability to see near-future/past if implemented—**P1** clarity in UI copy).                                                                       | P0  |
| **FR-06** | **Start job (technician)**               | Aligns with MVP state **`In Progress`**.                                      | Technician can transition **`Scheduled` → `In Progress`** from their device before submitting closeout (exact UX: dedicated button vs implicit on open—Open Question §13).                                                 | P0  |
| **FR-07** | **Open job detail / closeout form**      | Data capture UI.                                                              | From list, technician opens job and sees all closeout fields + submit.                                                                                                                                                     | P0  |
| **FR-08** | **Validate closeout**                    | Data must be complete before **`Completed`** status.                          | Submit blocked until required fields satisfied (define required set in §9); errors **field-level** and plain language.                                                                                                     | P0  |
| **FR-09** | **Submit closeout**                      | Core value delivery.                                                          | Successful submit persists data; job becomes **`Completed`**; office can see **same values** read-only; technician cannot change after submit (MVP).                                                                       | P0  |
| **FR-10** | **Photo upload**                         | Evidence for invoice/disputes.                                                | At least one photo **optional or required** per §13 Open Questions; files stored durably and viewable in office view.                                                                                                      | P0  |
| **FR-11** | **Customer signature**                   | Confirmation.                                                                 | Signature captured on device, stored, visible in office view (bitmap or vector acceptable).                                                                                                                                | P0  |
| **FR-12** | **Office read closeout**                 | Invoice preparation.                                                          | Single screen shows all closeout fields + photos + signature + immutable timestamp of submit.                                                                                                                              | P0  |
| **FR-13** | **Release job for invoicing**            | Separates “data captured” from “coordinator satisfied” per MVP state machine. | From **`Completed`**, office can transition job to **`Invoice Ready`** with one action after viewing closeout; cannot skip without viewing (or explicit waiver—Open Question §13).                                         | P0  |
| **FR-14** | **Technician assignment visible in-app** | No external notifications MVP.                                                | New/updated assignment visible on list **without** email/SMS; realtime or pull-to-refresh **acceptable**—document chosen UX.                                                                                               | P0  |

**Out of scope for FR:** reporting exports, bulk import, customer CRUD beyond job context, multi-technician reassignment mid-job (Open Question).

---

## 8. Screens / Views

| #      | Screen                         | Purpose                                         | Key information                                                    | Key actions                                                                                                       | Must NOT include                                                     |
| ------ | ------------------------------ | ----------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| **S1** | **Sign in**                    | Access control.                                 | Brand/app name, errors.                                            | Sign in, sign out.                                                                                                | SSO options, password managers blocking (follow web standards only). |
| **S2** | **Office job list**            | Triage jobs by lifecycle.                       | Customer, address, date, technician, **status**, submitted vs not. | Navigate to create job, open job detail/closeout read view.                                                       | Analytics widgets, charts, exports.                                  |
| **S3** | **Create / edit job** (office) | Schedule and assign.                            | Form fields per FR-03.                                             | Save, cancel, assign technician from **allowlist** of users with technician role.                                 | Recurrence UI, route map, customer portal link.                      |
| **S4** | **Technician “my jobs”**       | Daily field use.                                | Today’s (or date-scoped) assigned jobs with status.                | Open closeout flow.                                                                                               | Full company-wide schedule, other technicians’ jobs.                 |
| **S5** | **Technician closeout**        | **Primary screen** — structured capture.        | All closeout fields, photo thumbnails, signature pad.              | Save progress **P1 optional**; submit; cancel/back with confirm if dirty.                                         | Long narratives, free-form-only mode without fields.                 |
| **S6** | **Office closeout read-only**  | Review captured data and release for invoicing. | Full submitted closeout + metadata (who submitted, when).          | **Release for invoicing** (→ `Invoice Ready`); navigate back; **optional P1** “copy text” for external invoicing. | Edit closeout, in-app invoice PDF.                                   |

---

## 9. Data Model

**Principle:** Minimum entities, **avoid premature normalization**. Prefer **one job record** with closeout fields nulled until submission unless split tables materially helps Convex rules.

### Entity: `User` (or profiles)

| Aspect              | Detail                                                                              |
| ------------------- | ----------------------------------------------------------------------------------- |
| **Purpose**         | Auth identity + **role** (`office` \| `technician`) + display name for assignments. |
| **Critical fields** | Stable user id; role; display name; link to auth provider subject.                  |
| **Relationships**   | Many jobs created by office user; many jobs assigned to technician user.            |
| **Lifecycle**       | Created on first login / admin invite—**Open Question** for onboarding.             |

### Entity: `Job`

| Aspect                | Detail                                                                                                                                                                                                                                                                                                                                                                                        |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**           | Single unit of work from scheduling through closeout.                                                                                                                                                                                                                                                                                                                                         |
| **Critical fields**   | `customerName`, `customerAddress`, `appointmentDate` (date or datetime—decide), `problemDescription` / notes, `assignedTechnicianId`, `status`, **closeout fields** (nullable until submit), `submittedAt`, `submittedByTechnicianId`, photo references, signature reference; optional audit: `releasedForInvoiceAt`, `releasedByUserId` when office moves **`Completed` → `Invoice Ready`**. |
| **Relationships**     | Belongs to **organization/tenant** if multi-tenant; else single-tenant implicit scope.                                                                                                                                                                                                                                                                                                        |
| **Lifecycle / state** | `Scheduled` → `In Progress` → `Completed` (closeout submitted) → `Invoice Ready` (office released after review). No other statuses in MVP. Transitions: office creates → **Scheduled**; technician starts → **In Progress**; technician submits valid closeout → **Completed**; office confirms → **Invoice Ready**.                                                                          |

### Closeout payload (logical)

Either **embedded on `Job`** or `JobCloseout` 1:1 table—choose one in implementation spec:

- `workCompleted` (text)
- `laborHours` (number, rules: min/max/step Open Question)
- `materialsUsed` (text or structured lines—**text acceptable for MVP**)
- `notes` (text)
- `photos[]` (storage ids + optional captions **non-goal**)
- `customerSignature` (blob ref + metadata)

### Entity: `Organization` (tenant)

| Aspect              | Detail                                                                                                                 |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Purpose**         | Boundary for all jobs and users in multi-company SaaS.                                                                 |
| **Critical fields** | Name; optional slug.                                                                                                   |
| **Relationships**   | 1:N users; 1:N jobs.                                                                                                   |
| **Lifecycle**       | **Pilot:** single org acceptable; production SaaS needs org creation—Open Question for self-serve vs manual provision. |

**Avoid:** separate `Part`, `PriceList`, `Invoice`, `Customer` master tables for MVP unless unavoidable for auth.

---

## 10. Notifications / Communication

**Constraint:** **In-app only** for MVP—no email, SMS, or push **integration** that depends on external messaging providers.

| Event                          | Recipient             | When                            | Delivery                                                                             |
| ------------------------------ | --------------------- | ------------------------------- | ------------------------------------------------------------------------------------ |
| **Assignment created/updated** | Assigned technician   | Job saved with their assignment | Appears on technician list when app opened or subscription updates UI.               |
| **Closeout submitted**         | Office coordinator(s) | Successful submit               | Job appears under **`Completed`** on office list when app opened or realtime update. |

**Not in MVP:** email “job completed,” SMS “new job,” WhatsApp relay, customer notifications.

---

## 11. Constraints

### Technical

- Stack per [engineering standards](../engineering/tooling-and-standards.md): React, TypeScript, Vite, Convex, Tailwind, shadcn/ui; host frontend on Vercel.
- **No external notification services** in MVP (§10).
- **Mobile-first:** technician flows must be usable on **small phone** viewports; touch targets follow WCAG-minded defaults (see engineering ESLint a11y).

### Operational

- Pilot assumes **trusted internal users**; extreme fraud prevention non-goal.
- **Finnish market context:** address and name formats realistic for Finland; language **Open Question**.

### Staffing assumptions

- **One coordinator** can onboard technicians verbally (“install this, log in with invite”).
- No dedicated IT during pilot.

### Device and connectivity

- Technicians use **personal or company smartphones** with modern mobile browser.
- **Connectivity:** submit requires network; behavior if offline = **Open Question** (clear error vs queue).

### Compliance

- **GDPR-relevant:** personal data (customer names, addresses, signatures, photos) stored in Convex and file storage—**privacy policy and DPA path non-goal for PRD detail** but implementation must follow company legal guidance (retention, access, deletion—Open Question).

---

## 12. Risks

| Category        | Risk                                                                   | Mitigation direction                                                                        |
| --------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **Product**     | Technicians **skip app** and revert to WhatsApp “because it’s faster.” | Extreme simplicity on S5; **required fields minimal**; pilot training; measure submit rate. |
| **Product**     | Office still **does not trust** digital signature vs paper.            | Clear audit trail (who, when); optional export **P1**.                                      |
| **Operational** | **Double entry** if coordinator still duplicates into spreadsheet.     | Position product as **source of truth** for closeout only; integrate exports later.         |
| **Adoption**    | Owner buys tool but technicians don’t log in.                          | Owner-led rollout; technician onboarding **< 2 minutes**.                                   |
| **Technical**   | Photo/signature **storage cost** or upload failures on weak LTE.       | Compress images; clear retry; cap count/size per job.                                       |
| **Technical**   | **Auth invite** friction blocks first pilot user.                      | Simplest possible auth (Open Question: magic link vs password vs OIDC).                     |

---

## 13. Open Questions

1. **Required vs optional photos:** minimum one photo required, or zero allowed if signature + text?
2. **Labor hours:** integer only vs decimals; maximum per job sanity cap?
3. **Materials:** free text vs line items with quantity—MVP says text acceptable; confirm with pilot.
4. **Closeout immutability:** do coordinators ever need “unlock edit” for honest mistakes in week one?
5. **In Progress state:** mandatory tap or infer only on submit?
6. **Technician sees jobs:** strictly **appointment = today** or rolling ±N days?
7. **Multi-technician reassignment** after create—allowed or rare enough to defer?
8. **Offline / flaky network:** hard fail with message vs optimistic draft in localStorage?
9. **Onboarding:** self-serve org signup vs manual seed for pilot?
10. **Localization:** Finnish-only UI for MVP vs EN/FI toggle?
11. **Customer PII retention:** default retention period and deletion request process.
12. **Auth method:** magic link (email dependency for **auth only**—may be acceptable vs SMS) vs password vs social—**email for auth is not same as product notification email**; decide explicitly.
13. **`Completed` vs `Invoice Ready`:** pilot may prefer **auto-advance** to `Invoice Ready` on submit to reduce office taps—if so, amend PRD (whether `Completed` is omitted or only internal).

---

## Document control

| Version | Date       | Notes                                                                                                                                     |
| ------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 0.1     | 2026-05-07 | Initial PRD from MVP + product docs synthesis.                                                                                            |
| 0.2     | 2026-05-07 | Aligned state machine with MVP (`Scheduled` → `In Progress` → `Completed` → `Invoice Ready`); added office release step + FR renumbering. |

Update version row when scope or acceptance criteria change.
