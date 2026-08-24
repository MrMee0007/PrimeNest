import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import {
  ArrowLeft, Star, MapPin, Bed, Bath, Square, Car, Calendar,
  Heart, Share2, Phone, Mail, MessageSquare, ChevronLeft,
  ChevronRight, Check, Maximize2, X, Home, Building2,
  Zap, TreePine, Shield, ChevronDown, ExternalLink, Loader2
} from 'lucide-react'
import { fetchProperty, fetchProperties } from '../lib/api'

// ── Normalize API row → component shape ─────────────────────────────────────
function normalize(p) {
  const safeJson = (v, fb) => {
    if (!v) return fb
    if (typeof v !== 'string') return v
    try { return JSON.parse(v) } catch { return fb }
  }
  return {
    id:           p.id,
    name:         p.name,
    slug:         p.slug,
    tagline:      p.tagline || '',
    location:     p.location,
    fullAddress:  p.full_address || p.location,
    price:        p.price,
    priceNight:   p.price_night || '',
    beds:         p.beds,
    baths:        p.baths,
    sqft:         p.sqft,
    garage:       p.garage,
    floors:       p.floors,
    yearBuilt:    p.year_built,
    type:         p.type,
    status:       p.status,
    badge:        p.badge,
    badgeColor:   p.badge_color,
    tag:          p.tag,
    rating:       p.rating,
    reviews:      p.reviews,
    description:  p.description || '',
    highlights:   safeJson(p.highlights, []),
    amenities:    safeJson(p.amenities, {}),
    propertyTax:  p.property_tax || '',
    hoa:          p.hoa || '',
    lotSize:      p.lot_size || '',
    lat:          p.lat || 0,
    lng:          p.lng || 0,
    mainImg:      p.main_img || '/property_villa.png',
    gallery:      safeJson(p.gallery, []).length > 0
                    ? safeJson(p.gallery, [])
                    : [{ src: p.main_img || '/property_villa.png', label: p.name }],
    views:        p.views,
    isFeatured:   p.is_featured,
    agent: {
      id:         p.agent_id,
      name:       p.agent_name  || 'Property Advisor',
      title:      p.agent_title || 'Senior Property Advisor',
      email:      p.agent_email || '',
      phone:      p.agent_phone || '',
      img:        p.agent_img   || '/agent_photo.png',
      rating:     p.agent_rating || 5.0,
      deals:      p.agent_deals  || 0,
      experience: p.agent_experience || '',
    },
  }
}

