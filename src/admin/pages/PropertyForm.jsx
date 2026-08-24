import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Save, Upload, X, Plus, Trash2,
  Image as ImageIcon, ChevronDown, Check, AlertCircle
} from 'lucide-react'
import api from '../api'

// ─── Reusable field components ────────────────────────────────────────────────
const Field = ({ label, required, error, children }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    {children}
    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
  </div>
)

const Input = ({ className = '', ...props }) => (
  <input
    className={`w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all ${className}`}
    {...props}
  />
)

const Select = ({ children, className = '', ...props }) => (
  <select
    className={`w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-300 outline-none focus:border-amber-500 cursor-pointer transition-all ${className}`}
    {...props}
  >
    {children}
  </select>
)

const Textarea = ({ className = '', ...props }) => (
  <textarea
    className={`w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none ${className}`}
    {...props}
  />
)

// ─── Tag input (for highlights) ────────────────────────────────────────────────
function TagInput({ label, values, onChange }) {
  const [input, setInput] = useState('')

  const add = () => {
    const v = input.trim()
    if (v && !values.includes(v)) onChange([...values, v])
    setInput('')
  }

  const remove = (i) => onChange(values.filter((_, idx) => idx !== i))

  return (
    <Field label={label}>
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-3 min-h-[80px] focus-within:border-amber-500 transition-all">
        <div className="flex flex-wrap gap-2 mb-2">
          {values.map((v, i) => (
            <span key={i} className="flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs px-3 py-1 rounded-full">
              {v}
              <button onClick={() => remove(i)} className="text-amber-400 hover:text-white transition-colors">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
            placeholder="Type and press Enter..."
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none"
          />
          <button onClick={add} type="button" className="text-amber-400 hover:text-amber-300 text-xs font-semibold transition-colors">
            + Add
          </button>
        </div>
      </div>
    </Field>
  )
}

// ─── Amenities editor ─────────────────────────────────────────────────────────
const DEFAULT_CATS = ['Interior', 'Outdoor', 'Services', 'Security', 'Eco', 'Luxury']

function AmenitiesEditor({ value, onChange }) {
  const [newCat, setNewCat] = useState('')
  const [newItem, setNewItem] = useState({})

  const addItem = (cat, item) => {
    if (!item?.trim()) return
    const updated = { ...value, [cat]: [...(value[cat] || []), item.trim()] }
    onChange(updated)
    setNewItem({ ...newItem, [cat]: '' })
  }

  const removeItem = (cat, idx) => {
    const updated = { ...value, [cat]: value[cat].filter((_, i) => i !== idx) }
    onChange(updated)
  }

  const addCat = () => {
    const c = newCat.trim()
    if (c && !value[c]) { onChange({ ...value, [c]: [] }); setNewCat('') }
  }

  const removeCat = (cat) => {
    const updated = { ...value }
    delete updated[cat]
    onChange(updated)
  }

  return (
    <Field label="Amenities & Features">
      <div className="space-y-3">
        {Object.keys(value).map(cat => (
          <div key={cat} className="bg-gray-800 border border-gray-700 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wide">{cat}</span>
              <button onClick={() => removeCat(cat)} className="text-gray-600 hover:text-red-400 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {(value[cat] || []).map((item, i) => (
                <span key={i} className="flex items-center gap-1 bg-gray-700 text-gray-300 text-xs px-2.5 py-1 rounded-lg">
                  {item}
                  <button onClick={() => removeItem(cat, i)} className="text-gray-500 hover:text-red-400 transition-colors">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newItem[cat] || ''}
                onChange={e => setNewItem({ ...newItem, [cat]: e.target.value })}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addItem(cat, newItem[cat]) } }}
                placeholder="Add item..."
                className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 outline-none focus:border-amber-500 transition-colors"
              />
              <button onClick={() => addItem(cat, newItem[cat])} type="button"
                className="text-amber-400 hover:text-amber-300 text-xs font-semibold px-2 transition-colors">
                + Add
              </button>
            </div>
          </div>
        ))}
        {/* Add category */}
        <div className="flex gap-2">
          <Select value={newCat} onChange={e => setNewCat(e.target.value)} className="flex-1">
            <option value="">+ Add category...</option>
            {DEFAULT_CATS.filter(c => !value[c]).map(c => <option key={c}>{c}</option>)}
          </Select>
          <input value={newCat} onChange={e => setNewCat(e.target.value)}
            placeholder="Custom name"
            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-600 outline-none focus:border-amber-500 transition-colors"
          />
          <button type="button" onClick={addCat}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-xl transition-colors">
            Add
          </button>
        </div>
      </div>
    </Field>
  )
}

