const express = require('express')
const cors    = require('cors')
const path    = require('path')

// Load .env if it exists (non-fatal if missing)
try { require('dotenv').config() } catch (_) {}

const authRoutes       = require('./routes/auth')
const propertiesRoutes = require('./routes/properties')
const dashboardRoutes  = require('./routes/dashboard')
const agentsRoutes     = require('./routes/agents')

const { initDB } = require('./db')

const app  = express()
const PORT = process.env.PORT || 5001

// ── CORS — allow all origins in development ──────────────────────────────────
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}))
// Handle preflight for all routes (express v5 compatible)
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Origin', req.headers.origin || '*')
    res.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
    res.set('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    res.set('Access-Control-Allow-Credentials', 'true')
    return res.sendStatus(204)
  }
  next()
})

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '20mb' }))
app.use(express.urlencoded({ extended: true, limit: '20mb' }))

// ── Static uploads ────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',       authRoutes)
app.use('/api/properties', propertiesRoutes)
app.use('/api/dashboard',  dashboardRoutes)
app.use('/api/agents',     agentsRoutes)

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date().toISOString() }))

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message)
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' })
})

// ── Kill any existing process on port then start ───────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`\n✅ PrimeNest API ready → http://localhost:${PORT}`)
  console.log(`   Login: admin@primenest.com / admin123\n`)
})

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use. Kill the old process and try again.\n`)
    process.exit(1)
  }
  throw err
})

// ── Init DB ───────────────────────────────────────────────────────────────────
initDB()
