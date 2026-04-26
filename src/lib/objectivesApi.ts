import { supabase } from '../lib/supabase'
import type { Objective, Tag } from '../types'

// In Next.js the API routes are same-origin, so no base URL needed
const apiUrl = '/api'

async function authHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error('Not authenticated')
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error ?? `Request failed: ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

// Shape returned by the API (snake_case columns)
interface ApiObjective {
  id: string
  user_id: string
  title: string
  icon: string | null
  frequency: Objective['frequency']
  color: Objective['color']
  created_at: string
  completed_dates: string[]
  position: number
  tags?: ApiTag[]
}

interface ApiTag {
  id: string
  name: string
}

interface ApiObjectiveTagJoin {
  tag: ApiTag | ApiTag[] | null
}

function toObjective(raw: ApiObjective): Objective {
  const rawTags = (raw as unknown as { objective_tags?: ApiObjectiveTagJoin[] }).objective_tags
  const normalizedTags: Tag[] = Array.isArray(rawTags)
    ? rawTags.flatMap((join) => {
      if (!join?.tag) return []
      if (Array.isArray(join.tag)) return join.tag
      return [join.tag]
    })
    : (raw.tags ?? [])

  return {
    id: raw.id,
    title: raw.title,
    icon: raw.icon ?? undefined,
    frequency: raw.frequency,
    color: raw.color,
    tags: normalizedTags,
    createdAt: new Date(raw.created_at),
    completedDates: raw.completed_dates ?? [],
  }
}

export const objectivesApi = {
  async list(): Promise<Objective[]> {
    const headers = await authHeaders()
    const res = await fetch(`${apiUrl}/objectives`, { headers })
    const data = await handleResponse<ApiObjective[]>(res)
    return data.map(toObjective)
  },

  async create(objective: Omit<Objective, 'id' | 'createdAt' | 'completedDates' | 'tags'> & { tagIds?: string[] }): Promise<Objective> {
    const headers = await authHeaders()
    const res = await fetch(`${apiUrl}/objectives`, {
      method: 'POST',
      headers,
      body: JSON.stringify(objective),
    })
    return toObjective(await handleResponse<ApiObjective>(res))
  },

  async update(
    id: string,
    updates: Partial<Omit<Objective, 'id' | 'createdAt' | 'completedDates' | 'tags'>> & { position?: number; tagIds?: string[] }
  ): Promise<Objective> {
    const headers = await authHeaders()
    const res = await fetch(`${apiUrl}/objectives/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(updates),
    })
    return toObjective(await handleResponse<ApiObjective>(res))
  },

  async delete(id: string): Promise<void> {
    const headers = await authHeaders()
    const res = await fetch(`${apiUrl}/objectives/${id}`, {
      method: 'DELETE',
      headers,
    })
    await handleResponse<void>(res)
  },

  async toggleComplete(id: string): Promise<Objective> {
    const headers = await authHeaders()
    const res = await fetch(`${apiUrl}/objectives/${id}/complete`, {
      method: 'POST',
      headers,
    })
    return toObjective(await handleResponse<ApiObjective>(res))
  },

  async listTags(): Promise<Tag[]> {
    const headers = await authHeaders()
    const res = await fetch(`${apiUrl}/tags`, { headers })
    return handleResponse<Tag[]>(res)
  },

  async createTag(name: string): Promise<Tag> {
    const headers = await authHeaders()
    const res = await fetch(`${apiUrl}/tags`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name }),
    })
    return handleResponse<Tag>(res)
  },
}
