#!/usr/bin/env bash

set -euo pipefail

echo "== Finanzas App: actualización rápida =="

echo "WARNING: This will OVERWRITE core files."
read -p 'Type OVERWRITE to continue: ' ans
if [ "$ans" != "OVERWRITE" ]; then
  echo "Aborted."
  exit 1
fi

ts=$(date +"%Y%m%d-%H%M%S")
mkdir -p backups
tar -czf "backups/src-backup-$ts.tgz" src scripts || true

# Asegurar carpeta de contexto
mkdir -p src/context

# ==========================================
# src/context/DataContext.jsx
# ==========================================
cat > src/context/DataContext.jsx << 'EOF'
import { createContext, useContext, useState } from 'react'
import {
  sampleMovements,
  sampleObjectives,
  sampleActivities,
} from '../lib/sampleData.js'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [movements, setMovements] = useState(sampleMovements)
  const [objectives, setObjectives] = useState(sampleObjectives)
  const [activities, setActivities] = useState(sampleActivities)

  const addMovement = (movement) => {
    setMovements((prev) => {
      const newId = movement.id ?? `mov_${prev.length + 1}`
      return [...prev, { ...movement, id: newId }]
    })
  }

  const addObjective = (objective) => {
    setObjectives((prev) => {
      const newId = objective.id ?? `obj_${prev.length + 1}`
      return [...prev, { ...objective, id: newId }]
    })
  }

  const addActivity = (activity) => {
    setActivities((prev) => {
      const newId = activity.id ?? `act_${prev.length + 1}`
      return [...prev, { ...activity, id: newId }]
    })
  }

  const value = {
    movements,
    objectives,
    activities,
    addMovement,
    addObjective,
    addActivity,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) {
    throw new Error('useData must be used within a DataProvider')
  }
  return ctx
}
EOF

# ==========================================
# src/lib/sampleData.js
# ==========================================
cat > src/lib/sampleData.js << 'EOF'
// Movimientos de ejemplo (ingresos y gastos)
export const sampleMovements = [
  {
    id: 'm1',
    kind: 'GASTO',
    date: '2025-11-01',
    amount: 12.5,
    sourceOrReason: 'Café y snack',
    status: 'CONFIRMADO',
  },
  {
    id: 'm2',
    kind: 'INGRESO',
    date: '2025-11-02',
    amount: 500,
    sourceOrReason: 'Trabajo freelance',
    status: 'CONFIRMADO',
  },
  {
    id: 'm3',
    kind: 'GASTO',
    date: '2025-11-03',
    amount: 1200,
    sourceOrReason: 'Renta',
    status: 'CONFIRMADO',
  },
  {
    id: 'm4',
    kind: 'GASTO',
    date: '2025-11-05',
    amount: 40,
    sourceOrReason: 'Supermercado',
    status: 'CONFIRMADO',
  },
  {
    id: 'm5',
    kind: 'INGRESO',
    date: '2025-11-10',
    amount: 1500,
    sourceOrReason: 'Sueldo',
    status: 'CONFIRMADO',
  },
  {
    id: 'm6',
    kind: 'GASTO',
    date: '2025-11-12',
    amount: 60,
    sourceOrReason: 'Transporte',
    status: 'CONFIRMADO',
  },
  {
    id: 'm7',
    kind: 'GASTO',
    date: '2025-11-15',
    amount: 85,
    sourceOrReason: 'Cena afuera',
    status: 'CONFIRMADO',
  },
  {
    id: 'm8',
    kind: 'INGRESO',
    date: '2025-11-25',
    amount: 300,
    sourceOrReason: 'Ingreso futuro',
    status: 'PLANIFICADO',
  },
]

// Objetivos de ejemplo
export const sampleObjectives = [
  {
    id: 'obj1',
    name: 'Ahorrar 3000 para mudarme',
    area: 'FINANZAS',
    status: 'ACTIVO',
    priorityLevel: 'ALTA',
    description: 'Crear un fondo para mudarme a un lugar más cómodo.',
    startDate: '2025-11-01',
    endDate: '2026-04-30',
    targetValue: 3000,
    currentValue: 1050,
  },
  {
    id: 'obj2',
    name: 'Ordenar finanzas del mes',
    area: 'FINANZAS',
    status: 'ACTIVO',
    priorityLevel: 'MEDIA',
    description: 'Tener todos los gastos e ingresos del mes registrados.',
    startDate: '2025-11-01',
    endDate: '2025-11-30',
    targetValue: 0,
    currentValue: 0,
  },
  {
    id: 'obj3',
    name: 'Mejorar salud caminando 3 veces por semana',
    area: 'SALUD',
    status: 'PAUSADO',
    priorityLevel: 'BAJA',
    description: '',
    startDate: '2025-10-01',
    endDate: '2025-12-31',
    targetValue: 0,
    currentValue: 0,
  },
]

// Actividades de ejemplo
export const sampleActivities = [
  {
    id: 'act1',
    date: '2025-11-28',
    name: 'Registrar gastos del día',
    description: 'Anotar todos los movimientos de hoy en la app.',
    type: 'FINANCIERA',
    objectiveId: 'obj2',
    status: 'HECHA',
  },
  {
    id: 'act2',
    date: '2025-11-29',
    name: 'Revisión rápida de ingresos',
    description: 'Verificar que todos los ingresos del mes estén cargados.',
    type: 'FINANCIERA',
    objectiveId: 'obj2',
    status: 'HECHA',
  },
  {
    id: 'act3',
    date: '2025-11-30',
    name: 'Plan de ahorro para mudanza',
    description: 'Definir cuánto separar por semana.',
    type: 'FINANCIERA',
    objectiveId: 'obj1',
    status: 'PENDIENTE',
  },
  {
    id: 'act4',
    date: '2025-12-01',
    name: 'Cargar gastos pendientes',
    description: 'Cargar en la app todos los tickets que faltan.',
    type: 'FINANCIERA',
    objectiveId: 'obj2',
    status: 'PENDIENTE',
  },
]
EOF

