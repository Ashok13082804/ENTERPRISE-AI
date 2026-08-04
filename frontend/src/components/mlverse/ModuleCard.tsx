import React from 'react'
import { motion } from 'framer-motion'
import { 
  Sparkles, ArrowRight, CheckCircle2, Cpu, FileText, Image, Mic, BarChart2,
  Home, GraduationCap, DollarSign, UserMinus, ShieldAlert, Users, Car, Bike,
  Activity, Plane, Sun, CloudRain, Zap, BatteryCharging, Film, BookOpen, Music,
  ShoppingCart, AlertTriangle, Mail, MessageSquare, Smile, Heart, Globe, Newspaper,
  Folder, FileSearch, UserCheck, Target, ShieldOff, Slash, Edit3, Award, Key,
  AlignLeft, Languages, Volume2, Shield, EyeOff, HardHat, Truck, CreditCard, Octagon,
  Box, Flame, Wind, Briefcase, Compass, Sprout, Leaf, AlertCircle, Brain, HeartPulse, Eye,
  TrendingUp, Coins, BarChart3, Package, Cloud, Droplet, SunMedium, Fan, Lock, FileMinus,
  PieChart, Tag, Receipt, List, BarChart, Crosshair, Pill, AlertOctagon, UserPlus,
  Wrench, CheckSquare, Layers, Grid, Sliders
} from 'lucide-react'

// Icon Mapping dictionary
const ICON_MAP: Record<string, any> = {
  Home, GraduationCap, DollarSign, UserMinus, CheckCircle2, ShieldAlert, Users, FileText,
  Car, Bike, Activity, Plane, Sun, CloudRain, Zap, BatteryCharging, Film, BookOpen, Music,
  ShoppingCart, AlertTriangle, Mail, MessageSquare, Smile, Heart, Globe, Newspaper, Folder,
  FileSearch, UserCheck, Target, ShieldOff, Slash, Edit3, Award, Key, AlignLeft, Languages,
  Mic, Volume2, Shield, EyeOff, HardHat, Truck, CreditCard, Octagon, Box, Flame, Wind, Briefcase,
  Compass, Sprout, Leaf, AlertCircle, Brain, HeartPulse, Eye, TrendingUp, Coins, BarChart3, Package,
  Cloud, Droplet, SunMedium, Fan, Lock, FileMinus, PieChart, Tag, Receipt, List, BarChart, Crosshair,
  Pill, AlertOctagon, UserPlus, Wrench, CheckSquare, Layers, Grid, Sliders, Cpu
}

export interface ModuleItem {
  id: string
  name: string
  category: string
  accuracy: string
  inputs: string[]
  icon: string
}

interface ModuleCardProps {
  module: ModuleItem
  onSelect: (module: ModuleItem) => void
}

export const ModuleCard: React.FC<ModuleCardProps> = ({ module, onSelect }) => {
  const IconComponent = ICON_MAP[module.icon] || Cpu

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(module)}
      className="glass-card group cursor-pointer p-5 rounded-2xl border border-white/10 hover:border-indigo-500/50 bg-slate-900/60 hover:bg-slate-900/90 transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
    >
      {/* Decorative Glow */}
      <div className="absolute -right-10 -top-10 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/25 transition-all duration-500" />
      
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600/30 to-purple-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-lg shadow-indigo-500/10">
            <IconComponent className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold tracking-wide px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {module.accuracy}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1 mb-2">
          {module.name}
        </h3>

        {/* Input Parameters Badges */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {module.inputs.slice(0, 3).map((inp) => (
            <span key={inp} className="text-[10px] bg-white/5 border border-white/10 text-slate-300 px-2 py-0.5 rounded-md">
              {inp.replace(/_/g, ' ')}
            </span>
          ))}
          {module.inputs.length > 3 && (
            <span className="text-[10px] bg-indigo-500/10 text-indigo-300 px-1.5 py-0.5 rounded-md font-mono">
              +{module.inputs.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-slate-400 group-hover:text-indigo-400 transition-colors">
        <span className="text-[11px] uppercase tracking-wider font-medium text-slate-400">{module.category}</span>
        <div className="flex items-center gap-1 font-semibold group-hover:translate-x-1 transition-transform duration-300">
          <span>Run AI</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </motion.div>
  )
}
