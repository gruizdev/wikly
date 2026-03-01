import { useNavigate } from 'react-router-dom'
import { useObjectives } from '../context/ObjectivesContext'

export const Header = () => {
  const navigate = useNavigate()
  const { objectives, resetToMockData } = useObjectives()
  const now = new Date()
  const dayOfWeek = now.getDay()
  const daysSinceMonday = (dayOfWeek + 6) % 7

  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - daysSinceMonday)
  weekStart.setHours(0, 0, 0, 0)

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)

  const completedThisWeek = objectives.filter((obj) =>
    obj.completedDates.some((dateString) => {
      const completedDate = new Date(`${dateString}T00:00:00`)
      return completedDate >= weekStart && completedDate <= weekEnd
    })
  ).length

  return (
    <div className="bg-gradient-to-r from-purple-500 via-accent-500 to-pink-500 text-white px-5 py-5 sm:px-7 sm:py-6 rounded-b-3xl shadow-xl">
      <div className="flex items-center justify-between mb-4 gap-3">
        <h1 className="text-3xl sm:text-4xl font-black">✨ Wikly</h1>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={resetToMockData}
            className="bg-white/15 text-white border-2 border-white/70 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold hover:bg-white/25 active:scale-95 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-white/80"
            aria-label="Reset objectives to mock data"
          >
            Reset Mock
          </button>
          <button
            onClick={() => navigate('/calendar')}
            className="bg-white/15 text-white border-2 border-white/70 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold hover:bg-white/25 active:scale-95 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-white/80"
            aria-label="Open calendar overview"
          >
            Calendar
          </button>
          <button
            onClick={() => navigate('/create')}
            className="bg-white text-purple-600 border-2 border-white rounded-full w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center font-bold text-2xl hover:scale-105 active:scale-95 transition-transform shadow-lg focus:outline-none focus:ring-2 focus:ring-white/80"
            aria-label="Create new objective"
          >
            +
          </button>
        </div>
      </div>

      <div className="text-sm font-semibold">
        <p>Weekly Progress</p>
        <div className="mt-3 w-full bg-white/30 rounded-full h-3 overflow-hidden">
          <div
            className="bg-white h-full transition-all duration-500 rounded-full"
            style={{
              width: objectives.length > 0 ? `${(completedThisWeek / objectives.length) * 100}%` : '0%',
            }}
          />
        </div>
        <p className="mt-3 text-lg font-bold">
          {completedThisWeek} of {objectives.length} completed this week
        </p>
      </div>
    </div>
  )
}
