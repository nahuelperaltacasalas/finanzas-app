// Datos de ejemplo alineados al modelo SSOT

// Movimientos de ejemplo (ingresos y gastos)
export const sampleMovements = [
  {
    id: 'mov_1',
    type: 'gasto',
    title: 'Café y snack',
    amount: 12.5,
    date: '2025-11-01',
    status: 'confirmed',
    confirmationOutcome: 'EQUAL',
    finalAmount: 12.5,
    createdAt: '2025-11-01T08:00:00Z',
    confirmedAt: '2025-11-01T09:00:00Z',
  },
  {
    id: 'mov_2',
    type: 'ingreso',
    title: 'Trabajo freelance',
    amount: 500,
    date: '2025-11-02',
    status: 'confirmed',
    confirmationOutcome: 'EQUAL',
    finalAmount: 500,
    createdAt: '2025-11-02T08:00:00Z',
    confirmedAt: '2025-11-02T12:00:00Z',
  },
  {
    id: 'mov_3',
    type: 'gasto',
    title: 'Supermercado',
    amount: 80,
    date: '2025-11-05',
    status: 'pending',
    createdAt: '2025-11-04T18:00:00Z',
  },
  {
    id: 'mov_4',
    type: 'ingreso',
    title: 'Reembolso',
    amount: 120,
    date: null, // sin fecha para bucket "SIN FECHA"
    status: 'pending',
    createdAt: '2025-11-06T10:00:00Z',
  },
]

// Objetivos de ejemplo
export const sampleObjectives = [
  {
    id: 'obj_1',
    title: 'Ahorrar para mudanza',
    createdAt: '2025-10-20T09:00:00Z',
    goals: [
      {
        id: 'goal_1',
        type: 'money',
        title: 'Fondo de $3000',
        targetAmount: 3000,
        status: 'pending',
        dueDate: '2025-12-31',
        linkedMovementIds: [],
        createdAt: '2025-10-20T09:00:00Z',
      },
      {
        id: 'goal_2',
        type: 'action',
        title: 'Revisar presupuesto mensual',
        status: 'pending',
        dueDate: '2025-11-18',
        linkedMovementIds: [],
        createdAt: '2025-10-21T09:00:00Z',
      },
    ],
  },
  {
    id: 'obj_2',
    title: 'Mantener actividad física',
    createdAt: '2025-10-25T09:00:00Z',
    goals: [
      {
        id: 'goal_3',
        type: 'action',
        title: 'Caminar 3 veces esta semana',
        status: 'pending',
        dueDate: null, // sin fecha → pendiente sin fecha
        linkedMovementIds: [],
        createdAt: '2025-10-25T09:00:00Z',
      },
    ],
  },
]

// Activity Log: inicia vacío para que sea solo runtime
export const sampleActivities = []
