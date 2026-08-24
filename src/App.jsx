import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Lenis from 'lenis'

// ── Public site ──────────────────────────────────────────────────────────────
import Navbar          from './components/Navbar'
import Hero            from './components/Hero'
import StatsBar        from './components/StatsBar'
import Commitment      from './components/Commitment'
import FeaturedListings from './components/FeaturedListings'
import MapSection      from './components/MapSection'
import HowItWorks      from './components/HowItWorks'
import Testimonials    from './components/Testimonials'
import Newsletter      from './components/Newsletter'
import Footer          from './components/Footer'
import PropertyDetail  from './pages/PropertyDetail'

// ── Admin ─────────────────────────────────────────────────────────────────────
import { AuthProvider, useAuth } from './admin/AuthContext'
import AdminLayout     from './admin/AdminLayout'
import AdminLogin      from './admin/pages/Login'
import Dashboard       from './admin/pages/Dashboard'
import PropertiesPage  from './admin/pages/Properties'
import PropertyForm    from './admin/pages/PropertyForm'
import Inquiries       from './admin/pages/Inquiries'
import Agents          from './admin/pages/Agents'
import Settings        from './admin/pages/Settings'

// ── Smooth scroll ─────────────────────────────────────────────────────────────
function SmoothScroll({ children }) {
  const location = useLocation()
  useEffect(() => {
    // Only apply smooth scroll on public pages
    if (location.pathname.startsWith('/admin')) return
    const lenis = new Lenis({
      duration: 1.2,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf) }
    const id = requestAnimationFrame(raf)
    return () => { lenis.destroy(); cancelAnimationFrame(id) }
  }, [location.pathname])
  return children
}

// ── Protected admin route ────────────────────────────────────────────────────
function AdminRoute({ children }) {
  const { admin, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <svg className="animate-spin w-8 h-8 text-amber-400" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </div>
  )
  return admin ? children : <Navigate to="/admin/login" replace />
}

// ── Public home page ─────────────────────────────────────────────────────────
function HomePage() {
  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <Hero />
      <StatsBar />
      <Commitment />
      <FeaturedListings />
      <MapSection />
      <HowItWorks />
      <Testimonials />
      <Newsletter />
      <Footer />
    </div>
  )
}

// ── Property detail wrapper ───────────────────────────────────────────────────
function PropertyPage() {
  return (
    <div className="bg-white min-h-screen">
      <PropertyDetail />
      <Footer />
    </div>
  )
}

// ── Admin section ─────────────────────────────────────────────────────────────
function AdminSection() {
  return (
    <AdminRoute>
      <AdminLayout>
        <Routes>
          <Route index                    element={<Dashboard />} />
          <Route path="properties"        element={<PropertiesPage />} />
          <Route path="properties/new"    element={<PropertyForm />} />
          <Route path="properties/:id/edit" element={<PropertyForm />} />
          <Route path="inquiries"         element={<Inquiries />} />
          <Route path="agents"            element={<Agents />} />
          <Route path="settings"          element={<Settings />} />
        </Routes>
      </AdminLayout>
    </AdminRoute>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SmoothScroll>
          <Routes>
            {/* Public */}
            <Route path="/"              element={<HomePage />} />
            <Route path="/property/:id"  element={<PropertyPage />} />

            {/* Admin auth */}
            <Route path="/admin/login"   element={<AdminLogin />} />

            {/* Admin dashboard (nested routes) */}
            <Route path="/admin/*"       element={<AdminSection />} />

            {/* Fallback */}
            <Route path="*"              element={<Navigate to="/" replace />} />
          </Routes>
        </SmoothScroll>
      </AuthProvider>
    </BrowserRouter>
  )
}
