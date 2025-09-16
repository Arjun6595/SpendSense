import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

// Optional friendly root
app.get('/', (_req, res) => res.send('SpendSense API is running'))

// Health route
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'spendsense-server' })
})

// Auth routes
app.use('/api/auth', authRoutes)

// User routes (protected)
app.use('/api/users', userRoutes)

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`)
})
