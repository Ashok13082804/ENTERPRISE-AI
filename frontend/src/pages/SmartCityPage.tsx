import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2, Wind, Car, Camera, Trash2, Droplets,
  AlertTriangle, MapPin, BarChart2, Activity, Zap, Eye,
  Thermometer, RefreshCw, Wifi, Radio, Navigation, CloudRain
} from 'lucide-react'
import { AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts'
import axios from 'axios'

const API = 'http://localhost:8000/api/v1'
const TOOLTIP_STYLE = { background: '#0d1520', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: 10, color: '#fff' }

export default function SmartCityPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'traffic' | 'aqi' | 'parking' | 'surveillance' | 'garbage' | 'emergency'>('overview')

  const { data: stats } = useQuery({ queryKey: ['smartcity-stats'], queryFn: () => axios.get(`${API}/smartcity/stats`).then(r => r.data) })
  const { data: trafficData } = useQuery({ queryKey: ['traffic'], queryFn: () => axios.get(`${API}/smartcity/traffic`).then(r => r.data), enabled: activeTab === 'traffic' })
  const { data: aqiData } = useQuery({ queryKey: ['aqi'], queryFn: () => axios.get(`${API}/smartcity/aqi`).then(r => r.data), enabled: activeTab === 'aqi' })
  const { data: parkingData } = useQuery({ queryKey: ['parking'], queryFn: () => axios.get(`${API}/smartcity/parking`).then(r => r.data), enabled: activeTab === 'parking' })
  const { data: alertsData } = useQuery({ queryKey: ['city-alerts'], queryFn: () => axios.get(`${API}/smartcity/alerts`).then(r => r.data) })
  const { data: garbageData } = useQuery({ queryKey: ['garbage'], queryFn: () => axios.get(`${API}/smartcity/garbage`).then(r => r.data), enabled: activeTab === 'garbage' })
  const { data: emergencyData } = useQuery({ queryKey: ['emergency'], queryFn: () => axios.get(`${API}/smartcity/emergency`).then(r => r.data), enabled: activeTab === 'emergency' })

  const TABS = [
    { id: 'overview', label: '🏙️ City Overview', icon: Building2 },
    { id: 'traffic', label: '🚦 Traffic', icon: Car },
    { id: 'aqi', label: '🌬️ Air Quality', icon: Wind },
    { id: 'parking', label: '🅿️ Parking', icon: Navigation },
    { id: 'surveillance', label: '📷 Surveillance', icon: Camera },
    { id: 'garbage', label: '♻️ Waste Mgmt', icon: Trash2 },
    { id: 'emergency', label: '🚨 Emergency', icon: AlertTriangle },
  ]

  const congestionColor = (level: string) => ({
    'Low': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    'Medium': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    'High': 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    'Critical': 'text-red-400 bg-red-500/10 border-red-500/30',
  }[level] || 'text-white/40 bg-white/5 border-white/10')

  const aqiColor = (aqi: number) => aqi <= 50 ? '#10b981' : aqi <= 100 ? '#f59e0b' : aqi <= 150 ? '#f97316' : '#ef4444'
  const aqiLabel = (aqi: number) => aqi <= 50 ? 'Good' : aqi <= 100 ? 'Moderate' : aqi <= 150 ? 'Sensitive Groups' : 'Unhealthy'

  const STATS_CARDS = [
    { label: 'Active Sensors', value: stats?.total_sensors?.toLocaleString() || '12,450', icon: Wifi, color: 'from-teal-500 to-cyan-500' },
    { label: 'Live Cameras', value: stats?.active_cameras || '1,240', icon: Camera, color: 'from-violet-500 to-purple-500' },
    { label: 'Avg AQI Score', value: stats?.city_aqi || '87', icon: Wind, color: 'from-blue-500 to-sky-500' },
    { label: 'Active Alerts', value: alertsData?.alerts?.filter((a: any) => a.status === 'Active')?.length || 0, icon: AlertTriangle, color: 'from-red-500 to-rose-500' },
  ]

  const MOCK_TRAFFIC_TREND = ['6am','8am','10am','12pm','2pm','4pm','6pm','8pm'].map((t, i) => ({
    time: t, vehicles: [1200, 3400, 2100, 2800, 2300, 3800, 4200, 1800][i]
  }))

  return (
    <div className="p-6 space-y-6 max-w-[1500px] mx-auto">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Smart City Command Center</h1>
            <p className="text-xs text-white/40">Real-Time Urban Intelligence — Traffic, Air Quality, Surveillance & Emergency Response</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-xs text-teal-400 font-semibold">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            All Systems Operational
          </div>
          <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/40 flex items-center gap-1">
            <Radio className="w-3.5 h-3.5" /> Live Feed Active
          </div>
        </div>
      </motion.div>

      {/* Live Alert Strip */}
      {alertsData?.alerts?.filter((a: any) => a.status === 'Active').length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-6 px-6 scrollbar-none">
          {alertsData.alerts.filter((a: any) => a.status === 'Active').slice(0, 5).map((alert: any) => (
            <div key={alert.id} className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold ${
              alert.severity === 'Critical' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
              <AlertTriangle className="w-3 h-3 animate-pulse" />{alert.type} · {alert.location}
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-3">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
              activeTab === t.id
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-transparent shadow-md'
                : 'text-white/50 border-white/10 hover:text-white hover:bg-white/5'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* Overview */}
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {STATS_CARDS.map(s => (
                <div key={s.label} className="glass-card p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center flex-shrink-0`}>
                    <s.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">{s.value}</div>
                    <div className="text-[10px] text-white/40">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 glass-card p-5">
                <h4 className="text-white font-semibold text-xs mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-400" /> Hourly Vehicle Volume Today
                </h4>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={MOCK_TRAFFIC_TREND}>
                    <defs>
                      <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Area type="monotone" dataKey="vehicles" stroke="#14b8a6" fill="url(#trafficGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-card p-5 space-y-4">
                <h4 className="text-white font-semibold text-xs flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-teal-400" /> City Health Indicators
                </h4>
                {[
                  { label: 'Water Supply', value: stats?.water_supply_level || 87, color: 'blue' },
                  { label: 'Power Grid', value: stats?.power_grid_load || 72, color: 'amber' },
                  { label: 'Road Health', value: stats?.road_health_score || 65, color: 'teal' },
                  { label: 'Waste Coverage', value: stats?.waste_coverage || 93, color: 'emerald' },
                ].map(m => (
                  <div key={m.label} className="space-y-1">
                    <div className="flex justify-between text-[10px] text-white/50">
                      <span>{m.label}</span>
                      <span className="text-white font-mono">{m.value}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full bg-${m.color}-500 transition-all duration-700`} style={{ width: `${m.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Traffic */}
        {activeTab === 'traffic' && (
          <motion.div key="traffic" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
            <div className="glass-card p-5">
              <h4 className="text-white font-semibold text-xs mb-4 flex items-center gap-2">
                <Car className="w-4 h-4 text-amber-400" /> Live Traffic by Junction
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {(trafficData?.zones || []).map((zone: any) => (
                  <div key={zone.id} className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-white font-semibold text-xs">{zone.zone}</div>
                        <div className="text-[10px] text-white/40 mt-0.5 flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{zone.camera_location}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${congestionColor(zone.congestion_level)}`}>{zone.congestion_level}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-white/40">Vehicles/min</span>
                      <span className="text-white font-mono font-bold">{zone.vehicles_per_minute}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-white/40">Avg Speed</span>
                      <span className="text-teal-400 font-mono font-bold">{zone.avg_speed_kmh} km/h</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-white/40">Signal Mode</span>
                      <span className={`font-semibold ${zone.signal_status === 'Green' ? 'text-emerald-400' : zone.signal_status === 'Red' ? 'text-red-400' : 'text-amber-400'}`}>{zone.signal_status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* AQI */}
        {activeTab === 'aqi' && (
          <motion.div key="aqi" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="glass-card p-5 space-y-4">
                <h4 className="text-white font-semibold text-xs flex items-center gap-2">
                  <Wind className="w-4 h-4 text-sky-400" /> Air Quality Stations
                </h4>
                <div className="space-y-3">
                  {(aqiData?.zones || []).map((z: any) => (
                    <div key={z.id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-white font-semibold text-xs">{z.zone}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold" style={{ color: aqiColor(z.aqi) }}>AQI {z.aqi}</span>
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-white/5 border border-white/10" style={{ color: aqiColor(z.aqi) }}>{aqiLabel(z.aqi)}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-[9px] text-white/50">
                        {[['PM2.5', z.pm25], ['PM10', z.pm10], ['CO₂', z.co2], ['Temp', `${z.temperature}°`]].map(([l, v]) => (
                          <div key={l} className="text-center"><div className="text-white font-semibold text-[10px] mb-0.5">{v}</div><div>{l}</div></div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass-card p-5">
                <h4 className="text-white font-semibold text-xs mb-4 flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-orange-400" /> City-Wide Air Pollutant Distribution
                </h4>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={(aqiData?.zones || []).slice(0, 6)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis type="category" dataKey="zone" tick={{ fontSize: 9, fill: '#64748b' }} width={80} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey="aqi" fill="#14b8a6" radius={[0, 4, 4, 0]} name="AQI" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}

        {/* Parking */}
        {activeTab === 'parking' && (
          <motion.div key="parking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
            <div className="glass-card p-5">
              <h4 className="text-white font-semibold text-xs mb-4 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-violet-400" /> Smart Parking Availability
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(parkingData?.lots || []).map((lot: any) => {
                  const pct = Math.round((lot.available / lot.total_spaces) * 100)
                  return (
                    <div key={lot.id} className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                      <div className="flex justify-between">
                        <div>
                          <div className="text-white font-semibold text-xs">{lot.name}</div>
                          <div className="text-[10px] text-white/40 mt-0.5 flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{lot.location}</div>
                        </div>
                        <span className={`text-sm font-bold ${pct > 40 ? 'text-emerald-400' : pct > 15 ? 'text-amber-400' : 'text-red-400'}`}>{lot.available} free</span>
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] text-white/40 mb-1">
                          <span>Occupancy</span>
                          <span>{100 - pct}%</span>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-700 ${pct > 40 ? 'bg-emerald-500' : pct > 15 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${100 - pct}%` }} />
                        </div>
                      </div>
                      <div className="flex justify-between text-[10px] text-white/50">
                        <span>Total: {lot.total_spaces}</span>
                        <span>{lot.ev_charging && '⚡ EV Charging'} {lot.disabled_spots && '♿ Disabled'}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Surveillance */}
        {activeTab === 'surveillance' && (
          <motion.div key="surveillance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="glass-card p-5">
              <h4 className="text-white font-semibold text-xs mb-4 flex items-center gap-2">
                <Camera className="w-4 h-4 text-violet-400" /> CCTV Surveillance Grid
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {(stats?.surveillance_summary?.cameras?.slice(0, 12) || Array.from({ length: 8 }, (_, i) => ({
                  id: `CAM-${100 + i}`,
                  location: ['Main Gate', 'Market Junction', 'Highway Entry', 'Railway Station', 'Bus Depot', 'Temple Road', 'Hospital Cross', 'School Zone'][i],
                  status: i % 5 === 0 ? 'Offline' : 'Online',
                  incidents: Math.floor(Math.random() * 3),
                }))).map((cam: any, i: number) => (
                  <div key={cam.id || i} className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="aspect-video bg-black/50 rounded-lg mb-2 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-teal-500 to-cyan-900" />
                      <Camera className={`w-6 h-6 ${cam.status === 'Online' ? 'text-teal-400' : 'text-red-400'}`} />
                      {cam.status === 'Online' && (
                        <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" title="Recording" />
                      )}
                    </div>
                    <div className="text-[10px] text-white font-semibold">{cam.location}</div>
                    <div className="flex justify-between mt-1 text-[9px]">
                      <span className={cam.status === 'Online' ? 'text-emerald-400' : 'text-red-400'}>{cam.status}</span>
                      {cam.incidents > 0 && <span className="text-amber-400">{cam.incidents} incidents</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Garbage */}
        {activeTab === 'garbage' && (
          <motion.div key="garbage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
            <div className="glass-card p-5">
              <h4 className="text-white font-semibold text-xs mb-4 flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-emerald-400" /> Waste Bin Monitoring
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(garbageData?.bins || []).map((bin: any) => {
                  const fillPct = bin.fill_level || Math.floor(Math.random() * 100)
                  return (
                    <div key={bin.id} className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center gap-4">
                      <div className="relative w-10 flex flex-col-reverse rounded overflow-hidden bg-white/5 border border-white/10" style={{ height: 60 }}>
                        <div className={`rounded transition-all duration-500 ${fillPct > 85 ? 'bg-red-500' : fillPct > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ height: `${fillPct}%` }} />
                      </div>
                      <div className="flex-1">
                        <div className="text-white text-xs font-semibold">{bin.location}</div>
                        <div className="text-[10px] text-white/40 mt-0.5">Zone: {bin.zone} · Type: {bin.type}</div>
                        <div className="flex justify-between mt-2 text-[10px]">
                          <span className={fillPct > 85 ? 'text-red-400' : fillPct > 60 ? 'text-amber-400' : 'text-emerald-400'}>
                            {fillPct}% Full
                          </span>
                          <span className={`font-semibold ${bin.collection_needed ? 'text-red-400' : 'text-emerald-400'}`}>
                            {bin.collection_needed ? '⚠️ Collection Needed' : '✅ OK'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Emergency */}
        {activeTab === 'emergency' && (
          <motion.div key="emergency" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
            <div className="glass-card p-5">
              <h4 className="text-white font-semibold text-xs mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" /> Active Emergency Incidents
              </h4>
              <div className="space-y-3">
                {(emergencyData?.incidents || alertsData?.alerts || []).map((inc: any, i: number) => (
                  <div key={inc.id || i} className={`p-4 rounded-xl border flex items-center gap-4 ${inc.severity === 'Critical' ? 'bg-red-500/10 border-red-500/30' : 'bg-amber-500/5 border-amber-500/20'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${inc.severity === 'Critical' ? 'bg-red-500/20' : 'bg-amber-500/20'}`}>
                      <AlertTriangle className={`w-5 h-5 ${inc.severity === 'Critical' ? 'text-red-400 animate-pulse' : 'text-amber-400'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-semibold text-xs">{inc.type}</div>
                      <div className="text-[10px] text-white/40 mt-0.5 flex items-center gap-2">
                        <MapPin className="w-2.5 h-2.5" /> {inc.location}
                        {inc.units_dispatched && <span>· {inc.units_dispatched} units dispatched</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${inc.severity === 'Critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>{inc.severity}</span>
                      {inc.response_time_minutes && (
                        <div className="text-[10px] text-white/40 mt-1">ETA: {inc.response_time_minutes} min</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
