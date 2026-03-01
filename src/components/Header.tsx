import { useObjectives } from '../context/ObjectivesContext'

export const Header = () => {
  const { objectives } = useObjectives()
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
      <div className="mb-4">
        <h1 className="text-3xl sm:text-4xl font-black">✨ Wikly</h1>
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
