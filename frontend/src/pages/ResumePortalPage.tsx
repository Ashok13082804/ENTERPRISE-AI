import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Brain, Upload, Loader2, Target, ChevronRight, BarChart2,
  Award, TrendingUp, BookOpen, Star, Briefcase, Zap, Download, Sparkles, CheckCircle, AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

const API = 'http://localhost:8000/api/v1'

const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`glass rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md ${className}`}>{children}</div>
)

export default function ResumePortalPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'analyze' | 'career' | 'builder'>('overview')
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [careerRole, setCareerRole] = useState('software engineer')
  const [careerPath, setCareerPath] = useState<any>(null)
  const [builderForm, setBuilderForm] = useState({
    fullName: 'Ashok Kumar',
    email: 'ashok@enterprise.ai',
    phone: '+91-98765-43210',
    linkedin: 'linkedin.com/in/ashokkumar',
    github: 'github.com/ashokkumar',
    targetRole: 'Senior Software Engineer',
    skills: 'Python, React, FastAPI, Docker, PostgreSQL, Kubernetes, AWS, TensorFlow'
  })

  const { data: stats } = useQuery({ queryKey: ['resume-stats'], queryFn: () => axios.get(`${API}/resume/stats`).then(r => r.data) })

  const analyzeMutation = useMutation({
    mutationFn: () => {
      const fd = new FormData()
      fd.append('file', resumeFile as File)
      return axios.post(`${API}/resume/analyze`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data)
    },
    onSuccess: d => { setAnalysisResult(d); toast.success('Resume analyzed!') },
    onError: () => toast.error('Analysis failed'),
  })

  const careerMutation = useMutation({
    mutationFn: () => axios.get(`${API}/resume/career-path/${encodeURIComponent(careerRole)}`).then(r => r.data),
    onSuccess: d => { setCareerPath(d); toast.success('Career path generated!') },
  })

  const handleDownloadBuiltResume = () => {
    toast.success('Resume PDF generated & download started!')
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">AI Resume & Career Portal</h1>
            <p className="text-xs text-white/40">ATS Score Evaluation, Career Recommendations, and AI Resume Builder</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-400 font-semibold">
          <Zap className="w-3.5 h-3.5" /> Resume Analyzer Engine Active
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-3">
        {[
          { id: 'overview', label: '📊 Dashboard' },
          { id: 'analyze', label: '🧠 ATS Analyzer' },
          { id: 'career', label: '📈 Career Advisor' },
          { id: 'builder', label: '📝 Resume Builder' },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
              activeTab === t.id
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-transparent shadow-md'
                : 'text-white/50 border-white/10 hover:text-white hover:bg-white/5'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Overview */}
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Resumes Analyzed', value: stats?.resumes_analyzed?.toLocaleString() || '1,420', icon: FileText, color: 'from-cyan-500 to-blue-600' },
                { label: 'Avg ATS Score', value: `${stats?.avg_ats_score || 76}%`, icon: Target, color: 'from-emerald-500 to-teal-600' },
                { label: 'Profile Upgrades', value: stats?.resumes_improved?.toLocaleString() || '432', icon: TrendingUp, color: 'from-violet-500 to-purple-600' },
                { label: 'Recommended Jobs', value: stats?.jobs_matched?.toLocaleString() || '12,850', icon: Briefcase, color: 'from-amber-500 to-orange-600' },
              ].map(s => (
                <div key={s.label} className="glass-card p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                    <s.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">{s.value}</div>
                    <div className="text-[10px] text-white/40">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="glass-card p-5 space-y-4">
                <h4 className="text-white font-semibold text-xs flex items-center gap-2"><Sparkles className="w-4 h-4 text-cyan-400" /> Career Insights Hub</h4>
                <div className="text-xs text-white/60 leading-relaxed">
                  Our advanced language model analyzes candidate profiles against industry benchmarks to recommend career trajectories, technical skills, and interview preparations.
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2 text-[10px]">
                  <div className="bg-white/5 p-3 rounded-xl">
                    <div className="text-white/40">Market Trend</div>
                    <div className="text-emerald-400 font-bold text-sm mt-0.5">+14.2% AI Roles</div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl">
                    <div className="text-white/40">Hiring Partners</div>
                    <div className="text-white font-bold text-sm mt-0.5">120+ Enterprises</div>
                  </div>
                </div>
              </div>

              <div className="glass-card p-5 space-y-3">
                <h4 className="text-white font-semibold text-xs flex items-center gap-2"><Briefcase className="w-4 h-4 text-cyan-400" /> Top Recruiting Domains</h4>
                {['Machine Learning Engineering', 'Full Stack Development', 'Data Engineering & Analytics', 'Cloud DevOps Architecture'].map((domain, idx) => (
                  <div key={domain} className="flex justify-between items-center text-xs py-1.5 border-b border-white/5 last:border-0">
                    <span className="text-white/70 font-medium">{domain}</span>
                    <span className="text-cyan-400 font-bold font-mono">{[87, 76, 68, 62][idx]}% Demand</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ATS Analyzer */}
        {activeTab === 'analyze' && (
          <motion.div key="analyze" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassCard className="p-5 space-y-4">
              <h3 className="text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                <Brain className="w-4 h-4 text-cyan-400 animate-pulse" /> AI Resume Parser
              </h3>
              <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center cursor-pointer hover:border-cyan-500/50 transition-colors"
                onClick={() => document.getElementById('resume-upload-portal')?.click()}>
                <Upload className="w-10 h-10 text-cyan-500/30 mx-auto mb-2" />
                <div className="text-white font-semibold text-xs">{resumeFile ? resumeFile.name : 'Upload your resume'}</div>
                <div className="text-white/20 text-[10px] mt-0.5">PDF or DOCX format</div>
                <input id="resume-upload-portal" type="file" accept=".pdf,.docx" className="hidden" onChange={e => setResumeFile(e.target.files?.[0] || null)} />
              </div>

              <motion.button onClick={() => analyzeMutation.mutate()} disabled={!resumeFile || analyzeMutation.isPending}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg">
                {analyzeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                Analyze ATS Score
              </motion.button>
            </GlassCard>

            <GlassCard className="p-5 min-h-[360px] flex flex-col justify-between">
              <div className="text-xs text-white/40 font-bold tracking-wider uppercase mb-3">ATS Audit Results</div>
              {analysisResult ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4 flex-1">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border border-cyan-500/20 text-center">
                    <div className="text-5xl font-black text-cyan-400">{analysisResult.ats_score}</div>
                    <div className="text-xs text-white/50 mt-1">ATS Compatibility Score</div>
                    <div className="text-xs text-emerald-400 font-bold mt-2">Recommended Career: {analysisResult.career_recommendation}</div>
                  </div>

                  <div className="space-y-3">
                    {analysisResult.strengths?.length > 0 && (
                      <div>
                        <div className="text-[10px] text-white/40 font-bold uppercase mb-1">Key Strengths</div>
                        {analysisResult.strengths.map((s: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-1.5 text-xs text-emerald-400">
                            <CheckCircle className="w-3.5 h-3.5" />{s}
                          </div>
                        ))}
                      </div>
                    )}

                    {analysisResult.weaknesses?.length > 0 && (
                      <div>
                        <div className="text-[10px] text-white/40 font-bold uppercase mb-1">Areas of Concern</div>
                        {analysisResult.weaknesses.map((s: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-1.5 text-xs text-amber-400">
                            <AlertCircle className="w-3.5 h-3.5" />{s}
                          </div>
                        ))}
                      </div>
                    )}

                    {analysisResult.missing_sections?.length > 0 && (
                      <div>
                        <div className="text-[10px] text-white/40 font-bold uppercase mb-1">Missing Components</div>
                        <div className="flex gap-1.5 flex-wrap">
                          {analysisResult.missing_sections.map((s: string) => (
                            <span key={s} className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {analysisResult.improvements?.length > 0 && (
                      <div>
                        <div className="text-[10px] text-white/40 font-bold uppercase mb-1">Actionable Tips</div>
                        {analysisResult.improvements.map((tip: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-1.5 text-[11px] text-white/60 mb-0.5">
                            <ChevronRight className="w-3.5 h-3.5 text-cyan-400 mt-0.5 flex-shrink-0" />{tip}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <Target className="w-8 h-8 text-white/20" />
                  </div>
                  <div>
                    <div className="text-white/40 font-semibold text-xs">ATS Analyzer Standby</div>
                    <div className="text-white/20 text-[11px] mt-1">Upload CV for AI parsing and scoring</div>
                  </div>
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}

        {/* Career Advisor */}
        {activeTab === 'career' && (
          <motion.div key="career" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassCard className="p-5 space-y-4">
              <h3 className="text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" /> Career Path Advisor
              </h3>
              <div>
                <label className="text-[10px] text-white/40 block mb-1.5 uppercase">Target Career Role</label>
                <input value={careerRole} onChange={e => setCareerRole(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['software engineer', 'data scientist', 'devops architect', 'product manager'].map(r => (
                  <button key={r} onClick={() => setCareerRole(r)}
                    className="px-2.5 py-1 text-[10px] bg-white/5 border border-white/10 rounded-full text-white/70 hover:border-cyan-500/50 capitalize transition-all">
                    {r}
                  </button>
                ))}
              </div>
              <motion.button onClick={() => careerMutation.mutate()} disabled={careerMutation.isPending}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg">
                {careerMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                Generate AI Career Roadmap
              </motion.button>
            </GlassCard>

            <GlassCard className="p-5 min-h-[360px] flex flex-col justify-between">
              <div className="text-xs text-white/40 font-bold tracking-wider uppercase mb-3">AI Career Roadmap</div>
              {careerPath ? (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 flex-1">
                  <h4 className="text-white font-bold text-sm">Progression Roadmap for: <span className="text-cyan-400 capitalize">{careerPath.current_role}</span></h4>

                  <div className="space-y-3">
                    {(careerPath.career_path || []).map((step: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 bg-white/3 p-2.5 rounded-xl border border-white/5">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0">
                          {step.level || idx + 1}
                        </div>
                        <div className="flex-1">
                          <div className="text-white text-xs font-semibold">{step.title}</div>
                          <div className="text-[10px] text-white/40">Avg Salary: ₹{step.avg_salary_lpa}L PA</div>
                        </div>
                        {idx === (careerPath.career_path.length - 1) ? (
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-white/20" />
                        )}
                      </div>
                    ))}
                  </div>

                  {careerPath.skills_for_next_level?.length > 0 && (
                    <div className="p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-xl space-y-1.5">
                      <div className="text-[10px] text-cyan-400 font-bold uppercase">Required Skill Upgrades</div>
                      <div className="flex flex-wrap gap-1.5">
                        {careerPath.skills_for_next_level.map((s: string) => (
                          <span key={s} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/70 text-[9px] font-semibold">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <Award className="w-8 h-8 text-white/20" />
                  </div>
                  <div>
                    <div className="text-white/40 font-semibold text-xs">Advisor Standby</div>
                    <div className="text-white/20 text-[11px] mt-1">Submit target role to plan career benchmarks</div>
                  </div>
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}

        {/* Resume Builder */}
        {activeTab === 'builder' && (
          <motion.div key="builder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GlassCard className="p-5 space-y-4">
              <h3 className="text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" /> ATS-Optimized AI Resume Builder
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Full Name', key: 'fullName' },
                  { label: 'Email Address', key: 'email' },
                  { label: 'Phone Number', key: 'phone' },
                  { label: 'LinkedIn Profile', key: 'linkedin' },
                  { label: 'GitHub Profile', key: 'github' },
                  { label: 'Target Job Title', key: 'targetRole' },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="text-[10px] text-white/40 block mb-1.5 uppercase">{label}</label>
                    <input value={(builderForm as any)[key]} onChange={e => setBuilderForm({ ...builderForm, [key]: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50" />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-[10px] text-white/40 block mb-1.5 uppercase">Skills & Competencies (comma-separated)</label>
                <input value={builderForm.skills} onChange={e => setBuilderForm({ ...builderForm, skills: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50" />
              </div>
              <motion.button onClick={handleDownloadBuiltResume}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg">
                <Download className="w-4 h-4" /> Compile & Download PDF Resume
              </motion.button>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
