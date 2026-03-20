import { useEffect, useMemo, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import { useElementSize } from '../hooks/useElementSize';
import {
  GLOBE_BACKGROUND_URL,
  GLOBE_BUMP_URL,
  GLOBE_TEXTURE_URL
} from '../lib/constants';
import {
  buildAirportPoints,
  buildGlobeArcs,
  focusTargetForFlight
} from '../lib/flights';

export default function GlobePanel({ flights, selectedFlight, selectedId, onSelectFlight }) {
  const globeRef = useRef(null);
  const [containerRef, size] = useElementSize();
  const [hoveredArcId, setHoveredArcId] = useState('');

  const arcs = useMemo(
    () => buildGlobeArcs(flights, selectedId, hoveredArcId),
    [flights, hoveredArcId, selectedId]
  );

  const points = useMemo(() => buildAirportPoints(flights, selectedId), [flights, selectedId]);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;

    const controls = globe.controls();
    controls.autoRotate = !selectedFlight;
    controls.autoRotateSpeed = 0.35;
    controls.enablePan = false;
    controls.minDistance = 140;
    controls.maxDistance = 340;

    if (selectedFlight) {
      globe.pointOfView(focusTargetForFlight(selectedFlight), 1100);
    } else {
      globe.pointOfView({ lat: 20, lng: 20, altitude: 2.2 }, 900);
    }
  }, [selectedFlight]);

  return (
    <section className="panel globe-panel">
      <div className="panel__header">
        <div>
          <h2>Interactive globe</h2>
          <p>Hover for tooltip, click a route to lock focus.</p>
        </div>
      </div>

      <div className="globe-shell" ref={containerRef}>
        {size.width > 0 && size.height > 0 && (
          <Globe
            ref={globeRef}
            width={size.width}
            height={size.height}
            backgroundImageUrl={GLOBE_BACKGROUND_URL}
            globeImageUrl={GLOBE_TEXTURE_URL}
            bumpImageUrl={GLOBE_BUMP_URL}
            showAtmosphere
            atmosphereColor="#4fc3ff"
            atmosphereAltitude={0.18}
            arcsData={arcs}
            arcStartLat="startLat"
            arcStartLng="startLng"
            arcEndLat="endLat"
            arcEndLng="endLng"
            arcLabel="label"
            arcColor={(arc) => arc.color}
            arcAltitudeAutoScale={(arc) => arc.altitudeScale}
            arcStroke={(arc) => arc.stroke}
//            arcDashLength={0.45}
//            arcDashGap={0.85}
//            arcDashAnimateTime={1600}
            onArcHover={(arc) => setHoveredArcId(arc?.id || '')}
            onArcClick={(arc) => onSelectFlight(arc.id)}
            pointsData={points}
            pointLat="lat"
            pointLng="lng"
            pointLabel="label"
            pointColor={(point) => point.color}
            pointAltitude={(point) => point.altitude}
            pointRadius={(point) => point.radius}
            onPointClick={(point) => {
              const match = flights.find(
                (flight) => flight.from.ident === point.airport.ident || flight.to.ident === point.airport.ident
              );
              if (match) {
                onSelectFlight(match.id);
              }
            }}
          />
        )}

        {flights.length === 0 && (
          <div className="empty-state globe-empty-state">
            <strong>No routes yet.</strong>
            <p>Add a flight and the globe will stop looking ornamental.</p>
          </div>
        )}
      </div>
    </section>
  );
}
