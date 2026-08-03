import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Briefcase, Users, FileText, Star, BarChart2, Brain, Upload,
  Search, Plus, Loader2, ChevronRight, Target, TrendingUp, Award,
  Clock, CheckCircle, Code, MessageSquare, X, HelpCircle, AlertCircle, Play, FileCheck
} from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

const API = 'http://localhost:8000/api/v1'

const fetchStats = () => axios.get(`${API}/recruitment/stats`).then(r => r.data)
const fetchCandidates = () => axios.get(`${API}/recruitment/candidates`).then(r => r.data)
const fetchJobs = () => axios.get(`${API}/recruitment/jobs`).then(r => r.data)
const fetchFunnel = () => axios.get(`${API}/recruitment/analytics/funnel`).then(r => r.data)

export default function RecruitmentPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'candidates' | 'jobs' | 'resume' | 'recommendations' | 'quiz'>('overview')
  
  // Resume state
  const [resumeText, setResumeText] = useState('')
  const [jobDesc, setJobDesc] = useState('')
  const [resumeResult, setResumeResult] = useState<any>(null)

  // Quiz state
  const [quizTopic, setQuizTopic] = useState('Data Structures')
  const [quizQuestions, setQuizQuestions] = useState<any[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({}) // question index -> selected option index
  const [showQuizResults, setShowQuizResults] = useState(false)
  const [quizActive, setQuizActive] = useState(false)

  // Recommendations state
  const [userSkills, setUserSkills] = useState('React, Python, Machine Learning')
  const [recommendationsData, setRecommendationsData] = useState<any>(null)

  // Forms
  const [showPostJob, setShowPostJob] = useState(false)
  const [newJob, setNewJob] = useState({
    title: '',
    department: 'Engineering',
    experience_years: 3,
    skills_required: '',
    description: '',
    salary_min: 600000,
    salary_max: 1200000
  })

  // Queries
  const { data: stats, refetch: refetchStats } = useQuery({ queryKey: ['recruitment-stats'], queryFn: fetchStats })
  const { data: candidatesData } = useQuery({ queryKey: ['candidates'], queryFn: fetchCandidates })
  const { data: jobsData, refetch: refetchJobs } = useQuery({ queryKey: ['jobs'], queryFn: fetchJobs })

  // Mutations
  const postJobMutation = useMutation({
    mutationFn: () => {
      const skills = newJob.skills_required.split(',').map(s => s.trim()).filter(Boolean)
      return axios.post(`${API}/recruitment/jobs`, {
        ...newJob,
        skills_required: skills
      }).then(r => r.data)
    },
    onSuccess: () => {
      toast.success('Job posted successfully!')
      setShowPostJob(false)
      refetchJobs()
      refetchStats()
      setNewJob({
        title: '', department: 'Engineering', experience_years: 3,
        skills_required: '', description: '', salary_min: 600000, salary_max: 1200000
      })
    },
    onError: () => toast.error('Failed to post job')
  })

  const resumeMutation = useMutation({
    mutationFn: () => axios.post(`${API}/recruitment/resume/analyze`, {
      resume_text: resumeText, job_description: jobDesc
    }).then(r => r.data),
    onSuccess: d => { setResumeResult(d); toast.success('Resume analyzed!') },
    onError: () => toast.error('Analysis failed'),
  })

  const recommendationsMutation = useMutation({
    mutationFn: () => axios.get(`${API}/recruitment/recommendations`, { params: { skills: userSkills } }).then(r => r.data),
    onSuccess: d => { setRecommendationsData(d); toast.success('Job suggestions loaded!') },
    onError: () => toast.error('Failed to fetch recommendations'),
  })

  const generateQuizMutation = useMutation({
    mutationFn: () => axios.post(`${API}/recruitment/quiz/generate`, { topic: quizTopic }).then(r => r.data),
    onSuccess: d => {
      setQuizQuestions(d.questions || [])
      setCurrentQuestionIndex(0)
      setSelectedAnswers({})
      setShowQuizResults(false)
      setQuizActive(true)
      toast.success('Quiz loaded! Good luck.')
    },
    onError: () => toast.error('Failed to generate quiz questions'),
  })

  // Quiz helper
  const handleSelectOption = (qIdx: number, oIdx: number) => {
    // Lock answer: only register option if not already selected
    if (selectedAnswers[qIdx] !== undefined) return
    setSelectedAnswers(prev => ({
      ...prev,
      [qIdx]: oIdx
    }))
  }

  const getQuizScore = () => {
    let score = 0
    quizQuestions.forEach((q, i) => {
      if (selectedAnswers[i] === q.correct_option) score++
    })
    return score
  }

  return (
    <div className="p-6 space-y-6 max-w-[1500px] mx-auto">
      
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Recruitment & Careers</h1>
            <p className="text-xs text-white/40">AI ATS Scoring, RAG Job/Internship Recommendations & College Event Aggregator</p>
          </div>
        </div>

        <button
          onClick={() => setShowPostJob(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-500/10"
        >
          <Plus className="w-4 h-4" /> Post Job Opening
        </button>
      </motion.div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-3">
        {[
          { id: 'overview', label: '📊 Dashboard Overview' },
          { id: 'candidates', label: '👥 Candidates Profile' },
          { id: 'jobs', label: '💼 Active Job Boards' },
          { id: 'resume', label: '📄 Resume AI Evaluator' },
          { id: 'recommendations', label: '🚀 RAG Career Suggestions' },
          { id: 'quiz', label: '📝 RAG Knowledge Quiz' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
              activeTab === t.id
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-transparent shadow-lg shadow-blue-500/10'
                : 'text-white/50 border-white/10 hover:text-white hover:bg-white/5'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        
        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Applicants', value: stats?.total_applications || '1,847', icon: Users, color: 'from-blue-500 to-indigo-500' },
                { label: 'Active Openings', value: stats?.active_jobs || '23', icon: Briefcase, color: 'from-cyan-500 to-teal-500' },
                { label: 'Selected / Hired', value: stats?.offers_extended || '34', icon: CheckCircle, color: 'from-emerald-500 to-green-500' },
                { label: 'Avg ATS Rating', value: `${stats?.avg_ats_score || '74.2'}/100`, icon: Target, color: 'from-amber-500 to-orange-500' },
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

            {/* Stage analysis */}
            <div className="glass-card p-5 space-y-4">
              <h4 className="text-white font-semibold text-xs flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Hiring Recruitment Funnel
              </h4>
              <div className="space-y-3">
                {[
                  { stage: 'Applications Received', count: 1847, percentage: '100%' },
                  { stage: 'Resume Screened', count: 1203, percentage: '65.1%' },
                  { stage: 'Shortlisted', count: 284, percentage: '15.4%' },
                  { stage: 'Technical Assessed', count: 198, percentage: '10.7%' },
                  { stage: 'Interview Scheduled', count: 132, percentage: '7.1%' },
                  { stage: 'Hired', count: 48, percentage: '2.6%' },
                ].map(s => (
                  <div key={s.stage} className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-white/60">{s.stage}</span>
                      <span className="text-white font-semibold font-mono">{s.count} ({s.percentage})</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: s.percentage }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 2: Candidates Profile */}
        {activeTab === 'candidates' && (
          <motion.div key="candidates" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {candidatesData?.candidates?.map((candidate: any) => (
              <div key={candidate.id} className="glass-card p-4 space-y-3 relative overflow-hidden border-white/10">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-white text-xs font-semibold leading-tight">{candidate.name}</h4>
                    <p className="text-[10px] text-white/40 mt-0.5">{candidate.role} · {candidate.experience}y exp</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                    candidate.status === 'Shortlisted' ? 'bg-blue-500/20 text-blue-300' :
                    candidate.status === 'Interview Scheduled' ? 'bg-amber-500/20 text-amber-300' :
                    'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {candidate.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 mt-2">
                  {candidate.skills?.map((skill: string) => (
                    <span key={skill} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] text-white/60 font-mono">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="pt-2.5 border-t border-white/5 flex justify-between items-center text-xs">
                  <span className="text-white/40">ATS Compatibility</span>
                  <span className="font-bold text-emerald-400 font-mono">{candidate.ats_score}%</span>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Tab 3: Active Job Boards */}
        {activeTab === 'jobs' && (
          <motion.div key="jobs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobsData?.jobs?.map((job: any) => (
              <div key={job.id} className="glass-card p-5 space-y-4 border-white/10">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] text-white/40 font-bold uppercase tracking-wider">{job.department}</span>
                    <h4 className="text-white font-bold text-sm mt-0.5">{job.title}</h4>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                    job.status === 'Active' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/10 text-white/40'
                  }`}>
                    {job.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-white/5">
                  <div className="bg-white/5 p-2.5 rounded-xl">
                    <span className="text-[9px] text-white/40 block">APPLICANTS</span>
                    <span className="text-white font-bold font-mono mt-0.5 block">{job.applicants}</span>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded-xl">
                    <span className="text-[9px] text-white/40 block">SHORTLISTED</span>
                    <span className="text-emerald-400 font-bold font-mono mt-0.5 block">{job.shortlisted}</span>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Tab 4: Resume AI Evaluator */}
        {activeTab === 'resume' && (
          <motion.div key="resume" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <div className="lg:col-span-7 space-y-4">
              <div className="glass-card p-5 space-y-4">
                <h3 className="text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                  <Brain className="w-4.5 h-4.5 text-blue-400" />
                  ATS Matching Parser
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] text-white/40 block mb-1.5 uppercase">Paste Resume Text</label>
                    <textarea
                      value={resumeText}
                      onChange={e => setResumeText(e.target.value)}
                      placeholder="Paste candidate's resume content here..."
                      rows={6}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-blue-500/50 resize-none leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-white/40 block mb-1.5 uppercase">Target Job Description</label>
                    <textarea
                      value={jobDesc}
                      onChange={e => setJobDesc(e.target.value)}
                      placeholder="Paste target job responsibilities and technical specifications..."
                      rows={5}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500/50 resize-none leading-relaxed"
                    />
                  </div>

                  <motion.button
                    onClick={() => resumeMutation.mutate()}
                    disabled={resumeMutation.isPending || !resumeText || !jobDesc}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    {resumeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
                    Evaluate ATS Compatibility
                  </motion.button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="glass-card p-5 h-full min-h-[460px] flex flex-col justify-between">
                <div className="text-xs text-white/40 mb-3 block font-bold tracking-wider uppercase">ATS Compatibility Index</div>

                {resumeMutation.isPending ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    <span className="text-xs text-white/50 font-semibold font-mono">Running ATS compliance checker...</span>
                  </div>
                ) : resumeResult ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                    
                    <div className="bg-blue-500/5 rounded-2xl border border-blue-500/30 p-5 relative overflow-hidden text-center">
                      <span className="text-[10px] text-white/40 uppercase font-bold block mb-1">ATS COMPLIANCE SCORE</span>
                      <div className="text-4xl font-bold font-mono text-cyan-400">{resumeResult.ats_score} <span className="text-xs text-white/40 font-normal">/ 100</span></div>
                      <div className="text-[10px] text-white/50 mt-1 font-semibold">Hiring Likelihood: {Math.round(resumeResult.hiring_probability * 100)}%</div>

                      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/5 text-[10px]">
                        <div className="bg-white/5 p-2 rounded">
                          <span className="text-white/40 block">Skills</span>
                          <span className="text-white font-bold block mt-0.5">{Math.round(resumeResult.skill_match * 100)}%</span>
                        </div>
                        <div className="bg-white/5 p-2 rounded">
                          <span className="text-white/40 block">Experience</span>
                          <span className="text-white font-bold block mt-0.5">{Math.round(resumeResult.experience_match * 100)}%</span>
                        </div>
                        <div className="bg-white/5 p-2 rounded">
                          <span className="text-white/40 block">Education</span>
                          <span className="text-white font-bold block mt-0.5">{Math.round(resumeResult.education_match * 100)}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider block">Identified Strengths</span>
                      <div className="flex flex-wrap gap-1.5">
                        {resumeResult.strengths?.map((s: string) => (
                          <span key={s} className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                            ✓ {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider block">Missing Skills Required</span>
                      <div className="flex flex-wrap gap-1.5">
                        {resumeResult.missing_skills?.map((s: string) => (
                          <span key={s} className="px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-[10px]">
                            ⚠ {s}
                          </span>
                        ))}
                      </div>
                    </div>

                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <FileText className="w-8 h-8 text-white/20" />
                    </div>
                    <div>
                      <div className="text-white/40 text-xs font-semibold">Evaluator Console Ready</div>
                      <div className="text-white/20 text-[11px] mt-1">Paste resume and job specifications to scan</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 5: Recommendations */}
        {activeTab === 'recommendations' && (
          <motion.div key="recommendations" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            
            {/* Input list */}
            <div className="glass-card p-5 space-y-4">
              <h3 className="text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4.5 h-4.5 text-blue-400" />
                Dynamic Job & Internship AI Recommender
              </h3>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userSkills}
                  onChange={e => setUserSkills(e.target.value)}
                  placeholder="Enter your technical stack or skills (e.g. React, Python, Docker)..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50"
                />
                <motion.button
                  onClick={() => recommendationsMutation.mutate()}
                  disabled={recommendationsMutation.isPending || !userSkills}
                  whileHover={{ scale: 1.02 }}
                  className="px-5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-50 font-sans"
                >
                  {recommendationsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Match
                </motion.button>
              </div>
            </div>

            {recommendationsData && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Jobs Suggestions */}
                <div className="glass-card p-5 space-y-4">
                  <h4 className="text-white font-bold text-xs flex items-center gap-2 border-b border-white/5 pb-2">
                    <Briefcase className="w-4 h-4 text-blue-400" /> RECOMMENDED JOBS
                  </h4>
                  <div className="space-y-3">
                    {recommendationsData.jobs?.map((job: any, i: number) => (
                      <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                        <div className="text-xs text-white font-bold">{job.title}</div>
                        <div className="text-[10px] text-white/40">{job.company} · {job.salary}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Internships Suggestions */}
                <div className="glass-card p-5 space-y-4">
                  <h4 className="text-white font-bold text-xs flex items-center gap-2 border-b border-white/5 pb-2">
                    <Star className="w-4 h-4 text-cyan-400" /> RECOMMENDED INTERNSHIPS
                  </h4>
                  <div className="space-y-3">
                    {recommendationsData.internships?.map((intern: any, i: number) => (
                      <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                        <div className="text-xs text-white font-bold">{intern.title}</div>
                        <div className="text-[10px] text-white/40">{intern.company} · {intern.duration} ({intern.stipend})</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* College Tech Events */}
                <div className="glass-card p-5 space-y-4">
                  <h4 className="text-white font-bold text-xs flex items-center gap-2 border-b border-white/5 pb-2">
                    <Award className="w-4 h-4 text-amber-400" /> TECHNICAL INTER-COLLEGE EVENTS
                  </h4>
                  <div className="space-y-3">
                    {recommendationsData.events?.map((ev: any, i: number) => (
                      <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                        <div className="text-xs text-white font-bold">{ev.title}</div>
                        <div className="text-[10px] text-white/40">{ev.college} · Date: {ev.date} (Prize: {ev.prize})</div>
                      </div>
                    ))}
                  </div>
                </div>

              </motion.div>
            )}

          </motion.div>
        )}

        {/* Tab 6: RAG Knowledge Quiz */}
        {activeTab === 'quiz' && (
          <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            
            {/* Topic Setup */}
            {!quizActive ? (
              <div className="glass-card p-5 max-w-xl mx-auto space-y-4 text-center py-10">
                <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto">
                  <Brain className="w-7 h-7 text-blue-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-white font-bold text-sm">Dynamic Skill Assessment Quiz</h3>
                  <p className="text-xs text-white/40">Enter any topic. Local RAG will analyze the parameters and generate 5 multiple choice questions.</p>
                </div>

                <div className="space-y-3 pt-2">
                  <input
                    type="text"
                    value={quizTopic}
                    onChange={e => setQuizTopic(e.target.value)}
                    placeholder="Enter topic (e.g. React hooks, Algorithms, Python generators)"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-center text-white focus:outline-none focus:border-blue-500/50"
                  />
                  
                  <motion.button
                    onClick={() => generateQuizMutation.mutate()}
                    disabled={generateQuizMutation.isPending || !quizTopic}
                    whileHover={{ scale: 1.02 }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {generateQuizMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    Initialize Assessment
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="glass-card p-6 max-w-2xl mx-auto space-y-6">
                
                {/* Quiz Progress header */}
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <div>
                    <span className="text-[10px] text-white/40 font-bold uppercase">TOPIC: {quizTopic}</span>
                    <h4 className="text-white font-bold text-xs mt-0.5">Question {currentQuestionIndex + 1} of {quizQuestions.length}</h4>
                  </div>
                  <button
                    onClick={() => setQuizActive(false)}
                    className="text-xs text-red-400 hover:text-red-300 font-semibold"
                  >
                    Quit Quiz
                  </button>
                </div>

                {/* Question Details */}
                {!showQuizResults ? (
                  <div className="space-y-5">
                    <p className="text-white text-sm font-semibold">{quizQuestions[currentQuestionIndex]?.question}</p>
                    
                    <div className="space-y-2">
                      {quizQuestions[currentQuestionIndex]?.options?.map((opt: string, optIdx: number) => {
                        const isSelected = selectedAnswers[currentQuestionIndex] === optIdx
                        const hasSelectedAny = selectedAnswers[currentQuestionIndex] !== undefined
                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectOption(currentQuestionIndex, optIdx)}
                            className={`w-full text-left p-3 rounded-xl text-xs font-medium border transition-all ${
                              isSelected
                                ? 'bg-blue-500/20 border-blue-500/40 text-blue-300 font-bold'
                                : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/80'
                            }`}
                          >
                            <span className="font-mono text-white/30 mr-2">{['A','B','C','D'][optIdx]}.</span>
                            {opt}
                          </button>
                        )
                      })}
                    </div>

                    <div className="flex justify-between pt-4 border-t border-white/5">
                      <button
                        onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 text-xs font-semibold disabled:opacity-30"
                      >
                        Previous
                      </button>

                      {currentQuestionIndex < quizQuestions.length - 1 ? (
                        <button
                          onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                          disabled={selectedAnswers[currentQuestionIndex] === undefined}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-semibold disabled:opacity-50"
                        >
                          Next Question
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowQuizResults(true)}
                          disabled={selectedAnswers[currentQuestionIndex] === undefined}
                          className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-semibold disabled:opacity-50"
                        >
                          Submit Assessment
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                    
                    {/* Score summary */}
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 text-center">
                      <span className="text-[10px] text-white/40 block font-bold uppercase tracking-wider">ASSESSMENT SCORE</span>
                      <div className="text-4xl font-bold font-mono text-emerald-400 mt-1">{getQuizScore()} <span className="text-xs text-white/40 font-normal">/ {quizQuestions.length}</span></div>
                      <div className="text-[11px] text-emerald-300/80 mt-1.5">
                        Performance Rating: {getQuizScore() === quizQuestions.length ? 'Outstanding' : getQuizScore() >= 3 ? 'Excellent' : 'Needs review'}
                      </div>
                    </div>

                    {/* Explanations listing */}
                    <div className="space-y-4">
                      <span className="text-xs text-white/40 font-bold uppercase tracking-wider block">Question Solutions & Explanations</span>
                      
                      {quizQuestions.map((q, idx) => {
                        const userSel = selectedAnswers[idx]
                        const isCorrect = userSel === q.correct_option
                        return (
                          <div key={idx} className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-3">
                            <div className="flex justify-between items-start gap-2">
                              <span className="text-white text-xs font-bold leading-relaxed">{idx + 1}. {q.question}</span>
                              <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                                isCorrect ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                              }`}>
                                {isCorrect ? 'Correct' : 'Incorrect'}
                              </span>
                            </div>

                            <div className="text-[11px] space-y-1.5">
                              <div><span className="text-white/40">Your Answer:</span> <span className={isCorrect ? 'text-emerald-400 font-bold' : 'text-red-400'}>{q.options[userSel]}</span></div>
                              {!isCorrect && <div><span className="text-white/40">Correct Option:</span> <span className="text-emerald-400 font-semibold">{q.options[q.correct_option]}</span></div>}
                              
                              <div className="bg-black/30 p-2.5 rounded-lg border border-white/5 text-white/60 leading-relaxed font-mono text-[10px] mt-2">
                                <span className="text-white/40 font-bold uppercase block mb-1">RAG Solution Context:</span>
                                {q.solution}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <button
                      onClick={() => setQuizActive(false)}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-semibold text-center block"
                    >
                      Start New Quiz
                    </button>

                  </motion.div>
                )}

              </div>
            )}

          </motion.div>
        )}

      </AnimatePresence>

      {/* Post Job Modal */}
      {showPostJob && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card max-w-lg w-full p-6 space-y-4">
            
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-white font-bold text-sm">Post New Job Opening</span>
              <button onClick={() => setShowPostJob(false)} className="text-white/40 hover:text-white/70">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-[10px] text-white/40 block mb-1">Job Title</label>
                <input
                  type="text"
                  value={newJob.title}
                  onChange={e => setNewJob(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Cloud Engineer"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-white/40 block mb-1">Department</label>
                <select
                  value={newJob.department}
                  onChange={e => setNewJob(p => ({ ...p, department: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Product">Product Management</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-white/40 block mb-1">Required Skills (Comma Sep)</label>
                <input
                  type="text"
                  value={newJob.skills_required}
                  onChange={e => setNewJob(p => ({ ...p, skills_required: e.target.value }))}
                  placeholder="React, Docker, AWS"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-white/40 block mb-1">Min Salary</label>
                  <input
                    type="number"
                    value={newJob.salary_min}
                    onChange={e => setNewJob(p => ({ ...p, salary_min: parseInt(e.target.value) }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 block mb-1">Max Salary</label>
                  <input
                    type="number"
                    value={newJob.salary_max}
                    onChange={e => setNewJob(p => ({ ...p, salary_max: parseInt(e.target.value) }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="text-xs">
              <label className="text-[10px] text-white/40 block mb-1">Description</label>
              <textarea
                value={newJob.description}
                onChange={e => setNewJob(p => ({ ...p, description: e.target.value }))}
                placeholder="Describe role responsibilities..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none resize-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowPostJob(false)}
                className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 text-xs font-semibold"
              >
                Cancel
              </button>
              
              <button
                onClick={() => postJobMutation.mutate()}
                disabled={postJobMutation.isPending || !newJob.title}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-semibold"
              >
                Publish Posting
              </button>
            </div>

          </motion.div>
        </div>
      )}

    </div>
  )
}
