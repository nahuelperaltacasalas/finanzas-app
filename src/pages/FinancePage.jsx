import { sampleMovements } from '../lib/sampleData.js'

function FinancePage() {
  const incomes = sampleMovements.filter((m) => m.kind === 'INGRESO')
  const expenses = sampleMovements.filter((m) => m.kind === 'GASTO')

  const totalIncome = incomes.reduce((acc, m) => acc + m.amount, 0)
  const totalExpense = expenses.reduce((acc, m) => acc + m.amount, 0)

  return (
    <div className="page-root finance-page">
      <h1 className="page-title">Finanzas</h1>
      <p className="page-subtitle">
        Listado de ingresos y gastos (datos de ejemplo).
      </p>

      <section className="card">
        <h2 className="section-title">Resumen</h2>
        <p>
          Total de ingresos: <strong>${totalIncome.toFixed(2)}</strong>
        </p>
        <p>
          Total de gastos: <strong>${totalExpense.toFixed(2)}</strong>
        </p>
      </section>

      <section className="card">
        <h2 className="section-title">Ingresos</h2>
        {incomes.length > 0 ? (
          <table className="finance-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Monto</th>
                <th>Descripción</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {incomes.map((m) => (
                <tr key={m.id}>
                  <td>{m.date}</td>
                  <td>${m.amount.toFixed(2)}</td>
                  <td>{m.sourceOrReason}</td>
                  <td>{m.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="placeholder-text">No hay ingresos registrados.</p>
        )}
      </section>

      <section className="card">
        <h2 className="section-title">Gastos</h2>
        {expenses.length > 0 ? (
          <table className="finance-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Monto</th>
                <th>Descripción</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((m) => (
                <tr key={m.id}>
                  <td>{m.date}</td>
                  <td>${m.amount.toFixed(2)}</td>
                  <td>{m.sourceOrReason}</td>
                  <td>{m.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="placeholder-text">No hay gastos registrados.</p>
        )}
      </section>
    </div>
  )
}

export default FinancePage
