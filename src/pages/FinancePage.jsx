// src/pages/FinancePage.jsx
import { useMemo, useState } from 'react'
import { useData } from '../context/DataContext.jsx'

function toISODate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function startOfMonth(d) {
  const x = new Date(d)
  x.setDate(1)
  x.setHours(0, 0, 0, 0)
  return x
}

function endOfMonth(d) {
  const x = new Date(d)
  x.setMonth(x.getMonth() + 1)
  x.setDate(0)
  x.setHours(23, 59, 59, 999)
  return x
}

function money(n) {
  const v = Number(n ?? 0)
  return `$${v.toFixed(2)}`
}

function movementEffectiveAmount(m) {
  const status = m.status ?? 'pending'
  if (status === 'confirmed') return Number(m.amountReal ?? m.finalAmount ?? m.amount ?? 0)
  return Number(m.amount ?? 0)
}

function movementDateISO(m) {
  if (m.date) return m.date
  if (m.createdAt) return String(m.createdAt).slice(0, 10)
  return null
}

export default function FinancePage() {
  const { movements, getRealBalance, getExpectedBalance } = useData()

  const [statusFilter, setStatusFilter] = useState('confirmed') // confirmed | pending | canceled | all
  const [range, setRange] = useState('month') // month | all
  const [includeEstimated, setIncludeEstimated] = useState(true)

  const now = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const monthStartISO = useMemo(() => toISODate(startOfMonth(now)), [now])
  const monthEndISO = useMemo(() => toISODate(endOfMonth(now)), [now])

  const filtered = useMemo(() => {
    const list = movements ?? []

    const byStatus = list.filter((m) => {
      const s = m.status ?? 'pending'
      if (statusFilter === 'all') return true
      return s === statusFilter
    })

    const byRange = byStatus.filter((m) => {
      if (range === 'all') return true
      const d = movementDateISO(m)
      if (!d) return false
      return d >= monthStartISO && d <= monthEndISO
    })

    return byRange.sort((a, b) => {
      const da = movementDateISO(a) ?? '0000-00-00'
      const db = movementDateISO(b) ?? '0000-00-00'
      return db.localeCompare(da)
    })
  }, [movements, statusFilter, range, monthStartISO, monthEndISO])

  const summary = useMemo(() => {
    let income = 0
    let expense = 0

    for (const m of filtered) {
      const amt = movementEffectiveAmount(m)
      if ((m.type ?? 'gasto') === 'ingreso') income += amt
      else expense += amt
    }

    return { income, expense, balance: income - expense }
  }, [filtered])

  const realBalance = useMemo(() => {
    return getRealBalance?.() ?? { income: 0, expense: 0, balance: 0 }
  }, [getRealBalance, movements])

  const expectedBalance = useMemo(() => {
    return getExpectedBalance?.({ includeEstimated }) ?? { income: 0, expense: 0, balance: 0 }
  }, [getExpectedBalance, includeEstimated, movements])

  return (
    <div className="page-root">
      <div className="topbar">
        <div>
          <h2 className="topbar-title">Finanzas</h2>
          <div className="page-subtitle" style={{ marginTop: 6 }}>
            Por defecto: <strong>confirmados</strong> del <strong>mes actual</strong>.
          </div>
        </div>

        <div className="topbar-right" style={{ flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={includeEstimated}
              onChange={(e) => setIncludeEstimated(e.target.checked)}
            />
            Incluir estimados (en Esperado)
          </label>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn" onClick={() => setStatusFilter('confirmed')} disabled={statusFilter === 'confirmed'}>
              Confirmados
            </button>
            <button className="btn" onClick={() => setStatusFilter('pending')} disabled={statusFilter === 'pending'}>
              Pendientes
            </button>
            <button className="btn" onClick={() => setStatusFilter('canceled')} disabled={statusFilter === 'canceled'}>
              Cancelados
            </button>
            <button className="btn" onClick={() => setStatusFilter('all')} disabled={statusFilter === 'all'}>
              Todos
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" onClick={() => setRange('month')} disabled={range === 'month'}>
              Mes
            </button>
            <button className="btn" onClick={() => setRange('all')} disabled={range === 'all'}>
              Todo
            </button>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="card stat-pill">
          <span>Saldo Real</span>
          <strong>{money(realBalance.balance)}</strong>
        </div>
        <div className="card stat-pill">
          <span>Saldo Esperado</span>
          <strong>{money(expectedBalance.balance)}</strong>
        </div>
      </div>

      <div className="stats-grid">
        <div className="card stat-pill">
          <span>Ingresos</span>
          <strong>{money(summary.income)}</strong>
        </div>
        <div className="card stat-pill">
          <span>Gastos</span>
          <strong>{money(summary.expense)}</strong>
        </div>
        <div className="card stat-pill">
          <span>Balance</span>
          <strong>{money(summary.balance)}</strong>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
          <div>
            <div className="section-title">Historial</div>
            <div className="section-subtitle" style={{ marginTop: 4 }}>
              {range === 'month' ? `Rango: ${monthStartISO} → ${monthEndISO}` : 'Rango: todo'}
              {' · '}
              Estado: {statusFilter}
              {' · '}
              Items: {filtered.length}
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="placeholder-text" style={{ marginTop: 10 }}>
            No hay movimientos para este filtro/rango.
          </div>
        ) : (
          <div style={{ marginTop: 10, overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Título</th>
                  <th>Estado</th>
                  <th>Estimado</th>
                  <th style={{ textAlign: 'right' }}>Monto</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => {
                  const dateISO = movementDateISO(m) ?? '—'
                  const type = m.type ?? 'gasto'
                  const status = m.status ?? 'pending'
                  const title = m.title ?? '—'
                  const amt = movementEffectiveAmount(m)
                  const est = m.estimated ? 'Sí' : 'No'

                  return (
                    <tr key={m.id}>
                      <td>{dateISO}</td>
                      <td>{type}</td>
                      <td>{title}</td>
                      <td>{status}</td>
                      <td>{est}</td>
                      <td style={{ textAlign: 'right' }}>{money(amt)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
