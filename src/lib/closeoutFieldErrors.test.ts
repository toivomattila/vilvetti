import { describe, expect, it } from 'vitest'
import {
  mapCloseoutServerError,
  validateCloseoutClient,
} from './closeoutFieldErrors'

describe('mapCloseoutServerError', () => {
  it('maps work completed', () => {
    expect(mapCloseoutServerError('Work completed is required.').field).toBe(
      'workCompleted',
    )
  })

  it('maps labor hours', () => {
    expect(
      mapCloseoutServerError('Labor hours must be between 0 and 24.').field,
    ).toBe('laborHours')
  })

  it('maps signature required', () => {
    expect(
      mapCloseoutServerError('Customer signature is required.').field,
    ).toBe('signature')
  })

  it('maps signature re-upload', () => {
    expect(
      mapCloseoutServerError(
        'Signature upload was missing—re-upload and try again.',
      ).field,
    ).toBe('signature')
  })

  it('maps photo errors', () => {
    expect(
      mapCloseoutServerError(
        'Photo upload was missing—re-upload and try again.',
      ).field,
    ).toBe('photos')
  })

  it('maps max photos message', () => {
    expect(
      mapCloseoutServerError('You can upload at most 12 closeout photos.')
        .field,
    ).toBe('photos')
  })

  it('falls back to form for unrelated errors', () => {
    expect(
      mapCloseoutServerError('Only scheduled jobs can be started.').field,
    ).toBe('form')
  })
})

describe('validateCloseoutClient', () => {
  it('returns errors for invalid inputs', () => {
    const errs = validateCloseoutClient({
      workCompleted: '   ',
      laborHoursRaw: NaN,
      hasSignature: false,
    })
    expect(errs.workCompleted).toBeTruthy()
    expect(errs.laborHours).toBeTruthy()
    expect(errs.signature).toBeTruthy()
  })

  it('passes when valid', () => {
    expect(
      validateCloseoutClient({
        workCompleted: 'Fixed leak',
        laborHoursRaw: 2,
        hasSignature: true,
      }),
    ).toEqual({})
  })
})
