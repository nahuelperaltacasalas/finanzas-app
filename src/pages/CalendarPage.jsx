// CalendarPage: renders the month view of incomes and expenses.
// Provides controls to navigate between months and shows each day using DayCell.
import { useState } from 'react';
import {
  getMonthMatrix,
  getMonthLabel,
  toISODate,
} from '../lib/dateUtils.js';
import { sampleMovements } from '../lib/sampleData.js';
import DayCell from '../components/DayCell.jsx';

const weekdayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function CalendarPage() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  // Generate the calendar matrix for the currently selected month
  const monthMatrix = getMonthMatrix(currentYear, currentMonth);
  // Handlers to go to previous and next month
  function goPrevMonth() {
    setCurrentMonth((prev) => {
      if (prev === 0) {
        setCurrentYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  }
  function goNextMonth() {
    setCurrentMonth((prev) => {
      if (prev === 11) {
        setCurrentYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  }
  // Given a date, find all movements that fall on that date
  function getMovementsForDate(date) {
    const iso = toISODate(date);
    return sampleMovements.filter((mov) => mov.date === iso);
  }
  return (
    <div className="calendar-page">
      <header className="calendar-header">
        <div>
          <h1 className="page-title">Finanzas personales</h1>
          <p className="page-subtitle">
            Vista mensual de ingresos y gastos (datos de ejemplo). Más adelante
            conectamos formularios y lógica real.
          </p>
        </div>
        <div className="month-switcher">
          <button className="btn-ghost" onClick={goPrevMonth}>
            {'< Anterior'}
          </button>
          <span className="month-label">
            {getMonthLabel(currentYear, currentMonth)}
          </span>
          <button className="btn-ghost" onClick={goNextMonth}>
            {'Siguiente >'}
          </button>
        </div>
      </header>
      <section className="calendar-card">
        <div className="weekday-row">
          {weekdayNames.map((day) => (
            <div key={day} className="weekday-cell">
              {day}
            </div>
          ))}
        </div>
        <div className="calendar-grid">
          {monthMatrix.map((week, rowIdx) =>
            week.map((cell, colIdx) => (
              <DayCell
                key={`${rowIdx}-${colIdx}`}
                date={cell.date}
                inCurrentMonth={cell.inCurrentMonth}
                today={today}
                movements={getMovementsForDate(cell.date)}
              />
            )),
          )}
        </div>
      </section>
    </div>
  );
}

export default CalendarPage;