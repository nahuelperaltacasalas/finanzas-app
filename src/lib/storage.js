// src/lib/storage.js
import { sampleMovements, sampleObjectives, sampleActivities } from './sampleData.js'

const STORAGE_KEY = 'finanzas-app-data' // ✅ mantener esta key para NO perder datos
const CURRENT_SCHEMA_VERSION = 1

function safeParse(json) {
  try {
    return JSON.parse(json)
  } catch {
    return null
  }
}

function isObject(v) {
  return v && typeof v === 'object' && !Array.isArray(v)
}

function makeId(prefix) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`
}

function toNumber(value, fallback = 0) {
  const n = Number(value)
  return Number.isNaN(n) ? fallback : n
}

function toNumberOrNull(value) {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  return Number.isNaN(n) ? null : n
}

function mapMovementStatus(status) {
  if (!status) return 'pending'
  const normalized = String(status).toLowerCase()

  if (['confirmed', 'pending', 'canceled'].includes(normalized)) return normalized

  const map = {
    REAL: 'confirmed',
    CONFIRMADO: 'confirmed',
    CONFIRMADA: 'confirmed',
    PLANIFICADO: 'pending',
    PENDIENTE: 'pending',
    CANCELADO: 'canceled',
    CANCELED: 'canceled',
  }

  return map[status] ?? 'pending'
}

function mapMovementType(raw) {
  const v = String(raw ?? 'gasto').toLowerCase()
  if (v === 'ingreso' || v === 'income' || v === 'ingreso_fijo') return 'ingreso'
  if (v === 'gasto' || v === 'expense') return 'gasto'
  return v
}

function mapTaskStatus(status) {
  if (!status) return 'pending'
  const normalized = String(status).toLowerCase()
  if (['pending', 'done', 'canceled'].includes(normalized)) return normalized

  const map = {
    PENDIENTE: 'pending',
    HECHA: 'done',
    HECHO: 'done',
    REALIZADA: 'done',
    CANCELADA: 'canceled',
    CANCELADO: 'canceled',
  }

  return map[status] ?? 'pending'
}

function normalizeMovement(raw) {
  const type =
    raw.type ??
    (raw.kind === 'INGRESO' ? 'ingreso' : raw.kind === 'GASTO' ? 'gasto' : raw.kind)

  const amount = toNumber(raw.amount ?? 0, 0)
  const status = mapMovementStatus(raw.status)
  const confirmedAt = raw.confirmedAt ?? (status === 'confirmed' ? new Date().toISOString() : null)

  return {
    id: raw.id ?? makeId('mov'),
    type: mapMovementType(type),
    title: raw.title ?? raw.description ?? raw.sourceOrReason ?? '',
    amount, // esperado / registrado
    date: raw.date ?? null,
    status,
    confirmationOutcome: raw.confirmationOutcome ?? null,
    finalAmount: toNumberOrNull(raw.finalAmount),
    amountReal: toNumberOrNull(raw.amountReal), // ✅ real confirmado
    estimated: Boolean(raw.estimated ?? raw.isEstimated ?? false), // ✅ estimado
    createdAt: raw.createdAt ?? new Date().toISOString(),
    confirmedAt,
    objectiveId: raw.objectiveId ?? null,
    activityId: raw.activityId ?? null,
  }
}

function normalizeGoal(raw) {
  return {
    id: raw.id ?? makeId('goal'),
    type: raw.type ?? 'action', // money | action
    title: raw.title ?? raw.name ?? '',
    targetAmount:
      raw.type === 'money' ? toNumber(raw.targetAmount ?? 0, 0) : raw.targetAmount ?? null,
    dueDate: raw.dueDate ?? null,
    status: raw.status ?? 'pending', // pending | done | canceled
    linkedMovementIds: Array.isArray(raw.linkedMovementIds) ? raw.linkedMovementIds : [],
    createdAt: raw.createdAt ?? new Date().toISOString(),
    resolvedAt: raw.resolvedAt ?? null,
  }
}

function normalizeObjective(raw) {
  const goals = Array.isArray(raw.goals) ? raw.goals.map(normalizeGoal) : []
  return {
    ...raw,
    id: raw.id ?? makeId('obj'),
    title: raw.title ?? raw.name ?? '',
    createdAt: raw.createdAt ?? new Date().toISOString(),
    goals,
  }
}

function normalizeTask(raw) {
  return {
    ...raw,
    id: raw.id ?? makeId('task'),
    title: raw.title ?? raw.name ?? '',
    status: mapTaskStatus(raw.status),
    dueDate: raw.dueDate ?? raw.date ?? null,
    createdAt: raw.createdAt ?? new Date().toISOString(),
    resolvedAt: raw.resolvedAt ?? null,
  }
}

function normalizeNote(raw) {
  return {
    ...raw,
    id: raw.id ?? makeId('note'),
    title: raw.title ?? '',
    createdAt: raw.createdAt ?? new Date().toISOString(),
  }
}

function normalizeActivityLog(list) {
  if (!Array.isArray(list)) return []
  return list.map((entry) => ({
    ...entry,
    id: entry.id ?? makeId('log'),
    createdAt: entry.createdAt ?? new Date().toISOString(),
    payload: isObject(entry.payload) ? entry.payload : entry.payload ?? {},
  }))
}

function normalizeStoredData(data) {
  // Soporta el formato plano (legacy) y también el {data:{...}} (por si quedó de otro patch)
  const root = data?.data && isObject(data.data) ? data.data : data

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    movements: Array.isArray(root.movements) ? root.movements.map(normalizeMovement) : [],
    objectives: Array.isArray(root.objectives) ? root.objectives.map(normalizeObjective) : [],
    tasks: Array.isArray(root.tasks) ? root.tasks.map(normalizeTask) : [],
    notes: Array.isArray(root.notes) ? root.notes.map(normalizeNote) : [],
    activityLog: normalizeActivityLog(root.activityLog),
  }
}

function normalizeLegacyData(raw) {
  // fallback ultra permisivo
  const legacyMovements = Array.isArray(raw) ? raw : raw?.movements ?? []
  const legacyObjectives = raw?.objectives ?? []
  const legacyTasks = raw?.tasks ?? []
  const legacyActivities = raw?.activities ?? []

  const tasks =
    legacyTasks.length > 0 ? legacyTasks.map(normalizeTask) : legacyActivities.map(normalizeTask)

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    movements: legacyMovements.map(normalizeMovement),
    objectives: legacyObjectives.map(normalizeObjective),
    tasks,
    notes: [],
    activityLog: [],
  }
}

export function loadData() {
  if (typeof window === 'undefined') {
    return normalizeLegacyData({
      movements: sampleMovements,
      objectives: sampleObjectives,
      activities: sampleActivities,
    })
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return normalizeLegacyData({
      movements: sampleMovements,
      objectives: sampleObjectives,
      activities: sampleActivities,
    })
  }

  const parsed = safeParse(raw)
  if (!parsed) {
    return normalizeLegacyData({
      movements: sampleMovements,
      objectives: sampleObjectives,
      activities: sampleActivities,
    })
  }

  // Si ya está en el schema actual -> normalizar
  if (parsed.schemaVersion === CURRENT_SCHEMA_VERSION || parsed.schemaVersion) {
    return normalizeStoredData(parsed)
  }

  // Si no tiene schemaVersion, asumimos legacy
  return normalizeLegacyData(parsed)
}

export function saveData(data) {
  if (typeof window === 'undefined') return

  const payload = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    movements: data.movements ?? [],
    objectives: data.objectives ?? [],
    tasks: data.tasks ?? [],
    notes: data.notes ?? [],
    activityLog: data.activityLog ?? [],
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export { CURRENT_SCHEMA_VERSION }
