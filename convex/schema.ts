import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'
import { authTables } from '@convex-dev/auth/server'

/**
 * `authTables` supplies users, sessions, and related auth indexes for Convex Auth.
 * Add product tables alongside these as the app grows.
 */
export default defineSchema({
  ...authTables,
  organizations: defineTable({
    name: v.string(),
    slug: v.string(),
  }).index('by_slug', ['slug']),
  profiles: defineTable({
    userId: v.id('users'),
    organizationId: v.id('organizations'),
    role: v.union(v.literal('office'), v.literal('technician')),
    displayName: v.string(),
  })
    .index('by_userId', ['userId'])
    .index('by_organizationId', ['organizationId']),
  jobs: defineTable({
    organizationId: v.id('organizations'),
    customerName: v.string(),
    customerAddress: v.string(),
    appointmentDate: v.number(),
    problemDescription: v.string(),
    assignedTechnicianId: v.id('users'),
    status: v.union(
      v.literal('scheduled'),
      v.literal('in_progress'),
      v.literal('completed'),
      v.literal('invoice_ready'),
    ),
    createdByUserId: v.id('users'),
    workCompleted: v.union(v.string(), v.null()),
    materialsUsed: v.union(v.string(), v.null()),
    notes: v.union(v.string(), v.null()),
    laborHours: v.union(v.number(), v.null()),
    photoStorageIds: v.array(v.string()),
    signatureStorageId: v.optional(v.string()),
    submittedAt: v.optional(v.number()),
    submittedByTechnicianId: v.optional(v.id('users')),
    releasedForInvoiceAt: v.optional(v.number()),
    releasedByUserId: v.optional(v.id('users')),
    closeoutViewedAt: v.optional(v.number()),
  })
    .index('by_organization', ['organizationId'])
    .index('by_organization_and_status', ['organizationId', 'status'])
    .index('by_technician_and_day', ['assignedTechnicianId', 'appointmentDate']),
})
