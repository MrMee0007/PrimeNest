import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Building2, Eye, MessageSquare, TrendingUp, Users,
  Star, ArrowUpRight, MapPin, ChevronRight
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import api from '../api'
import { useNavigate } from 'react-router-dom'

const COLORS = ['#F59E0B','#60A5FA','#34D399','#A78BFA','#FB7185','#FBBF24']

function StatCard({ icon: Icon, label, value, sub, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-gray-900 rounded-2xl p-5 border border-gray-800 hover:border-gray-700 transition-colors"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <ArrowUpRight className="w-4 h-4 text-gray-600" />
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
      {sub && <div className="text-xs text-amber-400 mt-1">{sub}</div>}
    </motion.div>
  )
}

const statusColors = { new: 'bg-amber-400/15 text-amber-400', contacted: 'bg-blue-400/15 text-blue-400', closed: 'bg-green-400/15 text-green-400' }

export default function Dashboard() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gray-500 text-sm flex items-center gap-2">
        <svg className="animate-spin w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        Loading dashboard...
      </div>
    </div>
  )

  if (!data) return <div className="text-red-400 p-4">Failed to load — is the backend running?</div>

  const { overview, byType, viewsByDay, recentInq, topProperties, monthlyAdded } = data

  const statCards = [
    { icon: Building2,    label: 'Total Properties', value: overview.total,     sub: `${overview.forSale} for sale · ${overview.forRent} for rent`, color: '#F59E0B' },
    { icon: Eye,          label: 'Total Views',       value: overview.totalViews.toLocaleString(), sub: 'All-time property views', color: '#60A5FA' },
    { icon: MessageSquare,label: 'Inquiries',          value: overview.totalInq,  sub: `${overview.newInq} new unread`,  color: '#34D399' },
    { icon: Users,        label: 'Agents',             value: overview.agentCount, sub: 'Active advisors',               color: '#A78BFA' },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Welcome back. Here's what's happening.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          onClick={() => navigate('/admin/properties/new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold text-sm rounded-xl transition-colors"
        >
          + Add Property
        </motion.button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => <StatCard key={s.label} {...s} delay={i * 0.07} />)}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Views area chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-gray-900 rounded-2xl p-5 border border-gray-800"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-semibold text-white">Property Views</div>
              <div className="text-xs text-gray-500">Last 7 days</div>
            </div>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={viewsByDay.length ? viewsByDay : [{day:'Mon',views:12},{day:'Tue',views:28},{day:'Wed',views:18},{day:'Thu',views:45},{day:'Fri',views:32},{day:'Sat',views:56},{day:'Sun',views:38}]}>
              <defs>
                <linearGradient id="viewGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false}/>
              <XAxis dataKey="day" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ background: '#1F2937', border: '1px solid #374151', borderRadius: 10, color: '#F9FAFB' }}/>
              <Area type="monotone" dataKey="views" stroke="#F59E0B" strokeWidth={2.5} fill="url(#viewGrad)" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Properties by type pie */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-gray-900 rounded-2xl p-5 border border-gray-800"
        >
          <div className="text-sm font-semibold text-white mb-1">By Property Type</div>
          <div className="text-xs text-gray-500 mb-4">Distribution</div>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={byType.length ? byType : [{type:'Villa',count:4},{type:'Estate',count:2},{type:'Penthouse',count:1}]}
                dataKey="count" nameKey="type" cx="50%" cy="50%"
                innerRadius={40} outerRadius={65} paddingAngle={3}>
                {(byType.length ? byType : [{type:'Villa'},{type:'Estate'},{type:'Penthouse'}]).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]}/>
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1F2937', border: '1px solid #374151', borderRadius: 10, color: '#F9FAFB', fontSize: 12 }}/>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2">
            {(byType.length ? byType : [{type:'Villa',count:4},{type:'Estate',count:2}]).map((t, i) => (
              <div key={t.type} className="flex items-center gap-1.5 text-xs text-gray-400">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }}/>
                {t.type} ({t.count})
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Monthly added bar + top properties */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-gray-900 rounded-2xl p-5 border border-gray-800"
        >
          <div className="text-sm font-semibold text-white mb-1">New Listings</div>
          <div className="text-xs text-gray-500 mb-4">Last 6 months</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={monthlyAdded.length ? monthlyAdded : [{month:'Feb',count:2},{month:'Mar',count:5},{month:'Apr',count:3},{month:'May',count:7},{month:'Jun',count:4},{month:'Jul',count:6}]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false}/>
              <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ background: '#1F2937', border: '1px solid #374151', borderRadius: 10, color: '#F9FAFB', fontSize: 12 }}/>
              <Bar dataKey="count" fill="#F59E0B" radius={[6,6,0,0]} maxBarSize={36}/>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top properties */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="lg:col-span-3 bg-gray-900 rounded-2xl p-5 border border-gray-800"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-semibold text-white">Top Properties</div>
              <div className="text-xs text-gray-500">By views</div>
            </div>
            <button onClick={() => navigate('/admin/properties')}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3"/>
            </button>
          </div>
          <div className="space-y-3">
            {(topProperties.length ? topProperties : []).map((p, i) => (
              <div key={p.id} onClick={() => navigate(`/admin/properties/${p.id}/edit`)}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-800 transition-colors cursor-pointer group">
                <div className="text-xs font-bold text-gray-600 w-4 shrink-0">{i + 1}</div>
                <img src={p.main_img || '/hero_house.png'} alt={p.name}
                  className="w-12 h-9 rounded-lg object-cover shrink-0"/>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-gray-200 truncate">{p.name}</div>
                  <div className="text-[10px] text-gray-500 flex items-center gap-1 truncate">
                    <MapPin className="w-2.5 h-2.5"/> {p.location}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-amber-400">{p.price}</div>
                  <div className="text-[10px] text-gray-500 flex items-center gap-0.5 justify-end">
                    <Eye className="w-2.5 h-2.5"/> {p.views}
                  </div>
                </div>
              </div>
            ))}
            {!topProperties.length && (
              <div className="text-sm text-gray-600 text-center py-4">No data yet</div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent inquiries */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <div>
            <div className="text-sm font-semibold text-white">Recent Inquiries</div>
            <div className="text-xs text-gray-500">{overview.newInq} awaiting response</div>
          </div>
          <button onClick={() => navigate('/admin/inquiries')}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1">
            View all <ChevronRight className="w-3 h-3"/>
          </button>
        </div>
        <div className="divide-y divide-gray-800">
          {(recentInq.length ? recentInq : []).map(inq => (
            <div key={inq.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-800/50 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-300 shrink-0">
                {inq.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate">{inq.name}</div>
                <div className="text-[10px] text-gray-500 truncate">{inq.property_name} · {inq.email}</div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${statusColors[inq.status] || 'bg-gray-700 text-gray-400'}`}>
                  {inq.status}
                </span>
                <span className="text-[10px] text-gray-600">{new Date(inq.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
          {!recentInq.length && (
            <div className="text-sm text-gray-600 text-center py-8">No inquiries yet</div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
