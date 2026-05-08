import { describe, expect, it } from 'vitest'

import { isCloseoutSubmitted } from './jobs'

describe('isCloseoutSubmitted', () => {
  it('is true when status is completed or invoice_ready', () => {
    expect(
      isCloseoutSubmitted({ status: 'completed', submittedAt: undefined }),
    ).toBe(true)
    expect(
      isCloseoutSubmitted({ status: 'invoice_ready', submittedAt: undefined }),
    ).toBe(true)
  })

  it('is false for earlier lifecycle statuses without submittedAt', () => {
    expect(
      isCloseoutSubmitted({ status: 'scheduled', submittedAt: undefined }),
    ).toBe(false)
    expect(
      isCloseoutSubmitted({ status: 'in_progress', submittedAt: undefined }),
    ).toBe(false)
  })

  it('is true when submittedAt is set even if status is not terminal', () => {
    expect(
      isCloseoutSubmitted({
        status: 'in_progress',
        submittedAt: 1,
      }),
    ).toBe(true)
  })
})