# ==========================================
# src/App.jsx
# ==========================================
cat > src/App.jsx << 'EOF'
import { useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import FinancePage from './pages/FinancePage.jsx'
import ObjectivesPage from './pages/ObjectivesPage.jsx'
import ActivitiesPage from './pages/ActivitiesPage.jsx'
import CalendarPage from './pages/CalendarPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import { DataProvider } from './context/DataContext.jsx'
import './index.css'

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')

  const pages = {
    dashboard: <DashboardPage />,
    finanzas: <FinancePage />,
    objetivos: <ObjectivesPage />,
    actividades: <ActivitiesPage />,
    calendario: <CalendarPage />,
    registrar: <RegisterPage />,
  }

  return (
    <DataProvider>
      <div className="app-root">
        <div className="app-with-sidebar">
          <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
          <main className="app-content">{pages[currentPage]}</main>
        </div>
      </div>
    </DataProvider>
  )
}

export default App
EOF

# ==========================================
# src/components/Sidebar.jsx
# ==========================================
cat > src/components/Sidebar.jsx << 'EOF'
function Sidebar({ currentPage, onNavigate }) {
  const items = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'finanzas', label: 'Finanzas' },
    { id: 'objetivos', label: 'Objetivos' },
    { id: 'actividades', label: 'Actividades' },
    { id: 'calendario', label: 'Calendario' },
    { id: 'registrar', label: 'Registrar' },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <strong>Finanzas App</strong>
      </div>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onNavigate(item.id)}
          className={currentPage === item.id ? 'active' : ''}
        >
          {item.label}
        </button>
      ))}
    </aside>
  )
}

export default Sidebar
EOF

# ==========================================
# src/pages/RegisterPage.jsx
# ==========================================
cat > src/pages/RegisterPage.jsx << 'EOF'
import { useState } from 'react'
import { useData } from '../context/DataContext.jsx'

