import { defineSchema } from 'convex/server'
import { authTables } from '@convex-dev/auth/server'

/**
 * `authTables` supplies users, sessions, and related auth indexes for Convex Auth.
 * Add product tables alongside these as the app grows.
 */
export default defineSchema({
  ...authTables,
})
