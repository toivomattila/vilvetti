import { mutation } from './_generated/server'
import { requireAuthenticatedUserId } from './lib/profileAccess'

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAuthenticatedUserId(ctx)
    return await ctx.storage.generateUploadUrl()
  },
})
