import { useRef, useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { MapPin, Star, Heart, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { fetchProperties } from '../lib/api'

// ── Normalize API row → component shape ─────────────────────────────────────
function normalizeProperty(p) {
  return {
    id:         p.id,
    name:       p.name,
    slug:       p.slug,
    tagline:    p.tagline,
    location:   p.location,
    price:      p.price,
    badge:      p.badge,
    badgeColor: p.badge_color,
    mainImg:    p.main_img || '/property_villa.png',
    rating:     p.rating,
    status:     p.status,
    type:       p.type,
  }
}

function ProjectCard({ project, index }) {
  const [liked, setLiked] = useState(false)
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -6, boxShadow: '0 12px 30px rgba(0,0,0,0.06)' }}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100/80 shadow-sm cursor-pointer transition-all duration-300 flex flex-col justify-between"
      onClick={() => navigate(`/property/${project.id}`)}
    >
      <div className="relative overflow-hidden h-64 bg-gray-50">
        <img
          src={project.mainImg}
          alt={project.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          onError={e => { e.target.src = '/property_villa.png' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Badge */}
        <div className={`absolute top-4 left-4 ${project.badgeColor} text-white text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-lg shadow-sm`}>
          {project.badge}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => { e.stopPropagation(); setLiked(!liked) }}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-colors shadow-sm"
        >
          <Heart className="w-4 h-4 transition-colors"
            fill={liked ? '#EF4444' : 'none'}
            color={liked ? '#EF4444' : '#6B7280'} />
        </button>

        {/* Rating badge */}
        <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-white/95 rounded-lg px-2.5 py-1 shadow-sm text-amber-800 text-[10px] font-bold uppercase tracking-wider">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
          <span>Holy City Premium</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1 text-amber-700 text-xs font-bold uppercase tracking-wider mb-2">
            <MapPin className="w-3.5 h-3.5" />
            {project.location}
          </div>
          <h3 className="font-serif italic text-xl text-gray-900 mb-2 leading-tight">{project.name}</h3>
          <p className="text-xs text-gray-500 leading-relaxed mb-4">{project.tagline}</p>
        </div>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-gray-400 uppercase font-semibold">Pricing Advantage</div>
            <div className="text-sm font-extrabold text-amber-600">{project.price}</div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="text-xs font-bold text-gray-900 border border-gray-200 hover:border-amber-500 hover:bg-amber-50/50 px-4 py-2.5 rounded-xl transition-all"
          >
            View Details
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export default function FeaturedListings() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProperties({ featured: 1, limit: 10 })
      .then(data => {
        // data is { data: [...], total, page, pages }
        const rows = Array.isArray(data) ? data : (data.data || [])
        setProperties(rows.map(normalizeProperty))
      })
      .catch(err => {
        console.error('Failed to load properties:', err)
        setError('Could not load properties.')
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <section id="listings" ref={ref} className="section-pad bg-gray-50/30">
      <div className="container-main">
        <div className="text-center mb-12">
          <div className="section-label">FLAGSHIP DEVELOPMENTS</div>
          <h2 className="heading-lg">Masterpiece Townships</h2>
          <p className="body-sm mt-2 max-w-md mx-auto">
            Discover our premium integrated plot developments in Vrindavan and Barsana.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="text-center py-16 text-gray-400">
            <p>{error}</p>
          </div>
        )}

        {/* Properties grid */}
        {!loading && !error && properties.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto" style={{ perspective: '1000px' }}>
            {properties.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && properties.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">No featured properties yet. Add some from the admin panel.</p>
          </div>
        )}

        {/* Coming Soon Aaradhya Spotlight Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-100 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white text-xl shrink-0">
              🪶
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif italic text-lg text-gray-900 font-bold">Shri Vrinda Aaradhya</span>
                <span className="bg-amber-100 text-amber-800 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full">New Launch</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 max-w-md">
                Modern comfort in a holy city. Pre-launch plots starting in Barsana (Radha Rani Brajdhara). First come, first serve.
              </p>
            </div>
          </div>
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="py-3 px-6 bg-gray-900 text-white hover:bg-gray-800 rounded-xl text-xs font-bold uppercase tracking-wider shrink-0 transition-colors"
          >
            Register Interest
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}
