/**
 * Displays scan actions, search controls, and list filters.
 *
 * App.jsx owns the state and API behavior; this component only
 * renders controls and forwards user actions through props.
 */
function ScanToolbar({
  total,
  generating,
  onGenerate,
  checkingDuplicates,
  onCheckDuplicates,
  exporting,
  onExport,
  searchScanId,
  onSearchChange,
  onSearch,
  searchError,
  scanType,
  onScanTypeChange,
  minConfidence,
  onConfidenceChange,
  pageSize,
  onPageSizeChange,
}) {
  return (
    <div className="scan-toolbar">
      <div className="scan-summary">
        <h2>Scans</h2>

        <p className="scan-count">
          {total} synthetic scan{total !== 1 ? 's' : ''}
        </p>

        <button
          className="generate-button"
          onClick={onGenerate}
          disabled={generating}
        >
          {generating
            ? 'Generating...'
            : 'Generate 25 Synthetic Scans'}
        </button>

        <button
          className="duplicate-button"
          onClick={onCheckDuplicates}
          disabled={checkingDuplicates}
        >
          {checkingDuplicates
            ? 'Checking...'
            : 'Check for Duplicates'}
        </button>

        <button
          className="export-button"
          onClick={onExport}
          disabled={exporting}
        >
          {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      <div className="scan-search">
        <input
          type="text"
          placeholder="Enter scan ID"
          value={searchScanId}
          onChange={onSearchChange}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              onSearch()
            }
          }}
        />

        <button onClick={onSearch}>
          Search
        </button>

        {searchError && (
          <p className="error">{searchError}</p>
        )}
      </div>

      <div className="filters">
        <label>
          Scan type
          <select
            value={scanType}
            onChange={onScanTypeChange}
          >
            <option value="">All</option>
            <option value="CT">CT</option>
            <option value="MRI">MRI</option>
          </select>
        </label>

        <label>
          Minimum confidence
          <select
            value={minConfidence}
            onChange={onConfidenceChange}
          >
            <option value="">Any</option>
            <option value="0.6">60%</option>
            <option value="0.7">70%</option>
            <option value="0.8">80%</option>
            <option value="0.9">90%</option>
          </select>
        </label>

        <label>
          Rows per page
          <select
            value={pageSize}
            onChange={onPageSizeChange}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </label>
      </div>
    </div>
  )
}

export default ScanToolbar