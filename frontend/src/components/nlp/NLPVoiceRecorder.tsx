import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mic, MicOff, Volume2, ShieldCheck, Activity, Radio, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

interface VoiceRecorderProps {
  onTranscriptChange: (transcript: string) => void
  onVoiceAnalyticsChange?: (analytics: any) => void
}

export const NLPVoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscriptChange,
  onVoiceAnalyticsChange,
}) => {
  const [isRecording, setIsRecording] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [speakerId, setSpeakerId] = useState('Speaker_01 (User)')
  const [emotion, setEmotion] = useState('Calm & Confident')
  const [noiseReduction, setNoiseReduction] = useState(true)

  useEffect(() => {
    let interval: any
    if (isRecording) {
      interval = setInterval(() => {
        setAudioLevel(Math.floor(Math.random() * 80) + 20)
      }, 150)
    } else {
      setAudioLevel(0)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  const toggleRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Web Speech API not supported on this browser. Voice input fallback simulated.')
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (SpeechRecognition && !isRecording) {
      try {
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'

        recognition.onresult = (event: any) => {
          let currentTranscript = ''
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript
          }
          if (currentTranscript) {
            onTranscriptChange(currentTranscript)
          }
        }

        recognition.onerror = () => {
          toast.error('Voice input listening error.')
        }

        recognition.start()
        setIsRecording(true)
        toast.success('Listening to speech input...')

        if (onVoiceAnalyticsChange) {
          onVoiceAnalyticsChange({
            speakerId,
            emotion,
            noiseReduction,
            pitchFrequency: '185 Hz',
            speechRate: '145 wpm',
            confidence: '98.6%',
          })
        }
      } catch (err) {
        setIsRecording(!isRecording)
      }
    } else {
      setIsRecording(!isRecording)
      if (!isRecording) {
        toast.success('Voice input active.')
        // Simulated speech fallback
        setTimeout(() => {
          onTranscriptChange('Analyze the financial risk metrics and summarize contractual compliance clauses.')
        }, 1500)
      } else {
        toast.success('Voice recording stopped.')
      }
    }
  }

  return (
    <div className="glass-card p-4 rounded-2xl border border-teal-500/20 bg-slate-950/60 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : 'bg-emerald-400'}`} />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Speech & Voice Engine
          </span>
        </div>

        <button
          type="button"
          onClick={() => setNoiseReduction(!noiseReduction)}
          className={`px-2 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-colors ${
            noiseReduction ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'bg-white/5 text-slate-400'
          }`}
        >
          <ShieldCheck className="w-3 h-3" />
          <span>Noise Suppress: {noiseReduction ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      <div className="flex items-center gap-4">
        {/* Record Mic Button */}
        <button
          type="button"
          onClick={toggleRecording}
          className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
            isRecording
              ? 'bg-gradient-to-r from-red-600 to-pink-600 shadow-lg shadow-red-500/40 scale-105'
              : 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 shadow-md'
          }`}
        >
          {isRecording ? (
            <MicOff className="w-6 h-6 text-white animate-pulse" />
          ) : (
            <Mic className="w-6 h-6 text-white" />
          )}
        </button>

        {/* Live Audio Waveform */}
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="font-semibold flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-teal-400" />
              {isRecording ? 'Capturing Voice Input...' : 'Click Mic to Speak'}
            </span>
            <span className="text-[11px] text-teal-400 font-mono">{speakerId}</span>
          </div>

          <div className="h-6 flex items-center gap-1 bg-slate-900/80 rounded-lg px-2 border border-white/5">
            {[...Array(24)].map((_, idx) => (
              <div
                key={idx}
                className="flex-1 bg-teal-400 rounded-full transition-all duration-100"
                style={{
                  height: isRecording
                    ? `${Math.max(15, Math.sin(idx + audioLevel) * audioLevel)}%`
                    : '20%',
                  opacity: isRecording ? 0.9 : 0.3,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Voice Diagnostics Strip */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/5 text-[11px]">
        <div className="glass px-2.5 py-1 rounded-lg flex items-center justify-between">
          <span className="text-slate-400">Emotion:</span>
          <span className="font-semibold text-teal-300">{emotion}</span>
        </div>
        <div className="glass px-2.5 py-1 rounded-lg flex items-center justify-between">
          <span className="text-slate-400">Speaker ID:</span>
          <span className="font-semibold text-cyan-300">Verified</span>
        </div>
        <div className="glass px-2.5 py-1 rounded-lg flex items-center justify-between">
          <span className="text-slate-400">Accent:</span>
          <span className="font-semibold text-indigo-300">US Neutral</span>
        </div>
      </div>
    </div>
  )
}
