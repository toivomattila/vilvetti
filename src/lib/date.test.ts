import { describe, expect, it } from 'vitest'

import {
  appointmentDateMsToDateInputValue,
  dateInputValueToAppointmentDateMs,
} from './date'

// These helpers encode the calendar day as UTC midnight (Date.UTC) and decode
// with getUTC*(), so round-trips are stable regardless of the host timezone.

describe('dateInputValueToAppointmentDateMs / appointmentDateMsToDateInputValue', () => {
  it('round-trips concrete dates (UTC composition)', () => {
    const samples = ['2026-01-05', '2024-02-29', '2000-12-31'] as const

    for (const value of samples) {
      const ms = dateInputValueToAppointmentDateMs(value)
      expect(appointmentDateMsToDateInputValue(ms)).toBe(value)
    }
  })

  it('throws when the date string is not YYYY-MM-DD with all parts', () => {
    expect(() => dateInputValueToAppointmentDateMs('')).toThrow(
      'Please choose a valid date.',
    )
    expect(() => dateInputValueToAppointmentDateMs('2026-01')).toThrow(
      'Please choose a valid date.',
    )
    expect(() => dateInputValueToAppointmentDateMs('2026')).toThrow(
      'Please choose a valid date.',
    )
    expect(() => dateInputValueToAppointmentDateMs('not-a-date')).toThrow(
      'Please choose a valid date.',
    )
  })
})
