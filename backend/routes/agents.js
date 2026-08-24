const router = require('express').Router()
const auth   = require('../middleware/auth')
const db = require('../db')

router.get('/', async (req, res) => {
  try {
    const agents = await db.all('SELECT id,name,title,email,phone,experience,deals,rating,img,created_at FROM agents')
    res.json(agents)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', auth, async (req, res) => {
  try {
    const { name, title, email, phone, experience, deals, rating, img } = req.body
    if (!name || !email) return res.status(400).json({ error: 'Name and email are required' })

    const info = await db.run(
      'INSERT INTO agents (name,title,email,phone,experience,deals,rating,img) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
      [name, title || 'Property Advisor', email, phone || '', experience || '', Number(deals) || 0, Number(rating) || 5.0, img || null]
    )
    
    const created = await db.get('SELECT * FROM agents WHERE id = $1', [info.lastInsertRowid])
    res.status(201).json(created)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', auth, async (req, res) => {
  try {
    const { name, title, email, phone, experience, deals, rating, img } = req.body
    await db.run(
      'UPDATE agents SET name=$1,title=$2,email=$3,phone=$4,experience=$5,deals=$6,rating=$7,img=$8 WHERE id=$9',
      [name, title, email, phone, experience, Number(deals), Number(rating), img, req.params.id]
    )
    const updated = await db.get('SELECT * FROM agents WHERE id=$1', [req.params.id])
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', auth, async (req, res) => {
  try {
    await db.run('DELETE FROM agents WHERE id=$1', [req.params.id])
    res.json({ message: 'Agent deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