// ─── Photo Gallery ────────────────────────────────────────────────────────────
function Gallery({ photos, propertyName }) {
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  const prev = () => setActive(i => (i - 1 + photos.length) % photos.length)
  const next = () => setActive(i => (i + 1) % photos.length)

  useEffect(() => {
    if (!lightbox) return
    const handler = (e) => {
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape')     setLightbox(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightbox])

  return (
    <>
      {/* Main gallery grid */}
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[520px] rounded-2xl overflow-hidden">
        {/* Large main image */}
        <motion.div
          className="col-span-2 row-span-2 relative cursor-pointer group overflow-hidden"
          onClick={() => { setActive(0); setLightbox(true) }}
        >
          <img src={photos[0].src} alt={photos[0].label}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={e => { e.target.src = '/property_villa.png' }} />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          <span className="absolute bottom-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
            {photos[0].label}
          </span>
        </motion.div>

        {/* 4 smaller images */}
        {photos.slice(1, 5).map((photo, i) => (
          <motion.div
            key={i}
            className="relative cursor-pointer group overflow-hidden"
            onClick={() => { setActive(i + 1); setLightbox(true) }}
            whileHover={{ opacity: 0.9 }}
          >
            <img src={photo.src} alt={photo.label}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={e => { e.target.src = '/property_villa.png' }} />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
            <span className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
              {photo.label}
            </span>
            {i === 3 && photos.length > 5 && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="text-white text-center">
                  <Maximize2 className="w-6 h-6 mx-auto mb-1" />
                  <span className="text-sm font-semibold">+{photos.length - 5} more</span>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Thumbnail strip */}
      <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
        {photos.map((photo, i) => (
          <button
            key={i}
            onClick={() => { setActive(i); setLightbox(true) }}
            className={`shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
              active === i ? 'border-amber-500 opacity-100' : 'border-transparent opacity-60 hover:opacity-80'
            }`}
          >
            <img src={photo.src} alt={photo.label} className="w-16 h-12 object-cover"
              onError={e => { e.target.src = '/property_villa.png' }} />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4"
          >
            <button
              onClick={() => setLightbox(false)}
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white/60 text-sm">
              {active + 1} / {photos.length} — {photos[active].label}
            </div>

            <AnimatePresence mode="wait">
              <motion.img
                key={active}
                src={photos[active].src}
                alt={photos[active].label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="max-h-[75vh] max-w-[90vw] object-contain rounded-xl"
                onError={e => { e.target.src = '/property_villa.png' }}
              />
            </AnimatePresence>

            <button onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
              <ChevronRight className="w-6 h-6" />
            </button>

            <div className="absolute bottom-5 flex gap-2 overflow-x-auto px-4">
              {photos.map((p, i) => (
                <button key={i} onClick={() => setActive(i)}
                  className={`shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                    i === active ? 'border-amber-400 opacity-100' : 'border-transparent opacity-40 hover:opacity-70'
                  }`}
                >
                  <img src={p.src} alt={p.label} className="w-14 h-10 object-cover" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ─── Amenity Section ──────────────────────────────────────────────────────────
const amenityIcons = {
  'Interior': Home, 'Outdoor': TreePine, 'Eco': Zap, 'Community': Building2,
  'Fitness': Zap, 'Luxury': Star, 'Security': Shield, 'Services': MessageSquare,
  'Nature & Core': TreePine, 'Infrastructure': Building2, 'Comforts': Home,
}

function AmenitiesSection({ amenities }) {
  const keys = Object.keys(amenities)
  const [open, setOpen] = useState(keys[0] || '')
  if (keys.length === 0) return null
  return (
    <div>
      <div className="flex gap-2 flex-wrap mb-5">
        {keys.map(cat => {
          const Icon = amenityIcons[cat] || Check
          return (
            <button key={cat} onClick={() => setOpen(cat)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                open === cat ? 'bg-amber-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              <Icon className="w-3.5 h-3.5" />
              {cat}
            </button>
          )
        })}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={open}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(amenities[open] || []).map((item) => (
            <div key={item} className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700">
              <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-amber-600" />
              </div>
              {item}
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ─── Contact Form ──────────────────────────────────────────────────────────────
function ContactForm({ agent }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', date: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
    setTimeout(() => setSent(false), 4000)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden sticky top-24">
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img src={agent.img} alt={agent.name}
              className="w-16 h-16 rounded-2xl object-cover object-top border-2 border-white shadow-md"
              onError={e => { e.target.src = '/agent_photo.png' }} />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-2 border-white rounded-full" />
          </div>
          <div>
            <div className="font-bold text-gray-900 text-base">{agent.name}</div>
            <div className="text-xs text-gray-500 mb-1">{agent.title}</div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 text-amber-400 fill-current" />
              ))}
              <span className="text-xs text-gray-500 ml-1">{agent.rating} · {agent.deals} deals</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <a href={`tel:${agent.phone}`}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors">
            <Phone className="w-4 h-4" /> Call
          </a>
          <a href={`mailto:${agent.email}`}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 hover:border-amber-400 text-gray-700 text-sm font-semibold rounded-xl transition-colors">
            <Mail className="w-4 h-4" /> Email
          </a>
          <button className="w-10 flex items-center justify-center bg-white border border-gray-200 hover:border-amber-400 text-gray-700 rounded-xl transition-colors">
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-3">
        <h4 className="font-semibold text-gray-900 text-sm">Schedule a Viewing</h4>
        {['name','email','phone'].map(field => (
          <input key={field}
            value={form[field]}
            onChange={e => setForm({ ...form, [field]: e.target.value })}
            type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
            placeholder={field === 'name' ? 'Your full name' : field === 'email' ? 'Email address' : 'Phone number'}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
          />
        ))}
        <input value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
          type="date"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all" />
        <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
          placeholder="Message (optional)" rows={3}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all resize-none" />
        <motion.button type="submit"
          whileHover={{ scale: 1.02, boxShadow: '0 8px 22px rgba(245,158,11,0.4)' }}
          whileTap={{ scale: 0.97 }}
          className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm rounded-xl transition-colors">
          {sent ? '✓ Request Sent!' : 'Request a Viewing'}
        </motion.button>
        <p className="text-xs text-center text-gray-400">Free consultation · No commitment required</p>
      </form>
    </div>
  )
}

// ─── Similar Card ──────────────────────────────────────────────────────────────
function SimilarCard({ property }) {
  const navigate = useNavigate()
  const p = normalize(property)
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 12px 36px rgba(0,0,0,0.12)' }}
      onClick={() => { navigate(`/property/${p.id}`); window.scrollTo(0, 0) }}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-card cursor-pointer transition-all"
    >
      <div className="relative h-44 overflow-hidden">
        <img src={p.mainImg} alt={p.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          onError={e => { e.target.src = '/property_villa.png' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className={`absolute top-3 left-3 ${p.badgeColor} text-white text-xs font-bold px-2.5 py-1 rounded-lg`}>
          {p.badge}
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/95 rounded-lg px-2 py-1">
          <Star className="w-3 h-3 text-amber-400 fill-current" />
          <span className="text-xs font-bold text-gray-800">{p.rating}</span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
          <MapPin className="w-3 h-3" /> {p.location}
        </div>
        <h4 className="font-semibold text-gray-900 text-sm mb-2 leading-snug">{p.name}</h4>
        <div className="flex items-center justify-between">
          <div className="flex gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1"><Bed className="w-3 h-3" /> {p.beds}</span>
            <span className="flex items-center gap-1"><Bath className="w-3 h-3" /> {p.baths}</span>
            <span className="flex items-center gap-1"><Square className="w-3 h-3" /> {p.sqft?.toLocaleString()}</span>
          </div>
          <span className="font-bold text-amber-500 text-sm">{p.price}</span>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PropertyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [liked, setLiked] = useState(false)
  const [showFullDesc, setShowFullDesc] = useState(false)
  const [property, setProperty] = useState(null)
  const [similar, setSimilar] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { scrollY } = useScroll()
  const headerOpacity = useTransform(scrollY, [0, 200], [1, 0])

  useEffect(() => {
    window.scrollTo(0, 0)
    setLoading(true)
    setError(null)

    fetchProperty(id)
      .then(data => {
        setProperty(normalize(data))
        // Load similar properties (same type, different id)
        return fetchProperties({ type: data.type, limit: 3 })
      })
      .then(data => {
        const rows = Array.isArray(data) ? data : (data.data || [])
        setSimilar(rows.filter(p => String(p.id) !== String(id)))
      })
      .catch(err => {
        console.error(err)
        setError('Property not found or could not be loaded.')
      })
      .finally(() => setLoading(false))
  }, [id])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
      </div>
    )
  }

  // Error / not found
  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏠</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h2>
          <Link to="/" className="text-amber-500 hover:text-amber-600 font-semibold">← Back to listings</Link>
        </div>
      </div>
    )
  }

  const descLines = property.description.split('\n\n')
  const shortDesc = descLines.slice(0, 2).join('\n\n')

  return (
    <div className="bg-white min-h-screen">

      {/* ── Sticky top bar ─────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <span className="text-gray-300">/</span>
            <span className="hidden sm:block text-xs text-gray-400">
              <Link to="/" className="hover:text-amber-500 transition-colors">Home</Link>
              {' · '}
              <Link to="/#listings" className="hover:text-amber-500 transition-colors">Listings</Link>
              {' · '}
              <span className="text-gray-600 font-medium">{property.name}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setLiked(!liked)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-red-300 hover:text-red-500 transition-all">
              <Heart className="w-4 h-4" fill={liked ? '#EF4444' : 'none'} color={liked ? '#EF4444' : 'currentColor'} />
              <span className="hidden sm:inline">{liked ? 'Saved' : 'Save'}</span>
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-amber-300 hover:text-amber-600 transition-all">
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>
            <a href={`tel:${property.agent.phone}`}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors">
              <Phone className="w-4 h-4" /> Contact Agent
            </a>
          </div>
        </div>
      </div>

      {/* ── Main content ───────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Status + type tags */}
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">{property.status}</span>
          <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full">{property.type}</span>
          <span className={`${property.badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full`}>{property.badge}</span>
        </div>

        {/* Title + meta */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-2">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">{property.name}</h1>
            <p className="text-gray-500 italic text-base mb-3">{property.tagline}</p>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <MapPin className="w-4 h-4 text-amber-500" />
              {property.fullAddress}
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-3xl font-bold text-gray-900">{property.price}</div>
            <div className="text-sm text-gray-400">{property.priceNight && `${property.priceNight} · `}Est. {property.propertyTax} tax</div>
            <div className="flex items-center gap-1 justify-end mt-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 fill-current ${i < Math.floor(property.rating) ? 'text-amber-400' : 'text-gray-200'}`} />
              ))}
              <span className="text-sm font-semibold text-gray-700 ml-1">{property.rating}</span>
              <span className="text-sm text-gray-400">({property.reviews} reviews)</span>
            </div>
          </div>
        </div>

        {/* ── Gallery ──────────────────────────────────────── */}
        <div className="mb-10">
          <Gallery photos={property.gallery} propertyName={property.name} />
        </div>

        {/* ── Two column layout ─────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-10">

          {/* Left — details */}
          <div className="lg:col-span-2 space-y-10">

            {/* Key specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: Bed,    label: 'Bedrooms',  value: property.beds },
                { icon: Bath,   label: 'Bathrooms', value: property.baths },
                { icon: Square, label: 'Area',      value: `${property.sqft?.toLocaleString()} sqft` },
                { icon: Car,    label: 'Garage',    value: `${property.garage} Cars` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label}
                  className="flex flex-col items-center text-center p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50/30 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="font-bold text-gray-900 text-lg">{value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            {/* Additional specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 -mt-4">
              {[
                { label: 'Year Built', value: property.yearBuilt },
                { label: 'Floors',     value: property.floors },
                { label: 'Lot Size',   value: property.lotSize },
                { label: 'HOA Fee',    value: property.hoa },
              ].map(({ label, value }) => (
                <div key={label} className="text-center py-3 px-4 bg-white rounded-xl border border-gray-100">
                  <div className="text-sm font-semibold text-gray-900">{value}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-amber-500 rounded-full" />
                About This Property
              </h2>
              <div className={`text-gray-600 leading-relaxed text-sm space-y-3 ${showFullDesc ? '' : 'line-clamp-5'}`}>
                {(showFullDesc ? property.description : shortDesc).split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
              <button onClick={() => setShowFullDesc(!showFullDesc)}
                className="mt-3 flex items-center gap-1 text-amber-600 text-sm font-semibold hover:text-amber-700 transition-colors">
                {showFullDesc ? 'Show less' : 'Read full description'}
                <ChevronDown className={`w-4 h-4 transition-transform ${showFullDesc ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Highlights */}
            {property.highlights.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <div className="w-1 h-6 bg-amber-500 rounded-full" />
                  Property Highlights
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {property.highlights.map((h) => (
                    <motion.div key={h}
                      initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                      className="flex items-center gap-3 p-3.5 bg-gradient-to-r from-amber-50 to-transparent rounded-xl border border-amber-100">
                      <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{h}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            {Object.keys(property.amenities).length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <div className="w-1 h-6 bg-amber-500 rounded-full" />
                  Amenities & Features
                </h2>
                <AmenitiesSection amenities={property.amenities} />
              </div>
            )}

            {/* Location map */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                <div className="w-1 h-6 bg-amber-500 rounded-full" />
                Location
              </h2>
              <div className="bg-gray-100 rounded-2xl overflow-hidden h-56 relative border border-gray-200">
                <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 400 224" preserveAspectRatio="none">
                  <defs><pattern id="locGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#9CA3AF" strokeWidth="0.5"/>
                  </pattern></defs>
                  <rect width="400" height="224" fill="url(#locGrid)"/>
                  <path d="M 0 90 Q 200 70 400 100" fill="none" stroke="#D1D5DB" strokeWidth="4"/>
                  <path d="M 0 140 Q 200 120 400 150" fill="none" stroke="#D1D5DB" strokeWidth="3"/>
                  <path d="M 120 0 Q 130 110 110 224" fill="none" stroke="#D1D5DB" strokeWidth="3"/>
                  <path d="M 280 0 Q 270 110 290 224" fill="none" stroke="#D1D5DB" strokeWidth="3"/>
                </svg>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity }}
                    className="bg-amber-500 text-white rounded-xl px-4 py-2 text-sm font-bold shadow-lg flex items-center gap-2 whitespace-nowrap">
                    <MapPin className="w-4 h-4" />
                    {property.location}
                  </motion.div>
                  <div className="w-3 h-3 bg-amber-500 rotate-45 -mt-1.5 shadow-md" />
                </div>
                {property.lat !== 0 && (
                  <div className="absolute bottom-3 right-3 bg-white/90 rounded-lg px-3 py-1.5 text-xs text-gray-500 font-medium shadow-sm">
                    {property.lat.toFixed(3)}°, {property.lng.toFixed(3)}°
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right — sticky contact form */}
          <div className="lg:col-span-1">
            <ContactForm agent={property.agent} />
          </div>
        </div>

        {/* ── Similar Properties ─────────────────────────────── */}
        {similar.length > 0 && (
          <div className="mt-16 pt-10 border-t border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="section-label mb-1">More Listings</div>
                <h2 className="text-2xl font-bold text-gray-900">Similar Properties</h2>
              </div>
              <Link to="/#listings"
                className="text-sm font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {similar.map(p => <SimilarCard key={p.id} property={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
