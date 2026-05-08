import { convexTest } from 'convex-test'
import { describe, expect, test } from 'vitest'
import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob(['./**/*.*s', '!./**/*.test.*'])

describe('jobs API — unauthenticated callers', () => {
  test('listOfficeJobs throws Authentication required', async () => {
    const t = convexTest(schema, modules)
    await expect(
      t.query(api.jobs.listOfficeJobs, {
        paginationOpts: { numItems: 10, cursor: null },
      }),
    ).rejects.toThrow('Authentication required.')
  })

  test('listTechnicianJobsForDay throws Authentication required', async () => {
    const t = convexTest(schema, modules)
    await expect(
      t.query(api.jobs.listTechnicianJobsForDay, {
        dayStartMs: 0,
      }),
    ).rejects.toThrow('Authentication required.')
  })

  test('createJob throws Authentication required', async () => {
    const t = convexTest(schema, modules)
    const assignedTechnicianId = await t.run(async (ctx) => {
      return await ctx.db.insert('users', {
        name: 'Technician',
        email: 'tech@example.test',
      })
    })
    await expect(
      t.mutation(api.jobs.createJob, {
        customerName: 'Customer',
        customerAddress: '1 Test St',
        appointmentDate: 1_700_000_000_000,
        problemDescription: 'Example',
        assignedTechnicianId,
      }),
    ).rejects.toThrow('Authentication required.')
  })
})
