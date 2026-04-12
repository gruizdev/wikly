import { useState } from 'react'
import { useObjectives } from '../context/ObjectivesContext'
import { ObjectiveCard } from './ObjectiveCard'

export const ObjectiveList = () => {
  const { objectives, loading, isSaving, error, pendingObjectiveIds, completeObjectiveToday, deleteObjective, reorderObjectives } = useObjectives()
  const today = new Date().toISOString().split('T')[0]
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-5 animate-pulse">
        {[1, 2, 3].map((item) => (
          <div key={item} className="rounded-2xl bg-white/70 border-2 border-purple-100 p-5 sm:p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-200" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-2/3 rounded bg-purple-200" />
                <div className="h-3 w-1/3 rounded bg-purple-100" />
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-100" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error && objectives.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-5 text-red-700">
        {error}
      </div>
    )
  }

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
    <div className="space-y-4 sm:space-y-5 relative">
      {isSaving && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="px-3 py-1.5 rounded-full bg-white/90 border border-purple-200 shadow-sm text-xs font-semibold text-purple-700 whitespace-nowrap">
            Saving changes...
          </div>
        </div>
      )}
      {objectives.map((objective, index) => (
        <div
          key={objective.id}
          draggable={!isSaving}
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
            isPending={pendingObjectiveIds.includes(objective.id)}
            onComplete={completeObjectiveToday}
            onDelete={deleteObjective}
          />
        </div>
      ))}
    </div>
  )
}
