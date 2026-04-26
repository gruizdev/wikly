import { useEffect, useMemo, useState } from 'react'
import { useObjectives } from '../context/ObjectivesContext'
import { ObjectiveCard } from './ObjectiveCard'

export const ObjectiveList = () => {
  const { objectives, tags, loading, isSaving, error, pendingObjectiveIds, completeObjectiveToday, deleteObjective, reorderObjectives } = useObjectives()
  const today = new Date().toISOString().split('T')[0]
  const [selectedTagId, setSelectedTagId] = useState<string>('all')
  const [draggedObjectiveId, setDraggedObjectiveId] = useState<string | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  useEffect(() => {
    if (selectedTagId === 'all') return
    if (!tags.some((tag) => tag.id === selectedTagId)) {
      setSelectedTagId('all')
    }
  }, [selectedTagId, tags])

  const visibleObjectives = useMemo(
    () => (selectedTagId === 'all'
      ? objectives
      : objectives.filter((objective) => objective.tags.some((tag) => tag.id === selectedTagId))),
    [objectives, selectedTagId]
  )

  const renderTagFilters = objectives.length > 0 && tags.length > 0

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

  if (visibleObjectives.length === 0) {
    const selectedTag = tags.find((tag) => tag.id === selectedTagId)

    return (
      <div className="space-y-4 sm:space-y-5 relative">
        {renderTagFilters && (
          <div className="bg-white/85 border-2 border-purple-200 rounded-2xl p-4 sm:p-5 shadow-sm">
            <p className="text-sm font-bold text-gray-700 mb-3">Filter by tag</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedTagId('all')}
                className={`px-3 py-1.5 rounded-full border-2 text-sm font-semibold transition-colors ${
                  selectedTagId === 'all'
                    ? 'bg-purple-600 border-purple-600 text-white'
                    : 'bg-white border-purple-200 text-purple-700 hover:border-purple-500'
                }`}
              >
                All
              </button>
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => setSelectedTagId(tag.id)}
                  className={`px-3 py-1.5 rounded-full border-2 text-sm font-semibold transition-colors ${
                    selectedTagId === tag.id
                      ? 'bg-purple-600 border-purple-600 text-white'
                      : 'bg-white border-purple-200 text-purple-700 hover:border-purple-500'
                  }`}
                >
                  #{tag.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-2xl border-2 border-purple-200 bg-purple-50 p-6 text-center">
          <p className="text-lg font-bold text-purple-700">No objectives with this tag</p>
          <p className="text-sm text-purple-600 mt-1">
            {selectedTag ? `Try another filter or add #${selectedTag.name} to more objectives.` : 'Try another filter.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-5 relative">
      {renderTagFilters && (
        <div className="bg-white/85 border-2 border-purple-200 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-3">
            <p className="text-sm font-bold text-gray-700">Filter by tag</p>
            <p className="text-xs text-gray-500">
              Showing {visibleObjectives.length} of {objectives.length}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedTagId('all')}
              className={`px-3 py-1.5 rounded-full border-2 text-sm font-semibold transition-colors ${
                selectedTagId === 'all'
                  ? 'bg-purple-600 border-purple-600 text-white'
                  : 'bg-white border-purple-200 text-purple-700 hover:border-purple-500'
              }`}
            >
              All
            </button>
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => setSelectedTagId(tag.id)}
                className={`px-3 py-1.5 rounded-full border-2 text-sm font-semibold transition-colors ${
                  selectedTagId === tag.id
                    ? 'bg-purple-600 border-purple-600 text-white'
                    : 'bg-white border-purple-200 text-purple-700 hover:border-purple-500'
                }`}
              >
                #{tag.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {isSaving && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="px-3 py-1.5 rounded-full bg-white/90 border border-purple-200 shadow-sm text-xs font-semibold text-purple-700 whitespace-nowrap">
            Saving changes...
          </div>
        </div>
      )}
      {visibleObjectives.map((objective, index) => (
        <div
          key={objective.id}
          draggable={!isSaving}
          onDragStart={() => setDraggedObjectiveId(objective.id)}
          onDragOver={(event) => {
            event.preventDefault()
            setDragOverIndex(index)
          }}
          onDragLeave={() => setDragOverIndex((current) => (current === index ? null : current))}
          onDrop={() => {
            if (draggedObjectiveId) {
              const fromIndex = objectives.findIndex((item) => item.id === draggedObjectiveId)
              const toIndex = objectives.findIndex((item) => item.id === objective.id)

              if (fromIndex >= 0 && toIndex >= 0) {
                void reorderObjectives(fromIndex, toIndex)
              }
            }
            setDraggedObjectiveId(null)
            setDragOverIndex(null)
          }}
          onDragEnd={() => {
            setDraggedObjectiveId(null)
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
