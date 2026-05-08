import { mutation } from './_generated/server'
import { v } from 'convex/values'
import { requireTechnicianContext } from './lib/profileAccess'

export const generateUploadUrl = mutation({
  args: {
    jobId: v.id('jobs'),
  },
  handler: async (ctx, args) => {
    const { userId, profile } = await requireTechnicianContext(ctx)
    const job = await ctx.db.get(args.jobId)
    if (!job || job.organizationId !== profile.organizationId) {
      throw new Error('Job not found.')
    }
    if (job.assignedTechnicianId !== userId) {
      throw new Error('You can only upload files for jobs assigned to you.')
    }
    if (job.status !== 'in_progress') {
      throw new Error('Uploads are only allowed while the job is in progress.')
    }
    return await ctx.storage.generateUploadUrl()
  },
})
