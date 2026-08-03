import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap, Users, BookOpen, Brain, BarChart2, ClipboardCheck,
  TrendingUp, Award, AlertTriangle, Loader2, ChevronRight, Sparkles,
  Star, CheckCircle2, XCircle, Target, Clock, Zap
} from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from 'recharts'
import toast from 'react-hot-toast'
import axios from 'axios'

const API = 'http://localhost:8000/api/v1'

export default function EducationPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'courses' | 'quiz' | 'evaluate' | 'analytics'>('overview')
  const [quizSubject, setQuizSubject] = useState('Mathematics')
  const [quizTopic, setQuizTopic] = useState('Calculus')
  const [quizDifficulty, setQuizDifficulty] = useState('medium')
  const [quizResult, setQuizResult] = useState<any>(null)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({})
  const [studentAnswer, setStudentAnswer] = useState('The derivative of x² is 2x by the power rule. The integral of cos(x) is sin(x) + C.')
  const [modelAnswer, setModelAnswer] = useState('The derivative of x² is 2x. The integral of cos(x) is sin(x) + C.')
  const [evalResult, setEvalResult] = useState<any>(null)

  const { data: stats } = useQuery({ queryKey: ['edu-stats'], queryFn: () => axios.get(`${API}/education/stats`).then(r => r.data) })
  const { data: studentsData } = useQuery({ queryKey: ['students'], queryFn: () => axios.get(`${API}/education/students`).then(r => r.data), enabled: activeTab === 'students' })
  const { data: coursesData } = useQuery({ queryKey: ['courses'], queryFn: () => axios.get(`${API}/education/courses`).then(r => r.data), enabled: activeTab === 'courses' })

  const quizMutation = useMutation({
    mutationFn: () => axios.post(`${API}/education/quiz/generate`, { subject: quizSubject, topic: quizTopic, difficulty: quizDifficulty, num_questions: 5 }).then(r => r.data),
    onSuccess: d => { setQuizResult(d); setSelectedAnswers({}); toast.success('AI Quiz Generated!') },
    onError: () => toast.error('Quiz generation failed'),
  })

  const evalMutation = useMutation({
    mutationFn: () => axios.post(`${API}/education/assignment/evaluate`, { student_answer: studentAnswer, model_answer: modelAnswer, max_marks: 10 }).then(r => r.data),
    onSuccess: d => { setEvalResult(d); toast.success('Evaluation complete!') },
    onError: () => toast.error('Evaluation failed'),
  })

  const riskColor = (r: string) => ({
    'Low': 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    'Medium': 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    'High': 'text-red-400 border-red-500/30 bg-red-500/10',
  }[r] || 'text-white/40 border-white/10 bg-white/5')

  const RADAR_DATA = [
    { subject: 'Math', score: stats?.dept_performance?.Mathematics || 78 },
    { subject: 'Science', score: stats?.dept_performance?.Science || 82 },
    { subject: 'English', score: stats?.dept_performance?.English || 71 },
    { subject: 'Commerce', score: stats?.dept_performance?.Commerce || 86 },
    { subject: 'History', score: stats?.dept_performance?.History || 69 },
    { subject: 'CS', score: stats?.dept_performance?.ComputerScience || 91 },
  ]

  return (
    <div className="p-6 space-y-6 max-w-[1500px] mx-auto">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Education Intelligence Platform</h1>
            <p className="text-xs text-white/40">AI-Driven Personalized Learning, Quiz Generation & Student Performance Analytics</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-300 font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> AI-Powered Learning Engine
          </div>
          <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/40">
            {stats?.total_students?.toLocaleString() || '8,450'} Students Active
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-3">
        {[
          { id: 'overview', label: '📊 Overview' },
          { id: 'students', label: '👥 Students' },
          { id: 'courses', label: '📚 Courses' },
          { id: 'quiz', label: '🤖 AI Quiz Generator' },
          { id: 'evaluate', label: '📝 AI Evaluator' },
          { id: 'analytics', label: '📈 Analytics' },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
              activeTab === t.id
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-transparent shadow-md'
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
              {[
                { label: 'Total Students', value: stats?.total_students?.toLocaleString() || '8,450', icon: Users, color: 'from-indigo-500 to-purple-600' },
                { label: 'Active Courses', value: stats?.total_courses || '142', icon: BookOpen, color: 'from-blue-500 to-cyan-600' },
                { label: 'Avg GPA Score', value: stats?.avg_gpa || '3.42', icon: Award, color: 'from-amber-500 to-orange-600' },
                { label: 'At-Risk Students', value: stats?.at_risk_students || '183', icon: AlertTriangle, color: 'from-red-500 to-rose-600' },
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
              <div className="glass-card p-5">
                <h4 className="text-white font-semibold text-xs mb-3 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-indigo-400" /> Department Performance Radar
                </h4>
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={RADAR_DATA}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#8b9cc8' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: '#64748b' }} />
                    <Radar name="Score" dataKey="score" stroke="#818cf8" fill="#818cf8" fillOpacity={0.25} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-card p-5 space-y-4">
                <h4 className="text-white font-semibold text-xs flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-400" /> Institutional Metrics
                </h4>
                {[
                  { label: 'Pass Rate', value: stats?.pass_rate || 91.2, color: 'emerald' },
                  { label: 'Attendance Rate', value: stats?.attendance_rate || 87.4, color: 'blue' },
                  { label: 'Assignment Completion', value: stats?.assignment_completion || 78.6, color: 'indigo' },
                  { label: 'Student Satisfaction', value: stats?.satisfaction_score || 83.0, color: 'violet' },
                ].map(m => (
                  <div key={m.label}>
                    <div className="flex justify-between text-[10px] text-white/50 mb-1.5">
                      <span>{m.label}</span>
                      <span className="font-mono text-white font-semibold">{m.value}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full bg-${m.color}-500 transition-all duration-700`} style={{ width: `${m.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Students */}
        {activeTab === 'students' && (
          <motion.div key="students" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="glass-card p-5">
              <h3 className="text-white font-semibold text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" /> Student Registry & Performance Insights
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-white/40">
                      <th className="py-2">STUDENT ID</th>
                      <th className="py-2">NAME</th>
                      <th className="py-2">DEPARTMENT</th>
                      <th className="py-2">YEAR</th>
                      <th className="py-2">GPA</th>
                      <th className="py-2">ATTENDANCE</th>
                      <th className="py-2">RISK LEVEL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(studentsData?.students || []).map((s: any) => (
                      <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 font-mono text-indigo-400 font-semibold">{s.id}</td>
                        <td className="py-3 text-white font-medium">{s.name}</td>
                        <td className="py-3 text-white/60">{s.department}</td>
                        <td className="py-3 text-white/60">Year {s.year}</td>
                        <td className="py-3 font-mono text-white font-bold">{s.gpa}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${s.attendance_rate >= 75 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${s.attendance_rate}%` }} />
                            </div>
                            <span className="text-white/60 text-[10px]">{s.attendance_rate}%</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${riskColor(s.dropout_risk)}`}>{s.dropout_risk}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Courses */}
        {activeTab === 'courses' && (
          <motion.div key="courses" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(coursesData?.courses || []).map((c: any) => (
                <div key={c.id} className="glass-card p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-white font-semibold text-sm">{c.name}</div>
                      <div className="text-[10px] text-white/40 mt-0.5">{c.code} · {c.department}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-bold text-white">{c.rating || '4.2'}</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-white/50">{c.description}</div>
                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    <div className="text-center">
                      <div className="text-white font-bold">{c.enrolled_count || c.enrolled}</div>
                      <div className="text-white/40">Enrolled</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-bold">{c.pass_rate}%</div>
                      <div className="text-white/40">Pass Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-bold">{c.credits}</div>
                      <div className="text-white/40">Credits</div>
                    </div>
                  </div>
                  <div className="flex justify-between text-[10px] text-white/40">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{c.duration_weeks} weeks</span>
                    <span className={`px-2 py-0.5 rounded font-semibold ${c.difficulty === 'Hard' ? 'text-red-400 bg-red-500/10' : c.difficulty === 'Medium' ? 'text-amber-400 bg-amber-500/10' : 'text-emerald-400 bg-emerald-500/10'}`}>{c.difficulty}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* AI Quiz Generator */}
        {activeTab === 'quiz' && (
          <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 glass-card p-5 space-y-4">
                <h3 className="text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                  <Brain className="w-4 h-4 text-indigo-400 animate-pulse" /> AI Quiz Configuration
                </h3>
                <div>
                  <label className="text-[10px] text-white/40 block mb-1.5 uppercase">Subject</label>
                  <select value={quizSubject} onChange={e => setQuizSubject(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50">
                    {['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Computer Science', 'English Literature'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-white/40 block mb-1.5 uppercase">Topic / Chapter</label>
                  <input value={quizTopic} onChange={e => setQuizTopic(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                    placeholder="e.g., Calculus, Newton's Laws..." />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 block mb-1.5 uppercase">Difficulty Level</label>
                  <div className="flex gap-2">
                    {['easy', 'medium', 'hard'].map(d => (
                      <button key={d} onClick={() => setQuizDifficulty(d)}
                        className={`flex-1 py-2 rounded-xl text-[10px] font-bold capitalize border transition-all ${quizDifficulty === d
                          ? d === 'easy' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : d === 'medium' ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'bg-red-500/20 border-red-500/50 text-red-400'
                          : 'border-white/10 text-white/30 hover:border-white/20'}`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <motion.button onClick={() => quizMutation.mutate()} disabled={quizMutation.isPending}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
                  {quizMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  Generate AI Quiz (5 Questions)
                </motion.button>
              </div>

              <div className="lg:col-span-8">
                {quizResult ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="glass-card p-4 flex justify-between items-center">
                      <div>
                        <div className="text-white font-semibold text-xs">{quizResult.title || `${quizSubject} — ${quizTopic} Quiz`}</div>
                        <div className="text-[10px] text-white/40 mt-0.5">Difficulty: {quizDifficulty} · {quizResult.questions?.length || 5} Questions</div>
                      </div>
                      {Object.keys(selectedAnswers).length === (quizResult.questions?.length || 5) && (
                        <div className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          {quizResult.questions?.filter((q: any, i: number) => selectedAnswers[i] === q.correct_answer).length}/{quizResult.questions?.length} Correct
                        </div>
                      )}
                    </div>
                    {(quizResult.questions || []).map((q: any, i: number) => (
                      <div key={i} className="glass-card p-4 space-y-3">
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                          <div className="text-white text-xs font-medium">{q.question}</div>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {(q.options || []).map((opt: string, j: number) => {
                            const isSelected = selectedAnswers[i] === opt
                            const isCorrect = opt === q.correct_answer
                            const showResult = selectedAnswers[i] !== undefined
                            return (
                              <button key={j} onClick={() => !selectedAnswers[i] && setSelectedAnswers(s => ({ ...s, [i]: opt }))}
                                className={`text-left px-3 py-2 rounded-lg text-[11px] border transition-all ${
                                  showResult
                                    ? isCorrect ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300' : isSelected ? 'bg-red-500/15 border-red-500/50 text-red-300' : 'bg-white/3 border-white/5 text-white/30'
                                    : isSelected ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/8 hover:border-white/20'
                                }`}>
                                <span className="font-bold mr-2">{['A','B','C','D'][j]}.</span>{opt}
                              </button>
                            )
                          })}
                        </div>
                        {selectedAnswers[i] && (
                          <div className="text-[10px] text-white/50 bg-black/20 rounded-lg p-2 flex items-start gap-1.5">
                            <ChevronRight className="w-3 h-3 text-indigo-400 mt-0.5 flex-shrink-0" />
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <div className="glass-card h-full flex flex-col items-center justify-center py-24 text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
                      <Brain className="w-8 h-8 text-indigo-400/50" />
                    </div>
                    <div>
                      <div className="text-white/40 font-semibold">AI Quiz Engine Ready</div>
                      <div className="text-white/20 text-[11px] mt-1">Configure subject & topic, then generate an adaptive quiz</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* AI Evaluator */}
        {activeTab === 'evaluate' && (
          <motion.div key="evaluate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-5 space-y-4">
              <h3 className="text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-indigo-400" /> AI Assignment Evaluator
              </h3>
              <div>
                <label className="text-[10px] text-white/40 block mb-1.5 uppercase">Student's Answer</label>
                <textarea value={studentAnswer} onChange={e => setStudentAnswer(e.target.value)} rows={5}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 resize-none" />
              </div>
              <div>
                <label className="text-[10px] text-white/40 block mb-1.5 uppercase">Model Answer (Benchmark)</label>
                <textarea value={modelAnswer} onChange={e => setModelAnswer(e.target.value)} rows={5}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 resize-none" />
              </div>
              <motion.button onClick={() => evalMutation.mutate()} disabled={evalMutation.isPending}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
                {evalMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                Evaluate with AI
              </motion.button>
            </div>

            <div className="glass-card p-5 min-h-[400px] flex flex-col">
              <div className="text-xs text-white/40 font-bold tracking-wider uppercase mb-4">Evaluation Report</div>
              {evalResult ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4 flex-1">
                  <div className="text-center py-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl border border-indigo-500/20">
                    <div className="text-5xl font-black text-indigo-400">{evalResult.marks_awarded}<span className="text-xl text-white/40">/{evalResult.max_marks}</span></div>
                    <div className="text-white/50 text-xs mt-1">Score Awarded</div>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.round(evalResult.marks_awarded / evalResult.max_marks * 5) ? 'text-amber-400 fill-amber-400' : 'text-white/10'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-[10px]">
                    {[
                      ['Semantic Similarity', `${(evalResult.similarity_score * 100).toFixed(0)}%`],
                      ['Grade', evalResult.grade],
                      ['Accuracy', `${(evalResult.accuracy_score * 100).toFixed(0)}%`],
                      ['Completeness', `${(evalResult.completeness_score * 100).toFixed(0)}%`],
                    ].map(([l, v]) => (
                      <div key={l} className="bg-white/5 p-3 rounded-xl text-center">
                        <div className="text-white/40">{l}</div>
                        <div className="text-white font-bold text-sm mt-0.5">{v}</div>
                      </div>
                    ))}
                  </div>
                  {evalResult.feedback && (
                    <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                      <div className="text-[10px] text-indigo-400 font-bold mb-1.5">AI Feedback</div>
                      <div className="text-[11px] text-white/60 leading-relaxed">{evalResult.feedback}</div>
                    </div>
                  )}
                  {evalResult.suggestions?.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[10px] text-white/40 font-bold uppercase">Improvement Suggestions</div>
                      {evalResult.suggestions.map((s: string, i: number) => (
                        <div key={i} className="flex items-start gap-1.5 text-[11px] text-white/60">
                          <ChevronRight className="w-3 h-3 text-indigo-400 mt-0.5 flex-shrink-0" />{s}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <ClipboardCheck className="w-8 h-8 text-white/20" />
                  </div>
                  <div>
                    <div className="text-white/40 font-semibold text-xs">AI Grader Standby</div>
                    <div className="text-white/20 text-[11px] mt-1">Paste answers and click Evaluate</div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Analytics */}
        {activeTab === 'analytics' && (
          <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="glass-card p-5 space-y-3">
              <h4 className="text-white font-semibold text-xs flex items-center gap-2"><TrendingUp className="w-4 h-4 text-indigo-400" /> Top Performing Departments</h4>
              {(stats?.department_rankings || []).map((dept: any, i: number) => (
                <div key={dept.name} className="p-3 bg-white/5 rounded-xl flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${i === 0 ? 'bg-amber-500/20 text-amber-400' : i === 1 ? 'bg-slate-500/20 text-slate-300' : 'bg-orange-900/20 text-orange-700'}`}>#{i + 1}</div>
                  <div className="flex-1">
                    <div className="text-white text-xs font-semibold">{dept.name}</div>
                    <div className="text-[10px] text-white/40">{dept.students} students</div>
                  </div>
                  <div className="text-white font-mono font-bold text-sm">{dept.avg_gpa}</div>
                </div>
              ))}
            </div>
            <div className="glass-card p-5 space-y-3">
              <h4 className="text-white font-semibold text-xs flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-400" /> Students Needing Intervention</h4>
              {(studentsData?.students?.filter((s: any) => s.dropout_risk === 'High') || []).slice(0, 6).map((s: any) => (
                <div key={s.id} className="p-3 bg-red-500/5 rounded-xl border border-red-500/20 flex items-center justify-between">
                  <div>
                    <div className="text-white text-xs font-semibold">{s.name}</div>
                    <div className="text-[10px] text-white/40">{s.department} · GPA {s.gpa}</div>
                  </div>
                  <div className="text-right text-[10px]">
                    <div className="text-red-400 font-bold">{s.attendance_rate}% attendance</div>
                    <div className="text-white/40">{s.pending_assignments} pending tasks</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
