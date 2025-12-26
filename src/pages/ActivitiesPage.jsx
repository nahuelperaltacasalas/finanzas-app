import { useMemo, useState } from 'react'
import { useData } from '../context/DataContext.jsx'

function toISODate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function ActivitiesPage() {
  const { tasks, resolveTask, addTask, activityLog } = useData()

  const [tab, setTab] = useState('tasks') // tasks | log
  const [filter, setFilter] = useState('pending') // pending | done | canceled | all

  const todayISO = useMemo(() => toISODate(new Date()), [])

  const filteredTasks = useMemo(() => {
    const list = tasks ?? []
    const byStatus =
      filter === 'all' ? list : list.filter((t) => (t.status ?? 'pending') === filter)

    // Orden: por fecha (dueDate) asc; sin fecha al final
    return byStatus.slice().sort((a, b) => {
      const ad = a.dueDate ?? '9999-12-31'
      const bd = b.dueDate ?? '9999-12-31'
      return ad.localeCompare(bd)
    })
  }, [tasks, filter])

  const sortedLog = useMemo(() => {
    const list = activityLog ?? []
    return list.slice().sort((a, b) => {
      const ad = a.createdAt ?? ''
      const bd = b.createdAt ?? ''
      return bd.localeCompare(ad)
    })
  }, [activityLog])

  return (
    <div className="page-root">
      <div className="topbar">
        <div>
          <h2 className="topbar-title">Actividades</h2>
          <div className="page-subtitle" style={{ marginTop: 6 }}>
            Tareas del usuario (pilar) + Activity Log automático del sistema.
          </div>
        </div>

        <div className="topbar-right" style={{ flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn" onClick={() => setTab('tasks')} disabled={tab === 'tasks'}>
              Tareas
            </button>
            <button className="btn" onClick={() => setTab('log')} disabled={tab === 'log'}>
              Activity Log
            </button>
          </div>

          {tab === 'tasks' ? (
            <button
              className="btn primary"
              onClick={() => {
                const title = prompt('Nueva actividad (tarea):')
                if (!title) return
                const dueDate = prompt('Fecha (YYYY-MM-DD) opcional:', todayISO) || null
                addTask({ title, dueDate: dueDate || null, status: 'pending' })
              }}
            >
              + Nueva
            </button>
          ) : null}
        </div>
      </div>

      {tab === 'tasks' ? (
        <>
          <div className="card">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ fontWeight: 800 }}>Filtro</div>
              <button className="btn" onClick={() => setFilter('pending')} disabled={filter === 'pending'}>
                Pendientes
              </button>
              <button className="btn" onClick={() => setFilter('done')} disabled={filter === 'done'}>
                Hechas
              </button>
              <button className="btn" onClick={() => setFilter('canceled')} disabled={filter === 'canceled'}>
                Canceladas
              </button>
              <button className="btn" onClick={() => setFilter('all')} disabled={filter === 'all'}>
                Todas
              </button>
              <div style={{ marginLeft: 'auto', opacity: 0.75, fontSize: 12 }}>
                Items: {filteredTasks.length}
              </div>
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="card">
              <div className="placeholder-text">No hay tareas para este filtro.</div>
            </div>
          ) : (
            <div className="card">
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Título</th>
                    <th>Estado</th>
                    <th style={{ textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((t) => (
                    <tr key={t.id}>
                      <td>{t.dueDate ?? '—'}</td>
                      <td>{t.title ?? '—'}</td>
                      <td style={{ textTransform: 'capitalize' }}>{t.status ?? 'pending'}</td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          className="btn"
                          onClick={() => resolveTask(t.id, { status: 'done' })}
                          disabled={(t.status ?? 'pending') !== 'pending'}
                        >
                          Hecha
                        </button>{' '}
                        <button
                          className="btn"
                          onClick={() => {
                            const v = prompt('Nueva fecha (YYYY-MM-DD):', String(t.dueDate ?? todayISO))
                            if (!v) return
                            resolveTask(t.id, { status: 'pending', rescheduleDate: v })
                          }}
                        >
                          Reprogramar
                        </button>{' '}
                        <button
                          className="btn"
                          onClick={() => resolveTask(t.id, { status: 'canceled' })}
                          disabled={(t.status ?? 'pending') === 'canceled'}
                        >
                          Cancelar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="card">
            <div className="section-title">Activity Log (automático)</div>
            <div className="section-subtitle">
              Eventos del sistema: crear/editar/confirmar/resolver. No se crea manualmente.
            </div>

            {sortedLog.length === 0 ? (
              <div className="placeholder-text" style={{ marginTop: 10 }}>No hay eventos aún.</div>
            ) : (
              <div style={{ marginTop: 10, overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Tipo</th>
                      <th>Payload</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedLog.map((e) => (
                      <tr key={e.id}>
                        <td>{(e.createdAt ?? '').slice(0, 19).replace('T', ' ') || '—'}</td>
                        <td>{e.type ?? '—'}</td>
                        <td style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>
                          {JSON.stringify(e.payload ?? {})}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
