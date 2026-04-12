import { useMemo } from 'react'
import { useObjectives } from '../context/ObjectivesContext'
import { BottomNav } from '../components/BottomNav'

interface PeriodProgress {
  label: string
  completedCount: number
  percentage: number
}

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const toDate = (dateString: string) => new Date(`${dateString}T00:00:00`)

export default function CalendarOverview() {
  const { objectives } = useObjectives()
  const currentYear = new Date().getFullYear()

  const monthlyProgress = useMemo<PeriodProgress[]>(() => {
    return monthNames.map((month, monthIndex) => {
      const completedCount = objectives.filter((objective) =>
        objective.completedDates.some((dateString) => {
          const completedDate = toDate(dateString)
          return (
            completedDate.getFullYear() === currentYear &&
            completedDate.getMonth() === monthIndex
          )
        })
      ).length

      const percentage = objectives.length > 0
        ? Math.round((completedCount / objectives.length) * 100)
        : 0

      return {
        label: month,
        completedCount,
        percentage,
      }
    })
  }, [objectives, currentYear])

  const weeklyProgress = useMemo<PeriodProgress[]>(() => {
    const yearStart = new Date(currentYear, 0, 1)
    const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59, 999)

    const firstWeekStart = new Date(yearStart)
    const daysSinceMonday = (firstWeekStart.getDay() + 6) % 7
    firstWeekStart.setDate(firstWeekStart.getDate() - daysSinceMonday)
    firstWeekStart.setHours(0, 0, 0, 0)

    const weeks: PeriodProgress[] = []
    const cursor = new Date(firstWeekStart)
    let weekNumber = 1

    while (cursor <= yearEnd) {
      const weekStart = new Date(cursor)
      const weekEnd = new Date(cursor)
      weekEnd.setDate(weekEnd.getDate() + 6)
      weekEnd.setHours(23, 59, 59, 999)

      const completedCount = objectives.filter((objective) =>
        objective.completedDates.some((dateString) => {
          const completedDate = toDate(dateString)
          return (
            completedDate.getFullYear() === currentYear &&
            completedDate >= weekStart &&
            completedDate <= weekEnd
          )
        })
      ).length

      const percentage = objectives.length > 0
        ? Math.round((completedCount / objectives.length) * 100)
        : 0

      weeks.push({
        label: `W${weekNumber.toString().padStart(2, '0')}`,
        completedCount,
        percentage,
      })

      cursor.setDate(cursor.getDate() + 7)
      weekNumber += 1
    }

    return weeks
  }, [objectives, currentYear])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 px-4 py-5 sm:px-6 sm:py-8 md:px-8 pb-32">
      <div className="mx-auto w-full max-w-md md:max-w-3xl lg:max-w-4xl space-y-6 sm:space-y-8 mb-8">
        <div className="bg-gradient-to-r from-purple-500 via-accent-500 to-pink-500 text-white rounded-3xl shadow-xl p-5 sm:p-6">
          <h1 className="text-2xl sm:text-3xl font-black mb-2">📅 {currentYear} Calendar</h1>
          <p className="text-sm sm:text-base font-semibold text-white/95">
            See completion by month and week for the current year.
          </p>
        </div>

        <section className="bg-white rounded-3xl shadow-xl p-5 sm:p-6 md:p-8">
          <h2 className="text-xl sm:text-2xl font-black text-gray-800 mb-5">Monthly Completion</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {monthlyProgress.map((month) => {
              const isCompleted = objectives.length > 0 && month.completedCount === objectives.length
              return (
                <div
                  key={month.label}
                  className={`rounded-2xl border-2 p-4 ${
                    isCompleted
                      ? 'bg-green-50 border-green-300'
                      : 'bg-purple-50 border-purple-200'
                  }`}
                >
                  <p className="text-sm font-bold text-gray-700">{month.label}</p>
                  <p className={`mt-2 text-lg font-black ${isCompleted ? 'text-green-600' : 'text-purple-700'}`}>
                    {isCompleted ? 'Done ✅' : `${month.percentage}%`}
                  </p>
                </div>
              )
            })}
          </div>
        </section>

        <section className="bg-white rounded-3xl shadow-xl p-5 sm:p-6 md:p-8">
          <h2 className="text-xl sm:text-2xl font-black text-gray-800 mb-5">Weekly Completion</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-h-[560px] overflow-y-auto pr-1">
            {weeklyProgress.map((week) => {
              const isCompleted = objectives.length > 0 && week.completedCount === objectives.length
              return (
                <div
                  key={week.label}
                  className={`rounded-2xl border-2 px-4 py-3 flex items-center justify-between ${
                    isCompleted
                      ? 'bg-green-50 border-green-300'
                      : 'bg-pink-50 border-pink-200'
                  }`}
                >
                  <p className="text-sm font-bold text-gray-700">{week.label}</p>
                  <p className={`text-sm font-black ${isCompleted ? 'text-green-600' : 'text-pink-600'}`}>
                    {isCompleted ? 'Done ✅' : `${week.percentage}%`}
                  </p>
                </div>
              )
            })}
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  )
}
