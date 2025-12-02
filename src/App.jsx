// Main application component
// This component wraps the CalendarPage and provides top‑level layout styles.
import CalendarPage from './pages/CalendarPage.jsx';

function App() {
  return (
    <div className="app-root">
      <div className="app-container">
        <CalendarPage />
      </div>
    </div>
  );
}

export default App;