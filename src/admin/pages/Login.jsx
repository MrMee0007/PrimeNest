import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Home, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../AuthContext'

export default function AdminLogin() {
  const { login }   = useAuth()
  const navigate    = useNavigate()
  const [form, setForm]     = useState({ email: 'admin@primenest.com', password: 'admin123' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/admin')
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to server. Make sure the backend is running on port 5001.')
      } else {
        setError(err.response?.data?.error || 'Login failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #111827 50%, #0a0a0a 100%)',
      }}
    >
      {/* Decorative blobs — pointer-events: none so they NEVER block clicks */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          pointerEvents: 'none', zIndex: 0,
        }}
      >
        <div style={{
          position: 'absolute', top: '-10%', left: '20%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,158,11,0.12), transparent 70%)',
          filter: 'blur(60px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '5%', right: '15%',
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.08), transparent 70%)',
          filter: 'blur(60px)',
        }} />
      </div>

      {/* Card — relative + z-index ensures it's above background blobs */}
      <div
        style={{
          position: 'relative', zIndex: 1,
          width: '100%', maxWidth: 440,
          background: '#111827',
          borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
          overflow: 'hidden',
        }}
      >
        {/* Amber top stripe */}
        <div style={{ height: 3, background: 'linear-gradient(90deg, #F59E0B, #FCD34D, #D97706)' }} />

        <div style={{ padding: '2rem' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, background: '#F59E0B',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Home size={20} color="white" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'white', fontSize: 18, lineHeight: 1.2 }}>
                Prime<span style={{ color: '#F59E0B' }}>Nest</span>
              </div>
              <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>Admin Portal</div>
            </div>
          </div>

          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 4 }}>Welcome back</h1>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 24 }}>Sign in to access your dashboard</p>

          {/* Error banner */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 8,
              background: 'rgba(153,27,27,0.25)', border: '1px solid rgba(239,68,68,0.35)',
              borderRadius: 12, padding: '10px 14px', marginBottom: 16,
            }}>
              <AlertCircle size={16} color="#F87171" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 13, color: '#FCA5A5', margin: 0, lineHeight: 1.5 }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#6B7280" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@primenest.com"
                  required
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    paddingLeft: 38, paddingRight: 14, paddingTop: 11, paddingBottom: 11,
                    background: '#1F2937', border: '1px solid #374151',
                    borderRadius: 12, fontSize: 14, color: 'white',
                    outline: 'none', transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#F59E0B'}
                  onBlur={e => e.target.style.borderColor = '#374151'}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#6B7280" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    paddingLeft: 38, paddingRight: 44, paddingTop: 11, paddingBottom: 11,
                    background: '#1F2937', border: '1px solid #374151',
                    borderRadius: 12, fontSize: 14, color: 'white',
                    outline: 'none', transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#F59E0B'}
                  onBlur={e => e.target.style.borderColor = '#374151'}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                    color: '#6B7280', display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px',
                background: loading ? '#D97706' : '#F59E0B',
                border: 'none', borderRadius: 12,
                fontSize: 14, fontWeight: 700, color: '#111827',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                marginTop: 4, transition: 'background 0.2s, transform 0.1s',
                opacity: loading ? 0.8 : 1,
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#D97706' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#F59E0B' }}
              onMouseDown={e => { if (!loading) e.currentTarget.style.transform = 'scale(0.98)' }}
              onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)' }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Signing in...
                </>
              ) : 'Sign In →'}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div style={{
            marginTop: 20, padding: '10px 14px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 12, textAlign: 'center',
          }}>
            <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>
              Demo: <span style={{ color: '#F59E0B', fontFamily: 'monospace' }}>admin@primenest.com</span>
              {' '}/ <span style={{ color: '#F59E0B', fontFamily: 'monospace' }}>admin123</span>
            </p>
          </div>
        </div>
      </div>

      {/* Spin keyframe */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
