import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getUserIdFromRequest } from '@/lib/supabaseAdmin'

type ObjectiveRow = Record<string, unknown> & {
  completion_events?: Array<{ completed_on: string }>
  objective_tags?: Array<{ tag: { id: string; name: string } | Array<{ id: string; name: string }> | null }>
}

const objectiveSelect = '*, completion_events(completed_on), objective_tags(tag:tags(id,name))'

function mapObjectiveRow(row: ObjectiveRow) {
  const { completion_events = [], objective_tags = [], ...obj } = row

  const tags = objective_tags.flatMap((join) => {
    if (!join?.tag) return []
    if (Array.isArray(join.tag)) return join.tag
    return [join.tag]
  })

  return {
    ...obj,
    completed_dates: completion_events.map((event) => event.completed_on),
    tags,
  }
}

async function syncObjectiveTags(objectiveId: string, userId: string, tagIds: string[]) {
  const uniqueTagIds = Array.from(new Set(tagIds.filter((tagId) => typeof tagId === 'string' && tagId.trim().length > 0)))

  const { error: clearError } = await supabaseAdmin
    .from('objective_tags')
    .delete()
    .eq('objective_id', objectiveId)
    .eq('user_id', userId)

  if (clearError) throw new Error(clearError.message)
  if (uniqueTagIds.length === 0) return

  const { data: ownedTags, error: ownedTagsError } = await supabaseAdmin
    .from('tags')
    .select('id')
    .eq('user_id', userId)
    .in('id', uniqueTagIds)

  if (ownedTagsError) throw new Error(ownedTagsError.message)

  const validTagIds = (ownedTags ?? []).map((tag) => tag.id)
  if (validTagIds.length === 0) return

  const inserts = validTagIds.map((tagId) => ({
    objective_id: objectiveId,
    tag_id: tagId,
    user_id: userId,
  }))

  const { error: insertError } = await supabaseAdmin
    .from('objective_tags')
    .insert(inserts)

  if (insertError) throw new Error(insertError.message)
}

// GET /api/objectives
export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('objectives')
    .select(objectiveSelect)
    .eq('user_id', userId)
    .order('position', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const response = (data as ObjectiveRow[]).map(mapObjectiveRow)
  return NextResponse.json(response)
}

// POST /api/objectives
export async function POST(req: NextRequest) {
  const userId = await getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title, icon, frequency, color, tagIds } = body
  const normalizedTagIds = Array.isArray(tagIds) ? tagIds : []

  if (!title || !frequency || !color) {
    return NextResponse.json({ error: 'title, frequency, and color are required' }, { status: 400 })
  }

  const { data: existing } = await supabaseAdmin
    .from('objectives')
    .select('position')
    .eq('user_id', userId)
    .order('position', { ascending: false })
    .limit(1)

  const nextPosition = existing && existing.length > 0 ? existing[0].position + 1 : 0

  const { data: created, error } = await supabaseAdmin
    .from('objectives')
    .insert({ user_id: userId, title, icon: icon ?? null, frequency, color, position: nextPosition })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!created) return NextResponse.json({ error: 'Failed to create objective' }, { status: 500 })

  try {
    await syncObjectiveTags(created.id, userId, normalizedTagIds)
  } catch (syncError) {
    const message = syncError instanceof Error ? syncError.message : 'Failed to assign tags'
    return NextResponse.json({ error: message }, { status: 500 })
  }

  const { data, error: fetchError } = await supabaseAdmin
    .from('objectives')
    .select(objectiveSelect)
    .eq('id', created.id)
    .eq('user_id', userId)
    .single()

  if (fetchError || !data) {
    return NextResponse.json({ error: fetchError?.message ?? 'Failed to load created objective' }, { status: 500 })
  }

  return NextResponse.json(mapObjectiveRow(data as ObjectiveRow), { status: 201 })
}
