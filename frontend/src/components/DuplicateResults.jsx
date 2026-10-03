/**
 * Displays the results of the duplicate-scan check.
 *
 * The component only presents duplicate information; the API request
 * itself remains controlled by App.jsx.
 */
function DuplicateResults({
  data,
  onClose,
}) {
  // Hide the panel until a duplicate check has been performed.
  if (!data) {
    return null
  }

  return (
    <div className="duplicate-results">
      <div className="duplicate-header">
        <h3>Duplicate Check</h3>

        <button onClick={onClose}>
          Close
        </button>
      </div>

      {data.duplicate_group_count === 0 ? (
        <p>No duplicate groups found.</p>
      ) : (
        <>
          <p>
            Found {data.duplicate_group_count} duplicate
            group{data.duplicate_group_count !== 1 ? 's' : ''}.
          </p>

          {data.duplicate_groups.map((group, index) => (
            <div
              className="duplicate-group"
              key={group.scan_ids.join('-')}
            >
              <strong>Group {index + 1}</strong>

              <p>
                {group.scan_type} — {group.region} —{' '}
                {group.predicted_condition} —{' '}
                {(group.confidence_score * 100).toFixed(0)}%
              </p>

              <p>
                Patient age: {group.patient_age}
              </p>

              <p>
                Scan IDs: {group.scan_ids.join(', ')}
              </p>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

export default DuplicateResults