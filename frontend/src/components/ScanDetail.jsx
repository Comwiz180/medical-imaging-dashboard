/**
 * Displays the details for a selected scan.
 *
 * Handles loading and error states before rendering the
 * complete synthetic scan record.
 */
function ScanDetail({
  scan,
  loading,
  error,
  onClose,
  onDelete,
}) {
  // Show request state before attempting to render scan data.
  if (loading) {
    return (
      <div className="scan-detail">
        <p>Loading scan details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="scan-detail">
        <p className="error">{error}</p>
      </div>
    )
  }

  // No detail panel is shown until a scan has been selected.
  if (!scan) {
    return null
  }

  return (
    <div className="scan-detail">
      <div className="detail-header">
        <h2>Scan Details</h2>

        <button onClick={onClose}>
          Close
        </button>
      </div>

      <div className="detail-grid">
        <div className="detail-item">
          <strong>Scan ID</strong>
          <span>{scan.scan_id}</span>
        </div>

        <div className="detail-item">
          <strong>Patient Age</strong>
          <span>{scan.patient_age}</span>
        </div>

        <div className="detail-item">
          <strong>Scan Type</strong>
          <span>{scan.scan_type}</span>
        </div>

        <div className="detail-item">
          <strong>Region</strong>
          <span>{scan.region}</span>
        </div>

        <div className="detail-item">
          <strong>AI Prediction</strong>
          <span>{scan.predicted_condition}</span>
        </div>

        <div className="detail-item">
          <strong>Confidence</strong>
          <span>
            {(scan.confidence_score * 100).toFixed(0)}%
          </span>
        </div>

        <div className="detail-item">
          <strong>Review Status</strong>
          <span>{scan.review_status}</span>
        </div>

        <div className="detail-item">
          <strong>Created</strong>
          <span>
            {new Date(scan.created_at).toLocaleString()}
          </span>
        </div>
      </div>

      <div className="detail-actions">
        <button
          className="delete-button"
          onClick={onDelete}
        >
          Delete Scan
        </button>
      </div>

      <p className="disclaimer">
        Synthetic data and mock AI output. Not for clinical use.
      </p>
    </div>
  )
}

export default ScanDetail