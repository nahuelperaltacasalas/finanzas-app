import { useMemo, useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Topbar from './components/Topbar.jsx'
import NewModal from './components/NewModal.jsx'

import DashboardPage from './pages/DashboardPage.jsx'
import PendingPage from './pages/PendingPage.jsx'
import FinancePage from './pages/FinancePage.jsx'
import ObjectivesPage from './pages/ObjectivesPage.jsx'
import ActivitiesPage from './pages/ActivitiesPage.jsx'
import CalendarPage from './pages/CalendarPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'

import { DataProvider } from './context/DataContext.jsx'
import './index.css'

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [newOpen, setNewOpen] = useState(false)

  const pages = {
    dashboard: <DashboardPage />,
    pendientes: <PendingPage />,
    finanzas: <FinancePage />,
    objetivos: <ObjectivesPage />,
    actividades: <ActivitiesPage />,
    calendario: <CalendarPage />,
    registrar: <RegisterPage />,
  }

  const pageTitle = useMemo(() => {
    const map = {
      dashboard: 'Dashboard',
      pendientes: 'Pendientes',
      finanzas: 'Finanzas',
      objetivos: 'Objetivos',
      actividades: 'Actividades',
      calendario: 'Calendario',
      registrar: 'Dev: Registrar',
    }
    return map[currentPage] ?? 'Finanzas App'
  }, [currentPage])

  return (
    <DataProvider>
      <div className="app-root">
        <div className="app-with-sidebar">
          <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

          <main className="app-content">
            <Topbar title={pageTitle} onNew={() => setNewOpen(true)} />
            {pages[currentPage]}
          </main>

          <NewModal open={newOpen} onClose={() => setNewOpen(false)} />
        </div>
      </div>
    </DataProvider>
  )
}

export default App
