import { describe, expect, it } from 'vitest'

import {
  MAX_CLOSEOUT_PHOTO_DIMENSION,
  computeScaledDimensions,
  imageDataHasTransparency,
} from './imageUploadPrep'

describe('computeScaledDimensions', () => {
  it('returns original dimensions when within max side', () => {
    expect(
      computeScaledDimensions(100, 200, MAX_CLOSEOUT_PHOTO_DIMENSION),
    ).toEqual({
      width: 100,
      height: 200,
    })
  })

  it('scales down proportionally so the longest side equals max', () => {
    expect(computeScaledDimensions(4000, 2000, 2048)).toEqual({
      width: 2048,
      height: 1024,
    })
  })

  it('handles square sources', () => {
    expect(computeScaledDimensions(3000, 3000, 2048)).toEqual({
      width: 2048,
      height: 2048,
    })
  })
})

describe('imageDataHasTransparency', () => {
  it('returns true when sampled pixels include partial alpha', () => {
    const data = new Uint8ClampedArray(4)
    data[3] = 200
    expect(imageDataHasTransparency({ data, width: 1, height: 1 })).toBe(true)
  })

  it('returns false when alpha is fully opaque', () => {
    const data = new Uint8ClampedArray(4)
    data[0] = 10
    data[1] = 20
    data[2] = 30
    data[3] = 255
    expect(imageDataHasTransparency({ data, width: 1, height: 1 })).toBe(false)
  })
})