// ─── Image drop zone ──────────────────────────────────────────────────────────
function ImageDropZone({ label, value, onChange, accept = 'image/*' }) {
  const inputRef = useRef(null)
  const [drag, setDrag] = useState(false)

  const handleFiles = (files) => {
    const file = files[0]
    if (!file) return
    onChange(file)
  }

  return (
    <Field label={label}>
      <div
        onClick={() => inputRef.current.click()}
        onDragOver={e => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files) }}
        className={`border-2 border-dashed rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-2 py-6 ${
          drag ? 'border-amber-500 bg-amber-500/10' : 'border-gray-700 hover:border-amber-500/50 hover:bg-gray-800/50'
        }`}
      >
        {value ? (
          <div className="text-center">
            {typeof value === 'string' ? (
              <img src={value} alt="preview" className="w-32 h-24 object-cover rounded-xl mx-auto mb-2 border border-gray-700" />
            ) : (
              <div className="text-sm text-amber-400 mb-1">📎 {value.name}</div>
            )}
            <p className="text-xs text-gray-500">Click to change</p>
          </div>
        ) : (
          <>
            <Upload className="w-8 h-8 text-gray-600" />
            <p className="text-sm text-gray-400">Drop image here or <span className="text-amber-400">browse</span></p>
            <p className="text-xs text-gray-600">JPG, PNG, WebP — max 10 MB</p>
          </>
        )}
        <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={e => handleFiles(e.target.files)} />
      </div>
    </Field>
  )
}

