import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getUserIdFromRequest } from '@/lib/supabaseAdmin'

// GET /api/objectives
export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('objectives')
    .select('*, completion_events(completed_on)')
    .eq('user_id', userId)
    .order('position', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  type Row = Record<string, unknown> & { completion_events: Array<{ completed_on: string }> }
  const response = (data as Row[]).map(({ completion_events, ...obj }) => ({
    ...obj,
    completed_dates: completion_events.map((e) => e.completed_on),
  }))
  return NextResponse.json(response)
}

// POST /api/objectives
export async function POST(req: NextRequest) {
  const userId = await getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title, icon, frequency, color } = body

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

  const { data, error } = await supabaseAdmin
    .from('objectives')
    .insert({ user_id: userId, title, icon: icon ?? null, frequency, color, position: nextPosition })
    .select('*, completion_events(completed_on)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  type Row = Record<string, unknown> & { completion_events: Array<{ completed_on: string }> }
  const { completion_events, ...obj } = data as Row
  return NextResponse.json({ ...obj, completed_dates: completion_events.map((e) => e.completed_on) }, { status: 201 })
}
