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

// PATCH /api/objectives/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { title, icon, frequency, color, position, tagIds } = body
  const shouldSyncTags = Array.isArray(tagIds)

  const updates: Record<string, unknown> = {}
  if (title !== undefined) updates.title = title
  if (icon !== undefined) updates.icon = icon
  if (frequency !== undefined) updates.frequency = frequency
  if (color !== undefined) updates.color = color
  if (position !== undefined) updates.position = position

  if (Object.keys(updates).length === 0 && !shouldSyncTags) {
    return NextResponse.json({ error: 'No updatable fields provided' }, { status: 400 })
  }

  if (Object.keys(updates).length > 0) {
    const { error: updateError } = await supabaseAdmin
      .from('objectives')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  if (shouldSyncTags) {
    try {
      await syncObjectiveTags(id, userId, tagIds as string[])
    } catch (syncError) {
      const message = syncError instanceof Error ? syncError.message : 'Failed to assign tags'
      return NextResponse.json({ error: message }, { status: 500 })
    }
  }

  const { data, error } = await supabaseAdmin
    .from('objectives')
    .select(objectiveSelect)
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Objective not found' }, { status: 404 })

  return NextResponse.json(mapObjectiveRow(data as ObjectiveRow))
}

// DELETE /api/objectives/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const { error } = await supabaseAdmin
    .from('objectives')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
