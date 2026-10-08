
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, History, Compass, Info, RotateCcw, Volume2, VolumeX, BookOpen, CheckCircle2, Shield } from 'lucide-react';
import { getGameById } from '@/data/gameDatabase';
import { useGameHistoryStore } from '@/store/gameHistoryStore';
import { getGameInstructionDetails } from '@/utils/gameControlsAndManual';
import { GameCanvas } from '@/games/engine/GameCanvas';
import { GameErrorBoundary } from '@/components/gamehub/GameErrorBoundary';
import { GameManualModal } from '@/components/gamehub/GameManualModal';

export const GamePlayPage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const game = getGameById(gameId || '');
  const { getHighScore, getGameHistory, lastPlayedSession } = useGameHistoryStore();
  const [showSidebar, setShowSidebar] = useState(false);
  const [showManual, setShowManual] = useState(false);

  if (!game) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Game Not Found</h2>
        <button onClick={() => navigate('/game-hub')} className="px-4 py-2 rounded-xl bg-primary text-white">
          Back to Game Hub
        </button>
      </div>
    );
  }

  const highScore = getHighScore(game.id);
  const sessionHistory = getGameHistory(game.id);
  const manualDetails = getGameInstructionDetails(game);

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-slate-950 overflow-hidden select-none">
      {/* Top Header Bar */}
      <div className="h-12 border-b border-white/10 bg-card/80 backdrop-blur-md px-4 flex items-center justify-between z-20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/game-hub/${game.id.toLowerCase()}`)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-muted-foreground hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Exit Fullscreen</span>
          </button>

          <div className="h-4 w-px bg-white/10" />

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-primary/20 text-primary border border-primary/30">
              {game.id}
            </span>
            <span className="text-sm font-black text-white">{game.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowManual(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition-colors shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>How to Play (Manual)</span>
          </button>

          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${showSidebar ? 'bg-primary text-white border-primary' : 'bg-white/5 border-white/10 text-muted-foreground hover:text-white'
              }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Match History & Controls</span>
          </button>
        </div>
      </div>

      {/* Main Area: Canvas + Optional Sidebar */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 flex items-center justify-center p-2 sm:p-4 bg-slate-950 overflow-hidden">
          <GameErrorBoundary gameId={game.id} gameName={game.name}>
            <GameCanvas
              game={game}
              className="max-h-[calc(100vh-8rem)] w-full h-full max-w-[1400px]"
            />
          </GameErrorBoundary>
        </div>

        {/* Slide-out Sidebar for History & Controls */}
        {showSidebar && (
          <div className="w-80 border-l border-white/10 bg-card/95 backdrop-blur-xl p-5 overflow-y-auto flex-shrink-0 space-y-6 animate-in slide-in-from-right duration-200">
            {/* Quick Controls Cheat Sheet */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-primary" />
                <span>Controls Guide</span>
              </h4>
              <div className="space-y-1.5 text-xs">
                {manualDetails.keys.map((ctrl, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                    <span className="px-1.5 py-0.5 rounded bg-black/60 font-mono text-[10px] text-amber-300 font-bold">
                      {ctrl.key}
                    </span>
                    <span className="text-muted-foreground text-[11px]">{ctrl.action}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Score History */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Previous Matches</span>
              </h4>

              <div className="space-y-2 text-xs">
                {sessionHistory.length > 0 ? (
                  sessionHistory.slice(0, 10).map(sess => (
                    <div key={sess.id} className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-amber-400 tabular-nums">{sess.score.toLocaleString()} pts</span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-bold ${sess.outcome === 'victory' || sess.outcome === 'completed'
                            ? 'text-emerald-400 bg-emerald-500/10'
                            : 'text-red-400 bg-red-500/10'
                          }`}>
                          {sess.outcome}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>Duration: {sess.durationSeconds}s</span>
                        <span>{new Date(sess.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-[11px] text-muted-foreground text-center py-4 bg-white/5 rounded-xl">
                    No sessions yet. Play a match to log history!
                  </div>
                )}
              </div>
            </div>

            {/* Quick How to Play Summary */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>How to Play</span>
                </h4>
                <button
                  onClick={() => setShowManual(true)}
                  className="text-[10px] font-bold text-amber-300 hover:underline"
                >
                  Full Manual →
                </button>
              </div>

              <div className="space-y-2 text-[11px] text-slate-300">
                {manualDetails.howToPlay.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-white/5">
                    <span className="w-4 h-4 rounded bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-tight">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen How-to-Play Modal */}
      <GameManualModal
        game={game}
        isOpen={showManual}
        onClose={() => setShowManual(false)}
      />
    </div>
  );
};
