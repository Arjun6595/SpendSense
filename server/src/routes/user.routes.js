import { Router } from 'express'
import { verifyJWT } from '../middleware/auth.js'

const router = Router()

// Protected route: returns user info from JWT token payload
router.get('/me', verifyJWT, (req, res) => {
  res.json({ user: { id: req.user.sub, email: req.user.email } })
})

export default router
        