// src/pages/RegisterPage.jsx
import { useState } from 'react'
import { useData } from '../context/DataContext.jsx'

function RegisterPage() {
  const { objectives = [], tasks = [], addMovement, addObjective, addTask } = useData()

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
    estimated: false,
  })

  const handleMovementChange = (e) => {
    const { name, value, type, checked } = e.target
    setMovementForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
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

    const isReal = movementForm.status === 'REAL'

    const newMovement = {
      id: undefined,
      kind: movementForm.kind,
      date: movementForm.date,
      amount: amountNumber,
      sourceOrReason: movementForm.description,
      status: movementForm.status, // REAL | PLANIFICADO (normalize lo traduce)
      objectiveId: movementForm.objectiveId || null,
      activityId: movementForm.activityId || null,
      estimated: movementForm.estimated,
      // si es REAL, podemos setear confirmedAt de una (opcional, no obligatorio)
      ...(isReal ? { confirmedAt: new Date().toISOString() } : {}),
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
      estimated: false,
    })

    setMessage('Movimiento registrado.')
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
      goals: [],
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

    setMessage('Objetivo registrado.')
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

    const newTask = {
      id: undefined,
      title: activityForm.name,
      dueDate: activityForm.date,
      description: activityForm.description,
      type: activityForm.type,
      objectiveId: activityForm.objectiveId || null,
      status: activityForm.status === 'HECHA' ? 'done' : 'pending',
    }

    addTask(newTask)

    setActivityForm({
      name: '',
      date: '',
      type: 'FINANCIERA',
      status: 'PENDIENTE',
      objectiveId: '',
      description: '',
    })

    setMessage('Actividad registrada.')
  }

  return (
    <div className="page-root register-page">
      <h1 className="page-title">Registrar</h1>
      <p className="page-subtitle">Crear nuevos movimientos, objetivos y actividades.</p>

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
              <select name="kind" value={movementForm.kind} onChange={handleMovementChange}>
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
              <input type="date" name="date" value={movementForm.date} onChange={handleMovementChange} />
            </div>

            <div className="form-row">
              <label>Descripción</label>
              <input
                type="text"
                name="description"
                value={movementForm.description}
                onChange={handleMovementChange}
                placeholder="Ej. Sueldo, alquiler, compra..."
              />
            </div>

            <div className="form-row">
              <label>Estado</label>
              <select name="status" value={movementForm.status} onChange={handleMovementChange}>
                <option value="REAL">Real</option>
                <option value="PLANIFICADO">Planificado</option>
              </select>
            </div>

            <div className="form-row" style={{ alignItems: 'center' }}>
              <label>Es estimado (supuesto / proyección)</label>
              <input type="checkbox" name="estimated" checked={movementForm.estimated} onChange={handleMovementChange} />
            </div>

            <div className="form-row">
              <label>Objetivo asociado (opcional)</label>
              <select name="objectiveId" value={movementForm.objectiveId} onChange={handleMovementChange}>
                <option value="">Ninguno</option>
                {objectives.map((obj) => (
                  <option key={obj.id} value={obj.id}>
                    {obj.title ?? obj.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <label>Actividad asociada (opcional)</label>
              <select name="activityId" value={movementForm.activityId} onChange={handleMovementChange}>
                <option value="">Ninguna</option>
                {tasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.title ?? task.name} ({task.dueDate ?? task.date ?? 'sin fecha'})
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
              <select name="area" value={objectiveForm.area} onChange={handleObjectiveChange}>
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
              <textarea name="description" value={objectiveForm.description} onChange={handleObjectiveChange} rows={3} />
            </div>

            <div className="form-row">
              <label>Prioridad</label>
              <select name="priorityLevel" value={objectiveForm.priorityLevel} onChange={handleObjectiveChange}>
                <option value="BAJA">Baja</option>
                <option value="MEDIA">Media</option>
                <option value="ALTA">Alta</option>
                <option value="CRITICA">Crítica</option>
              </select>
            </div>

            <div className="form-row">
              <label>Tipo</label>
              <select name="type" value={objectiveForm.type} onChange={handleObjectiveChange}>
                <option value="FINANCIERO">Financiero</option>
                <option value="HABITO">Hábito / Acción</option>
                <option value="MIXTO">Mixto</option>
              </select>
            </div>

            <div className="form-row">
              <label>Estado</label>
              <select name="status" value={objectiveForm.status} onChange={handleObjectiveChange}>
                <option value="ACTIVO">Activo</option>
                <option value="PAUSADO">Pausado</option>
                <option value="LOGRADO">Logrado</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>

            <div className="form-row">
              <label>Fecha inicio</label>
              <input type="date" name="startDate" value={objectiveForm.startDate} onChange={handleObjectiveChange} />
            </div>

            <div className="form-row">
              <label>Fecha fin</label>
              <input type="date" name="endDate" value={objectiveForm.endDate} onChange={handleObjectiveChange} />
            </div>

            {(objectiveForm.type === 'FINANCIERO' || objectiveForm.type === 'MIXTO') && (
              <>
                <div className="form-row">
                  <label>Meta financiera</label>
                  <input type="number" name="targetValue" value={objectiveForm.targetValue} onChange={handleObjectiveChange} min="0" step="0.01" />
                </div>
                <div className="form-row">
                  <label>Valor actual</label>
                  <input type="number" name="currentValue" value={objectiveForm.currentValue} onChange={handleObjectiveChange} min="0" step="0.01" />
                </div>
              </>
            )}

            {(objectiveForm.type === 'HABITO' || objectiveForm.type === 'MIXTO') && (
              <>
                <div className="form-row">
                  <label>Frecuencia</label>
                  <select name="frequency" value={objectiveForm.frequency} onChange={handleObjectiveChange}>
                    <option value="NINGUNA">Sin definir</option>
                    <option value="DIARIA">Diaria</option>
                    <option value="SEMANAL">Semanal</option>
                    <option value="MENSUAL">Mensual</option>
                  </select>
                </div>
                <div className="form-row">
                  <label>Veces por período</label>
                  <input type="number" name="timesPerPeriod" value={objectiveForm.timesPerPeriod} onChange={handleObjectiveChange} min="0" />
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
              <input type="text" name="name" value={activityForm.name} onChange={handleActivityChange} placeholder="Ej. Registrar gastos del día" />
            </div>

            <div className="form-row">
              <label>Fecha</label>
              <input type="date" name="date" value={activityForm.date} onChange={handleActivityChange} />
            </div>

            <div className="form-row">
              <label>Tipo</label>
              <select name="type" value={activityForm.type} onChange={handleActivityChange}>
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
              <select name="status" value={activityForm.status} onChange={handleActivityChange}>
                <option value="PENDIENTE">Pendiente</option>
                <option value="HECHA">Hecha</option>
              </select>
            </div>

            <div className="form-row">
              <label>Objetivo asociado (opcional)</label>
              <select name="objectiveId" value={activityForm.objectiveId} onChange={handleActivityChange}>
                <option value="">Ninguno</option>
                {objectives.map((obj) => (
                  <option key={obj.id} value={obj.id}>
                    {obj.title ?? obj.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row full">
              <label>Descripción</label>
              <textarea name="description" value={activityForm.description} onChange={handleActivityChange} rows={3} />
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
