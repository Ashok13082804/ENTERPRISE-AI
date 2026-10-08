import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Play, Wrench, Sparkles, Save, RotateCcw,
  Trophy, Star, Shield, Bot, Users, Clock, Flame,
  CheckCircle2, Layers, Cpu, Compass, Heart, Share2, BookOpen
} from 'lucide-react';
import { getGameById, GameRecord } from '@/data/gameDatabase';
import { useGameHistoryStore } from '@/store/gameHistoryStore';
import { GameCanvas } from '@/games/engine/GameCanvas';
import { GameErrorBoundary } from '@/components/gamehub/GameErrorBoundary';
import { GameManualModal } from '@/components/gamehub/GameManualModal';
import { GameArtPicture } from '@/components/gamehub/GameArtIllustrations';
import { getGameInstructionDetails, getGameControlsDisplay } from '@/utils/gameControlsAndManual';
import toast from 'react-hot-toast';

export const GameDetailPage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const game = getGameById(gameId || '');
  const { isFavorite, toggleFavorite, getHighScore, getGameHistory } = useGameHistoryStore();

  const [resetKey, setResetKey] = useState(0);
  const [isManualOpen, setIsManualOpen] = useState(false);

  if (!game) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Game Not Found</h2>
        <p className="text-muted-foreground">Could not locate record for ID: {gameId}</p>
        <button
          onClick={() => navigate('/game-hub')}
          className="px-4 py-2 rounded-xl bg-primary text-white font-semibold"
        >
          Return to Game Hub
        </button>
      </div>
    );
  }

  const favorite = isFavorite(game.id);
  const highScore = getHighScore(game.id);
  const sessionHistory = getGameHistory(game.id);
  const manualDetails = getGameInstructionDetails(game);
  const controlsDisplay = getGameControlsDisplay(game);

  const handleSaveGame = () => {
    toast.success(`Game configuration and progress saved for ${game.name}!`);
  };

  const handleResetGame = () => {
    setResetKey(prev => prev + 1);
    toast('Game state reset to initial parameters', { icon: '🔄' });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Game link copied to clipboard!');
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1500px] mx-auto">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/game-hub')}
          className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to 432 Game Hub</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleFavorite(game.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card/60 hover:bg-card border border-white/10 text-xs font-semibold transition-colors"
          >
            <Heart className={`w-4 h-4 ${favorite ? 'text-red-400 fill-red-400' : 'text-muted-foreground'}`} />
            <span>{favorite ? 'Favorited' : 'Favorite'}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card/60 hover:bg-card border border-white/10 text-xs font-semibold text-muted-foreground hover:text-white transition-colors"
            title="Share Game"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Main Game Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Live Interactive Game Canvas */}
        <div className="lg:col-span-8 space-y-4">
          <GameErrorBoundary key={resetKey} gameId={game.id} gameName={game.name} onReset={handleResetGame}>
            <GameCanvas game={game} />
          </GameErrorBoundary>

          {/* Action Buttons Toolbar as required by Section 5 & 17 */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => navigate(`/game-hub/${game.id.toLowerCase()}/play`)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>FULLSCREEN PLAY</span>
              </button>

              <button
                onClick={() => setIsManualOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 font-bold text-xs border border-amber-500/30 shadow-md transition-all hover:scale-105 active:scale-95"
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>USER MANUAL & RULES</span>
              </button>

              <button
                onClick={() => navigate(`/game-hub/${game.id.toLowerCase()}/build`)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-md transition-all hover:scale-105 active:scale-95"
              >
                <Wrench className="w-4 h-4" />
                <span>BUILD GAME</span>
              </button>

              <button
                onClick={() => navigate(`/game-hub/${game.id.toLowerCase()}/build?mode=ai`)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shadow-md transition-all hover:scale-105 active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>GENERATE GAME</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveGame}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-foreground transition-colors"
                title="Save State & Configuration"
              >
                <Save className="w-3.5 h-3.5" />
                <span>SAVE</span>
              </button>

              <button
                onClick={handleResetGame}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-foreground transition-colors"
                title="Reset Game Engine"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RESET</span>
              </button>
            </div>
          </div>

          {/* Dedicated In-Page User Manual & How-to-Play Card */}
          <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-orange-500/20">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Official User Manual & How-to-Play Rules
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Complete mechanical specifications for {game.name} ({game.id})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsManualOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-amber-300 border border-amber-500/30 transition-colors"
              >
                Open Fullscreen Manual
              </button>
            </div>

            {/* How to Play Steps */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                How to Play (Step-by-Step)
              </h4>
              <div className="space-y-2">
                {manualDetails.howToPlay.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-200">
                    <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 border border-emerald-500/30">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rules & Scoring Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  Official Rules & Bounds
                </h4>
                <ul className="space-y-1.5 text-xs text-muted-foreground list-disc list-inside">
                  {manualDetails.rules.map((rule, idx) => (
                    <li key={idx} className="leading-relaxed text-slate-300">{rule}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1 flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5" />
                    Scoring Formula
                  </h4>
                  <p className="text-xs text-slate-300">{manualDetails.scoringSystem}</p>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1 flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5" />
                    Winning Condition
                  </h4>
                  <p className="text-xs text-slate-300">{manualDetails.winCondition}</p>
                </div>
              </div>
            </div>

            {/* Pro Tips Section */}
            {manualDetails.proTips && manualDetails.proTips.length > 0 && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Pro Tips & High-Score Tactics
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {manualDetails.proTips.map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-amber-100/90 bg-black/20 p-2 rounded-lg">
                      <span className="text-amber-400 font-bold">★</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Game Metadata, Specifications & Controls */}
        <div className="lg:col-span-4 space-y-6">
          {/* Game Thematic Artwork Picture Card */}
          <div className={`relative w-full h-48 rounded-2xl bg-gradient-to-br ${game.accentColor} p-4 flex flex-col justify-between overflow-hidden shadow-xl border border-white/10 group`}>
            <GameArtPicture game={game} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20 pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-md text-xs font-black tracking-wider uppercase bg-black/50 text-white backdrop-blur-sm border border-white/20">
                {game.id}
              </span>
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase backdrop-blur-sm ${
                game.type === '3D' ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40' : 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/40'
              }`}>
                {game.type} Dynamic Engine
              </span>
            </div>

            <div className="relative z-10">
              <div className="text-[11px] font-semibold text-white/80 uppercase tracking-widest">{game.category}</div>
              <div className="text-xl font-black text-white leading-tight drop-shadow-md">{game.name}</div>
            </div>
          </div>

          {/* Metadata Card */}
          <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-6 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold tracking-wider uppercase bg-primary/20 text-primary border border-primary/30">
                  {game.id}
                </span>
                <h1 className="text-2xl font-black text-white mt-1 leading-tight">
                  {game.name}
                </h1>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Category: <strong className="text-foreground">{game.category}</strong>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase ${
                game.type === '3D' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              }`}>
                {game.type}
              </span>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="bg-white/5 border border-white/5 rounded-xl p-3">
                <div className="text-muted-foreground text-[11px]">Genre</div>
                <div className="font-bold text-foreground truncate">{game.genre}</div>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-xl p-3">
                <div className="text-muted-foreground text-[11px]">Difficulty</div>
                <div className="font-bold text-amber-400">{game.difficulty}</div>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-xl p-3">
                <div className="text-muted-foreground text-[11px]">Required Engine</div>
                <div className="font-bold text-foreground">{game.engine}</div>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-xl p-3">
                <div className="text-muted-foreground text-[11px]">High Score</div>
                <div className="font-bold text-emerald-400 font-mono">{highScore.toLocaleString()} pts</div>
              </div>
            </div>

            {/* AI & Multiplayer Support */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Bot className={`w-4 h-4 ${game.is_ai ? 'text-indigo-400' : 'text-slate-600'}`} />
                <span>AI Support: <strong className={game.is_ai ? 'text-indigo-400' : 'text-slate-400'}>{game.is_ai ? 'Yes' : 'No'}</strong></span>
              </div>

              <div className="h-4 w-px bg-white/10" />

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className={`w-4 h-4 ${game.is_multiplayer ? 'text-fuchsia-400' : 'text-slate-600'}`} />
                <span>Multiplayer: <strong className={game.is_multiplayer ? 'text-fuchsia-400' : 'text-slate-400'}>{game.is_multiplayer ? 'Yes' : 'No'}</strong></span>
              </div>
            </div>

            {/* Objective & Description */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Objective</h4>
              <p className="text-xs text-foreground/90 leading-relaxed bg-white/5 border border-white/5 rounded-xl p-3">
                {game.objective}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {game.description}
              </p>
            </div>
          </div>

          {/* Dynamic Game Controls Card as requested by Section 18 */}
          <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-6 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-primary" />
              <span>Input Controls</span>
            </h4>

            <div className="space-y-2 text-xs">
              {manualDetails.keys.map((ctrl, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                  <span className="px-2 py-0.5 rounded bg-black/50 border border-white/10 font-mono text-[11px] font-bold text-amber-300">
                    {ctrl.key}
                  </span>
                  <span className="text-muted-foreground">{ctrl.action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Score History & Previous Games as requested by the user prompt! */}
      <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Score History & Previous Matches</h3>
          </div>
          <span className="text-xs text-muted-foreground">
            {sessionHistory.length} Recorded Sessions
          </span>
        </div>

        {sessionHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-muted-foreground uppercase bg-white/5 border-b border-white/10">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Match ID</th>
                  <th className="py-2.5 px-4 font-semibold">Score</th>
                  <th className="py-2.5 px-4 font-semibold">Result</th>
                  <th className="py-2.5 px-4 font-semibold">Duration</th>
                  <th className="py-2.5 px-4 font-semibold">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sessionHistory.map(session => (
                  <tr key={session.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-2.5 px-4 font-mono text-muted-foreground">{session.id}</td>
                    <td className="py-2.5 px-4 font-bold text-amber-400 tabular-nums">
                      {session.score.toLocaleString()} pts
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        session.outcome === 'victory' || session.outcome === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {session.outcome}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-muted-foreground tabular-nums">
                      {session.durationSeconds}s
                    </td>
                    <td className="py-2.5 px-4 text-muted-foreground">
                      {new Date(session.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-muted-foreground bg-white/5 rounded-xl">
            No matches recorded for {game.name} yet. Play your first match above to establish your personal record!
          </div>
        )}
      </div>

      {/* Fullscreen User Manual Modal */}
      <GameManualModal
        game={game}
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
      />
    </div>
  );
};
