import { useMemo, useState } from 'react'
import { useData } from '../context/DataContext.jsx'
import { getTodayISO } from '../lib/dateUtils.js'

function money(n) {
  const v = Number(n ?? 0)
  return `$${v.toFixed(2)}`
}

function GoalBadge({ type, status }) {
  const isAction = type === 'action'
  const s = status ?? 'pending'

  const label = isAction ? 'ACCIÓN' : 'DINERO'
  const statusLabel =
    s === 'pending' ? 'PENDIENTE' : s === 'done' ? 'HECHA' : 'CANCELADA'

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '2px 8px',
        borderRadius: 999,
        border: '1px solid rgba(255,255,255,0.14)',
        background: 'rgba(255,255,255,0.06)',
        fontSize: 12,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ letterSpacing: 0.4 }}>{label}</span>
      <span style={{ opacity: 0.75 }}>·</span>
      <span style={{ letterSpacing: 0.4, opacity: 0.9 }}>{statusLabel}</span>
    </span>
  )
}

export default function ObjectivesPage() {
  const { objectives, addObjective, resolveGoal } = useData()

  const [filter, setFilter] = useState('all') // all | pending | done | canceled

  const todayISO = useMemo(() => getTodayISO(), [])

  const list = useMemo(() => {
    const arr = objectives ?? []
    // Orden: más reciente primero por createdAt (si existe)
    return arr.slice().sort((a, b) => {
      const ad = a.createdAt ?? ''
      const bd = b.createdAt ?? ''
      return bd.localeCompare(ad)
    })
  }, [objectives])

  const filtered = useMemo(() => {
    if (filter === 'all') return list

    return list
      .map((o) => {
        const goals = (o.goals ?? []).filter((g) => (g.status ?? 'pending') === filter)
        return { ...o, goals }
      })
      .filter((o) => (o.goals ?? []).length > 0)
  }, [list, filter])

  const createObjectiveQuick = () => {
    const title = prompt('Título del objetivo:')
    if (!title) return

    // MVP: crear objetivo sin metas, y luego agregarlas desde el flow real (+ Nuevo)
    addObjective({ title, goals: [] })
  }

  const renderGoalRow = (obj, g) => {
    const isAction = g.type === 'action'
    const s = g.status ?? 'pending'

    return (
      <div
        key={g.id}
        style={{
          padding: 10,
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.10)',
          background: 'rgba(255,255,255,0.03)',
          display: 'grid',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'grid', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <GoalBadge type={g.type} status={s} />
              <div style={{ fontWeight: 800 }}>{g.title ?? 'Meta'}</div>
            </div>

            <div style={{ opacity: 0.8, fontSize: 13 }}>
              {isAction ? (
                <>
                  Fecha: {g.dueDate ?? '—'}
                  {g.dueDate && g.dueDate < todayISO ? ' · Atrasado' : ''}
                </>
              ) : (
                <>
                  Target: {money(g.targetAmount ?? 0)}
                  {g.dueDate ? ` · Fecha: ${g.dueDate}` : ''}
                </>
              )}
            </div>
          </div>

          {/* acciones */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {isAction ? (
              <>
                <button
                  className="btn"
                  onClick={() => resolveGoal(obj.id, g.id, { status: 'done' })}
                  disabled={s !== 'pending'}
                >
                  Hecha
                </button>

                <button
                  className="btn"
                  onClick={() => {
                    const v = prompt(
                      'Nueva fecha (YYYY-MM-DD):',
                      String(g.dueDate ?? todayISO)
                    )
                    if (!v) return
                    resolveGoal(obj.id, g.id, { status: 'pending', rescheduleDate: v })
                  }}
                >
                  Reprogramar
                </button>

                <button
                  className="btn"
                  onClick={() => resolveGoal(obj.id, g.id, { status: 'canceled' })}
                  disabled={s === 'canceled'}
                >
                  Cancelar
                </button>
              </>
            ) : (
              <>
                {/* Meta dinero (MVP): se visualiza; no se “confirma” acá. */}
                <button className="btn" disabled title="MVP: solo visualización para metas dinero">
                  Ver
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-root objectives-page">
      <div className="topbar">
        <div>
          <h2 className="topbar-title">Objetivos</h2>
          <div className="page-subtitle" style={{ marginTop: 6 }}>
            Interpretación: cada objetivo agrupa metas. Las metas acción aparecen en Pendientes por fecha.
          </div>
        </div>

        <div className="topbar-right" style={{ flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn" onClick={() => setFilter('all')} disabled={filter === 'all'}>
              Todos
            </button>
            <button
              className="btn"
              onClick={() => setFilter('pending')}
              disabled={filter === 'pending'}
            >
              Pendientes
            </button>
            <button className="btn" onClick={() => setFilter('done')} disabled={filter === 'done'}>
              Hechas
            </button>
            <button
              className="btn"
              onClick={() => setFilter('canceled')}
              disabled={filter === 'canceled'}
            >
              Canceladas
            </button>
          </div>

          <button className="btn primary" onClick={createObjectiveQuick}>
            + Nuevo objetivo
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <div className="placeholder-text">No hay objetivos para este filtro.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {filtered.map((obj) => (
            <div key={obj.id} className="card">
              <div style={{ display: 'grid', gap: 6 }}>
                <div style={{ fontWeight: 900, fontSize: 16 }}>{obj.title ?? 'Objetivo'}</div>
                <div className="section-subtitle">
                  Metas: {(obj.goals ?? []).length} · Creado: {(obj.createdAt ?? '').slice(0, 10) || '—'}
                </div>
              </div>

              <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
                {(obj.goals ?? []).length === 0 ? (
                  <div className="placeholder-text">Este objetivo todavía no tiene metas.</div>
                ) : (
                  (obj.goals ?? []).map((g) => renderGoalRow(obj, g))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card" style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 800 }}>Nota</div>
        <div className="page-subtitle" style={{ marginTop: 6 }}>
          En MVP, la creación completa de objetivos + metas vive en <strong>+ Nuevo</strong>.
          Este “+ Nuevo objetivo” es solo un atajo temporal para test.
        </div>
      </div>
    </div>
  )
}
