const router = require('express').Router()
const multer = require('multer')
const path   = require('path')
const fs     = require('fs')
const auth   = require('../middleware/auth')
const db     = require('../db')

// ── Multer setup ────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = process.env.VERCEL ? path.join('/tmp', 'uploads') : path.join(__dirname, '../uploads')
    try {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    } catch (_) {}
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const ext  = path.extname(file.originalname)
    const name = `prop_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`
    cb(null, name)
  },
})
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_, file, cb) => {
    const allowed = ['.jpg','.jpeg','.png','.webp']
    cb(null, allowed.includes(path.extname(file.originalname).toLowerCase()))
  },
})

// ── Helpers ─────────────────────────────────────────────────────────────────
const parseProp = (row) => {
  if (!row) return null
  return {
    ...row,
    highlights: safeJson(row.highlights, []),
    amenities:  safeJson(row.amenities,  {}),
    gallery:    safeJson(row.gallery,    []),
  }
}
const safeJson = (str, fallback) => {
  if (!str) return fallback
  if (typeof str !== 'string') return str
  try { return JSON.parse(str) } catch { return fallback }
}
const slugify = (str) =>
  str.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')

// ── GET all ─────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { search = '', type = '', status = '', sort = 'created_at', dir = 'DESC',
            page = 1, limit = 20, featured } = req.query

    let where = 'WHERE 1=1'
    const params = []
    let pCount = 1

    if (search) {
      where += ` AND (p.name ILIKE $${pCount} OR p.location ILIKE $${pCount + 1} OR p.full_address ILIKE $${pCount + 2})`
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
      pCount += 3
    }
    if (type) { 
      where += ` AND p.type = $${pCount}`
      params.push(type)
      pCount++
    }
    if (status) { 
      where += ` AND p.status = $${pCount}`
      params.push(status)
      pCount++
    }
    if (featured) { 
      where += ` AND p.is_featured = $${pCount}`
      params.push(1)
      pCount++
    }

    const safeSorts = ['created_at','price','rating','beds','sqft','views']
    const orderCol  = safeSorts.includes(sort) ? `p.${sort}` : 'p.created_at'
    const orderDir  = dir === 'ASC' ? 'ASC' : 'DESC'

    const totalRow = await db.get(`SELECT COUNT(*) as cnt FROM properties p ${where}`, params)
    const total = totalRow ? Number(totalRow.cnt) : 0
    const offset = (Number(page) - 1) * Number(limit)

    const finalParams = [...params, Number(limit), offset]
    const rows = await db.all(`
      SELECT p.*, a.name as agent_name, a.img as agent_img
      FROM properties p
      LEFT JOIN agents a ON p.agent_id = a.id
      ${where}
      ORDER BY ${orderCol} ${orderDir}
      LIMIT $${pCount} OFFSET $${pCount + 1}
    `, finalParams)

    res.json({ data: rows.map(parseProp), total, page: Number(page), pages: Math.ceil(total / Number(limit)) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── GET single ──────────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const row = await db.get(`
      SELECT p.*, a.name as agent_name, a.title as agent_title, a.email as agent_email,
             a.phone as agent_phone, a.img as agent_img, a.rating as agent_rating,
             a.deals as agent_deals, a.experience as agent_experience
      FROM properties p
      LEFT JOIN agents a ON p.agent_id = a.id
      WHERE p.id = $1
    `, [req.params.id])

    if (!row) return res.status(404).json({ error: 'Property not found' })

    // Track view (Fire and forget, or wait)
    await db.run('INSERT INTO property_views (property_id) VALUES ($1)', [row.id])
    await db.run('UPDATE properties SET views = views + 1 WHERE id = $1', [row.id])

    res.json(parseProp(row))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── POST create ─────────────────────────────────────────────────────────────
router.post('/', auth, upload.fields([
  { name: 'main_img', maxCount: 1 },
  { name: 'gallery',  maxCount: 20 },
]), async (req, res) => {
  try {
    const body = req.body
    const files = req.files || {}

    const mainImg = files.main_img?.[0]
      ? `/uploads/${files.main_img[0].filename}`
      : body.main_img || null

    let gallery = safeJson(body.gallery, [])
    if (files.gallery) {
      const newPhotos = files.gallery.map(f => ({ src: `/uploads/${f.filename}`, label: f.originalname }))
      gallery = [...gallery, ...newPhotos]
    }
    if (mainImg && !gallery.find(g => g.src === mainImg)) {
      gallery.unshift({ src: mainImg, label: 'Exterior' })
    }

    const slug = slugify(body.name) + '-' + Date.now()

    const info = await db.run(`
      INSERT INTO properties (
        name, slug, tagline, location, full_address, price, price_night,
        beds, baths, sqft, garage, floors, year_built, type, status,
        badge, badge_color, tag, rating, reviews, description,
        highlights, amenities, property_tax, hoa, lot_size,
        lat, lng, main_img, gallery, is_featured, agent_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32
      ) RETURNING id
    `, [
      body.name, slug, body.tagline || '', body.location, body.full_address || '',
      body.price, body.price_night || '', Number(body.beds) || 1, Number(body.baths) || 1,
      Number(body.sqft) || 0, Number(body.garage) || 0, Number(body.floors) || 1,
      Number(body.year_built) || new Date().getFullYear(), body.type || 'Villa',
      body.status || 'For Sale', body.badge || 'New', body.badge_color || 'bg-green-500',
      body.tag || 'Premium', Number(body.rating) || 0, Number(body.reviews) || 0,
      body.description || '', JSON.stringify(safeJson(body.highlights, [])),
      JSON.stringify(safeJson(body.amenities, {})), body.property_tax || '',
      body.hoa || 'None', body.lot_size || '', body.lat ? Number(body.lat) : null,
      body.lng ? Number(body.lng) : null, mainImg, JSON.stringify(gallery),
      body.is_featured === 'true' || body.is_featured === '1' ? 1 : 0,
      body.agent_id ? Number(body.agent_id) : null
    ])

    const createdId = info.lastInsertRowid || info.id
    const created = await db.get('SELECT * FROM properties WHERE id = $1', [createdId])
    res.status(201).json(parseProp(created))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── PUT update ──────────────────────────────────────────────────────────────
router.put('/:id', auth, upload.fields([
  { name: 'main_img', maxCount: 1 },
  { name: 'gallery',  maxCount: 20 },
]), async (req, res) => {
  try {
    const existing = await db.get('SELECT * FROM properties WHERE id = $1', [req.params.id])
    if (!existing) return res.status(404).json({ error: 'Property not found' })

    const body  = req.body
    const files = req.files || {}

    const mainImg = files.main_img?.[0]
      ? `/uploads/${files.main_img[0].filename}`
      : body.main_img || existing.main_img

    let gallery = safeJson(body.gallery || existing.gallery, [])
    if (files.gallery) {
      const newPhotos = files.gallery.map(f => ({ src: `/uploads/${f.filename}`, label: f.originalname }))
      gallery = [...gallery, ...newPhotos]
    }

    await db.run(`
      UPDATE properties SET
        name = $1, tagline = $2, location = $3,
        full_address = $4, price = $5, price_night = $6,
        beds = $7, baths = $8, sqft = $9, garage = $10,
        floors = $11, year_built = $12, type = $13,
        status = $14, badge = $15, badge_color = $16,
        tag = $17, rating = $18, reviews = $19,
        description = $20, highlights = $21,
        amenities = $22, property_tax = $23, hoa = $24,
        lot_size = $25, lat = $26, lng = $27,
        main_img = $28, gallery = $29,
        is_featured = $30, agent_id = $31,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $32
    `, [
      body.name || existing.name, body.tagline || existing.tagline, body.location || existing.location,
      body.full_address || existing.full_address, body.price || existing.price, body.price_night || existing.price_night,
      Number(body.beds) || existing.beds, Number(body.baths) || existing.baths, Number(body.sqft) || existing.sqft,
      Number(body.garage) || existing.garage, Number(body.floors) || existing.floors, Number(body.year_built) || existing.year_built,
      body.type || existing.type, body.status || existing.status, body.badge || existing.badge,
      body.badge_color || existing.badge_color, body.tag || existing.tag, Number(body.rating) || existing.rating,
      Number(body.reviews) || existing.reviews, body.description !== undefined ? body.description : existing.description,
      JSON.stringify(safeJson(body.highlights, safeJson(existing.highlights, []))),
      JSON.stringify(safeJson(body.amenities, safeJson(existing.amenities, {}))),
      body.property_tax || existing.property_tax, body.hoa || existing.hoa, body.lot_size || existing.lot_size,
      body.lat !== undefined ? Number(body.lat) : existing.lat, body.lng !== undefined ? Number(body.lng) : existing.lng,
      mainImg, JSON.stringify(gallery),
      body.is_featured !== undefined ? (body.is_featured === 'true' || body.is_featured === '1' ? 1 : 0) : existing.is_featured,
      body.agent_id ? Number(body.agent_id) : existing.agent_id,
      Number(req.params.id)
    ])

    const updated = await db.get('SELECT * FROM properties WHERE id = $1', [req.params.id])
    res.json(parseProp(updated))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── DELETE ──────────────────────────────────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
  try {
    const existing = await db.get('SELECT id FROM properties WHERE id = $1', [req.params.id])
    if (!existing) return res.status(404).json({ error: 'Property not found' })
    await db.run('DELETE FROM properties WHERE id = $1', [req.params.id])
    res.json({ message: 'Property deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── POST upload image to existing property ──────────────────────────────────
router.post('/:id/images', auth, upload.single('image'), async (req, res) => {
  try {
    const prop = await db.get('SELECT id, gallery FROM properties WHERE id = $1', [req.params.id])
    if (!prop) return res.status(404).json({ error: 'Property not found' })
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' })

    const gallery = safeJson(prop.gallery, [])
    const newPhoto = {
      src:   `/uploads/${req.file.filename}`,
      label: req.body.label || req.file.originalname,
    }
    gallery.push(newPhoto)
    await db.run('UPDATE properties SET gallery = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [JSON.stringify(gallery), req.params.id])
    res.json(newPhoto)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── DELETE single image from gallery ────────────────────────────────────────
router.delete('/:id/images', auth, async (req, res) => {
  try {
    const { src } = req.body
    const prop = await db.get('SELECT id, gallery FROM properties WHERE id = $1', [req.params.id])
    if (!prop) return res.status(404).json({ error: 'Property not found' })

    let gallery = safeJson(prop.gallery, [])
    gallery = gallery.filter(g => g.src !== src)
    await db.run('UPDATE properties SET gallery = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [JSON.stringify(gallery), req.params.id])

    if (src.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', src)
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    }

    res.json({ message: 'Image removed' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── Toggle featured ──────────────────────────────────────────────────────────
router.patch('/:id/featured', auth, async (req, res) => {
  try {
    const prop = await db.get('SELECT id, is_featured FROM properties WHERE id = $1', [req.params.id])
    if (!prop) return res.status(404).json({ error: 'Not found' })
    const next = prop.is_featured ? 0 : 1
    await db.run('UPDATE properties SET is_featured = $1 WHERE id = $2', [next, req.params.id])
    res.json({ is_featured: next })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
