import React from 'react';
import { X, BookOpen, Trophy, Shield, Zap, Sparkles, Gamepad2, ArrowRight, CheckCircle2, Copy, Play, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GameRecord } from '@/data/gameDatabase';
import { getGameInstructionDetails, getGameControlsDisplay } from '@/utils/gameControlsAndManual';
import toast from 'react-hot-toast';

interface GameManualModalProps {
  game: GameRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onPlay?: (game: GameRecord) => void;
}

export const GameManualModal: React.FC<GameManualModalProps> = ({
  game,
  isOpen,
  onClose,
  onPlay,
}) => {
  const navigate = useNavigate();

  if (!isOpen || !game) return null;

  const m = getGameInstructionDetails(game);
  const controlsDisplay = getGameControlsDisplay(game);

  const handleCopy = () => {
    const text = `User Manual: ${game.name} (${game.id})\n\nObjective:\n${game.objective}\n\nHow to Play:\n${m.howToPlay.join('\n')}\n\nRules:\n${m.rules.join('\n')}\n\nScoring:\n${m.scoringSystem}\n\nWin Condition:\n${m.winCondition}`;
    navigator.clipboard.writeText(text);
    toast.success(`Copied manual for ${game.name} to clipboard!`);
  };

  const handleLaunchPlay = () => {
    onClose();
    if (onPlay) {
      onPlay(game);
    } else {
      navigate(`/game-hub/${game.id.toLowerCase()}`);
    }
  };

  const handleOpenBuilder = () => {
    onClose();
    navigate(`/game-hub/${game.id.toLowerCase()}/builder`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900/95 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-extrabold tracking-wider uppercase bg-primary/20 text-primary border border-primary/30">
                  {game.id}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-muted-foreground border border-white/10">
                  {game.category}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                  game.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  game.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {game.difficulty}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                {game.name} · Official User Manual & Instructions
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
            title="Close Manual"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-sm">
          {/* Mission Objective Card */}
          <div className="relative overflow-hidden rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900/40 p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-300">Mission Objective</h3>
                <p className="text-slate-200 mt-1 font-medium">{game.objective}</p>
                <p className="text-xs text-muted-foreground mt-1">{game.description}</p>
              </div>
            </div>
          </div>

          {/* How to Play Step-by-Step */}
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3">
              <Gamepad2 className="w-4 h-4 text-emerald-400" />
              How to Play (Step-by-Step Instructions)
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              {m.howToPlay.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-emerald-500/30">
                    {idx + 1}
                  </div>
                  <p className="text-slate-200 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Official Game Rules */}
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-amber-400" />
              Official Rules & Fail Conditions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {m.rules.map((rule, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300 text-xs sm:text-sm leading-relaxed">{rule}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Controls Matrix */}
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-cyan-400" />
              Controls & Virtual Gamepad Mapping
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Keyboard keys */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 mb-2">Keyboard Shortcuts</h4>
                <div className="space-y-1.5">
                  {m.keys.map((k, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-white/5 last:border-0">
                      <span className="px-2 py-0.5 rounded bg-white/10 font-mono font-bold text-white border border-white/10">
                        {k.key}
                      </span>
                      <span className="text-slate-300">{k.action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* On-screen virtual buttons */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 mb-2">On-Screen Virtual Buttons</h4>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">D-Pad Up:</span>
                    <span>{controlsDisplay.dpad.up.title}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">D-Pad Down:</span>
                    <span>{controlsDisplay.dpad.down.title}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">D-Pad Left:</span>
                    <span>{controlsDisplay.dpad.left.title}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">D-Pad Right:</span>
                    <span>{controlsDisplay.dpad.right.title}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Action Button:</span>
                    <span>{controlsDisplay.actionBtn.title}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Boost Button:</span>
                    <span>{controlsDisplay.boostBtn.title}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scoring & Win Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-1.5">
                <Trophy className="w-3.5 h-3.5" />
                Scoring Formula
              </h4>
              <p className="text-xs sm:text-sm text-slate-200">{m.scoringSystem}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Winning Condition
              </h4>
              <p className="text-xs sm:text-sm text-slate-200">{m.winCondition}</p>
            </div>
          </div>

          {/* Pro Tips */}
          {m.proTips && m.proTips.length > 0 && (
            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/20">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5 mb-2">
                💡 Pro Tips & Advanced Strategies
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                {m.proTips.map((tip, idx) => (
                  <li key={idx} className="leading-relaxed">{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-white/10 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Manual</span>
            </button>
            <button
              onClick={handleOpenBuilder}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 transition-colors"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Open in Builder</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleLaunchPlay}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play {game.name} Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
