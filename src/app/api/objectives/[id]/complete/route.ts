import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getUserIdFromRequest } from '@/lib/supabaseAdmin'

type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly'

type ObjectiveRow = Record<string, unknown> & {
  completion_events?: Array<{ completed_on: string }>
  objective_tags?: Array<{ tag: { id: string; name: string } | Array<{ id: string; name: string }> | null }>
}

const objectiveSelect = '*, completion_events(completed_on), objective_tags(tag:tags(id,name))'

function formatDateUTC(date: Date) {
  return date.toISOString().split('T')[0]
}

function getPeriodBounds(frequency: Frequency, reference: Date) {
  const year = reference.getUTCFullYear()
  const month = reference.getUTCMonth()
  const day = reference.getUTCDate()

  if (frequency === 'daily') {
    const date = formatDateUTC(new Date(Date.UTC(year, month, day)))
    return { start: date, end: date }
  }

  if (frequency === 'weekly') {
    const weekday = reference.getUTCDay()
    const diffToMonday = weekday === 0 ? 6 : weekday - 1

    const startDate = new Date(Date.UTC(year, month, day - diffToMonday))
    const endDate = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate() + 6))

    return { start: formatDateUTC(startDate), end: formatDateUTC(endDate) }
  }

  if (frequency === 'monthly') {
    const startDate = new Date(Date.UTC(year, month, 1))
    const endDate = new Date(Date.UTC(year, month + 1, 0))
    return { start: formatDateUTC(startDate), end: formatDateUTC(endDate) }
  }

  const startDate = new Date(Date.UTC(year, 0, 1))
  const endDate = new Date(Date.UTC(year, 11, 31))
  return { start: formatDateUTC(startDate), end: formatDateUTC(endDate) }
}

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

// POST /api/objectives/[id]/complete — toggle completion for today
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const now = new Date()
  const today = formatDateUTC(now)

  // Verify the objective belongs to this user
  const { data: objective, error: ownerError } = await supabaseAdmin
    .from('objectives')
    .select('id, frequency')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (ownerError || !objective) {
    return NextResponse.json({ error: 'Objective not found' }, { status: 404 })
  }

  const frequency = objective.frequency as Frequency
  const { start, end } = getPeriodBounds(frequency, now)

  // Check whether there is already a completion in the current period.
  const { data: existingInPeriod, error: existingError } = await supabaseAdmin
    .from('completion_events')
    .select('id')
    .eq('objective_id', id)
    .eq('user_id', userId)
    .gte('completed_on', start)
    .lte('completed_on', end)

  if (existingError) return NextResponse.json({ error: existingError.message }, { status: 500 })

  if (existingInPeriod && existingInPeriod.length > 0) {
    // Toggle off: remove all completions in the period to enforce one-per-period.
    const { error: deleteError } = await supabaseAdmin
      .from('completion_events')
      .delete()
      .eq('objective_id', id)
      .eq('user_id', userId)
      .gte('completed_on', start)
      .lte('completed_on', end)

    if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 })
  } else {
    // Toggle on: record completion for this period.
    const { error: insertError } = await supabaseAdmin
      .from('completion_events')
      .insert({ objective_id: id, user_id: userId, completed_on: today })

    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // Return the objective with the updated list of completion dates
  const { data, error } = await supabaseAdmin
    .from('objectives')
    .select(objectiveSelect)
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(mapObjectiveRow(data as ObjectiveRow))
}
