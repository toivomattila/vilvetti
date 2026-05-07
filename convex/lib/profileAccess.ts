import { getAuthUserId } from '@convex-dev/auth/server'
import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'

type DbAuthCtx =
  | Pick<QueryCtx, 'db' | 'auth'>
  | Pick<MutationCtx, 'db' | 'auth'>

export async function requireAuthenticatedUserId(
  ctx: DbAuthCtx,
): Promise<Id<'users'>> {
  const userId = await getAuthUserId(ctx)
  if (!userId) {
    throw new Error('Authentication required.')
  }
  return userId
}

export async function getProfileForUser(
  ctx: DbAuthCtx,
  userId: Id<'users'>,
): Promise<Doc<'profiles'> | null> {
  return await ctx.db
    .query('profiles')
    .withIndex('by_userId', (q) => q.eq('userId', userId))
    .unique()
}

export async function requireProfileForUser(
  ctx: DbAuthCtx,
  userId: Id<'users'>,
): Promise<Doc<'profiles'>> {
  const profile = await getProfileForUser(ctx, userId)
  if (!profile) {
    throw new Error('You must complete organization setup first.')
  }
  return profile
}

export function requireOfficeRole(profile: Doc<'profiles'>): void {
  if (profile.role !== 'office') {
    throw new Error('Office role required.')
  }
}

export function requireTechnicianRole(profile: Doc<'profiles'>): void {
  if (profile.role !== 'technician') {
    throw new Error('Technician role required.')
  }
}
