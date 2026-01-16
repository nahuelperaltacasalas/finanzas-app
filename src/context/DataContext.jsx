// src/context/DataContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { loadData, saveData } from '../lib/storage.js'
import { sampleMovements, sampleObjectives, sampleActivities } from '../lib/sampleData.js'

const DataContext = createContext(null)

function toISODate(d = new Date()) {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function makeId(prefix) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`
}

function normalizeMovementType(raw) {
  const v = String(raw ?? 'gasto').toLowerCase()
  if (v === 'ingreso' || v === 'income') return 'ingreso'
  if (v === 'gasto' || v === 'expense') return 'gasto'
  return v
}

function normalizeMovementStatus(raw) {
  const v = String(raw ?? 'pending').toLowerCase()
  if (v === 'real' || v === 'confirmed') return 'confirmed'
  if (v === 'planificado' || v === 'pending' || v === 'planned') return 'pending'
  if (v === 'cancelado' || v === 'canceled') return 'canceled'
  return 'pending'
}

export function DataProvider({ children }) {
  const initialData = useMemo(() => loadData(), [])

  // Hechos (dinero)
  const [movements, setMovements] = useState(() => initialData?.movements ?? sampleMovements ?? [])

  // Interpretación (objetivos con metas)
  const [objectives, setObjectives] = useState(() =>
    (initialData?.objectives ?? sampleObjectives ?? []).map((o) => ({
      ...o,
      title: o.title ?? o.name ?? '',
      goals: o.goals ?? [],
    }))
  )

  // Pilar: tareas/actividades (del usuario)
  // ✅ si no hay tasks en storage, usamos sampleActivities
  const [tasks, setTasks] = useState(() => initialData?.tasks ?? sampleActivities ?? [])

  // Pilar: notas
  const [notes, setNotes] = useState(() => initialData?.notes ?? [])

  // Activity Log automático (historial) — NO mezclar con sampleActivities
  const [activityLog, setActivityLog] = useState(() => initialData?.activityLog ?? [])

  useEffect(() => {
    saveData({
      movements,
      objectives,
      tasks,
      notes,
      activityLog,
    })
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
        type: normalizeMovementType(movement.type ?? movement.kind ?? 'gasto'),
        title: movement.title ?? movement.description ?? movement.sourceOrReason ?? '',
        amount: Number(movement.amount ?? 0), // esperado/registrado
        date: movement.date ?? null,
        status: normalizeMovementStatus(movement.status ?? 'pending'),
        confirmationOutcome: movement.confirmationOutcome ?? null,
        finalAmount: movement.finalAmount ?? null, // compat
        amountReal: movement.amountReal ?? null, // ✅ real
        estimated: Boolean(movement.estimated ?? false), // ✅ estimado
        createdAt: movement.createdAt ?? new Date().toISOString(),
        confirmedAt: movement.confirmedAt ?? null,
        objectiveId: movement.objectiveId ?? null,
        activityId: movement.activityId ?? null,
        ...movement,
      }
      return [...prev, newMov]
    })

    addActivityAuto('movement_created', { id: createdId })
  }

  const deleteMovement = (movementId) => {
    setMovements((prev) => prev.filter((m) => m.id !== movementId))
    addActivityAuto('movement_deleted', { id: movementId })
  }

  // outcome: 'EQUAL' | 'MORE' | 'LESS' | 'NO_SHOW'
  const confirmMovement = (movementId, { outcome, finalAmount } = {}) => {
    setMovements((prev) =>
      prev.map((m) => {
        if (m.id !== movementId) return m

        const isNoShow = outcome === 'NO_SHOW'
        const resolvedAmount =
          outcome === 'MORE' || outcome === 'LESS'
            ? Number(finalAmount ?? m.amount)
            : Number(m.amount ?? 0)

        return {
          ...m,
          status: isNoShow ? 'canceled' : 'confirmed',
          confirmationOutcome: outcome ?? 'EQUAL',
          confirmedAt: new Date().toISOString(),
          finalAmount: resolvedAmount, // compat
          amountReal: resolvedAmount, // ✅ real
        }
      })
    )

    addActivityAuto('movement_confirmed', { movementId, outcome, finalAmount })
  }

  // =========================
  // OBJECTIVES + GOALS (metas dentro)
  // =========================
  const addObjective = (objective) => {
    const createdId = objective.id ?? makeId('obj')

    setObjectives((prev) => {
      const normalizedGoals = (objective.goals ?? []).map((g) => ({
        id: g.id ?? makeId('goal'),
        type: g.type, // money | action
        title: g.title ?? g.name ?? '',
        targetAmount: g.type === 'money' ? Number(g.targetAmount ?? 0) : null,
        dueDate: g.dueDate ?? null,
        status: g.status ?? 'pending', // pending | done | canceled
        linkedMovementIds: g.linkedMovementIds ?? [],
        createdAt: g.createdAt ?? new Date().toISOString(),
        resolvedAt: g.resolvedAt ?? null,
      }))

      const newObj = {
        ...objective,
        id: createdId,
        title: objective.title ?? objective.name ?? '',
        createdAt: objective.createdAt ?? new Date().toISOString(),
        goals: normalizedGoals,
      }
      return [...prev, newObj]
    })

    addActivityAuto('objective_created', { id: createdId })
  }

  const deleteObjective = (objectiveId) => {
    setObjectives((prev) => prev.filter((o) => o.id !== objectiveId))
    addActivityAuto('objective_deleted', { id: objectiveId })
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
              status: nextStatus,
              dueDate: rescheduleDate ?? g.dueDate,
              resolvedAt:
                nextStatus === 'done' || nextStatus === 'canceled' ? new Date().toISOString() : null,
            }
          }),
        }
      })
    )

    addActivityAuto('goal_resolved', { objectiveId, goalId, status, rescheduleDate })
  }

  // =========================
  // TASKS
  // =========================
  const addTask = (task) => {
    const createdId = task.id ?? makeId('task')

    setTasks((prev) => [
      ...prev,
      {
        id: createdId,
        title: task.title ?? task.name ?? '',
        status: task.status ?? 'pending', // pending | done | canceled
        dueDate: task.dueDate ?? task.date ?? null,
        createdAt: task.createdAt ?? new Date().toISOString(),
        resolvedAt: task.resolvedAt ?? null,
        ...task,
      },
    ])

    addActivityAuto('task_created', { id: createdId })
  }

  const deleteTask = (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
    addActivityAuto('task_deleted', { id: taskId })
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
            nextStatus === 'done' || nextStatus === 'canceled' ? new Date().toISOString() : null,
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

  const deleteNote = (noteId) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId))
    addActivityAuto('note_deleted', { id: noteId })
  }

  // =========================
  // BALANCES
  // =========================
  const getRealBalance = () => {
    let income = 0
    let expense = 0

    for (const m of movements ?? []) {
      if ((m.status ?? 'pending') !== 'confirmed') continue
      if (m.estimated) continue
      const amt = Number(m.amountReal ?? m.finalAmount ?? m.amount ?? 0)
      if ((m.type ?? 'gasto') === 'ingreso') income += amt
      else expense += amt
    }

    return { income, expense, balance: income - expense }
  }

  const getExpectedBalance = ({ includeEstimated = true } = {}) => {
    let income = 0
    let expense = 0

    for (const m of movements ?? []) {
      const status = m.status ?? 'pending'
      if (status === 'canceled') continue
      if (!includeEstimated && m.estimated) continue

      const amt =
        status === 'confirmed'
          ? Number(m.amountReal ?? m.finalAmount ?? m.amount ?? 0)
          : Number(m.amount ?? 0)

      if ((m.type ?? 'gasto') === 'ingreso') income += amt
      else expense += amt
    }

    return { income, expense, balance: income - expense }
  }

  // =========================
  // PENDING INBOX (unificado)
  // =========================
  const todayISO = toISODate()

  const pendingItems = useMemo(() => {
    const rank = { today: 0, overdue: 1, upcoming: 2 }

    const classify = (dateStr) => {
      if (!dateStr) return 'upcoming'
      if (dateStr < todayISO) return 'overdue'
      if (dateStr === todayISO) return 'today'
      return 'upcoming'
    }

    const movItems = (movements ?? [])
      .filter((m) => (m.status ?? 'pending') === 'pending' && !m.confirmedAt)
      .map((m) => {
        const dateStr = m.date ?? null
        return { kind: 'movement', id: m.id, date: dateStr, bucket: classify(dateStr), data: m }
      })

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

    const taskItems = (tasks ?? [])
      .filter((t) => (t.status ?? 'pending') === 'pending')
      .map((t) => {
        const dateStr = t.dueDate ?? null
        return { kind: 'task', id: t.id, date: dateStr, bucket: classify(dateStr), data: t }
      })

    const all = [...movItems, ...goalItems, ...taskItems]

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
    movements,
    objectives,
    tasks,
    notes,
    activityLog,

    addMovement,
    confirmMovement,
    deleteMovement,

    addObjective,
    resolveGoal,
    deleteObjective,

    addTask,
    resolveTask,
    deleteTask,

    addNote,
    deleteNote,

    addActivityAuto,

    getRealBalance,
    getExpectedBalance,

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
