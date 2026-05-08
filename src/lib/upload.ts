type GenerateUploadUrl = () => Promise<string>

type UploadResponse = {
  storageId?: string
}

export async function uploadBlobToConvexStorage(
  blob: Blob,
  fileName: string,
  generateUploadUrl: GenerateUploadUrl,
): Promise<string> {
  const uploadUrl = await generateUploadUrl()
  const uploadResult = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Content-Type': blob.type || 'application/octet-stream',
      'X-File-Name': fileName,
    },
    body: blob,
  })

  if (!uploadResult.ok) {
    const statusSuffix =
      typeof uploadResult.status === 'number' && uploadResult.status > 0
        ? ` (HTTP ${uploadResult.status})`
        : ''
    throw new Error(`Could not upload file${statusSuffix}. Please try again.`)
  }

  const payload = (await uploadResult.json()) as UploadResponse
  if (!payload.storageId) {
    throw new Error('Upload finished but storage id was missing.')
  }
  return payload.storageId
}
