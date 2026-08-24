import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, Star, Phone, Mail, X, Save, AlertCircle, Check } from 'lucide-react'
import api from '../api'

const EMPTY = { name: '', title: 'Property Advisor', email: '', phone: '', experience: '', deals: 0, rating: 5.0, img: '' }

function AgentModal({ agent, onClose, onSave }) {
  const [form, setForm] = useState(agent || EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')
  const isEdit = Boolean(agent?.id)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email) { setError('Name and email are required'); return }
    setSaving(true)
    try {
      if (isEdit) {
        await api.put(`/agents/${agent.id}`, form)
      } else {
        await api.post('/agents', form)
      }
      onSave()
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 outline-none focus:border-amber-500 transition-all'

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <span className="font-semibold text-white text-sm">{isEdit ? 'Edit Agent' : 'Add New Agent'}</span>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {error && (
            <div className="flex items-center gap-2 bg-red-900/30 border border-red-700/50 rounded-xl px-3 py-2 text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Full Name *</label>
              <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Marcus Wainwright" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Title</label>
              <input className={inputCls} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Senior Property Advisor" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Email *</label>
              <input type="email" className={inputCls} value={form.email} onChange={e => set('email', e.target.value)} placeholder="agent@primenest.com" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Phone</label>
              <input className={inputCls} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+1 (646) 555-0100" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Experience</label>
              <input className={inputCls} value={form.experience} onChange={e => set('experience', e.target.value)} placeholder="12 years" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Deals Closed</label>
              <input type="number" min="0" className={inputCls} value={form.deals} onChange={e => set('deals', Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Rating (0-5)</label>
              <input type="number" min="0" max="5" step="0.1" className={inputCls} value={form.rating} onChange={e => set('rating', Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Photo URL</label>
              <input className={inputCls} value={form.img} onChange={e => set('img', e.target.value)} placeholder="/agent_photo.png" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-700 text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-gray-900 font-semibold text-sm rounded-xl transition-colors">
              {saving ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : isEdit ? 'Update Agent' : 'Add Agent'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default function Agents() {
  const [agents, setAgents]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(null)  // null | 'new' | agent object
  const [deleteId, setDeleteId] = useState(null)

  const load = () => {
    setLoading(true)
    api.get('/agents').then(r => setAgents(r.data)).catch(console.error).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const handleDelete = async () => {
    if (!deleteId) return
    await api.delete(`/agents/${deleteId}`)
    setDeleteId(null)
    load()
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Agents</h1>
          <p className="text-sm text-gray-400 mt-0.5">{agents.length} active advisors</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} onClick={() => setModal('new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold text-sm rounded-xl transition-colors">
          <Plus className="w-4 h-4" strokeWidth={2.5} /> Add Agent
        </motion.button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40 text-gray-500 text-sm">Loading...</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map(a => (
            <motion.div key={a.id}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900 rounded-2xl border border-gray-800 hover:border-gray-700 p-5 transition-all group"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="relative shrink-0">
                  {a.img ? (
                    <img src={a.img.startsWith('/uploads') ? `http://localhost:5001${a.img}` : a.img}
                      alt={a.name} className="w-14 h-14 rounded-xl object-cover object-top border border-gray-700" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center text-2xl font-bold text-amber-400">
                      {a.name[0]}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white truncate">{a.name}</div>
                  <div className="text-xs text-gray-400 truncate">{a.title}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 text-amber-400 fill-current" />
                    <span className="text-xs text-amber-400 font-semibold">{a.rating.toFixed(1)}</span>
                    <span className="text-[10px] text-gray-600">· {a.deals} deals</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 mb-4 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                  <span className="truncate">{a.email}</span>
                </div>
                {a.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                    <span>{a.phone}</span>
                  </div>
                )}
                {a.experience && (
                  <div className="text-gray-500 text-[10px] uppercase tracking-wide font-semibold">
                    {a.experience} experience
                  </div>
                )}
              </div>

              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setModal(a)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-700 hover:border-amber-500/50 text-gray-400 hover:text-amber-400 rounded-xl text-xs font-medium transition-all">
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => setDeleteId(a.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-700 hover:border-red-500/50 text-gray-400 hover:text-red-400 rounded-xl text-xs font-medium transition-all">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </motion.div>
          ))}
          {!agents.length && (
            <div className="col-span-3 text-center py-16 text-gray-500 text-sm">
              No agents yet. <button onClick={() => setModal('new')} className="text-amber-400 hover:underline">Add the first one!</button>
            </div>
          )}
        </div>
      )}

      {/* Agent modal */}
      <AnimatePresence>
        {modal && (
          <AgentModal
            agent={modal === 'new' ? null : modal}
            onClose={() => setModal(null)}
            onSave={load}
          />
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-gray-900 rounded-2xl border border-gray-700 p-6 w-full max-w-sm shadow-2xl text-center">
              <Trash2 className="w-10 h-10 text-red-400 mx-auto mb-3" />
              <h3 className="text-white font-bold mb-2">Delete Agent?</h3>
              <p className="text-gray-400 text-sm mb-5">This will remove the agent permanently.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)}
                  className="flex-1 py-2.5 border border-gray-700 text-gray-300 rounded-xl text-sm hover:bg-gray-800 transition-colors">Cancel</button>
                <button onClick={handleDelete}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-semibold transition-colors">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
