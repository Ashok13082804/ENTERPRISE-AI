import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart, Users, Calendar, FileText, Activity, Brain, Stethoscope,
  Pill, TestTube, AlertCircle, TrendingUp, Plus, Search, Clock,
  Bed, UserCheck, BarChart2, ChevronRight, X, Upload, Loader2,
  FileCheck, Shield, HelpCircle, AlertTriangle, CheckCircle, RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'
import {
  AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts'

const API = 'http://localhost:8000/api/v1'

const fetchStats = () => axios.get(`${API}/healthcare/stats`).then(r => r.data)
const fetchPatients = (search?: string) => axios.get(`${API}/healthcare/patients`, { params: { search } }).then(r => r.data)
const fetchAppointments = () => axios.get(`${API}/healthcare/appointments`).then(r => r.data)
const fetchDepartments = () => axios.get(`${API}/healthcare/departments`).then(r => r.data)
const fetchLabReports = () => axios.get(`${API}/healthcare/lab-reports`).then(r => r.data)
const fetchTrends = () => axios.get(`${API}/healthcare/analytics/trends`).then(r => r.data)

export default function HealthcarePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'patients' | 'appointments' | 'diagnose' | 'drug-checker' | 'lab'>('overview')
  
  // Diagnosis States
  const [diagnosisSymptoms, setDiagnosisSymptoms] = useState('')
  const [diagnosisAge, setDiagnosisAge] = useState(35)
  const [diagnosisGender, setDiagnosisGender] = useState('Male')
  const [diagnosisResult, setDiagnosisResult] = useState<any>(null)
  
  // Drug Interaction States
  const [medsList, setMedsList] = useState('')
  const [interactionResult, setInteractionResult] = useState<any>(null)
  
  // Modals & Forms
  const [patientSearch, setPatientSearch] = useState('')
  const [showAddPatient, setShowAddPatient] = useState(false)
  const [showBookAppointment, setShowBookAppointment] = useState(false)

  const [newPatient, setNewPatient] = useState({
    name: '',
    age: 30,
    gender: 'Male',
    blood_group: 'A+',
    contact: '',
    email: '',
    address: '',
    medical_history: '',
    allergies: ''
  })

  const [newAppointment, setNewAppointment] = useState({
    patient_id: '',
    doctor: 'Dr. Mehta',
    department: 'Cardiology',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    reason: 'Routine checkup'
  })

  // Queries
  const { data: stats, refetch: refetchStats } = useQuery({ queryKey: ['healthcare-stats'], queryFn: fetchStats })
  const { data: patientsData, refetch: refetchPatients } = useQuery({ queryKey: ['patients', patientSearch], queryFn: () => fetchPatients(patientSearch) })
  const { data: aptsData, refetch: refetchAppointments } = useQuery({ queryKey: ['appointments'], queryFn: fetchAppointments })
  const { data: depsData } = useQuery({ queryKey: ['departments'], queryFn: fetchDepartments })
  const { data: labData, refetch: refetchLab } = useQuery({ queryKey: ['lab-reports'], queryFn: fetchLabReports })
  const { data: trendsData } = useQuery({ queryKey: ['healthcare-trends'], queryFn: fetchTrends })

  // Mutations
  const addPatientMutation = useMutation({
    mutationFn: () => axios.post(`${API}/healthcare/patients`, newPatient).then(r => r.data),
    onSuccess: () => {
      toast.success('Patient registered!')
      setShowAddPatient(false)
      refetchPatients()
      refetchStats()
      setNewPatient({
        name: '', age: 30, gender: 'Male', blood_group: 'A+',
        contact: '', email: '', address: '', medical_history: '', allergies: ''
      })
    },
    onError: () => toast.error('Failed to register patient'),
  })

  const bookAppointmentMutation = useMutation({
    mutationFn: () => axios.post(`${API}/healthcare/appointments`, newAppointment).then(r => r.data),
    onSuccess: () => {
      toast.success('Appointment booked!')
      setShowBookAppointment(false)
      refetchAppointments()
      refetchStats()
      setNewAppointment({
        patient_id: '', doctor: 'Dr. Mehta', department: 'Cardiology',
        date: new Date().toISOString().split('T')[0], time: '10:00', reason: 'Routine checkup'
      })
    },
    onError: () => toast.error('Failed to book appointment'),
  })

  const diagnoseMutation = useMutation({
    mutationFn: () => axios.post(`${API}/healthcare/diagnose`, {
      symptoms: diagnosisSymptoms, patient_age: diagnosisAge, patient_gender: diagnosisGender
    }).then(r => r.data),
    onSuccess: (data) => {
      setDiagnosisResult(data)
      toast.success('AI Symptom analysis complete!')
    },
    onError: () => toast.error('Diagnostic pipeline error'),
  })

  // Drug Interaction checker mutation (uses Ollama RAG model local query)
  const drugCheckerMutation = useMutation({
    mutationFn: () => {
      const prompt = `You are a medical AI pharmacist. Check the following list of medications for any potential drug-to-drug interactions:
Medications: ${medsList}

Analyze critical interactions, side effects, and outline an action plan for the patient.
At the end of your response, output a JSON block matching this schema:
INTERACTIONS_JSON: {"has_interactions": true, "severity": "High/Moderate/None", "summary": "brief summary", "interacted_drugs": ["Drug A", "Drug B"]}`;
      
      return axios.post(`${API}/chat/send`, {
        session_id: 1, // simulated session
        message: prompt
      }).then(r => r.data)
    },
    onSuccess: (data) => {
      const respText = data.response || ''
      let jsonParsed: any = { has_interactions: false, severity: 'None', summary: 'No significant interactions detected.', interacted_drugs: [] }
      if (respText.includes('INTERACTIONS_JSON:')) {
        try {
          const jsonStr = respText.split('INTERACTIONS_JSON:')[-1].trim()
          jsonParsed = JSON.parse(jsonStr)
        } catch (e) {}
      } else {
        // Simple regex fallback
        const hasInter = respText.toLowerCase().includes('warning') || respText.toLowerCase().includes('interaction')
        jsonParsed = {
          has_interactions: hasInter,
          severity: hasInter ? 'Moderate' : 'None',
          summary: respText.slice(0, 300) + '...',
          interacted_drugs: medsList.split(',').slice(0, 2)
        }
      }
      setInteractionResult({
        raw_analysis: respText,
        ...jsonParsed
      })
      toast.success('Local RAG drug check complete!')
    },
    onError: () => toast.error('Interaction checking failed'),
  })

  return (
    <div className="p-6 space-y-6 max-w-[1500px] mx-auto">
      
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/20">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Healthcare Intelligence</h1>
            <p className="text-xs text-white/40">AI Clinical Diagnostic Systems & Local RAG Drug Interaction Checker</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 font-semibold">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>AI Diagnostic Engine Active</span>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-3">
        {[
          { id: 'overview', label: '🏥 Hospital Overview' },
          { id: 'patients', label: '👥 Patients Database' },
          { id: 'appointments', label: '📅 Appointments' },
          { id: 'diagnose', label: '🩺 AI Symptom Diagnostic' },
          { id: 'drug-checker', label: '💊 Drug Interaction Checker' },
          { id: 'lab', label: '🧪 Lab Reports & Trends' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
              activeTab === t.id
                ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white border-transparent shadow-lg shadow-red-500/10'
                : 'text-white/50 border-white/10 hover:text-white hover:bg-white/5'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        
        {/* Tab 1: Hospital Overview */}
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            
            {/* Stats Dashboard */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Registrations', value: stats?.total_patients || '2,847', icon: Users, color: 'from-blue-500 to-indigo-500' },
                { label: 'Today Appointments', value: stats?.today_appointments || '124', icon: Calendar, color: 'from-amber-500 to-orange-500' },
                { label: 'Bed Occupancy', value: `${stats?.beds_occupied || 186}/${stats?.total_beds || 250}`, icon: Bed, color: 'from-emerald-500 to-teal-500' },
                { label: 'Doctors Available', value: stats?.doctors_available || '34', icon: Stethoscope, color: 'from-pink-500 to-rose-500' },
              ].map(stat => (
                <div key={stat.label} className="glass-card p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-white/40 leading-tight">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Department Capacity list */}
              <div className="lg:col-span-6 glass-card p-5 space-y-4">
                <h4 className="text-white font-semibold text-xs flex items-center gap-2">
                  <Activity className="w-4 h-4 text-red-400" />
                  Active Clinical Departments
                </h4>
                
                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                  {depsData?.departments?.map((dep: any) => (
                    <div key={dep.name} className="bg-white/5 rounded-xl p-3 border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                          <Stethoscope className="w-4 h-4 text-red-400" />
                        </div>
                        <div>
                          <div className="text-white text-xs font-semibold">{dep.name}</div>
                          <div className="text-[10px] text-white/40">Head: {dep.head}</div>
                        </div>
                      </div>
                      <div className="text-right text-xs">
                        <div className="text-white/80 font-bold">{dep.doctors} Doctors</div>
                        <div className="text-[10px] text-white/40">{dep.beds} Beds Staged</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Latest Appointments timeline */}
              <div className="lg:col-span-6 glass-card p-5 space-y-4">
                <h4 className="text-white font-semibold text-xs flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  Upcoming Patient Appointments
                </h4>

                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                  {aptsData?.appointments?.map((apt: any) => (
                    <div key={apt.id} className="bg-white/5 rounded-xl p-3 border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                          <UserCheck className="w-4 h-4 text-amber-400" />
                        </div>
                        <div>
                          <div className="text-white text-xs font-semibold">{apt.patient}</div>
                          <div className="text-[10px] text-white/40">Consultant: {apt.doctor} ({apt.department})</div>
                        </div>
                      </div>
                      <div className="text-right text-xs">
                        <div className="text-amber-400 font-mono font-semibold">{apt.time}</div>
                        <div className="text-[10px] text-white/40">{apt.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* Tab 2: Patients Database */}
        {activeTab === 'patients' && (
          <motion.div key="patients" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            
            {/* Action Bar */}
            <div className="flex justify-between items-center gap-4">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  placeholder="Search patients by name or ID..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-red-500/50"
                />
              </div>
              <motion.button
                onClick={() => setShowAddPatient(true)}
                whileHover={{ scale: 1.02 }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Register Patient
              </motion.button>
            </div>

            {/* Patients List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {patientsData?.patients?.map((patient: any) => (
                <div key={patient.id} className="glass-card p-4 space-y-3 relative overflow-hidden border-white/10">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-white text-xs">
                        {patient.blood_group}
                      </div>
                      <div>
                        <div className="text-white text-xs font-semibold leading-tight">{patient.name}</div>
                        <div className="text-[10px] text-white/40 mt-0.5">ID: {patient.id} · {patient.age}y/o {patient.gender}</div>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                      patient.status === 'Critical' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                      patient.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      'bg-white/5 text-white/40 border border-white/10'
                    }`}>
                      {patient.status}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-white/5 text-[11px] text-white/50 space-y-1">
                    <div>Contact: <span className="text-white/80 font-mono">{patient.contact}</span></div>
                    {patient.allergies && <div className="text-red-400/80">Allergies: {patient.allergies}</div>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tab 3: Appointments */}
        {activeTab === 'appointments' && (
          <motion.div key="appointments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            
            <div className="flex justify-end mb-2">
              <motion.button
                onClick={() => setShowBookAppointment(true)}
                whileHover={{ scale: 1.02 }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Book Appointment
              </motion.button>
            </div>

            {/* List */}
            <div className="glass-card p-5">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-white/40 pb-2">
                      <th className="py-2">APPOINTMENT ID</th>
                      <th className="py-2">PATIENT</th>
                      <th className="py-2">DEPARTMENT</th>
                      <th className="py-2">DOCTOR</th>
                      <th className="py-2 font-mono">DATE / TIME</th>
                      <th className="py-2">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aptsData?.appointments?.map((apt: any) => (
                      <tr key={apt.id} className="border-b border-white/5 text-white/70 hover:bg-white/5 transition-colors">
                        <td className="py-3 font-mono font-semibold text-red-400">{apt.id}</td>
                        <td className="py-3 font-medium text-white">{apt.patient}</td>
                        <td className="py-3">{apt.department}</td>
                        <td className="py-3">{apt.doctor}</td>
                        <td className="py-3 font-mono">{apt.date} at {apt.time}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            apt.status === 'Confirmed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {apt.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 4: AI Symptoms Diagnostic */}
        {activeTab === 'diagnose' && (
          <motion.div key="diagnose" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Diagnosis Input */}
            <div className="lg:col-span-7 glass-card p-5 space-y-4">
              <h3 className="text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                <Stethoscope className="w-4.5 h-4.5 text-red-400 animate-pulse" />
                AI Clinical Symptoms Analysis
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-white/40 block mb-1.5 uppercase">Enter Symptoms</label>
                  <textarea
                    value={diagnosisSymptoms}
                    onChange={e => setDiagnosisSymptoms(e.target.value)}
                    placeholder="Describe symptoms in detail, e.g. dry cough, mild chest pain, shortness of breath..."
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500/50 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-white/40 block mb-1.5 uppercase">Patient Age</label>
                    <input
                      type="number"
                      value={diagnosisAge}
                      onChange={e => setDiagnosisAge(parseInt(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/40 block mb-1.5 uppercase">Patient Gender</label>
                    <select
                      value={diagnosisGender}
                      onChange={e => setDiagnosisGender(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <motion.button
                  onClick={() => diagnoseMutation.mutate()}
                  disabled={diagnoseMutation.isPending || !diagnosisSymptoms}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 animate-pulse"
                >
                  {diagnoseMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                  Generate AI Diagnostic Report
                </motion.button>
              </div>
            </div>

            {/* Diagnostic Report Preview */}
            <div className="lg:col-span-5">
              <div className="glass-card p-5 h-full min-h-[380px] flex flex-col justify-between">
                <div className="text-xs text-white/40 mb-3 block font-bold tracking-wider uppercase">Clinical AI Diagnostics Report</div>

                {diagnoseMutation.isPending ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
                    <span className="text-xs text-white/50 font-semibold">Running local RAG models...</span>
                  </div>
                ) : diagnosisResult ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                    <div className="bg-red-500/5 rounded-2xl border border-red-500/30 p-5 relative overflow-hidden">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] text-white/40 uppercase font-bold">PREDICTED CONDITION</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                          diagnosisResult.severity === 'Critical' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                          diagnosisResult.severity === 'Moderate' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {diagnosisResult.severity}
                        </span>
                      </div>
                      
                      <h4 className="text-white font-bold text-md capitalize leading-tight">{diagnosisResult.ai_diagnosis}</h4>
                      <div className="text-[10px] text-indigo-400 mt-1 font-semibold">Match Confidence: {Math.round(diagnosisResult.confidence_score * 100)}%</div>

                      <div className="my-4 border-y border-white/5 py-3 space-y-1.5 text-xs text-white/80">
                        <div>Recommended Specialist: <span className="text-red-400 font-bold">{diagnosisResult.recommended_specialist}</span></div>
                        <div>Follow-up Period: <span className="text-white font-bold font-mono">{diagnosisResult.follow_up_days} Days</span></div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-[10px] text-white/40 font-bold uppercase tracking-wider">PRESCRIBED FIRST-AID MEDS</div>
                        <div className="flex flex-wrap gap-1.5">
                          {diagnosisResult.recommended_medicines?.map((med: string) => (
                            <span key={med} className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs text-white/80 font-mono">
                              {med}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-black/30 rounded-xl p-3 border border-white/5 text-[10px] text-white/60 leading-relaxed max-h-32 overflow-y-auto">
                      <div className="font-bold text-white/70 mb-1">RAG Diagnostics Evidence:</div>
                      {diagnosisResult.ai_notes}
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <Stethoscope className="w-8 h-8 text-white/20" />
                    </div>
                    <div>
                      <div className="text-white/40 text-xs font-semibold">Diagnostics Console Ready</div>
                      <div className="text-white/20 text-[11px] mt-1">Submit patient symptoms to generate analysis report</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 5: Drug Interaction Checker */}
        {activeTab === 'drug-checker' && (
          <motion.div key="drug-checker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Input list */}
            <div className="lg:col-span-7 glass-card p-5 space-y-4">
              <h3 className="text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                <Pill className="w-4.5 h-4.5 text-rose-500 animate-pulse" />
                Drug-to-Drug Interaction Checker
              </h3>
              <p className="text-xs text-white/40">
                Enter multiple medications to check for safety alerts, critical combinations, and local healthcare RAG side effect summaries.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-white/40 block mb-1.5 uppercase">Enter Drugs (Comma Separated)</label>
                  <input
                    type="text"
                    value={medsList}
                    onChange={e => setMedsList(e.target.value)}
                    placeholder="e.g. Aspirin, Warfarin, Ibuprofen"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-rose-500/50"
                  />
                </div>

                <motion.button
                  onClick={() => drugCheckerMutation.mutate()}
                  disabled={drugCheckerMutation.isPending || !medsList}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {drugCheckerMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                  Check Interactions
                </motion.button>
              </div>
            </div>

            {/* Interaction Analysis Output */}
            <div className="lg:col-span-5">
              <div className="glass-card p-5 h-full min-h-[380px] flex flex-col justify-between">
                <div className="text-xs text-white/40 mb-3 block font-bold tracking-wider uppercase">Pharmacology Safety Report</div>

                {drugCheckerMutation.isPending ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
                    <span className="text-xs text-white/50 font-semibold">Running local pharmacology check...</span>
                  </div>
                ) : interactionResult ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                    <div className={`p-4 rounded-xl border ${
                      interactionResult.has_interactions ? 'bg-red-500/5 border-red-500/30' : 'bg-emerald-500/5 border-emerald-500/30'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {interactionResult.has_interactions ? (
                          <>
                            <AlertTriangle className="w-4.5 h-4.5 text-red-400" />
                            <span className="font-bold text-sm text-red-400">{interactionResult.severity} Interaction Alert</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4.5 h-4.5 text-emerald-400" />
                            <span className="font-bold text-sm text-emerald-400">No Interactions Found</span>
                          </>
                        )}
                      </div>
                      
                      <p className="text-xs text-white/70 leading-relaxed mb-3">
                        {interactionResult.summary}
                      </p>

                      {interactionResult.interacted_drugs?.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[9px] text-white/40 uppercase block">Flags Raised For:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {interactionResult.interacted_drugs.map((d: string) => (
                              <span key={d} className="px-1.5 py-0.5 rounded bg-red-400/10 text-red-300 border border-red-400/20 text-[10px] font-mono">
                                {d}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-black/30 rounded-xl p-3 border border-white/5 text-[10px] text-white/60 leading-relaxed max-h-32 overflow-y-auto font-mono">
                      <div className="font-bold text-white/70 mb-1">Pharmacist RAG Evidence:</div>
                      {interactionResult.raw_analysis}
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <Pill className="w-8 h-8 text-white/20" />
                    </div>
                    <div>
                      <div className="text-white/40 text-xs font-semibold">Interaction Engine Standby</div>
                      <div className="text-white/20 text-[11px] mt-1">Submit multiple medications to verify safety levels</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 6: Lab Reports & Trends */}
        {activeTab === 'lab' && (
          <motion.div key="lab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            
            {/* Lab Reports List */}
            <div className="glass-card p-5 space-y-4">
              <h4 className="text-white font-semibold text-xs flex items-center gap-2">
                <TestTube className="w-4 h-4 text-emerald-400" />
                Latest Lab Diagnosis Reports
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {labData?.reports?.map((report: any) => (
                  <div key={report.id} className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-3 relative overflow-hidden">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] text-red-400 font-mono font-semibold">{report.id}</span>
                        <div className="text-white text-xs font-semibold mt-0.5">{report.patient}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                        report.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {report.status}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-white/5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-white/40">Test:</span>
                        <span className="text-white/80 font-bold">{report.test}</span>
                      </div>
                      {report.result && (
                        <div className="flex justify-between mt-1">
                          <span className="text-white/40">Result:</span>
                          <span className={`font-semibold ${report.result.includes('Abnormal') ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                            {report.result}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trends Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Patient Trends chart */}
              <div className="lg:col-span-8 glass-card p-5">
                <h4 className="text-white font-semibold text-xs flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  Monthly Hospital Admissions
                </h4>
                {trendsData?.monthly_patients?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={trendsData.monthly_patients.map((val: number, idx: number) => ({ month: `M${idx + 1}`, admissions: val }))}>
                      <defs>
                        <linearGradient id="patientChartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                      <Area type="monotone" dataKey="admissions" stroke="#ef4444" fill="url(#patientChartGrad)" strokeWidth={2} name="Patients Admitted" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[240px] text-white/20 text-xs">
                    No admission trends loaded
                  </div>
                )}
              </div>

              {/* Readmission statistics */}
              <div className="lg:col-span-4 glass-card p-5 space-y-4">
                <h4 className="text-white font-semibold text-xs flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-red-400" />
                  Quality Care Metrics
                </h4>

                <div className="space-y-3 pt-2">
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-center">
                    <div className="text-[10px] text-white/40 uppercase">Readmission Rate</div>
                    <div className="text-2xl font-bold text-red-400 mt-1">{trendsData?.readmission_rate || '8.4'}%</div>
                    <div className="text-[9px] text-white/30 mt-0.5">National Standard limit: 10%</div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-center">
                    <div className="text-[10px] text-white/40 uppercase">Average Length of Stay</div>
                    <div className="text-2xl font-bold text-emerald-400 mt-1">{trendsData?.avg_los_days || '4.2'} Days</div>
                    <div className="text-[9px] text-white/30 mt-0.5">Efficient clinical rotations</div>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Add Patient Modal */}
      {showAddPatient && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card max-w-lg w-full p-6 space-y-4">
            
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-white font-bold text-sm">Register New Patient File</span>
              <button onClick={() => setShowAddPatient(false)} className="text-white/40 hover:text-white/70">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-[10px] text-white/40 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={newPatient.name}
                  onChange={e => setNewPatient(p => ({ ...p, name: e.target.value }))}
                  placeholder="John Doe"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-white/40 block mb-1">Age</label>
                  <input
                    type="number"
                    value={newPatient.age}
                    onChange={e => setNewPatient(p => ({ ...p, age: parseInt(e.target.value) }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 block mb-1">Blood Group</label>
                  <input
                    type="text"
                    value={newPatient.blood_group}
                    onChange={e => setNewPatient(p => ({ ...p, blood_group: e.target.value }))}
                    placeholder="O+"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-white/40 block mb-1">Contact Number</label>
                <input
                  type="text"
                  value={newPatient.contact}
                  onChange={e => setNewPatient(p => ({ ...p, contact: e.target.value }))}
                  placeholder="98765..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-white/40 block mb-1">Email (Optional)</label>
                <input
                  type="email"
                  value={newPatient.email}
                  onChange={e => setNewPatient(p => ({ ...p, email: e.target.value }))}
                  placeholder="john@hospital.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="text-[10px] text-white/40 block mb-1">Allergies / Critical Symptoms</label>
              <input
                type="text"
                value={newPatient.allergies}
                onChange={e => setNewPatient(p => ({ ...p, allergies: e.target.value }))}
                placeholder="e.g. Penicillin allergy"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowAddPatient(false)}
                className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 text-xs font-semibold"
              >
                Cancel
              </button>
              
              <button
                onClick={() => addPatientMutation.mutate()}
                disabled={addPatientMutation.isPending || !newPatient.name}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-semibold"
              >
                Save Registration
              </button>
            </div>

          </motion.div>
        </div>
      )}

      {/* Book Appointment Modal */}
      {showBookAppointment && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card max-w-sm w-full p-6 space-y-4">
            
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-white font-bold text-sm">Schedule Clinical Visit</span>
              <button onClick={() => setShowBookAppointment(false)} className="text-white/40 hover:text-white/70">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-white/40 block mb-1">Select Patient ID</label>
                <select
                  value={newAppointment.patient_id}
                  onChange={e => setNewAppointment(p => ({ ...p, patient_id: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  <option value="">Choose patient...</option>
                  {patientsData?.patients?.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-white/40 block mb-1">Department</label>
                  <select
                    value={newAppointment.department}
                    onChange={e => setNewAppointment(p => ({ ...p, department: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Gynecology">Gynecology</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-white/40 block mb-1">Doctor</label>
                  <input
                    type="text"
                    value={newAppointment.doctor}
                    onChange={e => setNewAppointment(p => ({ ...p, doctor: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-white/40 block mb-1">Date</label>
                  <input
                    type="date"
                    value={newAppointment.date}
                    onChange={e => setNewAppointment(p => ({ ...p, date: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 block mb-1">Time</label>
                  <input
                    type="time"
                    value={newAppointment.time}
                    onChange={e => setNewAppointment(p => ({ ...p, time: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-white/40 block mb-1">Reason for consultation</label>
                <input
                  type="text"
                  value={newAppointment.reason}
                  onChange={e => setNewAppointment(p => ({ ...p, reason: e.target.value }))}
                  placeholder="Routine checkup"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowBookAppointment(false)}
                  className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 text-xs font-semibold"
                >
                  Cancel
                </button>
                
                <button
                  onClick={() => bookAppointmentMutation.mutate()}
                  disabled={bookAppointmentMutation.isPending || !newAppointment.patient_id}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-semibold"
                >
                  Confirm Slot
                </button>
              </div>
            </div>

          </motion.div>
        </div>
      )}

    </div>
  )
}

const TOOLTIP_STYLE = {
  background: '#0d1520',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  fontSize: 10,
  color: '#fff'
}
