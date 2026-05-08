type GenerateUploadUrl = () => Promise<string>

type UploadResponse = {
  storageId?: string
}

/** True when the failure is likely due to connectivity, not validation or server logic. */
export function isLikelyConnectivityFailure(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false
  }
  const message = error.message.toLowerCase()
  return (
    message.includes('failed to fetch') ||
    message.includes('networkerror') ||
    message.includes('load failed') ||
    message.includes('network request failed') ||
    (error.name === 'TypeError' && message.includes('fetch'))
  )
}

/**
 * Plain-language message for technicians when uploads or mutations fail.
 */
export function describeConnectivityError(error: unknown): string {
  if (isLikelyConnectivityFailure(error)) {
    return 'We could not reach the server. Check your signal or Wi‑Fi, then tap Retry.'
  }
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message
  }
  return 'Something went wrong. Please try again.'
}

function throwIfConnectivityFailure(err: unknown, context: string): never {
  if (isLikelyConnectivityFailure(err)) {
    throw new Error(`${context} Check your connection and tap Retry.`)
  }
  throw err
}

export async function uploadBlobToConvexStorage(
  blob: Blob,
  fileName: string,
  generateUploadUrl: GenerateUploadUrl,
): Promise<string> {
  let uploadUrl: string
  try {
    uploadUrl = await generateUploadUrl()
  } catch (err) {
    throwIfConnectivityFailure(err, 'Could not start the upload.')
  }

  let uploadResult: Response
  try {
    uploadResult = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Content-Type': blob.type || 'application/octet-stream',
        'X-File-Name': fileName,
      },
      body: blob,
    })
  } catch (err) {
    throwIfConnectivityFailure(err, 'Could not upload the file.')
  }

  if (!uploadResult.ok) {
    const statusSuffix =
      typeof uploadResult.status === 'number' && uploadResult.status > 0
        ? ` (HTTP ${uploadResult.status})`
        : ''
    throw new Error(
      `The upload did not finish${statusSuffix}. Check your connection and tap Retry.`,
    )
  }

  const payload = (await uploadResult.json()) as UploadResponse
  if (!payload.storageId) {
    throw new Error(
      'The server did not confirm the file. Check your connection and tap Retry.',
    )
  }
  return payload.storageId
}
