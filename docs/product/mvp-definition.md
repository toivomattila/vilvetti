# Brutally Minimal MVP Definition

## Core Pain Point

Technicians complete field service visits, but office staff cannot invoice the job without manually chasing missing information afterward.

Missing information commonly includes:

- work completed
- materials used
- labor hours
- photos
- maintenance notes
- customer confirmation

---

# Who Experiences The Pain

## Direct operational pain

Office coordinator / owner.

This person:

- interrupts technicians for missing details
- reconstructs jobs manually
- delays invoicing
- handles customer confusion
- manages fragmented operational information

---

## Secondary operational pain

Technicians.

They:

- receive follow-up calls later
- must remember past jobs from memory
- resend photos/details manually
- experience reporting friction

---

## Financial pain

Business owner.

Effects:

- delayed cashflow
- slower invoicing
- underbilling risk
- admin overhead
- operational inefficiency

---

# Why Businesses Would Pay

The pain is:

- daily
- repetitive
- operationally central
- directly tied to invoicing and cashflow
- emotionally frustrating
- interruption-heavy

The business does not want:

"better software"

The business wants:

"jobs to become invoice-ready immediately after completion."

---

# Core Workflow The MVP Must Solve

The MVP solves exactly one workflow:

1. Office creates job
2. Technician performs visit
3. Technician submits structured closeout
4. Office receives invoice-ready job information

That is the entire product.

---

# Minimum Required Roles

## 1. Office Coordinator / Owner

Creates jobs and reviews completed jobs.

## 2. Technician

Completes structured job closeout in the field.

No other roles required.

---

# Minimum Required Data

## Job

- customer name
- address
- appointment date
- assigned technician
- job status

## Technician closeout

- work completed
- labor hours
- materials used
- notes
- photos
- customer signature

Nothing else initially.

---

# Minimum Required Actions

## Office coordinator

- create job
- assign technician
- mark job scheduled
- review completed closeout

## Technician

- open assigned job
- upload photos
- enter notes
- enter labor hours
- enter materials used
- collect customer signature
- mark job completed

---

# Minimum Required Screens

## 1. Login

Very simple authentication.

---

## 2. Office Job List

Shows:

- scheduled jobs
- completed jobs
- invoice-ready jobs

No analytics.

No dashboards.

---

## 3. Create Job Screen

Fields:

- customer name
- address
- technician
- appointment date
- notes/problem description

---

## 4. Technician Assigned Jobs Screen

Shows:

- today's assigned jobs

---

## 5. Technician Job Closeout Screen

Fields:

- work completed
- hours
- materials
- notes
- photos
- signature

Most important screen in the product.

---

## 6. Completed Job View

Office can review submitted closeout.

That is enough for MVP.

---

# Minimum Required Notifications

**Constraint (for now):** everything stays **in the product**—no email, SMS, or other channels that depend on external messaging providers. Assignment and completion are visible when each role opens the app (e.g. updated lists, status, or in-app indicators).

## Technician assignment notification

Technician sees newly assigned work **in app** (assigned jobs list / refreshed job data). No separate outbound notification channel in the first version.

## Job completed notification

Office sees that a closeout was submitted **in app** (e.g. job moves to completed or invoice-ready, list/badge updates when they open the app).

**This is required** (as in-app visibility when the coordinator uses the product—not as an external alert).

---

# Minimum Required State Transitions

Scheduled  
→ In Progress  
→ Completed  
→ Invoice Ready

Nothing more.

No custom workflows.

---

# What The MVP Should NOT Do

The MVP should NOT:

- generate invoices
- integrate with accounting systems
- optimize routes
- manage payroll
- manage inventory
- support multiple branches
- support enterprise permissions
- provide analytics
- provide dashboards
- provide AI summaries
- automate scheduling
- support quoting workflows
- support recurring billing
- support complex maintenance histories

---

# What Users Can Continue Handling Manually

Users can still:

- schedule jobs manually
- send technician assignments through WhatsApp
- create invoices manually
- handle accounting externally
- manage customer communication manually
- manage pricing externally

The MVP only solves:

structured job closeout.

---

# Operational Pain Intentionally Ignored Initially

Ignored intentionally:

- scheduling optimization
- customer acquisition
- CRM
- inventory tracking
- accounting automation
- procurement
- technician GPS tracking
- route planning
- advanced reporting
- business analytics
- compliance workflows

These are outside the core bottleneck.

---

# Core Loop

Office creates job  
→ Technician performs visit  
→ Technician submits structured closeout  
→ Office receives invoice-ready information

This is the entire core loop.

---

# Smallest Possible End-to-End Workflow

## Office

Creates maintenance job.

## Technician

Opens assigned job on phone after visit.

Fills:

- work completed
- hours
- materials
- photos
- signature

Submits.

## Office

Immediately sees complete closeout packet.

Can now create invoice externally.

Done.

---

# Minimum Feature Set Before Real Testing

The product becomes testable once:

- office can create jobs
- technician can complete closeout
- office can review completed closeout

That alone is enough to validate the workflow.

---

# Brutally Minimal MVP

A mobile-first technician closeout app for small Finnish HVAC / heat pump maintenance companies.

The app exists for one reason:

Convert completed field work into structured invoice-ready operational data immediately after the service visit.

Nothing else.

---

# Ideal First Customer

Independent Finnish HVAC / heat pump maintenance company with:

- 4–15 employees
- multiple technicians
- recurring residential service visits
- owner/operator involved daily
- invoicing handled manually or semi-manually
- operational coordination through phone/WhatsApp/spreadsheets

---

# Ideal First Deployment Scenario

One office coordinator.

2–5 technicians.

The company uses the product only for:

- technician closeout
- collecting invoice-required information

All other workflows remain unchanged initially.
