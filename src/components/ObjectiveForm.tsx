import { useState, useRef, useEffect } from 'react'
import { useObjectives } from '../context/ObjectivesContext'
import { FrequencyType } from '../types'
import { useNavigate } from 'react-router-dom'

const EMOJI_ICONS = ['📚', '💪', '🎨', '🎵', '🏃', '📖', '🧘', '💻', '🌍', '❤️', '⚡', '🎯']

export const ObjectiveForm = () => {
  const [title, setTitle] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('📚')
  const [frequency, setFrequency] = useState<FrequencyType>('weekly')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const { addObjective } = useObjectives()
  const navigate = useNavigate()
  const emojiPickerRef = useRef<HTMLDivElement>(null)

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false)
      }
    }

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showEmojiPicker])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim()) {
      addObjective({
        title: title.trim(),
        icon: selectedIcon,
        frequency,
      })
      navigate('/')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Title Input */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Objective Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Read a book chapter"
          className="w-full px-4 py-3 rounded-xl border-2 border-purple-300 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-200 text-lg"
          autoFocus
        />
      </div>

      {/* Icon Picker */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Choose an Icon (Optional)
        </label>
        <div className="relative" ref={emojiPickerRef}>
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="w-full px-4 py-3 rounded-xl border-2 border-purple-300 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white flex items-center justify-between hover:bg-purple-50 transition-colors"
          >
            <span className="text-3xl">{selectedIcon}</span>
            <span className="text-gray-500">▼</span>
          </button>

          {showEmojiPicker && (
            <div className="absolute top-full left-0 right-0 mt-3 bg-white border-2 border-purple-300 rounded-xl shadow-xl p-4 grid grid-cols-6 gap-3 z-50">
              {EMOJI_ICONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    setSelectedIcon(emoji)
                    setShowEmojiPicker(false)
                  }}
                  className={`text-3xl p-2 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-purple-200 ${
                    selectedIcon === emoji
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

      {/* Frequency Selector */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-4">
          How often? *
        </label>
        <div className="grid grid-cols-3 gap-4">
          {(['weekly', 'monthly', 'yearly'] as const).map((freq) => (
            <button
              key={freq}
              type="button"
              onClick={() => setFrequency(freq)}
              className={`px-4 py-3 rounded-xl font-semibold border-2 transition-all focus:outline-none focus:ring-2 focus:ring-purple-200 ${
                frequency === freq
                  ? 'bg-gradient-to-br from-purple-500 to-accent-500 border-transparent text-white scale-105 shadow-lg'
                  : 'bg-white border-purple-300 text-gray-700 hover:border-purple-500'
              }`}
            >
              {freq.charAt(0).toUpperCase() + freq.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <button
          type="submit"
          disabled={!title.trim()}
          className="flex-1 py-4 px-5 bg-gradient-to-r from-purple-500 to-accent-500 border-2 border-transparent text-white font-bold text-lg rounded-xl hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create Objective 🎉
        </button>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
