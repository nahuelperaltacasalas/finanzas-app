// Utility functions for working with dates and calendars

export function getTodayISO() {
  return toISODate(new Date())
}

export function startOfWeekMonday(date = new Date()) {
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(date)
  monday.setDate(date.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  return monday
}

export function endOfWeekSunday(date = new Date()) {
  const monday = startOfWeekMonday(date)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  return sunday
}

export function daysBetween(a, b) {
  const ms = 24 * 60 * 60 * 1000
  return Math.floor((a.getTime() - b.getTime()) / ms)
}

/**
 * Array of month names in Spanish. Used for labeling the calendar.
 */
const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Setiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

/**
 * Generates a 6x7 matrix representing the days to display for a given month.
 * Each cell contains an object with the date and a flag indicating whether
 * it belongs to the current month.
 *
 * The calendar always displays 6 rows of 7 days (42 cells) to account for
 * months that span six weeks when the first day of the month falls late in
 * the week. Days from the previous or next month are included to fill
 * the grid.
 *
 * @param {number} year The full year (e.g. 2025)
 * @param {number} month The zero‑based month (0 = January)
 * @returns {Array<Array<{ date: Date, inCurrentMonth: boolean }>>}
 */
export function getMonthMatrix(year, month) {
  const matrix = [];
  const firstOfMonth = new Date(year, month, 1);
  // JS getDay(): 0=Sunday, 6=Saturday. Convert to 0=Monday ... 6=Sunday
  const jsDay = firstOfMonth.getDay();
  const offset = (jsDay + 6) % 7;
  // Start date is the Monday of the week containing the first of the month
  const startDate = new Date(year, month, 1 - offset);
  for (let week = 0; week < 6; week++) {
    const row = [];
    for (let day = 0; day < 7; day++) {
      const index = week * 7 + day;
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + index);
      row.push({
        date: currentDate,
        inCurrentMonth: currentDate.getMonth() === month,
      });
    }
    matrix.push(row);
  }
  return matrix;
}

/**
 * Compares two dates and returns true if they represent the same calendar day.
 *
 * @param {Date} d1
 * @param {Date} d2
 * @returns {boolean}
 */
export function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * Returns a string label for the given month and year (e.g. "Noviembre 2025").
 *
 * @param {number} year
 * @param {number} month
 * @returns {string}
 */
export function getMonthLabel(year, month) {
  return `${MONTH_NAMES[month]} ${year}`;
}

/**
 * Formats a date as an ISO string (YYYY‑MM‑DD).
 *
 * @param {Date} date
 * @returns {string}
 */
export function toISODate(date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}