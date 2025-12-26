import { useMemo, useState } from 'react'
import { useData } from '../context/DataContext.jsx'

function toISODate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function startOfWeekMonday(d) {
  // JS: 0=Sun..6=Sat → queremos lunes inicio
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(d)
  monday.setDate(d.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  return monday
}

function endOfWeekSunday(d) {
  const monday = startOfWeekMonday(d)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  return sunday
}

function daysBetween(a, b) {
  // a,b: Date (00:00)
  const ms = 24 * 60 * 60 * 1000
  return Math.floor((a.getTime() - b.getTime()) / ms)
}

function KindBadge({ kind }) {
  const map = {
    movement: { label: 'MOVIMIENTO', emoji: '💸' },
    goal: { label: 'META', emoji: '🎯' },
    task: { label: 'ACTIVIDAD', emoji: '✅' },
  }
  const v = map[kind] ?? { label: 'ITEM', emoji: '•' }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 12,
        padding: '2px 8px',
        borderRadius: 999,
        border: '1px solid rgba(255,255,255,0.14)',
        background: 'rgba(255,255,255,0.06)',
        whiteSpace: 'nowrap',
      }}
    >
      <span aria-hidden="true">{v.emoji}</span>
      <span style={{ letterSpacing: 0.4 }}>{v.label}</span>
    </span>
  )
}

