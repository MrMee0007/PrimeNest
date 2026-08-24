import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Calendar, Layers, CheckSquare, Key, ChevronRight } from 'lucide-react'

const steps = [
  {
    icon: Calendar,
    step: '25%',
    title: 'Till 15 May',
    desc: 'Initial booking amount for plot priority selection and launch benefit lock-in.',
    color: 'bg-amber-50',
    iconColor: 'text-amber-700',
    border: 'border-amber-200',
  },
  {
    icon: Layers,
    step: '25%',
    title: 'After 5-6 Months / DPR',
    desc: 'Due upon release of the Detailed Project Report (DPR) and launch of foundation works.',
    color: 'bg-orange-50',
    iconColor: 'text-orange-700',
    border: 'border-orange-200',
  },
  {
    icon: CheckSquare,
    step: '25%',
    title: 'On Layout Approval',
    desc: 'Payable immediately following the official MVDA layout plan approval.',
    color: 'bg-yellow-50',
    iconColor: 'text-yellow-700',
    border: 'border-yellow-200',
  },
  {
    icon: Key,
    step: '25%',
    title: 'At RERA Registry',
    desc: 'Final installment paid at the time of RERA registration and physical possession handover.',
    color: 'bg-emerald-50',
    iconColor: 'text-emerald-700',
    border: 'border-emerald-200',
  },
]

export default function HowItWorks() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="payment-plan" ref={ref} className="section-pad bg-gray-50/50"
      style={{ background: 'linear-gradient(180deg, #F9FAFB 0%, #ffffff 100%)' }}
    >
      <div className="container-main">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <div className="section-label">PAYMENT CONVENIENCE</div>
          <h2 className="heading-lg mb-3">
            Structured <span className="text-amber-600">Payment Plan*</span>
          </h2>
          <p className="body-sm max-w-lg mx-auto">
            Book now with a friendly Expression of Interest (EOI) starting from <span className="font-bold text-gray-900">₹3 Lakh onwards</span>. Enter before the next rise.
          </p>
        </motion.div>

        {/* Steps grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gray-200 -z-0 pointer-events-none">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : {}}
              transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.4 }}
              className="origin-left h-full bg-gradient-to-r from-amber-400 to-emerald-400"
            />
          </div>

          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.12, duration: 0.55, ease: 'easeOut' }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="relative bg-white rounded-2xl p-6 shadow-card border border-gray-100 hover:border-amber-200 hover:shadow-card-lg transition-all duration-300 cursor-default"
            >
              {/* Step number */}
              <div className="flex items-center justify-between mb-5">
                <div className={`w-12 h-12 rounded-xl ${step.color} border ${step.border} flex items-center justify-center z-10`}>
                  <step.icon className={`w-5 h-5 ${step.iconColor}`} />
                </div>
                <span className="text-3xl font-black text-amber-700 select-none leading-none z-10">
                  {step.step}
                </span>
              </div>

              <h3 className="font-bold text-gray-900 text-base mb-2 leading-snug">
                {step.title}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {step.desc}
              </p>

              {/* Arrow connector badge (mobile) */}
              {i < steps.length - 1 && (
                <div className="lg:hidden absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-amber-100 border-2 border-white flex items-center justify-center z-10">
                  <ChevronRight className="w-3 h-3 text-amber-500 rotate-90" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA & note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
          className="text-center mt-12"
        >
          <p className="text-xs text-gray-400 mb-6 italic">*Terms & Conditions apply. Prices, plans, specifications & availability are subject to change without prior notice.</p>
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.04, boxShadow: '0 8px 25px rgba(245,158,11,0.38)' }}
            whileTap={{ scale: 0.96 }}
            className="btn-primary inline-flex shadow-amber uppercase tracking-wider font-bold text-xs"
          >
            Submit Expression of Interest (EOI)
            <ChevronRight className="w-4 h-4" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}
