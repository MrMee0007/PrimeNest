const path = require('path')
const fs = require('fs')

let isPostgres = false
let pool = null
let sqliteDb = null

const connectionString = process.env.DATABASE_URL || process.env.PGURI

if (connectionString) {
  const { Pool } = require('pg')
  pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  })
  isPostgres = true
  console.log('🔌 Database: PostgreSQL mode active')
} else {
  try {
    const Database = require('better-sqlite3')
    const DB_PATH = path.join(__dirname, 'primenest.db')
    sqliteDb = new Database(DB_PATH)
    sqliteDb.pragma('journal_mode = WAL')
    sqliteDb.pragma('foreign_keys = ON')
    console.log('🔌 Database: SQLite local fallback active')
  } catch (err) {
    console.warn('\n⚠️  WARNING: Could not load local SQLite database (better-sqlite3 binary issue).')
    console.warn('👉 To run locally, please configure a PostgreSQL database in your .env file:')
    console.warn('   DATABASE_URL=postgresql://username:password@localhost:5432/databasename\n')
  }
}

// ── Unified Database Interface (Compatibility Layer) ───────────────────────
const db = {
  isPostgres,
  
  // Return all matching rows
  async all(queryText, params = []) {
    if (isPostgres) {
      const res = await pool.query(queryText, params)
      return res.rows
    } else {
      if (!sqliteDb) throw new Error('Database is offline. Configure DATABASE_URL in .env to use PostgreSQL.')
      const sqliteText = queryText.replace(/\$\d+/g, '?')
      return sqliteDb.prepare(sqliteText).all(...params)
    }
  },

  // Return first matching row
  async get(queryText, params = []) {
    if (isPostgres) {
      const res = await pool.query(queryText, params)
      return res.rows[0] || null
    } else {
      if (!sqliteDb) throw new Error('Database is offline. Configure DATABASE_URL in .env to use PostgreSQL.')
      const sqliteText = queryText.replace(/\$\d+/g, '?')
      return sqliteDb.prepare(sqliteText).get(...params) || null
    }
  },

  // Execute insert/update/delete
  async run(queryText, params = []) {
    if (isPostgres) {
      const res = await pool.query(queryText, params)
      return { lastInsertRowid: res.rows[0]?.id || null, changes: res.rowCount }
    } else {
      if (!sqliteDb) throw new Error('Database is offline. Configure DATABASE_URL in .env to use PostgreSQL.')
      const sqliteText = queryText.replace(/\$\d+/g, '?')
      const info = sqliteDb.prepare(sqliteText).run(...params)
      return { lastInsertRowid: info.lastInsertRowid, changes: info.changes }
    }
  },

  // Direct transaction helper
  async transaction(fn) {
    if (isPostgres) {
      const client = await pool.connect()
      try {
        await client.query('BEGIN')
        const result = await fn(client)
        await client.query('COMMIT')
        return result
      } catch (err) {
        await client.query('ROLLBACK')
        throw err
      } finally {
        client.release()
      }
    } else {
      if (!sqliteDb) throw new Error('Database is offline. Configure DATABASE_URL in .env to use PostgreSQL.')
      return sqliteDb.transaction(fn)()
    }
  }
}

