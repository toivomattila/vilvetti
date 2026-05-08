import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import {
  getProfileForUser,
  requireAuthenticatedUserId,
  requireOfficeContext,
} from './lib/profileAccess'

function normalizeSlug(rawSlug: string): string {
  return rawSlug.trim().toLowerCase()
}

function normalizeDisplayName(rawDisplayName: string): string {
  return rawDisplayName.trim()
}

/** 16 random bytes → 32 hex chars (128-bit entropy). */
function generateTechnicianInviteCode(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Length-normalized constant-time comparison for invite codes (both trimmed).
 * Avoids early exit on first differing character.
 */
function constantTimeInviteCodeEqual(a: string, b: string): boolean {
  const ta = a.trim()
  const tb = b.trim()
  if (ta.length !== tb.length) {
    return false
  }
  let diff = 0
  for (let i = 0; i < ta.length; i++) {
    diff |= ta.charCodeAt(i) ^ tb.charCodeAt(i)
  }
  return diff === 0
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

    if (profile.role === 'technician') {
      return {
        profile,
        organization: {
          _id: organization._id,
          name: organization.name,
          slug: organization.slug,
        },
      }
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

    const technicianInviteCode = generateTechnicianInviteCode()

    const organizationId = await ctx.db.insert('organizations', {
      name: organizationName,
      slug,
      technicianInviteCode,
    })

    const profileId = await ctx.db.insert('profiles', {
      userId,
      organizationId,
      role: 'office',
      displayName,
    })

    return { organizationId, profileId, technicianInviteCode }
  },
})

export const joinOrganizationAsTechnician = mutation({
  args: {
    slug: v.string(),
    displayName: v.string(),
    inviteCode: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthenticatedUserId(ctx)
    const existingProfile = await getProfileForUser(ctx, userId)
    if (existingProfile) {
      throw new Error('You already have a profile.')
    }

    const slug = normalizeSlug(args.slug)
    const displayName = normalizeDisplayName(args.displayName)
    const inviteCode = args.inviteCode.trim()
    if (!slug) {
      throw new Error('Organization slug is required.')
    }
    if (!displayName) {
      throw new Error('Display name is required.')
    }
    if (!inviteCode) {
      throw new Error('Technician invite code is required.')
    }

    const organization = await ctx.db
      .query('organizations')
      .withIndex('by_slug', (q) => q.eq('slug', slug))
      .unique()
    if (!organization) {
      throw new Error(
        'Organization not found. Check the slug and invite code and try again.',
      )
    }

    if (!organization.technicianInviteCode) {
      throw new Error(
        'This organization has not set up a technician invite code yet. Ask your office coordinator to sign in on the office app and use “Show / refresh technician invite code” on the jobs page to generate one.',
      )
    }

    if (
      !constantTimeInviteCodeEqual(
        inviteCode,
        organization.technicianInviteCode,
      )
    ) {
      throw new Error('Invalid technician invite code.')
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

export const ensureTechnicianInviteCode = mutation({
  args: {},
  handler: async (ctx) => {
    const { profile } = await requireOfficeContext(ctx)
    const org = await ctx.db.get(profile.organizationId)
    if (!org) {
      throw new Error('Organization not found.')
    }
    if (org.technicianInviteCode) {
      return { technicianInviteCode: org.technicianInviteCode }
    }
    const technicianInviteCode = generateTechnicianInviteCode()
    await ctx.db.patch(org._id, { technicianInviteCode })
    return { technicianInviteCode }
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
