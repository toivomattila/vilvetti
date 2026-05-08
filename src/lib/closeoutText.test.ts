import { describe, expect, it } from 'vitest'

import { buildCloseoutPasteText } from './closeoutText'

const baseInput = {
  customerName: 'Test Customer Oy',
  customerAddress: 'Testikatu 1, 00100 Helsinki',
  appointmentDateMs: Date.UTC(2026, 4, 8),
  technicianDisplayName: 'P. Teknikko',
  problemDescription: 'Vuotava hana keittiössä.',
  workCompleted: 'Vaihdettiin tiivisteet.',
  laborHours: 1.5,
  materialsUsed: 'Tiiviste A-12',
  notes: 'Asiakas tyytyväinen.',
  submittedAt: Date.UTC(2026, 4, 8, 14, 30, 0),
  submittedByDisplayName: 'P. Teknikko',
} as const

describe('buildCloseoutPasteText', () => {
  it('builds a full multi-section summary', () => {
    expect(buildCloseoutPasteText(baseInput)).toMatchInlineSnapshot(`
      "Asiakas / Customer: Test Customer Oy
      Osoite / Address: Testikatu 1, 00100 Helsinki
      Aika / Appointment: May 8, 2026
      Teknikko / Technician: P. Teknikko

      Kuvaus / Problem:
      Vuotava hana keittiössä.

      Työ tehty / Work completed: Vaihdettiin tiivisteet.
      Tunnit / Labor hours: 1.5
      Materiaalit / Materials: Tiiviste A-12
      Muistiinpanot / Notes: Asiakas tyytyväinen.

      Lähetetty / Submitted: 5/8/26, 2:30 PM (UTC)
      Lähettäjä / Submitted by: P. Teknikko"
    `)
  })

  it('omits optional blocks when empty', () => {
    const text = buildCloseoutPasteText({
      customerName: 'Slim Oy',
      customerAddress: 'Piha 2',
      appointmentDateMs: Date.UTC(2026, 0, 1),
      technicianDisplayName: null,
      problemDescription: '   ',
      workCompleted: null,
      laborHours: null,
      materialsUsed: null,
      notes: null,
    })
    expect(text).toBe(
      [
        'Asiakas / Customer: Slim Oy',
        'Osoite / Address: Piha 2',
        'Aika / Appointment: Jan 1, 2026',
      ].join('\n'),
    )
  })
})