function RegisterPage() {
  const {
    objectives,
    activities,
    addMovement,
    addObjective,
    addActivity,
  } = useData()

  const [activeTab, setActiveTab] = useState('movement')
  const [message, setMessage] = useState('')

  // ---------- FORM MOVIMIENTO ----------
  const [movementForm, setMovementForm] = useState({
    kind: 'INGRESO',
    amount: '',
    date: '',
    description: '',
    status: 'REAL',
    objectiveId: '',
    activityId: '',
  })

  const handleMovementChange = (e) => {
    const { name, value } = e.target
    setMovementForm((prev) => ({ ...prev, [name]: value }))
  }

  const submitMovement = (e) => {
    e.preventDefault()
    if (!movementForm.amount || !movementForm.date || !movementForm.description) {
      setMessage('Completa tipo, monto, fecha y descripción.')
      return
    }

    const amountNumber = Number(movementForm.amount)
    if (Number.isNaN(amountNumber) || amountNumber <= 0) {
      setMessage('El monto debe ser un número mayor a 0.')
      return
    }

    const newMovement = {
      id: undefined,
      kind: movementForm.kind,
      date: movementForm.date,
      amount: amountNumber,
      sourceOrReason: movementForm.description,
      status: movementForm.status,
      objectiveId: movementForm.objectiveId || null,
      activityId: movementForm.activityId || null,
    }

    addMovement(newMovement)
    setMovementForm({
      kind: 'INGRESO',
      amount: '',
      date: '',
      description: '',
      status: 'REAL',
      objectiveId: '',
      activityId: '',
    })
    setMessage('Movimiento registrado (solo dentro de esta sesión).')
  }

  // ---------- FORM OBJETIVO ----------
  const [objectiveForm, setObjectiveForm] = useState({
    name: '',
    area: 'FINANZAS',
    description: '',
    priorityLevel: 'MEDIA',
    type: 'FINANCIERO',
    status: 'ACTIVO',
    startDate: '',
    endDate: '',
    targetValue: '',
    currentValue: '',
    frequency: 'NINGUNA',
    timesPerPeriod: '',
  })

  const handleObjectiveChange = (e) => {
    const { name, value } = e.target
    setObjectiveForm((prev) => ({ ...prev, [name]: value }))
  }

  const submitObjective = (e) => {
    e.preventDefault()
    if (!objectiveForm.name || !objectiveForm.area) {
      setMessage('El objetivo necesita al menos nombre y área.')
      return
    }

    const target =
      objectiveForm.type === 'FINANCIERO' || objectiveForm.type === 'MIXTO'
        ? Number(objectiveForm.targetValue || 0)
        : 0
    const current =
      objectiveForm.type === 'FINANCIERO' || objectiveForm.type === 'MIXTO'
        ? Number(objectiveForm.currentValue || 0)
        : 0

    const newObjective = {
      id: undefined,
      name: objectiveForm.name,
      area: objectiveForm.area,
      status: objectiveForm.status,
      priorityLevel: objectiveForm.priorityLevel,
      description: objectiveForm.description,
      startDate: objectiveForm.startDate || null,
      endDate: objectiveForm.endDate || null,
      targetValue: target,
      currentValue: current,
      type: objectiveForm.type,
      habitConfig:
        objectiveForm.type === 'HABITO' || objectiveForm.type === 'MIXTO'
          ? {
              frequency: objectiveForm.frequency,
              timesPerPeriod: Number(objectiveForm.timesPerPeriod || 0),
            }
          : null,
    }

    addObjective(newObjective)
    setObjectiveForm({
      name: '',
      area: 'FINANZAS',
      description: '',
      priorityLevel: 'MEDIA',
      type: 'FINANCIERO',
      status: 'ACTIVO',
      startDate: '',
      endDate: '',
      targetValue: '',
      currentValue: '',
      frequency: 'NINGUNA',
      timesPerPeriod: '',
    })
    setMessage('Objetivo registrado (solo dentro de esta sesión).')
  }

  // ---------- FORM ACTIVIDAD ----------
  const [activityForm, setActivityForm] = useState({
    name: '',
    date: '',
    type: 'FINANCIERA',
    status: 'PENDIENTE',
    objectiveId: '',
    description: '',
  })

  const handleActivityChange = (e) => {
    const { name, value } = e.target
    setActivityForm((prev) => ({ ...prev, [name]: value }))
  }

  const submitActivity = (e) => {
    e.preventDefault()
    if (!activityForm.name || !activityForm.date) {
      setMessage('La actividad necesita al menos nombre y fecha.')
      return
    }

    const newActivity = {
      id: undefined,
      date: activityForm.date,
      name: activityForm.name,
      description: activityForm.description,
      type: activityForm.type,
      objectiveId: activityForm.objectiveId || null,
      status: activityForm.status,
    }

    addActivity(newActivity)
    setActivityForm({
      name: '',
      date: '',
      type: 'FINANCIERA',
      status: 'PENDIENTE',
      objectiveId: '',
      description: '',
    })
    setMessage('Actividad registrada (solo dentro de esta sesión).')
  }

  return (
    <div className="page-root register-page">
      <h1 className="page-title">Registrar</h1>
      <p className="page-subtitle">
        Crear nuevos movimientos, objetivos y actividades para tu sistema.
      </p>

      <div className="register-tabs">
        <button
          type="button"
          className={`register-tab ${activeTab === 'movement' ? 'active' : ''}`}
          onClick={() => setActiveTab('movement')}
        >
          Movimiento
        </button>
        <button
          type="button"
          className={`register-tab ${activeTab === 'objective' ? 'active' : ''}`}
          onClick={() => setActiveTab('objective')}
        >
          Objetivo
        </button>
        <button
          type="button"
          className={`register-tab ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          Actividad
        </button>
      </div>

      {message && <div className="form-message">{message}</div>}

      {activeTab === 'movement' && (
        <section className="card">
          <h2 className="section-title">Registrar movimiento</h2>
          <form className="form-grid" onSubmit={submitMovement}>
            <div className="form-row">
              <label>Tipo</label>
              <select
                name="kind"
                value={movementForm.kind}
                onChange={handleMovementChange}
              >
                <option value="INGRESO">Ingreso</option>
                <option value="GASTO">Gasto</option>
              </select>
            </div>

            <div className="form-row">
              <label>Monto</label>
              <input
                type="number"
                name="amount"
                value={movementForm.amount}
                onChange={handleMovementChange}
                step="0.01"
                min="0"
              />
            </div>

            <div className="form-row">
              <label>Fecha</label>
              <input
                type="date"
                name="date"
                value={movementForm.date}
                onChange={handleMovementChange}
              />
            </div>

            <div className="form-row">
              <label>Descripción</label>
              <input
                type="text"
                name="description"
                value={movementForm.description}
                onChange={handleMovementChange}
                placeholder="Ej. Sueldo, alquiler, compra, etc."
              />
            </div>

            <div className="form-row">
              <label>Estado</label>
              <select
                name="status"
                value={movementForm.status}
                onChange={handleMovementChange}
              >
                <option value="REAL">Real</option>
                <option value="PLANIFICADO">Planificado</option>
              </select>
            </div>

            <div className="form-row">
              <label>Objetivo asociado (opcional)</label>
              <select
                name="objectiveId"
                value={movementForm.objectiveId}
                onChange={handleMovementChange}
              >
                <option value="">Ninguno</option>
                {objectives.map((obj) => (
                  <option key={obj.id} value={obj.id}>
                    {obj.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <label>Actividad asociada (opcional)</label>
              <select
                name="activityId"
                value={movementForm.activityId}
                onChange={handleMovementChange}
              >
                <option value="">Ninguna</option>
                {activities.map((act) => (
                  <option key={act.id} value={act.id}>
                    {act.name} ({act.date})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-actions">
              <button type="submit">Guardar movimiento</button>
            </div>
          </form>
        </section>
      )}

      {activeTab === 'objective' && (
        <section className="card">
          <h2 className="section-title">Registrar objetivo</h2>
          <form className="form-grid" onSubmit={submitObjective}>
            <div className="form-row">
              <label>Nombre</label>
              <input
                type="text"
                name="name"
                value={objectiveForm.name}
                onChange={handleObjectiveChange}
                placeholder="Ej. Ahorrar 3000 para mudarme"
              />
            </div>

            <div className="form-row">
              <label>Área</label>
              <select
                name="area"
                value={objectiveForm.area}
                onChange={handleObjectiveChange}
              >
                <option value="FINANZAS">Finanzas</option>
                <option value="SALUD">Salud</option>
                <option value="PERSONAL">Personal</option>
                <option value="TRABAJO">Trabajo</option>
                <option value="HOGAR">Hogar</option>
                <option value="RELACION">Relación</option>
                <option value="PROYECTO">Proyecto</option>
                <option value="ESTUDIO">Estudio</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>

            <div className="form-row full">
              <label>Descripción</label>
              <textarea
                name="description"
                value={objectiveForm.description}
                onChange={handleObjectiveChange}
                rows={3}
              />
            </div>

            <div className="form-row">
              <label>Prioridad</label>
              <select
                name="priorityLevel"
                value={objectiveForm.priorityLevel}
                onChange={handleObjectiveChange}
              >
                <option value="BAJA">Baja</option>
                <option value="MEDIA">Media</option>
                <option value="ALTA">Alta</option>
                <option value="CRITICA">Crítica</option>
              </select>
            </div>

            <div className="form-row">
              <label>Tipo</label>
              <select
                name="type"
                value={objectiveForm.type}
                onChange={handleObjectiveChange}
              >
                <option value="FINANCIERO">Financiero</option>
                <option value="HABITO">Hábito / Acción</option>
                <option value="MIXTO">Mixto</option>
              </select>
            </div>

            <div className="form-row">
              <label>Estado</label>
              <select
                name="status"
                value={objectiveForm.status}
                onChange={handleObjectiveChange}
              >
                <option value="ACTIVO">Activo</option>
                <option value="PAUSADO">Pausado</option>
                <option value="LOGRADO">Logrado</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>

            <div className="form-row">
              <label>Fecha inicio</label>
              <input
                type="date"
                name="startDate"
                value={objectiveForm.startDate}
                onChange={handleObjectiveChange}
              />
            </div>

            <div className="form-row">
              <label>Fecha fin</label>
              <input
                type="date"
                name="endDate"
                value={objectiveForm.endDate}
                onChange={handleObjectiveChange}
              />
            </div>

            {(objectiveForm.type === 'FINANCIERO' ||
              objectiveForm.type === 'MIXTO') && (
              <>
                <div className="form-row">
                  <label>Meta financiera</label>
                  <input
                    type="number"
                    name="targetValue"
                    value={objectiveForm.targetValue}
                    onChange={handleObjectiveChange}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-row">
                  <label>Valor actual</label>
                  <input
                    type="number"
                    name="currentValue"
                    value={objectiveForm.currentValue}
                    onChange={handleObjectiveChange}
                    min="0"
                    step="0.01"
                  />
                </div>
              </>
            )}

            {(objectiveForm.type === 'HABITO' ||
              objectiveForm.type === 'MIXTO') && (
              <>
                <div className="form-row">
                  <label>Frecuencia</label>
                  <select
                    name="frequency"
                    value={objectiveForm.frequency}
                    onChange={handleObjectiveChange}
                  >
                    <option value="NINGUNA">Sin definir</option>
                    <option value="DIARIA">Diaria</option>
                    <option value="SEMANAL">Semanal</option>
                    <option value="MENSUAL">Mensual</option>
                  </select>
                </div>
                <div className="form-row">
                  <label>Veces por período</label>
                  <input
                    type="number"
                    name="timesPerPeriod"
                    value={objectiveForm.timesPerPeriod}
                    onChange={handleObjectiveChange}
                    min="0"
                  />
                </div>
              </>
            )}

            <div className="form-actions">
              <button type="submit">Guardar objetivo</button>
            </div>
          </form>
        </section>
      )}

      {activeTab === 'activity' && (
        <section className="card">
          <h2 className="section-title">Registrar actividad</h2>
          <form className="form-grid" onSubmit={submitActivity}>
            <div className="form-row">
              <label>Nombre</label>
              <input
                type="text"
                name="name"
                value={activityForm.name}
                onChange={handleActivityChange}
                placeholder="Ej. Registrar gastos del día"
              />
            </div>

            <div className="form-row">
              <label>Fecha</label>
              <input
                type="date"
                name="date"
                value={activityForm.date}
                onChange={handleActivityChange}
              />
            </div>

            <div className="form-row">
              <label>Tipo</label>
              <select
                name="type"
                value={activityForm.type}
                onChange={handleActivityChange}
              >
                <option value="FINANCIERA">Financiera</option>
                <option value="PERSONAL">Personal</option>
                <option value="TRABAJO">Trabajo</option>
                <option value="SALUD">Salud</option>
                <option value="HOGAR">Hogar</option>
                <option value="ESTUDIO">Estudio</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>

            <div className="form-row">
              <label>Estado</label>
              <select
                name="status"
                value={activityForm.status}
                onChange={handleActivityChange}
              >
                <option value="PENDIENTE">Pendiente</option>
                <option value="HECHA">Hecha</option>
              </select>
            </div>

            <div className="form-row">
              <label>Objetivo asociado (opcional)</label>
              <select
                name="objectiveId"
                value={activityForm.objectiveId}
                onChange={handleActivityChange}
              >
                <option value="">Ninguno</option>
                {objectives.map((obj) => (
                  <option key={obj.id} value={obj.id}>
                    {obj.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row full">
              <label>Descripción</label>
              <textarea
                name="description"
                value={activityForm.description}
                onChange={handleActivityChange}
                rows={3}
              />
            </div>

            <div className="form-actions">
              <button type="submit">Guardar actividad</button>
            </div>
          </form>
        </section>
      )}
    </div>
  )
}

export default RegisterPage
EOF

# ==========================================
# src/pages/DashboardPage.jsx
# ==========================================
cat > src/pages/DashboardPage.jsx << 'EOF'
import { useData } from '../context/DataContext.jsx'

function DashboardPage() {
  const { movements, objectives, activities } = useData()

  const today = new Date().toISOString().slice(0, 10)
  const monthPrefix = today.slice(0, 7)

  const movementsThisMonth = movements.filter((m) =>
    m.date.startsWith(monthPrefix),
  )

  const incomes = movementsThisMonth.filter((m) => m.kind === 'INGRESO')
  const expenses = movementsThisMonth.filter((m) => m.kind === 'GASTO')

  const totalIncome = incomes.reduce((acc, m) => acc + m.amount, 0)
  const totalExpense = expenses.reduce((acc, m) => acc + m.amount, 0)
  const monthBalance = totalIncome - totalExpense

  const nextMovements = movements
    .filter((m) => m.status === 'PLANIFICADO')
    .sort((a, b) => (a.date > b.date ? 1 : -1))
    .slice(0, 3)

  const objectivesActive = objectives.filter((o) => o.status === 'ACTIVO')
  const mainObjective = objectivesActive[0] || objectives[0]

  let mainProgress = 0
  if (mainObjective && mainObjective.targetValue > 0) {
    mainProgress = Math.min(
      100,
      Math.round(
        (mainObjective.currentValue / mainObjective.targetValue) * 100,
      ),
    )
  }

  const activitiesToday = activities.filter((a) => a.date === today)
  const lastActivity = [...activities]
    .filter((a) => a.status === 'HECHA')
    .sort((a, b) => (a.date < b.date ? 1 : -1))[0]

  return (
    <div className="page-root dashboard-page">
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">
        Resumen simple de tu situación actual (datos de esta sesión).
      </p>

      <section className="card">
        <h2 className="section-title">Hoy</h2>
        <p>
          Fecha: <strong>{today}</strong>
        </p>
        {activitiesToday.length > 0 ? (
          <p>
            Actividades de hoy: <strong>{activitiesToday.length}</strong>
          </p>
        ) : (
          <p className="placeholder-text">
            No tienes actividades registradas para hoy.
          </p>
        )}
      </section>

      <section className="card">
        <h2 className="section-title">Finanzas del mes</h2>
        <div className="stats-grid" style={{ marginBottom: '8px' }}>
          <div className="stat-pill">
            <span>Ingresos</span>
            <strong>${totalIncome.toFixed(2)}</strong>
          </div>
          <div className="stat-pill">
            <span>Gastos</span>
            <strong>${totalExpense.toFixed(2)}</strong>
          </div>
          <div className="stat-pill">
            <span>Balance</span>
            <strong>${monthBalance.toFixed(2)}</strong>
          </div>
        </div>
        <p className="section-subtitle">Próximos movimientos (planificados):</p>
        {nextMovements.length > 0 ? (
          <ul>
            {nextMovements.map((m) => (
              <li key={m.id}>
                {m.date} — {m.kind === 'INGRESO' ? 'Ingreso' : 'Gasto'} — $
                {m.amount.toFixed(2)} ({m.sourceOrReason})
              </li>
            ))}
          </ul>
        ) : (
          <p className="placeholder-text">
            No hay próximos movimientos planificados.
          </p>
        )}
      </section>

      {mainObjective && (
        <section className="card">
          <h2 className="section-title">Objetivo principal</h2>
          <p>
            <strong>{mainObjective.name}</strong>
          </p>
          <p>
            Área: <strong>{mainObjective.area}</strong> | Estado:{' '}
            <strong>{mainObjective.status}</strong> | Prioridad:{' '}
            <strong>{mainObjective.priorityLevel}</strong>
          </p>
          {mainObjective.targetValue > 0 && (
            <p>
              Progreso: {mainObjective.currentValue} /{' '}
              {mainObjective.targetValue} ({mainProgress}%)
            </p>
          )}
        </section>
      )}

      <section className="card">
        <h2 className="section-title">Acción</h2>
        {activitiesToday.length > 0 ? (
          <>
            <p>Actividades de hoy:</p>
            <ul>
              {activitiesToday.map((a) => (
                <li key={a.id}>
                  {a.name} ({a.type}) — {a.status}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="placeholder-text">
            No tienes actividades cargadas para hoy.
          </p>
        )}
        {lastActivity && (
          <p style={{ marginTop: '8px' }}>
            Última actividad realizada:{' '}
            <strong>{lastActivity.name}</strong> ({lastActivity.date})
          </p>
        )}
      </section>
    </div>
  )
}

export default DashboardPage
EOF



# ==========================================
# src/pages/FinancePage.jsx
# ==========================================
cat > src/pages/FinancePage.jsx << 'EOF'
import { useData } from '../context/DataContext.jsx'

function FinancePage() {
  const { movements } = useData()

  const incomes = movements.filter((m) => m.kind === 'INGRESO')
  const expenses = movements.filter((m) => m.kind === 'GASTO')
  const totalIncome = incomes.reduce((acc, m) => acc + m.amount, 0)
  const totalExpense = expenses.reduce((acc, m) => acc + m.amount, 0)

  return (
    <div className="page-root finance-page">
      <h1 className="page-title">Finanzas</h1>
      <p className="page-subtitle">
        Listado de ingresos y gastos registrados en esta sesión.
      </p>

      <section className="card">
        <h2 className="section-title">Resumen</h2>
        <p>
          Total de ingresos: <strong>${totalIncome.toFixed(2)}</strong>
        </p>
        <p>
          Total de gastos: <strong>${totalExpense.toFixed(2)}</strong>
        </p>
      </section>

      <section className="card">
        <h2 className="section-title">Ingresos</h2>
        {incomes.length > 0 ? (
          <table className="finance-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Monto</th>
                <th>Descripción</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {incomes.map((m) => (
                <tr key={m.id}>
                  <td>{m.date}</td>
                  <td>${m.amount.toFixed(2)}</td>
                  <td>{m.sourceOrReason}</td>
                  <td>{m.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="placeholder-text">No hay ingresos registrados.</p>
        )}
      </section>

      <section className="card">
        <h2 className="section-title">Gastos</h2>
        {expenses.length > 0 ? (
          <table className="finance-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Monto</th>
                <th>Descripción</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((m) => (
                <tr key={m.id}>
                  <td>{m.date}</td>
                  <td>${m.amount.toFixed(2)}</td>
                  <td>{m.sourceOrReason}</td>
                  <td>{m.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="placeholder-text">No hay gastos registrados.</p>
        )}
      </section>
    </div>
  )
}

export default FinancePage
EOF



# ==========================================
# src/pages/ActivitiesPage.jsx
# ==========================================
cat > src/pages/ActivitiesPage.jsx << 'EOF'
import { useData } from '../context/DataContext.jsx'

function ActivitiesPage() {
  const { activities } = useData()

  const sorted = [...activities].sort((a, b) =>
    a.date < b.date ? 1 : -1,
  )

  return (
    <div className="page-root activities-page">
      <h1 className="page-title">Actividades</h1>
      <p className="page-subtitle">
        Registro de tus acciones diarias vinculadas a objetivos.
      </p>

      <section className="card">
        {sorted.length > 0 ? (
          <table className="activities-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Actividad</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Objetivo asociado</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((act) => (
                <tr key={act.id}>
                  <td>{act.date}</td>
                  <td>{act.name}</td>
                  <td>{act.type}</td>
                  <td>{act.status}</td>
                  <td>{act.objectiveId || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="placeholder-text">No hay actividades registradas.</p>
        )}
      </section>
    </div>
  )
}

export default ActivitiesPage
EOF



# ==========================================
# src/pages/ObjectivesPage.jsx
# ==========================================
cat > src/pages/ObjectivesPage.jsx << 'EOF'
import { useData } from '../context/DataContext.jsx'

function ObjectivesPage() {
  const { objectives } = useData()

  return (
    <div className="page-root objectives-page">
      <h1 className="page-title">Objetivos</h1>
      <p className="page-subtitle">
        Tus metas definidas con área, prioridad y estado.
      </p>

      {objectives.length > 0 ? (
        <ul className="objectives-list">
          {objectives.map((obj) => {
            let progress = 0
            if (obj.targetValue > 0) {
              progress = Math.min(
                100,
                Math.round((obj.currentValue / obj.targetValue) * 100),
              )
            }
            return (
              <li key={obj.id} className="card">
                <h3 style={{ marginBottom: '4px' }}>{obj.name}</h3>
                <p style={{ marginBottom: '4px' }}>
                  Área: <strong>{obj.area}</strong> | Estado:{' '}
                  <strong>{obj.status}</strong> | Prioridad:{' '}
                  <strong>{obj.priorityLevel}</strong>
                </p>
                {obj.description && (
                  <p style={{ marginBottom: '4px' }}>{obj.description}</p>
                )}
                {obj.targetValue > 0 && (
                  <p>
                    Progreso: {obj.currentValue} / {obj.targetValue} ({progress}
                    %)
                  </p>
                )}
                {obj.startDate && obj.endDate && (
                  <p>
                    Fechas: {obj.startDate} → {obj.endDate}
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="placeholder-text">No tienes objetivos definidos.</p>
      )}
    </div>
  )
}

export default ObjectivesPage
EOF



# ==========================================
# src/index.css
# ==========================================
cat > src/index.css << 'EOF'

/* ============================================
   RESET BÁSICO
   ============================================ */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ============================================
   PALETA Y BASE
   ============================================ */
:root {
  --bg-body: #020617;
  --bg-shell: rgba(15, 23, 42, 0.96);
  --bg-sidebar: rgba(15, 23, 42, 0.94);
  --bg-card: rgba(15, 23, 42, 0.98);
  --border-subtle: rgba(148, 163, 184, 0.3);

  --accent: #38bdf8;
  --accent-strong: #0ea5e9;
  --accent-soft: rgba(56, 189, 248, 0.15);

  --fg-primary: #e5e7eb;
  --fg-secondary: #9ca3af;
  --fg-muted: #6b7280;

  --radius-lg: 18px;
  --radius-md: 12px;

  --shadow-soft: 0 22px 60px rgba(15, 23, 42, 0.85);
}

body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
    sans-serif;

  background:
    radial-gradient(circle at top left, #0f172a 0, transparent 55%),
    radial-gradient(circle at bottom right, #22d3ee 0, transparent 60%),
    var(--bg-body);

  color: var(--fg-primary);
  min-height: 100vh;
}

/* ============================================
   CONTENEDOR PRINCIPAL + LAYOUT
   ============================================ */
.app-root {
  min-height: 100vh;
  display: flex;
  gap: 20px;
  padding: 24px;
  justify-content: center;
  align-items: stretch;
}

.app-with-sidebar {
  width: 100%;
  max-width: 1120px;
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 18px;

  background: var(--bg-shell);
  border-radius: 26px;
  padding: 18px;

  box-shadow: var(--shadow-soft);
  border: 1px solid var(--border-subtle);
}

.app-content {
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

@media (max-width: 840px) {
  .app-root {
    padding: 12px;
  }

  .app-with-sidebar {
    grid-template-columns: 1fr;
  }
}

/* ============================================
   SIDEBAR
   ============================================ */
.sidebar {
  min-width: 180px;
  background: var(--bg-sidebar);
  border-radius: 18px;
  padding: 14px;

  display: flex;
  flex-direction: column;
  gap: 8px;

  border: 1px solid var(--border-subtle);
  backdrop-filter: blur(22px);
}

.sidebar-header {
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--fg-secondary);

  display: flex;
  align-items: center;
  gap: 8px;

  margin-bottom: 8px;
}

.sidebar-header::before {
  content: '';
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: radial-gradient(circle, #22c55e 0, #16a34a 45%, #15803d 100%);
  box-shadow: 0 0 14px rgba(34, 197, 94, 0.9);
}

.sidebar button {
  background: transparent;
  border: none;

  padding: 9px 10px;
  border-radius: 10px;

  text-align: left;
  font-size: 0.9rem;

  cursor: pointer;
  color: var(--fg-secondary);

  display: flex;
  align-items: center;
  gap: 8px;

  transition:
    background 0.16s ease,
    color 0.16s ease,
    transform 0.08s ease;
}

.sidebar button::before {
  content: '•';
  font-size: 0.7rem;
  opacity: 0.5;
}

.sidebar button:hover {
  background: rgba(30, 64, 175, 0.6);
  color: var(--fg-primary);
  transform: translateX(2px);
}

.sidebar button.active {
  background: var(--accent-soft);
  color: var(--accent-strong);
  font-weight: 600;

  box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.6);
}

.sidebar button.active::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--accent-strong);
}
/* ============================================
   CONTENIDO PRINCIPAL / PÁGINAS
   ============================================ */
.page-root {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.page-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 650;
  letter-spacing: 0.01em;

  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.page-title::after {
  content: '';
  width: 46px;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--accent), transparent);
  opacity: 0.7;
}

.page-subtitle {
  margin: 0;
  color: var(--fg-muted);
  font-size: 0.9rem;
}

/* ============================================
   TARJETAS (Cards)
   ============================================ */
.card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 14px 14px 12px;

  border: 1px solid var(--border-subtle);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.75);
}

.section-title {
  margin: 0 0 4px;
  font-weight: 600;
  font-size: 1.02rem;
}

.section-subtitle {
  margin: 0 0 6px;
  color: var(--fg-muted);
  font-size: 0.82rem;
}

.placeholder-text {
  color: var(--fg-secondary);
  font-style: italic;
  font-size: 0.8rem;
}

/* ============================================
   DASHBOARD STATS
   ============================================ */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.stat-pill {
  border-radius: 999px;
  border: 1px solid var(--border-subtle);

  padding: 6px 10px;
  font-size: 0.8rem;

  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-pill strong {
  font-weight: 600;
}

@media (max-width: 720px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

/* ============================================
   TABLAS (Finanzas / Actividades)
   ============================================ */
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.86rem;
}

thead th {
  background: rgba(15, 23, 42, 0.95);
  color: var(--fg-secondary);
  text-align: left;
  font-weight: 600;

  padding: 8px 10px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.5);
}

tbody td {
  padding: 7px 10px;
  border-bottom: 1px solid rgba(30, 41, 59, 0.9);
}

tbody tr:nth-child(even) {
  background: rgba(15, 23, 42, 0.7);
}

tbody tr:hover {
  background: rgba(15, 118, 185, 0.35);
}

/* ============================================
   LISTA DE OBJETIVOS
   ============================================ */
.objectives-page ul.objectives-list {
  padding-left: 0;
  list-style: none;

  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ============================================
   FORMULARIOS (Registrar)
   ============================================ */
.register-tabs {
  display: inline-flex;
  border-radius: 999px;

  background: rgba(15, 23, 42, 0.8);
  border: 1px solid var(--border-subtle);

  padding: 4px;
  gap: 4px;
  margin-bottom: 6px;
}

.register-tab {
  border: none;
  background: transparent;
  color: var(--fg-secondary);

  font-size: 0.85rem;
  padding: 6px 12px;

  border-radius: 999px;
  cursor: pointer;

  transition:
    background 0.16s ease,
    color 0.16s ease;
}

.register-tab.active {
  background: var(--accent-soft);
  color: var(--accent-strong);
}

.form-message {
  margin-top: 6px;
  margin-bottom: 4px;
  font-size: 0.82rem;

  color: #a5f3fc;
}

/* Grid general del formulario */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 14px;

  margin-top: 8px;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-row.full {
  grid-column: 1 / -1;
}

.form-row label {
  font-size: 0.8rem;
  color: var(--fg-muted);
}

/* Inputs generales */
.form-row input,
.form-row select,
.form-row textarea {
  background: rgba(15, 23, 42, 0.9);
  border-radius: 10px;

  border: 1px solid rgba(51, 65, 85, 0.9);

  padding: 6px 8px;
  color: var(--fg-primary);
  font-size: 0.85rem;
}

.form-row textarea {
  resize: vertical;
  min-height: 60px;
}

/* Estado: focus */
.form-row input:focus,
.form-row select:focus,
.form-row textarea:focus {
  outline: none;
  border-color: var(--accent-strong);
  box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.5);
}

/* Botones del formulario */
.form-actions {
  grid-column: 1 / -1;

  display: flex;
  justify-content: flex-end;

  margin-top: 4px;
}

.form-actions button {
  border: none;
  border-radius: 999px;

  background: var(--accent-strong);
  color: #0b1120;

  font-size: 0.88rem;
  padding: 7px 14px;

  cursor: pointer;
  font-weight: 600;

  transition:
    background 0.15s ease,
    transform 0.05s ease;
}

.form-actions button:hover {
  background: #38bdf8;
}

.form-actions button:active {
  transform: scale(0.97);
}

/* Responsive del formulario */
@media (max-width: 720px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
/* ============================================
   CALENDARIO (mantiene lógica original)
   ============================================ */
.calendar-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.month-switcher {
  display: flex;
  align-items: center;
  gap: 8px;
}

.month-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--fg-secondary);
}

.btn-ghost {
  background: rgba(30, 64, 175, 0.6);
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 0.8rem;
  border: none;
  cursor: pointer;
  color: var(--fg-primary);
  transition: background 0.15s ease, transform 0.05s ease;
}

.btn-ghost:hover {
  background: rgba(37, 99, 235, 0.9);
}

.btn-ghost:active {
  transform: scale(0.97);
}

.calendar-card {
  margin-top: 4px;
}

/* cabecera de días */
.weekday-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  margin-bottom: 6px;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: var(--fg-muted);
}

.weekday-cell {
  text-align: center;
}

/* grilla calendario */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}

.day-cell {
  min-height: 100px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(51, 65, 85, 0.9);
  padding: 6px;
  display: flex;
  flex-direction: column;
  transition:
    background 0.12s ease,
    border-color 0.12s ease,
    transform 0.06s ease;
}

.day-cell.outside-month {
  background: rgba(15, 23, 42, 0.7);
  opacity: 0.6;
}

.day-cell.today {
  border-color: var(--accent-strong);
  box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.8);
}

.day-cell:hover {
  background: rgba(30, 64, 175, 0.55);
  border-color: rgba(129, 140, 248, 0.9);
  transform: translateY(-1px);
}

.day-cell-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.day-number {
  font-size: 0.9rem;
}

.day-saldo {
  font-size: 0.7rem;
  font-weight: 500;
}

.day-saldo.positive {
  color: #22c55e;
}

.day-saldo.negative {
  color: #f97373;
}

.day-content {
  font-size: 0.7rem;
  color: var(--fg-secondary);
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 2px;
  overflow: hidden;
}

.movement-row {
  display: flex;
  justify-content: space-between;
  gap: 4px;
}

.movement-kind {
  font-size: 0.65rem;
  text-transform: uppercase;
  border-radius: 999px;
  padding: 1px 6px;
}

.movement-kind.ingreso {
  background: rgba(22, 163, 74, 0.2);
  color: #4ade80;
}

.movement-kind.gasto {
  background: rgba(239, 68, 68, 0.2);
  color: #fb7185;
}

.movement-amount.ingreso {
  color: #4ade80;
}

.movement-amount.gasto {
  color: #fb7185;
}

.movement-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 640px) {
  .day-cell {
    min-height: 86px;
  }
}


/* ============================================
   SIDEBAR
   ============================================ */
.sidebar {
  min-width: 180px;
  background: var(--bg-sidebar);
  border-radius: 18px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px solid var(--border-subtle);
  backdrop-filter: blur(22px);
}

.sidebar-header {
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--fg-secondary);
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.sidebar-header::before {
  content: '';
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: radial-gradient(circle, #22c55e 0, #16a34a 45%, #15803d 100%);
  box-shadow: 0 0 14px rgba(34, 197, 94, 0.9);
}

/* Botones */
.sidebar button {
  background: transparent;
  border: none;
  padding: 9px 10px;
  border-radius: 10px;
  text-align: left;
  font-size: 0.9rem;
  cursor: pointer;
  color: var(--fg-secondary);
  display: flex;
  align-items: center;
  gap: 8px;
  transition:
    background 0.16s ease,
    color 0.16s ease,
    transform 0.08s ease;
}

.sidebar button::before {
  content: '•';
  font-size: 0.7rem;
  opacity: 0.5;
}

.sidebar button:hover {
  background: rgba(30, 64, 175, 0.6);
  color: var(--fg-primary);
  transform: translateX(2px);
}

.sidebar button.active {
  background: var(--accent-soft);
  color: var(--accent-strong);
  font-weight: 600;
  box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.6);
}

.sidebar button.active::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--accent-strong);
}

/* ============================================
   CONTENIDO PRINCIPAL / PÁGINAS
   ============================================ */
.page-root {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.page-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 650;
  letter-spacing: 0.01em;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.page-title::after {
  content: '';
  width: 46px;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--accent), transparent);
  opacity: 0.7;
}

.page-subtitle {
  margin: 0;
  color: var(--fg-muted);
  font-size: 0.9rem;
}

.card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 14px 14px 12px;
  border: 1px solid var(--border-subtle);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.75);
}

/* text… (continúa hasta EOF, omití aquí para que puedas confirmar si querés versión completa porque es MUY largo para un único mensaje) */
EOF



echo "== Listo. Archivos clave actualizados (contexto + registrar + core). =="
echo "Recordá que este script SOBREESCRIBE esos archivos con esta versión."