function Section({ title, subtitle, count, children }) {
  return (
    <div className="card" style={{ marginTop: 12 }}>
      <div style={{ display: 'grid', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <div style={{ fontWeight: 800 }}>{title}</div>
          <div style={{ opacity: 0.7, fontSize: 12 }}>({count})</div>
        </div>
        <div style={{ opacity: 0.75, fontSize: 12 }}>{subtitle}</div>
      </div>

      <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>{children}</div>
    </div>
  )
}

export default function PendingPage() {
  const { getPendingItems, confirmMovement, resolveGoal, resolveTask, todayISO } =
    useData()

  const [filter, setFilter] = useState('all') // all | movements | goals | tasks

  const now = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const weekStart = useMemo(() => startOfWeekMonday(now), [now])
  const weekEnd = useMemo(() => endOfWeekSunday(now), [now])
  const weekStartISO = useMemo(() => toISODate(weekStart), [weekStart])
  const weekEndISO = useMemo(() => toISODate(weekEnd), [weekEnd])

  const all = useMemo(() => {
    const f = filter === 'all' ? 'all' : filter
    return getPendingItems?.({ filter: f }) ?? []
  }, [filter, getPendingItems])

  const items = useMemo(() => {
    // normalizamos dateISO y aplanamos data
    return (all ?? []).map((it) => {
      const dateISO = it.date ?? null
      return {
        ...it,
        dateISO,
        data: it.data ?? {},
      }
    })
  }, [all])

  // HOY
  const todayItems = useMemo(() => {
    return items
      .filter((it) => it.dateISO && it.dateISO === todayISO)
      .sort((a, b) => (a.kind ?? '').localeCompare(b.kind ?? ''))
  }, [items, todayISO])

  // ATRASADO (prioridad: más días atrasado primero)
  const overdueItems = useMemo(() => {
    return items
      .filter((it) => it.dateISO && it.dateISO < todayISO)
      .map((it) => {
        const d = new Date(it.dateISO + 'T00:00:00')
        const overdueDays = daysBetween(now, d)
        return { ...it, overdueDays }
      })
      .sort((a, b) => (b.overdueDays ?? 0) - (a.overdueDays ?? 0))
  }, [items, todayISO, now])

  // ESTA SEMANA (lun-dom) -> solo próximos dentro de la semana actual
  const weekItems = useMemo(() => {
    return items
      .filter((it) => {
        if (!it.dateISO) return false
        if (it.dateISO <= todayISO) return false // excluye hoy y atrasado
        return it.dateISO >= weekStartISO && it.dateISO <= weekEndISO
      })
      .sort((a, b) => (a.dateISO ?? '').localeCompare(b.dateISO ?? ''))
  }, [items, todayISO, weekStartISO, weekEndISO])

  const renderRow = (it) => {
    const data = it.data ?? {}

    const title =
      it.kind === 'movement'
        ? data.title || 'Movimiento'
        : it.kind === 'goal'
          ? data.title || 'Meta'
          : data.title || 'Actividad'

    const dateText = it.dateISO ?? 'sin fecha'

    return (
      <div key={`${it.kind}_${it.id}`} className="card" style={{ padding: 12 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            alignItems: 'flex-start',
          }}
        >
          <div style={{ display: 'grid', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <KindBadge kind={it.kind} />
              <div style={{ fontWeight: 800 }}>{title}</div>
            </div>

            <div style={{ opacity: 0.8, fontSize: 13 }}>
              {dateText}

              {it.kind === 'movement' ? (
                <>
                  {' · '}$
                  {Number(data.amount ?? 0).toFixed(2)}
                </>
              ) : null}

              {it.kind === 'goal' && data.objectiveTitle ? (
                <>
                  {' · '}Objetivo: {data.objectiveTitle}
                </>
              ) : null}

              {it.overdueDays ? (
                <>
                  {' · '}Atrasado: {it.overdueDays} día(s)
                </>
              ) : null}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 6,
              flexWrap: 'wrap',
              justifyContent: 'flex-end',
            }}
          >
            {it.kind === 'movement' ? (
              <>
                <button className="btn" onClick={() => confirmMovement(data.id, { outcome: 'EQUAL' })}>
                  Igual
                </button>

                <button
                  className="btn"
                  onClick={() => {
                    const v = prompt('Monto final (más):', String(data.amount ?? ''))
                    if (v != null) confirmMovement(data.id, { outcome: 'MORE', finalAmount: v })
                  }}
                >
                  Más
                </button>

                <button
                  className="btn"
                  onClick={() => {
                    const v = prompt('Monto final (menos):', String(data.amount ?? ''))
                    if (v != null) confirmMovement(data.id, { outcome: 'LESS', finalAmount: v })
                  }}
                >
                  Menos
                </button>

                <button className="btn" onClick={() => confirmMovement(data.id, { outcome: 'NO_SHOW' })}>
                  No ocurrió
                </button>
              </>
            ) : (
              <>
                <button
                  className="btn"
                  onClick={() => {
                    if (it.kind === 'goal') {
                      resolveGoal?.(data.objectiveId, data.id, { status: 'done' })
                    } else if (it.kind === 'task') {
                      resolveTask?.(data.id, { status: 'done' })
                    }
                  }}
                >
                  Hecha
                </button>

                <button
                  className="btn"
                  onClick={() => {
                    const v = prompt('Nueva fecha (YYYY-MM-DD):', String(it.dateISO ?? todayISO))
                    if (!v) return

                    if (it.kind === 'goal') {
                      // reprogramar = mantener pending y cambiar dueDate
                      resolveGoal?.(data.objectiveId, data.id, {
                        status: 'pending',
                        rescheduleDate: v,
                      })
                    } else if (it.kind === 'task') {
                      resolveTask?.(data.id, {
                        status: 'pending',
                        rescheduleDate: v,
                      })
                    }
                  }}
                >
                  Reprogramar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-root">
      <div className="topbar">
        <div>
          <h2 className="topbar-title">Pendientes</h2>
          <div className="page-subtitle" style={{ marginTop: 6 }}>
            Esto es lo que necesita tu atención ahora (presente): decisiones y
            acciones por cerrar.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn" onClick={() => setFilter('all')}>
            Todos
          </button>
          <button className="btn" onClick={() => setFilter('movements')}>
            Movimientos
          </button>
          <button className="btn" onClick={() => setFilter('goals')}>
            Metas
          </button>
          <button className="btn" onClick={() => setFilter('tasks')}>
            Actividades
          </button>
        </div>
      </div>

      <Section
        title="HOY"
        subtitle="Lo que requiere tu atención ahora (presente): confirmar o resolver hoy."
        count={todayItems.length}
      >
        {todayItems.length === 0 ? (
          <div className="placeholder-text">Nada para hoy 🎉</div>
        ) : (
          todayItems.map(renderRow)
        )}
      </Section>

      <Section
        title="ATRASADO (prioridad)"
        subtitle="Lo vencido que quedó pendiente. Ordenado por prioridad (más días atrasado primero)."
        count={overdueItems.length}
      >
        {overdueItems.length === 0 ? (
          <div className="placeholder-text">No hay atrasos 🙌</div>
        ) : (
          overdueItems.map(renderRow)
        )}
      </Section>

      <Section
        title="ESTA SEMANA (lun-dom)"
        subtitle={`Lo próximo a confirmar o hacer en la semana actual (${weekStartISO} → ${weekEndISO}).`}
        count={weekItems.length}
      >
        {weekItems.length === 0 ? (
          <div className="placeholder-text">Nada más por esta semana.</div>
        ) : (
          weekItems.map(renderRow)
        )}
      </Section>

      <div className="card" style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 800 }}>Buscar / Historial</div>
        <div className="page-subtitle" style={{ marginTop: 6 }}>
          Próximo: una vista para buscar y filtrar todo el registro (tipo, estado,
          fecha, monto, prioridad).
        </div>
      </div>
    </div>
  )
}
