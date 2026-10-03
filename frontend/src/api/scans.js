/**
 * Frontend API client for the medical imaging dashboard.
 *
 * All communication with the FastAPI backend is centralized here so
 * React components do not need to know endpoint URLs or request details.
 */

const API_BASE_URL = 'http://127.0.0.1:8000'


/**
 * Builds query parameters shared by scan filtering endpoints.
 */
function buildScanFilterParams({
  scanType = '',
  minConfidence = '',
} = {}) {
  const params = new URLSearchParams()

  if (scanType) {
    params.append('scan_type', scanType)
  }

  if (minConfidence !== '') {
    params.append('min_confidence', minConfidence)
  }

  return params
}


/**
 * Throws a readable frontend error when an API request fails.
 */
function ensureResponseOk(response, message) {
  if (!response.ok) {
    throw new Error(message)
  }
}


export async function getScans({
  page = 1,
  pageSize = 10,
  scanType = '',
  minConfidence = '',
} = {}) {
  const params = buildScanFilterParams({
    scanType,
    minConfidence,
  })

  params.set('page', String(page))
  params.set('page_size', String(pageSize))

  const response = await fetch(
    `${API_BASE_URL}/scans?${params.toString()}`
  )

  ensureResponseOk(
    response,
    'Failed to retrieve scans'
  )

  return response.json()
}


export async function getScan(scanId) {
  const response = await fetch(
    `${API_BASE_URL}/scans/${encodeURIComponent(scanId)}`
  )

  ensureResponseOk(
    response,
    'Failed to retrieve scan details'
  )

  return response.json()
}


export async function generateScans(count = 25) {
  const response = await fetch(
    `${API_BASE_URL}/scans/generate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        count,
      }),
    }
  )

  ensureResponseOk(
    response,
    'Failed to generate scans'
  )

  return response.json()
}


export async function deleteScan(scanId) {
  const response = await fetch(
    `${API_BASE_URL}/scans/${encodeURIComponent(scanId)}`,
    {
      method: 'DELETE',
    }
  )

  ensureResponseOk(
    response,
    'Failed to delete scan'
  )

  return response.json()
}


export async function getDuplicates() {
  const response = await fetch(
    `${API_BASE_URL}/scans/duplicates`
  )

  ensureResponseOk(
    response,
    'Failed to check duplicates'
  )

  return response.json()
}


/**
 * Downloads a CSV containing all scans that match the active filters.
 */
export async function exportScansCsv({
  scanType = '',
  minConfidence = '',
} = {}) {
  const params = buildScanFilterParams({
    scanType,
    minConfidence,
  })

  const queryString = params.toString()

  const url = queryString
    ? `${API_BASE_URL}/scans/export/csv?${queryString}`
    : `${API_BASE_URL}/scans/export/csv`

  const response = await fetch(url)

  ensureResponseOk(
    response,
    'Failed to export CSV'
  )

  const blob = await response.blob()
  const downloadUrl = window.URL.createObjectURL(blob)

  // Use a temporary link to trigger the browser's file download.
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = 'synthetic_scans.csv'

  document.body.appendChild(link)
  link.click()
  link.remove()

  window.URL.revokeObjectURL(downloadUrl)
}