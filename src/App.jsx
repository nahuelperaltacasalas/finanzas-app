import { useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import FinancePage from './pages/FinancePage.jsx'
import ObjectivesPage from './pages/ObjectivesPage.jsx'
import ActivitiesPage from './pages/ActivitiesPage.jsx'
import CalendarPage from './pages/CalendarPage.jsx'
import './index.css'

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')

  const pages = {
    dashboard: <DashboardPage />,
    finanzas: <FinancePage />,
    objetivos: <ObjectivesPage />,
    actividades: <ActivitiesPage />,
    calendario: <CalendarPage />,
  }

  return (
    <div className="app-root">
      <div className="app-with-sidebar">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
        <main className="app-content">{pages[currentPage]}</main>
      </div>
    </div>
  )
}

export default App
