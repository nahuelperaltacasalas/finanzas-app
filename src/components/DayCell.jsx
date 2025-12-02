// Component representing a single day cell in the calendar.
// Shows the day number, the day's net balance, and the list of movements.
import { isSameDay } from '../lib/dateUtils.js';

/**
 * Formats an amount as a currency string.
 *
 * @param {number} amount
 * @returns {string}
 */
function formatCurrency(amount) {
  return `$${amount.toFixed(2)}`;
}

/**
 * DayCell component.
 *
 * @param {{ date: Date, inCurrentMonth: boolean, today: Date, movements: Array }} props
 */
function DayCell({ date, inCurrentMonth, today, movements }) {
  // Determine if this cell corresponds to the current day
  const isToday = isSameDay(date, today);
  // Compute the net balance for the day
  const saldoDia = movements.reduce((acc, mov) => {
    return mov.kind === 'INGRESO' ? acc + mov.amount : acc - mov.amount;
  }, 0);
  // Build class names for styling
  const cellClassNames = [
    'day-cell',
    !inCurrentMonth ? 'outside-month' : '',
    isToday ? 'today' : '',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <div className={cellClassNames}>
      <div className="day-cell-header">
        <span className="day-number">{date.getDate()}</span>
        {movements.length > 0 && (
          <span
            className={
              'day-saldo ' + (saldoDia >= 0 ? 'positive' : 'negative')
            }
          >
            {saldoDia >= 0 ? '+' : '-'}
            {formatCurrency(Math.abs(saldoDia))}
          </span>
        )}
      </div>
      <div className="day-content">
        {movements.length === 0 ? (
          <span className="placeholder-text">(sin movimientos)</span>
        ) : (
          movements.map((mov) => (
            <div key={mov.id} className="movement-row">
              <span
                className={
                  'movement-kind ' +
                  (mov.kind === 'INGRESO' ? 'ingreso' : 'gasto')
                }
              >
                {mov.kind === 'INGRESO' ? 'Ing' : 'Gas'}
              </span>
              <span className="movement-label" title={mov.sourceOrReason}>
                {mov.sourceOrReason}
              </span>
              <span
                className={
                  'movement-amount ' +
                  (mov.kind === 'INGRESO' ? 'ingreso' : 'gasto')
                }
              >
                {mov.kind === 'INGRESO' ? '+' : '-'}
                {formatCurrency(mov.amount)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default DayCell;