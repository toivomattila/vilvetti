import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import type { Doc, Id } from './_generated/dataModel'
import type { MutationCtx, QueryCtx } from './_generated/server'
import {
  requireAuthenticatedUserId,
  requireOfficeRole,
  requireProfileForUser,
  requireTechnicianRole,
} from './lib/profileAccess'

const jobStatusValidator = v.union(
  v.literal('scheduled'),
  v.literal('in_progress'),
  v.literal('completed'),
  v.literal('invoice_ready'),
)

type DbAuthCtx =
  | Pick<QueryCtx, 'db' | 'auth'>
  | Pick<MutationCtx, 'db' | 'auth'>

async function requireOfficeContext(ctx: DbAuthCtx): Promise<{
  userId: Id<'users'>
  profile: Doc<'profiles'>
}> {
  const userId = await requireAuthenticatedUserId(ctx)
  const profile = await requireProfileForUser(ctx, userId)
  requireOfficeRole(profile)
  return { userId, profile }
}

async function requireTechnicianContext(ctx: DbAuthCtx): Promise<{
  userId: Id<'users'>
  profile: Doc<'profiles'>
}> {
  const userId = await requireAuthenticatedUserId(ctx)
  const profile = await requireProfileForUser(ctx, userId)
  requireTechnicianRole(profile)
  return { userId, profile }
}

function requireJobInOrganization(
  job: Doc<'jobs'> | null,
  organizationId: Id<'organizations'>,
): Doc<'jobs'> {
  if (!job || job.organizationId !== organizationId) {
    throw new Error('Job not found.')
  }
  return job
}

export const createJob = mutation({
  args: {
    customerName: v.string(),
    customerAddress: v.string(),
    appointmentDate: v.number(),
    problemDescription: v.string(),
    assignedTechnicianId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const { userId, profile } = await requireOfficeContext(ctx)

    const customerName = args.customerName.trim()
    const customerAddress = args.customerAddress.trim()
    const problemDescription = args.problemDescription.trim()

    if (!customerName) {
      throw new Error('Customer name is required.')
    }
    if (!customerAddress) {
      throw new Error('Customer address is required.')
    }
    if (!problemDescription) {
      throw new Error('Problem description is required.')
    }

    const technicianProfile = await ctx.db
      .query('profiles')
      .withIndex('by_userId', (q) => q.eq('userId', args.assignedTechnicianId))
      .unique()
    if (
      !technicianProfile ||
      technicianProfile.organizationId !== profile.organizationId ||
      technicianProfile.role !== 'technician'
    ) {
      throw new Error(
        'Assigned technician must be a technician in your organization.',
      )
    }

    return await ctx.db.insert('jobs', {
      organizationId: profile.organizationId,
      customerName,
      customerAddress,
      appointmentDate: args.appointmentDate,
      problemDescription,
      assignedTechnicianId: args.assignedTechnicianId,
      status: 'scheduled',
      createdByUserId: userId,
      workCompleted: null,
      materialsUsed: null,
      notes: null,
      laborHours: null,
      photoStorageIds: [],
    })
  },
})

export const listOfficeJobs = query({
  args: {
    status: v.optional(jobStatusValidator),
  },
  handler: async (ctx, args) => {
    const { profile } = await requireOfficeContext(ctx)
    const status = args.status

    const jobs =
      status === undefined
        ? await ctx.db
            .query('jobs')
            .withIndex('by_organization', (q) =>
              q.eq('organizationId', profile.organizationId),
            )
            .order('desc')
            .collect()
        : await ctx.db
            .query('jobs')
            .withIndex('by_organization_and_status', (q) =>
              q
                .eq('organizationId', profile.organizationId)
                .eq('status', status),
            )
            .order('desc')
            .collect()

    const profiles = await ctx.db
      .query('profiles')
      .withIndex('by_organizationId', (q) =>
        q.eq('organizationId', profile.organizationId),
      )
      .collect()
    const technicianNameByUserId = new Map(
      profiles
        .filter((p) => p.role === 'technician')
        .map((p) => [p.userId, p.displayName]),
    )

    return jobs.map((job) => ({
      ...job,
      technicianDisplayName:
        technicianNameByUserId.get(job.assignedTechnicianId) ?? null,
    }))
  },
})

export const listTechnicianJobsForDay = query({
  args: {
    dayStartMs: v.number(),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireTechnicianContext(ctx)
    return await ctx.db
      .query('jobs')
      .withIndex('by_technician_and_day', (q) =>
        q.eq('assignedTechnicianId', userId).eq('appointmentDate', args.dayStartMs),
      )
      .order('desc')
      .collect()
  },
})

