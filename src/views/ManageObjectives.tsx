import { useState } from 'react'
import { useObjectives } from '../context/ObjectivesContext'
import { Objective, FrequencyType } from '../types'
import { BottomNav } from '../components/BottomNav'
import { DEFAULT_OBJECTIVE_COLOR, FREQUENCY_LABELS, FREQUENCY_OPTIONS, OBJECTIVE_COLOR_OPTIONS } from '../constants/objectiveMeta'
import { EmojiPickerModal } from '../components/EmojiPickerModal'

export default function ManageObjectives() {
  const { objectives, loading, isSaving, pendingObjectiveIds, error, editObjective, deleteObjective } = useObjectives()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{
    title: string
    icon: string
    frequency: FrequencyType
    color: Objective['color']
  }>({ title: '', icon: '📚', frequency: 'weekly', color: DEFAULT_OBJECTIVE_COLOR })
  const [showIconPicker, setShowIconPicker] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const handleStartEdit = (objective: Objective) => {
    setEditingId(objective.id)
    setEditForm({
      title: objective.title,
      icon: objective.icon || '📚',
      frequency: objective.frequency,
      color: objective.color || DEFAULT_OBJECTIVE_COLOR,
    })
    setShowIconPicker(false)
  }

  const handleSaveEdit = async () => {
    if (editingId && editForm.title.trim()) {
      setSaveError(null)
      try {
        await editObjective(editingId, editForm)
        setEditingId(null)
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : 'Failed to save changes')
      }
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setShowIconPicker(false)
  }

  const handleDelete = async (objective: Objective) => {
    if (window.confirm(`Delete "${objective.title}"?\n\nThis action cannot be undone.`)) {
      setSaveError(null)
      try {
        await deleteObjective(objective.id)
        if (editingId === objective.id) {
          setEditingId(null)
        }
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : 'Failed to delete objective')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 px-4 py-5 sm:px-6 sm:py-8 md:px-8 pb-32">
      <div className="mx-auto w-full max-w-md md:max-w-3xl lg:max-w-4xl space-y-6 mb-8">
        <div className="bg-gradient-to-r from-purple-500 via-accent-500 to-pink-500 text-white rounded-3xl shadow-xl p-5 sm:p-6">
          <h1 className="text-2xl sm:text-3xl font-black mb-2">⚙️ Manage Objectives</h1>
          <p className="text-sm sm:text-base font-semibold text-white/95">
            Edit or delete your objectives
          </p>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map((item) => (
                <div key={item} className="bg-white/70 rounded-3xl border-2 border-purple-100 p-6 shadow-xl">
                  <div className="h-6 w-1/2 rounded bg-purple-200 mb-3" />
                  <div className="h-4 w-1/3 rounded bg-purple-100" />
                </div>
              ))}
            </div>
          ) : objectives.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
              <span className="text-6xl mb-4 block">🎯</span>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No objectives yet!</h3>
              <p className="text-gray-600">Create one to get started</p>
            </div>
          ) : (
            objectives.map((objective) => {
              const isPending = pendingObjectiveIds.includes(objective.id)
              const selectedColor = OBJECTIVE_COLOR_OPTIONS.find((option) => option.value === objective.color) || OBJECTIVE_COLOR_OPTIONS.find((option) => option.value === DEFAULT_OBJECTIVE_COLOR)!

              return (
              <div
                key={objective.id}
                className={`rounded-3xl border-2 shadow-xl p-5 sm:p-6 transition-opacity ${selectedColor.cardClass} ${selectedColor.borderClass} ${isPending ? 'opacity-70' : ''}`}
              >
                {editingId === objective.id ? (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-purple-300 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-200 text-lg"
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Icon
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowIconPicker(!showIconPicker)}
                          disabled={isSaving || isPending}
                          className="w-full px-4 py-3 rounded-xl border-2 border-purple-300 bg-white flex items-center justify-between hover:bg-purple-50 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-200"
                        >
                          <span className="text-3xl">{editForm.icon}</span>
                          <span className="text-gray-500">▼</span>
                        </button>

                        {showIconPicker && (
                          <EmojiPickerModal
                            onSelectEmoji={(emoji) => setEditForm({ ...editForm, icon: emoji })}
                            onClose={() => setShowIconPicker(false)}
                          />
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-4">
                        Frequency *
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {FREQUENCY_OPTIONS.map((freq) => (
                          <button
                            key={freq}
                            type="button"
                            onClick={() => setEditForm({ ...editForm, frequency: freq })}
                            disabled={isSaving || isPending}
                            className={`px-4 py-3 rounded-xl font-semibold border-2 transition-all focus:outline-none ${
                              editForm.frequency === freq
                                ? 'bg-gradient-to-br from-purple-500 to-accent-500 border-transparent text-white scale-105 shadow-lg'
                                : 'bg-white border-purple-300 text-gray-700 hover:border-purple-500'
                            }`}
                          >
                            {freq.charAt(0).toUpperCase() + freq.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-4">
                        Card Color *
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                        {OBJECTIVE_COLOR_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setEditForm({ ...editForm, color: option.value })}
                            disabled={isSaving || isPending}
                            className={`h-12 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-purple-200 ${option.swatchClass} ${
                              editForm.color === option.value
                                ? 'border-gray-700 scale-105'
                                : 'border-transparent hover:border-gray-400'
                            }`}
                            aria-label={`Select ${option.label}`}
                            title={option.label}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-3">
                      <button
                        onClick={handleSaveEdit}
                        disabled={!editForm.title.trim() || isSaving || isPending}
                        className="flex-1 py-3 px-5 bg-gradient-to-r from-purple-500 to-accent-500 border-2 border-transparent text-white font-bold rounded-xl hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-purple-200 disabled:opacity-50"
                      >
                        {isSaving || isPending ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={isSaving || isPending}
                        className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-gray-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <span className="text-3xl flex-shrink-0">{objective.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-gray-800 truncate">{objective.title}</h3>
                      <p className="text-xs text-gray-600 mt-1">
                        {FREQUENCY_LABELS[objective.frequency]}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleStartEdit(objective)}
                        disabled={isSaving || isPending}
                        className="px-4 py-2 bg-purple-500 text-white font-bold rounded-xl hover:bg-purple-600 transition-all focus:outline-none focus:ring-2 focus:ring-purple-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(objective)}
                        disabled={isSaving || isPending}
                        className="px-4 py-2 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all focus:outline-none focus:ring-2 focus:ring-red-300"
                      >
                        {isPending ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              )
            })
          )}

          {(saveError || error) && (
            <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-4 text-red-700 text-sm font-medium">
              {saveError ?? error}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
