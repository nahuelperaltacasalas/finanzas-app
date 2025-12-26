import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { sampleMovements, sampleObjectives } from '../lib/sampleData.js'
import { toISODate } from '../lib/dateUtils.js'

const DataContext = createContext(null)

const STORAGE_KEY = 'finanzas-ssot-v1'

function makeId(prefix) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`
}

export function DataProvider({ children }) {
  const loadStored = () => {
    if (typeof window === 'undefined') return null
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return null
      const parsed = JSON.parse(raw)
      return parsed && typeof parsed === 'object' ? parsed : null
    } catch {
      return null
    }
  }

  const stored = loadStored()

  const normalizeObjectives = (list = []) =>
    (list ?? []).map((o) => ({
      ...o,
      goals: (o.goals ?? []).map((g) => ({ ...g })),
    }))

  // Hechos (dinero)
  const [movements, setMovements] = useState(() => stored?.movements ?? sampleMovements)

  // Interpretación (objetivos con metas)
  const [objectives, setObjectives] = useState(() =>
    normalizeObjectives(stored?.objectives ?? sampleObjectives)
  )

  // Pilar: tareas/actividades (del usuario)
  const [tasks, setTasks] = useState(() => (Array.isArray(stored?.tasks) ? stored.tasks : []))

  // Pilar: notas
  const [notes, setNotes] = useState(() => (Array.isArray(stored?.notes) ? stored.notes : []))

  // Activity Log automático (historial)
  const [activityLog, setActivityLog] = useState(() =>
    Array.isArray(stored?.activityLog) ? stored.activityLog : []
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    const payload = { movements, objectives, tasks, notes, activityLog }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {
      // almacenamiento opcional; ignoramos fallas
    }
  }, [movements, objectives, tasks, notes, activityLog])

  const addActivityLog = (entry) => {
    setActivityLog((prev) => {
      const newId = entry.id ?? makeId('log')
      return [
        ...prev,
        {
          ...entry,
          id: newId,
          createdAt: entry.createdAt ?? new Date().toISOString(),
        },
      ]
    })
  }

  const addActivityAuto = (type, payload = {}) => {
    addActivityLog({ type, payload })
  }

  // =========================
  // MOVEMENTS
  // =========================
  const addMovement = (movement) => {
    const createdId = movement.id ?? makeId('mov')

    setMovements((prev) => {
      const newMov = {
        id: createdId,
        type: movement.type ?? 'gasto', // gasto | ingreso
        title: movement.title ?? '',
        amount: Number(movement.amount ?? 0),
        date: movement.date ?? null, // YYYY-MM-DD
        status: movement.status ?? 'pending', // pending | confirmed | canceled
        confirmationOutcome: movement.confirmationOutcome ?? null,
        finalAmount: movement.finalAmount ?? null,
        createdAt: movement.createdAt ?? new Date().toISOString(),
        confirmedAt: movement.confirmedAt ?? null,
        ...movement,
      }
      return [...prev, newMov]
    })

    addActivityAuto('movement_created', { id: createdId })
  }

  // outcome: 'EQUAL' | 'MORE' | 'LESS' | 'NO_SHOW'
  const confirmMovement = (movementId, { outcome, finalAmount } = {}) => {
    let updated = false
    setMovements((prev) =>
      prev.map((m) => {
        if (m.id !== movementId) return m
        updated = true
        const isNoShow = outcome === 'NO_SHOW'
        return {
          ...m,
          status: isNoShow ? 'canceled' : 'confirmed',
          confirmationOutcome: outcome ?? 'EQUAL',
          confirmedAt: new Date().toISOString(),
          finalAmount:
            outcome === 'MORE' || outcome === 'LESS'
              ? Number(finalAmount ?? m.amount)
              : Number(m.amount ?? 0),
        }
      })
    )

    if (updated) {
      addActivityAuto('movement_confirmed', { movementId, outcome, finalAmount })
    }
  }

  // =========================
  // OBJECTIVES + GOALS (metas dentro)
  // =========================
  const addObjective = (objective) => {
    const createdId = objective.id ?? makeId('obj')

    setObjectives((prev) => {
      const newObj = {
        id: createdId,
        title: objective.title ?? '',
        createdAt: objective.createdAt ?? new Date().toISOString(),
        goals: (objective.goals ?? []).map((g) => ({
          id: g.id ?? makeId('goal'),
          type: g.type, // money | action
          title: g.title ?? '',
          targetAmount: g.type === 'money' ? Number(g.targetAmount ?? 0) : null,
          dueDate: g.dueDate ?? null,
          status: g.status ?? 'pending', // pending | done | canceled
          linkedMovementIds: g.linkedMovementIds ?? [],
          createdAt: g.createdAt ?? new Date().toISOString(),
          resolvedAt: g.resolvedAt ?? null,
        })),
      }
      return [...prev, newObj]
    })

    addActivityAuto('objective_created', { id: createdId })
  }

  const resolveGoal = (objectiveId, goalId, { status, rescheduleDate } = {}) => {
    setObjectives((prev) =>
      prev.map((o) => {
        if (o.id !== objectiveId) return o
        return {
          ...o,
          goals: (o.goals ?? []).map((g) => {
            if (g.id !== goalId) return g
            const nextStatus = status ?? 'done'
            return {
              ...g,
              status: nextStatus, // done | canceled | pending
              dueDate: rescheduleDate ?? g.dueDate,
              resolvedAt:
                nextStatus === 'done' || nextStatus === 'canceled'
                  ? new Date().toISOString()
                  : null,
            }
          }),
        }
      })
    )

    addActivityAuto('goal_resolved', { objectiveId, goalId, status, rescheduleDate })
  }

  // =========================
  // TASKS (pilar Actividad/Tarea)
  // =========================
  const addTask = (task) => {
    const createdId = task.id ?? makeId('task')

    setTasks((prev) => [
      ...prev,
      {
        id: createdId,
        title: task.title ?? '',
        status: task.status ?? 'pending', // pending | done | canceled
        dueDate: task.dueDate ?? null, // YYYY-MM-DD
        createdAt: task.createdAt ?? new Date().toISOString(),
        resolvedAt: task.resolvedAt ?? null,
        ...task,
      },
    ])

    addActivityAuto('task_created', { id: createdId })
  }

  const resolveTask = (taskId, { status, rescheduleDate } = {}) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t
        const nextStatus = status ?? 'done'
        return {
          ...t,
          status: nextStatus,
          dueDate: rescheduleDate ?? t.dueDate,
          resolvedAt:
            nextStatus === 'done' || nextStatus === 'canceled'
              ? new Date().toISOString()
              : null,
        }
      })
    )

    addActivityAuto('task_resolved', { taskId, status, rescheduleDate })
  }

  // =========================
  // NOTES
  // =========================
  const addNote = (note) => {
    const createdId = note.id ?? makeId('note')
    setNotes((prev) => [
      ...prev,
      {
        id: createdId,
        title: note.title ?? '',
        createdAt: note.createdAt ?? new Date().toISOString(),
        ...note,
      },
    ])
    addActivityAuto('note_created', { id: createdId })
  }

  // =========================
  // PENDING INBOX (unificado)
  // =========================
  const todayISO = toISODate(new Date())

  const pendingItems = useMemo(() => {
    const rank = { today: 0, overdue: 1, upcoming: 2 }

    const classify = (dateStr) => {
      if (!dateStr) return 'upcoming'
      if (dateStr < todayISO) return 'overdue'
      if (dateStr === todayISO) return 'today'
      return 'upcoming'
    }

    // Movimientos pendientes
    const movItems = (movements ?? [])
      .filter((m) => (m.status ?? 'pending') === 'pending' && !m.confirmedAt)
      .map((m) => {
        const dateStr = m.date ?? null
        return {
          kind: 'movement',
          id: m.id,
          date: dateStr,
          bucket: classify(dateStr),
          data: m,
        }
      })

    // Metas acción pendientes (dentro de objetivos)
    const goalItems = (objectives ?? [])
      .flatMap((o) =>
        (o.goals ?? [])
          .filter((g) => g.type === 'action' && (g.status ?? 'pending') === 'pending')
          .map((g) => {
            const dateStr = g.dueDate ?? null
            return {
              kind: 'goal',
              id: g.id,
              date: dateStr,
              bucket: classify(dateStr),
              data: { ...g, objectiveId: o.id, objectiveTitle: o.title },
            }
          })
      )

    // Tareas pendientes
    const taskItems = (tasks ?? [])
      .filter((t) => (t.status ?? 'pending') === 'pending')
      .map((t) => {
        const dateStr = t.dueDate ?? null
        return {
          kind: 'task',
          id: t.id,
          date: dateStr,
          bucket: classify(dateStr),
          data: t,
        }
      })

    const all = [...movItems, ...goalItems, ...taskItems]

    // Orden: bucket + fecha desc
    all.sort((a, b) => {
      const rdiff = rank[a.bucket] - rank[b.bucket]
      if (rdiff !== 0) return rdiff
      const ad = a.date ?? '9999-12-31'
      const bd = b.date ?? '9999-12-31'
      return bd.localeCompare(ad)
    })

    return all
  }, [movements, objectives, tasks, todayISO])

  const getPendingItems = ({ filter = 'all' } = {}) => {
    if (filter === 'movements') return pendingItems.filter((i) => i.kind === 'movement')
    if (filter === 'goals') return pendingItems.filter((i) => i.kind === 'goal')
    if (filter === 'tasks') return pendingItems.filter((i) => i.kind === 'task')
    return pendingItems
  }

  const value = {
    // data
    movements,
    objectives,
    tasks,
    notes,
    activityLog,

    // actions
    addMovement,
    confirmMovement,

    addObjective,
    resolveGoal,

    addTask,
    resolveTask,

    addNote,

    // log
    addActivityAuto,

    // pending
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
