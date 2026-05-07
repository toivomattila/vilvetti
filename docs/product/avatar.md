# Primary customer avatar

This is the default “who we’re building for” when requirements are ambiguous. It is a composite persona, not a single real company.

## Snapshot

A **Finnish HVAC / heat pump maintenance** business with **roughly 4–12 employees**, focused on **recurring residential service visits**. The **owner still works in operations** (not a pure back-office executive). **Invoicing and margins depend on technicians reporting job details correctly**—materials, time on site, work performed, and follow-up needs must make it from the field into billing without friction or guesswork.

## What this implies for the product

- **Small team, high trust, low tolerance for admin overhead.** Flows should stay short; defaults and mobile-first matter.
- **Recurring work is the spine of the business.** Scheduling, route density, and “next visit” context are first-class—not only one-off installs.
- **Owner is often in the field.** They need the same clarity as dispatch, sometimes switching hats in one day.
- **Billing integrity = field reporting quality.** Capture at the moment of work beats reconstructing from memory; validation and gentle completeness nudges beat punitive forms.
- **Finland / HVAC context.** Metric units, local norms for seasons and heating-dominated loads, and Finnish language expectations in UI and comms when the product ships for this market.

## Anti-patterns (things this avatar is *not*)

- Enterprise facilities with dedicated asset managers and procurement portals.
- Pure project-based commercial construction with long Gantt horizons and no recurrence.
- Teams where invoicing is entirely decoupled from technician input (e.g. fixed retainers only).

When a feature only serves those patterns, treat it as lower priority unless another avatar is explicitly adopted.
