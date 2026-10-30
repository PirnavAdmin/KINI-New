import PropTypes from 'prop-types'

const EMPTY_ART = '/assets/StudentBanners/recordingsEmpty.webp'

// `filtered` = recordings exist but none match the current search/filters.
export default function RecordingEmptyState({ filtered = false, onClearFilters }) {
  return <section className="ksl-card ksx-rec-empty">
    <img src={EMPTY_ART} alt="" className="ksx-rec-empty__art" draggable={false} />
    {filtered ? <>
      <h2>No matching recordings</h2>
      <p>Try another search term, course or topic.</p>
      {onClearFilters && <button type="button" className="ksl-btn ksl-btn--orange" onClick={onClearFilters}>Clear filters</button>}
    </> : <>
      <h2>No Recordings Yet</h2>
      <p>There are no class recordings available for your assigned courses yet.</p>
      <p className="ksx-rec-empty__sub">Once your mentor publishes recordings, they will appear here.</p>
    </>}
  </section>
}

RecordingEmptyState.propTypes = {
  filtered: PropTypes.bool,
  onClearFilters: PropTypes.func,
}
