// Public API helper (no auth token needed)
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

export async function fetchProperties(params = {}) {
  const qs = new URLSearchParams(params).toString()
  const res = await fetch(`${BASE_URL}/properties${qs ? '?' + qs : ''}`)
  if (!res.ok) throw new Error('Failed to fetch properties')
  return res.json()
}

export async function fetchProperty(id) {
  const res = await fetch(`${BASE_URL}/properties/${id}`)
  if (!res.ok) throw new Error('Property not found')
  return res.json()
}
