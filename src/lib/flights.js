import { PURPOSE_COLORS } from './constants';
import { resolveFlightYearMonth } from './format';

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

export function airportSnapshot(airport) {
  return {
    code: airport.iata || airport.ident,
    iata: airport.iata || '',
    ident: airport.ident,
    name: airport.name,
    city: airport.city || '',
    country: airport.country || '',
    lat: Number(airport.lat),
    lng: Number(airport.lng)
  };
}

export function makeFlightRecord(values) {
  const now = new Date().toISOString();
  const yearMonth = resolveFlightYearMonth(values);

  return {
    id: values.id || crypto.randomUUID(),
    from: airportSnapshot(values.fromAirport),
    to: airportSnapshot(values.toAirport),
    yearMonth,
    purpose: values.purpose || 'other',
    note: values.note?.trim() || '',
    createdAt: values.createdAt || now,
    updatedAt: now
  };
}

export function haversineKm(from, to) {
  const earthRadiusKm = 6371;
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

export function getFlightYear(flight) {
  const yearMonth = resolveFlightYearMonth(flight);
  if (!yearMonth) return 'Unknown';
  return yearMonth.slice(0, 4);
}

export function enrichFlight(flight) {
  const distanceKm = haversineKm(flight.from, flight.to);
  const color = PURPOSE_COLORS[flight.purpose] || PURPOSE_COLORS.other;
  const yearMonth = resolveFlightYearMonth(flight);

  return {
    ...flight,
    yearMonth,
    distanceKm,
    color
  };
}

export function sortFlightsDescending(flights) {
  return [...flights].sort((a, b) => {
    const aSortMonth = getFlightSortMonth(a);
    const bSortMonth = getFlightSortMonth(b);
    if (aSortMonth !== bSortMonth) return bSortMonth - aSortMonth;

    const aTimestamp = getSortTimestamp(a);
    const bTimestamp = getSortTimestamp(b);
    return bTimestamp - aTimestamp;
  });
}

export function buildGlobeArcs(flights, selectedId, hoveredId) {
  return flights.map((flight) => ({
    id: flight.id,
    startLat: flight.from.lat,
    startLng: flight.from.lng,
    endLat: flight.to.lat,
    endLng: flight.to.lng,
    label: buildArcLabel(flight),
    color: flight.color,
    stroke:
      flight.id === selectedId ? 0.5 : flight.id === hoveredId ? 0.32 : 0.18,
    altitudeScale: flight.id === selectedId ? 0.68 : 0.48,
    flight
  }));
}

export function buildAirportPoints(flights, selectedId) {
  const points = new Map();

  for (const flight of flights) {
    const endpoints = [
      { airport: flight.from, role: 'origin', flightId: flight.id, color: flight.color },
      { airport: flight.to, role: 'destination', flightId: flight.id, color: flight.color }
    ];

    for (const endpoint of endpoints) {
      const key = endpoint.airport.ident || endpoint.airport.code;
      const current = points.get(key);
      const isSelected = endpoint.flightId === selectedId;

      if (!current || isSelected) {
        points.set(key, {
          id: key,
          lat: endpoint.airport.lat,
          lng: endpoint.airport.lng,
          label: buildPointLabel(endpoint.airport),
          color: isSelected ? '#ffffff' : endpoint.color,
          altitude: isSelected ? 0.12 : 0.04,
          radius: isSelected ? 0.24 : 0.16,
          airport: endpoint.airport,
          selected: isSelected
        });
      }
    }
  }

  return [...points.values()];
}

export function filterFlightsByYear(flights, year) {
  if (year === 'All') return flights;
  return flights.filter((flight) => getFlightYear(flight) === year);
}

export function buildStats(flights) {
  const totalDistanceKm = flights.reduce((sum, flight) => sum + flight.distanceKm, 0);
  const uniqueAirports = new Set();
  const uniqueCountries = new Set();
  const monthsLogged = new Set();

  for (const flight of flights) {
    uniqueAirports.add(flight.from.code);
    uniqueAirports.add(flight.to.code);
    if (flight.from.country) uniqueCountries.add(flight.from.country);
    if (flight.to.country) uniqueCountries.add(flight.to.country);

    const yearMonth = resolveFlightYearMonth(flight);
    if (yearMonth) monthsLogged.add(yearMonth);
  }

  const longestFlight = flights.reduce((best, flight) => {
    if (!best || flight.distanceKm > best.distanceKm) return flight;
    return best;
  }, null);

  const currentYear = String(new Date().getFullYear());
  const flightsThisYear = flights.filter((flight) => getFlightYear(flight) === currentYear).length;

  return {
    totalFlights: flights.length,
    totalDistanceKm,
    uniqueAirports: uniqueAirports.size,
    uniqueCountries: uniqueCountries.size,
    monthsLogged: monthsLogged.size,
    longestFlight,
    flightsThisYear
  };
}

export function focusTargetForFlight(flight) {
  return {
    lat: (flight.from.lat + flight.to.lat) / 2,
    lng: averageLng(flight.from.lng, flight.to.lng),
    altitude: 1.6
  };
}

function getFlightSortMonth(flight) {
  const yearMonth = resolveFlightYearMonth(flight);
  if (!yearMonth) return -1;

  const [year, month] = yearMonth.split('-');
  return Number(year) * 100 + Number(month);
}

function getSortTimestamp(flight) {
  const candidates = [flight.updatedAt, flight.createdAt, flight.departureTime];
  for (const candidate of candidates) {
    const timestamp = new Date(candidate || '').getTime();
    if (!Number.isNaN(timestamp)) return timestamp;
  }
  return 0;
}

function averageLng(a, b) {
  const delta = Math.abs(a - b);
  if (delta <= 180) return (a + b) / 2;
  const normalizedA = a < 0 ? a + 360 : a;
  const normalizedB = b < 0 ? b + 360 : b;
  const average = (normalizedA + normalizedB) / 2;
  return average > 180 ? average - 360 : average;
}

function buildArcLabel(flight) {
  const route = `${escapeLight(flight.from.code)} -> ${escapeLight(flight.to.code)}`;
  const month = flight.yearMonth ? `<div>${escapeLight(flight.yearMonth)}</div>` : '';
  return `<strong>${route}</strong>${month}`;
}

function buildPointLabel(airport) {
  const city = airport.city ? `${escapeLight(airport.city)}, ` : '';
  return `<strong>${escapeLight(airport.code)}</strong><div>${escapeLight(airport.name)}</div><div>${city}${escapeLight(airport.country)}</div>`;
}

function escapeLight(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}
