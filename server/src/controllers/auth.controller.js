import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

// In-memory users store (resets on server restart)
const users = [] // [{ id, email, passwordHash }]

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me'
const JWT_EXPIRES_IN = '7d'

// POST /api/auth/signup
export async function signup(req, res) {
  try {
    const { email, password } = req.body || {}
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password required' })
    }

    const exists = users.find(u => u.email.toLowerCase() === String(email).toLowerCase())
    if (exists) {
      return res.status(409).json({ error: 'email already registered' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = { id: String(users.length + 1), email, passwordHash }
    users.push(user)

    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
    return res.status(201).json({ user: { id: user.id, email: user.email }, token })
  } catch (err) {
    console.error('signup error:', err)
    return res.status(500).json({ error: 'internal error' })
  }
}

// POST /api/auth/login
export async function login(req, res) {
  try {
    const { email, password } = req.body || {}
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password required' })
    }

    const user = users.find(u => u.email.toLowerCase() === String(email).toLowerCase())
    if (!user) {
      return res.status(401).json({ error: 'invalid credentials' })
    }

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) {
      return res.status(401).json({ error: 'invalid credentials' })
    }

    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
    return res.json({ user: { id: user.id, email: user.email }, token })
  } catch (err) {
    console.error('login error:', err)
    return res.status(500).json({ error: 'internal error' })
  }
}
