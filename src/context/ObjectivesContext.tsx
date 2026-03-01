import { createContext, useContext, useEffect, useState } from 'react'
import { Objective } from '../types'

const formatDate = (date: Date) => date.toISOString().split('T')[0]

const daysAgo = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return formatDate(date)
}

const getCurrentWeekMonday = () => {
  const now = new Date()
  const daysSinceMonday = (now.getDay() + 6) % 7
  const monday = new Date(now)
  monday.setDate(now.getDate() - daysSinceMonday)
  monday.setHours(0, 0, 0, 0)
  return monday
}

const dateFromOffset = (base: Date, offset: number) => {
  const date = new Date(base)
  date.setDate(base.getDate() + offset)
  return formatDate(date)
}

const currentMonthDate = (day: number) => {
  const now = new Date()
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const safeDay = Math.max(1, Math.min(day, lastDay))
  return formatDate(new Date(now.getFullYear(), now.getMonth(), safeDay))
}

const uniqueDates = (...dates: string[]) => [...new Set(dates)]

const createMockObjectives = (): Objective[] => {
  const weekStart = getCurrentWeekMonday()
  const sharedWeekDate = dateFromOffset(weekStart, 1)
  const sharedMonthDate = currentMonthDate(1)

  return [
    {
      id: 'mock-1',
      title: 'Morning workout',
      icon: '💪',
      frequency: 'weekly',
      createdAt: new Date(),
      completedDates: uniqueDates(sharedWeekDate, sharedMonthDate, daysAgo(0), daysAgo(2), daysAgo(5)),
    },
    {
      id: 'mock-2',
      title: 'Read 20 pages',
      icon: '📚',
      frequency: 'weekly',
      createdAt: new Date(),
      completedDates: uniqueDates(sharedWeekDate, sharedMonthDate, daysAgo(1), daysAgo(3)),
    },
    {
      id: 'mock-3',
      title: 'Practice guitar',
      icon: '🎵',
      frequency: 'weekly',
      createdAt: new Date(),
      completedDates: uniqueDates(sharedWeekDate, sharedMonthDate, daysAgo(0)),
    },
    {
      id: 'mock-4',
      title: 'Build side-project feature',
      icon: '💻',
      frequency: 'monthly',
      createdAt: new Date(),
      completedDates: uniqueDates(sharedWeekDate, sharedMonthDate, daysAgo(4), daysAgo(12)),
    },
    {
      id: 'mock-5',
      title: 'Weekend nature walk',
      icon: '🌿',
      frequency: 'monthly',
      createdAt: new Date(),
      completedDates: uniqueDates(sharedWeekDate, sharedMonthDate, daysAgo(6)),
    },
    {
      id: 'mock-6',
      title: 'Annual vision board',
      icon: '🎯',
      frequency: 'yearly',
      createdAt: new Date(),
      completedDates: uniqueDates(sharedWeekDate, sharedMonthDate),
    },
  ]
}

interface ObjectivesContextType {
  objectives: Objective[]
  addObjective: (objective: Omit<Objective, 'id' | 'createdAt' | 'completedDates'>) => void
  editObjective: (id: string, updates: Omit<Objective, 'id' | 'createdAt' | 'completedDates'>) => void
  completeObjectiveToday: (id: string) => void
  deleteObjective: (id: string) => void
  resetToMockData: () => void
}

const ObjectivesContext = createContext<ObjectivesContextType | undefined>(undefined)

export const ObjectivesProvider = ({ children }: { children: React.ReactNode }) => {
  const [objectives, setObjectives] = useState<Objective[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('objectives')
    if (stored) {
      try {
        setObjectives(JSON.parse(stored))
      } catch {
        console.error('Failed to parse objectives from localStorage')
      }
    } else {
      setObjectives(createMockObjectives())
    }
  }, [])

  // Save to localStorage whenever objectives change
  useEffect(() => {
    localStorage.setItem('objectives', JSON.stringify(objectives))
  }, [objectives])

  const addObjective = (objective: Omit<Objective, 'id' | 'createdAt' | 'completedDates'>) => {
    const newObjective: Objective = {
      ...objective,
      id: Date.now().toString(),
      createdAt: new Date(),
      completedDates: [],
    }
    setObjectives([...objectives, newObjective])
  }

  const editObjective = (id: string, updates: Omit<Objective, 'id' | 'createdAt' | 'completedDates'>) => {
    setObjectives((prev) =>
      prev.map((obj) =>
        obj.id === id
          ? { ...obj, title: updates.title, icon: updates.icon, frequency: updates.frequency }
          : obj
      )
    )
  }

  const completeObjectiveToday = (id: string) => {
    setObjectives((prev) =>
      prev.map((obj) => {
        if (obj.id === id) {
          const today = new Date().toISOString().split('T')[0]
          return {
            ...obj,
            completedDates: obj.completedDates.includes(today)
              ? obj.completedDates.filter((d) => d !== today)
              : [...obj.completedDates, today],
          }
        }
        return obj
      })
    )
  }

  const deleteObjective = (id: string) => {
    setObjectives((prev) => prev.filter((obj) => obj.id !== id))
  }

  const resetToMockData = () => {
    setObjectives(createMockObjectives())
  }

  return (
    <ObjectivesContext.Provider value={{ objectives, addObjective, editObjective, completeObjectiveToday, deleteObjective, resetToMockData }}>
      {children}
    </ObjectivesContext.Provider>
  )
}

export const useObjectives = () => {
  const context = useContext(ObjectivesContext)
  if (!context) {
    throw new Error('useObjectives must be used within ObjectivesProvider')
  }
  return context
}
