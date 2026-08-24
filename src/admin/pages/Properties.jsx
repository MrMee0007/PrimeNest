import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, Edit2, Trash2, Eye, Star, MapPin,
  ChevronLeft, ChevronRight, Filter, Check, X
} from 'lucide-react'
import api from '../api'

const TYPES    = ['All Types','Villa','Penthouse','Estate','Apartment','Studio']
const STATUSES = ['All Status','For Sale','For Rent','Sold','Off Market']

function ConfirmDialog({ name, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-900 rounded-2xl border border-gray-700 p-6 w-full max-w-sm shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-red-900/30 border border-red-700/40 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-5 h-5 text-red-400"/>
        </div>
        <h3 className="text-white font-bold text-center mb-2">Delete Property?</h3>
        <p className="text-gray-400 text-sm text-center mb-6">
          Are you sure you want to delete <span className="text-white font-semibold">"{name}"</span>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 border border-gray-700 text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-semibold transition-colors">
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function PropertiesPage() {
  const navigate = useNavigate()
  const [props,    setProps]    = useState([])
  const [total,    setTotal]    = useState(0)
  const [page,     setPage]     = useState(1)
  const [pages,    setPages]    = useState(1)
  const [search,   setSearch]   = useState('')
  const [type,     setType]     = useState('')
  const [status,   setStatus]   = useState('')
  const [sort,     setSort]     = useState('created_at')
  const [loading,  setLoading]  = useState(false)
  const [deleting, setDeleting] = useState(null) // { id, name }
  const limit = 10

  const fetch = useCallback(() => {
    setLoading(true)
    api.get('/properties', { params: { search, type: type === 'All Types' ? '' : type, status: status === 'All Status' ? '' : status, sort, page, limit } })
      .then(r => { setProps(r.data.data); setTotal(r.data.total); setPages(r.data.pages) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [search, type, status, sort, page])

  useEffect(() => { fetch() }, [fetch])

  const handleDelete = async () => {
    if (!deleting) return
    try {
      await api.delete(`/properties/${deleting.id}`)
      setDeleting(null)
      fetch()
    } catch (err) { alert(err.response?.data?.error || 'Delete failed') }
  }

  const toggleFeatured = async (id) => {
    await api.patch(`/properties/${id}/featured`)
    fetch()
  }

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Properties</h1>
          <p className="text-sm text-gray-400 mt-0.5">{total} total listings</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          onClick={() => navigate('/admin/properties/new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold text-sm rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5}/>
          Add Property
        </motion.button>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="flex-1 min-w-48 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"/>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search name, location..."
            className="w-full pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 outline-none focus:border-amber-500 transition-colors"/>
        </div>
        {/* Type filter */}
        <select value={type} onChange={e => { setType(e.target.value); setPage(1) }}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-300 outline-none focus:border-amber-500 cursor-pointer">
          {TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
        {/* Status filter */}
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-300 outline-none focus:border-amber-500 cursor-pointer">
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        {/* Sort */}
        <select value={sort} onChange={e => setSort(e.target.value)}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-300 outline-none focus:border-amber-500 cursor-pointer">
          <option value="created_at">Newest</option>
          <option value="price">Price</option>
          <option value="views">Views</option>
          <option value="rating">Rating</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-gray-500 text-sm">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Property</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Rating</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Views</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Featured</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {props.map(p => (
                  <tr key={p.id} className="hover:bg-gray-800/40 transition-colors group">
                    {/* Property */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.main_img || '/hero_house.png'} alt={p.name}
                          className="w-12 h-9 rounded-lg object-cover shrink-0 border border-gray-700"/>
                        <div className="min-w-0">
                          <div className="text-white font-medium truncate max-w-[180px]">{p.name}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 truncate">
                            <MapPin className="w-2.5 h-2.5 shrink-0"/> {p.location}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded-lg">{p.type}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-amber-400">{p.price}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        p.status === 'For Sale' ? 'bg-green-500/15 text-green-400' :
                        p.status === 'For Rent' ? 'bg-blue-500/15 text-blue-400'  :
                        p.status === 'Sold'     ? 'bg-gray-700 text-gray-400'     :
                        'bg-yellow-500/15 text-yellow-400'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex items-center gap-1 text-amber-400 text-xs">
                        <Star className="w-3 h-3 fill-current"/>
                        {p.rating > 0 ? p.rating.toFixed(1) : '—'}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-400">{p.views.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleFeatured(p.id)}
                        className={`w-8 h-5 rounded-full transition-colors relative ${p.is_featured ? 'bg-amber-500' : 'bg-gray-700'}`}>
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${p.is_featured ? 'left-3.5' : 'left-0.5'}`}/>
                      </button>
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a href={`/property/${p.id}`} target="_blank" rel="noreferrer"
                          className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                          <Eye className="w-4 h-4"/>
                        </a>
                        <button onClick={() => navigate(`/admin/properties/${p.id}/edit`)}
                          className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-amber-500/20 hover:border-amber-500/30 flex items-center justify-center text-gray-400 hover:text-amber-400 transition-colors border border-transparent">
                          <Edit2 className="w-3.5 h-3.5"/>
                        </button>
                        <button onClick={() => setDeleting({ id: p.id, name: p.name })}
                          className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-red-900/30 hover:border-red-700/30 flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors border border-transparent">
                          <Trash2 className="w-3.5 h-3.5"/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!props.length && (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-500 text-sm">
                    No properties found. <button onClick={() => navigate('/admin/properties/new')} className="text-amber-400 hover:underline">Add one!</button>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-800">
            <span className="text-xs text-gray-500">Page {page} of {pages} · {total} properties</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 flex items-center justify-center text-gray-300 transition-colors">
                <ChevronLeft className="w-4 h-4"/>
              </button>
              <button disabled={page >= pages} onClick={() => setPage(p => p + 1)}
                className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 flex items-center justify-center text-gray-300 transition-colors">
                <ChevronRight className="w-4 h-4"/>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm delete dialog */}
      <AnimatePresence>
        {deleting && (
          <ConfirmDialog name={deleting.name} onConfirm={handleDelete} onCancel={() => setDeleting(null)}/>
        )}
      </AnimatePresence>
    </div>
  )
}
