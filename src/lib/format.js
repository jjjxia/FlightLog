const YEAR_MONTH_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/;
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function normalizeYearMonth(value) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  const match = trimmed.match(YEAR_MONTH_PATTERN);
  if (!match) return '';
  return `${match[1]}-${match[2]}`;
}

export function yearMonthFromDate(value) {
  if (!value) return '';

  if (typeof value === 'string') {
    const datePrefix = value.match(/^(\d{4})-(\d{2})/);
    if (datePrefix) {
      const normalized = normalizeYearMonth(`${datePrefix[1]}-${datePrefix[2]}`);
      if (normalized) return normalized;
    }
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function resolveFlightYearMonth(flight) {
  const direct = normalizeYearMonth(flight?.yearMonth);
  if (direct) return direct;
  return yearMonthFromDate(flight?.departureTime);
}

export function formatYearMonth(value) {
  const normalized = normalizeYearMonth(value);
  if (!normalized) return 'Unknown month';
  const [year, month] = normalized.split('-');
  const monthIndex = Number(month) - 1;
  return `${MONTH_NAMES[monthIndex]} ${year}`;
}

export function toYear(value) {
  const normalized = normalizeYearMonth(value);
  if (normalized) return normalized.slice(0, 4);

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return String(date.getFullYear());
}

export function formatDistance(km) {
  if (!Number.isFinite(km)) return 'N/A';
  return `${Math.round(km).toLocaleString()} km`;
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
