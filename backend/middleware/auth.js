const jwt = require('jsonwebtoken')
const SECRET = process.env.JWT_SECRET || 'primenest-secret-2024'

module.exports = function authMiddleware(req, res, next) {
  const header = req.headers['authorization']
  if (!header) return res.status(401).json({ error: 'No token provided' })

  const token = header.startsWith('Bearer ') ? header.slice(7) : header
  try {
    req.admin = jwt.verify(token, SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}
