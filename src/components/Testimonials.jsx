import { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'First-time Buyer · Austin, TX',
    avatar: '👩',
    rating: 5,
    quote:
      "PrimeNest made buying our first home completely stress-free. Their agents walked us through everything — we felt like we had a trusted friend in the industry the whole time.",
    property: 'Socha Heartland Villas',
    color: 'from-amber-50 to-orange-50',
  },
  {
    id: 2,
    name: 'Michael Torres',
    role: 'Real Estate Investor · Miami, FL',
    avatar: '👨‍💼',
    rating: 5,
    quote:
      "I've worked with many agencies over the years. PrimeNest stands out with their transparent pricing, lightning-fast response and premium listings I simply couldn't find elsewhere.",
    property: 'Mykonos Damac Lagoons',
    color: 'from-blue-50 to-indigo-50',
  },
  {
    id: 3,
    name: 'Priya Sharma',
    role: 'Relocation Buyer · London, UK',
    avatar: '👩‍🦱',
    rating: 5,
    quote:
      "Moving countries is daunting, but PrimeNest's virtual tours and dedicated support made it seamless. We found our perfect home in Geneva without even visiting first!",
    property: 'Verdana 2 Residence',
    color: 'from-green-50 to-teal-50',
  },
]

export default function Testimonials() {
  const [idx, setIdx] = useState(0)
  const [dir, setDir] = useState(1)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const navigate = (d) => {
    setDir(d)
    setIdx((prev) => (prev + d + testimonials.length) % testimonials.length)
  }

  const t = testimonials[idx]

  return (
    <section id="testimonials" ref={ref} className="section-pad bg-gray-50/60">
      <div className="container-main">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-14"
        >
          <div className="section-label">Social Proof</div>
          <h2 className="heading-lg mb-3">
            Customer <span className="text-amber-500">Testimonials</span>
          </h2>
          <p className="body-sm max-w-sm mx-auto">
            Thousands of happy homeowners — here's what they say.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {/* Testimonial card */}
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={idx}
              custom={dir}
              initial={{ opacity: 0, x: dir * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -60 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
              <div className={`rounded-3xl p-8 md:p-12 bg-gradient-to-br ${t.color} border border-gray-100 shadow-card relative overflow-hidden`}>
                {/* Decorative quote */}
                <div className="absolute top-6 right-8 text-gray-200 opacity-60">
                  <Quote className="w-16 h-16" />
                </div>

                <div className="grid md:grid-cols-3 gap-8 items-center">
                  {/* Left — author */}
                  <div className="text-center md:text-left">
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="text-7xl mb-4 block"
                    >
                      {t.avatar}
                    </motion.div>

                    <div className="font-bold text-gray-900 text-lg mb-0.5">{t.name}</div>
                    <div className="text-xs text-gray-500 mb-3">{t.role}</div>

                    {/* Stars */}
                    <div className="flex gap-0.5 justify-center md:justify-start mb-4">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-amber-400 fill-current" />
                      ))}
                    </div>

                    {/* Property tag */}
                    <span className="inline-block text-xs font-semibold bg-white border border-amber-200 text-amber-700 px-3 py-1 rounded-full">
                      📍 {t.property}
                    </span>
                  </div>

                  {/* Right — quote */}
                  <div className="md:col-span-2">
                    <p className="text-gray-700 text-lg leading-relaxed font-medium italic">
                      "{t.quote}"
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="flex items-center justify-between mt-8">
            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setDir(i > idx ? 1 : -1); setIdx(i) }}
                  className="transition-all duration-300"
                >
                  <div
                    className="rounded-full transition-all duration-300"
                    style={{
                      width: i === idx ? '28px' : '8px',
                      height: '8px',
                      background: i === idx ? '#F59E0B' : '#D1D5DB',
                    }}
                  />
                </button>
              ))}
            </div>

            {/* Arrow buttons */}
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-full bg-white border border-gray-200 hover:border-amber-400 hover:text-amber-600 flex items-center justify-center text-gray-500 shadow-sm transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => navigate(1)}
                className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-600 flex items-center justify-center text-white shadow-sm transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Community row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-4 mt-10 pt-8 border-t border-gray-200"
          >
            <div className="flex -space-x-2.5">
              {['🧑','👩','👨','👩‍🦱','🧔','👧'].map((e, i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-base shadow-sm"
                >
                  {e}
                </div>
              ))}
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-bold text-gray-900">50,000+</span> homeowners trust PrimeNest
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
