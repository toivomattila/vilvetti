# Product avatar (ideal customer profile)

This document defines the **primary audience** the product is designed for. Product and engineering decisions should be checked against this profile.

## One-line summary

Owner-operated residential heat pump maintenance companies with **3–20 employees**, where **technicians complete multiple jobs per day** and **office staff manually chase missing job information before invoicing**.

## Firm profile

| Dimension | Assumption |
| --- | --- |
| **Ownership** | Owner-operated (decision-maker is close to day-to-day operations). |
| **Trade / domain** | Residential **heat pump** maintenance (not generic “any HVAC” unless we broaden this doc deliberately). |
| **Size** | **3–20 employees** — small enough that roles blur; large enough for scheduling and handoff friction. |
| **Technician work pattern** | **Multiple jobs per day** per technician — context switching, mobile use, and incomplete same-day capture are normal. |
| **Back-office pain** | **Manual chasing** of missing job details **before invoicing** — billing is blocked or delayed by information gaps from the field. |

## What we optimize for

When trade-offs appear, prefer outcomes that:

1. Reduce **time from job complete to invoice-ready** by making job information **complete and structured** without extra office chasing.
2. Fit **technicians on the move** (quick inputs, minimal friction between jobs).
3. Respect **small teams** (simple permissions, low admin overhead, no enterprise-only assumptions).

## Out of scope (until we change this doc)

Companies that are a poor default fit include: large commercial-only fleets, pure dispatch software buyers with no invoicing pain, or orgs where job data is already fully captured in another system of record with no gap before billing.

_Update this section when we intentionally expand or narrow the ICP._
