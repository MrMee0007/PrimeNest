import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { CheckCircle2, ChevronRight, Trees, Leaf, Heart } from 'lucide-react'

const features = [
  { 
    icon: Trees, 
    title: '9.9 Acres of Central Green', 
    desc: 'Nearly 2.5X the size of Nidhivan, providing a sacred oasis of peace and nature.' 
  },
  { 
    icon: Leaf, 
    title: 'A Continuous Green Loop', 
    desc: 'A flowing landscape corridor seamlessly connecting residences, resort, and lifestyle spaces.' 
  },
]

const checks = [
  'MVDA Licensed Integrated Township',
  'Exclusive Pre-Launch Benefit: ₹45,000 / Sq. Yd*',
  'Plot Sizes: 133 Sq. Yd | 150 Sq. Yd',
  'EOI starting from ₹3 Lakh onwards',
]

export default function Commitment() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="about" ref={ref} className="section-pad bg-white overflow-hidden">
      <div className="container-main">
        <div className="grid lg:grid-cols-12 gap-16 items-center">

          {/* Left Column — Elegant Minimalist Image (5 cols) */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="lg:col-span-5 relative"
          >
            <div className="absolute -top-6 -left-6 w-full h-full rounded-3xl bg-amber-50/50 -z-10" />

            <div className="relative rounded-2xl overflow-hidden shadow-card-lg border border-amber-100/50 bg-white p-3">
              <img
                src="/interior_bedroom.png"
                alt="Radha Kund Central Green Vista"
                className="w-full h-[460px] object-cover rounded-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/40 via-transparent to-transparent rounded-xl" />
              
              <div className="absolute bottom-6 left-6 right-6 text-white text-center">
                <div className="text-[10px] text-amber-400 uppercase tracking-widest font-extrabold mb-1">Own Land Surrounded By Living Greens</div>
                <div className="font-serif italic text-lg leading-tight">Radha Kund Integrated Township</div>
              </div>
            </div>
          </motion.div>

          {/* Right Column — Vision and Details (7 cols) */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
            className="lg:col-span-7"
          >
            <div className="section-label">THE ECOSYSTEM</div>
            <h2 className="heading-lg mb-4 text-gray-900 leading-tight">
              Where Nature Is Not An Amenity.<br />
              <span className="text-amber-600">It’s The Core.</span>
            </h2>
            <div className="divider mb-6" />
            
            <p className="body-lg mb-8 text-gray-600 leading-relaxed">
              At Radha Kund, living green is a philosophy. Meticulously designed around preservation, the township features massive central landscapes and natural loop systems.
            </p>

            {/* Core Features */}
            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 15 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="bg-gray-50 border border-gray-100 rounded-xl p-4.5 shadow-sm hover:border-amber-200 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-100/60 flex items-center justify-center mb-3 shrink-0">
                    <f.icon className="w-5 h-5 text-amber-800" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1.5">{f.title}</h3>
                  <p className="text-[11px] text-gray-500 leading-normal">{f.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Checklist */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {checks.map((c) => (
                <div key={c} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-xs font-semibold text-gray-700 leading-tight">{c}</span>
                </div>
              ))}
            </div>

            <motion.a
              href="#listings"
              whileHover={{ scale: 1.02, boxShadow: '0 8px 25px rgba(245,158,11,0.25)' }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary inline-flex"
            >
              Learn More
              <ChevronRight className="w-4 h-4" />
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
