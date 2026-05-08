# Pilot metrics — outside-the-app measurement

**Purpose:** Measure the [PRD §3 “Measurable improvements”](prd.md#3-goals) without building analytics in the product. Use a **small log** (sheet, paper, or shared doc) for **operational truth**; keep definitions stable for the pilot month.

**Principle:** One **row per job** (or one row per chase event where noted). Record **immediately** when the event happens so memory does not bias counts.

---

## 1. Shared columns (all jobs in pilot cohort)

Use these on every pilot job row so rates and lags are computable later.

| Column                           | What to enter                                                                                                                |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Job ID / ref**                 | Stable identifier (app job id, ticket number, or customer+date slugs—pick one scheme for the pilot).                         |
| **Visit date**                   | Calendar date the visit happened (local time).                                                                               |
| **Assigned to pilot product?**   | Yes / No — only **Yes** rows count for in-app metrics.                                                                       |
| **Job visible to technician at** | First moment the technician could see the assignment in-app (first list load after assignment; approximate ok ±15 min).      |
| **Closeout submitted at**        | Timestamp when technician tapped submit (from app if shown; else coordinator notes time). **Empty** if not submitted.        |
| **Reached Invoice Ready**        | Yes / No / N/A — **Yes** if job hit **Invoice Ready** in app (submitted closeout + office release if your workflow uses it). |
| **Invoice issued date**          | Date invoice exists in your invoicing tool (bookkeeping date). **Empty** if not yet invoiced.                                |
| **Notes**                        | Free text for exceptions (reassignment, wrong job, customer cancelled).                                                      |

**Derived fields (fill in sheet formulas or end-of-week):**

- **Time to first complete closeout (minutes)**  
  `= (Closeout submitted at) − (Job visible to technician at)`  
  Only for rows where closeout was submitted.

- **Invoice lag (days)**  
  `= Invoice issued date − Visit date`  
  Only where both dates exist.

- **Closeout submission rate (pilot)**  
  `= COUNT(Reached Invoice Ready = Yes among Assigned = Yes) / COUNT(Assigned = Yes)`  
  Use the PRD meaning: jobs that **reached Invoice Ready** with a **submitted** closeout vs assigned jobs in cohort.

---

## 2. Chase events log (per follow-up)

**Definition:** Count **office-initiated** follow-ups **specifically** for **missing closeout / invoice fields** after the visit—not general scheduling or customer courtesy calls.

| Column            | What to enter                                                                                 |
| ----------------- | --------------------------------------------------------------------------------------------- |
| **Date/time**     | When the chase happened.                                                                      |
| **Job ID / ref**  | Same ref as shared sheet.                                                                     |
| **Channel**       | Call / SMS / WhatsApp / email / in-person / other.                                            |
| **Purpose**       | Must tie to **missing closeout data** (e.g. “hours missing,” “photos,” “signature”).          |
| **Who initiated** | Office / technician / customer — **only count rows where initiator = Office** for PRD metric. |

**Chase events per job:** For each job, `COUNT` chase rows with **Office** initiator and eligible purpose. Pilot goal: **↓ toward zero** for jobs **Assigned to pilot product = Yes**.

---

## 3. Baseline month (invoice lag)

Before or parallel to pilot week one:

1. **Pick baseline month** (e.g. full calendar month before go-live).
2. On the **same shared columns** (or a duplicate tab), log **non-app** jobs or historical sample using **visit date** and **invoice issued date** from invoices/accounting.
3. Compare **median or average invoice lag** (days) **baseline vs pilot month**—direction **↓** per PRD.

---

## 4. Weekly sanity checklist

- [ ] All pilot jobs have **Job ID** and **Visit date**.
- [ ] **Job visible** and **Closeout submitted** times filled when known (estimate documented if exact time unknown).
- [ ] Chase log updated **same day** as calls/messages.
- [ ] **Invoice issued date** filled when invoice is created (not when paid).

---

## 5. Optional: minimum viable paper backup

If spreadsheets are awkward on site: **one line per chase** in a notebook with date, job name, and “missing field X”—transfer to the sheet weekly. The **job-level sheet** can stay office-only.

---

**Related:** [PRD §3 Goals](prd.md#3-goals), [MVP definition](mvp-definition.md).
