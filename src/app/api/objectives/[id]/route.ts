import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getUserIdFromRequest } from '@/lib/supabaseAdmin'

// PATCH /api/objectives/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { title, icon, frequency, color, position } = body

  const updates: Record<string, unknown> = {}
  if (title !== undefined) updates.title = title
  if (icon !== undefined) updates.icon = icon
  if (frequency !== undefined) updates.frequency = frequency
  if (color !== undefined) updates.color = color
  if (position !== undefined) updates.position = position

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No updatable fields provided' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('objectives')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select('*, completion_events(completed_on)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Objective not found' }, { status: 404 })

  type Row = Record<string, unknown> & { completion_events: Array<{ completed_on: string }> }
  const { completion_events, ...obj } = data as Row
  return NextResponse.json({ ...obj, completed_dates: completion_events.map((e) => e.completed_on) })
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
