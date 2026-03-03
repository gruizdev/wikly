import { FrequencyType, ObjectiveColor } from '../types'

export const FREQUENCY_OPTIONS: FrequencyType[] = ['daily', 'weekly', 'monthly', 'yearly']

export const FREQUENCY_LABELS: Record<FrequencyType, string> = {
  daily: '☀️ Daily',
  weekly: '📅 Weekly',
  monthly: '📆 Monthly',
  yearly: '🗓️ Yearly',
}

export const OBJECTIVE_COLOR_OPTIONS: Array<{
  value: ObjectiveColor
  label: string
  swatchClass: string
  cardClass: string
  borderClass: string
}> = [
  { value: 'purple', label: 'Purple', swatchClass: 'bg-purple-300', cardClass: 'bg-purple-100', borderClass: 'border-purple-300' },
  { value: 'pink', label: 'Pink', swatchClass: 'bg-pink-300', cardClass: 'bg-pink-100', borderClass: 'border-pink-300' },
  { value: 'blue', label: 'Blue', swatchClass: 'bg-blue-300', cardClass: 'bg-blue-100', borderClass: 'border-blue-300' },
  { value: 'green', label: 'Green', swatchClass: 'bg-emerald-300', cardClass: 'bg-emerald-100', borderClass: 'border-emerald-300' },
  { value: 'orange', label: 'Orange', swatchClass: 'bg-orange-300', cardClass: 'bg-orange-100', borderClass: 'border-orange-300' },
  { value: 'yellow', label: 'Yellow', swatchClass: 'bg-amber-300', cardClass: 'bg-amber-100', borderClass: 'border-amber-300' },
]

export const DEFAULT_OBJECTIVE_COLOR: ObjectiveColor = 'purple'