export const getJob = query({
  args: {
    jobId: v.id('jobs'),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthenticatedUserId(ctx)
    const profile = await requireProfileForUser(ctx, userId)
    const job = await ctx.db.get(args.jobId)

    if (profile.role === 'office') {
      requireJobInOrganization(job, profile.organizationId)
    } else {
      requireTechnicianRole(profile)
      const foundJob = requireJobInOrganization(job, profile.organizationId)
      if (foundJob.assignedTechnicianId !== userId) {
        throw new Error('You can only view jobs assigned to you.')
      }
    }

    const checkedJob = requireJobInOrganization(job, profile.organizationId)
    const technicianProfile = await ctx.db
      .query('profiles')
      .withIndex('by_userId', (q) => q.eq('userId', checkedJob.assignedTechnicianId))
      .unique()

    const submittedByProfile = checkedJob.submittedByTechnicianId
      ? await ctx.db
          .query('profiles')
          .withIndex('by_userId', (q) =>
            q.eq('userId', checkedJob.submittedByTechnicianId),
          )
          .unique()
      : null

    return {
      job: checkedJob,
      technicianDisplayName:
        technicianProfile?.organizationId === checkedJob.organizationId
          ? technicianProfile.displayName
          : null,
      submittedBy: submittedByProfile
        ? {
            userId: submittedByProfile.userId,
            displayName: submittedByProfile.displayName,
          }
        : null,
    }
  },
})

export const startJob = mutation({
  args: {
    jobId: v.id('jobs'),
  },
  handler: async (ctx, args) => {
    const { userId, profile } = await requireTechnicianContext(ctx)
    const job = requireJobInOrganization(
      await ctx.db.get(args.jobId),
      profile.organizationId,
    )

    if (job.assignedTechnicianId !== userId) {
      throw new Error('You can only start jobs assigned to you.')
    }
    if (job.status !== 'scheduled') {
      throw new Error('Only scheduled jobs can be started.')
    }

    await ctx.db.patch(job._id, { status: 'in_progress' })
    return { ok: true }
  },
})

export const submitCloseout = mutation({
  args: {
    jobId: v.id('jobs'),
    workCompleted: v.string(),
    materialsUsed: v.string(),
    notes: v.string(),
    laborHours: v.number(),
    photoStorageIds: v.array(v.string()),
    signatureStorageId: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId, profile } = await requireTechnicianContext(ctx)
    const job = requireJobInOrganization(
      await ctx.db.get(args.jobId),
      profile.organizationId,
    )

    if (job.assignedTechnicianId !== userId) {
      throw new Error('You can only submit closeout for jobs assigned to you.')
    }
    if (job.status === 'completed' || job.status === 'invoice_ready') {
      throw new Error('Closeout is already submitted and cannot be edited.')
    }
    if (job.status !== 'in_progress') {
      throw new Error('Job must be in progress before submitting closeout.')
    }

    const workCompleted = args.workCompleted.trim()
    const signatureStorageId = args.signatureStorageId.trim()
    if (!workCompleted) {
      throw new Error('Work completed is required.')
    }
    if (Number.isNaN(args.laborHours) || args.laborHours < 0 || args.laborHours > 24) {
      throw new Error('Labor hours must be between 0 and 24.')
    }
    if (!signatureStorageId) {
      throw new Error('Customer signature is required.')
    }

    await ctx.db.patch(job._id, {
      status: 'completed',
      workCompleted,
      materialsUsed: args.materialsUsed,
      notes: args.notes,
      laborHours: args.laborHours,
      photoStorageIds: args.photoStorageIds,
      signatureStorageId,
      submittedAt: Date.now(),
      submittedByTechnicianId: userId,
    })

    return { ok: true }
  },
})

export const markCloseoutViewed = mutation({
  args: {
    jobId: v.id('jobs'),
  },
  handler: async (ctx, args) => {
    const { profile } = await requireOfficeContext(ctx)
    const job = requireJobInOrganization(
      await ctx.db.get(args.jobId),
      profile.organizationId,
    )

    if (job.status !== 'completed' && job.status !== 'invoice_ready') {
      throw new Error('Closeout can only be viewed after submission.')
    }

    if (!job.closeoutViewedAt) {
      await ctx.db.patch(job._id, { closeoutViewedAt: Date.now() })
    }

    return { ok: true }
  },
})

export const releaseForInvoicing = mutation({
  args: {
    jobId: v.id('jobs'),
  },
  handler: async (ctx, args) => {
    const { userId, profile } = await requireOfficeContext(ctx)
    const job = requireJobInOrganization(
      await ctx.db.get(args.jobId),
      profile.organizationId,
    )

    if (job.status !== 'completed') {
      throw new Error('Only completed jobs can be released for invoicing.')
    }
    if (!job.closeoutViewedAt) {
      throw new Error(
        'Open the closeout details before releasing the job for invoicing.',
      )
    }

    await ctx.db.patch(job._id, {
      status: 'invoice_ready',
      releasedForInvoiceAt: Date.now(),
      releasedByUserId: userId,
    })
    return { ok: true }
  },
})
