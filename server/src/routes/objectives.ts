import { Router, Request, Response } from 'express'
import { supabaseAdmin, AuthenticatedRequest } from '../middleware/auth'

const router = Router()

// GET /objectives — list all objectives for the authenticated user
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthenticatedRequest).userId

  const { data, error } = await supabaseAdmin
    .from('objectives')
    .select('*')
    .eq('user_id', userId)
    .order('position', { ascending: true })

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  res.json(data)
})

// POST /objectives — create a new objective
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthenticatedRequest).userId
  const { title, icon, frequency, color } = req.body

  if (!title || !frequency || !color) {
    res.status(400).json({ error: 'title, frequency, and color are required' })
    return
  }

  // Get current max position to append at end
  const { data: existing } = await supabaseAdmin
    .from('objectives')
    .select('position')
    .eq('user_id', userId)
    .order('position', { ascending: false })
    .limit(1)

  const nextPosition = existing && existing.length > 0 ? existing[0].position + 1 : 0

  const { data, error } = await supabaseAdmin
    .from('objectives')
    .insert({
      user_id: userId,
      title,
      icon: icon ?? null,
      frequency,
      color,
      completed_dates: [],
      position: nextPosition,
    })
    .select()
    .single()

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  res.status(201).json(data)
})

// PATCH /objectives/:id — update title, icon, frequency, or color
router.patch('/:id', async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthenticatedRequest).userId
  const { id } = req.params
  const { title, icon, frequency, color, position } = req.body

  const updates: Record<string, unknown> = {}
  if (title !== undefined) updates.title = title
  if (icon !== undefined) updates.icon = icon
  if (frequency !== undefined) updates.frequency = frequency
  if (color !== undefined) updates.color = color
  if (position !== undefined) updates.position = position

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: 'No updatable fields provided' })
    return
  }

  const { data, error } = await supabaseAdmin
    .from('objectives')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  if (!data) {
    res.status(404).json({ error: 'Objective not found' })
    return
  }

  res.json(data)
})

// DELETE /objectives/:id — delete an objective
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthenticatedRequest).userId
  const { id } = req.params

  const { error } = await supabaseAdmin
    .from('objectives')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  res.status(204).send()
})

// POST /objectives/:id/complete — toggle completion for today
router.post('/:id/complete', async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthenticatedRequest).userId
  const { id } = req.params
  const today = new Date().toISOString().split('T')[0]

  // Fetch current state
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('objectives')
    .select('completed_dates')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (fetchError || !existing) {
    res.status(404).json({ error: 'Objective not found' })
    return
  }

  const dates: string[] = existing.completed_dates ?? []
  const updated = dates.includes(today)
    ? dates.filter((d: string) => d !== today)
    : [...dates, today]

  const { data, error } = await supabaseAdmin
    .from('objectives')
    .update({ completed_dates: updated })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  res.json(data)
})

export default router
