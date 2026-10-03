/**
 * Displays controls for moving between pages of scan results.
 */
function Pagination({
  page,
  totalPages,
  onPrevious,
  onNext,
}) {
  return (
    <div className="pagination">
      <button
        onClick={onPrevious}
        disabled={page <= 1}
      >
        Previous
      </button>

      <span>
        Page {page} of {totalPages || 1}
      </span>

      <button
        onClick={onNext}
        disabled={page >= totalPages}
      >
        Next
      </button>
    </div>
  )
}

export default Pagination