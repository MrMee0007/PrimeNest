import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, ChevronLeft, ChevronRight, Search, Eye, Trash2, Check, X } from 'lucide-react'
import api from '../api'

const STATUS_COLORS = {
  new:       'bg-amber-400/15 text-amber-400 border border-amber-400/30',
  contacted: 'bg-blue-400/15 text-blue-400 border border-blue-400/30',
  closed:    'bg-green-400/15 text-green-400 border border-green-400/30',
}

const STATUSES = ['All','new','contacted','closed']

function InquiryModal({ inq, onClose, onStatusChange }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-lg shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-white text-sm">Inquiry Details</span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              ['Name',    inq.name],
              ['Email',   inq.email],
              ['Phone',   inq.phone || '—'],
              ['Property',inq.property_name || '—'],
              ['Date Pref',inq.date_pref || '—'],
              ['Received', new Date(inq.created_at).toLocaleString()],
            ].map(([label, val]) => (
              <div key={label}>
                <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">{label}</div>
                <div className="text-sm text-white font-medium">{val}</div>
              </div>
            ))}
          </div>
          {inq.message && (
            <div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Message</div>
              <p className="text-sm text-gray-300 bg-gray-800 rounded-xl p-3 leading-relaxed">{inq.message}</p>
            </div>
          )}
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-2">Update Status</div>
            <div className="flex gap-2">
              {['new','contacted','closed'].map(s => (
                <button key={s} onClick={() => onStatusChange(inq.id, s)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border capitalize transition-all ${
                    inq.status === s ? STATUS_COLORS[s] : 'border-gray-700 text-gray-500 hover:border-gray-500'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function Inquiries() {
  const [inquiries, setInquiries] = useState([])
  const [total,  setTotal]  = useState(0)
  const [page,   setPage]   = useState(1)
  const [pages,  setPages]  = useState(1)
  const [status, setStatus] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)
  const limit = 12

  const db = useCallback(() => {
    setLoading(true)
    // We'll query from backend — fetch all and filter client-side for simplicity
    api.get('/dashboard/stats')
      .then(r => {
        let all = r.data.recentInq || []
        // For a full list, we embed a full inquiries endpoint stub here
        // In production you'd have /api/inquiries with pagination
        setInquiries(all)
        setTotal(all.length)
        setPages(1)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { db() }, [db])

  const handleStatusChange = async (id, newStatus) => {
    // Optimistic update
    setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i))
    if (selected?.id === id) setSelected(s => ({ ...s, status: newStatus }))
    // In production: await api.patch(`/inquiries/${id}`, { status: newStatus })
  }

  const filtered = inquiries.filter(i => {
    const matchStatus = status === 'All' || i.status === status
    const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase()) ||
                        i.email.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Inquiries</h1>
        <p className="text-sm text-gray-400 mt-0.5">{total} total · manage viewing requests and messages</p>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 outline-none focus:border-amber-500 transition-colors" />
        </div>
        <div className="flex gap-1 bg-gray-800 rounded-xl p-1">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                status === s ? 'bg-amber-500 text-gray-900' : 'text-gray-400 hover:text-white'
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32 text-gray-500 text-sm">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  {['Inquirer','Property','Message','Status','Date','Action'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filtered.map(inq => (
                  <tr key={inq.id} className="hover:bg-gray-800/40 transition-colors group">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-300 shrink-0">
                          {inq.name[0]}
                        </div>
                        <div>
                          <div className="text-white font-medium text-xs">{inq.name}</div>
                          <div className="text-gray-500 text-[10px]">{inq.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-300 max-w-[140px] truncate">{inq.property_name || '—'}</td>
                    <td className="px-5 py-3 text-xs text-gray-400 max-w-[200px] truncate">{inq.message || '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[inq.status] || 'bg-gray-700 text-gray-400'}`}>
                        {inq.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[10px] text-gray-500 whitespace-nowrap">
                      {new Date(inq.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => setSelected(inq)}
                        className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-all">
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-500 text-sm">No inquiries found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inquiry detail modal */}
      <AnimatePresence>
        {selected && (
          <InquiryModal
            inq={selected}
            onClose={() => setSelected(null)}
            onStatusChange={handleStatusChange}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
