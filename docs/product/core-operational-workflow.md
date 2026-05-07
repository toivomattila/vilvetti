# Core Operational Workflow

This section describes the **end-to-end operational workflow** for the target customer avatar.

The goal is to define:

- who participates in the workflow
- what each person is responsible for
- how information moves
- where operational dependencies exist

---

# People Involved

## 1. Customer

**Example name:** Matti Virtanen

**Role:** Residential customer receiving HVAC / heat pump maintenance or repair service.

**Responsibilities:**

- Reports issue or books maintenance
- Provides property access
- Describes symptoms/problems
- Confirms completed work
- Pays invoice

**Information they provide:**

- Contact information
- Address
- Equipment/system issue
- Availability
- Approval/signature

**Pain points:**

- Repeating information multiple times
- Waiting for technician updates
- Invoice confusion
- Lack of visibility into previous maintenance history

---

## 2. Office Coordinator / Owner

**Example name:** Jari

**Role:** Coordinates field operations and acts as the **operational hub** of the company.

In small companies this person often:

- answers customer calls
- schedules jobs
- dispatches technicians
- handles invoicing
- resolves operational issues
- manages customer communication

**Responsibilities:**

- Create jobs
- Assign technicians
- Coordinate schedules
- Track job completion
- Collect missing information
- Prepare invoices
- Maintain customer relationships

**Information they manage:**

- Customer details
- Scheduling
- Technician assignments
- Job status
- Materials/hours
- Invoice information

**Pain points:**

- Constant interruptions
- Chasing technicians for missing details
- Reconstructing completed jobs from fragmented information
- Delayed invoicing
- Operational visibility gaps
- High coordination overhead

**Operational importance:** This person is usually the **operational bottleneck** of the company.

---

## 3. Field Technician

**Example name:** Mikko

**Role:** Performs maintenance, repair, and installation work in the field.

**Responsibilities:**

- Travel to customer site
- Inspect HVAC / heat pump systems
- Perform maintenance or repairs
- Replace parts/materials
- Document work completed
- Communicate findings
- Inform customer about issues/recommendations

**Information generated:**

- Work completed
- Labor hours
- Materials used
- Photos
- Maintenance notes
- Additional issues found
- Follow-up recommendations

**Pain points:**

- Receiving incomplete job information
- Switching between multiple jobs daily
- Reporting details after work already completed
- Forgetting materials or notes
- Administrative reporting burden

**Operational reality:** The technician's primary focus is **field work**, not structured reporting.

---

# End-to-End Workflow

## Step 1 — Customer Contacts Company

**Participants:**

- Customer
- Office coordinator

**Example:** Customer calls because heat pump performance has weakened or annual maintenance is needed.

**Information exchanged:**

- Problem description
- Address
- Customer details
- Availability

**Output:** Potential maintenance/service job.

---

## Step 2 — Office Coordinator Creates Job

**Participants:**

- Office coordinator

**Actions:**

- Records customer details
- Schedules visit
- Assigns technician
- Shares job details

**Current tools often include:**

- Calendar
- Spreadsheet
- WhatsApp
- Paper notes
- Accounting software

**Output:** Assigned service visit.

---

## Step 3 — Technician Receives Assignment

**Participants:**

- Office coordinator
- Technician

**Information transferred:**

- Customer address
- Contact information
- Problem description
- Appointment time

**Common communication methods:**

- WhatsApp
- Phone call
- SMS
- Shared calendar

**Output:** Technician travels to job site.

---

## Step 4 — Technician Performs Service Visit

**Participants:**

- Technician
- Customer

**Actions:**

- Inspects equipment
- Performs maintenance/repair
- Replaces materials/parts
- Takes photos
- Writes notes
- Discusses findings with customer

**Information generated:**

- Work completed
- Materials used
- Hours worked
- Photos
- Additional issues
- Recommendations

**Critical operational fact:** This is where **most valuable operational information** is created.

---

## Step 5 — Technician Reports Completion

**Participants:**

- Technician
- Office coordinator

**Actions:**

- Technician communicates what happened during the visit
- Office attempts to collect invoice-required information

**Typical information transferred:**

- Work completed
- Materials used
- Labor hours
- Additional findings
- Photos

**Current communication methods:**

- WhatsApp
- Phone calls
- Verbal conversation
- Paper notes

**Critical workflow dependency:** The office cannot properly continue until this information is complete.

This is the **primary operational bottleneck** in the workflow.

---

## Step 6 — Office Prepares Invoice

**Participants:**

- Office coordinator

**Actions:**

- Reviews technician information
- Calculates labor/materials
- Creates invoice
- Sends invoice to customer

**Required information:**

- Accurate work description
- Labor hours
- Materials/parts
- Pricing
- Customer confirmation

**Operational dependency:** Invoice creation depends **entirely** on technician reporting quality.

---

# Core Information Flow

```text
Customer → Office Coordinator → Technician → Office Coordinator → Invoice → Customer
```

**The most fragile handoff is:** Technician → Office Coordinator

That handoff determines:

- invoicing speed
- operational visibility
- maintenance history quality
- admin workload
- customer clarity
- cashflow timing

---

# Central Operational Dependency

The entire business depends on converting:

**completed field work**

into:

**structured invoice-ready operational data.**

That conversion process is currently:

- manual
- fragmented
- inconsistent
- memory-dependent
- interruption-heavy
- delay-prone