// ─── Gallery multi-upload ──────────────────────────────────────────────────────
function GalleryUploader({ existingGallery, newFiles, onRemoveExisting, onAddFiles }) {
  const inputRef = useRef(null)

  const handleFiles = (files) => {
    const arr = Array.from(files)
    onAddFiles(arr)
  }

  return (
    <Field label="Photo Gallery">
      {/* Existing gallery */}
      {existingGallery.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {existingGallery.map((photo, i) => (
            <div key={i} className="relative group">
              <img src={photo.src.startsWith('/uploads') ? `http://localhost:5001${photo.src}` : photo.src}
                alt={photo.label} className="w-20 h-16 object-cover rounded-xl border border-gray-700" />
              <button
                type="button"
                onClick={() => onRemoveExisting(photo.src)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <X className="w-3 h-3 text-white" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 rounded-b-xl px-1 py-0.5 text-[9px] text-white truncate">{photo.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* New files preview */}
      {newFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {newFiles.map((file, i) => (
            <div key={i} className="relative w-20 h-16 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center">
              <span className="text-[9px] text-amber-400 text-center px-1 truncate">{file.name}</span>
            </div>
          ))}
        </div>
      )}

      <div
        onClick={() => inputRef.current.click()}
        className="border-2 border-dashed border-gray-700 hover:border-amber-500/50 rounded-xl p-4 flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-800/50 transition-all"
      >
        <ImageIcon className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-400">Add more photos</span>
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
          onChange={e => handleFiles(e.target.files)} />
      </div>
    </Field>
  )
}

// ─── Main PropertyForm ─────────────────────────────────────────────────────────
const DEFAULTS = {
  name: '', tagline: '', location: '', full_address: '', price: '',
  price_night: '', beds: 1, baths: 1, sqft: 0, garage: 0, floors: 1,
  year_built: new Date().getFullYear(), type: 'Villa', status: 'For Sale',
  badge: 'New', badge_color: 'bg-green-500', tag: 'Premium',
  rating: 0, reviews: 0, description: '', highlights: [], amenities: {},
  property_tax: '', hoa: 'None', lot_size: '', lat: '', lng: '',
  is_featured: false, agent_id: '',
}

const SECTIONS = ['Basic Info', 'Details', 'Description', 'Amenities', 'Media', 'Agent & Geo']

export default function PropertyForm() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const isEdit       = Boolean(id)
  const [activeSection, setActiveSection] = useState(0)
  const [form, setForm]     = useState(DEFAULTS)
  const [mainImg, setMainImg]   = useState(null)  // File | string
  const [galleryNew, setGalleryNew] = useState([]) // File[]
  const [galleryExisting, setGalleryExisting] = useState([]) // [{src, label}]
  const [agents, setAgents]  = useState([])
  const [loading, setLoading]  = useState(false)
  const [saving, setSaving]    = useState(false)
  const [errors, setErrors]    = useState({})
  const [toast, setToast]      = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Load agents
  useEffect(() => {
    api.get('/agents').then(r => setAgents(r.data)).catch(console.error)
  }, [])

  // Load property if editing
  useEffect(() => {
    if (!isEdit) return
    setLoading(true)
    api.get(`/properties/${id}`)
      .then(r => {
        const p = r.data
        setForm({
          name: p.name, tagline: p.tagline || '', location: p.location,
          full_address: p.full_address || '', price: p.price, price_night: p.price_night || '',
          beds: p.beds, baths: p.baths, sqft: p.sqft, garage: p.garage, floors: p.floors,
          year_built: p.year_built, type: p.type, status: p.status,
          badge: p.badge, badge_color: p.badge_color, tag: p.tag,
          rating: p.rating, reviews: p.reviews, description: p.description || '',
          highlights: Array.isArray(p.highlights) ? p.highlights : [],
          amenities: typeof p.amenities === 'object' ? p.amenities : {},
          property_tax: p.property_tax || '', hoa: p.hoa || '',
          lot_size: p.lot_size || '', lat: p.lat || '', lng: p.lng || '',
          is_featured: Boolean(p.is_featured), agent_id: p.agent_id || '',
        })
        setMainImg(p.main_img || null)
        setGalleryExisting(Array.isArray(p.gallery) ? p.gallery : [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const validate = () => {
    const e = {}
    if (!form.name.trim())     e.name     = 'Name is required'
    if (!form.location.trim()) e.location = 'Location is required'
    if (!form.price.trim())    e.price    = 'Price is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) { setActiveSection(0); return }

    setSaving(true)
    try {
      const fd = new FormData()

      // Append all text fields
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'highlights' || k === 'amenities') {
          fd.append(k, JSON.stringify(v))
        } else {
          fd.append(k, v === null ? '' : String(v))
        }
      })

      // Images
      if (mainImg && typeof mainImg !== 'string') fd.append('main_img', mainImg)
      else if (mainImg)                           fd.append('main_img', mainImg)

      galleryNew.forEach(f => fd.append('gallery', f))

      // Keep existing gallery (send as JSON)
      fd.set('gallery', JSON.stringify(galleryExisting))
      galleryNew.forEach(f => fd.append('gallery', f))

      if (isEdit) {
        await api.put(`/properties/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        showToast('Property updated successfully!')
      } else {
        const res = await api.post('/properties', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        showToast('Property created!')
        setTimeout(() => navigate(`/admin/properties/${res.data.id}/edit`), 1200)
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  const removeExistingPhoto = (src) => {
    setGalleryExisting(g => g.filter(p => p.src !== src))
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading property...</div>
  )

  return (
    <div className="max-w-5xl mx-auto">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold border ${
              toast.type === 'success'
                ? 'bg-green-900/90 border-green-700 text-green-300'
                : 'bg-red-900/90 border-red-700 text-red-300'
            }`}
          >
            {toast.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/admin/properties')}
          className="w-9 h-9 rounded-xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isEdit ? 'Edit Property' : 'Add New Property'}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {isEdit ? `Editing: ${form.name}` : 'Fill in the details to list a new property'}
          </p>
        </div>
        <div className="ml-auto">
          <motion.button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            whileHover={{ scale: saving ? 1 : 1.03 }}
            whileTap={{ scale: saving ? 1 : 0.97 }}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-gray-900 font-bold text-sm rounded-xl transition-colors"
          >
            {saving ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Property'}
          </motion.button>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 mb-6 overflow-x-auto">
        {SECTIONS.map((s, i) => (
          <button key={s} onClick={() => setActiveSection(i)}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              i === activeSection
                ? 'bg-amber-500 text-gray-900 shadow'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}>
            {s}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">

          {/* ── 0: Basic Info ── */}
          {activeSection === 0 && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Property Name" required error={errors.name}>
                  <Input value={form.name} onChange={e => set('name', e.target.value)}
                    placeholder="e.g. Socha Heartland Villas" className={errors.name ? 'border-red-500' : ''} />
                </Field>
                <Field label="Tagline">
                  <Input value={form.tagline} onChange={e => set('tagline', e.target.value)}
                    placeholder="A short, inspiring one-liner" />
                </Field>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Location / City" required error={errors.location}>
                  <Input value={form.location} onChange={e => set('location', e.target.value)}
                    placeholder="e.g. Ubud, Bali Indonesia" className={errors.location ? 'border-red-500' : ''} />
                </Field>
                <Field label="Full Address">
                  <Input value={form.full_address} onChange={e => set('full_address', e.target.value)}
                    placeholder="Street address" />
                </Field>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <Field label="Sale Price" required error={errors.price}>
                  <Input value={form.price} onChange={e => set('price', e.target.value)}
                    placeholder="e.g. $429,000" className={errors.price ? 'border-red-500' : ''} />
                </Field>
                <Field label="Nightly Rate">
                  <Input value={form.price_night} onChange={e => set('price_night', e.target.value)}
                    placeholder="e.g. $189" />
                </Field>
                <Field label="Status">
                  <Select value={form.status} onChange={e => set('status', e.target.value)}>
                    {['For Sale','For Rent','Sold','Off Market'].map(s => <option key={s}>{s}</option>)}
                  </Select>
                </Field>
              </div>
              <div className="grid md:grid-cols-4 gap-4">
                <Field label="Type">
                  <Select value={form.type} onChange={e => set('type', e.target.value)}>
                    {['Villa','Penthouse','Estate','Apartment','Studio','Cottage','Townhouse'].map(t => <option key={t}>{t}</option>)}
                  </Select>
                </Field>
                <Field label="Badge Label">
                  <Select value={form.badge} onChange={e => set('badge', e.target.value)}>
                    {['New','Hot','Featured','Luxury','Deal','Off Plan','Sold'].map(b => <option key={b}>{b}</option>)}
                  </Select>
                </Field>
                <Field label="Badge Color">
                  <Select value={form.badge_color} onChange={e => set('badge_color', e.target.value)}>
                    <option value="bg-green-500">Green — New</option>
                    <option value="bg-amber-500">Amber — Hot</option>
                    <option value="bg-purple-500">Purple — Featured</option>
                    <option value="bg-amber-600">Dark Amber — Luxury</option>
                    <option value="bg-blue-500">Blue — Deal</option>
                    <option value="bg-red-500">Red — Urgent</option>
                  </Select>
                </Field>
                <Field label="Category Tag">
                  <Select value={form.tag} onChange={e => set('tag', e.target.value)}>
                    {['Premium','Vacation','Investor','Budget','Commercial'].map(t => <option key={t}>{t}</option>)}
                  </Select>
                </Field>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button type="button" onClick={() => set('is_featured', !form.is_featured)}
                  className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${form.is_featured ? 'bg-amber-500' : 'bg-gray-700'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${form.is_featured ? 'left-5' : 'left-1'}`} />
                </button>
                <span className="text-sm text-gray-300">Featured listing <span className="text-gray-600">(appears on homepage)</span></span>
              </div>
            </div>
          )}

          {/* ── 1: Details ── */}
          {activeSection === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { key: 'beds',      label: 'Bedrooms',  min: 0 },
                  { key: 'baths',     label: 'Bathrooms', min: 0 },
                  { key: 'sqft',      label: 'Area (sqft)', min: 0 },
                  { key: 'garage',    label: 'Garage Spaces', min: 0 },
                  { key: 'floors',    label: 'Floors',    min: 1 },
                  { key: 'year_built',label: 'Year Built', min: 1800 },
                  { key: 'rating',    label: 'Rating (0-5)', min: 0, max: 5, step: 0.1 },
                  { key: 'reviews',   label: 'Review Count', min: 0 },
                ].map(({ key, label, min, max, step }) => (
                  <Field key={key} label={label}>
                    <Input type="number" min={min} max={max} step={step || 1}
                      value={form[key]} onChange={e => set(key, Number(e.target.value))} />
                  </Field>
                ))}
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <Field label="Property Tax">
                  <Input value={form.property_tax} onChange={e => set('property_tax', e.target.value)}
                    placeholder="e.g. $3,200 / yr" />
                </Field>
                <Field label="HOA Fee">
                  <Input value={form.hoa} onChange={e => set('hoa', e.target.value)}
                    placeholder="e.g. $850 / mo or None" />
                </Field>
                <Field label="Lot Size">
                  <Input value={form.lot_size} onChange={e => set('lot_size', e.target.value)}
                    placeholder="e.g. 0.35 acres" />
                </Field>
              </div>
            </div>
          )}

          {/* ── 2: Description ── */}
          {activeSection === 2 && (
            <div className="space-y-5">
              <Field label="Full Description">
                <Textarea
                  rows={10}
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Write a compelling description of the property. Use separate paragraphs for different aspects (location, interior, outdoor spaces, etc.)"
                />
              </Field>
              <TagInput
                label="Property Highlights (key selling points)"
                values={form.highlights}
                onChange={v => set('highlights', v)}
              />
            </div>
          )}

          {/* ── 3: Amenities ── */}
          {activeSection === 3 && (
            <AmenitiesEditor value={form.amenities} onChange={v => set('amenities', v)} />
          )}

          {/* ── 4: Media ── */}
          {activeSection === 4 && (
            <div className="space-y-6">
              <ImageDropZone
                label="Main / Hero Image"
                value={mainImg && typeof mainImg === 'string'
                  ? (mainImg.startsWith('/uploads') ? `http://localhost:5001${mainImg}` : mainImg)
                  : mainImg}
                onChange={setMainImg}
              />
              <GalleryUploader
                existingGallery={galleryExisting}
                newFiles={galleryNew}
                onRemoveExisting={removeExistingPhoto}
                onAddFiles={files => setGalleryNew(prev => [...prev, ...files])}
              />
              {galleryNew.length > 0 && (
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{galleryNew.length} new photo{galleryNew.length > 1 ? 's' : ''} queued for upload</span>
                  <button type="button" onClick={() => setGalleryNew([])} className="text-red-400 hover:text-red-300 transition-colors">
                    Clear new files
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── 5: Agent & Geo ── */}
          {activeSection === 5 && (
            <div className="space-y-4">
              <Field label="Assign Agent">
                <Select value={form.agent_id} onChange={e => set('agent_id', e.target.value)}>
                  <option value="">No agent assigned</option>
                  {agents.map(a => (
                    <option key={a.id} value={a.id}>{a.name} — {a.title}</option>
                  ))}
                </Select>
              </Field>
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Latitude">
                  <Input type="number" step="any" value={form.lat}
                    onChange={e => set('lat', e.target.value)}
                    placeholder="e.g. -8.506" />
                </Field>
                <Field label="Longitude">
                  <Input type="number" step="any" value={form.lng}
                    onChange={e => set('lng', e.target.value)}
                    placeholder="e.g. 115.262" />
                </Field>
              </div>
              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <p className="text-xs text-gray-500">
                  💡 Find coordinates at{' '}
                  <a href="https://www.latlong.net" target="_blank" rel="noreferrer"
                    className="text-amber-400 hover:underline">latlong.net</a>{' '}
                  or right-click any location on Google Maps.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom nav buttons */}
        <div className="flex items-center justify-between mt-4">
          <button type="button" onClick={() => setActiveSection(s => Math.max(0, s - 1))}
            disabled={activeSection === 0}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors disabled:opacity-30">
            ← Previous
          </button>
          {activeSection < SECTIONS.length - 1 ? (
            <button type="button" onClick={() => setActiveSection(s => s + 1)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-900 bg-amber-500 hover:bg-amber-400 rounded-xl transition-colors">
              Next →
            </button>
          ) : (
            <motion.button type="submit" disabled={saving}
              whileHover={{ scale: saving ? 1 : 1.03 }}
              className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-gray-900 font-bold text-sm rounded-xl transition-colors">
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Property'}
            </motion.button>
          )}
        </div>
      </form>
    </div>
  )
}
