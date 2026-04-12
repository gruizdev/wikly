import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getUserIdFromRequest } from '@/lib/supabaseAdmin'

// POST /api/objectives/[id]/complete — toggle completion for today
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const today = new Date().toISOString().split('T')[0]

  // Verify the objective belongs to this user
  const { data: objective, error: ownerError } = await supabaseAdmin
    .from('objectives')
    .select('id')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (ownerError || !objective) {
    return NextResponse.json({ error: 'Objective not found' }, { status: 404 })
  }

  // Check whether today's completion already exists
  const { data: existing } = await supabaseAdmin
    .from('completion_events')
    .select('id')
    .eq('objective_id', id)
    .eq('completed_on', today)
    .maybeSingle()

  if (existing) {
    // Toggle off: remove today's completion
    const { error: deleteError } = await supabaseAdmin
      .from('completion_events')
      .delete()
      .eq('id', existing.id)

    if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 })
  } else {
    // Toggle on: record today's completion
    const { error: insertError } = await supabaseAdmin
      .from('completion_events')
      .insert({ objective_id: id, user_id: userId, completed_on: today })

    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // Return the objective with the updated list of completion dates
  const { data, error } = await supabaseAdmin
    .from('objectives')
    .select('*, completion_events(completed_on)')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  type Row = Record<string, unknown> & { completion_events: Array<{ completed_on: string }> }
  const { completion_events, ...rest } = data as Row
  return NextResponse.json({ ...rest, completed_dates: completion_events.map((e) => e.completed_on) })
}
