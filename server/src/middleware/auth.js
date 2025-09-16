import jwt from 'jsonwebtoken'

export function verifyJWT(req, res, next) {
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return res.status(401).json({ error: 'missing token' })

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me')
    req.user = payload
    next()
  } catch {
    return res.status(401).json({ error: 'invalid token' })
  }
}
