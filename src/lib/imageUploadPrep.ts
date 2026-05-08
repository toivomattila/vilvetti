/** Max encoded size per closeout photo before upload (bytes). */
export const MAX_CLOSEOUT_PHOTO_BYTES = 8 * 1024 * 1024

/** Max longest side in pixels after prep. */
export const MAX_CLOSEOUT_PHOTO_DIMENSION = 2048

const JPEG_QUALITIES_DESC = [0.92, 0.85, 0.78, 0.7, 0.62, 0.54, 0.46] as const

const WEBP_QUALITIES_DESC = [0.92, 0.85, 0.78, 0.7, 0.62, 0.54, 0.46] as const

const MIN_ENCODE_DIMENSION = 48

export type PreparedCloseoutPhoto = {
  blob: Blob
  fileName: string
}

/** Pixel grid for transparency sampling (browser `ImageData` satisfies this). */
export type ImageDataLike = {
  data: Uint8ClampedArray
  width: number
  height: number
}

export function computeScaledDimensions(
  width: number,
  height: number,
  maxSide: number,
): { width: number; height: number } {
  if (width <= 0 || height <= 0 || maxSide <= 0) {
    return {
      width: Math.max(1, Math.round(width)),
      height: Math.max(1, Math.round(height)),
    }
  }
  const longest = Math.max(width, height)
  if (longest <= maxSide) {
    return { width: Math.round(width), height: Math.round(height) }
  }
  const scale = maxSide / longest
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}

/**
 * Cheap transparency check: sample a grid; any non-opaque pixel counts as alpha.
 */
export function imageDataHasTransparency(imageData: ImageDataLike): boolean {
  const { data, width, height } = imageData
  if (width === 0 || height === 0) {
    return false
  }
  const stepX = Math.max(1, Math.floor(width / 64))
  const stepY = Math.max(1, Math.floor(height / 64))
  for (let y = 0; y < height; y += stepY) {
    for (let x = 0; x < width; x += stepX) {
      const i = (y * width + x) * 4 + 3
      if (data[i]! < 255) {
        return true
      }
    }
  }
  return false
}

function stripPathSegments(name: string): string {
  return name.replace(/^.*[/\\]/, '') || 'photo'
}

function outputFileName(originalName: string, mime: string): string {
  const base = stripPathSegments(originalName)
  const withoutExt = base.replace(/\.[^.]+$/, '')
  const stem = withoutExt || 'photo'
  if (mime === 'image/jpeg') {
    return `${stem}.jpg`
  }
  if (mime === 'image/webp') {
    return `${stem}.webp`
  }
  if (mime === 'image/png') {
    return `${stem}.png`
  }
  return `${stem}.bin`
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality)
  })
}

async function encodeOpaqueUnderBudget(
  canvas: HTMLCanvasElement,
  preferMime: 'image/jpeg' | 'image/webp',
): Promise<{ blob: Blob; mime: string } | null> {
  const tryOrder: Array<'image/jpeg' | 'image/webp'> =
    preferMime === 'image/jpeg'
      ? ['image/jpeg', 'image/webp']
      : ['image/webp', 'image/jpeg']

  for (const mime of tryOrder) {
    const qualities =
      mime === 'image/webp' ? WEBP_QUALITIES_DESC : JPEG_QUALITIES_DESC
    for (const q of qualities) {
      const blob = await canvasToBlob(canvas, mime, q)
      if (blob && blob.size > 0 && blob.size <= MAX_CLOSEOUT_PHOTO_BYTES) {
        return { blob, mime }
      }
    }
  }

  return null
}

async function encodeWithAlphaUnderBudget(
  canvas: HTMLCanvasElement,
  webpSupported: boolean,
): Promise<{ blob: Blob; mime: string } | null> {
  if (webpSupported) {
    for (const q of WEBP_QUALITIES_DESC) {
      const blob = await canvasToBlob(canvas, 'image/webp', q)
      if (blob && blob.size > 0 && blob.size <= MAX_CLOSEOUT_PHOTO_BYTES) {
        return { blob, mime: 'image/webp' }
      }
    }
  }

  const pngBlob = await canvasToBlob(canvas, 'image/png')
  if (pngBlob && pngBlob.size > 0 && pngBlob.size <= MAX_CLOSEOUT_PHOTO_BYTES) {
    return { blob: pngBlob, mime: 'image/png' }
  }

  return null
}

