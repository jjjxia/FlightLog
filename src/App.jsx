import { useEffect, useMemo, useState } from 'react';
import FlightForm from './components/FlightForm';
import FlightList from './components/FlightList';
import GlobePanel from './components/GlobePanel';
import StatsPanel from './components/StatsPanel';
import { useAirportIndex } from './hooks/useAirportIndex';
import {
  buildStats,
  enrichFlight,
  filterFlightsByYear,
  getFlightYear,
  makeFlightRecord,
  sortFlightsDescending
} from './lib/flights';
import { saveFlights, loadFlights } from './lib/storage';

export default function App() {
  const { airports, airportMap, isLoading: isAirportLoading, error: airportError } = useAirportIndex();
  const [flights, setFlights] = useState(() => loadFlights());
  const [selectedId, setSelectedId] = useState('');
  const [editingId, setEditingId] = useState('');
  const [yearFilter, setYearFilter] = useState('All');

  useEffect(() => {
    saveFlights(flights);
  }, [flights]);

  const enrichedFlights = useMemo(() => {
    return sortFlightsDescending(flights.map(enrichFlight));
  }, [flights]);

  const yearOptions = useMemo(() => {
    const years = new Set(enrichedFlights.map((flight) => getFlightYear(flight)));
    return ['All', ...[...years].filter((year) => year !== 'Unknown').sort((a, b) => Number(b) - Number(a))];
  }, [enrichedFlights]);

  const visibleFlights = useMemo(() => {
    return filterFlightsByYear(enrichedFlights, yearFilter);
  }, [enrichedFlights, yearFilter]);

  const stats = useMemo(() => buildStats(visibleFlights), [visibleFlights]);

  const selectedFlight = useMemo(() => {
    return visibleFlights.find((flight) => flight.id === selectedId) || null;
  }, [selectedId, visibleFlights]);

  const editingFlight = useMemo(() => {
    return enrichedFlights.find((flight) => flight.id === editingId) || null;
  }, [editingId, enrichedFlights]);

  useEffect(() => {
    if (selectedId && !visibleFlights.some((flight) => flight.id === selectedId)) {
      setSelectedId('');
    }
  }, [selectedId, visibleFlights]);

  function handleSubmitFlight(values) {
    const nextRecord = makeFlightRecord(values);

    setFlights((current) => {
      const index = current.findIndex((flight) => flight.id === nextRecord.id);
      if (index === -1) {
        return [nextRecord, ...current];
      }

      const copy = [...current];
      copy[index] = { ...copy[index], ...nextRecord, createdAt: copy[index].createdAt || nextRecord.createdAt };
      return copy;
    });

    setSelectedId(nextRecord.id);
    setEditingId('');
  }

  function handleEditFlight(id) {
    setEditingId(id);
    setSelectedId(id);
  }

  function handleDeleteFlight(id) {
    const confirmed = window.confirm('Delete this flight from your local log?');
    if (!confirmed) return;

    setFlights((current) => current.filter((flight) => flight.id !== id));
    if (selectedId === id) setSelectedId('');
    if (editingId === id) setEditingId('');
  }

  function handleExport() {
    const payload = {
      exportedAt: new Date().toISOString(),
      version: 3,
      flights
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `flight-log-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(event) {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || '{}'));
        const importedFlights = Array.isArray(parsed) ? parsed : parsed.flights;

        if (!Array.isArray(importedFlights)) {
          throw new Error('JSON must be an array of flights or an object with a flights array.');
        }

        if (flights.length > 0) {
          const confirmed = window.confirm('Replace the current local flight log with the imported file?');
          if (!confirmed) {
            input.value = '';
            return;
          }
        }

        setFlights(importedFlights);
        setSelectedId('');
        setEditingId('');
        setYearFilter('All');
      } catch (error) {
        window.alert(error instanceof Error ? error.message : 'Import failed.');
      } finally {
        input.value = '';
      }
    };

    reader.readAsText(file);
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <span className="eyebrow">Personal aviation vanity project</span>
          <h1>Flight Log</h1>
          <p>
            Month-level flight records with year filtering, route focus, import/export, and an interactive globe.
          </p>
        </div>
      </header>

      <main className="app-grid">
        <aside className="sidebar-stack">
          <StatsPanel stats={stats} />
          <FlightForm
            airports={airports}
            airportMap={airportMap}
            onSubmit={handleSubmitFlight}
            editingFlight={editingFlight}
            onCancelEdit={() => setEditingId('')}
            isAirportLoading={isAirportLoading}
            airportError={airportError}
          />
        </aside>

        <GlobePanel
          flights={visibleFlights}
          selectedFlight={selectedFlight}
          selectedId={selectedId}
          onSelectFlight={setSelectedId}
        />

        <FlightList
          flights={visibleFlights}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onEdit={handleEditFlight}
          onDelete={handleDeleteFlight}
          onClearSelection={() => setSelectedId('')}
          yearFilter={yearFilter}
          onYearFilterChange={setYearFilter}
          yearOptions={yearOptions}
          onExport={handleExport}
          onImport={handleImport}
        />
      </main>
    </div>
  );
}
