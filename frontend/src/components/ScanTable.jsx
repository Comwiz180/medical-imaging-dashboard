/**
 * Returns a CSS class based on the mock AI confidence score.
 */
function getConfidenceClass(score) {
  if (score >= 0.9) return 'confidence-high'
  if (score >= 0.75) return 'confidence-medium'
  return 'confidence-low'
}


/**
 * Returns a CSS class based on the scan review status.
 */
function getStatusClass(status) {
  if (status === 'reviewed') return 'status-reviewed'
  if (status === 'flagged') return 'status-flagged'
  return 'status-unreviewed'
}


/**
 * Displays the current page of synthetic scan records.
 *
 * Selecting a row delegates scan-detail loading to the parent component.
 */
function ScanTable({ scans, onSelectScan }) {
  if (scans.length === 0) {
    return <p>No scans found.</p>
  }

  return (
    <table className="scan-table">
      <thead>
        <tr>
          <th>Scan ID</th>
          <th>Age</th>
          <th>Type</th>
          <th>Region</th>
          <th>Prediction</th>
          <th>Confidence</th>
          <th>Status</th>
          <th>Created</th>
        </tr>
      </thead>

      <tbody>
        {scans.map((scan) => (
          <tr
            key={scan.scan_id}
            className="clickable-row"
            onClick={() => onSelectScan(scan.scan_id)}
          >
            <td>{scan.scan_id}</td>

            <td>{scan.patient_age}</td>

            <td>
              <span className="scan-type-badge">
                {scan.scan_type}
              </span>
            </td>

            <td>{scan.region}</td>

            <td>{scan.predicted_condition}</td>

            <td>
              <span
                className={`confidence-badge ${getConfidenceClass(
                  scan.confidence_score
                )}`}
              >
                {(scan.confidence_score * 100).toFixed(0)}%
              </span>
            </td>

            <td>
              <span
                className={`status-badge ${getStatusClass(
                  scan.review_status
                )}`}
              >
                {scan.review_status}
              </span>
            </td>

            <td>
              {new Date(scan.created_at).toLocaleDateString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}


export default ScanTable