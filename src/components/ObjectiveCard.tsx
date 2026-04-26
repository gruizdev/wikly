import { Objective } from '../types'
import { DEFAULT_OBJECTIVE_COLOR, FREQUENCY_LABELS, OBJECTIVE_COLOR_OPTIONS } from '../constants/objectiveMeta'

interface ObjectiveCardProps {
  objective: Objective
  isCompletedToday: boolean
  isPending?: boolean
  onComplete: (id: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export const ObjectiveCard = ({ objective, isCompletedToday, isPending = false, onComplete, onDelete }: ObjectiveCardProps) => {
  const selectedColor = OBJECTIVE_COLOR_OPTIONS.find((option) => option.value === objective.color) || OBJECTIVE_COLOR_OPTIONS.find((option) => option.value === DEFAULT_OBJECTIVE_COLOR)!

  const handleDelete = () => {
    if (window.confirm(`Delete "${objective.title}"?\n\nThis action cannot be undone.`)) {
      void onDelete(objective.id)
    }
  }

  return (
    <div
      className={`p-5 sm:p-6 rounded-2xl border-2 shadow-lg transition-all duration-300 ${selectedColor.cardClass} ${selectedColor.borderClass} ${
        isCompletedToday
          ? 'opacity-80 scale-105'
          : 'hover:shadow-xl'
      } ${isPending ? 'opacity-70 pointer-events-none' : ''}`}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={() => void onComplete(objective.id)}
          disabled={isPending}
          className={`flex-shrink-0 w-10 h-10 rounded-full border-2 bg-white/90 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-purple-300 ${
            isCompletedToday
              ? 'bg-white border-green-600'
              : 'border-purple-400 hover:border-purple-600'
          }`}
          aria-label={isCompletedToday ? 'Mark objective as pending' : 'Mark objective as completed'}
        >
          {isCompletedToday && (
            <span className="text-green-600 text-xl">✓</span>
          )}
        </button>

        <div className="flex-1">
          <div className="flex items-center gap-3">
            {objective.icon && <span className="text-2xl">{objective.icon}</span>}
            <h3
              className={`font-bold text-lg ${
                isCompletedToday ? 'text-gray-700 line-through' : 'text-gray-800'
              }`}
            >
              {objective.title}
            </h3>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {FREQUENCY_LABELS[objective.frequency]}
          </p>
          {objective.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {objective.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="px-2 py-0.5 rounded-full bg-white/90 border border-purple-200 text-xs font-semibold text-purple-700"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleDelete}
          disabled={isPending}
          className="flex-shrink-0 w-10 h-10 rounded-full border-2 border-gray-200 bg-white text-gray-500 hover:text-red-500 hover:border-red-300 hover:bg-red-50 transition-colors text-xl focus:outline-none focus:ring-2 focus:ring-red-200"
          aria-label="Delete objective"
        >
          {isPending ? '…' : '×'}
        </button>
      </div>
    </div>
  )
}
