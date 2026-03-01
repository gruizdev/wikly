import { useState } from 'react'
import { useObjectives } from '../context/ObjectivesContext'
import { Objective, FrequencyType } from '../types'
import { BottomNav } from '../components/BottomNav'

const EMOJI_ICONS = ['📚', '💪', '🎨', '🎵', '🏃', '📖', '🧘', '💻', '🌍', '❤️', '⚡', '🎯', '🌿']

export default function ManageObjectives() {
  const { objectives, editObjective, deleteObjective } = useObjectives()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{
    title: string
    icon: string
    frequency: FrequencyType
  }>({ title: '', icon: '📚', frequency: 'weekly' })
  const [showIconPicker, setShowIconPicker] = useState(false)

  const handleStartEdit = (objective: Objective) => {
    setEditingId(objective.id)
    setEditForm({
      title: objective.title,
      icon: objective.icon || '📚',
      frequency: objective.frequency,
    })
    setShowIconPicker(false)
  }

  const handleSaveEdit = () => {
    if (editingId && editForm.title.trim()) {
      editObjective(editingId, editForm)
      setEditingId(null)
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setShowIconPicker(false)
  }

  const handleDelete = (objective: Objective) => {
    if (window.confirm(`Delete "${objective.title}"?\n\nThis action cannot be undone.`)) {
      deleteObjective(objective.id)
      if (editingId === objective.id) {
        setEditingId(null)
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
          {objectives.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
              <span className="text-6xl mb-4 block">🎯</span>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No objectives yet!</h3>
              <p className="text-gray-600">Create one to get started</p>
            </div>
          ) : (
            objectives.map((objective) => (
              <div
                key={objective.id}
                className="bg-white rounded-3xl shadow-xl p-5 sm:p-6"
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
                          className="w-full px-4 py-3 rounded-xl border-2 border-purple-300 bg-white flex items-center justify-between hover:bg-purple-50 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-200"
                        >
                          <span className="text-3xl">{editForm.icon}</span>
                          <span className="text-gray-500">▼</span>
                        </button>

                        {showIconPicker && (
                          <div className="absolute top-full left-0 right-0 mt-3 bg-white border-2 border-purple-300 rounded-xl shadow-xl p-4 grid grid-cols-6 gap-3 z-50">
                            {EMOJI_ICONS.map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => {
                                  setEditForm({ ...editForm, icon: emoji })
                                  setShowIconPicker(false)
                                }}
                                className={`text-3xl p-2 rounded-lg border-2 transition-all focus:outline-none ${
                                  editForm.icon === emoji
                                    ? 'bg-purple-200 border-purple-400 scale-110'
                                    : 'bg-white border-transparent hover:bg-purple-100'
                                }`}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-4">
                        Frequency *
                      </label>
                      <div className="grid grid-cols-3 gap-4">
                        {(['weekly', 'monthly', 'yearly'] as const).map((freq) => (
                          <button
                            key={freq}
                            type="button"
                            onClick={() => setEditForm({ ...editForm, frequency: freq })}
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

                    <div className="flex gap-3 pt-3">
                      <button
                        onClick={handleSaveEdit}
                        disabled={!editForm.title.trim()}
                        className="flex-1 py-3 px-5 bg-gradient-to-r from-purple-500 to-accent-500 border-2 border-transparent text-white font-bold rounded-xl hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-purple-200 disabled:opacity-50"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={handleCancelEdit}
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
                        {objective.frequency === 'weekly' && '📅 Weekly'}
                        {objective.frequency === 'monthly' && '📆 Monthly'}
                        {objective.frequency === 'yearly' && '🗓️ Yearly'}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleStartEdit(objective)}
                        className="px-4 py-2 bg-purple-500 text-white font-bold rounded-xl hover:bg-purple-600 transition-all focus:outline-none focus:ring-2 focus:ring-purple-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(objective)}
                        className="px-4 py-2 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all focus:outline-none focus:ring-2 focus:ring-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
