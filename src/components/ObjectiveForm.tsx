import { useState, useRef, useEffect } from 'react'
import { useObjectives } from '../context/ObjectivesContext'
import { FrequencyType } from '../types'
import { useRouter } from 'next/navigation'
import { DEFAULT_OBJECTIVE_COLOR, FREQUENCY_OPTIONS, OBJECTIVE_COLOR_OPTIONS } from '../constants/objectiveMeta'
import { EmojiPickerModal } from './EmojiPickerModal'

export const ObjectiveForm = () => {
  const [title, setTitle] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('📚')
  const [frequency, setFrequency] = useState<FrequencyType>('weekly')
  const [color, setColor] = useState(DEFAULT_OBJECTIVE_COLOR)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { addObjective, isSaving, error } = useObjectives()
  const router = useRouter()
  const pickerRef = useRef<HTMLDivElement>(null)

  // Close icon picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false)
      }
    }

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showEmojiPicker])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim()) {
      setSubmitError(null)
      setSubmitting(true)
      try {
        await addObjective({
          title: title.trim(),
          icon: selectedIcon,
          frequency,
          color,
        })
        router.push('/')
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : 'Failed to create objective')
      } finally {
        setSubmitting(false)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-8 transition-opacity duration-200 ${submitting || isSaving ? 'opacity-80' : 'opacity-100'}`}>
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
        <div className="relative" ref={pickerRef}>
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={submitting || isSaving}
            className="w-full px-4 py-3 rounded-xl border-2 border-purple-300 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white flex items-center justify-between hover:bg-purple-50 transition-colors"
          >
            <span className="text-3xl">{selectedIcon}</span>
            <span className="text-gray-500">▼</span>
          </button>

          {showEmojiPicker && (
            <EmojiPickerModal
              onSelectEmoji={setSelectedIcon}
              onClose={() => setShowEmojiPicker(false)}
            />
          )}
        </div>
      </div>

      {/* Frequency Selector */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-4">
          How often? *
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {FREQUENCY_OPTIONS.map((freq) => (
            <button
              key={freq}
              type="button"
              onClick={() => setFrequency(freq)}
              disabled={submitting || isSaving}
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

      {/* Color Selector */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-4">
          Card Color *
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {OBJECTIVE_COLOR_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setColor(option.value)}
              disabled={submitting || isSaving}
              className={`h-12 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-purple-200 ${option.swatchClass} ${
                color === option.value
                  ? 'border-gray-700 scale-105'
                  : 'border-transparent hover:border-gray-400'
              }`}
              aria-label={`Select ${option.label}`}
              title={option.label}
            />
          ))}
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <button
          type="submit"
          disabled={!title.trim() || submitting || isSaving}
          className="flex-1 py-4 px-5 bg-gradient-to-r from-purple-500 to-accent-500 border-2 border-transparent text-white font-bold text-lg rounded-xl hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting || isSaving ? 'Creating...' : 'Create Objective 🎉'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/')}
          disabled={submitting || isSaving}
          className="px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          Cancel
        </button>
      </div>

      {(submitError || error) && (
        <p className="text-sm text-red-600 font-medium">{submitError ?? error}</p>
      )}
    </form>
  )
}
