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
