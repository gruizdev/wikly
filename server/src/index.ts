import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { authenticate } from './middleware/auth'
import objectivesRouter from './routes/objectives'

const app = express()
const port = process.env.PORT ?? 3001
const frontendOrigin = process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173'

app.use(cors({ origin: frontendOrigin, credentials: true }))
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/objectives', authenticate, objectivesRouter)

app.listen(port, () => {
  console.log(`Wikly server running on port ${port}`)
})