// ── Database Initialization & Seeding ────────────────────────────────────────
async function initDB() {
  const bcrypt = require('bcryptjs')
  const UPLOADS_PATH = path.join(__dirname, 'uploads')
  if (!fs.existsSync(UPLOADS_PATH)) fs.mkdirSync(UPLOADS_PATH, { recursive: true })

  if (isPostgres) {
    // PostgreSQL Tables setup
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'admin',
        avatar TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS agents (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL DEFAULT 'Property Advisor',
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(100),
        experience VARCHAR(100),
        deals INTEGER NOT NULL DEFAULT 0,
        rating REAL NOT NULL DEFAULT 5.0,
        img TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS properties (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        tagline TEXT,
        location VARCHAR(255) NOT NULL,
        full_address TEXT,
        price VARCHAR(255) NOT NULL,
        price_night VARCHAR(255),
        beds INTEGER NOT NULL DEFAULT 1,
        baths INTEGER NOT NULL DEFAULT 1,
        sqft INTEGER NOT NULL DEFAULT 0,
        garage INTEGER NOT NULL DEFAULT 0,
        floors INTEGER NOT NULL DEFAULT 1,
        year_built INTEGER,
        type VARCHAR(100) NOT NULL DEFAULT 'Villa',
        status VARCHAR(100) NOT NULL DEFAULT 'For Sale',
        badge VARCHAR(100) NOT NULL DEFAULT 'New',
        badge_color VARCHAR(100) NOT NULL DEFAULT 'bg-green-500',
        tag VARCHAR(100) NOT NULL DEFAULT 'Premium',
        rating REAL NOT NULL DEFAULT 0,
        reviews INTEGER NOT NULL DEFAULT 0,
        description TEXT,
        highlights TEXT DEFAULT '[]',
        amenities TEXT DEFAULT '{}',
        property_tax VARCHAR(100),
        hoa VARCHAR(100),
        lot_size VARCHAR(100),
        lat REAL,
        lng REAL,
        main_img TEXT,
        gallery TEXT DEFAULT '[]',
        views INTEGER NOT NULL DEFAULT 0,
        agent_id INTEGER REFERENCES agents(id) ON DELETE SET NULL,
        is_featured INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS property_views (
        id SERIAL PRIMARY KEY,
        property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
        viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS inquiries (
        id SERIAL PRIMARY KEY,
        property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(100),
        message TEXT,
        date_pref VARCHAR(100),
        status VARCHAR(100) NOT NULL DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Seed admin
    const adminRes = await pool.query('SELECT id FROM admins WHERE email = $1', ['admin@primenest.com'])
    if (adminRes.rowCount === 0) {
      const hash = bcrypt.hashSync('admin123', 10)
      await pool.query(`
        INSERT INTO admins (name, email, password, role)
        VALUES ($1, $2, $3, $4)
      `, ['Super Admin', 'admin@primenest.com', hash, 'superadmin'])
      console.log('✓ Admin seeded (PostgreSQL)')
    }

    // Seed agent
    const agentRes = await pool.query('SELECT id FROM agents WHERE email = $1', ['marcus@primenest.com'])
    let agentId
    if (agentRes.rowCount === 0) {
      const agentInsert = await pool.query(`
        INSERT INTO agents (name, title, email, phone, experience, deals, rating, img)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `, ['Marcus Wainwright', 'Senior Property Advisor', 'marcus@primenest.com', '+1 (646) 555-0134', '12 years', 340, 4.9, '/agent_photo.png'])
      agentId = agentInsert.rows[0].id
      console.log('✓ Agent seeded (PostgreSQL)')
    } else {
      agentId = agentRes.rows[0].id
    }

    // Seed properties
    const propCount = await pool.query('SELECT id FROM properties LIMIT 1')
    if (propCount.rowCount === 0) {
      await pool.query(`
        INSERT INTO properties (
          name, slug, tagline, location, full_address, price, price_night,
          beds, baths, sqft, garage, floors, year_built, type, status,
          badge, badge_color, tag, rating, reviews, description,
          highlights, amenities, property_tax, hoa, lot_size,
          lat, lng, main_img, gallery, is_featured, agent_id
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
          $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32
        )
      `, [
        'Radha Kund Integrated Township',
        'radha-kund-township',
        'Where Nature Is Not An Amenity. It\'s The Core.',
        'Goverdhan, Vrindavan',
        'Radha Kund Ring Road, Goverdhan (Vrindavan), Uttar Pradesh, India',
        '₹ 59.85 Lakhs Onwards',
        '₹ 45,000/Sq.Yd',
        133, 0, 1197, 0, 1, 2026, 'Plot', 'For Sale',
        'MVDA Approved', 'bg-emerald-600', 'Premium', 4.95, 142,
        'Radha Kund is a landmark 78-Acre Integrated Township where nature is the core. Meticulously designed around preservation, the layout features 9.9 Acres of central greens—nearly 2.5 times the size of Nidhivan—connected by a continuous green loop linking residences, resort, and lifestyle spaces.',
        JSON.stringify([
          'License received from MVDA',
          '9.9 Acres of Central Greens (Nearly 2.5X size of Nidhivan)',
          'Continuous Green Loop connecting residences and resort',
          'Designed by Padma Bhushan Hafeez Contractor',
          'Expression of Interest (EOI) at ₹3 Lakh onwards'
        ]),
        JSON.stringify({
          'Nature & Core': ['9.9 Acres Central Green', 'Continuous Green Loop', 'Reflecting Lotus Pools', 'Themed Gardens'],
          'Security': ['24/7 Security managed by MNC PMC', 'CCTV monitoring', 'Gated Perimeter'],
          'Infrastructure': ['Underground cabling', 'Wide Internal Roads', 'LED street lights']
        }),
        '₹ 12,000 / yr', '₹ 1,500 / mo', '133 & 150 Sq. Yd',
        27.525, 77.412, '/property_villa.png',
        JSON.stringify([
          { src: '/property_villa.png', label: 'Main Entrance Plaza' },
          { src: '/interior_living.png', label: 'Resort Amenities' },
          { src: '/interior_pool.png', label: 'Luxury Resort Pool' }
        ]),
        1, agentId
      ])

      await pool.query(`
        INSERT INTO properties (
          name, slug, tagline, location, full_address, price, price_night,
          beds, baths, sqft, garage, floors, year_built, type, status,
          badge, badge_color, tag, rating, reviews, description,
          highlights, amenities, property_tax, hoa, lot_size,
          lat, lng, main_img, gallery, is_featured, agent_id
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
          $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32
        )
      `, [
        'Shri Vrinda Aaradhya Plots',
        'shri-vrinda-aaradhya',
        'Modern Comfort in a Holy City.',
        'Radha Rani Brajdhara, Barsana',
        'Radha Rani Brajdhara, Barsana, Uttar Pradesh, India',
        'Special Pre-Launch Pricing',
        'First Come, First Serve',
        150, 0, 1350, 0, 1, 2026, 'Plot', 'Coming Soon',
        'Coming Soon', 'bg-amber-500', 'Premium', 4.99, 86,
        'Shri Vrinda Aaradhya offers limited plots at special pre-launch prices on a first-come, first-serve basis. Nestled in the sacred town of Barsana, Aaradhya blends modern comfort with spiritual serenity.',
        JSON.stringify([
          'Located in Radha Rani Brajdhara, Barsana',
          'Special Pre-Launch Prices',
          'Modern comfort integrated in a holy city',
          'Limited inventory (First come, first serve)'
        ]),
        JSON.stringify({
          'Comforts': ['Spiritual meditation halls', 'Traditional lotus reflecting pools', 'Lush green pathways'],
          'Services': ['Grand decorative gateways', 'Managed visitor lounges', '24/7 security']
        }),
        'N/A', 'N/A', 'Flexible Sizes',
        27.435, 77.378, '/property_penthouse.png',
        JSON.stringify([
          { src: '/property_penthouse.png', label: 'Aaradhya Villas view' },
          { src: '/interior_living.png', label: 'Lotus pool courtyard' },
          { src: '/interior_pool.png', label: 'Divine sunset pavilion' }
        ]),
        1, agentId
      ])
      console.log('✓ Properties seeded (PostgreSQL)')
    }
  } else {
    if (!sqliteDb) return // skip seeding if sqlite is offline
    
    // SQLite Fallback Tables setup
    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS admins (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        name        TEXT    NOT NULL,
        email       TEXT    NOT NULL UNIQUE,
        password    TEXT    NOT NULL,
        role        TEXT    NOT NULL DEFAULT 'admin',
        avatar      TEXT,
        created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS agents (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        name        TEXT    NOT NULL,
        title       TEXT    NOT NULL DEFAULT 'Property Advisor',
        email       TEXT    NOT NULL,
        phone       TEXT,
        experience  TEXT,
        deals       INTEGER NOT NULL DEFAULT 0,
        rating      REAL    NOT NULL DEFAULT 5.0,
        img         TEXT,
        created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS properties (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        name          TEXT    NOT NULL,
        slug          TEXT    NOT NULL UNIQUE,
        tagline       TEXT,
        location      TEXT    NOT NULL,
        full_address  TEXT,
        price         TEXT    NOT NULL,
        price_night   TEXT,
        beds          INTEGER NOT NULL DEFAULT 1,
        baths         INTEGER NOT NULL DEFAULT 1,
        sqft          INTEGER NOT NULL DEFAULT 0,
        garage        INTEGER NOT NULL DEFAULT 0,
        floors        INTEGER NOT NULL DEFAULT 1,
        year_built    INTEGER,
        type          TEXT    NOT NULL DEFAULT 'Villa',
        status        TEXT    NOT NULL DEFAULT 'For Sale',
        badge         TEXT    NOT NULL DEFAULT 'New',
        badge_color   TEXT    NOT NULL DEFAULT 'bg-green-500',
        tag           TEXT    NOT NULL DEFAULT 'Premium',
        rating        REAL    NOT NULL DEFAULT 0,
        reviews       INTEGER NOT NULL DEFAULT 0,
        description   TEXT,
        highlights    TEXT    DEFAULT '[]',
        amenities     TEXT    DEFAULT '{}',
        property_tax  TEXT,
        hoa           TEXT,
        lot_size      TEXT,
        lat           REAL,
        lng           REAL,
        main_img      TEXT,
        gallery       TEXT    DEFAULT '[]',
        views         INTEGER NOT NULL DEFAULT 0,
        agent_id      INTEGER REFERENCES agents(id),
        is_featured   INTEGER NOT NULL DEFAULT 0,
        created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
        updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS property_views (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
        viewed_at   TEXT    NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS inquiries (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
        name        TEXT    NOT NULL,
        email       TEXT    NOT NULL,
        phone       TEXT,
        message     TEXT,
        date_pref   TEXT,
        status      TEXT    NOT NULL DEFAULT 'new',
        created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
      );
    `)

    // Seed Admin (SQLite)
    const adminExists = sqliteDb.prepare('SELECT id FROM admins WHERE email = ?').get('admin@primenest.com')
    if (!adminExists) {
      const hash = bcrypt.hashSync('admin123', 10)
      sqliteDb.prepare(`
        INSERT INTO admins (name, email, password, role)
        VALUES (?, ?, ?, ?)
      `).run('Super Admin', 'admin@primenest.com', hash, 'superadmin')
    }

    // Seed Agent (SQLite)
    const agentExists = sqliteDb.prepare('SELECT id FROM agents WHERE email = ?').get('marcus@primenest.com')
    let agentId = agentExists?.id
    if (!agentExists) {
      const info = sqliteDb.prepare(`
        INSERT INTO agents (name, title, email, phone, experience, deals, rating, img)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run('Marcus Wainwright', 'Senior Property Advisor', 'marcus@primenest.com', '+1 (646) 555-0134', '12 years', 340, 4.9, '/agent_photo.png')
      agentId = info.lastInsertRowid
    }

    // Seed Properties (SQLite)
    const propExists = sqliteDb.prepare('SELECT id FROM properties LIMIT 1').get()
    if (!propExists) {
      sqliteDb.prepare(`
        INSERT INTO properties (
          name, slug, tagline, location, full_address, price, price_night,
          beds, baths, sqft, garage, floors, year_built, type, status,
          badge, badge_color, tag, rating, reviews, description,
          highlights, amenities, property_tax, hoa, lot_size,
          lat, lng, main_img, gallery, is_featured, agent_id
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `).run(
        'Radha Kund Integrated Township',
        'radha-kund-township',
        'Where Nature Is Not An Amenity. It\'s The Core.',
        'Goverdhan, Vrindavan',
        'Radha Kund Ring Road, Goverdhan (Vrindavan), Uttar Pradesh, India',
        '₹ 59.85 Lakhs Onwards',
        '₹ 45,000/Sq.Yd',
        133, 0, 1197, 0, 1, 2026, 'Plot', 'For Sale',
        'MVDA Approved', 'bg-emerald-600', 'Premium', 4.95, 142,
        'Radha Kund is a landmark 78-Acre Integrated Township where nature is the core. Meticulously designed around preservation, the layout features 9.9 Acres of central greens—nearly 2.5 times the size of Nidhivan—connected by a continuous green loop linking residences, resort, and lifestyle spaces.',
        JSON.stringify([
          'License received from MVDA',
          '9.9 Acres of Central Greens (Nearly 2.5X size of Nidhivan)',
          'Continuous Green Loop connecting residences and resort',
          'Designed by Padma Bhushan Hafeez Contractor',
          'Expression of Interest (EOI) at ₹3 Lakh onwards'
        ]),
        JSON.stringify({
          'Nature & Core': ['9.9 Acres Central Green', 'Continuous Green Loop', 'Reflecting Lotus Pools', 'Themed Gardens'],
          'Security': ['24/7 Security managed by MNC PMC', 'CCTV monitoring', 'Gated Perimeter'],
          'Infrastructure': ['Underground cabling', 'Wide Internal Roads', 'LED street lights']
        }),
        '₹ 12,000 / yr', '₹ 1,500 / mo', '133 & 150 Sq. Yd',
        27.525, 77.412, '/property_villa.png',
        JSON.stringify([
          { src: '/property_villa.png', label: 'Main Entrance Plaza' },
          { src: '/interior_living.png', label: 'Resort Amenities' },
          { src: '/interior_pool.png', label: 'Luxury Resort Pool' }
        ]),
        1, agentId
      )

      sqliteDb.prepare(`
        INSERT INTO properties (
          name, slug, tagline, location, full_address, price, price_night,
          beds, baths, sqft, garage, floors, year_built, type, status,
          badge, badge_color, tag, rating, reviews, description,
          highlights, amenities, property_tax, hoa, lot_size,
          lat, lng, main_img, gallery, is_featured, agent_id
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `).run(
        'Shri Vrinda Aaradhya Plots',
        'shri-vrinda-aaradhya',
        'Modern Comfort in a Holy City.',
        'Radha Rani Brajdhara, Barsana',
        'Radha Rani Brajdhara, Barsana, Uttar Pradesh, India',
        'Special Pre-Launch Pricing',
        'First Come, First Serve',
        150, 0, 1350, 0, 1, 2026, 'Plot', 'Coming Soon',
        'Coming Soon', 'bg-amber-500', 'Premium', 4.99, 86,
        'Shri Vrinda Aaradhya offers limited plots at special pre-launch prices on a first-come, first-serve basis. Nestled in the sacred town of Barsana, Aaradhya blends modern comfort with spiritual serenity.',
        JSON.stringify([
          'Located in Radha Rani Brajdhara, Barsana',
          'Special Pre-Launch Prices',
          'Modern comfort integrated in a holy city',
          'Limited inventory (First come, first serve)'
        ]),
        JSON.stringify({
          'Comforts': ['Spiritual meditation halls', 'Traditional lotus reflecting pools', 'Lush green pathways'],
          'Services': ['Grand decorative gateways', 'Managed visitor lounges', '24/7 security']
        }),
        'N/A', 'N/A', 'Flexible Sizes',
        27.435, 77.378, '/property_penthouse.png',
        JSON.stringify([
          { src: '/property_penthouse.png', label: 'Aaradhya Villas view' },
          { src: '/interior_living.png', label: 'Lotus pool courtyard' },
          { src: '/interior_pool.png', label: 'Divine sunset pavilion' }
        ]),
        1, agentId
      )
    }
  }

  console.log('✓ Database initialized successfully')
}

module.exports = { ...db, initDB }
