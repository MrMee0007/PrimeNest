import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const stats = [
  { value: 78, suffix: ' Acres', label: 'Integrated Township' },
  { value: 3.6, suffix: 'x', label: 'Appreciation Seen', decimals: 1 },
  { value: 133, suffix: ' Sq. Yd+', label: 'Premium Plot Sizes' },
  { value: 3.37, suffix: ' L Sq. Ft', label: 'Luxury Resort & Amenities', decimals: 2 },
]

function Counter({ end, suffix, active, decimals = 0 }) {
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (!active) return
    let start = 0
    const duration = 1200 // ms
    const steps = 40
    const stepTime = duration / steps
    const increment = end / steps

    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setVal(end)
        clearInterval(timer)
      } else {
        setVal(start)
      }
    }, stepTime)

    return () => clearInterval(timer)
  }, [active, end])

  return (
    <>
      {val.toFixed(decimals)}
      {suffix}
    </>
  )
}

export default function StatsBar() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="border-y border-gray-100 bg-white shadow-sm relative z-20">
      <div className="container-main">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="flex flex-col items-center text-center py-7 px-4"
            >
              <div className="text-2xl md:text-3xl font-extrabold text-amber-800 mb-1 tabular-nums">
                <Counter end={s.value} suffix={s.suffix} active={inView} decimals={s.decimals} />
              </div>
              <div className="text-xs md:text-sm text-gray-500 font-medium uppercase tracking-wider">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
