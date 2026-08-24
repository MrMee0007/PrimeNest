import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Key, Bell, Globe, Check, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuth } from '../AuthContext'
import api from '../api'

const inputCls = 'w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all'

const TABS = [
  { id: 'profile',   label: 'Profile',   icon: Globe },
  { id: 'security',  label: 'Security',  icon: Key },
  { id: 'notifications', label: 'Notifications', icon: Bell },
]

function Toast({ msg, type }) {
  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold border ${
        type === 'success' ? 'bg-green-900/90 border-green-700 text-green-300' : 'bg-red-900/90 border-red-700 text-red-300'
      }`}>
      {type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {msg}
    </motion.div>
  )
}

export default function Settings() {
  const { admin } = useAuth()
  const [tab, setTab] = useState('profile')
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Profile form
  const [profile, setProfile] = useState({
    name:  admin?.name  || '',
    email: admin?.email || '',
  })

  // Password form
  const [pw, setPw]        = useState({ current: '', new: '', confirm: '' })
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false })
  const [pwError, setPwError] = useState('')

  // Notifications
  const [notifs, setNotifs] = useState({
    newInquiry:   true,
    newListing:   false,
    weeklyReport: true,
    loginAlert:   true,
  })

  const handleProfileSave = async (e) => {
    e.preventDefault()
    showToast('Profile updated successfully!')
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPwError('')
    if (pw.new.length < 6)         { setPwError('New password must be at least 6 characters'); return }
    if (pw.new !== pw.confirm)     { setPwError('Passwords do not match'); return }
    try {
      await api.post('/auth/change-password', { currentPassword: pw.current, newPassword: pw.new })
      showToast('Password changed successfully!')
      setPw({ current: '', new: '', confirm: '' })
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to change password', 'error')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <AnimatePresence>{toast && <Toast {...toast} />}</AnimatePresence>

      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage your admin account and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
              tab === t.id ? 'bg-amber-500 text-gray-900' : 'text-gray-400 hover:text-white'
            }`}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">

        {/* Profile tab */}
        {tab === 'profile' && (
          <form onSubmit={handleProfileSave} className="p-6 space-y-4">
            {/* Avatar */}
            <div className="flex items-center gap-4 pb-4 border-b border-gray-800">
              <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center text-2xl font-bold text-white">
                {admin?.name?.[0] || 'A'}
              </div>
              <div>
                <div className="font-semibold text-white">{admin?.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">{admin?.role}</div>
                <div className="text-[10px] text-gray-600 mt-1">Joined {new Date(admin?.created_at || Date.now()).toLocaleDateString()}</div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Full Name</label>
              <input className={inputCls} value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Email Address</label>
              <input type="email" className={inputCls} value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} />
            </div>

            <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold text-sm rounded-xl transition-colors">
              Save Profile
            </motion.button>
          </form>
        )}

        {/* Security tab */}
        {tab === 'security' && (
          <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-800/60 rounded-xl border border-gray-700 mb-4">
              <Shield className="w-5 h-5 text-amber-400 shrink-0" />
              <p className="text-xs text-gray-400">Use a strong password with at least 6 characters, mixed case, and numbers.</p>
            </div>

            {pwError && (
              <div className="flex items-center gap-2 bg-red-900/30 border border-red-700/50 rounded-xl px-3 py-2 text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" /> {pwError}
              </div>
            )}

            {[
              { key: 'current', label: 'Current Password' },
              { key: 'new',     label: 'New Password' },
              { key: 'confirm', label: 'Confirm New Password' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">{label}</label>
                <div className="relative">
                  <input
                    type={showPw[key] ? 'text' : 'password'}
                    value={pw[key]}
                    onChange={e => setPw({ ...pw, [key]: e.target.value })}
                    className={`${inputCls} pr-10`}
                    placeholder="••••••••"
                    required
                  />
                  <button type="button" onClick={() => setShowPw(s => ({ ...s, [key]: !s[key] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                    {showPw[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}

            <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold text-sm rounded-xl transition-colors flex items-center gap-2">
              <Key className="w-4 h-4" /> Update Password
            </motion.button>
          </form>
        )}

        {/* Notifications tab */}
        {tab === 'notifications' && (
          <div className="p-6 space-y-3">
            {[
              { key: 'newInquiry',   label: 'New Inquiry Received',   desc: 'Get notified when a visitor submits a viewing request' },
              { key: 'newListing',   label: 'New Listing Added',       desc: 'Receive alerts when a property is published' },
              { key: 'weeklyReport', label: 'Weekly Analytics Report', desc: 'Summary of views, inquiries, and performance' },
              { key: 'loginAlert',   label: 'Login Alerts',            desc: 'Notify on new admin logins from unknown devices' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
                <div className="flex-1 min-w-0 mr-4">
                  <div className="text-sm font-medium text-white">{label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifs(n => ({ ...n, [key]: !n[key] }))}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${notifs[key] ? 'bg-amber-500' : 'bg-gray-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${notifs[key] ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
            ))}
            <motion.button type="button" onClick={() => showToast('Notification preferences saved!')}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="mt-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold text-sm rounded-xl transition-colors">
              Save Preferences
            </motion.button>
          </div>
        )}
      </div>

      {/* Danger zone */}
      {tab === 'security' && (
        <div className="bg-gray-900 rounded-2xl border border-red-900/40 overflow-hidden">
          <div className="px-5 py-3 border-b border-red-900/30 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-sm font-semibold text-red-400">Danger Zone</span>
          </div>
          <div className="p-5 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-white">Sign out of all sessions</div>
              <div className="text-xs text-gray-500 mt-0.5">Revoke all active JWT tokens immediately</div>
            </div>
            <button className="px-4 py-2 border border-red-700/50 text-red-400 hover:bg-red-900/20 rounded-xl text-xs font-semibold transition-colors">
              Sign Out All
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
