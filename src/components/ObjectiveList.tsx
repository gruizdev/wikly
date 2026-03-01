import { useObjectives } from '../context/ObjectivesContext'
import { ObjectiveCard } from './ObjectiveCard'

export const ObjectiveList = () => {
  const { objectives, completeObjectiveToday, deleteObjective } = useObjectives()
  const today = new Date().toISOString().split('T')[0]

  if (objectives.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="text-6xl mb-5">🎯</span>
        <h3 className="text-2xl font-bold text-gray-700 mb-3">No objectives yet!</h3>
        <p className="text-gray-600">Create one to get started on your journey</p>
      </div>
    )
  }

  // Sort by completed today first, then by frequency
  const sortedObjectives = [...objectives].sort((a, b) => {
    const aCompleted = a.completedDates.includes(today)
    const bCompleted = b.completedDates.includes(today)
    if (aCompleted !== bCompleted) return aCompleted ? 1 : -1
    
    const frequencyOrder = { weekly: 0, monthly: 1, yearly: 2 }
    return frequencyOrder[a.frequency] - frequencyOrder[b.frequency]
  })

  return (
    <div className="space-y-4 sm:space-y-5">
      {sortedObjectives.map((objective) => (
        <ObjectiveCard
          key={objective.id}
          objective={objective}
          isCompletedToday={objective.completedDates.includes(today)}
          onComplete={completeObjectiveToday}
          onDelete={deleteObjective}
        />
      ))}
    </div>
  )
}
