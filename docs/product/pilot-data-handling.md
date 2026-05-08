# Pilot data handling (GDPR-oriented checklist)

**Purpose:** Give pilot teams a **practical inventory** of what Vilvetti stores and **conversation starters** for retention, export, and deletion—aligned with product reality, not legal interpretation.

**Not legal advice.** Final wording, policies, and contracts belong to **your counsel** and **your DPA** with Vilvetti / the data processor.

**Related:** [PRD §11 Constraints — Compliance](prd.md#11-constraints) (technical and compliance notes).

---

## 1. What Vilvetti stores (pilot-relevant)

Use this table with IT and business owners before go-live. Extend rows if your pilot captures extra fields.

| Category                | Examples in product                                                | Typical sensitivity                                  |
| ----------------------- | ------------------------------------------------------------------ | ---------------------------------------------------- |
| **Customer / site PII** | Name, service address, appointment date, problem/notes on the job  | Identifies individuals or households                 |
| **Operational content** | Work completed, labor hours, materials, free-text notes            | May repeat or imply PII                              |
| **Photos**              | Images attached to closeout (site, equipment, completion evidence) | Often identifies location/people; may be high volume |
| **Signatures**          | Customer acknowledgement / sign-off captured in app                | Strong identifier; tied to a specific visit          |

**Where it lives (high level):** application database (e.g. Convex) and **file/blob storage** for photos and signature payloads, under your **organization (tenant)** boundary and authenticated staff access—per implementation and hosting setup.

---

## 2. Retention — conversation items (no defaults imposed here)

Agree **who decides** policy (owner, DPO, counsel) and **what “done” means** for a job (e.g. after invoicing, after warranty window, statutory bookkeeping overlap). Topics to cover:

- **Business need:** How long is closeout evidence needed for disputes, warranties, or redo visits?
- **Minimization:** Can photos or notes be reduced after invoice (product capability may vary—confirm roadmap vs manual export + delete outside app)?
- **Employee devices:** Technicians use phones; confirm expectations for screenshots or copies **outside** the app (training + policy).
- **Subprocessors:** Where files and DB are hosted; ensure alignment with your registry of processing activities.

Capture decisions in your **internal register** or pilot runbook; link or attach **not** in this doc.

---

## 3. Export — placeholders

**Goal:** End customer or pilot org can receive a **structured copy** of what you hold about them / their jobs, when required by policy or regulation.

| Step                                                                   | Owner         | Status / notes             |
| ---------------------------------------------------------------------- | ------------- | -------------------------- |
| Define “data subject” vs “business customer” scope for export          | Legal / owner | _Fill in for pilot_        |
| Single-job vs full-org export format (JSON, PDF bundle, zip of photos) | Product / eng | _Fill in when implemented_ |
| SLA for responding to export requests                                  | Owner         | _Fill in_                  |
| Contact channel for requests                                           | Owner         | _Fill in_                  |

---

## 4. Deletion — placeholders

**Goal:** After retention expires or on valid request, data is **deleted or anonymized** per your policy and agreements.

| Step                                                                    | Owner         | Status / notes                |
| ----------------------------------------------------------------------- | ------------- | ----------------------------- |
| Define deletion triggers (time-based, request, end of contract)         | Legal / owner | _Fill in_                     |
| Hard delete vs soft-delete vs anonymization (what the product supports) | Eng           | _Fill in from implementation_ |
| Verification (how you prove deletion to auditors or customers)          | Owner         | _Fill in_                     |
| Backups / logs (retention of backups vs primary data)                   | Eng + legal   | _Fill in_                     |

---

## 5. Pilot sign-off (optional checklist)

- [ ] Stakeholders have reviewed **Section 1** against actual screens and schema.
- [ ] Retention topics in **Section 2** discussed and owner assigned.
- [ ] Export and deletion placeholders (**Sections 3–4**) have owners and target dates.
- [ ] Privacy policy / customer-facing text updated elsewhere (not duplicated here).

---

## Document control

| Version | Date       | Notes                                                              |
| ------- | ---------- | ------------------------------------------------------------------ |
| 0.1     | 2026-05-08 | Initial pilot checklist; placeholders for export/deletion process. |
