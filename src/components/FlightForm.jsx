import { useEffect, useMemo, useState } from 'react';
import AirportAutocomplete from './AirportAutocomplete';
import { PURPOSE_OPTIONS } from '../lib/constants';
import { normalizeYearMonth, resolveFlightYearMonth } from '../lib/format';

function getCurrentYearMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function createEmptyForm() {
  return {
    id: '',
    fromAirport: null,
    toAirport: null,
    yearMonth: getCurrentYearMonth(),
    purpose: 'leisure',
    note: '',
    createdAt: ''
  };
}

export default function FlightForm({
  airports,
  airportMap,
  onSubmit,
  editingFlight,
  onCancelEdit,
  isAirportLoading,
  airportError
}) {
  const [form, setForm] = useState(() => createEmptyForm());

  useEffect(() => {
    if (!editingFlight) {
      setForm(createEmptyForm());
      return;
    }

    setForm({
      id: editingFlight.id,
      fromAirport: airportMap[editingFlight.from.ident] || editingFlight.from,
      toAirport: airportMap[editingFlight.to.ident] || editingFlight.to,
      yearMonth: resolveFlightYearMonth(editingFlight) || getCurrentYearMonth(),
      purpose: editingFlight.purpose || 'other',
      note: editingFlight.note || '',
      createdAt: editingFlight.createdAt || ''
    });
  }, [editingFlight, airportMap]);

  const submitLabel = editingFlight ? 'Save changes' : 'Add flight';

  const canSubmit = useMemo(() => {
    return Boolean(
      form.fromAirport &&
        form.toAirport &&
        form.fromAirport.ident !== form.toAirport.ident &&
        normalizeYearMonth(form.yearMonth) &&
        !isAirportLoading
    );
  }, [form, isAirportLoading]);

  function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;

    onSubmit({
      ...form,
      yearMonth: normalizeYearMonth(form.yearMonth)
    });

    if (!editingFlight) {
      setForm(createEmptyForm());
    }
  }

  return (
    <section className="panel form-panel">
      <div className="panel__header">
        <div>
          <h2>{editingFlight ? 'Edit flight' : 'Add flight'}</h2>
          <p>Month-level records only: route, purpose, and notes.</p>
        </div>
        {editingFlight && (
          <button type="button" className="ghost-button" onClick={onCancelEdit}>
            Cancel
          </button>
        )}
      </div>

      <form className="flight-form" onSubmit={handleSubmit}>
        <AirportAutocomplete
          label="From"
          value={form.fromAirport}
          onChange={(airport) => setForm((current) => ({ ...current, fromAirport: airport }))}
          airports={airports}
          disabled={isAirportLoading}
          placeholder={isAirportLoading ? 'Loading airport index...' : 'Search code, city, or airport'}
        />

        <AirportAutocomplete
          label="To"
          value={form.toAirport}
          onChange={(airport) => setForm((current) => ({ ...current, toAirport: airport }))}
          airports={airports}
          disabled={isAirportLoading}
          placeholder={isAirportLoading ? 'Loading airport index...' : 'Search code, city, or airport'}
        />

        <div className="two-column-fields">
          <div className="field">
            <label>Year and month</label>
            <input
              type="month"
              value={form.yearMonth}
              onChange={(event) =>
                setForm((current) => ({ ...current, yearMonth: event.target.value }))
              }
              required
            />
          </div>

          <div className="field">
            <label>Purpose</label>
            <select
              value={form.purpose}
              onChange={(event) =>
                setForm((current) => ({ ...current, purpose: event.target.value }))
              }
            >
              {PURPOSE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label>Note</label>
          <textarea
            rows="3"
            placeholder="Memory, context, or anything worth keeping."
            value={form.note}
            onChange={(event) =>
              setForm((current) => ({ ...current, note: event.target.value }))
            }
          />
        </div>

        {airportError && <p className="inline-error">Airport data failed to load: {airportError}</p>}

        <div className="form-actions">
          <button type="submit" className="primary-button" disabled={!canSubmit}>
            {submitLabel}
          </button>
          {!editingFlight && (
            <button
              type="button"
              className="ghost-button"
              onClick={() => setForm(createEmptyForm())}
            >
              Reset
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
