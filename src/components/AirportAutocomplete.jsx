import { useEffect, useMemo, useState } from 'react';

function formatAirport(airport) {
  const pieces = [airport.iata || airport.ident, airport.name];
  const tail = [airport.city, airport.country].filter(Boolean).join(', ');
  if (tail) pieces.push(tail);
  return pieces.join(' · ');
}

export default function AirportAutocomplete({
  label,
  value,
  onChange,
  airports,
  disabled = false,
  placeholder
}) {
  const [query, setQuery] = useState(value ? formatAirport(value) : '');
  const [isOpen, setIsOpen] = useState(false);


  useEffect(() => {
    setQuery(value ? formatAirport(value) : '');
  }, [value]);

  const suggestions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return airports.slice(0, 8);
    }

    return airports
      .filter((airport) => {
        const haystack = [
          airport.iata,
          airport.ident,
          airport.name,
          airport.city,
          airport.country
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return haystack.includes(normalized);
      })
      .slice(0, 8);
  }, [airports, query]);

  return (
    <div className="field airport-field">
      <label>{label}</label>
      <input
        type="text"
        value={query}
        disabled={disabled}
        placeholder={placeholder}
        onFocus={() => setIsOpen(true)}
        onChange={(event) => {
          const nextQuery = event.target.value;
          setQuery(nextQuery);
          setIsOpen(true);
          if (!nextQuery.trim()) {
            onChange(null);
          }
        }}
        onBlur={() => {
          window.setTimeout(() => {
            setIsOpen(false);
            if (value) {
              setQuery(formatAirport(value));
            }
          }, 120);
        }}
      />

      {isOpen && suggestions.length > 0 && (
        <div className="airport-suggestions">
          {suggestions.map((airport) => (
            <button
              key={`${airport.ident}-${airport.iata}`}
              type="button"
              className="airport-option"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange(airport);
                setQuery(formatAirport(airport));
                setIsOpen(false);
              }}
            >
              <span className="airport-option__code">{airport.iata || airport.ident}</span>
              <span className="airport-option__text">
                <strong>{airport.name}</strong>
                <small>
                  {[airport.city, airport.country].filter(Boolean).join(', ') || 'Unknown location'}
                </small>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
