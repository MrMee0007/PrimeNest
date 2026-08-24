import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Mail, Phone, User, CheckCircle2, Send } from 'lucide-react'

export default function Newsletter() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', plotSize: '133 Sq. Yd' })
  const [done, setDone] = useState(false)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.phone) return
    setDone(true)
    setForm({ name: '', email: '', phone: '', plotSize: '133 Sq. Yd' })
    setTimeout(() => setDone(false), 4000)
  }

  return (
    <section id="contact" ref={ref} className="section-pad bg-white">
      <div className="container-main">
        <div className="grid lg:grid-cols-12 gap-10 items-center">

          {/* Left Column — Value Propositions (5 cols) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5"
          >
            <div className="section-label">EARLY ADVANTAGE</div>
            <h2 className="heading-lg mb-4">
              Secure Your{' '}
              <span className="text-amber-600">Early Access</span>
            </h2>
            <p className="body-lg mb-6 text-gray-600">
              Submit your Expression of Interest (EOI) starting from <span className="font-bold text-gray-900">₹3 Lakh onwards</span> and claim exclusive pre-launch benefits.
            </p>

            <div className="space-y-3.5">
              {[
                'Exclusive pre-launch benefit: ₹45,000 / Sq. Yd*',
                'First-choice priority layout plot selection',
                'Flexible 25% structured payment milestones',
                'Direct advisor tour support on site location',
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <span className="text-sm font-semibold text-gray-700 leading-tight">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column — EOI Form Box (7 cols) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-7"
          >
            <div className="bg-gray-50 rounded-3xl p-6 md:p-8 border border-gray-100 relative overflow-hidden shadow-sm">
              <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-amber-50 pointer-events-none" />

              <div className="relative mb-6 rounded-xl overflow-hidden h-36 border border-amber-100">
                <img
                  src="/property_cottage.png"
                  alt="Radha Kund Vrindavan Resort Grounds"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 to-transparent" />
                <div className="absolute bottom-3 left-4 text-white">
                  <div className="text-[10px] text-amber-400 uppercase tracking-widest font-extrabold mb-0.5">Pre-Launch Plots</div>
                  <div className="text-sm font-bold">Radha Kund Integrated Township — 133 & 150 Sq. Yd</div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Full Name</label>
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-1.5 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/10 transition-all">
                      <User className="w-4 h-4 text-gray-400 shrink-0" />
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        placeholder="Your Name"
                        required
                        className="w-full py-1.5 text-sm text-gray-800 placeholder-gray-400 bg-transparent outline-none"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Phone Number</label>
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-1.5 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/10 transition-all">
                      <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value })}
                        placeholder="Mobile Number"
                        required
                        className="w-full py-1.5 text-sm text-gray-800 placeholder-gray-400 bg-transparent outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Email Address</label>
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-1.5 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/10 transition-all">
                      <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        placeholder="Email ID"
                        className="w-full py-1.5 text-sm text-gray-800 placeholder-gray-400 bg-transparent outline-none"
                      />
                    </div>
                  </div>

                  {/* Plot size choice */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Preferred Plot Size</label>
                    <select
                      value={form.plotSize}
                      onChange={e => setForm({ ...form, plotSize: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-amber-500 transition-all cursor-pointer"
                    >
                      <option>133 Sq. Yd</option>
                      <option>150 Sq. Yd</option>
                      <option>188 Sq. Yd</option>
                      <option>250 Sq. Yd</option>
                      <option>Other / Flexible</option>
                    </select>
                  </div>
                </div>

                {/* Submit button */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01, boxShadow: '0 8px 25px rgba(245,158,11,0.3)' }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2 uppercase tracking-wider shadow-sm"
                >
                  {done ? (
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> EOI Submitted Successfully!
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-3.5 h-3.5" /> Submit Expression of Interest
                    </span>
                  )}
                </motion.button>

                <p className="text-[10px] text-gray-400 text-center">
                  *By submitting, you agree to receive official callbacks from K.Sons & Shri Vrinda advisory team.
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
