import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import {
  getProfileForUser,
  requireAuthenticatedUserId,
} from './lib/profileAccess'

function normalizeSlug(rawSlug: string): string {
  return rawSlug.trim().toLowerCase()
}

function normalizeDisplayName(rawDisplayName: string): string {
  return rawDisplayName.trim()
}

export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuthenticatedUserId(ctx)
    const profile = await getProfileForUser(ctx, userId)
    if (!profile) {
      return null
    }

    const organization = await ctx.db.get(profile.organizationId)
    if (!organization) {
      throw new Error('Organization not found for your profile.')
    }

    return { profile, organization }
  },
})

export const createOrganizationAndProfile = mutation({
  args: {
    organizationName: v.string(),
    slug: v.string(),
    displayName: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthenticatedUserId(ctx)
    const existingProfile = await getProfileForUser(ctx, userId)
    if (existingProfile) {
      throw new Error('You already have a profile.')
    }

    const organizationName = args.organizationName.trim()
    const slug = normalizeSlug(args.slug)
    const displayName = normalizeDisplayName(args.displayName)

    if (!organizationName) {
      throw new Error('Organization name is required.')
    }
    if (!slug) {
      throw new Error('Organization slug is required.')
    }
    if (!displayName) {
      throw new Error('Display name is required.')
    }

    const existingOrg = await ctx.db
      .query('organizations')
      .withIndex('by_slug', (q) => q.eq('slug', slug))
      .unique()
    if (existingOrg) {
      throw new Error('Organization slug is already in use.')
    }

    const organizationId = await ctx.db.insert('organizations', {
      name: organizationName,
      slug,
    })

    const profileId = await ctx.db.insert('profiles', {
      userId,
      organizationId,
      role: 'office',
      displayName,
    })

    return { organizationId, profileId }
  },
})

export const joinOrganizationAsTechnician = mutation({
  args: {
    slug: v.string(),
    displayName: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthenticatedUserId(ctx)
    const existingProfile = await getProfileForUser(ctx, userId)
    if (existingProfile) {
      throw new Error('You already have a profile.')
    }

    const slug = normalizeSlug(args.slug)
    const displayName = normalizeDisplayName(args.displayName)
    if (!slug) {
      throw new Error('Organization slug is required.')
    }
    if (!displayName) {
      throw new Error('Display name is required.')
    }

    const organization = await ctx.db
      .query('organizations')
      .withIndex('by_slug', (q) => q.eq('slug', slug))
      .unique()
    if (!organization) {
      throw new Error(
        'Organization not found. Check the join code and try again.',
      )
    }

    const profileId = await ctx.db.insert('profiles', {
      userId,
      organizationId: organization._id,
      role: 'technician',
      displayName,
    })

    return { profileId, organizationId: organization._id }
  },
})

export const listTechniciansInOrg = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuthenticatedUserId(ctx)
    const profile = await getProfileForUser(ctx, userId)
    if (!profile) {
      throw new Error('You must complete organization setup first.')
    }
    if (profile.role !== 'office') {
      throw new Error('Office role required.')
    }

    const technicianProfiles = await ctx.db
      .query('profiles')
      .withIndex('by_organizationId', (q) =>
        q.eq('organizationId', profile.organizationId),
      )
      .collect()

    return technicianProfiles
      .filter((technicianProfile) => technicianProfile.role === 'technician')
      .map((technicianProfile) => ({
        userId: technicianProfile.userId,
        displayName: technicianProfile.displayName,
      }))
  },
})
