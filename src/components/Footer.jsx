import { motion } from 'framer-motion'
import { ArrowUp, Mail, Phone, MapPin } from 'lucide-react'

const cols = {
  Project:    ['Radha Kund Vision', 'Hafeez Contractor Design', 'MVDA License Info', 'Appreciation Trends', 'Plot Layout Options'],
  Developers: ['K.Sons Legacy', 'Shri Vrinda Profile', 'Our Commitments', 'Partnerships', 'Careers'],
  Legal:      ['RERA Handover Check', 'Possession Policy', 'Privacy Policy', 'Terms of Use', 'Disclaimer Policy'],
  BrajRegion: ['Goverdhan Heritage', 'Vrindavan Temples', 'Barsana Guides', 'Mathura Routes', 'Connectivity Details'],
}

const socials = [
  { label: 'FB', href: '#' },
  { label: 'IG', href: '#' },
  { label: 'LI', href: '#' },
  { label: 'YT', href: '#' },
]

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Top Section */}
        <div className="grid lg:grid-cols-5 gap-10 py-16 border-b border-gray-800">

          {/* Brand Info */}
          <div className="lg:col-span-1">
            <div className="flex flex-col gap-1 mb-4">
              <span className="font-extrabold text-sm text-white tracking-tight leading-none">
                K.<span className="text-amber-400">SONS</span>
              </span>
              <span className="text-[8px] text-gray-500 font-semibold tracking-wider mb-2">CREATING VALUE</span>
              
              <span className="font-extrabold text-sm text-white tracking-tight leading-none">
                SHRI <span className="text-amber-400">VRINDA</span>
              </span>
              <span className="text-[8px] text-gray-500 font-semibold tracking-wider">LET\'S BUILD TOGETHER</span>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed mb-5">
              Landmark developments in the sacred corridors of Braj. Own land where belief translates into high appreciation value.
            </p>

            {/* Contact details */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 hover:text-amber-400 transition-colors cursor-pointer">
                <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                +91 99999 88888
              </div>
              <div className="flex items-center gap-2 hover:text-amber-400 transition-colors cursor-pointer">
                <Mail className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                advisory@shrivrinda.com
              </div>
              <div className="flex items-start gap-2 text-gray-500">
                <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                Radha Kund Ring Road, Goverdhan (Vrindavan), UP, India
              </div>
            </div>

            {/* Social handles */}
            <div className="flex gap-2 mt-5">
              {socials.map((s) => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  whileHover={{ scale: 1.12, backgroundColor: '#F59E0B', color: 'white' }}
                  className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-xs font-bold text-gray-400 transition-colors border border-gray-800"
                >
                  {s.label}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Dynamic Link columns */}
          {Object.entries(cols).map(([heading, links]) => (
            <div key={heading}>
              <div className="text-white text-xs font-bold mb-4 uppercase tracking-widest">{heading}</div>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-xs text-gray-500 hover:text-amber-400 transition-colors duration-150"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Disclaimer / Bottom legal text */}
        <div className="py-6 border-b border-gray-900">
          <p className="text-[10px] text-gray-600 leading-relaxed text-justify">
            *DISCLAIMER: PRICES, PLANS, SPECIFICATIONS & AVAILABILITY ARE SUBJECT TO CHANGE WITHOUT PRIOR NOTICE. T&CS APPLY. DISTANCES ARE APPROXIMATE AND MEASURED AS STRAIGHT-LINE DISTANCES. ARTISTIC IMPRESSIONS SHOW ARCHITECTURAL DESIGNS INTENDED FOR GENERAL VISUALIZATION AND MIGHT NOT FULLY REPRESENT ACTUAL HANDOVER CONDITIONS. ALL REAL ESTATE INVESTMENTS CARRY GROWTH RISKS.
          </p>
        </div>

        {/* Copyright and back to top */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
          <p className="text-xs text-gray-600">
            © 2026 K.Sons & Shri Vrinda. All rights reserved. Developed under license from MVDA.
          </p>

          <motion.button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
          >
            Back to top <ArrowUp className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>
    </footer>
  )
}
