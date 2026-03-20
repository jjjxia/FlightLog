import { formatDistance } from '../lib/format';

function StatCard({ label, value, helper }) {
  return (
    <div className="stat-card">
      <span className="stat-card__label">{label}</span>
      <strong className="stat-card__value">{value}</strong>
      {helper ? <small className="stat-card__helper">{helper}</small> : null}
    </div>
  );
}

export default function StatsPanel({ stats }) {
  return (
    <section className="panel stats-panel">
      <div className="panel__header">
        <div>
          <h2>Overview</h2>
          <p>Distance, coverage, and monthly activity at a glance.</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label="Flights" value={stats.totalFlights} />
        <StatCard label="Distance" value={formatDistance(stats.totalDistanceKm)} />
        <StatCard label="Airports" value={stats.uniqueAirports} />
        <StatCard label="Countries" value={stats.uniqueCountries} />
        <StatCard label="Months logged" value={stats.monthsLogged} />
        <StatCard
          label="Longest"
          value={stats.longestFlight ? `${stats.longestFlight.from.code} -> ${stats.longestFlight.to.code}` : 'N/A'}
          helper={stats.longestFlight ? formatDistance(stats.longestFlight.distanceKm) : ''}
        />
      </div>
    </section>
  );
}
