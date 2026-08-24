const router  = require('express').Router()
const bcrypt  = require('bcryptjs')
const jwt     = require('jsonwebtoken')
const db = require('../db')

const SECRET = process.env.JWT_SECRET || 'primenest-secret-2024'

// GET /api/auth/db-test
router.get('/db-test', async (req, res) => {
  try {
    const result = await db.all('SELECT NOW()')
    res.json({ status: 'connected', time: result[0] })
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message, stack: err.stack })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

    const admin = await db.get('SELECT * FROM admins WHERE email = $1', [email])
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' })
    if (!bcrypt.compareSync(password, admin.password)) return res.status(401).json({ error: 'Invalid credentials' })

    const token = jwt.sign(
      { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
      SECRET,
      { expiresIn: '24h' }
    )

    const { password: _, ...adminData } = admin
    res.json({ token, admin: adminData })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/auth/me
router.get('/me', require('../middleware/auth'), async (req, res) => {
  try {
    const admin = await db.get('SELECT id,name,email,role,avatar,created_at FROM admins WHERE id = $1', [req.admin.id])
    if (!admin) return res.status(404).json({ error: 'Admin not found' })
    res.json(admin)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/auth/change-password
router.post('/change-password', require('../middleware/auth'), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const admin = await db.get('SELECT * FROM admins WHERE id = $1', [req.admin.id])

    if (!bcrypt.compareSync(currentPassword, admin.password))
      return res.status(400).json({ error: 'Current password is incorrect' })

    const hash = bcrypt.hashSync(newPassword, 10)
    await db.run('UPDATE admins SET password = $1 WHERE id = $2', [hash, req.admin.id])
    res.json({ message: 'Password updated' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
