import { useMemo, useState } from 'react'
import { useData } from '../context/DataContext.jsx'

function emptyGoal() {
  return { type: 'action', title: '', targetAmount: '', dueDate: '' }
}

export default function NewModal({ open, onClose }) {
  const { addMovement, addObjective, addTask, addNote } = useData()

  const [mode, setMode] = useState('movement') // movement | objective | task | note

  // Shared
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('') // YYYY-MM-DD

  // Movement
  const [movementType, setMovementType] = useState('gasto') // gasto | ingreso
  const [amount, setAmount] = useState('')

  // Objective + Goals
  const [goals, setGoals] = useState([emptyGoal()])

  const resetAndClose = () => {
    setMode('movement')
    setTitle('')
    setDate('')
    setMovementType('gasto')
    setAmount('')
    setGoals([emptyGoal()])
    onClose?.()
  }

  const canSave = useMemo(() => {
    const t = title.trim()

    if (mode === 'movement') return t && String(amount).trim()
    if (mode === 'task') return t
    if (mode === 'note') return t

    if (mode === 'objective') {
      if (!t) return false
      // goals opcionales: permitimos objetivo sin metas
      // si hay metas, deben estar bien formadas
      for (const g of goals) {
        const hasAny = g.title.trim() || g.targetAmount || g.dueDate
        if (!hasAny) continue
        if (!g.title.trim()) return false
        if (g.type === 'money' && String(g.targetAmount).trim() === '') return false
      }
      return true
    }

    return false
  }, [mode, title, amount, goals])

  const save = () => {
    if (!canSave) return

    if (mode === 'movement') {
      addMovement({
        type: movementType,
        title: title.trim(),
        amount: Number(amount),
        date: date || null,
        status: 'pending',
      })
      return resetAndClose()
    }

    if (mode === 'task') {
      addTask({
        title: title.trim(),
        dueDate: date || null,
        status: 'pending',
      })
      return resetAndClose()
    }

    if (mode === 'note') {
      addNote({ title: title.trim() })
      return resetAndClose()
    }

    if (mode === 'objective') {
      const cleanGoals = goals
        .map((g) => ({
          type: g.type,
          title: (g.title ?? '').trim(),
          targetAmount: g.type === 'money' ? Number(g.targetAmount ?? 0) : null,
          dueDate: g.dueDate || null,
          status: 'pending',
        }))
        .filter((g) => g.title) // solo metas con título

      addObjective({
        title: title.trim(),
        goals: cleanGoals,
      })
      return resetAndClose()
    }
  }

  const updateGoal = (idx, patch) => {
    setGoals((prev) => prev.map((g, i) => (i === idx ? { ...g, ...patch } : g)))
  }

  const addGoalRow = () => setGoals((prev) => [...prev, emptyGoal()])
  const removeGoalRow = (idx) => setGoals((prev) => prev.filter((_, i) => i !== idx))

  if (!open) return null

  return (
    <div className="modal-backdrop" onClick={resetAndClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <strong>+ Nuevo</strong>
          <button className="btn" onClick={resetAndClose}>✕</button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <button className="btn" onClick={() => setMode('movement')}>Movimiento</button>
          <button className="btn" onClick={() => setMode('objective')}>Objetivo</button>
          <button className="btn" onClick={() => setMode('task')}>Actividad</button>
          <button className="btn" onClick={() => setMode('note')}>Nota</button>
        </div>

        {/* MOVEMENT */}
        {mode === 'movement' && (
          <div className="form">
            <label>
              Tipo
              <select value={movementType} onChange={(e) => setMovementType(e.target.value)}>
                <option value="gasto">Gasto</option>
                <option value="ingreso">Ingreso</option>
              </select>
            </label>

            <label>
              Título
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Supermercado" />
            </label>

            <label>
              Monto
              <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Ej: 25.50" />
            </label>

            <label>
              Fecha (opcional)
              <input value={date} onChange={(e) => setDate(e.target.value)} placeholder="YYYY-MM-DD" />
            </label>
          </div>
        )}

        {/* TASK */}
        {mode === 'task' && (
          <div className="form">
            <label>
              Actividad / Tarea
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Llamar al banco" />
            </label>

            <label>
              Fecha (opcional)
              <input value={date} onChange={(e) => setDate(e.target.value)} placeholder="YYYY-MM-DD" />
            </label>
          </div>
        )}

        {/* NOTE */}
        {mode === 'note' && (
          <div className="form">
            <label>
              Nota
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Reflexión del día" />
            </label>
          </div>
        )}

        {/* OBJECTIVE + GOALS */}
        {mode === 'objective' && (
          <div className="form">
            <label>
              Título del objetivo
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Ahorrar para viaje" />
            </label>

            <div style={{ marginTop: 6, opacity: 0.9, fontSize: 13 }}>
              Metas (opcional). Las metas viven dentro del objetivo.
            </div>

            <div style={{ display: 'grid', gap: 10 }}>
              {goals.map((g, idx) => (
                <div key={idx} className="card" style={{ padding: 10 }}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <strong>Meta #{idx + 1}</strong>
                    <button
                      className="btn"
                      onClick={() => removeGoalRow(idx)}
                      disabled={goals.length === 1}
                      title={goals.length === 1 ? 'Debe existir al menos una fila (puede quedar vacía)' : 'Eliminar'}
                    >
                      Eliminar
                    </button>
                  </div>

                  <div className="form" style={{ marginTop: 8 }}>
                    <label>
                      Tipo
                      <select
                        value={g.type}
                        onChange={(e) => updateGoal(idx, { type: e.target.value })}
                      >
                        <option value="action">Acción</option>
                        <option value="money">Dinero</option>
                      </select>
                    </label>

                    <label>
                      Título
                      <input
                        value={g.title}
                        onChange={(e) => updateGoal(idx, { title: e.target.value })}
                        placeholder={g.type === 'money' ? 'Ej: Ahorrar X' : 'Ej: Hacer X tarea'}
                      />
                    </label>

                    {g.type === 'money' && (
                      <label>
                        Monto objetivo
                        <input
                          value={g.targetAmount}
                          onChange={(e) => updateGoal(idx, { targetAmount: e.target.value })}
                          placeholder="Ej: 1000"
                        />
                      </label>
                    )}

                    <label>
                      Fecha (opcional)
                      <input
                        value={g.dueDate}
                        onChange={(e) => updateGoal(idx, { dueDate: e.target.value })}
                        placeholder="YYYY-MM-DD"
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <button className="btn" onClick={addGoalRow} style={{ marginTop: 8 }}>
              + Agregar Meta
            </button>
          </div>
        )}

        <div className="modal-footer">
          <button className="btn" onClick={resetAndClose}>Cancelar</button>
          <button className="btn primary" onClick={save} disabled={!canSave}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}
