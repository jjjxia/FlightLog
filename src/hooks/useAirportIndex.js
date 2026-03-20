import { useEffect, useMemo, useState } from 'react';
import Papa from 'papaparse';
import { AIRPORTS_CACHE_KEY, AIRPORTS_SOURCE_URL } from '../lib/constants';

function normalizeAirportRows(rows) {
  const seen = new Set();

  return rows
    .filter((row) => row.iata_code && row.latitude_deg && row.longitude_deg)
    .filter((row) => row.type !== 'closed')
    .map((row) => ({
      ident: row.ident,
      iata: row.iata_code,
      name: row.name,
      city: row.municipality || '',
      country: row.iso_country || '',
      lat: Number(row.latitude_deg),
      lng: Number(row.longitude_deg),
      scheduledService: row.scheduled_service
    }))
    .filter((row) => {
      if (!Number.isFinite(row.lat) || !Number.isFinite(row.lng)) return false;
      const key = row.iata || row.ident;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => {
      const serviceScoreA = a.scheduledService === 'yes' ? 1 : 0;
      const serviceScoreB = b.scheduledService === 'yes' ? 1 : 0;
      if (serviceScoreA !== serviceScoreB) return serviceScoreB - serviceScoreA;
      return `${a.city} ${a.name}`.localeCompare(`${b.city} ${b.name}`);
    });
}

export function useAirportIndex() {
  const [airports, setAirports] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const cached = localStorage.getItem(AIRPORTS_CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAirports(parsed);
          setStatus('ready');
          return;
        }
      } catch {
        localStorage.removeItem(AIRPORTS_CACHE_KEY);
      }
    }

    Papa.parse(AIRPORTS_SOURCE_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (cancelled) return;
        try {
          const normalized = normalizeAirportRows(results.data || []);
          setAirports(normalized);
          localStorage.setItem(AIRPORTS_CACHE_KEY, JSON.stringify(normalized));
          setStatus('ready');
        } catch (parseError) {
          setError(parseError instanceof Error ? parseError.message : 'Failed to build airport index.');
          setStatus('error');
        }
      },
      error: (fetchError) => {
        if (cancelled) return;
        setError(fetchError?.message || 'Failed to load airport data.');
        setStatus('error');
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const airportMap = useMemo(() => {
    return airports.reduce((map, airport) => {
      map[airport.ident] = airport;
      if (airport.iata) {
        map[airport.iata] = airport;
      }
      return map;
    }, {});
  }, [airports]);

  return {
    airports,
    airportMap,
    isLoading: status === 'loading',
    error
  };
}
