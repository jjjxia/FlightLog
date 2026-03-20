export const PURPOSE_OPTIONS = [
  { value: 'leisure', label: 'Leisure' },
  { value: 'school', label: 'School' },
  { value: 'family', label: 'Family' },
  { value: 'conference', label: 'Conference' },
  { value: 'other', label: 'Other' }
];

export const PURPOSE_COLORS = {
  leisure: '#ff8fab',
  school: '#59d7ff',
  family: '#76e4a0',
  conference: '#f9c74f',
  other: '#b08cff'
};

export const AIRPORTS_CACHE_KEY = 'flight-log.airports.v1';
export const FLIGHTS_STORAGE_KEY = 'flight-log.records.v2';

export const AIRPORTS_SOURCE_URL = 'https://davidmegginson.github.io/ourairports-data/airports.csv';

export const GLOBE_TEXTURE_URL = 'https://unpkg.com/three-globe/example/img/earth-night.jpg';
export const GLOBE_BUMP_URL = 'https://unpkg.com/three-globe/example/img/earth-topology.png';
export const GLOBE_BACKGROUND_URL = 'https://unpkg.com/three-globe/example/img/night-sky.png';
