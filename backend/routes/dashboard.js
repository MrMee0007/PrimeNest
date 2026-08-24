const router = require('express').Router()
const auth   = require('../middleware/auth')
const db = require('../db')

// GET /api/dashboard/stats
router.get('/stats', auth, async (req, res) => {
  try {
    const totalRow    = await db.get('SELECT COUNT(*) as n FROM properties')
    const forSaleRow  = await db.get("SELECT COUNT(*) as n FROM properties WHERE status='For Sale'")
    const forRentRow  = await db.get("SELECT COUNT(*) as n FROM properties WHERE status='For Rent'")
    const featuredRow = await db.get('SELECT COUNT(*) as n FROM properties WHERE is_featured=1')
    const viewsRow    = await db.get('SELECT COALESCE(SUM(views),0) as n FROM properties')
    const totalInqRow = await db.get('SELECT COUNT(*) as n FROM inquiries')
    const newInqRow   = await db.get("SELECT COUNT(*) as n FROM inquiries WHERE status='new'")
    const agentsRow   = await db.get('SELECT COUNT(*) as n FROM agents')

    const total        = totalRow?.n || 0
    const forSale      = forSaleRow?.n || 0
    const forRent      = forRentRow?.n || 0
    const featured     = featuredRow?.n || 0
    const totalViews   = viewsRow?.n || 0
    const totalInq     = totalInqRow?.n || 0
    const newInq       = newInqRow?.n || 0
    const agentCount   = agentsRow?.n || 0

    // Properties by type
    const byType = await db.all('SELECT type, COUNT(*) as count FROM properties GROUP BY type')

    // Views last 7 days (by day)
    let viewsByDay
    if (db.isPostgres) {
      viewsByDay = await db.all(`
        SELECT date(viewed_at) as day, COUNT(*) as views
        FROM property_views
        WHERE viewed_at >= NOW() - INTERVAL '6 days'
        GROUP BY day
        ORDER BY day
      `)
    } else {
      viewsByDay = await db.all(`
        SELECT date(viewed_at) as day, COUNT(*) as views
        FROM property_views
        WHERE viewed_at >= date('now','-6 days')
        GROUP BY day
        ORDER BY day
      `)
    }

    // Inquiries by status
    const inqByStatus = await db.all('SELECT status, COUNT(*) as count FROM inquiries GROUP BY status')

    // Recent inquiries
    const recentInq = await db.all(`
      SELECT i.*, p.name as property_name
      FROM inquiries i
      LEFT JOIN properties p ON i.property_id = p.id
      ORDER BY i.created_at DESC
      LIMIT 5
    `)

    // Top properties by views
    const topProperties = await db.all(`
      SELECT id, name, location, price, views, rating, main_img, type, status
      FROM properties
      ORDER BY views DESC
      LIMIT 5
    `)

    // Monthly additions (last 6 months)
    let monthlyAdded
    if (db.isPostgres) {
      monthlyAdded = await db.all(`
        SELECT to_char(created_at, 'YYYY-MM') as month, COUNT(*) as count
        FROM properties
        WHERE created_at >= NOW() - INTERVAL '5 months'
        GROUP BY month
        ORDER BY month
      `)
    } else {
      monthlyAdded = await db.all(`
        SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count
        FROM properties
        WHERE created_at >= date('now', '-5 months','start of month')
        GROUP BY month
        ORDER BY month
      `)
    }

    res.json({
      overview: { total, forSale, forRent, featured, totalViews, totalInq, newInq, agentCount },
      byType,
      viewsByDay,
      inqByStatus,
      recentInq,
      topProperties,
      monthlyAdded,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
