import { useCallback, useEffect, useState } from 'react'

import {
  deleteScan,
  exportScansCsv,
  generateScans,
  getDuplicates,
  getScan,
  getScans,
} from './api/scans'
import DuplicateResults from './components/DuplicateResults'
import Pagination from './components/Pagination'
import ScanDetail from './components/ScanDetail'
import ScanTable from './components/ScanTable'
import ScanToolbar from './components/ScanToolbar'


/**
 * Coordinates dashboard state, API requests, and child components.
 *
 * Presentation-heavy sections are delegated to components, while this
 * component owns scan data, filters, pagination, and user actions.
 */
function App() {
  // Scan list and pagination state.
  const [scans, setScans] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Server-side scan filters.
  const [scanType, setScanType] = useState('')
  const [minConfidence, setMinConfidence] = useState('')

  // General scan-list request state.
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState(null)
  const [actionError, setActionError] = useState(null)

  // Selected scan detail state.
  const [selectedScan, setSelectedScan] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState(null)

  // Synthetic scan generation state.
  const [generating, setGenerating] = useState(false)
  const [generationMessage, setGenerationMessage] = useState('')

  // Scan ID search state.
  const [searchScanId, setSearchScanId] = useState('')
  const [searchError, setSearchError] = useState('')

  // Duplicate detection state.
  const [duplicateData, setDuplicateData] = useState(null)
  const [checkingDuplicates, setCheckingDuplicates] = useState(false)

  // CSV export state.
  const [exporting, setExporting] = useState(false)

  /**
  * Loads the current page of scans from the backend using the
  * active pagination and filter settings.
  */
  const loadScans = useCallback(async () => {
    try {
      const data = await getScans({
        page,
        pageSize,
        scanType,
        minConfidence,
      })

      setScans(data.items)
      setTotal(data.total)
      setTotalPages(data.total_pages)
    } catch (err) {
      setListError(err.message)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, scanType, minConfidence])

  // Reload the scan list whenever pagination or filter inputs change.
  // Reload the scan list whenever pagination or filter inputs change.
  useEffect(() => {
    let cancelled = false

    async function fetchScans() {
      try {
        const data = await getScans({
          page,
          pageSize,
          scanType,
          minConfidence,
        })

        if (!cancelled) {
          setScans(data.items)
          setTotal(data.total)
          setTotalPages(data.total_pages)
          setListError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setListError(err.message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchScans()

    return () => {
      cancelled = true
    }
  }, [page, pageSize, scanType, minConfidence])


  function handleScanTypeChange(event) {
    setLoading(true)
    setScanType(event.target.value)
    setPage(1)
  }

  function handleConfidenceChange(event) {
    setLoading(true)
    setMinConfidence(event.target.value)
    setPage(1)
  }

  function handlePageSizeChange(event) {
    setLoading(true)
    setPageSize(Number(event.target.value))
    setPage(1)
  }

  async function handleSelectScan(scanId) {
    setDetailLoading(true)
    setSelectedScan(null)
    setDetailError(null)
    setSearchError('')

    try {
      const scan = await getScan(scanId)
      setSelectedScan(scan)
    } catch (err) {
      setSelectedScan(null)
      setDetailError(err.message)
    } finally {
      setDetailLoading(false)
    }
  }

  async function handleGenerateScans() {
    setGenerating(true)
    setGenerationMessage('')
    setActionError(null)

    try {
      const result = await generateScans(25)

      setDuplicateData(null)
      setGenerationMessage(result.message)

      setTimeout(() => {
        setGenerationMessage('')
      }, 3000)

      if (page === 1) {
        await loadScans()
      } else {
        setPage(1)
      }
    } catch (err) {
      setActionError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  async function handleSearchScan() {
    const scanId = searchScanId.trim()

    setSearchError('')
    setDetailError(null)

    if (!scanId) {
      return
    }

    setDetailLoading(true)

    try {
      const scan = await getScan(scanId)
      setSelectedScan(scan)
    } catch {
      setSelectedScan(null)
      setSearchError('Scan not found')
    } finally {
      setDetailLoading(false)
    }
  }

  function handleCloseScan() {
    setSelectedScan(null)
    setDetailError(null)
  }

  function handleCloseDuplicates() {
    setDuplicateData(null)
  }

  function handlePreviousPage() {
    setLoading(true)
    setPage((currentPage) => currentPage - 1)
  }

  function handleNextPage() {
    setLoading(true)
    setPage((currentPage) => currentPage + 1)
  }

  function handleSearchInputChange(event) {
    setSearchScanId(event.target.value)
    setSearchError('')
  }

  async function handleDeleteScan() {
    if (!selectedScan) {
      return
    }

    const confirmed = window.confirm(
      `Delete ${selectedScan.scan_id}?`
    )

    if (!confirmed) {
      return
    }

    setActionError(null)

    try {
      const deletedScanId = selectedScan.scan_id

      // Check whether the deleted scan came from the currently visible page.
      const deletedFromCurrentPage = scans.some(
        (scan) => scan.scan_id === deletedScanId
      )

      await deleteScan(deletedScanId)

      setDuplicateData(null)
      setSelectedScan(null)

      // If the last scan on a non-first page was deleted, move back one page.
      // Otherwise, refresh the current page normally.
      if (deletedFromCurrentPage && scans.length === 1 && page > 1) {
        setPage((currentPage) => currentPage - 1)
      } else {
        await loadScans()
      }
    } catch (err) {
      setActionError(err.message)
    }
  }

  async function handleCheckDuplicates() {
    setCheckingDuplicates(true)
    setActionError(null)

    try {
      const data = await getDuplicates()
      setDuplicateData(data)
    } catch (err) {
      setActionError(err.message)
    } finally {
      setCheckingDuplicates(false)
    }
  }

  async function handleExportCsv() {
    setExporting(true)
    setActionError(null)

    try {
      await exportScansCsv({
        scanType,
        minConfidence,
      })
    } catch (err) {
      setActionError(err.message)
    } finally {
      setExporting(false)
    }
  }

  return (
    <main>
      <header>
        <h1>Medical Imaging Review Dashboard</h1>
        <p>Synthetic scan review system</p>
      </header>

      <section>
        <ScanToolbar
          total={total}
          generating={generating}
          onGenerate={handleGenerateScans}
          checkingDuplicates={checkingDuplicates}
          onCheckDuplicates={handleCheckDuplicates}
          exporting={exporting}
          onExport={handleExportCsv}
          searchScanId={searchScanId}
          onSearchChange={handleSearchInputChange}
          onSearch={handleSearchScan}
          searchError={searchError}
          scanType={scanType}
          onScanTypeChange={handleScanTypeChange}
          minConfidence={minConfidence}
          onConfidenceChange={handleConfidenceChange}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
        />

        {generationMessage && (
          <p className="success-message">
            {generationMessage}
          </p>
        )}

        {loading && <p>Loading scans...</p>}

        {listError && (
          <p className="error">
            {listError}
          </p>
        )}

        {actionError && (
          <p className="error">
            {actionError}
          </p>
        )}

        {!loading && !listError && (
          <>
            <ScanDetail
              scan={selectedScan}
              loading={detailLoading}
              error={detailError}
              onClose={handleCloseScan}
              onDelete={handleDeleteScan}
            />
            <DuplicateResults
              data={duplicateData}
              onClose={handleCloseDuplicates}
            />
            <ScanTable
              scans={scans}
              onSelectScan={handleSelectScan}
            />
            <Pagination
              page={page}
              totalPages={totalPages}
              onPrevious={handlePreviousPage}
              onNext={handleNextPage}
            />
          </>
        )}
      </section>
    </main>
  )
}

export default App