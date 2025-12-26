import { useMemo, useState } from 'react'
import { useData } from '../context/DataContext.jsx'

export default function PendingPage() {
  const { getPendingItems, confirmMovement, resolveGoal, resolveTask } = useData()

  const [timeFilter, setTimeFilter] = useState('all') // all | today | overdue | upcoming
  const [typeFilter, setTypeFilter] = useState('all') // all | movements | goals | tasks

  const allItems = useMemo(() => getPendingItems({ filter: 'all' }), [getPendingItems])

  const items = useMemo(() => {
    let list = allItems

    if (typeFilter === 'movements') list = list.filter((i) => i.kind === 'movement')
    if (typeFilter === 'goals') list = list.filter((i) => i.kind === 'goal')
    if (typeFilter === 'tasks') list = list.filter((i) => i.kind === 'task')

    if (timeFilter !== 'all') list = list.filter((i) => i.bucket === timeFilter)

    return list
  }, [allItems, timeFilter, typeFilter])

  const counts = useMemo(() => {
    const c = {
      all: allItems.length,
      today: 0,
      overdue: 0,
      upcoming: 0,
      movements: 0,
      goals: 0,
      tasks: 0,
    }
    for (const it of allItems) {
      c[it.bucket] = (c[it.bucket] ?? 0) + 1
      if (it.kind === 'movement') c.movements++
      if (it.kind === 'goal') c.goals++
      if (it.kind === 'task') c.tasks++
    }
    return c
  }, [allItems])

  const markGoalDone = (it) => {
    resolveGoal(it.data.objectiveId, it.id, { status: 'done' })
  }

  const rescheduleGoal = (it) => {
    const v = prompt('Reprogramar fecha (YYYY-MM-DD):', String(it.date ?? ''))
    if (v != null) resolveGoal(it.data.objectiveId, it.id, { status: 'pending', rescheduleDate: v })
  }

  const markTaskDone = (it) => resolveTask(it.id, { status: 'done' })
  const rescheduleTask = (it) => {
    const v = prompt('Reprogramar fecha (YYYY-MM-DD):', String(it.date ?? ''))
    if (v != null) resolveTask(it.id, { status: 'pending', rescheduleDate: v })
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Pendientes a confirmar</h1>

        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          <button onClick={() => setTimeFilter('all')}>Todos ({counts.all})</button>
          <button onClick={() => setTimeFilter('today')}>Hoy ({counts.today})</button>
          <button onClick={() => setTimeFilter('overdue')}>Atrasado ({counts.overdue})</button>
          <button onClick={() => setTimeFilter('upcoming')}>Próximo ({counts.upcoming})</button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          <button onClick={() => setTypeFilter('all')}>Tipos: Todos</button>
          <button onClick={() => setTypeFilter('movements')}>Movimientos ({counts.movements})</button>
          <button onClick={() => setTypeFilter('goals')}>Metas ({counts.goals})</button>
          <button onClick={() => setTypeFilter('tasks')}>Actividades ({counts.tasks})</button>
        </div>
      </div>

      <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
        {items.length === 0 ? (
          <div>No hay pendientes en esta vista 🎉</div>
        ) : (
          items.map((it) => {
            if (it.kind === 'movement') {
              const m = it.data
              return (
                <div key={`${it.kind}_${it.id}`} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>
                        {m.type?.toUpperCase?.() ?? 'MOV'} — {m.title ?? 'Movimiento'}
                      </div>
                      <div style={{ opacity: 0.8 }}>
                        {it.date ?? 'sin fecha'} · {it.bucket}
                      </div>
                      <div style={{ marginTop: 6 }}>
                        ${Number(m.amount ?? 0).toFixed(2)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <button onClick={() => confirmMovement(m.id, { outcome: 'EQUAL' })}>Igual</button>
                      <button onClick={() => {
                        const v = prompt('Monto final (más):', String(m.amount ?? ''))
                        if (v != null) confirmMovement(m.id, { outcome: 'MORE', finalAmount: v })
                      }}>Más</button>
                      <button onClick={() => {
                        const v = prompt('Monto final (menos):', String(m.amount ?? ''))
                        if (v != null) confirmMovement(m.id, { outcome: 'LESS', finalAmount: v })
                      }}>Menos</button>
                      <button onClick={() => confirmMovement(m.id, { outcome: 'NO_SHOW' })}>No ocurrió</button>
                    </div>
                  </div>
                </div>
              )
            }

            if (it.kind === 'goal') {
              const g = it.data
              return (
                <div key={`${it.kind}_${it.id}`} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>
                        META — {g.title}
                      </div>
                      <div style={{ opacity: 0.8 }}>
                        Objetivo: {g.objectiveTitle ?? ''} · {it.date ?? 'sin fecha'} · {it.bucket}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <button onClick={() => markGoalDone(it)}>Hecha</button>
                      <button onClick={() => rescheduleGoal(it)}>Reprogramar</button>
                    </div>
                  </div>
                </div>
              )
            }

            // task
            const t = it.data
            return (
              <div key={`${it.kind}_${it.id}`} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>
                      ACTIVIDAD — {t.title}
                    </div>
                    <div style={{ opacity: 0.8 }}>
                      {it.date ?? 'sin fecha'} · {it.bucket}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <button onClick={() => markTaskDone(it)}>Hecha</button>
                    <button onClick={() => rescheduleTask(it)}>Reprogramar</button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
