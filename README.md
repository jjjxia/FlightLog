<<<<<<< HEAD
# FlightLog
=======
# Flight Log

A personal flight-history visualizer built for manual entry rather than live airline data.

## Included in this V2 starter

- manual flight entry
- airport autocomplete backed by the OurAirports CSV feed
- 3D globe with animated arcs
- click-to-focus flight cards and route selection on the globe
- year filter
- stats cards
- local persistence with `localStorage`
- JSON import/export
- edit/delete workflow
- purpose-based route colors

## Stack

- React
- Vite
- react-globe.gl
- Papa Parse

## Getting started

```bash
npm install
npm run dev
```

To build a production bundle:

```bash
npm run build
```

## Notes

### Airport data

On first load, the app fetches the public `airports.csv` dataset from OurAirports and caches a reduced airport index in `localStorage`.

This keeps the repository small while still giving you a broad airport search surface.

### Data model

Each saved flight stores a snapshot of both airports, so your exported JSON stays self-contained even if the airport feed changes later.

### Current scope

This version intentionally does **not** do timezone normalization, real flight lookup, or yearly retrospective pages yet.

That keeps the project aligned with the original goal: a clean personal log that looks good and is easy to extend.

## Next obvious additions

- total airtime card
- trip grouping page
- map screenshots / social share card
- annual review page
- cloud sync
>>>>>>> 438f38a (Initial commit)
