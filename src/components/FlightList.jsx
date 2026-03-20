import { PURPOSE_OPTIONS } from '../lib/constants';
import { formatDistance, formatYearMonth } from '../lib/format';

function purposeLabel(value) {
  return PURPOSE_OPTIONS.find((option) => option.value === value)?.label || 'Other';
}

export default function FlightList({
  flights,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
  onClearSelection,
  yearFilter,
  onYearFilterChange,
  yearOptions,
  onExport,
  onImport
}) {
  return (
    <section className="panel history-panel">
      <div className="panel__header panel__header--wrap">
        <div>
          <h2>Flight history</h2>
          <p>Month-level records. Click a card to focus the globe.</p>
        </div>

        <div className="history-toolbar">
          <select value={yearFilter} onChange={(event) => onYearFilterChange(event.target.value)}>
            {yearOptions.map((option) => (
              <option key={option} value={option}>
                {option === 'All' ? 'All years' : option}
              </option>
            ))}
          </select>
          <button type="button" className="ghost-button" onClick={onExport}>
            Export JSON
          </button>
          <label className="ghost-button ghost-button--file">
            Import JSON
            <input type="file" accept="application/json" onChange={onImport} />
          </label>
          {selectedId && (
            <button type="button" className="ghost-button" onClick={onClearSelection}>
              Clear focus
            </button>
          )}
        </div>
      </div>

      {flights.length === 0 ? (
        <div className="empty-state empty-state--history">
          <strong>No flights yet.</strong>
          <p>Add your first route to populate the list and globe.</p>
        </div>
      ) : (
        <div className="flight-list">
          {flights.map((flight) => {
            const isSelected = flight.id === selectedId;
            return (
              <article
                key={flight.id}
                className={`flight-card ${isSelected ? 'flight-card--selected' : ''}`}
                onClick={() => onSelect(flight.id)}
              >
                <div className="flight-card__accent" style={{ background: flight.color }} />
                <div className="flight-card__body">
                  <div className="flight-card__topline">
                    <div>
                      <strong>
                        {flight.from.code} -&gt; {flight.to.code}
                      </strong>
                      <span className="muted-line">{formatYearMonth(flight.yearMonth)}</span>
                    </div>
                    <span className="purpose-badge" style={{ borderColor: flight.color, color: flight.color }}>
                      {purposeLabel(flight.purpose)}
                    </span>
                  </div>

                  <div className="flight-card__meta">
                    <span>{formatDistance(flight.distanceKm)}</span>
                    <span>{flight.from.country || 'Unknown origin country'}</span>
                    <span>{flight.to.country || 'Unknown destination country'}</span>
                  </div>

                  {flight.note && <p className="flight-card__note">{flight.note}</p>}

                  <div className="flight-card__actions">
                    <button
                      type="button"
                      className="tiny-button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onEdit(flight.id);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="tiny-button tiny-button--danger"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete(flight.id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
