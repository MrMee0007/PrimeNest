import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Building2, Users, MessageSquare,
  Settings, LogOut, Home, ChevronLeft, ChevronRight,
  Star, Bell
} from 'lucide-react'
import { useAuth } from './AuthContext'

const navItems = [
  { to: '/admin',            icon: LayoutDashboard, label: 'Dashboard',   exact: true },
  { to: '/admin/properties', icon: Building2,        label: 'Properties'  },
  { to: '/admin/agents',     icon: Users,            label: 'Agents'      },
  { to: '/admin/inquiries',  icon: MessageSquare,    label: 'Inquiries'   },
  { to: '/admin/settings',   icon: Settings,         label: 'Settings'    },
]

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const { admin, logout }         = useAuth()
  const navigate                  = useNavigate()

  const handleLogout = () => { logout(); navigate('/admin/login') }

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">

      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="relative flex flex-col bg-gray-900 border-r border-gray-800 shrink-0 overflow-hidden"
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-gray-800 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">
            <Home className="w-4.5 h-4.5 text-white" strokeWidth={2.5} style={{ width: 18, height: 18 }} />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="font-bold text-white text-base leading-none">Prime<span className="text-amber-400">Nest</span></div>
                <div className="text-[10px] text-gray-500 mt-0.5">Admin Portal</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`shrink-0 transition-colors ${collapsed ? 'w-5 h-5' : 'w-4.5 h-4.5'}`}
                    style={{ width: 18, height: 18 }}
                    color={isActive ? '#F59E0B' : undefined} />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="truncate">
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {/* Tooltip when collapsed */}
                  {collapsed && (
                    <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-gray-700">
                      {item.label}
                    </div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom — user card */}
        <div className="px-3 pb-4 border-t border-gray-800 pt-3">
          <div className={`flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-800 transition-colors ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-sm font-bold text-white shrink-0">
              {admin?.name?.[0] || 'A'}
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white truncate">{admin?.name}</div>
                  <div className="text-[10px] text-gray-500 truncate">{admin?.role}</div>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {!collapsed && (
                <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-900/20">
                  <LogOut className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-amber-500 transition-all z-10"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </motion.aside>

      {/* ── Main ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-gray-900/80 border-b border-gray-800 px-6 py-3.5 flex items-center justify-between shrink-0 backdrop-blur">
          <div className="text-sm text-gray-400">
            <a href="/" target="_blank" className="text-amber-400 hover:text-amber-300 transition-colors inline-flex items-center gap-1">
              ↗ View Live Site
            </a>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative w-9 h-9 rounded-xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full border border-gray-900" />
            </button>
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center font-bold text-sm text-white cursor-pointer">
              {admin?.name?.[0] || 'A'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-950 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
