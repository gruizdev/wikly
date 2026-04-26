import { createContext, useContext, useEffect, useState } from 'react'
import { Objective, Tag } from '../types'
import { objectivesApi } from '../lib/objectivesApi'
import { useAuth } from './AuthContext'

type ObjectiveInput = Omit<Objective, 'id' | 'createdAt' | 'completedDates' | 'tags'> & {
  tagIds?: string[]
}

type ObjectiveUpdates = Partial<Omit<Objective, 'id' | 'createdAt' | 'completedDates' | 'tags'>> & {
  tagIds?: string[]
}

interface ObjectivesContextType {
  objectives: Objective[]
  tags: Tag[]
  loading: boolean
  isSaving: boolean
  pendingObjectiveIds: string[]
  error: string | null
  addObjective: (objective: ObjectiveInput) => Promise<void>
  editObjective: (id: string, updates: ObjectiveUpdates) => Promise<void>
  createTag: (name: string) => Promise<Tag>
  completeObjectiveToday: (id: string) => Promise<void>
  reorderObjectives: (fromIndex: number, toIndex: number) => Promise<void>
  deleteObjective: (id: string) => Promise<void>
}

const ObjectivesContext = createContext<ObjectivesContextType | undefined>(undefined)

export const ObjectivesProvider = ({ children }: { children: React.ReactNode }) => {
  const { session } = useAuth()
  const [objectives, setObjectives] = useState<Objective[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [pendingObjectiveIds, setPendingObjectiveIds] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const addPendingId = (id: string) => {
    setPendingObjectiveIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }

  const removePendingId = (id: string) => {
    setPendingObjectiveIds((prev) => prev.filter((currentId) => currentId !== id))
  }

  // Load objectives from API whenever the user's session changes
  useEffect(() => {
    if (!session) {
      setObjectives([])
      setTags([])
      return
    }

    setLoading(true)
    setError(null)
    Promise.all([objectivesApi.list(), objectivesApi.listTags()])
      .then(([loadedObjectives, loadedTags]) => {
        setObjectives(loadedObjectives)
        setTags(loadedTags)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load objectives'))
      .finally(() => setLoading(false))
  }, [session])

  const addObjective = async (objective: ObjectiveInput) => {
    setError(null)
    setIsSaving(true)
    try {
      const created = await objectivesApi.create(objective)
      setObjectives((prev) => [...prev, created])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create objective')
      throw err
    } finally {
      setIsSaving(false)
    }
  }

  const editObjective = async (id: string, updates: ObjectiveUpdates) => {
    setError(null)
    setIsSaving(true)
    addPendingId(id)
    try {
      const updated = await objectivesApi.update(id, updates)
      setObjectives((prev) => prev.map((obj) => (obj.id === id ? updated : obj)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update objective')
      throw err
    } finally {
      removePendingId(id)
      setIsSaving(false)
    }
  }

  const reorderObjectives = async (fromIndex: number, toIndex: number) => {
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= objectives.length ||
      toIndex >= objectives.length
    ) {
      return
    }

    // Optimistically update UI
    const reordered = [...objectives]
    const [moved] = reordered.splice(fromIndex, 1)
    reordered.splice(toIndex, 0, moved)
    setObjectives(reordered)

    setError(null)
    setIsSaving(true)
    try {
      // Persist new positions
      await Promise.all(
        reordered.map((obj, index) => objectivesApi.update(obj.id, { position: index }))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder objectives')
      throw err
    } finally {
      setIsSaving(false)
    }
  }

  const completeObjectiveToday = async (id: string) => {
    setError(null)
    setIsSaving(true)
    addPendingId(id)
    try {
      const updated = await objectivesApi.toggleComplete(id)
      setObjectives((prev) => prev.map((obj) => (obj.id === id ? updated : obj)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update completion status')
      throw err
    } finally {
      removePendingId(id)
      setIsSaving(false)
    }
  }

  const deleteObjective = async (id: string) => {
    setError(null)
    setIsSaving(true)
    addPendingId(id)
    try {
      await objectivesApi.delete(id)
      setObjectives((prev) => prev.filter((obj) => obj.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete objective')
      throw err
    } finally {
      removePendingId(id)
      setIsSaving(false)
    }
  }

  const createTag = async (name: string) => {
    setError(null)
    const created = await objectivesApi.createTag(name)
    setTags((prev) => {
      if (prev.some((tag) => tag.id === created.id)) return prev
      return [...prev, created]
    })
    return created
  }

  return (
    <ObjectivesContext.Provider
      value={{
        objectives,
        tags,
        loading,
        isSaving,
        pendingObjectiveIds,
        error,
        addObjective,
        editObjective,
        createTag,
        completeObjectiveToday,
        reorderObjectives,
        deleteObjective,
      }}
    >
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
