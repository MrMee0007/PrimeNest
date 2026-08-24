import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronDown } from 'lucide-react'

const navLinks = [
  { label: 'Radha Kund', href: '#about' },
  { label: 'Plots & Pricing', href: '#listings' },
  { label: 'Proximity Map', href: '#map' },
  { label: 'Payment Plan', href: '#payment-plan' },
  { label: 'Amenities', href: '#amenities' },
  { label: 'Contact Us', href: '#contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled ? 'navbar-blur border-b border-gray-200/60 shadow-sm py-3' : 'bg-white/95 py-4'
        }`}
      >
        <div className="container-main flex items-center justify-between">
          {/* Logo Branding */}
          <a href="/" className="flex items-center gap-3 shrink-0">
            <div className="flex flex-col">
              <span className="font-extrabold text-sm text-gray-800 tracking-tight leading-none">
                K.<span className="text-amber-500">SONS</span>
              </span>
              <span className="text-[9px] text-gray-400 font-semibold tracking-wider">CREATING VALUE</span>
            </div>
            <div className="w-[1px] h-6 bg-gray-300" />
            <div className="flex flex-col">
              <span className="font-extrabold text-sm text-gray-800 tracking-tight leading-none">
                SHRI <span className="text-amber-500">VRINDA</span>
              </span>
              <span className="text-[8px] text-gray-400 font-semibold tracking-wider">LET'S BUILD TOGETHER</span>
            </div>
          </a>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="flex items-center gap-0.5 px-3.5 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-amber-600 hover:bg-amber-50/50 transition-all duration-150 group"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right actions */}
          <div className="hidden lg:flex items-center gap-3">
            <a href="/admin/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-2">
              Admin Login
            </a>
            <motion.a
              href="#contact"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary shadow-amber text-white text-sm"
            >
              Secure Early Access
            </motion.a>
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed top-[60px] inset-x-0 z-40 bg-white border-b border-gray-200 overflow-hidden lg:hidden"
          >
            <div className="container-main py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-3 border-t border-gray-100 mt-2 flex flex-col gap-2">
                <a href="/admin/login" className="text-center text-sm font-medium text-gray-600 hover:text-gray-900 py-2">
                  Admin Login
                </a>
                <a href="#contact" className="btn-primary w-full justify-center mt-1">
                  Secure Early Access
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
