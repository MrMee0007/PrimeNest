import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ChevronRight, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react'

export default function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const textY  = useTransform(scrollYProgress, [0, 1], ['0%', '15%'])
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-gray-50 via-white to-amber-50/10"
      style={{ paddingTop: '80px' }}
    >
      {/* Delicate grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #E5E7EB 0.5px, transparent 0.5px)`,
          backgroundSize: '32px 32px',
          opacity: 0.4,
        }}
      />

      <div className="container-main w-full py-16 relative z-10">
        <motion.div style={{ y: textY, opacity }} className="max-w-3xl mx-auto text-center">
          
          {/* Approved status badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-full px-4 py-1.5 mb-6"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-emerald-800 text-[10px] font-bold uppercase tracking-widest">MVDA Approved Gated Communities</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="font-serif italic text-4xl md:text-6xl text-gray-900 leading-tight tracking-tight mb-6"
          >
            Where Belief Translates <br />
            <span className="text-amber-600 font-serif">Into Value.</span>
          </motion.h1>

          {/* Subtext description */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-gray-500 text-base md:text-lg max-w-xl mx-auto leading-relaxed mb-8"
          >
            Meticulously planned township developments in the holy cities of Vrindavan and Barsana. Own land designed by Hafeez Contractor, surrounded by living greens.
          </motion.p>

          {/* Minimalist CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <a
              href="#listings"
              className="px-6 py-3 bg-gray-900 text-white hover:bg-gray-800 text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              Explore Projects
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <a
              href="#contact"
              className="px-6 py-3 border border-gray-200 hover:border-amber-500 hover:bg-amber-50/30 text-xs font-bold uppercase tracking-widest rounded-xl text-gray-700 hover:text-amber-800 transition-all"
            >
              Secure Early Access
            </a>
          </motion.div>

          {/* Quick minimal stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-gray-100"
          >
            {[
              { label: 'Radha Kund Township', detail: '78 Acres' },
              { label: 'Central Greens', detail: '9.9 Acres' },
              { label: 'Appreciation Growth', detail: '3.6x' },
              { label: 'New Barsana plots', detail: 'Aaradhya Launch' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-sm font-black text-gray-900">{stat.detail}</div>
                <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>

        </motion.div>
      </div>

      {/* Elegant fade out gradient */}
      <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  )
}