async function shrinkCanvasToFit(
  source: HTMLCanvasElement,
  hasAlpha: boolean,
  webpSupported: boolean,
): Promise<{ blob: Blob; mime: string }> {
  let canvas = source
  let width = canvas.width
  let height = canvas.height

  for (;;) {
    if (width <= MIN_ENCODE_DIMENSION || height <= MIN_ENCODE_DIMENSION) {
      break
    }

    width = Math.max(MIN_ENCODE_DIMENSION, Math.floor(width * 0.85))
    height = Math.max(MIN_ENCODE_DIMENSION, Math.floor(height * 0.85))

    const next = document.createElement('canvas')
    next.width = width
    next.height = height
    const nctx = next.getContext('2d')
    if (!nctx) {
      throw new Error('Could not process image.')
    }
    nctx.imageSmoothingEnabled = true
    nctx.imageSmoothingQuality = 'high'
    nctx.drawImage(canvas, 0, 0, width, height)
    canvas = next

    const encoded = hasAlpha
      ? await encodeWithAlphaUnderBudget(canvas, webpSupported)
      : await encodeOpaqueUnderBudget(canvas, 'image/jpeg')

    if (encoded) {
      return encoded
    }
  }

  const lastTry = hasAlpha
    ? await encodeWithAlphaUnderBudget(canvas, webpSupported)
    : await encodeOpaqueUnderBudget(canvas, 'image/jpeg')

  if (lastTry) {
    return lastTry
  }

  throw new Error(
    'Photo is still too large after compression. Try another image or fewer photos.',
  )
}

function prefersJpegFromMime(type: string): boolean {
  return (
    type === 'image/jpeg' ||
    type === 'image/jpg' ||
    type === 'image/pjpeg' ||
    type === 'image/webp'
  )
}

/**
 * Validates and optionally downscales/compresses a closeout photo before upload.
 * Skips re-encoding when already within byte and dimension limits.
 */
export async function prepareCloseoutPhoto(
  file: File,
): Promise<PreparedCloseoutPhoto> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file.')
  }

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new Error('Could not read this image. Try JPEG or PNG.')
  }

  try {
    const origW = bitmap.width
    const origH = bitmap.height
    const maxSide = Math.max(origW, origH)
    const needsResize = maxSide > MAX_CLOSEOUT_PHOTO_DIMENSION
    const needsShrink = file.size > MAX_CLOSEOUT_PHOTO_BYTES

    if (!needsResize && !needsShrink) {
      return { blob: file, fileName: file.name }
    }

    const { width, height } = computeScaledDimensions(
      origW,
      origH,
      MAX_CLOSEOUT_PHOTO_DIMENSION,
    )

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Could not process image.')
    }
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(bitmap, 0, 0, width, height)

    const imageData = ctx.getImageData(0, 0, width, height)
    const hasAlpha = imageDataHasTransparency(imageData)

    const probeWebp = await canvasToBlob(canvas, 'image/webp', 0.92)
    const webpSupported = Boolean(probeWebp)

    let preferJpeg =
      !hasAlpha && (prefersJpegFromMime(file.type) || file.type === 'image/png')

    if (hasAlpha) {
      preferJpeg = false
    }

    const first = hasAlpha
      ? await encodeWithAlphaUnderBudget(canvas, webpSupported)
      : preferJpeg
        ? await encodeOpaqueUnderBudget(canvas, 'image/jpeg')
        : await encodeOpaqueUnderBudget(
            canvas,
            webpSupported ? 'image/webp' : 'image/jpeg',
          )

    if (first && first.blob.size <= MAX_CLOSEOUT_PHOTO_BYTES) {
      return {
        blob: first.blob,
        fileName: outputFileName(file.name, first.mime),
      }
    }

    const shrunk = await shrinkCanvasToFit(canvas, hasAlpha, webpSupported)
    return {
      blob: shrunk.blob,
      fileName: outputFileName(file.name, shrunk.mime),
    }
  } finally {
    bitmap.close()
  }
}
