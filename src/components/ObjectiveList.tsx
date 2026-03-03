import { useState } from 'react'
import { useObjectives } from '../context/ObjectivesContext'
import { ObjectiveCard } from './ObjectiveCard'

export const ObjectiveList = () => {
  const { objectives, completeObjectiveToday, deleteObjective, reorderObjectives } = useObjectives()
  const today = new Date().toISOString().split('T')[0]
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  if (objectives.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="text-6xl mb-5">🎯</span>
        <h3 className="text-2xl font-bold text-gray-700 mb-3">No objectives yet!</h3>
        <p className="text-gray-600">Create one to get started on your journey</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {objectives.map((objective, index) => (
        <div
          key={objective.id}
          draggable
          onDragStart={() => setDraggedIndex(index)}
          onDragOver={(event) => {
            event.preventDefault()
            setDragOverIndex(index)
          }}
          onDragLeave={() => setDragOverIndex((current) => (current === index ? null : current))}
          onDrop={() => {
            if (draggedIndex !== null) {
              reorderObjectives(draggedIndex, index)
            }
            setDraggedIndex(null)
            setDragOverIndex(null)
          }}
          onDragEnd={() => {
            setDraggedIndex(null)
            setDragOverIndex(null)
          }}
          className={`rounded-2xl transition-all ${dragOverIndex === index ? 'ring-2 ring-purple-400' : ''}`}
        >
          <ObjectiveCard
            objective={objective}
            isCompletedToday={objective.completedDates.includes(today)}
            onComplete={completeObjectiveToday}
            onDelete={deleteObjective}
          />
        </div>
      ))}
    </div>
  )
}
