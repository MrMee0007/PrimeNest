import { motion, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { MapPin, Navigation, Compass, ChevronRight, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { fetchProperties } from '../lib/api'

const PROXIMITIES = [
  { destination: 'Goverdhan', distance: '4 Kms', desc: 'Divine temple center' },
  { destination: 'Mathura', distance: '14 Kms', desc: 'Birthplace of Lord Krishna' },
  { destination: 'Barsana', distance: '16 Kms', desc: 'Home of Radha Rani' },
  { destination: 'Vrindavan', distance: '18 Kms', desc: 'Sacred forest temples' },
  { destination: 'NH 19', distance: '20 Kms', desc: 'National Highway link' },
  { destination: 'Raya Cut', distance: '22 Kms', desc: 'Key Yamuna Expressway junction' },
]

function ProximityRoadmap() {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-amber-500/10 to-amber-950/20 rounded-2xl overflow-hidden p-6 border border-amber-100/50 flex flex-col justify-between min-h-[360px]">
      
      {/* Background Decorative Map Grid */}
      <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <pattern id="mapPattern" width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#78350F" />
            <path d="M 12 0 L 0 0 0 12" fill="none" stroke="#78350F" strokeWidth="0.2"/>
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#mapPattern)"/>
      </svg>

      <div className="relative z-10">
        <div className="flex items-center gap-2 text-amber-800 mb-4">
          <Compass className="w-5 h-5 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider">Crossroads Of Braj Connectivity</span>
        </div>

        {/* Central landmark card */}
        <div className="bg-white/95 border border-amber-200 rounded-xl p-4 shadow-md max-w-sm mb-6">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white font-bold shrink-0">
              📍
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900 leading-tight">Radha Kund Ring Road</div>
              <div className="text-[10px] text-gray-500 mt-0.5">Goverdhan, Vrindavan (MVDA Licensed Site)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Connectivity Roadmap Diagram */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {PROXIMITIES.map((p, i) => (
          <motion.div
            key={p.destination}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className="bg-white/80 backdrop-blur-sm border border-amber-100 rounded-xl p-3 shadow-sm hover:bg-white hover:border-amber-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="text-xs font-bold text-gray-800 leading-tight mb-0.5">{p.destination}</div>
              <div className="text-[9px] text-gray-400 leading-normal">{p.desc}</div>
            </div>
            <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-gray-100">
              <span className="text-[10px] text-amber-800 font-extrabold uppercase tracking-wide">Distance</span>
              <span className="text-xs font-black text-gray-900">{p.distance}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default function MapSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const navigate = useNavigate()
  const [nearby, setNearby] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProperties({ limit: 3 })
      .then(data => {
        const rows = Array.isArray(data) ? data : (data.data || [])
        setNearby(rows)
      })
      .catch(err => console.error('Failed to load nearby map properties:', err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section id="map" ref={ref} className="section-pad bg-white">
      <div className="container-main">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-12">
          <div className="section-label">STRATEGIC PROXIMITY</div>
          <h2 className="heading-lg mb-3">
            Sacred Roots. <span className="text-amber-600">Strategic Routes.</span>
          </h2>
          <p className="body-sm max-w-lg mx-auto">
            Situated at Vrindavan's highest appreciation corridor, Radha Kund puts you at the crossroads of the entire Braj region.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left - Roadmap Proximity grid (7 cols) */}
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6 }} className="lg:col-span-7 rounded-2xl overflow-hidden shadow-card">
            <ProximityRoadmap />
          </motion.div>

          {/* Right - Plot Listings / Info Cards (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4">
            <div className="space-y-3.5">
              <div className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-1">Available Plot Sizes & Pricing</div>
              
              {loading && (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                </div>
              )}

              {!loading && nearby.length === 0 && (
                <div className="text-center py-6 text-gray-400 text-xs">
                  No properties found.
                </div>
              )}

              {!loading && nearby.map((item, i) => (
                <motion.div key={item.id}
                  initial={{ opacity: 0, x: 24 }} animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                  whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
                  onClick={() => navigate(`/property/${item.id}`)}
                  className="flex items-center gap-4 bg-white rounded-xl p-3 border border-gray-100 hover:border-amber-200 transition-all cursor-pointer">
                  <div className="w-14 h-14 bg-amber-50 rounded-lg flex items-center justify-center font-bold text-amber-700 text-sm border border-amber-100 shrink-0">
                    📐 {item.lot_size || 'Plot'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-gray-900 truncate">{item.name}</span>
                    </div>
                    <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                      {item.price_night || 'pre-launch price'}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-amber-600">{item.price}</div>
                    <ChevronRight className="w-4 h-4 text-gray-300 ml-auto mt-0.5" />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Action Contact Button */}
            <motion.a
              href="#contact"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.01 }}
              className="py-3.5 bg-amber-500 hover:bg-amber-600 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2 uppercase tracking-wider shadow-sm"
            >
              <Navigation className="w-4 h-4" />
              Get Site Location coordinates
            </motion.a>
          </div>
        </div>
      </div>
    </section>
  )
}
