import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { ObjectivesProvider } from './context/ObjectivesContext'
import Home from './pages/Home'
import CreateObjective from './pages/CreateObjective'
import CalendarOverview from './pages/CalendarOverview'

function App() {
  return (
    <Router>
      <ObjectivesProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateObjective />} />
          <Route path="/calendar" element={<CalendarOverview />} />
        </Routes>
      </ObjectivesProvider>
    </Router>
  )
}

export default App
