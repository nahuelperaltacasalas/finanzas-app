import { createContext, useContext, useMemo, useState } from 'react'
import {
  sampleMovements,
  sampleObjectives,
  sampleActivities,
} from '../lib/sampleData.js'

const DataContext = createContext(null)

function toISODate(d = new Date()) {
  // YYYY-MM-DD local
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function DataProvider({ children }) {
  const [movements, setMovements] = useState(sampleMovements)
  const [objectives, setObjectives] = useState(sampleObjectives)
  const [activities, setActivities] = useState(sampleActivities)
  const [notes, setNotes] = useState([]) // ✅ NUEVO

  const addActivity = (activity) => {
    setActivities((prev) => {
      const newId = activity.id ?? `act_${prev.length + 1}`
      return [...prev, { ...activity, id: newId }]
    })
  }

  const addActivityAuto = (type, payload = {}) => {
    addActivity({
      type,
      payload,
      createdAt: new Date().toISOString(),
    })
  }

  const addMovement = (movement) => {
    setMovements((prev) => {
      const newId = movement.id ?? `mov_${prev.length + 1}`
      const newMov = {
        // campos mínimos esperados
        status: movement.status ?? 'pending', // pending | confirmed | canceled
        confirmedAt: movement.confirmedAt ?? null,
        finalAmount: movement.finalAmount ?? null,
        ...movement,
        id: newId,
      }
      return [...prev, newMov]
    })
    addActivityAuto('movement_created', { id: movement.id })
  }

  const addObjective = (objective) => {
    setObjectives((prev) => {
      const newId = objective.id ?? `obj_${prev.length + 1}`
      return [...prev, { ...objective, id: newId }]
    })
    addActivityAuto('objective_created', { id: objective.id })
  }

  // ✅ NUEVO: NOTAS
  const addNote = (note) => {
    setNotes((prev) => {
      const newId = note.id ?? `note_${prev.length + 1}`
      return [
        ...prev,
        {
          ...note,
          id: newId,
          createdAt: note.createdAt ?? new Date().toISOString(),
        },
      ]
    })
    addActivityAuto('note_created', { id: note.id })
  }

  // ✅ CONFIRMAR MOVIMIENTO (Igual/Más/Menos/No ocurrió)
  // outcome: 'EQUAL' | 'MORE' | 'LESS' | 'NO_SHOW'
  const confirmMovement = (movementId, { outcome, finalAmount } = {}) => {
    setMovements((prev) =>
      prev.map((m) => {
        if (m.id !== movementId) return m

        const isNoShow = outcome === 'NO_SHOW'
        const next = {
          ...m,
          status: isNoShow ? 'canceled' : 'confirmed',
          confirmationOutcome: outcome ?? 'EQUAL',
          confirmedAt: new Date().toISOString(),
          finalAmount:
            outcome === 'MORE' || outcome === 'LESS'
              ? Number(finalAmount ?? m.amount)
              : m.amount,
        }
        return next
      })
    )

    addActivityAuto('movement_confirmed', {
      movementId,
      outcome,
      finalAmount,
    })
  }

  // ✅ SELECTOR: BANDEJA "PENDIENTES A CONFIRMAR"
  const todayISO = toISODate()

  const pendingMovements = useMemo(() => {
    const isPending = (m) =>
      (m.status ?? 'pending') === 'pending' && !m.confirmedAt

    // fecha del movimiento (usa date o dueDate)
    const getDate = (m) => m.date ?? m.dueDate ?? m.when ?? null

    const classify = (dateStr) => {
      if (!dateStr) return 'upcoming'
      if (dateStr < todayISO) return 'overdue'
      if (dateStr === todayISO) return 'today'
      return 'upcoming'
    }

    return movements
      .filter(isPending)
      .map((m) => {
        const dateStr = getDate(m)
        return {
          kind: 'movement',
          id: m.id,
          date: dateStr,
          bucket: classify(dateStr),
          movement: m,
        }
      })
      // ordenar: primero today, luego overdue, luego upcoming (y por fecha desc)
      .sort((a, b) => {
        const rank = { today: 0, overdue: 1, upcoming: 2 }
        const rdiff = rank[a.bucket] - rank[b.bucket]
        if (rdiff !== 0) return rdiff
        const ad = a.date ?? '9999-12-31'
        const bd = b.date ?? '9999-12-31'
        // más reciente primero
        return bd.localeCompare(ad)
      })
  }, [movements, todayISO])

  const getPendingItems = ({ filter = 'all' } = {}) => {
    if (filter === 'movements') return pendingMovements
    if (filter === 'goals') return [] // metas acción después
    return [...pendingMovements] // unificado (por ahora solo movements)
  }

  const value = {
    movements,
    objectives,
    activities,
    notes, // ✅ NUEVO

    addMovement,
    addObjective,
    addActivity,
    addNote, // ✅ NUEVO

    // opcional: si querés usarlo desde afuera en el futuro
    addActivityAuto,

    confirmMovement,
    getPendingItems,
    todayISO,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within a DataProvider')
  return ctx
}
