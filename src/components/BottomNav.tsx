import { useNavigate, useLocation } from 'react-router-dom'
import { useObjectives } from '../context/ObjectivesContext'

export const BottomNav = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { resetToMockData } = useObjectives()

  const isActive = (path: string) => location.pathname === path || location.hash === `#${path}`

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/create', label: 'New', icon: '➕' },
    { path: '/manage', label: 'Manage', icon: '⚙️' },
    { path: '/calendar', label: 'Calendar', icon: '📅' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-purple-200 shadow-2xl z-50">
      <div className="mx-auto max-w-md md:max-w-3xl lg:max-w-4xl">
        <div className="flex items-center justify-around px-2 py-3">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-purple-300 ${
                isActive(item.path)
                  ? 'bg-gradient-to-br from-purple-500 to-accent-500 text-white scale-105 shadow-lg'
                  : 'text-gray-600 hover:bg-purple-50 active:scale-95'
              }`}
              aria-label={item.label}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs font-bold">{item.label}</span>
            </button>
          ))}
          <button
            onClick={resetToMockData}
            className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl text-gray-500 hover:bg-purple-50 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-purple-300"
            aria-label="Reset to mock data"
          >
            <span className="text-2xl">🔄</span>
            <span className="text-xs font-bold">Reset</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
