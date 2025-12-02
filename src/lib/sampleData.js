// Example movements for the Finanzas App calendar.
// These are used to populate the calendar with sample incomes and expenses.
// Each movement consists of a kind (INGRESO or GASTO), a date in
// ISO format, an amount, a description, and a status.

/**
 * @typedef {Object} Movement
 * @property {string} id Unique identifier for the movement
 * @property {"INGRESO" | "GASTO"} kind Type of movement
 * @property {string} date ISO formatted date (YYYY‑MM‑DD)
 * @property {number} amount Positive numeric value
 * @property {string} sourceOrReason Description of the movement
 * @property {"REAL" | "PLANIFICADO" | "AJUSTE"} status Status of the movement
 */

/**
 * An array of sample movements to display in the calendar.
 * These include a mix of incomes and expenses, both actual and planned.
 * @type {Movement[]}
 */
export const sampleMovements = [
  {
    id: 'm1',
    kind: 'INGRESO',
    date: '2025-11-05',
    amount: 1500,
    sourceOrReason: 'Sueldo principal',
    status: 'REAL',
  },
  {
    id: 'm2',
    kind: 'GASTO',
    date: '2025-11-06',
    amount: 500,
    sourceOrReason: 'Alquiler',
    status: 'REAL',
  },
  {
    id: 'm3',
    kind: 'GASTO',
    date: '2025-11-07',
    amount: 60,
    sourceOrReason: 'Teléfono',
    status: 'REAL',
  },
  {
    id: 'm4',
    kind: 'GASTO',
    date: '2025-11-10',
    amount: 20,
    sourceOrReason: 'Comida',
    status: 'REAL',
  },
  {
    id: 'm5',
    kind: 'INGRESO',
    date: '2025-11-15',
    amount: 200,
    sourceOrReason: 'Trabajo extra',
    status: 'REAL',
  },
  {
    id: 'm6',
    kind: 'GASTO',
    date: '2025-11-15',
    amount: 14,
    sourceOrReason: 'Netflix',
    status: 'REAL',
  },
  {
    id: 'm7',
    kind: 'GASTO',
    date: '2025-11-20',
    amount: 16,
    sourceOrReason: 'Spotify',
    status: 'PLANIFICADO',
  },
  {
    id: 'm8',
    kind: 'INGRESO',
    date: '2025-11-25',
    amount: 300,
    sourceOrReason: 'Ingreso futuro',
    status: 'PLANIFICADO',
  },
];